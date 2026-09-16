// backend/src/routes/chatbot.routes.ts
import { Router } from 'express';
import { handleChatbotMessage } from '../controllers/chatbotController.js';

const router = Router();

// POST /api/chatbot
router.post('/chatbot', handleChatbotMessage);

export default router;
