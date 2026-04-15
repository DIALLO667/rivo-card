# Deploying the backend to Render

This document describes steps and recommendations to deploy the FastAPI backend to Render.

1) Create a new Web Service on Render
- Connect your GitHub repository and select the backend folder as the service root (or the repo root and specify the start command).

2) Environment
- Add the following environment variables to Render's dashboard (use the values from your production secrets):
  - MONGO_URL (MongoDB Atlas connection string)
  - DB_NAME
  - CORS_ORIGINS (e.g., https://your-frontend-domain.com)
  - JWT_SECRET
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET

3) Start Command
- Use the following start command in Render's service configuration:

  backend/.venv/bin/uvicorn server:app --host 0.0.0.0 --port $PORT --app-dir backend

Render will provide a $PORT variable automatically.

4) File storage recommendation
- Do NOT use local filesystem for user uploads in production. Use Cloudinary (already wired in code) for images, vcards and PDFs. Ensure CLOUDINARY_* env vars are set in Render.

5) Health check
- Configure Render to check `/health` for a simple alive check.

6) Scaling & static files
- StaticFiles are still mounted for local dev; in production you should not rely on them for user data. All user assets will be stored on Cloudinary and urls stored in MongoDB.

7) Security
- Ensure DB credentials are stored as protected secrets in Render.
- Restrict CORS_ORIGINS to your frontend production domain(s).

8) Logs
- Render aggregates logs for you; check request/exception logs there when debugging.

That's it — after Render builds and the service is live, update your frontend to point at the Render URL and deploy the frontend to Vercel.
