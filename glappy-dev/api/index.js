// Vercel Serverless Entry Point
// Semua backend Express dijalankan dari sini

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import { body, validationResult } from 'express-validator';

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Supabase ────────────────────────────────────────────
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

const isSupabaseConfigured = () => supabase !== null;

// ── Groq ────────────────────────────────────────────────
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// ── Static Library Data (fallback) ─────────────────────
const LIBRARIES_STATIC = [
  {
    id: 'opengl', name: 'OpenGL',
    description: 'Open Graphics Library - Cross-platform API for rendering 2D and 3D graphics',
    category: 'Graphics', version: 'Latest', icon: '🎨', difficulty: 'Medium',
    platforms: ['windows', 'linux', 'macos'],
    dependencies: ['GLEW', 'GLFW', 'OpenGL'],
    documentation: 'https://www.opengl.org/documentation/',
    features: ['Cross-platform compatibility', 'Hardware acceleration', 'Extensive community support', 'Mature and stable API'],
    comingSoon: false,
  },
  {
    id: 'vulkan', name: 'Vulkan',
    description: 'Modern cross-platform graphics and compute API',
    category: 'Graphics', version: 'Latest', icon: '⚡', difficulty: 'Advanced',
    platforms: ['windows', 'linux', 'macos'],
    dependencies: ['Vulkan SDK', 'GLFW'],
    documentation: 'https://www.vulkan.org/',
    features: ['Low-level GPU control', 'Better performance', 'Multi-threading support', 'Modern architecture'],
    comingSoon: true,
  },
  {
    id: 'directx', name: 'DirectX',
    description: 'Microsoft graphics API for Windows',
    category: 'Graphics', version: '12', icon: '🎮', difficulty: 'Advanced',
    platforms: ['windows'],
    dependencies: ['Windows SDK', 'DirectX SDK'],
    documentation: 'https://docs.microsoft.com/en-us/windows/win32/directx',
    features: ['Windows native', 'Excellent performance', 'Gaming industry standard', 'Ray tracing support'],
    comingSoon: true,
  },
];

const getLibraryById = (id) => LIBRARIES_STATIC.find(l => l.id === id);

// ── Topic Filter ────────────────────────────────────────
const RELEVANT_KEYWORDS = [
  'opengl','vulkan','directx','dx12','dx11','glfw','glew','glad','sdl',
  'install','instalasi','setup','download','unduh',
  'compile','build','kompilasi','gcc','g++','msvc','clang','mingw',
  'error','gagal','failed','crash','bug','masalah','problem','issue',
  'link','linker','undefined reference','unresolved external','lib','.dll','.so','.a',
  'cmake','makefile','vcpkg','apt','brew','homebrew','pkg-config',
  'path','environment','env','variable','not found','tidak ditemukan',
  'gpu','graphics','grafis','driver','shader','render',
  'windows','linux','macos','ubuntu','debian',
  'include','header','.h','dependency','dependencies',
  'code','kode','program','project','proyek','cpp','c++',
];
const IRRELEVANT_KEYWORDS = [
  'makan','minum','masak','resep','makanan','minuman','restoran','warung',
  'film','movie','musik','lagu','drama','anime',
  'politik','berita','news','artis','selebritis','gosip',
  'cuaca','weather','hujan',
  'bola','sepakbola','basket','olahraga','sport',
  'saham','crypto','bitcoin','investasi','trading',
  'sakit','obat','dokter','rumah sakit',
];

const isRelevant = (msg) => {
  const lower = msg.toLowerCase();
  if (IRRELEVANT_KEYWORDS.some(k => lower.includes(k))) return false;
  if (RELEVANT_KEYWORDS.some(k => lower.includes(k))) return true;
  if (msg.trim().split(/\s+/).length < 4) return false;
  return true;
};

const offTopicResponse = (library) => ({
  message: `Maaf, saya hanya bisa membantu seputar instalasi dan konfigurasi graphics library${library?.name ? ` (${library.name})` : ''}.

Topik yang bisa saya bantu:
- 📦 Instalasi library (OpenGL, Vulkan, DirectX)
- ⚙️ Compile & build errors
- 🔗 Linking issues
- 🛣️ Setup PATH & environment variables
- 🔧 CMake configuration
- 🎮 GPU driver & graphics troubleshooting`,
  suggestions: [
    'Bagaimana cara install OpenGL di Windows?',
    'Error saat compile, apa yang harus dilakukan?',
    'Bagaimana setup environment variables?',
    'CMake tidak bisa find library',
  ],
  offTopic: true,
});

// ── AI Response ─────────────────────────────────────────
const SYSTEM_PROMPT = `Kamu adalah AI assistant ahli untuk membantu instalasi dan troubleshooting graphics library seperti OpenGL, Vulkan, dan DirectX.
Bantu user mengatasi error instalasi, compile error, linking error, setup environment variables, konfigurasi CMake.
Jawab dalam Bahasa Indonesia, step-by-step, praktis. Maksimal 400 kata.
Jika pertanyaan di luar topik, tolak dengan sopan.`;

const generateAIResponse = async (message, context = {}) => {
  if (!isRelevant(message)) return offTopicResponse(context.library);

  if (groq) {
    try {
      const { deviceSpecs, library } = context;
      const ctxLines = [
        deviceSpecs?.os  ? `OS: ${deviceSpecs.os}`  : null,
        deviceSpecs?.gpu ? `GPU: ${deviceSpecs.gpu}` : null,
        library?.name    ? `Library: ${library.name}` : null,
      ].filter(Boolean).join('\n');

      const fullMsg = ctxLines ? `[Konteks]\n${ctxLines}\n\n[Pertanyaan]\n${message}` : message;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: fullMsg },
        ],
        temperature: 0.5,
        max_tokens: 600,
      });

      return {
        message: completion.choices[0]?.message?.content || 'Tidak ada respons dari AI.',
        suggestions: [],
      };
    } catch (err) {
      console.error('Groq error:', err.message);
    }
  }

  // Fallback rule-based
  const lower = message.toLowerCase();
  const lib = context.library?.name || 'library';
  if (lower.includes('error') || lower.includes('gagal')) {
    return { message: `Untuk mengatasi error instalasi ${lib}:\n1. Pastikan semua dependencies terinstall\n2. Check compiler version\n3. Verify environment variables\n4. Coba run as administrator`, suggestions: ['Cek versi compiler: gcc --version', 'Verify PATH', 'Reinstall dependencies'] };
  }
  if (lower.includes('compile') || lower.includes('build')) {
    return { message: `Tips compile ${lib}:\n1. Pastikan include paths benar (-I flag)\n2. Link semua libraries (-L dan -l flag)\n3. Gunakan CMake untuk kemudahan`, suggestions: ['Gunakan pkg-config', 'Coba CMake', 'Check -std=c++11'] };
  }
  if (lower.includes('cmake')) {
    return { message: `CMake workflow:\nmkdir build && cd build\ncmake ..\ncmake --build .`, suggestions: ['Check CMakeLists.txt', 'Verify find_package()'] };
  }
  return { message: `Halo! Saya siap membantu instalasi ${lib}. Jelaskan masalah Anda secara detail.`, suggestions: [`Cara install ${lib}?`, 'Error saat compile', 'Setup PATH'] };
};

// ── Command Generator ───────────────────────────────────
const generateCommands = (libraryId, os) => {
  if (libraryId !== 'opengl') throw new Error(`Library '${libraryId}' not supported yet`);
  if (os === 'windows') return [
    { title: '1. Install vcpkg', command: 'git clone https://github.com/Microsoft/vcpkg.git\ncd vcpkg\n.\\bootstrap-vcpkg.bat', description: 'Install package manager', category: 'setup' },
    { title: '2. Install GLEW', command: 'vcpkg install glew:x64-windows', description: 'Install GLEW', category: 'dependencies' },
    { title: '3. Install GLFW', command: 'vcpkg install glfw3:x64-windows', description: 'Install GLFW', category: 'dependencies' },
    { title: '4. Integrate vcpkg', command: 'vcpkg integrate install', description: 'Auto-detect di Visual Studio', category: 'configuration' },
    { title: '5. Compile (GCC)', command: 'g++ src/main.cpp -o app.exe -IC:/vcpkg/installed/x64-windows/include -LC:/vcpkg/installed/x64-windows/lib -lglfw3 -lglew32 -lopengl32 -lgdi32', description: 'Compile manual', category: 'compile' },
    { title: '6. Compile (CMake)', command: 'mkdir build\ncd build\ncmake .. -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake\ncmake --build .', description: 'Compile dengan CMake', category: 'compile' },
  ];
  if (os === 'linux') return [
    { title: '1. Update package manager', command: 'sudo apt-get update', description: 'Update repo', category: 'setup' },
    { title: '2. Install OpenGL', command: 'sudo apt-get install libgl1-mesa-dev libglu1-mesa-dev', description: 'Install OpenGL', category: 'dependencies' },
    { title: '3. Install GLEW', command: 'sudo apt-get install libglew-dev', description: 'Install GLEW', category: 'dependencies' },
    { title: '4. Install GLFW', command: 'sudo apt-get install libglfw3-dev', description: 'Install GLFW', category: 'dependencies' },
    { title: '5. Compile', command: 'g++ src/main.cpp -o app $(pkg-config --cflags --libs glfw3 glew) -lGL', description: 'Compile dengan pkg-config', category: 'compile' },
  ];
  if (os === 'macos') return [
    { title: '1. Install Homebrew', command: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"', description: 'Install Homebrew', category: 'setup' },
    { title: '2. Install GLEW', command: 'brew install glew', description: 'Install GLEW', category: 'dependencies' },
    { title: '3. Install GLFW', command: 'brew install glfw', description: 'Install GLFW', category: 'dependencies' },
    { title: '4. Compile', command: 'g++ src/main.cpp -o app -I/usr/local/include -L/usr/local/lib -lglfw -lGLEW -framework OpenGL', description: 'Compile', category: 'compile' },
  ];
  return [];
};

const generateProjectStructure = () => `my-opengl-project/
├── src/
│   └── main.cpp
├── include/
├── lib/
├── CMakeLists.txt
└── Makefile`;

const generateExampleCode = () => `// main.cpp - OpenGL Hello Window
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <iostream>

int main() {
    if (!glfwInit()) { std::cerr << "Failed to init GLFW" << std::endl; return -1; }
    GLFWwindow* window = glfwCreateWindow(800, 600, "OpenGL Window", NULL, NULL);
    if (!window) { glfwTerminate(); return -1; }
    glfwMakeContextCurrent(window);
    if (glewInit() != GLEW_OK) { std::cerr << "Failed to init GLEW" << std::endl; return -1; }
    std::cout << "OpenGL Version: " << glGetString(GL_VERSION) << std::endl;
    while (!glfwWindowShouldClose(window)) {
        glClear(GL_COLOR_BUFFER_BIT);
        glfwSwapBuffers(window);
        glfwPollEvents();
    }
    glfwTerminate();
    return 0;
}`;

// ── Validation helper ───────────────────────────────────
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    return false;
  }
  return true;
};

// ══════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Happy Instalasi Backend is running', timestamp: new Date().toISOString(), groq: !!groq, supabase: isSupabaseConfigured() });
});

// ── Libraries ──
app.get('/api/libraries', async (req, res) => {
  try {
    let libraries = LIBRARIES_STATIC;
    let source = 'static';
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('libraries').select('*').order('name');
      if (!error && data) {
        libraries = data.map(r => ({ id: r.id, name: r.name, description: r.description, category: r.category, version: r.version, icon: r.icon, difficulty: r.difficulty, platforms: r.platforms || [], dependencies: r.dependencies || [], documentation: r.documentation, features: r.features || [], comingSoon: r.coming_soon }));
        source = 'database';
      }
    }
    res.json({ success: true, count: libraries.length, data: libraries, source });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/libraries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let library = null;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('libraries').select('*').eq('id', id).single();
      if (!error && data) library = { id: data.id, name: data.name, description: data.description, category: data.category, version: data.version, icon: data.icon, difficulty: data.difficulty, platforms: data.platforms || [], comingSoon: data.coming_soon };
    }
    if (!library) library = getLibraryById(id);
    if (!library) return res.status(404).json({ success: false, message: `Library '${id}' not found` });
    res.json({ success: true, data: library });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Commands ──
app.post('/api/commands/generate',
  body('libraryId').notEmpty().withMessage('Library ID is required'),
  body('deviceSpecs').isObject().withMessage('Device specs must be an object'),
  body('deviceSpecs.os').notEmpty().withMessage('OS is required'),
  body('deviceSpecs.cpu').notEmpty().withMessage('CPU is required'),
  async (req, res) => {
    if (!validate(req, res)) return;
    try {
      const { libraryId, deviceSpecs, sessionId } = req.body;
      const library = getLibraryById(libraryId);
      if (!library) return res.status(404).json({ success: false, message: `Library '${libraryId}' not found` });
      if (library.comingSoon) return res.status(400).json({ success: false, message: `Library '${library.name}' is coming soon` });
      if (!library.platforms.includes(deviceSpecs.os)) return res.status(400).json({ success: false, message: `Library '${library.name}' not supported on ${deviceSpecs.os}` });

      const commands = generateCommands(libraryId, deviceSpecs.os);

      // Save to DB
      if (isSupabaseConfigured() && sessionId) {
        await supabase.from('generation_history').insert({ session_id: sessionId, library_id: libraryId, os: deviceSpecs.os, cpu: deviceSpecs.cpu || null, gpu: deviceSpecs.gpu || null, ram: deviceSpecs.ram || null });
      }

      res.json({
        success: true,
        data: {
          library: { id: library.id, name: library.name, version: library.version },
          deviceSpecs: { os: deviceSpecs.os, cpu: deviceSpecs.cpu, gpu: deviceSpecs.gpu || 'Not specified', ram: deviceSpecs.ram || 'Not specified' },
          commands,
          projectStructure: generateProjectStructure(),
          pathSetup: [],
          exampleCode: generateExampleCode(),
          cmakeFile: '',
          generatedAt: new Date().toISOString(),
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── AI Chat ──
app.post('/api/ai/chat',
  body('message').notEmpty().withMessage('Message is required'),
  async (req, res) => {
    if (!validate(req, res)) return;
    try {
      const { message, context, sessionId } = req.body;
      const response = await generateAIResponse(message, context || {});

      // Save to DB only if relevant
      if (isSupabaseConfigured() && sessionId && !response.offTopic) {
        await supabase.from('ai_chat_history').insert({ session_id: sessionId, library_id: context?.library?.id || null, os: context?.deviceSpecs?.os || null, user_message: message, ai_response: response.message, suggestions: response.suggestions || [] });
      }

      res.json({
        success: true,
        data: { userMessage: message, aiResponse: response.message, suggestions: response.suggestions || [], offTopic: response.offTopic || false, timestamp: new Date().toISOString() }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

export default app;
