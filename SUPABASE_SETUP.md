# Setup Supabase

## 1. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → Sign in / Sign up
2. Klik **New Project**
3. Isi nama project, password database, pilih region terdekat (Singapore)
4. Tunggu project selesai dibuat (~2 menit)

---

## 2. Jalankan SQL Schema

1. Di dashboard Supabase, buka **SQL Editor** (sidebar kiri)
2. Klik **New query**
3. Copy seluruh isi file `backend/supabase-schema.sql`
4. Paste ke SQL Editor, lalu klik **Run**
5. Pastikan tidak ada error — tabel, views, dan data awal akan terbuat otomatis

---

## 3. Ambil API Keys

1. Di dashboard Supabase, buka **Project Settings** → **API**
2. Copy dua nilai berikut:
   - **Project URL** → `https://xxxxxxxxxxxx.supabase.co`
   - **anon / public key** → string panjang dimulai `eyJ...`

---

## 4. Isi .env Backend

Buka `backend/.env`, ganti placeholder:

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Isi .env Frontend

Buka `happy-instalasi/.env`, ganti placeholder:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> Nilai URL dan key-nya sama persis dengan yang di backend.

---

## 6. Restart Server

```bash
# Backend
cd backend
npm run dev

# Frontend (terminal terpisah)
cd happy-instalasi
npm run dev
```

---

## Verifikasi Integrasi

Setelah setup, cek di Supabase dashboard → **Table Editor**:

| Tabel | Isi setelah... |
|-------|----------------|
| `libraries` | Langsung ada 3 data (OpenGL, Vulkan, DirectX) |
| `generation_history` | Terisi setiap kali user generate commands |
| `ai_chat_history` | Terisi setiap kali user chat dengan AI Assistant |

Backend juga akan log di console:
- ✅ Jika Supabase terhubung: data tersimpan ke DB
- ⚠️ Jika tidak terhubung: fallback ke static data (app tetap jalan)

---

## Struktur Database

```
libraries          → data library (OpenGL, Vulkan, dll)
generation_history → log setiap generate commands
ai_chat_history    → log percakapan AI Assistant

Views:
  library_usage_stats → statistik penggunaan per library
  os_distribution     → distribusi OS pengguna
  recent_activity     → 100 aktivitas terbaru
```
