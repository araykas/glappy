import React from 'react';

const Header = ({ deviceSpecs, selectedLibrary }) => {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3 border-b"
      style={{ background: '#161b22', borderColor: '#21262d' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: '#1f3a2b', border: '1px solid #238636' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="#4af626" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        </div>
        <div>
          <div className="font-mono font-bold text-sm md:text-base leading-none" style={{ color: '#4af626' }}>
            Glappy
          </div>
          <div className="font-mono text-xs mt-0.5 hidden sm:block" style={{ color: '#8b949e' }}>
            AI-Powered Graphics Environment & Compiler Generator
          </div>
        </div>
      </div>

      {/* Center status — hidden on small screens */}
      <div className="hidden lg:flex items-center gap-4">
        {deviceSpecs ? (
          <div className="flex items-center gap-2">
            <span className="status-dot green" />
            <span className="font-mono text-xs" style={{ color: '#8b949e' }}>
              {deviceSpecs.os?.toUpperCase()} · {deviceSpecs.cpu}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="status-dot yellow" />
            <span className="font-mono text-xs" style={{ color: '#8b949e' }}>Device not configured</span>
          </div>
        )}

        {selectedLibrary && (
          <div
            className="font-mono text-xs px-2 py-1 rounded"
            style={{ background: '#1f3a2b', border: '1px solid #238636', color: '#4af626' }}
          >
            LIB: {selectedLibrary.name}
          </div>
        )}
      </div>

      {/* Right status */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="status-dot green" />
          <span className="font-mono text-xs" style={{ color: '#8b949e' }}>SYS: 99.99%</span>
        </div>
        <span
          className="font-mono text-xs px-2 py-1 rounded"
          style={{ background: '#21262d', border: '1px solid #373e47', color: '#8b949e' }}
        >
          v1.0.0
        </span>
      </div>
    </header>
  );
};

export default Header;
