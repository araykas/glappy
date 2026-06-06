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
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Field ini wajib diisi.';

    if (name === 'osVersion') {
      if (trimmed.length < 2) return 'OS Version minimal 2 karakter.';
      if (!/^[A-Za-z0-9 .()+\-_,]{2,40}$/.test(trimmed)) return 'OS Version hanya boleh berisi huruf, angka, spasi, dan tanda umum.';
      return null;
    }

    if (name === 'cpu' || name === 'gpu') {
      if (trimmed.length < 3) return 'CPU/GPU harus minimal 3 karakter.';
      if (!/^[A-Za-z0-9 .()+\-_/]{3,40}$/.test(trimmed)) return 'Gunakan teks valid untuk CPU/GPU, tanpa simbol aneh.';

      const cpuVendorPattern = /\b(?:intel|amd|apple|ryzen|core|xeon|pentium|celeron|athlon|m1|m2)\b/i;
      const gpuVendorPattern = /\b(?:nvidia|amd|intel|geforce|radeon|rtx|gtx|iris|xe|mx|rx|quadro|titan)\b/i;
      if (name === 'cpu' && !cpuVendorPattern.test(trimmed)) {
        return 'CPU harus menyertakan vendor valid seperti Intel, AMD, atau Apple.';
      }
      if (name === 'gpu' && !gpuVendorPattern.test(trimmed)) {
        return 'GPU harus menyertakan vendor valid seperti NVIDIA, AMD, atau Intel.';
      }
      return null;
    }

    if (name === 'ram') {
      if (!/^[1-9]\d*\s*GB$/i.test(trimmed)) return 'RAM harus dalam format seperti 8GB atau 16 GB.';
      return null;
    }

    return null;
  };

  const validateSpecs = (values) => {
    const nextErrors = {};
    if (!values.os) nextErrors.os = 'Pilih Operating System.';
    ['osVersion', 'cpu', 'gpu', 'ram'].forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) nextErrors[field] = error;
    });
    return nextErrors;
  };

  const handleChange = (e) => {
    const updated = { ...specs, [e.target.name]: e.target.value };
    setSpecs(updated);
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validateSpecs(specs);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      os: specs.os,
      osVersion: specs.osVersion.trim(),
      cpu: specs.cpu.trim(),
      gpu: specs.gpu.trim(),
      ram: specs.ram.trim(),
      compiler: specs.compiler,
      ide: specs.ide.trim(),
    });
    setSaved(true);
    setErrors({});
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
            <select
              name="os" value={specs.os} onChange={handleChange}
              className={`input-field ${errors.os ? 'border-[#f85149] focus:border-[#f85149]' : ''}`}
              required
            >
              <option value="">-- Select OS --</option>
              <option value="windows">Windows</option>
              <option value="linux">Linux</option>
              <option value="macos">macOS</option>
            </select>
            {errors.os && <p className="text-[11px] text-[#f85149] mt-1">{errors.os}</p>}
          </div>

          {/* OS Version */}
          <div>
            <Label required>OS Version</Label>
            <input
              type="text" name="osVersion" value={specs.osVersion} onChange={handleChange}
              placeholder="e.g. Windows 11, Ubuntu 22.04"
              className={`input-field ${errors.osVersion ? 'border-[#f85149] focus:border-[#f85149]' : ''}`}
              required
              minLength={2}
              maxLength={40}
              pattern="^[A-Za-z0-9 .()+\-_,]{2,40}$"
              title="Contoh: Windows 11 atau Ubuntu 22.04"
            />
            {errors.osVersion && <p className="text-[11px] text-[#f85149] mt-1">{errors.osVersion}</p>}
          </div>

          {/* CPU */}
          <div>
            <Label required>CPU</Label>
            <input
              type="text" name="cpu" value={specs.cpu} onChange={handleChange}
              placeholder="e.g. Intel i7-12700K"
              className={`input-field ${errors.cpu ? 'border-[#f85149] focus:border-[#f85149]' : ''}`}
              required
              minLength={3}
              maxLength={40}
              pattern="^[A-Za-z0-9 .()+\-_/]{3,40}$"
              title="Contoh: Intel i7-12700K atau AMD Ryzen 5 5600X"
            />
            {errors.cpu && <p className="text-[11px] text-[#f85149] mt-1">{errors.cpu}</p>}
          </div>

          {/* GPU */}
          <div>
            <Label required>GPU</Label>
            <input
              type="text" name="gpu" value={specs.gpu} onChange={handleChange}
              placeholder="e.g. NVIDIA RTX 3060"
              className={`input-field ${errors.gpu ? 'border-[#f85149] focus:border-[#f85149]' : ''}`}
              required
              minLength={3}
              maxLength={40}
              pattern="^[A-Za-z0-9 .()+\-_/]{3,40}$"
              title="Contoh: NVIDIA RTX 3060 atau Intel Iris Xe"
            />
            {errors.gpu && <p className="text-[11px] text-[#f85149] mt-1">{errors.gpu}</p>}
          </div>

          {/* RAM */}
          <div>
            <Label required>RAM</Label>
            <input
              type="text" name="ram" value={specs.ram} onChange={handleChange}
              placeholder="e.g. 16GB"
              className={`input-field ${errors.ram ? 'border-[#f85149] focus:border-[#f85149]' : ''}`}
              required
              maxLength={10}
              pattern="^[1-9]\d*\s*[Gg][Bb]$"
              title="Contoh: 8GB atau 16 GB"
            />
            {errors.ram && <p className="text-[11px] text-[#f85149] mt-1">{errors.ram}</p>}
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
          className={`w-full py-2.5 font-mono text-sm font-semibold rounded transition-all duration-200 ${saved ? 'copy-success' : ''
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
