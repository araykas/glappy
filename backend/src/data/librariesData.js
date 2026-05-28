// Dummy data untuk libraries (nanti bisa dipindah ke database)
export const libraries = [
  {
    id: 'opengl',
    name: 'OpenGL',
    description: 'Open Graphics Library - Cross-platform API for rendering 2D and 3D graphics',
    category: 'Graphics',
    version: 'Latest',
    icon: '🎨',
    difficulty: 'Medium',
    platforms: ['windows', 'linux', 'macos'],
    dependencies: ['GLEW', 'GLFW', 'OpenGL'],
    documentation: 'https://www.opengl.org/documentation/',
    features: [
      'Cross-platform compatibility',
      'Hardware acceleration',
      'Extensive community support',
      'Mature and stable API'
    ]
  },
  {
    id: 'vulkan',
    name: 'Vulkan',
    description: 'Modern cross-platform graphics and compute API',
    category: 'Graphics',
    version: 'Latest',
    icon: '⚡',
    difficulty: 'Advanced',
    platforms: ['windows', 'linux', 'macos'],
    dependencies: ['Vulkan SDK', 'GLFW'],
    documentation: 'https://www.vulkan.org/',
    features: [
      'Low-level GPU control',
      'Better performance',
      'Multi-threading support',
      'Modern architecture'
    ],
    comingSoon: true
  },
  {
    id: 'directx',
    name: 'DirectX',
    description: 'Microsoft graphics API for Windows',
    category: 'Graphics',
    version: '12',
    icon: '🎮',
    difficulty: 'Advanced',
    platforms: ['windows'],
    dependencies: ['Windows SDK', 'DirectX SDK'],
    documentation: 'https://docs.microsoft.com/en-us/windows/win32/directx',
    features: [
      'Windows native',
      'Excellent performance',
      'Gaming industry standard',
      'Ray tracing support'
    ],
    comingSoon: true
  }
];

export const getLibraryById = (id) => {
  return libraries.find(lib => lib.id === id);
};

export const getAvailableLibraries = () => {
  return libraries.filter(lib => !lib.comingSoon);
};

export const getAllLibraries = () => {
  return libraries;
};
