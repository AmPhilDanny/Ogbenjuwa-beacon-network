# 🚀 Ogbenjuwa Platform — Render Deployment Guide

## Prerequisites

- GitHub repo: `https://github.com/AmPhilDanny/Ogbenjuwa-beacon-network`
- Render CLI installed: `C:\Users\user pc\render-cli\render.exe`
- Logged in to Render CLI (`render login`)

---

## Option 1: Blueprint Deploy (Recommended — 3 services at once)

### Step 1: Push `render.yaml` to GitHub

The `render.yaml` at the project root defines all 3 services. Already pushed.

### Step 2: Connect on Render Dashboard

1. Go to [dashboard.render.com](https://dashboard.render.com/)
2. Click **New +** → **Blueprint**
3. Connect repo `AmPhilDanny/Ogbenjuwa-beacon-network`
4. Review the 3 services, click **Apply**
5. When prompted for `DATABASE_URL` (sync:false), paste:

```
postgres://postgres.hacqkpjsvjsauhrossgz:JQk7qnQB2EPhdo02@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

6. Click **Apply** — done. All 3 deploy in parallel.

### Step 3: Post-Deploy

After deployment, update the `CORS_ORIGINS` env var on the API service with the actual Render URLs (e.g., `https://ogbenjuwa-beacon.onrender.com,https://ogbenjuwa-userapps.onrender.com`).

---

## Option 2: Manual Deploy (via Dashboard)

### Backend API — Web Service

| Field | Value |
|-------|-------|
| **Type** | Web Service |
| **Name** | `ogbenjuwa-api` |
| **Runtime** | `Docker` |
| **Root Directory** | `central-command` |
| **Build Command** | _(leave empty — Docker handles it)_ |
| **Start Command** | _(leave empty — Docker handles it)_ |
| **Health Check Path** | `/api/v1/health` |

**Environment Variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `4001` | |
| `DATABASE_URL` | `postgres://postgres.hacqkpjsvjsauhrossgz:JQk7qnQB2EPhdo02@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require` | Your Supabase connection |
| `JWT_SECRET` | _(generate a random string)_ | |
| `JWT_REFRESH_SECRET` | _(generate a random string)_ | |
| `CORS_ORIGINS` | `https://ogbenjuwa-beacon.onrender.com,https://ogbenjuwa-userapps.onrender.com` | Update after frontends deploy |
| `REDIS_URL` | `redis://localhost:6379` | Falls back gracefully if unavailable |

---

### Beacon Network — Static Site

| Field | Value |
|-------|-------|
| **Type** | Static Site |
| **Name** | `ogbenjuwa-beacon` |
| **Root Directory** | `ogbenjuwa-beacon-network` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

**Environment Variable:**

| Key | Value |
|-----|-------|
| `VITE_API_BASE` | `https://ogbenjuwa-api.onrender.com/api/v1` |

**SPA Routing:** Render's Static Sites support rewrites. The `_redirects` file in `public/` handles this:
```
/* /index.html 200
```

---

### User Apps — Static Site

| Field | Value |
|-------|-------|
| **Type** | Static Site |
| **Name** | `ogbenjuwa-userapps` |
| **Root Directory** | `user-apps` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

**Environment Variable:**

| Key | Value |
|-----|-------|
| `VITE_API_BASE` | `https://ogbenjuwa-api.onrender.com/api/v1` |

**SPA Routing:** Same `_redirects` file approach.

---

## Build & Start Commands Reference

### Backend API (`central-command/`)

Since it uses **Docker**, you don't enter build/start commands — Render reads the `Dockerfile` automatically.

What the Dockerfile does:
- **Build:** Copies files, runs `bun install`, compiles TypeScript
- **Start:** `bun run server/index.ts`

### Beacon Network (`ogbenjuwa-beacon-network/`)

| Command | What to enter |
|---------|---------------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | _(Static Site — not needed)_ |
| **Publish Directory** | `dist` |

### User Apps (`user-apps/`)

| Command | What to enter |
|---------|---------------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | _(Static Site — not needed)_ |
| **Publish Directory** | `dist` |

---

## Test Accounts

All passwords: `Password123!`

| Username | Email | Role | Login Type |
|----------|-------|------|------------|
| `daniel` | `daniel@ogbenjuwa.local` | super_admin | Email/password → OTP |
| `oche.agbo` | `oche.agbo@ogbenjuwa.local` | lga_coordinator | Email/password → OTP |
| `godwin.ibe` | `godwin.ibe@ogbenjuwa.local` | resident | Direct login, no OTP |
| `adakole.ogb` | `adakole.ogb@ogbenjuwa.local` | ward_leader | Email/password → OTP |
| `michael.adu` | `michael.adu@ogbenjuwa.local` | resident | Direct login, no OTP |

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                   Render                          │
│                                                   │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐   │
│  │ ogbenjuwa-api │  │ ogbenjuwa│  │ogbenjuwa │   │
│  │  Web Service  │  │ -beacon  │  │-userapps │   │
│  │  :4001 (Docker)│  │StaticSite│  │StaticSite│   │
│  └──────┬───────┘  └──────────┘  └──────────┘   │
│         │                                          │
│         ▼                                          │
│  ┌──────────────┐                                  │
│  │   Supabase   │  (external, pre-existing)        │
│  │  PostgreSQL  │                                  │
│  └──────────────┘                                  │
└──────────────────────────────────────────────────┘
```
