import React, { useState } from 'react';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const AIAssistant = ({ deviceSpecs, library }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Halo! Saya AI Assistant untuk membantu troubleshooting instalasi. Silakan tanyakan masalah yang Anda hadapi.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Call backend AI API
      const response = await apiRequest(API_ENDPOINTS.aiChat, {
        method: 'POST',
        body: JSON.stringify({
          message: currentInput,
          context: {
            deviceSpecs,
            library
          }
        })
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.aiResponse,
        suggestions: response.data.suggestions
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `❌ Error: ${error.message}\n\nPastikan backend server sudah running di http://localhost:5000`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-800">AI Troubleshooting Assistant</h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tanyakan masalah instalasi Anda..."
          className="input-field flex-1"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="btn-primary px-6"
        >
          Send
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        💡 Tip: Jelaskan error message atau masalah secara detail untuk solusi yang lebih akurat
      </div>
    </div>
  );
};

export default AIAssistant;
