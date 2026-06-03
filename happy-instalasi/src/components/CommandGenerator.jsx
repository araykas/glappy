import { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../config/api';
import { getSessionId } from '../config/session';

/* ── Dot decorations mimicking terminal window chrome ── */
const TerminalDots = () => (
  <div className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded-full" style={{ background: '#f85149' }} />
    <span className="w-3 h-3 rounded-full" style={{ background: '#e3b341' }} />
    <span className="w-3 h-3 rounded-full" style={{ background: '#4af626' }} />
  </div>
);

/* ── Single command block ── */
const CommandBlock = ({ cmd, index, copiedIndex, onCopy }) => {
  const isCopied = copiedIndex === index;
  return (
    <div
      className="rounded overflow-hidden transition-all duration-150"
      style={{ border: '1px solid #21262d', background: '#0d1117' }}
    >
      {/* Command header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: '#161b22', borderBottom: '1px solid #21262d' }}
      >
        <div>
          <span className="font-mono text-xs font-semibold" style={{ color: '#58a6ff' }}>
            {cmd.title}
          </span>
          {cmd.description && (
            <span className="ml-2 font-mono text-xs" style={{ color: '#484f58' }}>
              // {cmd.description}
            </span>
          )}
        </div>
        <button
          onClick={() => onCopy(cmd.command, index)}
          className="font-mono text-xs px-2 py-1 rounded flex items-center gap-1 transition-all duration-200 flex-shrink-0"
          style={
            isCopied
              ? { background: '#1f3a2b', border: '1px solid #238636', color: '#4af626' }
              : { background: '#21262d', border: '1px solid #373e47', color: '#8b949e' }
          }
        >
          {isCopied ? '✓ copied' : '⎘ copy'}
        </button>
      </div>

      {/* Command body */}
      <div className="px-4 py-3 font-mono text-sm overflow-x-auto" style={{ color: '#4af626' }}>
        {cmd.command.split('\n').map((line, i) => (
          <div key={i} className="code-line">
            <span style={{ color: '#484f58', userSelect: 'none', marginRight: '12px' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Code preview panel ── */
const CodePreview = ({ code, title = 'main.cpp', copiedKey, onCopy }) => (
  <div className="panel flex flex-col overflow-hidden">
    <div
      className="flex items-center justify-between px-4 py-2 flex-shrink-0"
      style={{ background: '#21262d', borderBottom: '1px solid #2d333b' }}
    >
      <div className="flex items-center gap-3">
        <TerminalDots />
        <span className="font-mono text-xs" style={{ color: '#8b949e' }}>{title}</span>
      </div>
      <button
        onClick={() => onCopy(code, 'code')}
        className="font-mono text-xs px-2 py-1 rounded transition-all duration-200"
        style={
          copiedKey === 'code'
            ? { background: '#1f3a2b', border: '1px solid #238636', color: '#4af626' }
            : { background: '#0d1117', border: '1px solid #373e47', color: '#8b949e' }
        }
      >
        {copiedKey === 'code' ? '✓ copied' : '⎘ copy'}
      </button>
    </div>
    <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto" style={{ background: '#010409', color: '#c9d1d9' }}>
      {code.split('\n').map((line, i) => (
        <div key={i} className="code-line flex">
          <span className="select-none w-6 text-right flex-shrink-0 mr-4" style={{ color: '#484f58' }}>
            {i + 1}
          </span>
          <span style={{ color: '#c9d1d9' }}>{line || '\u00A0'}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Main component ── */
const CommandGenerator = ({ library, deviceSpecs, onCommandsGenerated }) => {
  const [commands, setCommands] = useState([]);
  const [projectStructure, setProjectStructure] = useState('');
  const [pathSetup, setPathSetup] = useState([]);
  const [exampleCode, setExampleCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeSection, setActiveSection] = useState('commands');

  useEffect(() => {
    if (library && deviceSpecs) fetchCommandsFromBackend();
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
            os: deviceSpecs.os, osVersion: deviceSpecs.osVersion,
            cpu: deviceSpecs.cpu, gpu: deviceSpecs.gpu,
            ram: deviceSpecs.ram, compiler: deviceSpecs.compiler,
          },
        }),
      });
      setCommands(response.data.commands);
      setProjectStructure(response.data.projectStructure);
      setPathSetup(response.data.pathSetup);
      setExampleCode(response.data.exampleCode);
      if (onCommandsGenerated) onCommandsGenerated(response.data.commands);
    } catch (err) {
      setError(err.message || 'Failed to generate commands');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  /* ── Empty state ── */
  if (!library || !deviceSpecs) {
    return (
      <div className="panel flex flex-col items-center justify-center py-20 gap-4">
        <div className="font-mono text-4xl opacity-30">{'</>'}</div>
        <div className="font-mono text-sm" style={{ color: '#484f58' }}>
          Configure device & select library first
        </div>
        <div className="font-mono text-xs" style={{ color: '#373e47' }}>
          // Use Setup tab to get started
        </div>
      </div>
    );
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="panel">
        <div className="panel-header">
          <TerminalDots />
          <span className="font-mono text-sm ml-2" style={{ color: '#8b949e' }}>generating...</span>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: '#4af626', animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <div className="font-mono text-sm typing-cursor" style={{ color: '#4af626' }}>
            Building configuration
          </div>
          <div className="font-mono text-xs" style={{ color: '#484f58' }}>
            Analyzing {deviceSpecs.os} · {library.name}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="panel">
        <div className="panel-header">
          <span className="status-dot red" />
          <span className="font-mono text-sm" style={{ color: '#f85149' }}>error</span>
        </div>
        <div className="p-6">
          <div
            className="rounded p-4 font-mono text-sm mb-4"
            style={{ background: '#3b1219', border: '1px solid #da3633', color: '#f85149' }}
          >
            ✗ {error}
          </div>
          <button onClick={fetchCommandsFromBackend} className="btn-primary">
            $ retry
          </button>
        </div>
      </div>
    );
  }

  /* ── Main split-screen layout ── */
  const sections = [
    { id: 'commands', label: 'install.sh' },
    { id: 'path', label: 'path_setup' },
    { id: 'structure', label: 'tree' },
  ];

  return (
    <div className="flex flex-col gap-4 animate-fadeInUp">

      {/* ── TOP: Split screen — Commands (left) + Code Preview (right) ── */}
      <div className="flex gap-4 split-layout">

        {/* LEFT: Installation commands */}
        <div className="panel split-left" style={{ flex: '1 1 55%' }}>
          {/* Terminal chrome */}
          <div
            className="flex items-center justify-between px-4 py-2 flex-shrink-0"
            style={{ background: '#21262d', borderBottom: '1px solid #2d333b' }}
          >
            <div className="flex items-center gap-3">
              <TerminalDots />
              <div className="flex gap-1">
                {sections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className="font-mono text-xs px-3 py-1 rounded-t transition-colors duration-150"
                    style={
                      activeSection === s.id
                        ? { background: '#0d1117', color: '#4af626', borderBottom: '2px solid #4af626' }
                        : { background: 'transparent', color: '#484f58' }
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-dot green" />
              <span className="font-mono text-xs" style={{ color: '#484f58' }}>
                {deviceSpecs.os} · {library.name}
              </span>
            </div>
          </div>

          {/* Content area */}
          <div className="p-4 space-y-3">

            {/* Commands tab */}
            {activeSection === 'commands' && (
              <>
                {commands.length === 0 ? (
                  <div className="font-mono text-sm text-center py-8" style={{ color: '#484f58' }}>
                    No commands generated
                  </div>
                ) : (
                  commands.map((cmd, i) => (
                    <CommandBlock
                      key={i} cmd={cmd} index={i}
                      copiedIndex={copiedIndex} onCopy={copyToClipboard}
                    />
                  ))
                )}
              </>
            )}

            {/* Path setup tab */}
            {activeSection === 'path' && (
              <div className="space-y-3">
                {pathSetup.length === 0 ? (
                  <div className="font-mono text-sm text-center py-8" style={{ color: '#484f58' }}>
                    No path setup info
                  </div>
                ) : (
                  pathSetup.map((section, idx) => (
                    <div key={idx} className="rounded overflow-hidden" style={{ border: '1px solid #21262d' }}>
                      <div className="px-3 py-2" style={{ background: '#161b22', borderBottom: '1px solid #21262d' }}>
                        <span className="font-mono text-xs font-semibold" style={{ color: '#e3b341' }}>
                          📁 {section.title}
                        </span>
                      </div>
                      <div className="p-3" style={{ background: '#0d1117' }}>
                        {section.steps.map((step, si) => (
                          <div key={si} className="font-mono text-xs leading-relaxed code-line"
                            style={{ color: step.startsWith('  ') ? '#4af626' : '#8b949e', paddingLeft: step.startsWith('  ') ? '16px' : '0' }}
                          >
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Project structure tab */}
            {activeSection === 'structure' && (
              <div className="rounded overflow-hidden" style={{ border: '1px solid #21262d' }}>
                <div
                  className="flex items-center justify-between px-3 py-2"
                  style={{ background: '#161b22', borderBottom: '1px solid #21262d' }}
                >
                  <span className="font-mono text-xs font-semibold" style={{ color: '#bc8cff' }}>
                    project_structure/
                  </span>
                  <button
                    onClick={() => copyToClipboard(projectStructure, 'struct')}
                    className="font-mono text-xs px-2 py-0.5 rounded"
                    style={
                      copiedIndex === 'struct'
                        ? { background: '#1f3a2b', border: '1px solid #238636', color: '#4af626' }
                        : { background: '#0d1117', border: '1px solid #373e47', color: '#8b949e' }
                    }
                  >
                    {copiedIndex === 'struct' ? '✓' : '⎘'}
                  </button>
                </div>
                <pre
                  className="p-4 font-mono text-xs overflow-x-auto leading-relaxed"
                  style={{ background: '#010409', color: '#8b949e' }}
                >
                  {projectStructure}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Code preview */}
        <div className="split-right" style={{ flex: '1 1 45%' }}>
          <CodePreview
            code={exampleCode || '// No example code generated'}
            title="src/main.cpp"
            copiedKey={copiedIndex}
            onCopy={copyToClipboard}
          />
        </div>
      </div>

      {/* ── BOTTOM: CMakeLists.txt (Windows only) ── */}
      {deviceSpecs.os === 'windows' && (
        <div className="panel overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{ background: '#21262d', borderBottom: '1px solid #2d333b' }}
          >
            <div className="flex items-center gap-3">
              <TerminalDots />
              <span className="font-mono text-xs" style={{ color: '#bc8cff' }}>CMakeLists.txt</span>
              <span className="font-mono text-xs" style={{ color: '#484f58' }}>// recommended build system</span>
            </div>
            <button
              onClick={() => copyToClipboard(CMAKE_CONTENT, 'cmake')}
              className="font-mono text-xs px-2 py-1 rounded transition-all duration-200"
              style={
                copiedIndex === 'cmake'
                  ? { background: '#1f3a2b', border: '1px solid #238636', color: '#4af626' }
                  : { background: '#0d1117', border: '1px solid #373e47', color: '#8b949e' }
              }
            >
              {copiedIndex === 'cmake' ? '✓ copied' : '⎘ copy'}
            </button>
          </div>
          <pre
            className="p-4 font-mono text-xs overflow-x-auto leading-relaxed"
            style={{ background: '#010409', color: '#c9d1d9' }}
          >
{CMAKE_CONTENT}
          </pre>
        </div>
      )}
    </div>
  );
};

const CMAKE_CONTENT = `cmake_minimum_required(VERSION 3.10)
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
)`;

export default CommandGenerator;
