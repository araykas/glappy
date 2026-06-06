import { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../config/api';
import { getSessionId } from '../config/session';

/* ── Inline markdown renderer ── */
const renderInline = (text) => {
  const parts = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('`'))
      parts.push(<code key={m.index} className="font-mono text-xs px-1 rounded" style={{ background: '#21262d', color: '#58a6ff' }}>{t.slice(1, -1)}</code>);
    else
      parts.push(<strong key={m.index} style={{ color: '#c9d1d9' }}>{t.slice(2, -2)}</strong>);
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
};

/* ── Code block in chat ── */
const ChatCodeBlock = ({ code, onCopy, isCopied }) => (
  <div className="my-2 rounded overflow-hidden" style={{ border: '1px solid #21262d' }}>
    <div className="flex justify-between items-center px-3 py-1.5" style={{ background: '#21262d' }}>
      <span className="font-mono text-xs" style={{ color: '#484f58' }}>code</span>
      <button
        onClick={onCopy}
        className="font-mono text-xs px-2 py-0.5 rounded"
        style={isCopied
          ? { background: '#1f3a2b', color: '#4af626', border: '1px solid #238636' }
          : { background: '#161b22', color: '#8b949e', border: '1px solid #373e47' }}
      >
        {isCopied ? '✓' : '⎘'}
      </button>
    </div>
    <pre className="p-3 font-mono text-xs overflow-x-auto" style={{ background: '#010409', color: '#4af626' }}>{code}</pre>
  </div>
);

/* ── Rich text renderer ── */
const RichText = ({ text, copiedKey, onCopy }) => {
  if (!text) return null;
  const codeRe = /```(?:\w+)?\n?([\s\S]*?)```/g;
  const segs = [];
  let last = 0, m;
  while ((m = codeRe.exec(text)) !== null) {
    if (m.index > last) segs.push({ type: 'text', content: text.slice(last, m.index) });
    segs.push({ type: 'code', content: m[1].trim(), key: `c-${m.index}` });
    last = codeRe.lastIndex;
  }
  if (last < text.length) segs.push({ type: 'text', content: text.slice(last) });

  return (
    <div className="space-y-1">
      {segs.map((seg, i) => {
        if (seg.type === 'code')
          return <ChatCodeBlock key={i} code={seg.content} isCopied={copiedKey === seg.key} onCopy={() => onCopy(seg.content, seg.key)} />;
        return (
          <div key={i}>
            {seg.content.split('\n').map((line, li) => {
              if (!line.trim()) return <div key={li} className="h-1.5" />;
              const bullet = line.match(/^[-*]\s+(.*)/);
              if (bullet) return (
                <div key={li} className="flex items-start gap-2 font-mono text-xs leading-relaxed" style={{ color: '#8b949e' }}>
                  <span style={{ color: '#4af626', marginTop: '3px' }}>›</span>
                  <span>{renderInline(bullet[1])}</span>
                </div>
              );
              const num = line.match(/^(\d+)\.\s+(.*)/);
              if (num) return (
                <div key={li} className="flex items-start gap-2 font-mono text-xs leading-relaxed">
                  <span className="w-4 h-4 rounded-full text-center text-xs flex-shrink-0 font-bold" style={{ background: '#1f3a2b', color: '#4af626', lineHeight: '16px' }}>{num[1]}</span>
                  <span style={{ color: '#c9d1d9' }}>{renderInline(num[2])}</span>
                </div>
              );
              return <p key={li} className="font-mono text-xs leading-relaxed" style={{ color: '#c9d1d9' }}>{renderInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

/* ── Message bubble ── */
const MessageBubble = ({ msg, onSuggestionClick }) => {
  const [expanded, setExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => { });
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isLong = (msg.content || '').length > 400;

  if (msg.role === 'user') return (
    <div className="flex justify-end">
      <div className="max-w-[80%] px-3 py-2 rounded-lg rounded-tr-none font-mono text-xs"
        style={{ background: '#1f3a2b', border: '1px solid #238636', color: '#c9d1d9' }}>
        {msg.content}
      </div>
    </div>
  );

  if (msg.offTopic) return (
    <div className="flex flex-col gap-2">
      <div className="rounded p-3" style={{ background: '#2d2007', border: '1px solid #9e6a03' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="status-dot yellow" />
          <span className="font-mono text-xs font-semibold" style={{ color: '#e3b341' }}>off-topic</span>
        </div>
        <div className={isLong && !expanded ? 'max-h-24 overflow-hidden relative' : ''}>
          <RichText text={msg.content} copiedKey={copiedKey} onCopy={handleCopy} />
          {isLong && !expanded && <div className="absolute bottom-0 left-0 right-0 h-6" style={{ background: 'linear-gradient(transparent, #2d2007)' }} />}
        </div>
        {isLong && <button onClick={() => setExpanded(x => !x)} className="mt-1 font-mono text-xs" style={{ color: '#e3b341' }}>{expanded ? '▲ less' : '▼ more'}</button>}
      </div>
      {msg.suggestions?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {msg.suggestions.map((s, i) => (
            <button key={i} onClick={() => onSuggestionClick(s)}
              className="font-mono text-xs px-2 py-1 rounded transition-colors"
              style={{ background: '#161b22', border: '1px solid #373e47', color: '#58a6ff' }}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded p-3" style={{ background: '#161b22', border: '1px solid #21262d' }}>
        <div className={isLong && !expanded ? 'max-h-40 overflow-hidden relative' : ''}>
          <RichText text={msg.content} copiedKey={copiedKey} onCopy={handleCopy} />
          {isLong && !expanded && <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: 'linear-gradient(transparent, #161b22)' }} />}
        </div>
        {isLong && <button onClick={() => setExpanded(x => !x)} className="mt-1 font-mono text-xs" style={{ color: '#58a6ff' }}>{expanded ? '▲ less' : '▼ more'}</button>}
      </div>
      {msg.suggestions?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {msg.suggestions.map((s, i) => (
            <button key={i} onClick={() => onSuggestionClick(s)}
              className="font-mono text-xs px-2 py-1 rounded transition-colors"
              style={{ background: '#161b22', border: '1px solid #373e47', color: '#58a6ff' }}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main AIAssistant — renders as floating overlay ── */
const CHAT_KEY = 'hi_chatHistory';
const INIT_MSG = {
  role: 'assistant',
  content: 'Glappy Assist online. Paste error log atau describe masalah kompilasi kamu.',
  offTopic: false,
  suggestions: ['Cara install OpenGL?', 'Error saat compile', 'Setup PATH variables', 'CMake tidak find library'],
};

const AIAssistant = ({ deviceSpecs, library, generatedCommands }) => {
  const loadChat = () => {
    try { const v = localStorage.getItem(CHAT_KEY); return v ? JSON.parse(v) : [INIT_MSG]; } catch { return [INIT_MSG]; }
  };

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadChat);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-50))); } catch { }
  }, [messages]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const chatHistory = messages.slice(-10).map(({ role, content }) => ({ role, content }));
    setMessages(prev => [...prev, userMsg]);
    const cur = input;
    setInput('');
    setIsLoading(true);
    try {
      const pageTitle = typeof document === 'undefined' ? '' : document.title;
      const res = await apiRequest(API_ENDPOINTS.aiChat, {
        method: 'POST',
        body: JSON.stringify({
          message: cur,
          sessionId: getSessionId(),
          chatHistory,
          context: { deviceSpecs, library, generatedCommands, pageTitle },
        }),
      });
      const aiContent = res?.data?.aiResponse ?? res?.aiResponse ?? 'No response.';
      const suggestions = res?.data?.suggestions ?? res?.suggestions ?? [];
      const offTopic = res?.data?.offTopic ?? res?.offTopic ?? false;
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent, suggestions, offTopic }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Error:** ${err.message}`,
        offTopic: false, suggestions: [],
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const clearChat = () => {
    setMessages([INIT_MSG]);
    try { localStorage.removeItem(CHAT_KEY); } catch { }
  };

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fab-ai"
        title="Glappy Assist Log — Konsultasi error kompilasi"
      >
        <span className="text-base">🔧</span>
        <span className="hidden sm:inline">Glappy Assist</span>
        {open
          ? <span style={{ color: '#8b949e' }}>✕</span>
          : <span style={{ color: '#484f58', fontSize: '10px' }}>↗</span>
        }
      </button>

      {/* ── Overlay panel ── */}
      {open && (
        <div className="ai-overlay animate-fadeInUp">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: '#21262d', borderBottom: '1px solid #2d333b' }}
          >
            <div className="flex items-center gap-2">
              <span className="status-dot green glow-pulse" />
              <span className="font-mono text-sm font-semibold" style={{ color: '#4af626' }}>Glappy Assist Log</span>
              <span className="font-mono text-xs" style={{ color: '#484f58' }}>// troubleshooter</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearChat} className="font-mono text-xs" style={{ color: '#484f58' }} title="Clear chat">
                ⌫ clear
              </button>
              <button onClick={() => setOpen(false)} className="font-mono text-xs w-6 h-6 rounded flex items-center justify-center transition-colors"
                style={{ background: '#161b22', color: '#8b949e', border: '1px solid #373e47' }}>
                ✕
              </button>
            </div>
          </div>

          {/* Context badge */}
          {(deviceSpecs || library) && (
            <div className="px-3 py-1.5 flex items-center gap-2 flex-wrap" style={{ background: '#0d1117', borderBottom: '1px solid #21262d' }}>
              {deviceSpecs && (
                <span className="font-mono text-xs" style={{ color: '#484f58' }}>
                  <span style={{ color: '#58a6ff' }}>{deviceSpecs.os}</span>
                  {deviceSpecs.compiler && <> · <span style={{ color: '#8b949e' }}>{deviceSpecs.compiler}</span></>}
                </span>
              )}
              {library && (
                <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: '#1f3a2b', border: '1px solid #238636', color: '#4af626' }}>
                  {library.name}
                </span>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ background: '#0d1117' }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} onSuggestionClick={(s) => setInput(s)} />
            ))}
            {isLoading && (
              <div className="flex gap-1.5 items-center px-3 py-2 rounded" style={{ background: '#161b22' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#4af626', animationDelay: `${i * 0.15}s` }} />
                ))}
                <span className="font-mono text-xs ml-1" style={{ color: '#484f58' }}>analyzing...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid #21262d', background: '#161b22' }}>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Paste error log atau describe masalah..."
                className="flex-1 px-3 py-2 rounded font-mono text-xs outline-none"
                style={{
                  background: '#0d1117', border: '1px solid #373e47', color: '#c9d1d9',
                }}
                onFocus={e => { e.target.style.borderColor = '#238636'; e.target.style.boxShadow = '0 0 0 2px rgba(74,246,38,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#373e47'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="font-mono text-xs px-3 py-2 rounded transition-all duration-200 flex-shrink-0"
                style={{
                  background: isLoading || !input.trim() ? '#21262d' : '#238636',
                  border: '1px solid',
                  borderColor: isLoading || !input.trim() ? '#373e47' : '#2ea043',
                  color: isLoading || !input.trim() ? '#484f58' : '#fff',
                }}
              >
                send
              </button>
            </div>
            <div className="mt-1.5 font-mono text-xs text-center" style={{ color: '#373e47' }}>
              // Enter to send · Shift+Enter new line
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
