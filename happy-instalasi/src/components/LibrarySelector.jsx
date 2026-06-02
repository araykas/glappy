import { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const DEFAULT_LIBRARIES = [
  {
    id: 'opengl', name: 'OpenGL', description: 'Open Graphics Library - Cross-platform API for rendering 2D and 3D graphics', difficulty: 'Medium', icon: '🎨', available: true, platforms: ['windows', 'linux', 'macos'], comingSoon: false,
  },
  {
    id: 'vulkan', name: 'Vulkan', description: 'Modern cross-platform graphics and compute API', difficulty: 'Advanced', icon: '⚡', available: false, platforms: ['windows', 'linux', 'macos'], comingSoon: true,
  },
  {
    id: 'directx', name: 'DirectX', description: 'Microsoft graphics API untuk Windows', difficulty: 'Advanced', icon: '🎮', available: false, platforms: ['windows'], comingSoon: true,
  },
];

const LibrarySelector = ({ onSelect, savedLibrary }) => {
  const [selectedLibrary, setSelectedLibrary] = useState(savedLibrary || null);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch libraries dari backend
  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(API_ENDPOINTS.libraries);

        const rawLibraries = response?.data ?? response;
        const libraryArray = Array.isArray(rawLibraries) ? rawLibraries : DEFAULT_LIBRARIES;

        const mappedLibraries = libraryArray.map(lib => ({
          id: lib.id,
          name: lib.name,
          description: lib.description,
          difficulty: lib.difficulty,
          icon: lib.icon,
          available: !lib.comingSoon,
          platforms: lib.platforms || [],
        }));

        setLibraries(mappedLibraries);
        setStatusMessage(null);
      } catch (err) {
        setLibraries(DEFAULT_LIBRARIES);
        setStatusMessage('Tidak dapat memuat library dari backend. Menampilkan data default.');
        console.error('Error fetching libraries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraries();
  }, []);

  const handleSelect = (library) => {
    if (!library.available) {
      alert('⚠️ Library ini masih dalam tahap pengembangan. Saat ini hanya OpenGL yang tersedia.');
      return;
    }
    setSelectedLibrary(library);
    onSelect(library);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          <span className="ml-3 text-gray-600">Loading libraries...</span>
        </div>
      </div>
    );
  }

  const renderWarning = () => {
    if (!statusMessage) return null;
    return (
      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-yellow-800 font-semibold mb-1">⚠️ Perhatian</h3>
            <p className="text-yellow-700 text-sm">{statusMessage}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h2 className="text-xl font-bold text-gray-800">Pilih Library</h2>
        <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          ✅ Connected to Backend
        </span>
      </div>

      {renderWarning()}

      {libraries.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
          Tidak ada library yang tersedia.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {libraries.map((library) => (
            <div
              key={library.id}
              onClick={() => handleSelect(library)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md relative ${selectedLibrary?.id === library.id
                  ? 'border-sky-500 bg-sky-50'
                  : library.available
                    ? 'border-gray-200 hover:border-sky-300'
                    : 'border-gray-200 opacity-60 hover:border-yellow-300'
                }`}
            >
              {!library.available && (
                <div className="absolute top-2 right-2">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">
                    Coming Soon
                  </span>
                </div>
              )}
              <div className="text-3xl mb-2">{library.icon}</div>
              <h3 className="font-bold text-lg text-gray-800">{library.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{library.description}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(library.difficulty)}`}>
                {library.difficulty}
              </span>
            </div>
          ))}
        </div>
      )}

      {selectedLibrary && (
        <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
          <p className="text-sm text-sky-800">
            <strong>Selected:</strong> {selectedLibrary.name} - {selectedLibrary.description}
          </p>
        </div>
      )}

      <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Status Pengembangan</h4>
            <p className="text-sm text-yellow-700">
              Saat ini hanya <strong>OpenGL</strong> yang sudah tersedia. Library lainnya (Vulkan, GLFW, GLEW, SDL2, GLAD) masih dalam tahap pengembangan dan akan segera hadir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibrarySelector;
