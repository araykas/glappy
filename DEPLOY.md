# 🚀 Panduan Deploy ke Vercel

> Panduan lengkap deploy **Frontend** (glappy-dev) dan **Backend** (backend) ke Vercel secara terpisah.

---

## ⚠️ Penting Sebelum Deploy

### 🔐 Secret Keys Terekspos di Git

File `backend/.env.production` berisi **API keys nyata** yang kemungkinan sudah ter-commit ke repository:

```
SUPABASE_ANON_KEY=sb_publishable_...
GROQ_API_KEY=gsk_...
```

**Lakukan ini SEBELUM deploy:**
1. Pastikan `.env.production` masuk ke `.gitignore`
2. Jangan pernah commit file `.env*` yang berisi nilai nyata ke repo publik
3. Rotate/regenerate API keys jika repo sudah pernah di-push ke GitHub publik:
   - Groq: [https://console.groq.com](https://console.groq.com) → API Keys → Revoke & buat baru
   - Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard) → Project Settings → API → Reset keys

---

## 🏗️ Arsitektur Deploy

Ada **2 strategi deploy**, pilih salah satu:

| Strategi | Deskripsi | Cocok untuk |
|---|---|---|
| **A — Full Separate** | FE di project `glappy-dev`, BE di project `backend` | Skalabilitas, pemisahan concern |
| **B — FE + Serverless** | FE dan API (`/api/index.js`) dalam 1 project `glappy-dev` | Simpel, 1 domain |

> **Rekomendasi: Strategi A** — karena folder `backend/` sudah punya konfigurasi lengkap dan terpisah.

---

## 📦 Strategi A — Deploy Terpisah (Rekomendasi)

### Bagian 1: Deploy Backend

#### Langkah 1 — Push ke GitHub

Pastikan folder `backend/` sudah terhubung ke GitHub repository (bisa mono-repo atau repo terpisah).

```bash
# Jika mono-repo, Vercel bisa set root directory ke /backend
git add .
git commit -m "deploy: backend ready for vercel"
git push origin main
```

#### Langkah 2 — Import Project di Vercel

1. Buka [https://vercel.com/new](https://vercel.com/new)
2. Import repository GitHub kamu
3. Konfigurasi project:

| Setting | Nilai |
|---|---|
| **Framework Preset** | Other |
| **Root Directory** | `backend` |
| **Build Command** | _(kosongkan)_ |
| **Output Directory** | _(kosongkan)_ |
| **Install Command** | `npm install` |

#### Langkah 3 — Set Environment Variables Backend

Di Vercel Dashboard → Project `backend` → **Settings → Environment Variables**, tambahkan:

| Key | Value | Environment |
|---|---|---|
| `NODE_ENV` | `production` | Production |
| `GROQ_API_KEY` | `gsk_...` | Production |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Production |
| `SUPABASE_ANON_KEY` | `sb_publishable_...` | Production |
| `CORS_ORIGIN` | `https://nama-frontend.vercel.app` | Production |

> Isi value dari `.env.production` tapi **jangan di-commit ke git**.

#### Langkah 4 — Verifikasi Backend

Setelah deploy, test endpoint health check:

```
GET https://nama-backend.vercel.app/api/health
```

Response yang diharapkan:
```json
{
  "status": "OK",
  "message": "Glappy Backend is running"
}
```

---

### Bagian 2: Deploy Frontend

#### Langkah 1 — Import Project di Vercel

1. Buka [https://vercel.com/new](https://vercel.com/new)
2. Import repository yang sama (atau repo frontend)
3. Konfigurasi project:

| Setting | Nilai |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `glappy-dev` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

#### Langkah 2 — Set Environment Variables Frontend

Di Vercel Dashboard → Project `glappy-dev` → **Settings → Environment Variables**, tambahkan:

| Key | Value | Environment |
|---|---|---|
| `VITE_API_BASE_URL` | `https://nama-backend.vercel.app/api` | Production |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Production |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_...` | Production |

> Ganti `nama-backend.vercel.app` dengan URL backend yang sudah di-deploy di Langkah sebelumnya.

#### Langkah 3 — Update CORS di Backend

Setelah FE ter-deploy dan dapat URL, update environment variable `CORS_ORIGIN` di project backend:

```
CORS_ORIGIN=https://nama-frontend.vercel.app
```

Lakukan **Redeploy** backend agar perubahan berlaku.

#### Langkah 4 — Verifikasi Frontend

Buka URL frontend dan pastikan:
- [ ] Halaman berhasil dimuat
- [ ] Library list tampil (artinya API `/api/libraries` berjalan)
- [ ] AI chat bisa digunakan
- [ ] Command generator bisa generate commands

---

## 📦 Strategi B — Frontend + Serverless dalam 1 Project

Gunakan strategi ini jika ingin deploy lebih simpel (1 project, 1 domain). FE dan API berada di URL yang sama.

> File `glappy-dev/api/index.js` sudah tersedia sebagai serverless handler.

#### Langkah 1 — Pastikan vercel.json sudah benar

File `glappy-dev/vercel.json` harus berisi:

```json
{
  "functions": {
    "api/index.js": {
      "includeFiles": "api/**"
    }
  },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/index.js" },
    { "source": "/api", "destination": "/api/index.js" }
  ]
}
```

> ✅ File ini sudah diupdate. Pattern `/api/:path*` memastikan semua sub-path seperti `/api/libraries`, `/api/ai/chat`, dll diarahkan ke serverless handler.

#### Langkah 2 — Deploy ke Vercel

1. Buka [https://vercel.com/new](https://vercel.com/new)
2. Import repository GitHub kamu
3. Konfigurasi project:

| Setting | Nilai |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `glappy-dev` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

#### Langkah 3 — Set Environment Variables

Di Vercel Dashboard → Project → **Settings → Environment Variables**:

| Key | Value | Keterangan |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Pakai relative path karena 1 domain |
| `GROQ_API_KEY` | `gsk_...` | API key Groq untuk AI |
| `SUPABASE_URL` | `https://xxx.supabase.co` | URL project Supabase |
| `SUPABASE_ANON_KEY` | `sb_publishable_...` | Anon key Supabase |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Untuk Supabase client di frontend |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_...` | Untuk Supabase client di frontend |

> `VITE_API_BASE_URL=/api` karena API dan FE berada di domain yang sama — tidak perlu URL absolut.

#### Langkah 4 — Verifikasi setelah Deploy

Test endpoint ini setelah deploy berhasil:

```
GET https://nama-project.vercel.app/api/health
GET https://nama-project.vercel.app/api/libraries
```

`/api/libraries` harus return 3 library cards (OpenGL, Vulkan, DirectX). Kalau berhasil, LibrarySelector di UI akan menampilkan cards dengan benar.

---

## 🔍 Checklist Sebelum Deploy

### Backend
- [ ] `vercel.json` ada dan valid (`"src": "server.js"`, `"use": "@vercel/node"`)
- [ ] `server.js` export `default app` untuk serverless ✅
- [ ] `package.json` ada field `"main": "server.js"` ✅
- [ ] `.env.production` **tidak** ter-commit ke git
- [ ] Semua env vars sudah di-set di Vercel Dashboard
- [ ] `NODE_ENV=production` di-set agar morgan logging tidak jalan

### Frontend
- [ ] `vite.config.js` tidak ada hardcode URL
- [ ] `src/config/api.js` sudah pakai `import.meta.env.VITE_API_BASE_URL` ✅
- [ ] `VITE_API_BASE_URL` di-set ke URL backend production
- [ ] Build lokal berhasil: `npm run build` di folder `glappy-dev`

---

## 🐛 Troubleshooting Umum

### ❌ CORS Error di browser

Pastikan `CORS_ORIGIN` di backend di-set ke URL frontend yang tepat (termasuk `https://`).

Backend saat ini allow semua origin sebagai fallback, tapi set `CORS_ORIGIN` secara eksplisit tetap disarankan untuk keamanan.

### ❌ 404 di endpoint API

Cek `vercel.json` backend — pastikan route `/(.*) → server.js` sudah ada.

### ❌ `import.meta.env.VITE_*` bernilai `undefined`

Variabel dengan prefix `VITE_` harus di-set di Vercel Dashboard, bukan di file `.env` yang di-push ke git.

### ❌ Groq/Supabase tidak berjalan di production

Cek log di Vercel Dashboard → Deployments → klik deployment → **Functions** tab. Pastikan env vars sudah tersimpan.

### ❌ Cold start lambat

Normal untuk Vercel Serverless — request pertama setelah idle bisa lebih lambat beberapa detik. Ini bukan error.

---

## 📋 URL Reference

Setelah deploy, catat URL berikut:

| Service | URL |
|---|---|
| Backend | `https://_____________________.vercel.app` |
| Frontend | `https://_____________________.vercel.app` |
| Health Check | `https://_____________________.vercel.app/api/health` |

---

## 🔗 Links Berguna

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Groq Console (API Keys)](https://console.groq.com)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Node.js Runtime Docs](https://vercel.com/docs/functions/runtimes/node-js)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode)
