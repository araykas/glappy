import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

export const validateCommandGeneration = [
  body('libraryId').notEmpty().withMessage('Library ID is required'),
  body('deviceSpecs').isObject().withMessage('Device specs must be an object'),
  body('deviceSpecs.os').notEmpty().withMessage('OS is required'),
  body('deviceSpecs.cpu').notEmpty().withMessage('CPU is required'),
  validateRequest
];

export const validateAIChat = [
  body('message').notEmpty().withMessage('Message is required'),
  body('context').optional().isObject().withMessage('Context must be an object'),
  body('chatHistory').optional().isArray().withMessage('Chat history must be an array'),
  body('chatHistory.*.role')
    .optional()
    .isString()
    .isIn(['user', 'assistant'])
    .withMessage('Chat history roles must be either user or assistant'),
  body('chatHistory.*.content')
    .optional()
    .notEmpty()
    .withMessage('Chat history content must be provided'),
  validateRequest
];
