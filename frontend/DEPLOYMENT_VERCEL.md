# Deploying the frontend to Vercel

1) Environment
- In your Vercel project settings, set the following Environment Variable:
  - REACT_APP_API_URL = https://your-backend-service.onrender.com/api

2) Build & Output
- Vercel will detect this is a React app. Ensure build command is `npm run build` and output is the default `build/`.

3) Preview & Production
- Use Vercel's preview deployments for PRs and merge to `main` to trigger production deploys.

4) Local testing
- Locally, create `.env.production` (already added) or use `REACT_APP_API_URL` in your shell when running `npm run build`.

5) CORS
- Ensure your backend's `CORS_ORIGINS` includes the Vercel domain assigned to your frontend.

6) Optional
- Use Vercel Environment Variables for preview and production with specific values for each environment.
