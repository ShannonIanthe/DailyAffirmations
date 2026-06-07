# Daily Affirm — Deployment Guide

## Architecture

```
┌─────────────────────┐       ┌──────────────────────┐
│   iOS App           │       │   Express API Server  │
│   (Capacitor)       │ ────→ │   (Node.js + SQLite)  │
│                     │  API  │                       │
│  Built web app      │       │  /api/auth            │
│  in WKWebView       │       │  /api/affirmations    │
│                     │       │  /api/user-affirmations│
└─────────────────────┘       └──────────────────────┘
```

The iOS app calls the backend API over HTTPS. The backend uses SQLite (file-based), so you need persistent storage.

---

## 1. Deploy the Backend API

### Option A: Railway (Easiest — Free tier available)

1. Push the code to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo → set **Root Directory** to `server`
4. Railway auto-detects Node.js and uses the `railway.json` config
5. Set environment variable: `NODE_ENV=production`
6. Deploy — Railway gives you a URL like `https://daily-affirm-api.up.railway.app`
7. ✅ Done

### Option B: Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect repo
3. **Root Directory**: `server`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`
6. **Plan**: Free tier works (may cold-start in ~30s)
7. Add environment variable: `NODE_ENV=production`
8. Deploy

### Option C: Docker (Any cloud)

```bash
cd server
docker build -t daily-affirm-api .
docker run -d -p 3001:3001 -v ./data:/data daily-affirm-api
```

Supports: Fly.io, DigitalOcean App Platform, AWS ECS, Google Cloud Run

---

## 2. Build the iOS App for Production

Once the API is deployed, build the iOS app pointing to your live API:

```bash
cd client

# Build the web app with the production API URL
VITE_API_URL=https://your-api-url.up.railway.app npm run build

# Sync to iOS
npx cap sync

# Open in Xcode
npx cap open ios
```

In Xcode:
1. Select your **Team** under Signing & Capabilities
2. Set **Bundle Identifier** (e.g. `com.yourname.dailyaffirm`)
3. Product → **Archive**
4. Distribute → **App Store Connect**

---

## 3. Update capacitor.config.ts (if using server.url approach)

In `client/capacitor.config.ts`, you can also set `server.url` to your API domain.
This makes the entire webview load from the API server (useful if you want OTA updates):

```ts
server: {
  url: 'https://your-api-url.up.railway.app',
}
```

Then rebuild the app.

---

## 4. Environment Variables Reference

### Server (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |
| `NODE_ENV` | `production` | Environment mode |
| `DB_PATH` | `./data/daily-affirm.db` | SQLite database file path |
| `CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated) |

### Client (build-time)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | *(empty)* | Production API base URL (e.g. `https://api.example.com`) |

Set this when building the web app for production iOS:
```bash
VITE_API_URL=https://your-api-url.up.railway.app npm run build
```

---

## Quick Checklist

- [ ] Deploy `server/` to Railway / Render / Fly.io
- [ ] Get production API URL
- [ ] Build client with `VITE_API_URL=<your-url>`
- [ ] Sync Capacitor: `npx cap copy`
- [ ] Open Xcode, sign, archive
- [ ] Submit to App Store