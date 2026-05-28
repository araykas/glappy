// Service untuk generate installation commands berdasarkan library dan device specs

export const generateInstallationCommands = (libraryId, deviceSpecs) => {
  const { os } = deviceSpecs;

  if (libraryId === 'opengl') {
    return generateOpenGLCommands(os);
  }

  // Tambahkan library lain di sini nanti
  throw new Error(`Library '${libraryId}' not supported yet`);
};

const generateOpenGLCommands = (os) => {
  let commands = [];

  if (os === 'windows') {
    commands = [
      {
        title: '1. Install vcpkg (Package Manager)',
        command: 'git clone https://github.com/Microsoft/vcpkg.git\ncd vcpkg\n.\\bootstrap-vcpkg.bat',
        description: 'Install vcpkg untuk manage dependencies',
        category: 'setup'
      },
      {
        title: '2. Install GLEW',
        command: 'vcpkg install glew:x64-windows',
        description: 'Install OpenGL Extension Wrangler Library',
        category: 'dependencies'
      },
      {
        title: '3. Install GLFW',
        command: 'vcpkg install glfw3:x64-windows',
        description: 'Install windowing library',
        category: 'dependencies'
      },
      {
        title: '4. Integrate vcpkg (Opsional - untuk Visual Studio)',
        command: 'vcpkg integrate install',
        description: 'Auto-detect libraries di Visual Studio',
        category: 'configuration'
      },
      {
        title: '5. Compile dengan Path Manual (GCC/MinGW)',
        command: 'g++ src/main.cpp -o app.exe -IC:/vcpkg/installed/x64-windows/include -LC:/vcpkg/installed/x64-windows/lib -lglfw3 -lglew32 -lopengl32 -lgdi32',
        description: 'Compile dengan specify include & library path',
        category: 'compile'
      },
      {
        title: '6. Compile dengan CMake (Recommended)',
        command: 'mkdir build\ncd build\ncmake .. -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake\ncmake --build .',
        description: 'Compile menggunakan CMake (lebih mudah manage path)',
        category: 'compile'
      }
    ];
  } else if (os === 'linux') {
    commands = [
      {
        title: '1. Update Package Manager',
        command: 'sudo apt-get update',
        description: 'Update repository',
        category: 'setup'
      },
      {
        title: '2. Install OpenGL Development Files',
        command: 'sudo apt-get install libgl1-mesa-dev libglu1-mesa-dev',
        description: 'Install OpenGL libraries',
        category: 'dependencies'
      },
      {
        title: '3. Install GLEW',
        command: 'sudo apt-get install libglew-dev',
        description: 'Install GLEW library',
        category: 'dependencies'
      },
      {
        title: '4. Install GLFW',
        command: 'sudo apt-get install libglfw3-dev',
        description: 'Install GLFW library',
        category: 'dependencies'
      },
      {
        title: '5. Compile dengan pkg-config (Recommended)',
        command: 'g++ src/main.cpp -o app $(pkg-config --cflags --libs glfw3 glew) -lGL',
        description: 'pkg-config otomatis detect path library',
        category: 'compile'
      },
      {
        title: '6. Compile dengan Path Manual',
        command: 'g++ src/main.cpp -o app -I/usr/include -L/usr/lib/x86_64-linux-gnu -lglfw -lGLEW -lGL',
        description: 'Compile dengan specify path manual',
        category: 'compile'
      }
    ];
  } else if (os === 'macos') {
    commands = [
      {
        title: '1. Install Homebrew (jika belum)',
        command: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
        description: 'Install package manager untuk macOS',
        category: 'setup'
      },
      {
        title: '2. Install GLEW',
        command: 'brew install glew',
        description: 'Install GLEW library',
        category: 'dependencies'
      },
      {
        title: '3. Install GLFW',
        command: 'brew install glfw',
        description: 'Install GLFW library',
        category: 'dependencies'
      },
      {
        title: '4. Compile dengan Homebrew paths',
        command: 'g++ src/main.cpp -o app -I/usr/local/include -L/usr/local/lib -lglfw -lGLEW -framework OpenGL',
        description: 'Compile dengan path Homebrew default',
        category: 'compile'
      },
      {
        title: '5. Compile dengan pkg-config',
        command: 'g++ src/main.cpp -o app $(pkg-config --cflags --libs glfw3 glew) -framework OpenGL',
        description: 'Menggunakan pkg-config untuk auto-detect path',
        category: 'compile'
      }
    ];
  }

  return commands;
};

export const generateProjectStructure = (libraryId) => {
  if (libraryId === 'opengl') {
    return `my-opengl-project/
├── src/
│   └── main.cpp          # File utama program
├── include/              # Header files (jika ada)
├── lib/                  # Library files (.lib, .a)
│   ├── glew32.lib
│   ├── glfw3.lib
│   └── opengl32.lib
├── dll/                  # DLL files (Windows)
│   ├── glew32.dll
│   └── glfw3.dll
├── CMakeLists.txt        # CMake configuration (opsional)
└── Makefile              # Makefile (opsional)`;
  }

  return 'Project structure not available for this library';
};

export const generatePathSetup = (libraryId, os) => {
  let paths = [];

  if (libraryId === 'opengl') {
    if (os === 'windows') {
      paths = [
        {
          title: 'Setup Environment Variables (Windows)',
          steps: [
            'Buka "System Properties" → "Environment Variables"',
            'Tambahkan ke PATH:',
            '  - C:\\vcpkg\\installed\\x64-windows\\bin',
            '  - C:\\vcpkg\\installed\\x64-windows\\lib',
            'Atau lokasi dimana GLEW & GLFW terinstall'
          ]
        },
        {
          title: 'Setup Include & Library Paths',
          steps: [
            'Include Path (-I): Lokasi header files (.h)',
            '  Contoh: C:\\vcpkg\\installed\\x64-windows\\include',
            '',
            'Library Path (-L): Lokasi library files (.lib)',
            '  Contoh: C:\\vcpkg\\installed\\x64-windows\\lib',
            '',
            'DLL Path: Copy DLL ke folder project atau system32'
          ]
        }
      ];
    } else if (os === 'linux') {
      paths = [
        {
          title: 'Lokasi Default Library (Linux)',
          steps: [
            'Include files biasanya di: /usr/include/',
            'Library files biasanya di: /usr/lib/ atau /usr/lib/x86_64-linux-gnu/',
            '',
            'Cek lokasi library:',
            '  pkg-config --cflags glfw3',
            '  pkg-config --libs glfw3'
          ]
        }
      ];
    } else if (os === 'macos') {
      paths = [
        {
          title: 'Lokasi Default Library (macOS)',
          steps: [
            'Include files biasanya di: /usr/local/include/',
            'Library files biasanya di: /usr/local/lib/',
            '',
            'Cek lokasi library:',
            '  brew --prefix glfw',
            '  brew --prefix glew'
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
