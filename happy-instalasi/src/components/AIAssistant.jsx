import { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../config/api';
import { getSessionId } from '../config/session';

// Code Block - sama dengan CommandGenerator style
const CodeBlock = ({ code, onCopy, isCopied }) => (
  <div className="my-3 rounded-lg overflow-hidden border border-gray-200">
    <div className="flex justify-between items-center bg-gray-800 px-4 py-2">
      <span className="text-xs text-gray-400 font-mono">code</span>
      <button onClick={onCopy} className="btn-secondary text-xs py-1 px-3">
        {isCopied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
    <div className="bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-x-auto whitespace-pre">
      {code}
    </div>
  </div>
);

// Inline bold/code renderer
const renderInline = (text) => {
  const parts = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith('`')) {
      parts.push(
        <code key={m.index} className="bg-gray-100 text-sky-700 px-1.5 py-0.5 rounded text-xs font-mono">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(
        <strong key={m.index} className="font-semibold text-gray-800">
          {token.slice(2, -2)}
        </strong>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
};

// Rich Text Renderer
const RichText = ({ text, copiedKey, onCopy }) => {
  if (!text) return null;
  const codeBlockRe = /```(?:\w+)?\n?([\s\S]*?)```/g;
  const segments = [];
  let lastIndex = 0;
  let match;
  while ((match = codeBlockRe.exec(text)) !== null) {
    if (match.index > lastIndex) segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    segments.push({ type: 'code', content: match[1].trim(), key: `code-${match.index}` });
    lastIndex = codeBlockRe.lastIndex;
  }
  if (lastIndex < text.length) segments.push({ type: 'text', content: text.slice(lastIndex) });

  return (
    <div className="space-y-1">
      {segments.map((seg, i) => {
        if (seg.type === 'code') {
          return (
            <CodeBlock key={i} code={seg.content} isCopied={copiedKey === seg.key} onCopy={() => onCopy(seg.content, seg.key)} />
          );
        }
        const lines = seg.content.split('\n');
        return (
          <div key={i} className="space-y-1">
            {lines.map((line, li) => {
              if (!line.trim()) return <div key={li} className="h-2" />;
              const bulletMatch = line.match(/^[-*]\s+(.*)/);
              if (bulletMatch) return (
                <div key={li} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                  <span>{renderInline(bulletMatch[1])}</span>
                </div>
              );
              const numMatch = line.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) return (
                <div key={li} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-semibold">{numMatch[1]}</span>
                  <span>{renderInline(numMatch[2])}</span>
                </div>
              );
              if (line.startsWith('## ')) return <p key={li} className="text-sm font-bold text-gray-800 mt-2">{line.slice(3)}</p>;
              if (line.startsWith('# ')) return <p key={li} className="text-base font-bold text-gray-800 mt-2">{line.slice(2)}</p>;
              return <p key={li} className="text-sm text-gray-700 leading-relaxed">{renderInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

// Message Bubble
const MessageBubble = ({ msg, onSuggestionClick }) => {
  const [expanded, setExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isLong = (msg.content || '').length > 500 || (msg.content || '').includes('```');

  // User bubble
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-sky-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm">
          <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
        </div>
      </div>
    );
  }

  // Off-topic assistant bubble - pakai card style sama dengan CommandGenerator warning section
  if (msg.offTopic) {
    return (
      <div className="flex flex-col items-start max-w-[90%] w-full">
        <div className="w-full border border-amber-200 rounded-lg p-4 bg-amber-50">
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span className="text-sm font-semibold text-amber-700">Di luar topik instalasi library</span>
          </div>
          <div className={isLong && !expanded ? 'max-h-32 overflow-hidden relative' : ''}>
            <RichText text={msg.content} copiedKey={copiedKey} onCopy={handleCopy} />
            {isLong && !expanded && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-50 to-transparent" />
            )}
          </div>
          {isLong && (
            <button onClick={() => setExpanded(x => !x)} className="mt-2 text-xs text-amber-600 underline">
              {expanded ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
            </button>
          )}
        </div>
        {msg.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {msg.suggestions.map((s, i) => (
              <button key={i} onClick={() => onSuggestionClick(s)} className="text-xs bg-white border border-sky-200 text-sky-700 px-3 py-1 rounded-full hover:bg-sky-50 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Normal assistant bubble - pakai card style sama dengan CommandGenerator section
  return (
    <div className="flex flex-col items-start max-w-[90%] w-full">
      <div className="w-full border border-gray-200 rounded-lg p-4 bg-white hover:border-sky-300 transition-colors">
        <div className={isLong && !expanded ? 'max-h-40 overflow-hidden relative' : ''}>
          <RichText text={msg.content} copiedKey={copiedKey} onCopy={handleCopy} />
          {isLong && !expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
        {isLong && (
          <button onClick={() => setExpanded(x => !x)} className="mt-2 text-xs text-sky-600 underline">
            {expanded ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
          </button>
        )}
      </div>
      {msg.suggestions?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {msg.suggestions.map((s, i) => (
            <button key={i} onClick={() => onSuggestionClick(s)} className="text-xs bg-white border border-sky-200 text-sky-700 px-3 py-1 rounded-full hover:bg-sky-50 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component
const AIAssistant = ({ deviceSpecs, library, generatedCommands }) => {
  const CHAT_KEY = 'hi_chatHistory';

  const loadChat = () => {
    try {
      const val = localStorage.getItem(CHAT_KEY);
      return val ? JSON.parse(val) : [{
        role: 'assistant',
        content: 'Halo! Saya AI Assistant untuk membantu troubleshooting instalasi graphics library. Silakan tanyakan masalah yang Anda hadapi.',
        offTopic: false,
        suggestions: [],
      }];
    } catch {
      return [{
        role: 'assistant',
        content: 'Halo! Saya AI Assistant untuk membantu troubleshooting instalasi graphics library. Silakan tanyakan masalah yang Anda hadapi.',
        offTopic: false,
        suggestions: [],
      }];
    }
  };

  const [messages, setMessages] = useState(loadChat);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  // Simpan chat ke localStorage setiap kali messages berubah
  useEffect(() => {
    try {
      // Batasi simpan maks 50 pesan terakhir agar tidak overload storage
      const toSave = messages.slice(-50);
      localStorage.setItem(CHAT_KEY, JSON.stringify(toSave));
    } catch {}
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.aiChat, {
        method: 'POST',
        body: JSON.stringify({
          message: currentInput,
          sessionId: getSessionId(),
          context: { deviceSpecs, library, generatedCommands }
        })
      });
      const aiContent = response?.data?.aiResponse ?? response?.aiResponse ?? 'Tidak ada respons dari AI.';
      const suggestions = response?.data?.suggestions ?? response?.suggestions ?? [];
      const offTopic = response?.data?.offTopic ?? response?.offTopic ?? false;
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent, suggestions, offTopic }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Error:** ${error.message}\n\nPastikan backend server sudah running di \`http://localhost:5000\``,
        offTopic: false,
        suggestions: [],
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card">
      {/* Header - sama dengan CommandGenerator section header */}
      <div className="flex items-center space-x-2 mb-4">
        <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-800">🤖 AI Troubleshooting Assistant</h2>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full">
            🎯 Fokus: Instalasi Library
          </span>
          <button
            onClick={() => {
              const init = [{
                role: 'assistant',
                content: 'Halo! Saya AI Assistant untuk membantu troubleshooting instalasi graphics library. Silakan tanyakan masalah yang Anda hadapi.',
                offTopic: false,
                suggestions: [],
              }];
              setMessages(init);
              try { localStorage.removeItem('hi_chatHistory'); } catch {}
            }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-red-300"
            title="Hapus riwayat chat"
          >
            🗑️ Hapus Chat
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg, index) => (
          <MessageBubble key={index} msg={msg} onSuggestionClick={(s) => setInput(s)} />
        ))}

        {/* Loading - sama dengan CommandGenerator loading style */}
        {isLoading && (
          <div className="flex items-start max-w-[90%]">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                <span className="text-xs text-gray-500 ml-1">AI sedang memproses...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanyakan masalah instalasi Anda..."
          className="input-field flex-1"
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="btn-primary px-6">
          Kirim
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        💡 Tip: Jelaskan error message atau masalah secara detail untuk solusi yang lebih akurat
      </div>
    </div>
  );
};

export default AIAssistant;
