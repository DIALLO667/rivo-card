from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Request, Response, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import certifi
from pathlib import Path
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import secrets
import cloudinary
import cloudinary.uploader

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
    name: str = Form(...), job: str = Form(...), phone: str = Form(...),
    company: Optional[str] = Form(None), email: Optional[str] = Form(None),
    location: Optional[str] = Form(None), website: Optional[str] = Form(None),
    instagram: Optional[str] = Form(None), linkedin: Optional[str] = Form(None),
    facebook: Optional[str] = Form(None), tiktok: Optional[str] = Form(None),
    snapchat: Optional[str] = Form(None), telegram: Optional[str] = Form(None), # AJOUTÉ
    youtube: Optional[str] = Form(None), twitter: Optional[str] = Form(None), # AJOUTÉ
    design_type: str = Form("classic"),
    photo: UploadFile = File(...), cover: UploadFile = File(...)
):
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    try:
        photo_res = cloudinary.uploader.upload(photo.file, folder="jpm_photos")
        cover_res = cloudinary.uploader.upload(cover.file, folder="jpm_covers")
        now = datetime.now(timezone.utc).isoformat()
        profile_doc = {
            "profile_id": f"profile_{uuid.uuid4().hex[:12]}", "user_id": user.user_id,
            "name": name, "job": job, "company": company, "phone": phone, "email": email,
            "location": location, "website": website, "instagram": instagram,
            "linkedin": linkedin, "facebook": facebook, "tiktok": tiktok,
            "snapchat": snapchat, "telegram": telegram, "design_type": design_type, # AJOUTÉ
            "photo_url": photo_res['secure_url'], "cover_url": cover_res['secure_url'],
            "unique_link": generate_unique_link(name), "is_archived": False,
            "created_at": now, "updated_at": now
        }
        await db.profiles.insert_one(profile_doc)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/profiles/{profile_id}")
async def update_profile(
    profile_id: str,
    request: Request,
    name: str = Form(...), job: str = Form(...), phone: str = Form(...),
    company: Optional[str] = Form(None), email: Optional[str] = Form(None),
    location: Optional[str] = Form(None), website: Optional[str] = Form(None),
    instagram: Optional[str] = Form(None), linkedin: Optional[str] = Form(None),
    facebook: Optional[str] = Form(None), tiktok: Optional[str] = Form(None),
    snapchat: Optional[str] = Form(None), telegram: Optional[str] = Form(None), # AJOUTÉ
    youtube: Optional[str] = Form(None), twitter: Optional[str] = Form(None), # AJOUTÉ
    design_type: str = Form("classic"),
    photo: Optional[UploadFile] = File(None), cover: Optional[UploadFile] = File(None)
):
    user = await get_user_from_token(request)
    if not user: raise HTTPException(status_code=401)
    
    update_data = {
        "name": name, "job": job, "phone": phone, "company": company, "email": email,
        "location": location, "website": website, "instagram": instagram,
        "linkedin": linkedin, "facebook": facebook, "tiktok": tiktok,
        "snapchat": snapchat, "telegram": telegram, "design_type": design_type, # AJOUTÉ
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if photo:
        res = cloudinary.uploader.upload(photo.file, folder="jpm_photos")
        update_data["photo_url"] = res['secure_url']
    if cover:
        res = cloudinary.uploader.upload(cover.file, folder="jpm_covers")
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

@api_router.get("/profiles/{profile_id}/vcard")
async def generate_vcard(profile_id: str):
    p = await db.profiles.find_one({"profile_id": profile_id})
    if not p: raise HTTPException(status_code=404)
    vcard = f"BEGIN:VCARD\nVERSION:3.0\nFN:{p['name']}\nTEL:{p['phone']}\nEMAIL:{p.get('email','')}\nEND:VCARD"
    path = UPLOADS_DIR / f"{profile_id}.vcf"
    with open(path, "w") as f: f.write(vcard)
    return FileResponse(path, media_type="text/vcard", filename=f"{p['name']}.vcf")

app.include_router(api_router)
app.mount("/api/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(CORSMiddleware, allow_origins=allowed_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)