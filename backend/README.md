# Happy Instalasi - Backend API

Backend API untuk Happy Instalasi, AI-powered installation assistant untuk graphics libraries.

## 🚀 Features

- ✅ **Library Management** - Get daftar library yang tersedia (OpenGL, Vulkan, DirectX)
- ✅ **Command Generation** - Generate installation commands berdasarkan OS dan device specs
- ✅ **AI Assistant** - Chat dengan AI untuk troubleshooting (dummy responses, siap untuk integrasi AI)
- ✅ **Project Structure Generator** - Generate struktur project yang recommended
- ✅ **Path Setup Guide** - Panduan setup environment variables dan paths
- ✅ **Example Code Generator** - Generate example code untuk testing

## 📦 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Morgan** - HTTP request logger
- **Express Validator** - Request validation

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` sesuai kebutuhan

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Run production server**
   ```bash
   npm start
   ```

Server akan berjalan di `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Check status backend

### Library Management
```
GET /api/libraries
```
Get semua libraries yang tersedia

```
GET /api/libraries/:id
```
Get detail library spesifik (contoh: `/api/libraries/opengl`)

### Command Generation
```
POST /api/commands/generate
```
Generate installation commands

**Request Body:**
```json
{
  "libraryId": "opengl",
  "deviceSpecs": {
    "os": "windows",
    "cpu": "Intel Core i7",
    "gpu": "NVIDIA RTX 3060",
    "ram": "16GB"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "library": { "id": "opengl", "name": "OpenGL", "version": "Latest" },
    "deviceSpecs": { "os": "windows", "cpu": "Intel Core i7", ... },
    "commands": [...],
    "projectStructure": "...",
    "pathSetup": [...],
    "exampleCode": "...",
    "cmakeFile": "..."
  }
}
```

### AI Assistant
```
POST /api/ai/chat
```
Chat dengan AI assistant

**Request Body:**
```json
{
  "message": "Error saat compile OpenGL",
  "context": {
    "deviceSpecs": {
      "os": "windows",
      "cpu": "Intel Core i7",
      "gpu": "NVIDIA RTX 3060"
    },
    "library": {
      "id": "opengl",
      "name": "OpenGL"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": "Error saat compile OpenGL",
    "aiResponse": "...",
    "suggestions": [...],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── aiController.js
│   │   ├── commandController.js
│   │   └── libraryController.js
│   ├── routes/            # API routes
│   │   ├── aiRoutes.js
│   │   ├── commandRoutes.js
│   │   └── libraryRoutes.js
│   ├── services/          # Business logic
│   │   ├── aiService.js
│   │   └── commandService.js
│   ├── middleware/        # Express middleware
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── data/             # Dummy data (nanti bisa dipindah ke DB)
│   │   └── librariesData.js
│   └── app.js            # Express app setup
├── .env                  # Environment variables
├── .env.example          # Template untuk .env
├── .gitignore
├── package.json
├── README.md
└── server.js             # Entry point
```

## 🔧 Environment Variables

```env
PORT=5000                              # Server port
NODE_ENV=development                   # Environment (development/production)
CORS_ORIGIN=http://localhost:5173      # Frontend URL

# AI Integration (untuk implementasi nanti)
# OPENAI_API_KEY=your_key_here
# GEMINI_API_KEY=your_key_here
```

## 🚧 TODO - Future Implementation

### Database Integration
- [ ] Setup PostgreSQL/MongoDB
- [ ] Create database schema
- [ ] Migrate dummy data ke database
- [ ] Add database connection pooling

### AI Integration
- [ ] Integrate OpenAI GPT API
- [ ] Atau integrate Google Gemini API
- [ ] Add conversation history management
- [ ] Implement context-aware responses

### Additional Features
- [ ] User authentication & authorization
- [ ] Save user preferences
- [ ] Installation history tracking
- [ ] Rate limiting untuk API
- [ ] Caching untuk improve performance
- [ ] Add more libraries (Vulkan, DirectX, dll)

## 🧪 Testing

```bash
# Run tests (belum diimplementasi)
npm test
```

## 📝 Notes

- AI Assistant saat ini menggunakan **rule-based dummy responses**
- Data library disimpan di **in-memory** (file `librariesData.js`)
- Siap untuk integrasi dengan OpenAI/Gemini (code sudah ada di `aiService.js`)
- Siap untuk migrasi ke database (struktur sudah modular)

## 🤝 Contributing

Contributions are welcome! Silakan buat pull request atau open issue.

## 📄 License

ISC
