import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import DeviceSpecForm from './components/DeviceSpecForm';
import LibrarySelector from './components/LibrarySelector';
import CommandGenerator from './components/CommandGenerator';
import AIAssistant from './components/AIAssistant';
import DeviceInfoHelper from './components/DeviceInfoHelper';

const load = (key, fallback = null) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

/* ── Sidebar nav items ── */
const NAV = [
  {
    id: 'setup',
    label: 'Setup',
    sub: 'Device & Library',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    id: 'commands',
    label: 'Commands',
    sub: 'Installation',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
];

function App() {
  const [deviceSpecs,       setDeviceSpecs]       = useState(() => load('hi_deviceSpecs'));
  const [selectedLibrary,   setSelectedLibrary]   = useState(() => load('hi_selectedLibrary'));
  const [activeTab,         setActiveTab]         = useState('setup');
  const [generatedCommands, setGeneratedCommands] = useState(() => load('hi_generatedCommands', []));
  const [mobileNavOpen,     setMobileNavOpen]     = useState(false);

  useEffect(() => { save('hi_deviceSpecs',       deviceSpecs);       }, [deviceSpecs]);
  useEffect(() => { save('hi_selectedLibrary',   selectedLibrary);   }, [selectedLibrary]);
  useEffect(() => { save('hi_generatedCommands', generatedCommands); }, [generatedCommands]);

  const handleSpecsSubmit  = (specs)   => { setDeviceSpecs(specs);     if (selectedLibrary) setActiveTab('commands'); };
  const handleLibrarySelect = (library) => { setSelectedLibrary(library); if (deviceSpecs)    setActiveTab('commands'); };
  const goTab = (id) => { setActiveTab(id); setMobileNavOpen(false); };

  const isReady = !!(deviceSpecs && selectedLibrary);

  return (
    /*
      Root: full viewport, no overflow — everything lives inside
      Layout: column flex  →  header (fixed height) + body (fills rest)
    */
    <div
      className="grid-bg"
      style={{
        background: '#0d1117',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ══════════════ HEADER ══════════════ */}
      <Header deviceSpecs={deviceSpecs} selectedLibrary={selectedLibrary} />

      {/* ══════════════ BODY (below header) ══════════════ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── SIDEBAR (desktop) ── */}
        <aside
          className="hidden lg:flex flex-col flex-shrink-0"
          style={{
            width: '188px',
            background: '#161b22',
            borderRight: '1px solid #21262d',
            overflow: 'hidden',
          }}
        >
          {/* Nav label */}
          <div className="px-4 pt-4 pb-1">
            <span className="section-label" style={{ color: '#373e47' }}>MENU</span>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 px-2 pt-1">
            {NAV.map(item => (
              <button
                key={item.id}
                onClick={() => goTab(item.id)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                {item.icon}
                <div className="text-left">
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1 }}>{item.label}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: 2 }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </nav>

          {/* Divider */}
          <div className="mx-3 my-3" style={{ borderTop: '1px solid #21262d' }} />

          {/* Status */}
          <div className="px-4 pb-1">
            <span className="section-label" style={{ color: '#373e47' }}>STATUS</span>
          </div>
          <div className="px-3 flex flex-col gap-2 pb-3">
            {[
              { label: 'Device',  dot: deviceSpecs      ? 'green' : 'yellow', val: deviceSpecs?.os?.toUpperCase() || 'Not set',      color: deviceSpecs      ? '#4af626' : '#e3b341' },
              { label: 'Library', dot: selectedLibrary  ? 'blue'  : 'yellow', val: selectedLibrary?.name          || 'Not set',      color: selectedLibrary  ? '#58a6ff' : '#e3b341' },
            ].map(s => (
              <div key={s.label} className="rounded p-2 font-mono text-xs"
                style={{ background: '#0d1117', border: '1px solid #21262d' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`status-dot ${s.dot}`} />
                  <span style={{ color: '#484f58' }}>{s.label}</span>
                </div>
                <div className="truncate" style={{ color: s.color, fontSize: '0.7rem' }}>{s.val}</div>
              </div>
            ))}

            {isReady && (
              <div className="rounded p-2 font-mono text-xs"
                style={{ background: '#1f3a2b', border: '1px solid #238636' }}>
                <div className="flex items-center gap-1.5">
                  <span className="status-dot green" />
                  <span style={{ color: '#4af626', fontSize: '0.7rem' }}>Ready</span>
                </div>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Footer hint */}
          <div className="px-4 py-3 font-mono text-xs" style={{ borderTop: '1px solid #21262d', color: '#373e47' }}>
            <div>AI Montir available</div>
            <div style={{ color: '#4af626' }}>↘ bottom-right</div>
          </div>
        </aside>

        {/* ── MOBILE TOP TABS ── */}
        <div
          className="lg:hidden absolute top-[49px] left-0 right-0 z-20 flex border-b"
          style={{ background: '#161b22', borderColor: '#21262d' }}
        >
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => goTab(item.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 font-mono text-xs transition-colors"
              style={{
                color: activeTab === item.id ? '#4af626' : '#8b949e',
                borderBottom: activeTab === item.id ? '2px solid #4af626' : '2px solid transparent',
                background: activeTab === item.id ? 'rgba(74,246,38,0.05)' : 'transparent',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* ══════════════ MAIN CONTENT ══════════════ */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingTop: '0' }}
        >
          {/* Mobile top tabs offset */}
          <div className="lg:hidden" style={{ height: '41px' }} />

          {/* ═══ SETUP TAB ═══ */}
          <div
            className={activeTab === 'setup' ? 'p-4 md:p-6 space-y-4 animate-fadeInUp' : 'hidden'}
          >
            {/* How-to banner */}
            <div className="rounded p-4 font-mono text-xs" style={{ background: '#161b22', border: '1px solid #21262d' }}>
              <div className="flex items-start gap-3">
                <span style={{ color: '#484f58' }}>{'/*'}</span>
                <div className="space-y-1 flex-1">
                  {[
                    ['Step 1', 'Isi spesifikasi device di bawah'],
                    ['Step 2', 'Pilih graphics library target'],
                    ['Step 3', null],
                    ['Step 4', 'Gunakan 🔧 AI Montir (pojok kanan bawah) jika ada error'],
                  ].map(([step, text], i) => (
                    <div key={i} style={{ color: '#8b949e' }}>
                      <span style={{ color: '#58a6ff' }}>{step}:</span>{' '}
                      {i === 2 ? (
                        <>
                          <button onClick={() => goTab('commands')} className="underline" style={{ color: '#4af626' }}>
                            Installation Commands
                          </button>{' '}akan otomatis terbuka
                        </>
                      ) : text}
                    </div>
                  ))}
                </div>
                <span style={{ color: '#484f58' }}>{'*/'}</span>
              </div>
            </div>

            <DeviceInfoHelper />
            <DeviceSpecForm onSubmit={handleSpecsSubmit} />
            <LibrarySelector onSelect={handleLibrarySelect} savedLibrary={selectedLibrary} />

            {isReady && (
              <div className="rounded p-4 flex items-center justify-between flex-wrap gap-3"
                style={{ background: '#1f3a2b', border: '1px solid #238636' }}>
                <div className="flex items-center gap-2">
                  <span className="status-dot green" />
                  <span className="font-mono text-sm" style={{ color: '#4af626' }}>Config complete — ready to generate</span>
                </div>
                <button onClick={() => goTab('commands')} className="btn-primary">$ generate commands →</button>
              </div>
            )}
          </div>

          {/* ═══ COMMANDS TAB ═══ */}
          {activeTab === 'commands' && (
            <div
              className="animate-fadeInUp"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '16px',
                gap: '12px',
                boxSizing: 'border-box',
              }}
            >
              <CommandGenerator
                library={selectedLibrary}
                deviceSpecs={deviceSpecs}
                onCommandsGenerated={setGeneratedCommands}
              />

              {isReady && (
                <div className="rounded p-3 font-mono text-xs flex-shrink-0"
                  style={{ background: '#2d2007', border: '1px solid #9e6a03', color: '#e3b341' }}>
                  ⚠ Jalankan command sesuai urutan · Butuh akses admin/sudo · Backup project dulu ·{' '}
                  Gunakan <span style={{ color: '#4af626' }}>🔧 AI Montir</span> jika ada error
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ══════════════ AI FLOATING ══════════════ */}
      <AIAssistant
        deviceSpecs={deviceSpecs}
        library={selectedLibrary}
        generatedCommands={generatedCommands}
      />

      {/* ══════════════ FOOTER ══════════════ */}
      <footer
        className="flex-shrink-0 py-2 px-6 font-mono text-xs text-center"
        style={{ background: '#161b22', borderTop: '1px solid #21262d', color: '#373e47' }}
      >
        Glappy — AI-Powered Graphics Environment & Compiler Generator · Made with ❤ for easier library installations
      </footer>
    </div>
  );
}

export default App;
