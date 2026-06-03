import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import DeviceSpecForm from './components/DeviceSpecForm';
import LibrarySelector from './components/LibrarySelector';
import CommandGenerator from './components/CommandGenerator';
import AIAssistant from './components/AIAssistant';
import DeviceInfoHelper from './components/DeviceInfoHelper';

/* ── localStorage helpers ── */
const load = (key, fallback = null) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const TABS = [
  {
    id: 'setup',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Setup & Configuration',
    short: 'Setup',
  },
  {
    id: 'commands',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Installation Commands',
    short: 'Commands',
  },
];

function App() {
  const [deviceSpecs, setDeviceSpecs]       = useState(() => load('hi_deviceSpecs'));
  const [selectedLibrary, setSelectedLibrary] = useState(() => load('hi_selectedLibrary'));
  const [activeTab, setActiveTab]           = useState('setup');
  const [generatedCommands, setGeneratedCommands] = useState(() => load('hi_generatedCommands', []));

  useEffect(() => { save('hi_deviceSpecs', deviceSpecs); },         [deviceSpecs]);
  useEffect(() => { save('hi_selectedLibrary', selectedLibrary); }, [selectedLibrary]);
  useEffect(() => { save('hi_generatedCommands', generatedCommands); }, [generatedCommands]);

  const handleSpecsSubmit = (specs) => {
    setDeviceSpecs(specs);
    if (selectedLibrary) setActiveTab('commands');
  };

  const handleLibrarySelect = (library) => {
    setSelectedLibrary(library);
    if (deviceSpecs) setActiveTab('commands');
  };

  const isReady = !!(deviceSpecs && selectedLibrary);

  return (
    <div className="min-h-screen grid-bg" style={{ background: '#0d1117' }}>

      {/* ── Header ── */}
      <Header deviceSpecs={deviceSpecs} selectedLibrary={selectedLibrary} />

      {/* ── Tab Navigation Bar ── */}
      <div
        className="sticky top-[49px] z-30 flex items-center border-b px-4 md:px-6"
        style={{ background: '#161b22', borderColor: '#21262d' }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-3 font-mono text-sm transition-all duration-150 relative"
                style={{
                  color: isActive ? '#4af626' : '#8b949e',
                  borderBottom: isActive ? '2px solid #4af626' : '2px solid transparent',
                  background: isActive ? 'rgba(74,246,38,0.05)' : 'transparent',
                }}
              >
                <span style={{ color: isActive ? '#4af626' : '#484f58' }}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
              </button>
            );
          })}
        </div>

        {/* Right side: status chips */}
        <div className="ml-auto flex items-center gap-3 flex-shrink-0">
          {/* Device status */}
          <div className="hidden md:flex items-center gap-1.5">
            <span className={`status-dot ${deviceSpecs ? 'green' : 'yellow'}`} />
            <span className="font-mono text-xs" style={{ color: '#8b949e' }}>
              {deviceSpecs ? deviceSpecs.os?.toUpperCase() : 'no device'}
            </span>
          </div>

          {/* Library badge */}
          {selectedLibrary ? (
            <span
              className="font-mono text-xs px-2 py-0.5 rounded"
              style={{ background: '#1f3a2b', border: '1px solid #238636', color: '#4af626' }}
            >
              {selectedLibrary.name}
            </span>
          ) : (
            <span className="font-mono text-xs" style={{ color: '#484f58' }}>no lib</span>
          )}

          {/* Go to commands CTA — shown only on setup tab when ready */}
          {isReady && activeTab === 'setup' && (
            <button
              onClick={() => setActiveTab('commands')}
              className="hidden sm:flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded transition-all duration-150"
              style={{ background: '#238636', border: '1px solid #2ea043', color: '#fff' }}
            >
              $ generate →
            </button>
          )}
        </div>
      </div>

      {/* ── Page Content ── */}
      <main className="px-4 md:px-6 py-6 max-w-screen-xl mx-auto">

        {/* ═══ SETUP TAB ═══ */}
        <div className={activeTab === 'setup' ? 'space-y-4 animate-fadeInUp' : 'hidden'}>

          {/* How-to banner */}
          <div className="rounded p-4 font-mono text-xs" style={{ background: '#161b22', border: '1px solid #21262d' }}>
            <div className="flex items-start gap-3">
              <span style={{ color: '#484f58' }}>{'/*'}</span>
              <div className="space-y-1 flex-1">
                <div style={{ color: '#8b949e' }}>
                  <span style={{ color: '#58a6ff' }}>Step 1:</span> Isi spesifikasi device di bawah
                </div>
                <div style={{ color: '#8b949e' }}>
                  <span style={{ color: '#58a6ff' }}>Step 2:</span> Pilih graphics library target
                </div>
                <div style={{ color: '#8b949e' }}>
                  <span style={{ color: '#58a6ff' }}>Step 3:</span>{' '}
                  <button onClick={() => setActiveTab('commands')} className="underline" style={{ color: '#4af626' }}>
                    Installation Commands
                  </button>{' '}
                  akan otomatis terbuka
                </div>
                <div style={{ color: '#8b949e' }}>
                  <span style={{ color: '#58a6ff' }}>Step 4:</span> Gunakan{' '}
                  <span style={{ color: '#4af626' }}>🔧 AI Montir</span> (pojok kanan bawah) jika ada error
                </div>
              </div>
              <span style={{ color: '#484f58' }}>{'*/'}</span>
            </div>
          </div>

          <DeviceInfoHelper />
          <DeviceSpecForm onSubmit={handleSpecsSubmit} />
          <LibrarySelector onSelect={handleLibrarySelect} savedLibrary={selectedLibrary} />

          {/* CTA jika sudah ready */}
          {isReady && (
            <div
              className="rounded p-4 flex items-center justify-between flex-wrap gap-3"
              style={{ background: '#1f3a2b', border: '1px solid #238636' }}
            >
              <div className="flex items-center gap-2">
                <span className="status-dot green" />
                <span className="font-mono text-sm" style={{ color: '#4af626' }}>
                  Config complete — ready to generate
                </span>
              </div>
              <button onClick={() => setActiveTab('commands')} className="btn-primary">
                $ generate commands →
              </button>
            </div>
          )}
        </div>

        {/* ═══ COMMANDS TAB ═══ */}
        <div className={activeTab === 'commands' ? 'space-y-4 animate-fadeInUp' : 'hidden'}>
          <CommandGenerator
            library={selectedLibrary}
            deviceSpecs={deviceSpecs}
            onCommandsGenerated={setGeneratedCommands}
          />

          {isReady && (
            <div
              className="rounded p-3 font-mono text-xs"
              style={{ background: '#2d2007', border: '1px solid #9e6a03', color: '#e3b341' }}
            >
              ⚠ Jalankan command sesuai urutan · Butuh akses admin/sudo · Backup project dulu ·{' '}
              Gunakan <span style={{ color: '#4af626' }}>🔧 AI Montir</span> jika ada error
            </div>
          )}
        </div>
      </main>

      {/* ── AI Floating Overlay ── */}
      <AIAssistant
        deviceSpecs={deviceSpecs}
        library={selectedLibrary}
        generatedCommands={generatedCommands}
      />

      {/* ── Footer ── */}
      <footer
        className="py-3 px-6 font-mono text-xs text-center"
        style={{ background: '#161b22', borderTop: '1px solid #21262d', color: '#484f58' }}
      >
        Happy Instalasi — AI-Powered Installation Assistant · Made with ❤ for easier library installations
      </footer>
    </div>
  );
}

export default App;
