import { Router } from 'express';
import { scanController } from '../controllers/scanController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const scanRouter = Router();

// POST /api/scans - Save a new crop scan (Protected)
scanRouter.post('/', requireAuth, scanController.createScan);

// GET /api/scans - Fetch farmer's scan history (Protected)
scanRouter.get('/', requireAuth, scanController.getFarmerScans);

// POST /api/scans/analyze - Analyze crop image using Gemini AI
scanRouter.post('/analyze', scanController.analyzeImage);
