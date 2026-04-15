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
        "password": hash_password(data.password), "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
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
    return user

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
    photo: UploadFile = File(...), cover: Optional[UploadFile] = File(None)
):
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    # validate card_type and template_id before performing uploads
    if card_type not in ("profile", "cv"):
        raise HTTPException(status_code=400, detail="card_type must be 'profile' or 'cv'")
    if template_id not in ("template1", "template2"):
        raise HTTPException(status_code=400, detail="template_id must be 'template1' or 'template2'")
    # For profile cards, require job and phone and cover
    if card_type == "profile":
        if not job:
            raise HTTPException(status_code=400, detail="job is required for profile cards")
        if not phone:
            raise HTTPException(status_code=400, detail="phone is required for profile cards")
        if cover is None:
            raise HTTPException(status_code=400, detail="cover is required for profile cards")
    try:
        # enforce upload size limits before sending to cloudinary
        photo_buf = read_upload_limited(photo, MAX_IMAGE_SIZE)
        photo_res = cloudinary.uploader.upload(photo_buf, folder="jpm_photos")
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
            "photo_url": photo_res['secure_url'], "cover_url": (cover_res['secure_url'] if cover_res else None),
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
    photo: Optional[UploadFile] = File(None), cover: Optional[UploadFile] = File(None)
):
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    # validate card_type and template_id for update
    if card_type not in ("profile", "cv"):
        raise HTTPException(status_code=400, detail="card_type must be 'profile' or 'cv'")
    if template_id not in ("template1", "template2"):
        raise HTTPException(status_code=400, detail="template_id must be 'template1' or 'template2'")
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
        "card_type": card_type,
        "template_id": template_id,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if photo:
        photo_buf = read_upload_limited(photo, MAX_IMAGE_SIZE)
        res = cloudinary.uploader.upload(photo_buf, folder="jpm_photos")
        update_data["photo_url"] = res['secure_url']
    if cover:
        cover_buf = read_upload_limited(cover, MAX_IMAGE_SIZE)
        res = cloudinary.uploader.upload(cover_buf, folder="jpm_covers")
        update_data["cover_url"] = res['secure_url']

    await db.profiles.update_one({"profile_id": profile_id, "user_id": user.user_id}, {"$set": update_data})
    return {"status": "success"}

@api_router.get("/profiles")
async def get_profiles(request: Request):
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    return await db.profiles.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)

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