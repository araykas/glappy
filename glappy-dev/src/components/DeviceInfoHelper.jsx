import React, { useState } from 'react';

const OS_COMMANDS = {
  windows: [
    { label: 'OS Version',      command: 'systeminfo | findstr /B /C:"OS Name" /C:"OS Version"' },
    { label: 'CPU Info',        command: 'wmic cpu get name' },
    { label: 'GPU Info',        command: 'wmic path win32_VideoController get name' },
    { label: 'RAM Info',        command: 'wmic memorychip get capacity' },
    { label: 'Compiler (GCC)',  command: 'gcc --version' },
    { label: 'Compiler (MSVC)', command: 'cl' },
  ],
  linux: [
    { label: 'OS Version',        command: 'cat /etc/os-release' },
    { label: 'CPU Info',          command: 'lscpu | grep "Model name"' },
    { label: 'GPU Info',          command: 'lspci | grep -i vga' },
    { label: 'RAM Info',          command: 'free -h' },
    { label: 'Compiler (GCC)',    command: 'gcc --version' },
    { label: 'Compiler (Clang)',  command: 'clang --version' },
  ],
  macos: [
    { label: 'OS Version',       command: 'sw_vers' },
    { label: 'CPU Info',         command: 'sysctl -n machdep.cpu.brand_string' },
    { label: 'GPU Info',         command: 'system_profiler SPDisplaysDataType | grep Chipset' },
    { label: 'RAM Info',         command: 'sysctl hw.memsize' },
    { label: 'Compiler (Clang)', command: 'clang --version' },
    { label: 'Xcode Version',    command: 'xcodebuild -version' },
  ],
};

const DeviceInfoHelper = () => {
  const [open, setOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState('windows');
  const [copied, setCopied] = useState(null);

  const copy = (cmd, idx) => {
    navigator.clipboard.writeText(cmd);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded transition-all duration-200"
        style={{
          background: open ? '#21262d' : '#161b22',
          border: '1px solid',
          borderColor: open ? '#bc8cff' : '#373e47',
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: '#bc8cff' }}>{'</>'}</span>
          <div className="text-left">
            <div className="font-mono text-sm font-semibold" style={{ color: '#bc8cff' }}>
              check_system_specs.sh
            </div>
            <div className="font-mono text-xs" style={{ color: '#484f58' }}>
              // commands to detect your hardware
            </div>
          </div>
        </div>
        <span className="font-mono text-xs transition-transform duration-200" style={{ color: '#484f58', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>
          ▼
        </span>
      </button>

      {/* Expanded panel */}
      {open && (
        <div
          className="rounded-b overflow-hidden animate-fadeInUp"
          style={{ border: '1px solid #21262d', borderTop: 'none', background: '#0d1117' }}
        >
          {/* OS selector */}
          <div className="flex border-b px-4 pt-3 gap-2" style={{ borderColor: '#21262d' }}>
            {Object.keys(OS_COMMANDS).map(os => (
              <button
                key={os}
                onClick={() => setSelectedOS(os)}
                className="font-mono text-xs px-3 py-1.5 rounded-t transition-colors"
                style={
                  selectedOS === os
                    ? { background: '#21262d', color: '#bc8cff', borderBottom: '2px solid #bc8cff' }
                    : { background: 'transparent', color: '#484f58' }
                }
              >
                {os}
              </button>
            ))}
          </div>

          {/* Commands */}
          <div className="p-4 space-y-2">
            {OS_COMMANDS[selectedOS].map((item, i) => (
              <div
                key={i}
                className="rounded overflow-hidden"
                style={{ border: '1px solid #21262d' }}
              >
                <div
                  className="flex items-center justify-between px-3 py-1.5"
                  style={{ background: '#161b22', borderBottom: '1px solid #21262d' }}
                >
                  <span className="font-mono text-xs" style={{ color: '#8b949e' }}>{item.label}</span>
                  <button
                    onClick={() => copy(item.command, i)}
                    className="font-mono text-xs px-2 py-0.5 rounded transition-all duration-200"
                    style={
                      copied === i
                        ? { background: '#1f3a2b', color: '#4af626', border: '1px solid #238636' }
                        : { background: '#0d1117', color: '#8b949e', border: '1px solid #373e47' }
                    }
                  >
                    {copied === i ? '✓' : '⎘'}
                  </button>
                </div>
                <div className="px-3 py-2 font-mono text-xs overflow-x-auto" style={{ background: '#010409', color: '#4af626' }}>
                  {item.command}
                </div>
              </div>
            ))}

            <div
              className="mt-2 px-3 py-2 rounded font-mono text-xs"
              style={{ background: '#161b22', border: '1px solid #21262d', color: '#8b949e' }}
            >
              // Open Terminal / CMD → run commands above → paste results to form
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceInfoHelper;
