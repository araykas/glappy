import express from 'express';
import { generateCommands } from '../controllers/commandController.js';
import { validateCommandGeneration } from '../middleware/validator.js';

const router = express.Router();

// POST /api/commands/generate - Generate installation commands
router.post('/generate', validateCommandGeneration, generateCommands);

export default router;
