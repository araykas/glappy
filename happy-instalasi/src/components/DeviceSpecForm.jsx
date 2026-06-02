import React, { useState } from 'react';

const STORAGE_KEY = 'hi_formSpecs';

const DEFAULT_SPECS = {
  os: '',
  osVersion: '',
  cpu: '',
  gpu: '',
  ram: '',
  compiler: '',
  ide: ''
};

const loadSaved = () => {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? { ...DEFAULT_SPECS, ...JSON.parse(val) } : DEFAULT_SPECS;
  } catch {
    return DEFAULT_SPECS;
  }
};

const DeviceSpecForm = ({ onSubmit }) => {
  const [specs, setSpecs] = useState(loadSaved);

  const handleChange = (e) => {
    const updated = { ...specs, [e.target.name]: e.target.value };
    setSpecs(updated);
    // Simpan draft ke localStorage saat user ngetik (tanpa perlu klik submit)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(specs);
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-800">Spesifikasi Device</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operating System *
            </label>
            <select 
              name="os" 
              value={specs.os} 
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Pilih OS</option>
              <option value="windows">Windows</option>
              <option value="linux">Linux</option>
              <option value="macos">macOS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OS Version *
            </label>
            <input
              type="text"
              name="osVersion"
              value={specs.osVersion}
              onChange={handleChange}
              placeholder="e.g., Windows 11, Ubuntu 22.04"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPU *
            </label>
            <input
              type="text"
              name="cpu"
              value={specs.cpu}
              onChange={handleChange}
              placeholder="e.g., Intel i7-12700K"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GPU *
            </label>
            <input
              type="text"
              name="gpu"
              value={specs.gpu}
              onChange={handleChange}
              placeholder="e.g., NVIDIA RTX 3060"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RAM *
            </label>
            <input
              type="text"
              name="ram"
              value={specs.ram}
              onChange={handleChange}
              placeholder="e.g., 16GB"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compiler
            </label>
            <select
              name="compiler"
              value={specs.compiler}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Pilih Compiler</option>
              <optgroup label="Windows">
                <option value="gcc-mingw">GCC / MinGW (g++)</option>
                <option value="msvc">MSVC (Visual Studio)</option>
                <option value="clang-windows">Clang (LLVM Windows)</option>
              </optgroup>
              <optgroup label="Linux / macOS">
                <option value="gcc">GCC (g++)</option>
                <option value="clang">Clang</option>
              </optgroup>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IDE / Text Editor
            </label>
            <input
              type="text"
              name="ide"
              value={specs.ide}
              onChange={handleChange}
              placeholder="e.g., Visual Studio Code, CLion"
              className="input-field"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full">
          Simpan Spesifikasi
        </button>
      </form>
    </div>
  );
};

export default DeviceSpecForm;
