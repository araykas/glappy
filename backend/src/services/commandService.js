// Service untuk generate installation commands berdasarkan library dan device specs

// ─── Helper: deteksi compiler family ─────────────────────────────────────────
const getCompilerFamily = (compiler = '') => {
  const c = compiler.toLowerCase();
  if (c === 'msvc' || c.includes('visual studio') || c.includes('cl.exe')) return 'msvc';
  if (c === 'clang' || c === 'clang-windows' || c.includes('clang')) return 'clang';
  if (c === 'gcc-mingw' || c.includes('mingw')) return 'mingw';
  if (c === 'gcc' || c.includes('gcc') || c.includes('g++')) return 'gcc';
  return 'gcc'; // default fallback
};

// ─── Helper: deteksi GPU vendor ──────────────────────────────────────────────
const getGpuVendor = (gpu = '') => {
  const g = gpu.toLowerCase();
  if (g.includes('nvidia') || g.includes('rtx') || g.includes('gtx') || g.includes('quadro')) return 'nvidia';
  if (g.includes('amd') || g.includes('radeon') || g.includes('rx ')) return 'amd';
  if (g.includes('intel') || g.includes('iris') || g.includes('uhd') || g.includes('hd graphics')) return 'intel';
  return 'unknown';
};

// ─── Helper: deteksi apakah macOS ARM (Apple Silicon) ────────────────────────
const isMacArm = (cpu = '', osVersion = '') => {
  const c = cpu.toLowerCase();
  const v = osVersion.toLowerCase();
  return c.includes('m1') || c.includes('m2') || c.includes('m3') || c.includes('m4') ||
    c.includes('apple') || v.includes('arm') || v.includes('apple silicon');
};

// ─── Helper: deteksi RAM dalam GB ────────────────────────────────────────────
const getRamGb = (ram = '') => {
  const match = ram.match(/(\d+)/);
  return match ? parseInt(match[1]) : 8;
};

export const generateInstallationCommands = (libraryId, deviceSpecs) => {
  if (libraryId === 'opengl') {
    return generateOpenGLCommands(deviceSpecs);
  }
  throw new Error(`Library '${libraryId}' not supported yet`);
};

const generateOpenGLCommands = (deviceSpecs) => {
  const { os, osVersion = '', cpu = '', gpu = '', ram = '', compiler = '' } = deviceSpecs;
  const compilerFamily = getCompilerFamily(compiler);
  const gpuVendor = getGpuVendor(gpu);
  const ramGb = getRamGb(ram);
  const isArm = os === 'macos' && isMacArm(cpu, osVersion);

  // Warning RAM rendah
  const lowRamNote = ramGb < 4
    ? ' ⚠️ RAM kamu < 4GB, proses build mungkin lambat atau gagal. Tutup aplikasi lain dulu.'
    : '';

  let commands = [];

  // ── WINDOWS ──────────────────────────────────────────────────────────────
  if (os === 'windows') {
    if (compilerFamily === 'msvc') {
      // MSVC / Visual Studio
      commands = [
        {
          title: '1. Install vcpkg (Package Manager)',
          command: 'git clone https://github.com/Microsoft/vcpkg.git C:\\vcpkg\ncd C:\\vcpkg\n.\\bootstrap-vcpkg.bat',
          description: 'Install vcpkg untuk manage dependencies dengan MSVC',
          category: 'setup'
        },
        {
          title: '2. Integrate vcpkg dengan Visual Studio',
          command: 'C:\\vcpkg\\vcpkg integrate install',
          description: 'Auto-detect libraries di semua project Visual Studio',
          category: 'configuration'
        },
        {
          title: '3. Install GLEW',
          command: 'C:\\vcpkg\\vcpkg install glew:x64-windows',
          description: 'Install OpenGL Extension Wrangler Library',
          category: 'dependencies'
        },
        {
          title: '4. Install GLFW',
          command: 'C:\\vcpkg\\vcpkg install glfw3:x64-windows',
          description: 'Install windowing library',
          category: 'dependencies'
        },
        {
          title: '5. Build dengan CMake + MSVC (Recommended)',
          command: 'mkdir build\ncd build\ncmake .. -G "Visual Studio 17 2022" -A x64 -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake\ncmake --build . --config Release',
          description: `Build menggunakan MSVC (Visual Studio). ${lowRamNote}`,
          category: 'compile'
        },
        {
          title: '6. Atau: Build langsung dari Visual Studio',
          command: '# Buka .sln file di Visual Studio\n# Klik Build → Build Solution (Ctrl+Shift+B)',
          description: 'Setelah vcpkg integrate, tinggal build dari IDE',
          category: 'compile'
        }
      ];
    } else if (compilerFamily === 'clang') {
      // Clang on Windows (LLVM)
      commands = [
        {
          title: '1. Install LLVM/Clang',
          command: 'winget install LLVM.LLVM',
          description: 'Install Clang compiler via winget',
          category: 'setup'
        },
        {
          title: '2. Install vcpkg',
          command: 'git clone https://github.com/Microsoft/vcpkg.git C:\\vcpkg\ncd C:\\vcpkg\n.\\bootstrap-vcpkg.bat',
          description: 'Install vcpkg untuk manage dependencies',
          category: 'setup'
        },
        {
          title: '3. Install GLEW & GLFW',
          command: 'C:\\vcpkg\\vcpkg install glew:x64-windows glfw3:x64-windows',
          description: 'Install kedua library sekaligus',
          category: 'dependencies'
        },
        {
          title: '4. Compile dengan Clang',
          command: 'clang++ src/main.cpp -o app.exe -IC:/vcpkg/installed/x64-windows/include -LC:/vcpkg/installed/x64-windows/lib -lglfw3 -lglew32 -lopengl32 -lgdi32',
          description: `Compile menggunakan Clang. ${lowRamNote}`,
          category: 'compile'
        },
        {
          title: '5. Build dengan CMake + Clang',
          command: 'mkdir build\ncd build\ncmake .. -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake\ncmake --build .',
          description: 'Build menggunakan CMake dengan Clang',
          category: 'compile'
        }
      ];
    } else {
      // GCC / MinGW (default Windows)
      commands = [
        {
          title: '1. Install MinGW-w64 (jika belum)',
          command: 'winget install MinGW.MinGW\n# Atau download dari: https://www.mingw-w64.org/downloads/',
          description: 'Install GCC/MinGW compiler untuk Windows',
          category: 'setup'
        },
        {
          title: '2. Install vcpkg',
          command: 'git clone https://github.com/Microsoft/vcpkg.git C:\\vcpkg\ncd C:\\vcpkg\n.\\bootstrap-vcpkg.bat',
          description: 'Install vcpkg untuk manage dependencies',
          category: 'setup'
        },
        {
          title: '3. Install GLEW',
          command: 'C:\\vcpkg\\vcpkg install glew:x64-mingw-dynamic',
          description: 'Install GLEW untuk MinGW',
          category: 'dependencies'
        },
        {
          title: '4. Install GLFW',
          command: 'C:\\vcpkg\\vcpkg install glfw3:x64-mingw-dynamic',
          description: 'Install GLFW untuk MinGW',
          category: 'dependencies'
        },
        {
          title: '5. Compile dengan GCC/MinGW',
          command: 'g++ src/main.cpp -o app.exe -IC:/vcpkg/installed/x64-mingw-dynamic/include -LC:/vcpkg/installed/x64-mingw-dynamic/lib -lglfw3 -lglew32 -lopengl32 -lgdi32',
          description: `Compile dengan GCC. ${lowRamNote}`,
          category: 'compile'
        },
        {
          title: '6. Build dengan CMake + MinGW (Recommended)',
          command: 'mkdir build\ncd build\ncmake .. -G "MinGW Makefiles" -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake\ncmake --build .',
          description: 'Build menggunakan CMake dengan MinGW Makefiles',
          category: 'compile'
        }
      ];
    }

    // Tambah note GPU untuk Windows
    if (gpuVendor === 'nvidia') {
      commands.push({
        title: '💡 Tips GPU NVIDIA',
        command: '# Pastikan driver NVIDIA terbaru terinstall\n# Download: https://www.nvidia.com/drivers\n# Cek versi OpenGL yang didukung:\n# nvidia-smi (di Command Prompt)',
        description: 'GPU NVIDIA terdeteksi — pastikan driver up-to-date untuk OpenGL terbaru',
        category: 'tips'
      });
    } else if (gpuVendor === 'amd') {
      commands.push({
        title: '💡 Tips GPU AMD',
        command: '# Pastikan driver AMD Adrenalin terbaru terinstall\n# Download: https://www.amd.com/support\n# AMD mendukung OpenGL 4.6 pada GPU modern',
        description: 'GPU AMD terdeteksi — install driver AMD Adrenalin untuk performa optimal',
        category: 'tips'
      });
    } else if (gpuVendor === 'intel') {
      commands.push({
        title: '💡 Tips GPU Intel (Integrated)',
        command: '# Update Intel Graphics Driver via Device Manager\n# Atau download dari: https://www.intel.com/content/www/us/en/download-center/home.html\n# Intel integrated GPU mendukung OpenGL 4.6 (Gen 9+)',
        description: 'GPU Intel integrated terdeteksi — OpenGL didukung tapi performa lebih terbatas dari dedicated GPU',
        category: 'tips'
      });
    }
  }

  // ── LINUX ─────────────────────────────────────────────────────────────────
  else if (os === 'linux') {
    // Deteksi distro dari osVersion
    const isArch = osVersion.toLowerCase().includes('arch') || osVersion.toLowerCase().includes('manjaro');
    const isFedora = osVersion.toLowerCase().includes('fedora') || osVersion.toLowerCase().includes('rhel') || osVersion.toLowerCase().includes('centos');

    const pkgInstall = isArch ? 'sudo pacman -S' : isFedora ? 'sudo dnf install' : 'sudo apt-get install';
    const pkgUpdate = isArch ? 'sudo pacman -Syu' : isFedora ? 'sudo dnf update' : 'sudo apt-get update';
    const glLibs = isArch
      ? 'mesa glew glfw-x11'
      : isFedora
        ? 'mesa-libGL-devel glew-devel glfw-devel'
        : 'libgl1-mesa-dev libglu1-mesa-dev libglew-dev libglfw3-dev';

    const compilerPkg = compilerFamily === 'clang'
      ? (isArch ? 'clang' : isFedora ? 'clang' : 'clang')
      : (isArch ? 'gcc' : isFedora ? 'gcc-c++' : 'build-essential');

    const compilerBin = compilerFamily === 'clang' ? 'clang++' : 'g++';

    commands = [
      {
        title: '1. Update Package Manager',
        command: pkgUpdate,
        description: `Update repository${isArch ? ' (Arch/Manjaro)' : isFedora ? ' (Fedora/RHEL)' : ' (Ubuntu/Debian)'}`,
        category: 'setup'
      },
      {
        title: `2. Install ${compilerFamily === 'clang' ? 'Clang' : 'GCC'} Compiler`,
        command: `${pkgInstall} ${compilerPkg}`,
        description: `Install compiler yang sesuai dengan pilihan kamu`,
        category: 'setup'
      },
      {
        title: '3. Install OpenGL + GLEW + GLFW',
        command: `${pkgInstall} ${glLibs}`,
        description: 'Install semua library OpenGL yang dibutuhkan',
        category: 'dependencies'
      },
      {
        title: `4. Compile dengan ${compilerFamily === 'clang' ? 'Clang' : 'GCC'} + pkg-config (Recommended)`,
        command: `${compilerBin} src/main.cpp -o app $(pkg-config --cflags --libs glfw3 glew) -lGL`,
        description: `pkg-config otomatis detect path library. ${lowRamNote}`,
        category: 'compile'
      },
      {
        title: '5. Compile dengan Path Manual',
        command: `${compilerBin} src/main.cpp -o app -I/usr/include -L/usr/lib/x86_64-linux-gnu -lglfw -lGLEW -lGL`,
        description: 'Compile dengan specify path manual jika pkg-config tidak tersedia',
        category: 'compile'
      },
      {
        title: `6. Build dengan CMake + ${compilerFamily === 'clang' ? 'Clang' : 'GCC'}`,
        command: `mkdir build\ncd build\ncmake .. -DCMAKE_CXX_COMPILER=${compilerBin}\ncmake --build .`,
        description: 'Build menggunakan CMake',
        category: 'compile'
      }
    ];

    // GPU tips Linux
    if (gpuVendor === 'nvidia') {
      commands.push({
        title: '💡 Tips GPU NVIDIA di Linux',
        command: isArch
          ? '# Install driver NVIDIA:\nsudo pacman -S nvidia nvidia-utils\n# Cek status:\nnvidia-smi'
          : isFedora
            ? '# Install driver NVIDIA:\nsudo dnf install akmod-nvidia\n# Cek status:\nnvidia-smi'
            : '# Install driver NVIDIA:\nsudo apt-get install nvidia-driver-535\n# Cek status:\nnvidia-smi',
        description: 'GPU NVIDIA terdeteksi — install proprietary driver untuk performa OpenGL optimal',
        category: 'tips'
      });
    } else if (gpuVendor === 'amd') {
      commands.push({
        title: '💡 Tips GPU AMD di Linux',
        command: '# AMD menggunakan driver open-source AMDGPU (sudah built-in kernel)\n# Pastikan Mesa terbaru:\n' + (isArch ? 'sudo pacman -S mesa lib32-mesa' : isFedora ? 'sudo dnf install mesa-dri-drivers' : 'sudo apt-get install mesa-vulkan-drivers'),
        description: 'GPU AMD terdeteksi — driver AMDGPU open-source sudah built-in, pastikan Mesa terbaru',
        category: 'tips'
      });
    }
  }

  // ── MACOS ─────────────────────────────────────────────────────────────────
  else if (os === 'macos') {
    // Path Homebrew beda antara ARM (Apple Silicon) dan Intel
    const brewPrefix = isArm ? '/opt/homebrew' : '/usr/local';
    const archNote = isArm ? '(Apple Silicon / ARM)' : '(Intel)';
    const compilerBin = compilerFamily === 'clang' ? 'clang++' : 'g++';

    commands = [
      {
        title: `1. Install Homebrew ${archNote}`,
        command: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
        description: `Install package manager untuk macOS ${archNote}. Homebrew akan otomatis install ke ${brewPrefix}`,
        category: 'setup'
      },
      ...(isArm ? [{
        title: '2. Tambah Homebrew ke PATH (Apple Silicon)',
        command: 'echo \'eval "$(/opt/homebrew/bin/brew shellenv)"\' >> ~/.zprofile\neval "$(/opt/homebrew/bin/brew shellenv)"',
        description: 'Apple Silicon menginstall Homebrew di /opt/homebrew, perlu ditambah ke PATH manual',
        category: 'configuration'
      }] : []),
      {
        title: `${isArm ? '3' : '2'}. Install GLEW`,
        command: 'brew install glew',
        description: 'Install GLEW library',
        category: 'dependencies'
      },
      {
        title: `${isArm ? '4' : '3'}. Install GLFW`,
        command: 'brew install glfw',
        description: 'Install GLFW library',
        category: 'dependencies'
      },
      {
        title: `${isArm ? '5' : '4'}. Compile dengan ${compilerFamily === 'clang' ? 'Clang' : 'GCC'} + Homebrew paths`,
        command: `${compilerBin} src/main.cpp -o app -I${brewPrefix}/include -L${brewPrefix}/lib -lglfw -lGLEW -framework OpenGL`,
        description: `Compile dengan path Homebrew ${archNote}. ${lowRamNote}`,
        category: 'compile'
      },
      {
        title: `${isArm ? '6' : '5'}. Compile dengan pkg-config`,
        command: `${compilerBin} src/main.cpp -o app $(pkg-config --cflags --libs glfw3 glew) -framework OpenGL`,
        description: 'Menggunakan pkg-config untuk auto-detect path',
        category: 'compile'
      },
      {
        title: `${isArm ? '7' : '6'}. Build dengan CMake`,
        command: `mkdir build\ncd build\ncmake .. -DCMAKE_CXX_COMPILER=${compilerBin} -DCMAKE_PREFIX_PATH=${brewPrefix}\ncmake --build .`,
        description: `Build menggunakan CMake ${archNote}`,
        category: 'compile'
      }
    ];

    // Apple Silicon note
    if (isArm) {
      commands.push({
        title: '💡 Catatan Apple Silicon (M1/M2/M3)',
        command: '# macOS pada Apple Silicon menggunakan Metal sebagai backend GPU\n# OpenGL masih didukung tapi deprecated sejak macOS 10.14\n# Untuk performa terbaik di Apple Silicon, pertimbangkan Metal atau MoltenVK\n# Cek arsitektur:\nuname -m  # output: arm64',
        description: 'Apple Silicon terdeteksi — OpenGL berjalan via compatibility layer, performa sedikit lebih rendah dari Intel Mac',
        category: 'tips'
      });
    }
  }

  return commands;
};

export const generateProjectStructure = (libraryId, deviceSpecs = {}) => {
  const { os = '' } = deviceSpecs;

  if (libraryId === 'opengl') {
    if (os === 'windows') {
      return `my-opengl-project/
├── src/
│   └── main.cpp          # File utama program
├── include/              # Header files custom (jika ada)
├── lib/                  # Library files (.lib) — jika tidak pakai vcpkg
│   ├── glew32.lib
│   ├── glfw3.lib
│   └── opengl32.lib
├── dll/                  # DLL files — copy ke sini agar app bisa jalan
│   ├── glew32.dll
│   └── glfw3.dll
├── build/                # Output CMake (auto-generated)
├── CMakeLists.txt        # CMake configuration (recommended)
└── README.md`;
    } else if (os === 'linux') {
      return `my-opengl-project/
├── src/
│   └── main.cpp          # File utama program
├── include/              # Header files custom (jika ada)
├── build/                # Output CMake (auto-generated)
├── CMakeLists.txt        # CMake configuration (recommended)
├── Makefile              # Alternatif jika tidak pakai CMake
└── README.md`;
    } else if (os === 'macos') {
      return `my-opengl-project/
├── src/
│   └── main.cpp          # File utama program
├── include/              # Header files custom (jika ada)
├── build/                # Output CMake (auto-generated)
├── CMakeLists.txt        # CMake configuration (recommended)
└── README.md
# Note: Library files dikelola Homebrew, tidak perlu copy manual`;
    }

    // fallback
    return `my-opengl-project/
├── src/
│   └── main.cpp
├── include/
├── build/
└── CMakeLists.txt`;
  }

  return 'Project structure not available for this library';
};

export const generatePathSetup = (libraryId, deviceSpecs = {}) => {
  const { os = '', osVersion = '', cpu = '', compiler = '' } = deviceSpecs;
  const compilerFamily = getCompilerFamily(compiler);
  const isArm = os === 'macos' && isMacArm(cpu, osVersion);
  const brewPrefix = isArm ? '/opt/homebrew' : '/usr/local';

  // Deteksi distro Linux
  const isArch = osVersion.toLowerCase().includes('arch') || osVersion.toLowerCase().includes('manjaro');
  const isFedora = osVersion.toLowerCase().includes('fedora') || osVersion.toLowerCase().includes('rhel');

  let paths = [];

  if (libraryId === 'opengl') {
    if (os === 'windows') {
      const vcpkgTarget = compilerFamily === 'mingw' ? 'x64-mingw-dynamic' : 'x64-windows';

      paths = [
        {
          title: `Setup Environment Variables (Windows - ${compilerFamily.toUpperCase()})`,
          steps: [
            'Buka "System Properties" → "Advanced" → "Environment Variables"',
            'Tambahkan ke System PATH:',
            `  - C:\\vcpkg\\installed\\${vcpkgTarget}\\bin`,
            `  - C:\\vcpkg\\installed\\${vcpkgTarget}\\lib`,
            ...(compilerFamily === 'msvc' ? [
              '',
              'Untuk MSVC: path sudah otomatis dihandle oleh vcpkg integrate install'
            ] : []),
            ...(compilerFamily === 'mingw' ? [
              '',
              'Untuk MinGW: pastikan MinGW bin folder juga ada di PATH',
              '  Contoh: C:\\mingw64\\bin'
            ] : []),
            ...(compilerFamily === 'clang' ? [
              '',
              'Untuk Clang: pastikan LLVM bin folder ada di PATH',
              '  Contoh: C:\\Program Files\\LLVM\\bin'
            ] : [])
          ]
        },
        {
          title: 'Setup Include & Library Paths',
          steps: [
            `Include Path (-I): C:\\vcpkg\\installed\\${vcpkgTarget}\\include`,
            `Library Path (-L): C:\\vcpkg\\installed\\${vcpkgTarget}\\lib`,
            '',
            'DLL Path: Copy file .dll ke folder yang sama dengan .exe',
            `  Source DLL: C:\\vcpkg\\installed\\${vcpkgTarget}\\bin\\*.dll`,
            '  Atau tambahkan folder bin ke PATH sistem'
          ]
        }
      ];
    } else if (os === 'linux') {
      const libPath = isArch
        ? '/usr/lib'
        : isFedora
          ? '/usr/lib64'
          : '/usr/lib/x86_64-linux-gnu';

      paths = [
        {
          title: `Lokasi Default Library (${isArch ? 'Arch/Manjaro' : isFedora ? 'Fedora/RHEL' : 'Ubuntu/Debian'})`,
          steps: [
            'Include files: /usr/include/',
            `Library files: ${libPath}/`,
            '',
            'Cek lokasi library dengan pkg-config:',
            '  pkg-config --cflags glfw3   # output include path',
            '  pkg-config --libs glfw3     # output library flags',
            '  pkg-config --cflags glew',
            '  pkg-config --libs glew'
          ]
        },
        {
          title: 'Verifikasi Instalasi',
          steps: [
            '# Cek GLFW terinstall:',
            '  dpkg -l | grep glfw   (Ubuntu/Debian)',
            '  pacman -Q glfw-x11    (Arch)',
            '  rpm -q glfw-devel     (Fedora)',
            '',
            '# Cek versi OpenGL driver:',
            '  glxinfo | grep "OpenGL version"',
            '  # Install glxinfo: sudo apt-get install mesa-utils'
          ]
        }
      ];
    } else if (os === 'macos') {
      paths = [
        {
          title: `Lokasi Default Library (macOS ${isArm ? 'Apple Silicon' : 'Intel'})`,
          steps: [
            `Include files: ${brewPrefix}/include/`,
            `Library files: ${brewPrefix}/lib/`,
            '',
            'Cek lokasi dengan Homebrew:',
            '  brew --prefix glfw',
            '  brew --prefix glew',
            '',
            ...(isArm ? [
              '⚠️  Apple Silicon: Homebrew ada di /opt/homebrew (bukan /usr/local)',
              'Pastikan PATH sudah include /opt/homebrew/bin'
            ] : [
              'Intel Mac: Homebrew ada di /usr/local (default)'
            ])
          ]
        },
        {
          title: 'Verifikasi Instalasi',
          steps: [
            '# Cek library terinstall:',
            '  brew list | grep -E "glfw|glew"',
            '',
            '# Cek versi OpenGL:',
            '  system_profiler SPDisplaysDataType | grep "Metal"',
            '',
            ...(isArm ? [
              '# Note Apple Silicon:',
              '  OpenGL deprecated di macOS 10.14+',
              '  Masih berfungsi tapi Apple merekomendasikan Metal'
            ] : [])
          ]
        }
      ];
    }
  }

  return paths;
};

export const generateExampleCode = (libraryId) => {
  if (libraryId === 'opengl') {
    return `// main.cpp - OpenGL Hello Window
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <iostream>

int main() {
    // Initialize GLFW
    if (!glfwInit()) {
        std::cerr << "Failed to initialize GLFW" << std::endl;
        return -1;
    }

    // Create window
    GLFWwindow* window = glfwCreateWindow(800, 600, "OpenGL Window", NULL, NULL);
    if (!window) {
        std::cerr << "Failed to create window" << std::endl;
        glfwTerminate();
        return -1;
    }

    glfwMakeContextCurrent(window);

    // Initialize GLEW
    if (glewInit() != GLEW_OK) {
        std::cerr << "Failed to initialize GLEW" << std::endl;
        return -1;
    }

    std::cout << "OpenGL Version: " << glGetString(GL_VERSION) << std::endl;

    // Main loop
    while (!glfwWindowShouldClose(window)) {
        glClear(GL_COLOR_BUFFER_BIT);
        
        // Render here
        
        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;
}`;
  }

  return '// Example code not available for this library';
};

export const generateCMakeFile = (libraryId) => {
  if (libraryId === 'opengl') {
    return `cmake_minimum_required(VERSION 3.10)
project(OpenGLProject)

set(CMAKE_CXX_STANDARD 11)

# Find packages
find_package(OpenGL REQUIRED)
find_package(GLEW REQUIRED)
find_package(glfw3 REQUIRED)

# Add executable
add_executable(app src/main.cpp)

# Link libraries
target_link_libraries(app 
    OpenGL::GL 
    GLEW::GLEW 
    glfw
)`;
  }

  return '# CMakeLists.txt not available for this library';
};
