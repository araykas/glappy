# 🚀 Setup Guide - Happy Instalasi

Panduan lengkap untuk setup dan menjalankan aplikasi Happy Instalasi (Frontend + Backend).

---

## 📋 Prerequisites

Pastikan sudah terinstall:
- **Node.js** (v18 atau lebih baru) - [Download](https://nodejs.org/)
- **npm** (biasanya sudah include dengan Node.js)
- **Git** (opsional, untuk clone repository)

---

## 🛠️ Installation

### 1. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# (Opsional) Edit .env sesuai kebutuhan
# notepad .env
```

### 2. Setup Frontend

```bash
# Masuk ke folder frontend
cd happy-instalasi

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# (Opsional) Edit .env sesuai kebutuhan
# notepad .env
```

---

## 🚀 Running the Application

### Cara 1: Manual (2 Terminal)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend akan berjalan di `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd happy-instalasi
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`

### Cara 2: Menggunakan Script (Windows)

Buat file `start-all.bat`:
```batch
@echo off
echo Starting Happy Instalasi...
echo.

start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

start "Frontend Server" cmd /k "cd happy-instalasi && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
```

Jalankan:
```bash
start-all.bat
```

---

## 🧪 Testing

### Test Backend API

**Cara 1: Menggunakan PowerShell Script**
```bash
cd backend
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

**Cara 2: Manual dengan curl**
```bash
# Health check
curl http://localhost:5000/api/health

# Get libraries
curl http://localhost:5000/api/libraries

# Get library details
curl http://localhost:5000/api/libraries/opengl
```

**Cara 3: Menggunakan Browser**
- Buka: `http://localhost:5000/api/health`
- Buka: `http://localhost:5000/api/libraries`

### Test Frontend

1. Buka browser: `http://localhost:5173`
2. Isi form device specifications
3. Pilih library (OpenGL)
4. Lihat generated commands di tab "Installation Commands"
5. Test AI Assistant di tab "AI Assistant"

---

## 📁 Project Structure

```
happy-instalasi/
├── backend/                    # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Express middleware
│   │   ├── data/              # Dummy data
│   │   └── app.js             # Express app
│   ├── .env                   # Environment variables
│   ├── package.json
│   ├── server.js              # Entry point
│   ├── README.md              # Backend documentation
│   └── API_TESTING.md         # API testing guide
│
└── happy-instalasi/           # Frontend (React + Vite)
    ├── src/
    │   ├── components/        # React components
    │   ├── config/            # Configuration (API endpoints)
    │   ├── assets/            # Images, icons
    │   ├── App.jsx            # Main app component
    │   └── main.jsx           # Entry point
    ├── public/                # Static files
    ├── .env                   # Environment variables
    ├── package.json
    └── vite.config.js         # Vite configuration
```

---

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Check backend status

### Libraries
- `GET /api/libraries` - Get all libraries
- `GET /api/libraries/:id` - Get library details

### Commands
- `POST /api/commands/generate` - Generate installation commands

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant

Lihat detail di: `backend/API_TESTING.md`

---

## 🐛 Troubleshooting

### Port Already in Use

**Backend (Port 5000):**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Atau ubah port di backend/.env
PORT=5001
```

**Frontend (Port 5173):**
```bash
# Vite akan otomatis gunakan port lain jika 5173 sudah dipakai
# Atau specify port di package.json:
"dev": "vite --port 3000"
```

### CORS Error

Pastikan `CORS_ORIGIN` di `backend/.env` sesuai dengan URL frontend:
```env
CORS_ORIGIN=http://localhost:5173
```

### Module Not Found

```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../happy-instalasi
rm -rf node_modules package-lock.json
npm install
```

### Backend Not Responding

1. Check apakah backend running: `curl http://localhost:5000/api/health`
2. Check logs di terminal backend
3. Restart backend server

---

## 📝 Development Notes

### Backend
- Menggunakan **dummy data** (in-memory) untuk libraries
- AI Assistant menggunakan **rule-based responses** (belum integrate dengan AI API)
- Siap untuk integrasi database dan AI API

### Frontend
- Saat ini masih menggunakan **local state** (belum connect ke backend)
- Perlu update components untuk fetch data dari backend API
- Lihat `src/config/api.js` untuk API helper functions

---

## 🚧 Next Steps

### Immediate (Connect Frontend to Backend)
- [ ] Update `LibrarySelector.jsx` untuk fetch dari `/api/libraries`
- [ ] Update `CommandGenerator.jsx` untuk fetch dari `/api/commands/generate`
- [ ] Update `AIAssistant.jsx` untuk fetch dari `/api/ai/chat`
- [ ] Add loading states dan error handling

### Future Enhancements
- [ ] Integrate database (PostgreSQL/MongoDB)
- [ ] Integrate AI API (OpenAI/Gemini)
- [ ] Add user authentication
- [ ] Add installation history tracking
- [ ] Support more libraries (Vulkan, DirectX, dll)

---

## 📚 Additional Resources

- **Backend README**: `backend/README.md`
- **API Testing Guide**: `backend/API_TESTING.md`
- **Frontend README**: `happy-instalasi/README.md`

---

## 🤝 Contributing

Contributions are welcome! Silakan buat pull request atau open issue.

---

## 📄 License

ISC

---

## 💡 Tips

1. **Development**: Gunakan `npm run dev` untuk auto-reload saat development
2. **Production**: Build frontend dengan `npm run build` dan serve dengan static server
3. **Testing**: Selalu test API endpoints sebelum integrate ke frontend
4. **Debugging**: Check browser console dan terminal logs untuk error messages

---

**Happy Coding! 🚀**
