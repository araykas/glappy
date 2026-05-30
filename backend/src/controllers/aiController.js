import { generateAIResponse } from '../services/aiService.js';
import { saveAIChatHistory } from '../services/databaseService.js';
import { isSupabaseConfigured } from '../config/supabase.js';

export const chatWithAI = async (req, res, next) => {
  try {
    const { message, context, sessionId } = req.body;

    // Generate AI response — Groq jika dikonfigurasi, fallback ke rule-based
    const response = await generateAIResponse(message, context);

    // Hanya simpan ke DB kalau pertanyaan relevan (bukan off-topic)
    // Tidak ada gunanya nyimpen percakapan yang tidak relevan
    if (isSupabaseConfigured() && sessionId && !response.offTopic) {
      const saveResult = await saveAIChatHistory(sessionId, message, response, context);
      if (!saveResult.success) {
        console.warn('⚠️  Failed to save AI chat history:', saveResult.error);
      }
    }

    res.json({
      success: true,
      data: {
        userMessage: message,
        aiResponse: response.message,
        suggestions: response.suggestions || [],
        offTopic: response.offTopic || false,
        timestamp: new Date().toISOString(),
        context: {
          library: context?.library?.name || null,
          os: context?.deviceSpecs?.os || null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
