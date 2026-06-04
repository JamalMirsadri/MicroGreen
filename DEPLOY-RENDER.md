# Deploy to Render.com

**Project type:** React (Vite) + Express **full-stack** — one **Web Service** (not Static Site).

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite → `dist/` |
| Backend | Express in `server/` |
| Production | Express serves `dist/` + `/api/*` |

---

## Render dashboard settings

| Setting | Value |
|---------|--------|
| **Service type** | Web Service |
| **Runtime** | Node |
| **Root directory** | `.` (repo root) |
| **Build Command** | `npm run render-build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/health` |

### Environment variables

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generate (random) |
| `VITE_API_URL` | *(empty — same origin)* |
| `VITE_BASE44_APP_ID` | `local-grow-verdant` |

Do **not** set `PORT` — Render injects it automatically.

---

## Required `package.json` scripts

```json
"scripts": {
  "build": "vite build",
  "start": "node server/index.js",
  "render-build": "npm install --include=dev && npm run build"
}
```

---

## Verify after deploy

- `https://YOUR-APP.onrender.com/health` → `{"ok":true}`
- `https://YOUR-APP.onrender.com/` → React app
- `https://YOUR-APP.onrender.com/api/entities/product` → JSON products

---

## Push to GitHub first

Render deploys from Git. If you see `Missing script: "start"`, the repo on GitHub is missing the latest `package.json`. Push:

```bash
git add package.json render.yaml server/index.js DEPLOY-RENDER.md
git commit -m "fix: add start script and Render production deploy"
git push origin main
```

Then **Manual Deploy** on Render (or wait for auto-deploy).
