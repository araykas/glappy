import express from 'express';
import { chatWithAI } from '../controllers/aiController.js';
import { validateAIChat } from '../middleware/validator.js';

const router = express.Router();

// POST /api/ai/chat - Chat with AI assistant
router.post('/chat', validateAIChat, chatWithAI);

export default router;
