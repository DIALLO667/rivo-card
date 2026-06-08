from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Request, Response, Form
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import certifi
from pathlib import Path
from pydantic import BaseModel, ConfigDict, EmailStr
from pydantic import ValidationError as PydanticValidationError
from fastapi.exceptions import RequestValidationError
from typing import Optional
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import secrets
import cloudinary
import cloudinary.uploader
import io
import requests
from PIL import Image
import logging

# Max image size allowed for conversion (bytes)
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB

# --- CONFIGURATION ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

cloudinary.config( 
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME'), 
    api_key = os.environ.get('CLOUDINARY_API_KEY'), 
    api_secret = os.environ.get('CLOUDINARY_API_SECRET'),
    secure = True
)

mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME')

client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
db = client[db_name]

app = FastAPI()

# CORS middleware will be configured later using the CORS_ORIGINS environment variable.
# We avoid adding a permissive middleware here to prevent accidental wide-open CORS in production.


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    # Log the validation errors so the developer can see which fields failed
    try:
        print('Global RequestValidationError:', exc.errors())
    except Exception:
        logger.exception('Failed to print RequestValidationError details')
    # Try to read and log the raw request body to diagnose JSON decode issues
    try:
        body_bytes = await request.body()
        if body_bytes:
            try:
                print('Raw request body (first 2k bytes):', body_bytes[:2048])
            except Exception:
                print('Raw request body (bytes) available but failed to print as string')
        else:
            print('Raw request body: <empty>')
    except Exception as e:
        logger.exception('Failed to read raw request body: %s', e)
    logger.error('Request validation failed: %s', exc.errors())
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

# logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.server")


def read_upload_limited(upload: UploadFile, max_size: int) -> io.BytesIO:
    """Read an UploadFile into a BytesIO while enforcing a maximum size.
    Raises HTTPException(413) if the file exceeds max_size.
    """
    try:
        upload.file.seek(0)
    except Exception:
        pass
    buf = io.BytesIO()
    total = 0
    while True:
        chunk = upload.file.read(8192)
        if not chunk:
            break
        total += len(chunk)
        if total > max_size:
            logger.warning(f"Uploaded file too large: {getattr(upload, 'filename', 'unknown')} ({total} bytes)")
            raise HTTPException(status_code=413, detail="Uploaded file too large")
        buf.write(chunk)
    buf.seek(0)
    return buf

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Server is active", "timestamp": datetime.now(timezone.utc).isoformat()}

api_router = APIRouter(prefix="/api")


@api_router.get("/health")
async def api_health():
    # Lightweight health check for load balancers and uptime probes
    return {"status": "ok", "message": "Server is active"}

UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# --- MODELS ---
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    created_at: datetime

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- UTILS ---
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return hash_password(plain) == hashed

def generate_unique_link(name: str) -> str:
    clean_name = "".join(c.lower() if c.isalnum() else "-" for c in name)
    return f"{clean_name}-{secrets.token_hex(3)}"


def is_super_admin(user_doc: dict) -> bool:
    """Return True if the user_doc corresponds to the global super-admin or has admin role."""
    if not user_doc:
        return False
    email = user_doc.get('email', '').lower()
    role = user_doc.get('role')
    if role == 'admin':
        return True
    if email == 'amadou@rivostudio.com':
        return True
    return False

async def get_user_from_token(request: Request) -> Optional[User]:
    auth_header = request.headers.get("Authorization")
    session_token = None
    if auth_header and auth_header.startswith("Bearer "):
        session_token = auth_header.split(" ")[1]
    if not session_token:
        session_token = request.cookies.get("session_token")
    if not session_token: return None
    session_doc = await db.user_sessions.find_one({"session_token": session_token})
    if not session_doc: return None
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if user_doc:
        if isinstance(user_doc["created_at"], str):
            user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
        return User(**user_doc)
    return None

# --- AUTH ROUTES ---
@api_router.post("/auth/register")
async def register(data: RegisterRequest):
    existing = await db.users.find_one({"email": data.email})
    if existing: raise HTTPException(status_code=400, detail="Email déjà utilisé")
    user_doc = {
        "user_id": f"user_{uuid.uuid4().hex[:12]}", "email": data.email, "name": data.name,
        "password": hash_password(data.password), "created_at": datetime.now(timezone.utc).isoformat(),
        "role": "owner",
        "parent_id": None
    }
    await db.users.insert_one(user_doc)
    return {"status": "success"}


@api_router.post("/users")
async def create_subuser(request: Request, email: EmailStr = Form(...), password: str = Form(...), name: str = Form(...)):
    """Create a subaccount (filiale) under the authenticated owner.
    Only users with role 'owner' may create subaccounts. The created subuser will have parent_id set to the owner's user_id and role 'subaccount'.
    """
    owner = await get_user_from_token(request)
    if not owner: raise HTTPException(status_code=401)
    # ensure owner role or super-admin
    owner_doc = await db.users.find_one({"user_id": owner.user_id})
    if not owner_doc or (owner_doc.get("role") != "owner" and not is_super_admin(owner_doc)):
        raise HTTPException(status_code=403, detail="Only owners may create subaccounts")
    # ensure email unique
    existing = await db.users.find_one({"email": email})
    if existing: raise HTTPException(status_code=400, detail="Email déjà utilisé")
    sub_doc = {
        "user_id": f"user_{uuid.uuid4().hex[:12]}",
        "email": email,
        "name": name,
        "password": hash_password(password),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "role": "subaccount",
        "is_active": True,
        "parent_id": owner.user_id
    }
    await db.users.insert_one(sub_doc)
    return {"status": "success", "user_id": sub_doc["user_id"]}


@api_router.get("/users")
async def list_users(request: Request, scope: Optional[str] = None):
    """List subaccounts for the authenticated owner.
    If scope == 'all' and the caller is an owner, return owner + subaccounts for overview.
    Otherwise return only the caller's direct subaccounts (if owner) or [] for subaccounts.
    """
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    user_doc = await db.users.find_one({"user_id": user.user_id})
    role = user_doc.get("role") if user_doc else None
    if role == "owner" or is_super_admin(user_doc):
        # owner's subaccounts
        subs = await db.users.find({"parent_id": user.user_id}, {"_id": 0, "password": 0}).to_list(length=100)
        if scope == 'all':
            # include owner info as well
            me = await db.users.find_one({"user_id": user.user_id}, {"_id": 0, "password": 0})
            return {"owner": me, "subaccounts": subs}
        return {"subaccounts": subs}
    else:
        # subaccounts cannot list other users
        return {"subaccounts": []}


@api_router.post("/users/assign")
async def assign_subaccount(request: Request, target_email: EmailStr = Form(...), parent_email: EmailStr = Form(...)):
    """Assign an existing user (target_email) as a subaccount of parent_email. Only owners or super-admins may perform this."""
    caller = await get_user_from_token(request)
    if not caller: raise HTTPException(status_code=401)
    caller_doc = await db.users.find_one({"user_id": caller.user_id})
    if not caller_doc or (caller_doc.get("role") != "owner" and not is_super_admin(caller_doc)):
        raise HTTPException(status_code=403)
    parent = await db.users.find_one({"email": parent_email})
    if not parent: raise HTTPException(status_code=404, detail="Parent not found")
    target = await db.users.find_one({"email": target_email})
    if not target: raise HTTPException(status_code=404, detail="Target user not found")
    # update target to be a subaccount of parent
    await db.users.update_one({"user_id": target["user_id"]}, {"$set": {"parent_id": parent["user_id"], "role": "subaccount", "is_active": True}})
    return {"status": "success"}


@api_router.patch("/users/{user_id}/toggle_active")
async def toggle_user_active(user_id: str, request: Request):
    """Toggle activation for a user (owner or super-admin only). Cascades to profiles by setting is_archived accordingly."""
    caller = await get_user_from_token(request)
    if not caller: raise HTTPException(status_code=401)
    caller_doc = await db.users.find_one({"user_id": caller.user_id})
    if not caller_doc or (caller_doc.get("role") != "owner" and not is_super_admin(caller_doc)):
        raise HTTPException(status_code=403)
    target = await db.users.find_one({"user_id": user_id})
    if not target: raise HTTPException(status_code=404)
    new_state = not target.get("is_active", True)
    await db.users.update_one({"user_id": user_id}, {"$set": {"is_active": new_state}})
    # cascade: mark all profiles for that user as archived when deactivated, and un-archive when activated
    await db.profiles.update_many({"user_id": user_id}, {"$set": {"is_archived": not new_state}})
    return {"status": "success", "is_active": new_state}


@api_router.put("/users/{user_id}")
async def update_user(user_id: str, request: Request, name: Optional[str] = Form(None), email: Optional[EmailStr] = Form(None)):
    """Update basic user fields (name, email). Only owner or super-admin may update subaccounts."""
    caller = await get_user_from_token(request)
    if not caller: raise HTTPException(status_code=401)
    caller_doc = await db.users.find_one({"user_id": caller.user_id})
    if not caller_doc or (caller_doc.get("role") != "owner" and not is_super_admin(caller_doc)):
        raise HTTPException(status_code=403)
    target = await db.users.find_one({"user_id": user_id})
    if not target: raise HTTPException(status_code=404)
    update = {}
    if name is not None: update["name"] = name
    if email is not None: update["email"] = email
    if update:
        await db.users.update_one({"user_id": user_id}, {"$set": update})
    return {"status": "success"}

@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    user_doc = await db.users.find_one({"email": data.email})
    if not user_doc or not verify_password(data.password, user_doc.get("password", "")):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    token = secrets.token_urlsafe(32)
    await db.user_sessions.insert_one({
        "user_id": user_doc["user_id"], "session_token": token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    })
    response.set_cookie(key="session_token", value=token, httponly=True, secure=True, samesite="none")
    return {"token": token, "user": {"name": user_doc["name"]}}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    # Return a sanitized user document from the database so callers can see role/parent_id without exposing password
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0, "password": 0})
    if not user_doc:
        raise HTTPException(status_code=401)
    return user_doc

# --- PROFILE ROUTES ---
@api_router.post("/profiles")
async def create_profile(
    request: Request,
    name: str = Form(...), job: Optional[str] = Form(None), phone: Optional[str] = Form(None),
    company: Optional[str] = Form(None), email: Optional[str] = Form(None),
    location: Optional[str] = Form(None), website: Optional[str] = Form(None),
    instagram: Optional[str] = Form(None), linkedin: Optional[str] = Form(None),
    facebook: Optional[str] = Form(None), tiktok: Optional[str] = Form(None),
    snapchat: Optional[str] = Form(None), telegram: Optional[str] = Form(None), # AJOUTÉ
    youtube: Optional[str] = Form(None), twitter: Optional[str] = Form(None), # AJOUTÉ
    design_type: str = Form("classic"),
    card_type: str = Form("profile"),
    template_id: str = Form("template1"),
    bg_color: Optional[str] = Form(None),
    button_color: Optional[str] = Form(None),
    icon_color: Optional[str] = Form(None),
    name_color: Optional[str] = Form(None),
    job_color: Optional[str] = Form(None),
    font_choice: Optional[str] = Form(None),
    icon_style: Optional[str] = Form(None),
    photo: UploadFile = File(...), cover: Optional[UploadFile] = File(None)
):
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    # validate card_type and template_id before performing uploads
    if card_type not in ("profile", "cv"):
        raise HTTPException(status_code=400, detail="card_type must be 'profile' or 'cv'")
    # accept the new customizable template
    if template_id not in ("template1", "template2", "template_customizable"):
        raise HTTPException(status_code=400, detail="template_id must be 'template1', 'template2' or 'template_customizable'")
    # For profile cards, require job and phone (cover is optional)
    if card_type == "profile":
        if not job:
            raise HTTPException(status_code=400, detail="job is required for profile cards")
        if not phone:
            raise HTTPException(status_code=400, detail="phone is required for profile cards")
    try:
        # enforce upload size limits before sending to cloudinary
        photo_buf = read_upload_limited(photo, MAX_IMAGE_SIZE)
        # Upload image to Cloudinary with immediate transformation:
        # - Resize to 400x400
        # - Use smart crop (thumb) with face gravity so the face is centered
        # - Force output format to WebP with transparent background where supported
        # Attempt upload centered on detected face, with slight zoom-out to include hair/neck
        photo_res = cloudinary.uploader.upload(
            photo_buf,
            folder="jpm_photos",
            resource_type='image',
            public_id=None,
            transformation=[
                {"width": 400, "height": 400, "crop": "fill", "gravity": "face", "zoom": 0.75, "y": 20},
                {"format": "webp", "background": "transparent"}
            ]
        )
        # If no face detected, build a fallback URL using gravity:auto on the uploaded public_id
        photo_public_id = photo_res.get('public_id')
        if not photo_res.get('faces') and photo_public_id:
            try:
                alt_url = cloudinary.CloudinaryImage(photo_public_id).build_url(resource_type='image', transformation=[{"width":400, "height":400, "crop":"fill", "gravity":"auto"}, {"format":"webp", "background":"transparent"}], secure=True)
                photo_url_final = alt_url
            except Exception:
                photo_url_final = photo_res.get('secure_url')
        else:
            photo_url_final = photo_res.get('secure_url')
        cover_res = None
        if cover:
            cover_buf = read_upload_limited(cover, MAX_IMAGE_SIZE)
            cover_res = cloudinary.uploader.upload(cover_buf, folder="jpm_covers")
        now = datetime.now(timezone.utc).isoformat()
        profile_doc = {
            "profile_id": f"profile_{uuid.uuid4().hex[:12]}", "user_id": user.user_id,
            "name": name, "job": job, "company": company, "phone": phone, "email": email,
            "location": location, "website": website, "instagram": instagram,
            "linkedin": linkedin, "facebook": facebook, "tiktok": tiktok,
            "snapchat": snapchat, "telegram": telegram, "youtube": youtube, "twitter": twitter,"design_type": design_type, # AJOUTÉ
            "card_type": card_type, "template_id": template_id,
            "bg_color": bg_color,
            "name_color": name_color,
            "job_color": job_color,
            "button_color": button_color,
            "icon_color": icon_color,
            "font_choice": font_choice,
            "icon_style": icon_style,
            "photo_url": photo_url_final, "cover_url": (cover_res['secure_url'] if cover_res else None),
            "unique_link": generate_unique_link(name), "is_archived": False,
            "created_at": now, "updated_at": now
        }
        await db.profiles.insert_one(profile_doc)
        return {"status": "success"}
    except RequestValidationError as e:
        # Print validation errors to logs to help debug missing/invalid fields
        try:
            print('RequestValidationError:', e.errors())
        except Exception:
            logger.error('RequestValidationError but failed to print errors')
        raise HTTPException(status_code=422, detail="Validation error")
    except PydanticValidationError as e:
        try:
            print('Pydantic ValidationError:', e.errors())
        except Exception:
            logger.error('Pydantic ValidationError but failed to print errors')
        raise HTTPException(status_code=422, detail="Validation error")
    except Exception as e:
        logger.exception('Unexpected error creating profile')
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/profiles/{profile_id}")
async def update_profile(
    profile_id: str,
    request: Request,
    name: str = Form(...), job: Optional[str] = Form(None), phone: Optional[str] = Form(None),
    company: Optional[str] = Form(None), email: Optional[str] = Form(None),
    location: Optional[str] = Form(None), website: Optional[str] = Form(None),
    instagram: Optional[str] = Form(None), linkedin: Optional[str] = Form(None),
    facebook: Optional[str] = Form(None), tiktok: Optional[str] = Form(None),
    snapchat: Optional[str] = Form(None), telegram: Optional[str] = Form(None), # AJOUTÉ
    youtube: Optional[str] = Form(None), twitter: Optional[str] = Form(None), # AJOUTÉ
    design_type: str = Form("classic"),
    card_type: str = Form("profile"),
    template_id: str = Form("template1"),
    bg_color: Optional[str] = Form(None),
    name_color: Optional[str] = Form(None),
    job_color: Optional[str] = Form(None),
    button_color: Optional[str] = Form(None),
    icon_color: Optional[str] = Form(None),
    font_choice: Optional[str] = Form(None),
    icon_style: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None), cover: Optional[UploadFile] = File(None)
):
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    # validate card_type and template_id for update
    if card_type not in ("profile", "cv"):
        raise HTTPException(status_code=400, detail="card_type must be 'profile' or 'cv'")
    # accept the new customizable template
    if template_id not in ("template1", "template2", "template_customizable"):
        raise HTTPException(status_code=400, detail="template_id must be 'template1', 'template2' or 'template_customizable'")
    if card_type == 'profile':
        if not job:
            raise HTTPException(status_code=400, detail="job is required for profile cards")
        if not phone:
            raise HTTPException(status_code=400, detail="phone is required for profile cards")

    update_data = {
        "name": name, "job": job, "phone": phone, "company": company, "email": email,
        "location": location, "website": website, "instagram": instagram,
        "linkedin": linkedin, "facebook": facebook, "tiktok": tiktok,
        "snapchat": snapchat, "telegram": telegram, "youtube": youtube, "twitter": twitter,
        "design_type": design_type, # AJOUTÉ
        "bg_color": bg_color,
        "name_color": name_color,
        "job_color": job_color,
        "button_color": button_color,
        "icon_color": icon_color,
        "font_choice": font_choice,
        "icon_style": icon_style,
        "card_type": card_type,
        "template_id": template_id,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if photo:
        photo_buf = read_upload_limited(photo, MAX_IMAGE_SIZE)
        # Attempt upload centered on detected face with slight zoom-out
        res = cloudinary.uploader.upload(
            photo_buf,
            folder="jpm_photos",
            resource_type='image',
            transformation=[
                {"width": 400, "height": 400, "crop": "fill", "gravity": "face", "zoom": 0.75, "y": 20},
                {"format": "webp", "background": "transparent"}
            ]
        )
        # Fallback to gravity:auto if no faces detected
        public_id = res.get('public_id')
        if not res.get('faces') and public_id:
            try:
                alt = cloudinary.CloudinaryImage(public_id).build_url(resource_type='image', transformation=[{"width":400, "height":400, "crop":"fill", "gravity":"auto"}, {"format":"webp", "background":"transparent"}], secure=True)
                update_data["photo_url"] = alt
            except Exception:
                update_data["photo_url"] = res.get('secure_url')
        else:
            update_data["photo_url"] = res.get('secure_url')
    if cover:
        cover_buf = read_upload_limited(cover, MAX_IMAGE_SIZE)
        res = cloudinary.uploader.upload(cover_buf, folder="jpm_covers")
        update_data["cover_url"] = res['secure_url']

    await db.profiles.update_one({"profile_id": profile_id, "user_id": user.user_id}, {"$set": update_data})
    return {"status": "success"}

@api_router.get("/profiles")
async def get_profiles(request: Request, scope: Optional[str] = None):
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    # If owner requests scope=all, return owner's profiles plus all subaccounts' profiles
    user_doc = await db.users.find_one({"user_id": user.user_id})
    role = user_doc.get("role") if user_doc else None
    if scope == 'all' and (role == 'owner' or is_super_admin(user_doc)):
        subs = await db.users.find({"parent_id": user.user_id}, {"user_id": 1}).to_list(length=100)
        sub_ids = [s["user_id"] for s in subs]
        q = {"user_id": {"$in": [user.user_id] + sub_ids}}
        cursor = db.profiles.find(q, {"_id": 0}).sort("created_at", -1)
        return await cursor.to_list(length=1000)
    # Default: return profiles for the authenticated user only
    cursor = db.profiles.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(length=100)

@api_router.get("/profiles/{profile_id}")
async def get_single_profile(profile_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    p = await db.profiles.find_one({"profile_id": profile_id}, {"_id": 0})
    if not p: raise HTTPException(status_code=404)
    return p

@api_router.patch("/profiles/{profile_id}/archive")
async def archive_profile(profile_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    profile = await db.profiles.find_one({"profile_id": profile_id})
    if not profile: raise HTTPException(status_code=404)
    new_status = not profile.get("is_archived", False)
    await db.profiles.update_one({"profile_id": profile_id}, {"$set": {"is_archived": new_status}})
    return {"status": "success", "is_archived": new_status}

@api_router.get("/profiles/public/{unique_link}")
async def get_public_profile(unique_link: str):
    p = await db.profiles.find_one({"unique_link": unique_link}, {"_id": 0})
    if not p: raise HTTPException(status_code=404)
    return p


@api_router.get("/profiles/public/{unique_link}/cv")
async def download_public_cv(unique_link: str):
    # Public endpoint to generate a PDF from the profile photo for card_type 'cv'
    p = await db.profiles.find_one({"unique_link": unique_link}, {"_id": 0})
    if not p: raise HTTPException(status_code=404)
    if p.get("card_type") != "cv":
        raise HTTPException(status_code=400, detail="Profile is not a CV card")
    photo_url = p.get("photo_url")
    if not photo_url:
        raise HTTPException(status_code=404, detail="No photo available for this profile")
    # download image (with size limit)
    try:
        resp = requests.get(photo_url, stream=True, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        logger.error(f"Failed to retrieve image from {photo_url}: {e}")
        raise HTTPException(status_code=502, detail=f"Failed to retrieve image: {e}")
    # Check Content-Length header first
    content_length = resp.headers.get("Content-Length")
    if content_length is not None:
        try:
            if int(content_length) > MAX_IMAGE_SIZE:
                raise HTTPException(status_code=413, detail="Image too large to convert")
        except ValueError:
            # ignore invalid header and fall back to streaming check
            pass
    # read into PIL and convert to PDF in-memory while enforcing MAX_IMAGE_SIZE
    try:
        buf = io.BytesIO()
        total = 0
        for chunk in resp.iter_content(chunk_size=8192):
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_IMAGE_SIZE:
                logger.warning(f"Image too large to convert for profile {unique_link}: {total} bytes")
                raise HTTPException(status_code=413, detail="Image too large to convert")
            buf.write(chunk)
        buf.seek(0)
        img_bytes = buf
        with Image.open(img_bytes) as im:
            if im.mode != "RGB":
                im = im.convert("RGB")
            out_io = io.BytesIO()
            im.save(out_io, format="PDF")
            out_io.seek(0)
            filename = f"{p.get('name','profile')}_cv.pdf"
            return StreamingResponse(out_io, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=\"{filename}\""})
    except Exception as e:
        logger.error(f"Failed to convert image to PDF for profile {unique_link}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to convert image to PDF: {e}")

@api_router.get("/profiles/{profile_id}/vcard")
async def generate_vcard(profile_id: str):
    p = await db.profiles.find_one({"profile_id": profile_id})
    if not p: raise HTTPException(status_code=404)
    # Generate vCard content in-memory and upload it to Cloudinary as a raw file
    vcard = f"BEGIN:VCARD\nVERSION:3.0\nFN:{p['name']}\nTEL:{p.get('phone','')}\nEMAIL:{p.get('email','')}\nEND:VCARD"
    try:
        out_io = io.BytesIO()
        out_io.write(vcard.encode('utf-8'))
        out_io.seek(0)
        # Upload vcard as a raw file to Cloudinary. This avoids relying on local filesystem in production.
        res = cloudinary.uploader.upload(out_io, resource_type='raw', folder='jpm_vcards', public_id=profile_id)
        secure_url = res.get('secure_url')
        if secure_url:
            # Return the Cloudinary URL so callers can download the vCard
            return JSONResponse({"url": secure_url})
        else:
            raise HTTPException(status_code=502, detail="Failed to upload vCard to storage")
    except Exception as e:
        logger.exception('Failed to generate/upload vCard')
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

# Ensure uploads directory exists (Render ephemeral file systems may not persist uploads — prefer Cloudinary)
try:
    os.makedirs(UPLOADS_DIR, exist_ok=True)
except Exception:
    logger.warning('Could not create uploads directory; continuing without local uploads')

# Configure CORS from CORS_ORIGINS env var (comma-separated). Default to localhost dev domain.
cors_env = os.environ.get('CORS_ORIGINS', 'http://localhost:3000')
allowed_origins = [origin.strip() for origin in cors_env.split(',') if origin.strip()]
if not allowed_origins:
    allowed_origins = ['http://localhost:3000']

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/api/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

if __name__ == "__main__":
    # Use PORT from environment (Render sets $PORT). Default to 5100 for local dev.
    import uvicorn
    port = int(os.environ.get('PORT', 5100))
    uvicorn.run(app, host="0.0.0.0", port=port)