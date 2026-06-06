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
  body('deviceSpecs.osVersion')
    .notEmpty().withMessage('OS version is required')
    .matches(/^[A-Za-z0-9 .()+\-_,]{2,40}$/).withMessage('OS Version hanya boleh berisi huruf, angka, spasi, dan tanda umum, minimal 2 karakter.'),
  body('deviceSpecs.cpu')
    .notEmpty().withMessage('CPU is required')
    .isLength({ min: 3, max: 40 }).withMessage('CPU harus minimal 3 karakter dan maksimal 40 karakter.')
    .matches(/^[A-Za-z0-9 .()+_/-]+$/).withMessage('CPU hanya boleh berisi huruf, angka, spasi, dan simbol umum.')
    .custom((value) => {
      const vendorPattern = /\b(?:intel|amd|apple|ryzen|core|xeon|pentium|celeron|athlon|m1|m2)\b/i;
      return vendorPattern.test(value);
    }).withMessage('CPU harus valid dan menyertakan vendor seperti Intel, AMD, atau Apple.'),
  body('deviceSpecs.gpu')
    .notEmpty().withMessage('GPU is required')
    .isLength({ min: 3, max: 40 }).withMessage('GPU harus minimal 3 karakter dan maksimal 40 karakter.')
    .matches(/^[A-Za-z0-9 .()+_/-]+$/).withMessage('GPU hanya boleh berisi huruf, angka, spasi, dan simbol umum.')
    .custom((value) => {
      const vendorPattern = /\b(?:nvidia|amd|intel|geforce|radeon|rtx|gtx|iris|xe|mx|rx|quadro|titan)\b/i;
      return vendorPattern.test(value);
    }).withMessage('GPU harus valid dan menyertakan vendor seperti NVIDIA, AMD, atau Intel.'),
  body('deviceSpecs.ram')
    .notEmpty().withMessage('RAM is required')
    .matches(/^[1-9]\d*\s*GB$/i).withMessage('RAM harus dalam format seperti 8GB atau 16 GB.'),
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
