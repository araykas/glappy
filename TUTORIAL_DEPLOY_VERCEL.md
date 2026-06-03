# 🚀 Tutorial Deploy Happy Instalasi ke Vercel (Pemula)

> Project ini terdiri dari **2 bagian** yang di-deploy terpisah:
> - **Backend** → folder `backend/` (Express API)
> - **Frontend** → folder `happy-instalasi/` (React + Vite)
>
> Keduanya di-deploy ke Vercel secara terpisah.

---

## 📋 Yang Kamu Butuhkan Sebelum Mulai

- Akun GitHub (sudah punya karena project sudah di-push)
- Email aktif untuk daftar Vercel
- API Key dari Groq (gratis)
- Project URL dari Supabase (sudah ada)

---

## BAGIAN 1 — Daftar Akun Vercel

### Langkah 1: Buka vercel.com

1. Buka browser, pergi ke **https://vercel.com**
2. Klik tombol **"Sign Up"** di pojok kanan atas

### Langkah 2: Daftar dengan GitHub

1. Pilih **"Continue with GitHub"** (paling mudah karena project sudah di GitHub)
2. Kamu akan diarahkan ke halaman GitHub untuk authorize
3. Klik **"Authorize Vercel"**
4. Vercel akan minta akses ke repository kamu — klik **"Install"**

### Langkah 3: Isi form onboarding

1. Pilih plan **"Hobby"** (gratis, cukup untuk project ini)
2. Isi nama tim/username sesuai keinginan
3. Klik **"Continue"**

Selesai — kamu sudah punya akun Vercel. ✅

---

## BAGIAN 2 — Deploy Backend

Backend harus di-deploy **lebih dulu** karena frontend butuh URL-nya.

### Langkah 1: Import repository backend

1. Di dashboard Vercel, klik **"Add New..."** → **"Project"**
2. Di bagian "Import Git Repository", cari repo **`happy-instalasi`**
3. Klik **"Import"**

### Langkah 2: Konfigurasi project backend

Setelah klik Import, kamu akan lihat halaman konfigurasi. Isi seperti ini:

| Setting | Nilai |
|---|---|
| **Project Name** | `happy-instalasi-backend` |
| **Framework Preset** | `Other` |
| **Root Directory** | `backend` ← **PENTING, klik Edit dan ganti ini** |
| **Build Command** | *(kosongkan)* |
| **Output Directory** | *(kosongkan)* |
| **Install Command** | `npm install` |

> ⚠️ **Root Directory wajib diisi `backend`** karena repo kamu punya 2 folder.
> Klik tombol **"Edit"** di sebelah Root Directory untuk mengubahnya.

### Langkah 3: Tambah Environment Variables backend

Scroll ke bawah ke bagian **"Environment Variables"**, tambahkan satu per satu:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | *(isi nanti setelah frontend di-deploy, sementara isi `*`)* |
| `SUPABASE_URL` | `https://kvaaofpldyyzdxlhsusc.supabase.co` |
| `SUPABASE_ANON_KEY` | *(ambil dari Supabase dashboard → Project Settings → API → anon key)* |
| `GROQ_API_KEY` | *(lihat cara dapat di bawah)* |

#### Cara dapat GROQ_API_KEY (gratis):
1. Buka **https://console.groq.com**
2. Daftar / login dengan Google
3. Klik **"API Keys"** di sidebar kiri
4. Klik **"Create API Key"**
5. Beri nama, klik **"Submit"**
6. **Copy key-nya sekarang** (hanya tampil sekali)

### Langkah 4: Deploy backend

1. Klik **"Deploy"**
2. Tunggu 1-2 menit sampai muncul tanda ✅ dan konfeti
3. **Catat URL backend** yang muncul, contoh: `https://happy-instalasi-backend.vercel.app`

> URL ini akan dipakai di konfigurasi frontend.

### Langkah 5: Test backend

Buka browser, akses:
```
https://happy-instalasi-backend.vercel.app/api/health
```
Kalau muncul JSON seperti ini, backend berhasil ✅:
```json
{"status":"OK","message":"Happy Instalasi Backend is running","timestamp":"...","environment":"production"}
```

> ⚠️ Jangan lupa `/api/` sebelum `health` — endpoint-nya ada di `/api/health`, bukan `/health`.

---

## BAGIAN 3 — Deploy Frontend

### Langkah 1: Import repository frontend

1. Di dashboard Vercel, klik **"Add New..."** → **"Project"**
2. Cari repo **`happy-instalasi`** yang sama
3. Klik **"Import"**

### Langkah 2: Konfigurasi project frontend

| Setting | Nilai |
|---|---|
| **Project Name** | `happy-instalasi` |
| **Framework Preset** | `Vite` ← Vercel biasanya auto-detect |
| **Root Directory** | `happy-instalasi` ← **klik Edit dan ganti ini** |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Langkah 3: Tambah Environment Variables frontend

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://happy-instalasi-backend.vercel.app/api` ← URL backend tadi + `/api` |
| `VITE_SUPABASE_URL` | `https://kvaaofpldyyzdxlhsusc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(sama dengan yang di backend)* |

> ⚠️ Semua env variable frontend **wajib pakai prefix `VITE_`** agar bisa dibaca oleh Vite.

### Langkah 4: Deploy frontend

1. Klik **"Deploy"**
2. Tunggu 2-3 menit
3. Setelah selesai, catat URL frontend, contoh: `https://happy-instalasi.vercel.app`

---

## BAGIAN 4 — Update CORS Backend

Setelah frontend di-deploy, kamu perlu update env variable backend agar tidak error CORS.

1. Buka Vercel dashboard → pilih project **`happy-instalasi-backend`**
2. Klik **"Settings"** → **"Environment Variables"**
3. Cari `CORS_ORIGIN`, klik **Edit**
4. Ganti nilainya dengan URL frontend: `https://happy-instalasi.vercel.app`
5. Klik **"Save"**
6. Pergi ke tab **"Deployments"** → klik **"..."** pada deployment terbaru → **"Redeploy"**

---

## BAGIAN 5 — Verifikasi Akhir

Buka URL frontend kamu di browser dan cek:

- [ ] Halaman loading tanpa error merah di console (F12)
- [ ] Library selector muncul dan bisa dipilih
- [ ] Generate commands berhasil (butuh backend + Supabase)
- [ ] AI Assistant bisa menerima pesan dan membalas
- [ ] Tidak ada error CORS di console browser

---

## 🔄 Cara Update Setelah Ada Perubahan Kode

Vercel otomatis re-deploy setiap kali kamu `git push` ke branch `master`. Tidak perlu melakukan apa-apa lagi.

```bash
# Edit kode → commit → push → Vercel otomatis deploy
git add .
git commit -m "update: deskripsi perubahan"
git push
```

---

## ❓ Troubleshooting Umum

### Build gagal di Vercel
- Pastikan **Root Directory** sudah benar (`backend` atau `happy-instalasi`)
- Cek tab **"Build Logs"** di Vercel untuk lihat error spesifik

### Error CORS di browser
- Pastikan `CORS_ORIGIN` di backend sudah diisi URL frontend yang benar
- Jangan lupa **Redeploy** backend setelah update env variable

### AI tidak merespons
- Cek `GROQ_API_KEY` sudah diisi dengan benar di backend
- Buka **https://console.groq.com** dan pastikan key masih aktif

### Halaman putih / blank
- Buka DevTools (F12) → Console, lihat error apa yang muncul
- Pastikan semua `VITE_*` env variable sudah diisi di frontend

### Environment variable tidak terbaca
- Setelah menambah/edit env variable, **wajib Redeploy** agar perubahan berlaku
- Vercel tidak otomatis restart saat env variable diubah

---

## 📌 Ringkasan URL Penting

| Layanan | URL |
|---|---|
| Vercel Dashboard | https://vercel.com/dashboard |
| Groq Console (API Key) | https://console.groq.com |
| Supabase Dashboard | https://supabase.com/dashboard |
| GitHub Repository | https://github.com/araykas/happy-instalasi |
