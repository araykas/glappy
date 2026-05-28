# API Testing Guide

Panduan untuk testing API endpoints menggunakan curl atau Postman.

## 🚀 Start Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

---

## 📡 Test Endpoints

### 1. Health Check

**Request:**
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Happy Instalasi Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

---

### 2. Get All Libraries

**Request:**
```bash
curl http://localhost:5000/api/libraries
```

**Expected Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "opengl",
      "name": "OpenGL",
      "description": "Open Graphics Library...",
      "category": "Graphics",
      ...
    }
  ]
}
```

---

### 3. Get Library Details

**Request:**
```bash
curl http://localhost:5000/api/libraries/opengl
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "opengl",
    "name": "OpenGL",
    "description": "...",
    "platforms": ["windows", "linux", "macos"],
    ...
  }
}
```

---

### 4. Generate Commands (Windows)

**Request:**
```bash
curl -X POST http://localhost:5000/api/commands/generate \
  -H "Content-Type: application/json" \
  -d "{\"libraryId\":\"opengl\",\"deviceSpecs\":{\"os\":\"windows\",\"cpu\":\"Intel Core i7\",\"gpu\":\"NVIDIA RTX 3060\",\"ram\":\"16GB\"}}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "library": {
      "id": "opengl",
      "name": "OpenGL",
      "version": "Latest"
    },
    "deviceSpecs": {
      "os": "windows",
      "cpu": "Intel Core i7",
      "gpu": "NVIDIA RTX 3060",
      "ram": "16GB"
    },
    "commands": [
      {
        "title": "1. Install vcpkg (Package Manager)",
        "command": "git clone https://github.com/Microsoft/vcpkg.git\ncd vcpkg\n.\\bootstrap-vcpkg.bat",
        "description": "Install vcpkg untuk manage dependencies",
        "category": "setup"
      },
      ...
    ],
    "projectStructure": "my-opengl-project/\n├── src/\n...",
    "pathSetup": [...],
    "exampleCode": "// main.cpp...",
    "cmakeFile": "cmake_minimum_required...",
    "generatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Generate Commands (Linux)

**Request:**
```bash
curl -X POST http://localhost:5000/api/commands/generate \
  -H "Content-Type: application/json" \
  -d "{\"libraryId\":\"opengl\",\"deviceSpecs\":{\"os\":\"linux\",\"cpu\":\"AMD Ryzen 5\",\"gpu\":\"AMD RX 580\"}}"
```

---

### 6. AI Chat

**Request:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Error saat compile OpenGL\",\"context\":{\"deviceSpecs\":{\"os\":\"windows\",\"cpu\":\"Intel Core i7\"},\"library\":{\"id\":\"opengl\",\"name\":\"OpenGL\"}}}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": "Error saat compile OpenGL",
    "aiResponse": "Untuk mengatasi error instalasi OpenGL:\n\n1. **Pastikan semua dependencies...",
    "suggestions": [
      "Cek versi compiler dengan: gcc --version atau cl",
      "Verify PATH dengan: echo %PATH%",
      ...
    ],
    "timestamp": "2024-01-01T00:00:00.000Z",
    "context": {
      "library": "OpenGL",
      "os": "windows"
    }
  }
}
```

---

## 🧪 Test Error Cases

### Invalid Library ID
```bash
curl http://localhost:5000/api/libraries/invalid-lib
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Library with id 'invalid-lib' not found"
}
```

### Missing Required Fields
```bash
curl -X POST http://localhost:5000/api/commands/generate \
  -H "Content-Type: application/json" \
  -d "{\"libraryId\":\"opengl\"}"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "msg": "Device specs must be an object",
      "param": "deviceSpecs",
      ...
    }
  ]
}
```

### Unsupported OS
```bash
curl -X POST http://localhost:5000/api/commands/generate \
  -H "Content-Type: application/json" \
  -d "{\"libraryId\":\"directx\",\"deviceSpecs\":{\"os\":\"linux\",\"cpu\":\"Intel Core i7\"}}"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Library 'DirectX' is not supported on linux"
}
```

---

## 📝 Postman Collection

Import collection ini ke Postman untuk testing lebih mudah:

1. Buka Postman
2. Import → Raw text
3. Paste JSON collection (buat sendiri atau gunakan curl commands di atas)

---

## 🔍 Tips Testing

1. **Gunakan Postman** untuk testing yang lebih interaktif
2. **Check logs** di terminal server untuk debug
3. **Test semua OS variants** (windows, linux, macos)
4. **Test error cases** untuk validate error handling
5. **Check response time** untuk performance monitoring
