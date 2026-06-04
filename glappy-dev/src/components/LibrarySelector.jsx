import { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const DEFAULT_LIBRARIES = [
  {
    id: 'opengl', name: 'OpenGL', description: 'Cross-platform API for rendering 2D/3D graphics',
    difficulty: 'Medium', icon: '🎨', available: true, platforms: ['windows', 'linux', 'macos'], comingSoon: false,
  },
  {
    id: 'vulkan', name: 'Vulkan', description: 'Modern low-overhead graphics and compute API',
    difficulty: 'Advanced', icon: '⚡', available: false, platforms: ['windows', 'linux', 'macos'], comingSoon: true,
  },
  {
    id: 'directx', name: 'DirectX', description: 'Microsoft graphics API for Windows',
    difficulty: 'Advanced', icon: '🎮', available: false, platforms: ['windows'], comingSoon: true,
  },
];

const DIFF_STYLE = {
  Easy:     { color: '#4af626', borderColor: '#238636', bg: '#1f3a2b' },
  Medium:   { color: '#e3b341', borderColor: '#9e6a03', bg: '#2d2007' },
  Advanced: { color: '#f85149', borderColor: '#da3633', bg: '#3b1219' },
};

const LibrarySelector = ({ onSelect, savedLibrary }) => {
  const [selectedLibrary, setSelectedLibrary] = useState(savedLibrary || null);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(API_ENDPOINTS.libraries);
        const raw = response?.data ?? response;
        const arr = Array.isArray(raw) ? raw : DEFAULT_LIBRARIES;
        setLibraries(arr.map(lib => ({
          id: lib.id, name: lib.name, description: lib.description,
          difficulty: lib.difficulty, icon: lib.icon,
          available: !lib.comingSoon, platforms: lib.platforms || [],
        })));
      } catch {
        setLibraries(DEFAULT_LIBRARIES);
        setError('Backend unavailable — using local data');
      } finally {
        setLoading(false);
      }
    };
    fetchLibraries();
  }, []);

  const handleSelect = (library) => {
    if (!library.available) return;
    setSelectedLibrary(library);
    onSelect(library);
  };

  if (loading) {
    return (
      <div className="panel">
        <div className="panel-header">
          <span className="status-dot blue" />
          <span className="font-mono text-sm" style={{ color: '#58a6ff' }}>library_selector</span>
        </div>
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#58a6ff', borderTopColor: 'transparent' }} />
          <span className="font-mono text-sm" style={{ color: '#8b949e' }}>fetching libraries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="panel animate-fadeInUp">
      <div className="panel-header">
        <svg className="w-4 h-4" fill="none" stroke="#58a6ff" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <span className="font-mono text-sm font-semibold" style={{ color: '#58a6ff' }}>
          library_selector
        </span>
        <span className="ml-auto">
          {error
            ? <span className="badge-yellow text-xs">⚠ local</span>
            : <span className="badge-green text-xs">✓ connected</span>
          }
        </span>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-3 px-3 py-2 rounded font-mono text-xs" style={{ background: '#2d2007', border: '1px solid #9e6a03', color: '#e3b341' }}>
            ⚠ {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {libraries.map((lib) => {
            const diff = DIFF_STYLE[lib.difficulty] || DIFF_STYLE.Medium;
            const isSelected = selectedLibrary?.id === lib.id;
            return (
              <div
                key={lib.id}
                onClick={() => handleSelect(lib)}
                className="rounded p-3 transition-all duration-150 relative"
                style={{
                  background: isSelected ? '#1f3a2b' : '#0d1117',
                  border: isSelected
                    ? '1px solid #238636'
                    : lib.available
                      ? '1px solid #21262d'
                      : '1px solid #21262d',
                  cursor: lib.available ? 'pointer' : 'not-allowed',
                  opacity: lib.available ? 1 : 0.5,
                  boxShadow: isSelected ? '0 0 10px rgba(74,246,38,0.15)' : 'none',
                }}
              >
                {!lib.available && (
                  <span
                    className="absolute top-2 right-2 font-mono text-xs px-1.5 py-0.5 rounded"
                    style={{ background: '#2d2007', border: '1px solid #9e6a03', color: '#e3b341' }}
                  >
                    soon
                  </span>
                )}
                <div className="text-2xl mb-2">{lib.icon}</div>
                <div className="font-mono font-bold text-sm mb-1" style={{ color: isSelected ? '#4af626' : '#c9d1d9' }}>
                  {lib.name}
                </div>
                <div className="font-mono text-xs mb-2 leading-relaxed" style={{ color: '#8b949e' }}>
                  {lib.description}
                </div>
                <span
                  className="font-mono text-xs px-1.5 py-0.5 rounded"
                  style={{ background: diff.bg, border: `1px solid ${diff.borderColor}`, color: diff.color }}
                >
                  {lib.difficulty}
                </span>
              </div>
            );
          })}
        </div>

        {selectedLibrary && (
          <div
            className="mt-3 px-3 py-2 rounded font-mono text-xs flex items-center gap-2"
            style={{ background: '#1f3a2b', border: '1px solid #238636', color: '#4af626' }}
          >
            <span className="status-dot green" />
            Selected: <strong>{selectedLibrary.name}</strong> — {selectedLibrary.description}
          </div>
        )}

        <div
          className="mt-3 px-3 py-2 rounded font-mono text-xs"
          style={{ background: '#0d1117', border: '1px solid #373e47', color: '#8b949e' }}
        >
          // Only <span style={{ color: '#4af626' }}>OpenGL</span> available now.
          Vulkan & DirectX coming soon.
        </div>
      </div>
    </div>
  );
};

export default LibrarySelector;
