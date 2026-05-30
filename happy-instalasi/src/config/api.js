// API Configuration untuk connect ke backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export const API_ENDPOINTS = {
  // Health check
  health: `${API_BASE_URL}/health`,

  // Libraries
  libraries: `${API_BASE_URL}/libraries`,
  libraryDetails: (id) => `${API_BASE_URL}/libraries/${id}`,

  // Commands
  generateCommands: `${API_BASE_URL}/commands/generate`,

  // AI Assistant
  aiChat: `${API_BASE_URL}/ai/chat`,
};

// Helper function untuk fetch dengan error handling
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default API_BASE_URL;
