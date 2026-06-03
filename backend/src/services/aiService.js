import Groq from 'groq-sdk';

// ============================================
// GROQ CLIENT
// ============================================

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

export const isGroqConfigured = () => groq !== null;

// ============================================
// TOPIC FILTER
// Cek relevansi sebelum panggil AI API
// ============================================

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
  'gpu', 'graphics', 'grafis', 'driver', 'shader', 'render',
  // OS
  'windows', 'linux', 'macos', 'ubuntu', 'debian',
  // Headers & includes
  'include', 'header', '.h', 'dependency', 'dependencies',
  // General programming
  'code', 'kode', 'program', 'project', 'proyek', 'cpp', 'c++',
  // Cara / how-to (penting untuk pertanyaan "cara X")
  'cara', 'bagaimana', 'how', 'tanpa', 'without', 'alternatif', 'alternative',
  'manual', 'langkah', 'step', 'tutorial', 'panduan', 'guide',
  // Pertanyaan "selain X", "pengganti X", "bisa tanpa X"
  'selain', 'pengganti', 'bisa', 'pakai', 'gunakan', 'metode', 'method',
  // Verifikasi / cek
  'cek', 'check', 'verify', 'test', 'verifikasi',
  // Tambahan tools
  'nuget', 'conan', 'meson', 'ninja', 'make',
];

const IRRELEVANT_KEYWORDS = [
  'makan', 'minum', 'masak', 'resep', 'makanan', 'minuman', 'restoran', 'warung',
  'film', 'movie', 'musik', 'lagu', 'drama', 'anime',
  'politik', 'berita', 'news', 'artis', 'selebritis', 'gosip',
  'cuaca', 'weather', 'hujan',
  'bola', 'sepakbola', 'basket', 'olahraga', 'sport',
  'saham', 'crypto', 'bitcoin', 'investasi', 'trading',
  'sakit', 'obat', 'dokter', 'rumah sakit',
];

export const checkTopicRelevance = (message) => {
  const lower = message.toLowerCase();

  const irrelevantMatch = IRRELEVANT_KEYWORDS.find(kw => lower.includes(kw));
  if (irrelevantMatch) return { relevant: false, reason: 'off_topic' };

  const relevantMatch = RELEVANT_KEYWORDS.find(kw => lower.includes(kw));
  if (relevantMatch) return { relevant: true, reason: 'keyword_match' };

  const wordCount = message.trim().split(/\s+/).length;
  if (wordCount < 4) return { relevant: false, reason: 'too_short_no_match' };

  return { relevant: true, reason: 'default_allow' };
};

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
// GROQ AI RESPONSE
// ============================================

const SYSTEM_PROMPT = `Kamu adalah AI assistant ahli untuk membantu instalasi dan troubleshooting graphics library seperti OpenGL, Vulkan, dan DirectX.

Tugas kamu:
- Bantu user mengatasi error instalasi, compile error, linking error
- Jelaskan cara setup environment variables dan PATH
- Bantu konfigurasi CMake dan build system
- Berikan solusi step-by-step yang praktis dan jelas
- Jawab pertanyaan tentang cara alternatif instalasi — termasuk "tanpa vcpkg", "tanpa package manager", "cara manual", "selain vcpkg", dll. Ini TETAP topik instalasi library yang valid.
- Jika user bertanya tentang alternatif dari tools yang ada di "Commands yang sudah ditampilkan", berikan alternatif konkret yang spesifik
- Jawab dalam Bahasa Indonesia

PENTING:
- Pertanyaan seperti "bisa instalasi OpenGL tanpa vcpkg?", "cara manual install GLFW", "alternatif selain vcpkg" adalah TOPIK VALID — jawab dengan lengkap dan spesifik.
- Jika konteks menyebutkan commands yang sudah ditampilkan ke user (berisi vcpkg, apt, brew, dll), gunakan informasi itu untuk memberikan jawaban relevan — misalnya cara manual tanpa package manager tersebut.
- JANGAN tolak pertanyaan yang masih berkaitan dengan instalasi, setup, atau konfigurasi graphics library meskipun menggunakan kata "tanpa", "alternatif", "selain", "manual", atau "without".
- SANGAT PENTING: Selalu perhatikan OS user dari konteks. Jika OS adalah Windows, HANYA berikan instruksi Windows — jangan sertakan instruksi Linux/macOS kecuali user secara eksplisit meminta. Begitu juga sebaliknya.

Format jawaban:
- Gunakan numbering untuk langkah-langkah
- Gunakan bold (**teks**) untuk highlight poin penting
- Sertakan contoh command yang bisa langsung dipakai
- Maksimal 400 kata agar tidak terlalu panjang

Tolak dengan sopan HANYA jika pertanyaan benar-benar tidak ada hubungannya dengan instalasi library, graphics programming, build system, atau C/C++ development (contoh: resep masakan, cuaca, berita politik).`;

export const generateAIResponseWithGroq = async (message, context = {}) => {
  const { deviceSpecs, library, generatedCommands } = context;

  const userContext = [
    deviceSpecs?.os        ? `OS: ${deviceSpecs.os}${deviceSpecs.osVersion ? ` ${deviceSpecs.osVersion}` : ''}` : null,
    deviceSpecs?.cpu       ? `CPU: ${deviceSpecs.cpu}`       : null,
    deviceSpecs?.gpu       ? `GPU: ${deviceSpecs.gpu}`       : null,
    deviceSpecs?.ram       ? `RAM: ${deviceSpecs.ram}`       : null,
    deviceSpecs?.compiler  ? `Compiler: ${deviceSpecs.compiler}` : null,
    deviceSpecs?.ide       ? `IDE: ${deviceSpecs.ide}`       : null,
    library?.name          ? `Library yang dipilih: ${library.name}` : null,
  ].filter(Boolean).join('\n');

  // Sertakan ringkasan commands yang sudah di-generate agar AI tahu konteks penuh
  const commandsSummary = generatedCommands?.length
    ? `\n\n[Commands instalasi yang sudah ditampilkan ke user — gunakan ini sebagai referensi jika user tanya tentang alternatif atau modifikasi dari commands ini]\n${generatedCommands.map(c => `- ${c.title}\n  Command: ${c.command.split('\n')[0]}${c.command.includes('\n') ? ' ...' : ''}`).join('\n')}`
    : '';

  const fullMessage = userContext
    ? `[Konteks device user]\n${userContext}${commandsSummary}\n\n[Pertanyaan]\n${message}`
    : message;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: fullMessage },
    ],
    temperature: 0.5,
    max_tokens: 600,
  });

  const aiText = completion.choices[0]?.message?.content || 'Maaf, tidak ada respons dari AI.';

  return {
    message: aiText,
    suggestions: generateSuggestions(message, library),
  };
};

// Buat suggestion chips kontekstual berdasarkan pesan user
const generateSuggestions = (message, library) => {
  const lower = message.toLowerCase();
  const libName = library?.name || 'library';

  if (lower.includes('error') || lower.includes('gagal')) {
    return [
      'Apa arti error message ini?',
      'Bagaimana cara fix linking error?',
      'Cek versi compiler yang kompatibel',
    ];
  }
  if (lower.includes('compile') || lower.includes('build')) {
    return [
      'Bagaimana cara compile dengan CMake?',
      'Flag compiler apa yang dibutuhkan?',
      'Cara debug compile error',
    ];
  }
  if (lower.includes('path') || lower.includes('not found')) {
    return [
      'Cara set PATH di Windows',
      'Cara set PATH di Linux/macOS',
      'Verify instalasi berhasil',
    ];
  }
  return [
    `Cara install ${libName} di Windows`,
    `Error saat compile ${libName}`,
    'Setup CMake untuk project baru',
  ];
};

// ============================================
// MAIN ENTRY POINT
// Dipanggil dari aiController
// ============================================

export const generateAIResponse = async (message, context = {}) => {
  // 1. Filter topik dulu — 0 token kalau off-topic
  const topicCheck = checkTopicRelevance(message);
  if (!topicCheck.relevant) {
    return getOffTopicResponse(context.library);
  }

  // 2. Kalau Groq sudah dikonfigurasi, pakai AI beneran
  if (isGroqConfigured()) {
    try {
      return await generateAIResponseWithGroq(message, context);
    } catch (err) {
      console.error('Groq API error:', err.message);
      // Fallback ke rule-based kalau Groq error (rate limit, dll)
      return getRuleBasedResponse(message, context);
    }
  }

  // 3. Fallback: rule-based kalau API key belum diset
  console.warn('⚠️  GROQ_API_KEY not set, using rule-based fallback');
  return getRuleBasedResponse(message, context);
};

// ============================================
// RULE-BASED FALLBACK
// Dipakai kalau Groq belum dikonfigurasi atau error
// ============================================

const getRuleBasedResponse = (message, context = {}) => {
  const lower = message.toLowerCase();
  const { deviceSpecs, library } = context;

  // Deteksi pertanyaan "tanpa vcpkg" / "alternatif package manager"
  if ((lower.includes('tanpa') || lower.includes('without') || lower.includes('alternatif') || lower.includes('selain')) &&
      (lower.includes('vcpkg') || lower.includes('apt') || lower.includes('brew') || lower.includes('package'))) {
    const os = deviceSpecs?.os?.toLowerCase() || '';
    const isWindows = os.includes('windows') || os === '';
    const isLinux = os.includes('linux') || os.includes('ubuntu') || os.includes('debian');
    const isMac = os.includes('mac');
    const compiler = deviceSpecs?.compiler?.toLowerCase() || '';
    const isMSVC = compiler.includes('msvc') || compiler.includes('visual studio');

    let manualSteps = '';

    if (isWindows) {
      if (isMSVC) {
        manualSteps = `**Cara manual install OpenGL/GLFW/GLEW di Windows (Visual Studio):**

1. **Download library dari official site**
   - GLFW: https://www.glfw.org/download.html → pilih **Windows pre-compiled binaries**
   - GLEW: http://glew.sourceforge.net/ → pilih **Windows 32/64-bit**
   - Extract ke folder, contoh: \`C:\\libs\\glfw\`, \`C:\\libs\\glew\`

2. **Setup di Visual Studio**
   - Project Properties → C/C++ → General → **Additional Include Directories**
     Tambahkan: \`C:\\libs\\glfw\\include;C:\\libs\\glew\\include\`
   - Linker → General → **Additional Library Directories**
     Tambahkan: \`C:\\libs\\glfw\\lib-vc2022;C:\\libs\\glew\\lib\\Release\\x64\`
   - Linker → Input → **Additional Dependencies**
     Tambahkan: \`glfw3.lib;glew32.lib;opengl32.lib\`

3. **Copy DLL ke folder project**
   - Copy \`glew32.dll\` dari \`C:\\libs\\glew\\bin\\Release\\x64\\` ke folder executable

4. **Build & run project**`;
      } else {
        manualSteps = `**Cara manual install OpenGL/GLFW/GLEW di Windows (MinGW/GCC):**

1. **Download library dari official site**
   - GLFW: https://www.glfw.org/download.html → pilih **Windows pre-compiled binaries**
   - GLEW: http://glew.sourceforge.net/ → pilih **Windows 32/64-bit**
   - Extract ke folder, contoh: \`C:\\libs\\glfw\`, \`C:\\libs\\glew\`

2. **Compile dengan flag manual**
   \`\`\`
g++ main.cpp -I C:/libs/glfw/include -I C:/libs/glew/include -L C:/libs/glfw/lib-mingw-w64 -L C:/libs/glew/lib/Release/x64 -lglfw3 -lglew32 -lopengl32 -lgdi32 -o app
   \`\`\`

3. **Copy DLL ke folder project**
   - Copy \`glew32.dll\` dari \`C:\\libs\\glew\\bin\\Release\\x64\\` ke folder executable

4. **Jalankan program**
   \`\`\`
app.exe
   \`\`\``;
      }
    } else if (isLinux) {
      manualSteps = `**Cara manual install OpenGL/GLFW/GLEW di Linux:**

1. **Install via package manager distro**
   \`\`\`bash
sudo apt install libglfw3-dev libglew-dev libgl1-mesa-dev
   \`\`\`

2. **Atau build dari source**
   \`\`\`bash
git clone https://github.com/glfw/glfw.git
cd glfw && cmake . && make && sudo make install
   \`\`\`

3. **Compile project**
   \`\`\`bash
g++ main.cpp -lglfw -lGLEW -lGL -o app
   \`\`\``;
    } else if (isMac) {
      manualSteps = `**Cara manual install OpenGL/GLFW/GLEW di macOS:**

1. **Install via Homebrew (tanpa vcpkg)**
   \`\`\`bash
brew install glfw glew
   \`\`\`

2. **Compile project**
   \`\`\`bash
g++ main.cpp -lglfw -lGLEW -framework OpenGL -o app
   \`\`\``;
    }

    return {
      message: `Ya, bisa banget install **tanpa vcpkg**! 💪

${manualSteps}

💡 **Tips:** Setelah setup, gunakan CMake agar path otomatis terdeteksi tanpa perlu set manual tiap project baru.`,
      suggestions: [
        'Bagaimana setup PATH untuk DLL?',
        'Error "cannot open file glfw3.lib"',
        'Cara compile dengan CMake tanpa vcpkg',
      ],
    };
  }

  if (lower.includes('error') || lower.includes('gagal') || lower.includes('failed')) {
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
        'Cek versi compiler dengan: gcc --version',
        'Verify PATH dengan: echo %PATH%',
        'Coba reinstall dependencies',
        'Check log file untuk detail error',
      ],
    };
  }

  if (lower.includes('compile') || lower.includes('build') || lower.includes('kompilasi')) {
    const compilerHint = deviceSpecs?.compiler
      ? deviceSpecs.compiler.toLowerCase().includes('msvc') || deviceSpecs.compiler.toLowerCase().includes('visual studio')
        ? 'MSVC (Visual Studio)'
        : deviceSpecs.compiler.toLowerCase().includes('clang')
          ? 'Clang'
          : 'GCC/MinGW'
      : 'GCC';

    const compilerBin = compilerHint === 'Clang' ? 'clang++' : compilerHint === 'MSVC (Visual Studio)' ? 'cl.exe' : 'g++';

    return {
      message: `Tips compile ${library?.name || 'project'} di ${deviceSpecs?.os || 'sistem Anda'} dengan **${compilerHint}**:

1. **Pastikan include paths sudah benar** — flag \`-I\`
2. **Link semua required libraries** — flag \`-L\` dan \`-l\`
3. **Check compiler flags** — gunakan \`-std=c++11\`
4. **Gunakan CMake** untuk manage compile secara otomatis

💡 Contoh dengan ${compilerHint}: \`${compilerBin} src/main.cpp -o app -lglfw -lGLEW -lGL\``,
      suggestions: [
        'Gunakan pkg-config untuk auto-detect paths',
        `Coba compile dengan verbose flag: ${compilerBin} -v`,
        'Check CMakeLists.txt configuration',
      ],
    };
  }

  if (lower.includes('link') || lower.includes('undefined reference') || lower.includes('unresolved')) {
    return {
      message: `Linking error biasanya karena:

1. **Library tidak ditemukan** — pastikan path \`-L\` benar
2. **Library name salah** — cek nama dengan \`-l\`
3. **Urutan linking salah** — dependencies harus urut
4. **Architecture mismatch** — pastikan x64/x86 konsisten`,
      suggestions: [
        'List .lib files di library directory',
        'Coba link dengan absolute path',
        'Verify architecture library',
      ],
    };
  }

  if (lower.includes('cmake')) {
    return {
      message: `CMake workflow dasar:

\`\`\`
mkdir build && cd build
cmake ..
cmake --build .
\`\`\`

Untuk vcpkg:
\`\`\`
cmake .. -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake
\`\`\``,
      suggestions: [
        'Check CMakeLists.txt syntax',
        'Verify find_package() dependencies',
        'Enable verbose: cmake --build . --verbose',
      ],
    };
  }

  if (lower.includes('path') || lower.includes('not found') || lower.includes('tidak ditemukan')) {
    return {
      message: `Setup PATH:

**Windows:** System Properties → Environment Variables → edit Path
**Linux/macOS:** tambahkan \`export PATH="/usr/local/lib:$PATH"\` ke \`~/.bashrc\`

Restart terminal setelah perubahan.`,
      suggestions: [
        'Verify: echo %PATH% (Windows)',
        'Verify: echo $PATH (Linux/macOS)',
        'Restart terminal setelah ubah env',
      ],
    };
  }

  return {
    message: `Halo! Saya siap membantu instalasi ${library?.name || 'library'}.

Topik yang bisa saya bantu:
- 📦 Instalasi & dependencies (dengan/tanpa package manager)
- ⚙️ Compile & build errors
- 🔗 Linking issues
- 🛣️ PATH & environment variables
- 🔧 CMake configuration

Jelaskan masalah Anda secara detail! 😊`,
    suggestions: [
      `Cara install ${library?.name || 'library'}?`,
      'Error saat compile',
      'Setup environment variables',
      'CMake tidak bisa find library',
    ],
  };
};
