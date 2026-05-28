import express from 'express';
import { getLibraries, getLibraryDetails } from '../controllers/libraryController.js';

const router = express.Router();

// GET /api/libraries - Get all libraries
router.get('/', getLibraries);

// GET /api/libraries/:id - Get library details
router.get('/:id', getLibraryDetails);

export default router;
