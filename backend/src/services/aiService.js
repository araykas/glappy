// AI Service dengan dummy responses
// Nanti bisa diintegrasikan dengan OpenAI, Gemini, atau AI lainnya

export const generateAIResponse = (message, context = {}) => {
  const lowerMessage = message.toLowerCase();
  const { deviceSpecs, library } = context;

  // Rule-based responses (dummy AI)
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
  if (lowerMessage.includes('compile') || lowerMessage.includes('build')) {
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
  if (lowerMessage.includes('vulkan') || lowerMessage.includes('opengl') || lowerMessage.includes('gpu') || lowerMessage.includes('graphics')) {
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
  if (lowerMessage.includes('path') || lowerMessage.includes('environment') || lowerMessage.includes('not found')) {
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

  // Default response
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

// Function untuk integrate dengan actual AI API (OpenAI/Gemini)
// Uncomment dan configure saat siap implementasi

/*
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateAIResponseWithOpenAI = async (message, context = {}) => {
  const systemPrompt = `You are an expert installation assistant for graphics libraries like OpenGL, Vulkan, and DirectX.
Help users troubleshoot installation issues, compile errors, and configuration problems.
Be concise, practical, and provide step-by-step solutions.

User context:
- OS: ${context.deviceSpecs?.os || 'Unknown'}
- CPU: ${context.deviceSpecs?.cpu || 'Unknown'}
- GPU: ${context.deviceSpecs?.gpu || 'Unknown'}
- Library: ${context.library?.name || 'Unknown'}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
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
