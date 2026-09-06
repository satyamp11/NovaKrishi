import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, reviewController.createReview);
router.get('/user/:userId', requireAuth, reviewController.getUserReviews);
router.get('/order/:orderId', requireAuth, reviewController.getOrderReviews);

export default router;
