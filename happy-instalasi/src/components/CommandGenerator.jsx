import { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../config/api';
import { getSessionId } from '../config/session';

const CommandGenerator = ({ library, deviceSpecs }) => {
  const [commands, setCommands] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [projectStructure, setProjectStructure] = useState('');
  const [pathSetup, setPathSetup] = useState([]);
  const [exampleCode, setExampleCode] = useState('');
  const [cmakeFile, setCmakeFile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (library && deviceSpecs) {
      fetchCommandsFromBackend();
    }
  }, [library, deviceSpecs]);

  const fetchCommandsFromBackend = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest(API_ENDPOINTS.generateCommands, {
        method: 'POST',
        body: JSON.stringify({
          libraryId: library.id,
          sessionId: getSessionId(),
          deviceSpecs: {
            os: deviceSpecs.os,
            cpu: deviceSpecs.cpu,
            gpu: deviceSpecs.gpu,
            ram: deviceSpecs.ram
          }
        })
      });

      // Set data dari backend
      setCommands(response.data.commands);
      setProjectStructure(response.data.projectStructure);
      setPathSetup(response.data.pathSetup);
      setExampleCode(response.data.exampleCode);
      setCmakeFile(response.data.cmakeFile);
    } catch (err) {
      setError(err.message || 'Failed to generate commands');
      console.error('Error generating commands:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          <span className="ml-3 text-gray-600">Generating commands...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold mb-1">❌ Error Generating Commands</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <button 
                onClick={fetchCommandsFromBackend}
                className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!library || !deviceSpecs) {
    return (
      <div className="card">
        <div className="text-center text-gray-500 py-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>Pilih library dan isi spesifikasi device untuk generate commands</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Structure */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800">📁 Struktur Project</h2>
        </div>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto whitespace-pre">
          {projectStructure}
        </div>
        <div className="mt-3 text-sm text-gray-600">
          💡 <strong>Tips:</strong> Buat folder sesuai struktur di atas untuk organize project dengan baik
        </div>
      </div>

      {/* Path Setup Guide */}
      {pathSetup.length > 0 && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">🛣️ Setup Path & Environment</h2>
          </div>
          <div className="space-y-4">
            {pathSetup.map((section, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{section.title}</h3>
                <div className="bg-blue-50 p-3 rounded text-sm space-y-1">
                  {section.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className={step.startsWith('  ') ? 'ml-4 text-blue-700 font-mono text-xs' : 'text-blue-900'}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Installation Commands */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800">⚙️ Installation & Compile Commands</h2>
        </div>

        <div className="space-y-4">
          {commands.map((cmd, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{cmd.title}</h3>
                  <p className="text-sm text-gray-600">{cmd.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(cmd.command, index)}
                  className="btn-secondary text-sm py-1 px-3 flex-shrink-0"
                >
                  {copiedIndex === index ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                {cmd.command}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Example Code */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800">📝 Example Code</h2>
        </div>
        <div className="mb-2">
          <button
            onClick={() => copyToClipboard(exampleCode, 'code')}
            className="btn-secondary text-sm py-1 px-3"
          >
            {copiedIndex === 'code' ? '✓ Copied' : 'Copy Code'}
          </button>
        </div>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre">
          {exampleCode}
        </div>
        <div className="mt-3 text-sm text-gray-600">
          💡 Save code ini sebagai <code className="bg-gray-100 px-2 py-1 rounded">src/main.cpp</code> di project folder
        </div>
      </div>

      {/* CMakeLists.txt Example */}
      {deviceSpecs.os === 'windows' && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">🔧 CMakeLists.txt (Recommended)</h2>
          </div>
          <div className="mb-2">
            <button
              onClick={() => copyToClipboard(`cmake_minimum_required(VERSION 3.10)
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
)`, 'cmake')}
              className="btn-secondary text-sm py-1 px-3"
            >
              {copiedIndex === 'cmake' ? '✓ Copied' : 'Copy CMakeLists.txt'}
            </button>
          </div>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre">
{`cmake_minimum_required(VERSION 3.10)
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
)`}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            💡 CMake otomatis handle path detection, lebih mudah dari manual compile
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandGenerator;
