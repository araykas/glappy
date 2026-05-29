import { useState } from 'react';
import Header from './components/Header';
import DeviceSpecForm from './components/DeviceSpecForm';
import LibrarySelector from './components/LibrarySelector';
import CommandGenerator from './components/CommandGenerator';
import AIAssistant from './components/AIAssistant';
import DeviceInfoHelper from './components/DeviceInfoHelper';

function App() {
  const [deviceSpecs, setDeviceSpecs] = useState(null);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [activeTab, setActiveTab] = useState('setup');

  const handleSpecsSubmit = (specs) => {
    setDeviceSpecs(specs);
    // Show success notification
    alert('✅ Spesifikasi device berhasil disimpan!');
  };

  const handleLibrarySelect = (library) => {
    setSelectedLibrary(library);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('setup')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'setup'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Setup & Configuration
            </button>
            <button
              onClick={() => setActiveTab('commands')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'commands'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              💻 Installation Commands
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'ai'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🤖 AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Status Bar */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Device:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                deviceSpecs ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {deviceSpecs ? `${deviceSpecs.os} - ${deviceSpecs.cpu}` : 'Not configured'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Library:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedLibrary ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {selectedLibrary ? selectedLibrary.name : 'Not selected'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Cara Menggunakan</h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Isi spesifikasi device Anda di form bawah</li>
                    <li>Pilih library yang ingin diinstall (saat ini hanya OpenGL yang tersedia)</li>
                    <li>Lihat installation commands di tab "Installation Commands"</li>
                    <li>Jika ada masalah, gunakan AI Assistant untuk troubleshooting</li>
                  </ol>
                </div>
              </div>
            </div>

            <DeviceInfoHelper />
            <DeviceSpecForm onSubmit={handleSpecsSubmit} />
            <LibrarySelector onSelect={handleLibrarySelect} />
          </div>
        )}

        {activeTab === 'commands' && (
          <div className="space-y-6">
            <CommandGenerator library={selectedLibrary} deviceSpecs={deviceSpecs} />
            
            {selectedLibrary && deviceSpecs && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">⚠️ Penting!</h3>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                      <li>Jalankan command sesuai urutan</li>
                      <li>Pastikan memiliki akses administrator/sudo</li>
                      <li>Backup project sebelum instalasi</li>
                      <li>Jika ada error, gunakan AI Assistant untuk bantuan</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <AIAssistant deviceSpecs={deviceSpecs} library={selectedLibrary} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Happy Instalasi - AI-Powered Installation Assistant</p>
            <p className="mt-1">Made with ❤️ for easier library installations</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
