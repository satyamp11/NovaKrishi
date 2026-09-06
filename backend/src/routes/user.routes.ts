import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const userRouter = Router();

// GET /api/users/profile - Get authenticated user profile
userRouter.get('/profile', requireAuth, userController.getProfile);

// GET /api/users/profile/:id - Get specific user profile
userRouter.get('/profile/:id', requireAuth, userController.getUserProfile);

// PUT /api/users/profile - Update authenticated user profile
userRouter.put('/profile', requireAuth, userController.updateProfile);
