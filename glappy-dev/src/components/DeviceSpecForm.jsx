import React, { useState } from 'react';

const STORAGE_KEY = 'hi_formSpecs';

const DEFAULT_SPECS = {
  os: '', osVersion: '', cpu: '', gpu: '', ram: '', compiler: '', ide: ''
};

const loadSaved = () => {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? { ...DEFAULT_SPECS, ...JSON.parse(val) } : DEFAULT_SPECS;
  } catch { return DEFAULT_SPECS; }
};

const Label = ({ children, required }) => (
  <label className="block font-mono text-xs mb-1.5 uppercase tracking-wider" style={{ color: '#8b949e' }}>
    {children}{required && <span style={{ color: '#f85149' }}> *</span>}
  </label>
);

const DeviceSpecForm = ({ onSubmit }) => {
  const [specs, setSpecs] = useState(loadSaved);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const updated = { ...specs, [e.target.name]: e.target.value };
    setSpecs(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(specs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="panel animate-fadeInUp">
      {/* Panel header */}
      <div className="panel-header">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#58a6ff" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <span className="font-mono text-sm font-semibold" style={{ color: '#58a6ff' }}>
          device_spec.config
        </span>
        <span className="ml-auto font-mono text-xs" style={{ color: '#484f58' }}>
          system_profile
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* OS */}
          <div>
            <Label required>Operating System</Label>
            <select name="os" value={specs.os} onChange={handleChange} className="input-field" required>
              <option value="">-- Select OS --</option>
              <option value="windows">Windows</option>
              <option value="linux">Linux</option>
              <option value="macos">macOS</option>
            </select>
          </div>

          {/* OS Version */}
          <div>
            <Label required>OS Version</Label>
            <input
              type="text" name="osVersion" value={specs.osVersion} onChange={handleChange}
              placeholder="e.g. Windows 11, Ubuntu 22.04"
              className="input-field" required
            />
          </div>

          {/* CPU */}
          <div>
            <Label required>CPU</Label>
            <input
              type="text" name="cpu" value={specs.cpu} onChange={handleChange}
              placeholder="e.g. Intel i7-12700K"
              className="input-field" required
            />
          </div>

          {/* GPU */}
          <div>
            <Label required>GPU</Label>
            <input
              type="text" name="gpu" value={specs.gpu} onChange={handleChange}
              placeholder="e.g. NVIDIA RTX 3060"
              className="input-field" required
            />
          </div>

          {/* RAM */}
          <div>
            <Label required>RAM</Label>
            <input
              type="text" name="ram" value={specs.ram} onChange={handleChange}
              placeholder="e.g. 16GB"
              className="input-field" required
            />
          </div>

          {/* Compiler */}
          <div>
            <Label>Compiler</Label>
            <select name="compiler" value={specs.compiler} onChange={handleChange} className="input-field">
              <option value="">-- Select Compiler --</option>
              <optgroup label="── Windows ──">
                <option value="gcc-mingw">GCC / MinGW (g++)</option>
                <option value="msvc">MSVC (Visual Studio)</option>
                <option value="clang-windows">Clang (LLVM Windows)</option>
              </optgroup>
              <optgroup label="── Linux / macOS ──">
                <option value="gcc">GCC (g++)</option>
                <option value="clang">Clang</option>
              </optgroup>
            </select>
          </div>

          {/* IDE */}
          <div className="sm:col-span-2">
            <Label>IDE / Text Editor</Label>
            <input
              type="text" name="ide" value={specs.ide} onChange={handleChange}
              placeholder="e.g. VS Code, CLion, Visual Studio"
              className="input-field"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`w-full py-2.5 font-mono text-sm font-semibold rounded transition-all duration-200 ${
            saved ? 'copy-success' : ''
          }`}
          style={
            saved
              ? { background: '#1f3a2b', border: '1px solid #238636', color: '#4af626' }
              : { background: '#238636', border: '1px solid #2ea043', color: '#fff' }
          }
        >
          {saved ? '✓ CONFIG SAVED' : '$ SAVE CONFIGURATION'}
        </button>
      </form>
    </div>
  );
};

export default DeviceSpecForm;
