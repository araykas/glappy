# Glappy 🎮

**AI-Powered Graphics Environment & Compiler Generator**

Glappy membantu developer C++ men-setup environment OpenGL (dan library grafis lainnya) dengan cepat — dari generate installation commands yang spesifik untuk hardware kamu, sampai troubleshooting error compile via AI.

🌐 **Live:** [https://glappy-dev.vercel.app](https://glappy-dev.vercel.app)

---

## Fitur

- **Installation Command Generator** — Generate script instalasi yang disesuaikan dengan OS, compiler, dan GPU user secara otomatis
- **Split-Screen IDE Layout** — Panel command (kiri) + code preview `main.cpp` (kanan) dalam satu layar
- **Glappy Assist** — Floating AI troubleshooter untuk analisis error compile, linking error, dan konfigurasi CMake
- **Dark Terminal UI** — Cyberpunk/IDE aesthetic berbasis GitHub Dark
- **Responsive** — Desktop sidebar layout, mobile tab navigation

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| AI | Groq API (Llama 3.3 70B) |
| Database | Supabase (PostgreSQL) |
| Deploy | Vercel (frontend + backend serverless) |

---

## Struktur Repo

```
glappy/
├── glappy-dev/        # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Header, CommandGenerator, AIAssistant, dll
│   │   ├── config/         # API config, session management
│   │   └── App.jsx         # Root layout & routing
│   ├── index.html
│   └── vite.config.js
│
└── backend/                # Backend API (Express.js)
    ├── src/
    │   ├── controllers/    # aiController, commandController, libraryController
    │   ├── services/       # aiService, commandService, databaseService
    │   ├── routes/         # aiRoutes, commandRoutes, libraryRoutes
    │   ├── middleware/      # errorHandler, validator
    │   └── app.js
    └── server.js
```

---

## Cara Pakai

1. Buka [https://glappy-dev.vercel.app](https://glappy-dev.vercel.app)
2. Di tab **Setup** — isi spesifikasi device (OS, CPU, GPU, compiler)
3. Pilih library target (OpenGL)
4. Buka tab **Commands** — script instalasi langsung ter-generate sesuai hardware kamu
5. Copy dan jalankan command di terminal lokal kamu
6. Kalau ada error, klik **🔧 Glappy Assist** di pojok kanan bawah — paste error log untuk dapat solusi

---

## Development

### Prerequisites
- Node.js 18+
- npm / yarn

### Frontend
```bash
cd glappy-dev
npm install
npm run dev        # http://localhost:5173
```

### Backend
```bash
cd backend
cp .env.example .env   # isi GROQ_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
npm install
npm run dev        # http://localhost:5000
```

### Environment Variables (Backend)

| Variable | Keterangan |
|---|---|
| `GROQ_API_KEY` | API key dari [console.groq.com](https://console.groq.com) |
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_ANON_KEY` | Anon key dari Supabase |
| `NODE_ENV` | `development` / `production` |
| `CORS_ORIGIN` | URL frontend production |

---

## Libraries yang Didukung

| Library | Status |
|---|---|
| OpenGL (+ GLFW, GLEW) | ✅ Available |
| Vulkan | 🔜 Coming Soon |
| DirectX | 🔜 Coming Soon |

---

## Screenshot

**Setup Menu** — Isi spesifikasi device (OS, CPU, GPU, compiler) sebelum generate command

<img width="1909" height="879" alt="Setup Menu" src="https://github.com/user-attachments/assets/a38ddfb3-9362-483e-8ea0-69a45d17ff8d" />

**Commands Menu** — Installation script ter-generate otomatis sesuai hardware kamu

<img width="1912" height="876" alt="Commands Menu" src="https://github.com/user-attachments/assets/0601012b-9143-4f13-bdb7-d15ef9c509b3" />

**Glappy Assist** — Floating AI troubleshooter untuk analisis error compile dan konfigurasi

<img width="626" height="701" alt="Glappy Assist - AI Troubleshooter" src="https://github.com/user-attachments/assets/a1f34f1d-b9f9-42cd-9829-92047559ee63" />



---

## Demo Penggunaan

[https://drive.google.com/drive/folders/1Pssuqa0aO_ztO3wbgu23WcywO4GoWFWI?usp=drive_link](https://drive.google.com/drive/folders/1Pssuqa0aO_ztO3wbgu23WcywO4GoWFWI?usp=drive_link)

---

## License

GNU General Public License v3.0 — see [LICENSE](./LICENSE) for details.
