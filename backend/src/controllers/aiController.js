import { generateAIResponse } from '../services/aiService.js';

export const chatWithAI = (req, res, next) => {
  try {
    const { message, context } = req.body;

    // Generate AI response (currently using dummy/rule-based)
    // Nanti bisa diganti dengan actual AI API call
    const response = generateAIResponse(message, context);

    res.json({
      success: true,
      data: {
        userMessage: message,
        aiResponse: response.message,
        suggestions: response.suggestions || [],
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
