import express from 'express';
import * as disputeController from '../controllers/disputeController.js';
import { requireAuth, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, disputeController.createDispute);
router.get('/', requireAuth, disputeController.getDisputes);
router.get('/:id', requireAuth, disputeController.getDisputeById);
router.put('/:id/status', requireAuth, authorizeRole('admin'), disputeController.updateDisputeStatus);

export default router;
