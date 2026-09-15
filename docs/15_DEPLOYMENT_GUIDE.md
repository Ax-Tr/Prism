# 15 — Deployment Guide: Nexora Prism

## 1. Frontend Build & Netlify / Vercel Deployment
1. Navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Deploy the generated `dist/` directory to Netlify or Vercel.
3. Configure build command: `npm run build`, output directory: `dist`.

## 2. Backend Express API Deployment
1. Navigate to `backend/`:
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```
2. Deploy server process using Docker, Render, AWS ECS, or DigitalOcean App Platform.

## 3. Continuous Integration (CI) Pipeline
- GitHub Actions CI workflow is configured at `.github/workflows/ci.yml`.
- Automatically triggers on `push` and `pull_request` to `main` and `master` branches (as well as manual triggers via `workflow_dispatch`).
- Validates both Frontend and Backend dependencies, Prisma generation, and TypeScript builds.
