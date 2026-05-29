// AI Service dengan dummy responses
// Nanti bisa diintegrasikan dengan OpenAI, Gemini, atau AI lainnya

// ============================================
// TOPIC FILTER
// Cek apakah pesan relevan sebelum panggil AI
// ============================================

// Keyword yang dianggap relevan dengan topik app
const RELEVANT_KEYWORDS = [
  // Library names
  'opengl', 'vulkan', 'directx', 'dx12', 'dx11', 'glfw', 'glew', 'glad', 'sdl',
  // Installation & setup
  'install', 'instalasi', 'setup', 'download', 'unduh',
  // Build & compile
  'compile', 'build', 'kompilasi', 'gcc', 'g++', 'msvc', 'clang', 'mingw',
  // Errors
  'error', 'gagal', 'failed', 'crash', 'bug', 'masalah', 'problem', 'issue',
  // Linking
  'link', 'linker', 'undefined reference', 'unresolved external', 'lib', '.dll', '.so', '.a',
  // Tools
  'cmake', 'makefile', 'vcpkg', 'apt', 'brew', 'homebrew', 'pkg-config',
  // Environment
  'path', 'environment', 'env', 'variable', 'not found', 'tidak ditemukan',
  // Graphics / GPU
  'gpu', 'graphics', 'grafis', 'driver', 'shader', 'render', 'opengl', 'vulkan',
  // OS
  'windows', 'linux', 'macos', 'ubuntu', 'debian',
  // Headers & includes
  'include', 'header', '.h', 'dependency', 'dependencies',
  // General programming (masih relevan)
  'code', 'kode', 'program', 'project', 'proyek', 'cpp', 'c++',
];

// Keyword yang jelas di luar topik
const IRRELEVANT_KEYWORDS = [
  // Makanan & minuman
  'makan', 'minum', 'masak', 'resep', 'makanan', 'minuman', 'restoran', 'warung',
  // Hiburan
  'film', 'movie', 'musik', 'lagu', 'drama', 'anime', 'game', 'gaming',
  // Sosial & berita
  'politik', 'berita', 'news', 'artis', 'selebritis', 'gosip',
  // Cuaca
  'cuaca', 'weather', 'hujan', 'panas', 'dingin',
  // Olahraga
  'bola', 'sepakbola', 'basket', 'olahraga', 'sport',
  // Keuangan personal
  'saham', 'crypto', 'bitcoin', 'investasi', 'trading',
  // Kesehatan umum
  'sakit', 'obat', 'dokter', 'rumah sakit',
  // Percakapan umum
  'halo', 'hai', 'hello', 'apa kabar', 'how are you',
];

/**
 * Cek apakah pesan relevan dengan topik instalasi library.
 * Return: { relevant: boolean, reason: string }
 */
export const checkTopicRelevance = (message) => {
  const lower = message.toLowerCase();

  // Cek keyword tidak relevan dulu (lebih spesifik)
  const irrelevantMatch = IRRELEVANT_KEYWORDS.find(kw => lower.includes(kw));
  if (irrelevantMatch) {
    return { relevant: false, reason: 'off_topic' };
  }

  // Cek keyword relevan
  const relevantMatch = RELEVANT_KEYWORDS.find(kw => lower.includes(kw));
  if (relevantMatch) {
    return { relevant: true, reason: 'keyword_match' };
  }

  // Pesan pendek (< 10 kata) yang tidak match keyword apapun → anggap off-topic
  const wordCount = message.trim().split(/\s+/).length;
  if (wordCount < 4) {
    return { relevant: false, reason: 'too_short_no_match' };
  }

  // Default: anggap relevan kalau tidak jelas off-topic
  // Lebih baik false negative (jawab yang tidak perlu) daripada false positive (tolak yang valid)
  return { relevant: true, reason: 'default_allow' };
};

/**
 * Template response untuk pertanyaan di luar topik.
 * Tidak memanggil AI sama sekali — 0 token.
 */
export const getOffTopicResponse = (library) => ({
  message: `Maaf, saya hanya bisa membantu seputar instalasi dan konfigurasi graphics library${library?.name ? ` (${library.name})` : ''}.

Topik yang bisa saya bantu:
- 📦 Instalasi library (OpenGL, Vulkan, DirectX)
- ⚙️ Compile & build errors
- 🔗 Linking issues
- 🛣️ Setup PATH & environment variables
- 🔧 CMake configuration
- 🎮 GPU driver & graphics troubleshooting

Silakan tanyakan masalah yang berkaitan dengan topik di atas! 😊`,
  suggestions: [
    'Bagaimana cara install OpenGL di Windows?',
    'Error saat compile, apa yang harus dilakukan?',
    'Bagaimana setup environment variables?',
    'CMake tidak bisa find library',
  ],
  offTopic: true,
});

// ============================================
// MAIN AI RESPONSE GENERATOR
// ============================================

export const generateAIResponse = (message, context = {}) => {
  const lowerMessage = message.toLowerCase();
  const { deviceSpecs, library } = context;

  // ── FILTER: cek topik sebelum proses ──
  const topicCheck = checkTopicRelevance(message);
  if (!topicCheck.relevant) {
    return getOffTopicResponse(library);
  }

  // ── Rule-based responses (dummy AI) ──
  // Nanti ganti dengan actual AI API call

  // Error handling responses
  if (lowerMessage.includes('error') || lowerMessage.includes('gagal') || lowerMessage.includes('failed')) {
    return {
      message: `Untuk mengatasi error instalasi ${library?.name || 'library'}:

1. **Pastikan semua dependencies sudah terinstall**
   - Cek apakah package manager sudah terinstall (vcpkg/apt/brew)
   - Verify semua required libraries sudah didownload

2. **Check compiler version compatibility**
   - Pastikan compiler (GCC/MSVC/Clang) versi terbaru
   - Verify compiler ada di PATH environment

3. **Verify environment variables**
   - Check PATH sudah include library directories
   - Verify INCLUDE dan LIB paths sudah benar

4. **Try running as administrator**
   - Windows: Run Command Prompt as Administrator
   - Linux/macOS: Gunakan sudo untuk install commands

Bisa share error message lengkapnya untuk analisis lebih detail? 🔍`,
      suggestions: [
        'Cek versi compiler dengan: gcc --version atau cl',
        'Verify PATH dengan: echo %PATH% (Windows) atau echo $PATH (Linux/macOS)',
        'Coba reinstall dependencies',
        'Check log file untuk detail error'
      ]
    };
  }

  // Compile issues
  if (lowerMessage.includes('compile') || lowerMessage.includes('build') || lowerMessage.includes('kompilasi')) {
    return {
      message: `Tips untuk compile ${library?.name || 'project'} di ${deviceSpecs?.os || 'sistem Anda'}:

1. **Pastikan include paths sudah benar**
   - Gunakan flag -I untuk specify include directory
   - Contoh: -I/usr/include atau -IC:/vcpkg/installed/x64-windows/include

2. **Link semua required libraries**
   - Gunakan flag -L untuk library path dan -l untuk library name
   - Contoh: -L/usr/lib -lglfw -lGLEW -lGL

3. **Check compiler flags**
   - Pastikan menggunakan C++ standard yang sesuai: -std=c++11
   - Enable warnings: -Wall -Wextra

4. **Verify library versions compatibility**
   - Pastikan semua libraries compatible dengan compiler Anda

💡 **Recommended:** Gunakan CMake untuk manage compile process secara otomatis!`,
      suggestions: [
        'Gunakan pkg-config untuk auto-detect paths',
        'Coba compile dengan verbose flag: -v',
        'Check CMakeLists.txt configuration',
        'Verify semua .lib/.a files ada di library path'
      ]
    };
  }

  // Linking errors
  if (lowerMessage.includes('link') || lowerMessage.includes('undefined reference') || lowerMessage.includes('unresolved external')) {
    return {
      message: `Linking error biasanya terjadi karena:

1. **Library tidak ditemukan**
   - Pastikan library path sudah benar dengan flag -L
   - Verify file .lib (Windows) atau .a/.so (Linux) ada

2. **Library name salah**
   - Check nama library yang di-link dengan flag -l
   - Contoh: -lglfw3 bukan -lglfw (tergantung sistem)

3. **Urutan linking salah**
   - Dependencies harus di-link sesuai urutan
   - Contoh: -lglfw -lGLEW -lGL (bukan sebaliknya)

4. **Architecture mismatch**
   - Pastikan compile untuk architecture yang sama (x64/x86)
   - Check library juga untuk architecture yang sama`,
      suggestions: [
        'List semua .lib files di library directory',
        'Coba link dengan absolute path',
        'Verify architecture dengan: file libname.a (Linux)',
        'Check linker output dengan verbose flag'
      ]
    };
  }

  // GPU/Graphics specific
  if (lowerMessage.includes('vulkan') || lowerMessage.includes('opengl') || lowerMessage.includes('gpu') || lowerMessage.includes('graphics') || lowerMessage.includes('grafis') || lowerMessage.includes('driver')) {
    return {
      message: `Untuk instalasi graphics library di sistem Anda:

**Device Info:**
- GPU: ${deviceSpecs?.gpu || 'Not specified'}
- OS: ${deviceSpecs?.os || 'Not specified'}
- CPU: ${deviceSpecs?.cpu || 'Not specified'}

**Checklist:**
1. ✅ Update GPU drivers ke versi terbaru
   - NVIDIA: GeForce Experience atau nvidia.com
   - AMD: AMD Software atau amd.com
   - Intel: Intel Driver & Support Assistant

2. ✅ Verify GPU support untuk API yang dipilih
   - OpenGL: Hampir semua GPU modern support
   - Vulkan: Check di vulkan.gpuinfo.org

3. ✅ Install SDK yang sesuai dengan OS
   - Windows: Download dari official website
   - Linux: Install via package manager
   - macOS: Install via Homebrew

4. ✅ Set environment variables dengan benar
   - Add SDK bin directory ke PATH
   - Set VULKAN_SDK (untuk Vulkan)`,
      suggestions: [
        'Check GPU capabilities dengan GPU-Z atau vulkaninfo',
        'Verify driver version support API yang digunakan',
        'Test dengan simple example code dulu',
        'Check system requirements library'
      ]
    };
  }

  // Path/Environment issues
  if (lowerMessage.includes('path') || lowerMessage.includes('environment') || lowerMessage.includes('not found') || lowerMessage.includes('tidak ditemukan')) {
    return {
      message: `Untuk setup PATH dan environment variables:

**Windows:**
1. Buka "System Properties" → "Environment Variables"
2. Edit "Path" di System Variables
3. Tambahkan directory library (contoh: C:\\vcpkg\\installed\\x64-windows\\bin)
4. Restart terminal/IDE setelah perubahan

**Linux/macOS:**
1. Edit ~/.bashrc atau ~/.zshrc
2. Tambahkan: export PATH="/usr/local/lib:$PATH"
3. Reload dengan: source ~/.bashrc
4. Verify dengan: echo $PATH

**Tips:**
- Gunakan absolute path, bukan relative
- Pisahkan multiple paths dengan ; (Windows) atau : (Linux/macOS)
- Restart aplikasi setelah ubah environment variables`,
      suggestions: [
        'Verify PATH dengan: echo %PATH% atau echo $PATH',
        'Check apakah directory benar-benar ada',
        'Coba run command dengan absolute path dulu',
        'Restart terminal setelah ubah environment'
      ]
    };
  }

  // CMake issues
  if (lowerMessage.includes('cmake')) {
    return {
      message: `Tips untuk CMake configuration:

1. **Install CMake**
   - Download dari cmake.org
   - Atau install via package manager

2. **Basic CMake workflow**
   \`\`\`
   mkdir build
   cd build
   cmake ..
   cmake --build .
   \`\`\`

3. **Specify toolchain (untuk vcpkg)**
   \`\`\`
   cmake .. -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake
   \`\`\`

4. **Common CMake options**
   - -G "Visual Studio 17 2022" (specify generator)
   - -DCMAKE_BUILD_TYPE=Release (build type)
   - -A x64 (architecture)`,
      suggestions: [
        'Check CMakeLists.txt syntax',
        'Verify find_package() untuk semua dependencies',
        'Gunakan cmake --help untuk list generators',
        'Enable verbose: cmake --build . --verbose'
      ]
    };
  }

  // Install / setup general
  if (lowerMessage.includes('install') || lowerMessage.includes('instalasi') || lowerMessage.includes('setup') || lowerMessage.includes('download')) {
    return {
      message: `Panduan instalasi ${library?.name || 'library'} di ${deviceSpecs?.os || 'sistem Anda'}:

1. **Pilih package manager yang sesuai OS**
   - Windows: vcpkg atau manual download
   - Linux: apt-get / pacman / dnf
   - macOS: Homebrew

2. **Install dependencies terlebih dahulu**
   - Pastikan compiler sudah terinstall
   - Install semua library yang dibutuhkan

3. **Ikuti installation commands yang sudah digenerate**
   - Jalankan sesuai urutan
   - Pastikan ada akses administrator/sudo

4. **Verifikasi instalasi**
   - Coba compile contoh kode sederhana
   - Pastikan tidak ada error

Sudah generate installation commands? Kalau belum, pilih library dan isi device specs di tab Setup! 📋`,
      suggestions: [
        `Cara install ${library?.name || 'library'} di Windows?`,
        'Apa saja dependencies yang dibutuhkan?',
        'Bagaimana verifikasi instalasi berhasil?',
        'Error saat install, apa yang harus dilakukan?'
      ]
    };
  }

  // Default response — masih relevan tapi tidak match keyword spesifik
  return {
    message: `Halo! Saya siap membantu dengan instalasi ${library?.name || 'library'} Anda.

Untuk pertanyaan lebih spesifik, coba jelaskan:
- 🐛 Error message yang muncul (jika ada)
- 📝 Step yang sudah dilakukan
- 💻 OS dan compiler yang digunakan
- 🎯 Apa yang ingin dicapai

**Topik yang bisa saya bantu:**
- Installation steps dan dependencies
- Compile errors dan linking issues
- Library configuration dan setup
- Environment variables dan PATH setup
- CMake configuration
- GPU/Graphics API troubleshooting

Silakan tanyakan masalah spesifik Anda! 😊`,
    suggestions: [
      'Bagaimana cara install ' + (library?.name || 'library') + '?',
      'Error saat compile, apa yang harus dilakukan?',
      'Bagaimana setup environment variables?',
      'CMake tidak bisa find library'
    ]
  };
};

// ============================================
// Untuk integrasi AI API nanti (OpenAI/Gemini)
// Panggil checkTopicRelevance() SEBELUM kirim ke API
// ============================================

/*
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateAIResponseWithOpenAI = async (message, context = {}) => {
  // Filter dulu — kalau off-topic, tidak perlu panggil API
  const topicCheck = checkTopicRelevance(message);
  if (!topicCheck.relevant) {
    return getOffTopicResponse(context.library);
  }

  const systemPrompt = `You are an expert installation assistant for graphics libraries like OpenGL, Vulkan, and DirectX.
Help users troubleshoot installation issues, compile errors, and configuration problems.
Be concise, practical, and provide step-by-step solutions.
If the user asks something unrelated to library installation or graphics programming, politely redirect them.

User context:
- OS: ${context.deviceSpecs?.os || 'Unknown'}
- CPU: ${context.deviceSpecs?.cpu || 'Unknown'}
- GPU: ${context.deviceSpecs?.gpu || 'Unknown'}
- Library: ${context.library?.name || 'Unknown'}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // lebih hemat dari gpt-4
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return {
    message: completion.choices[0].message.content,
    suggestions: []
  };
};
*/
