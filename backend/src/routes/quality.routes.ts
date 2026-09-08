import { Router } from 'express';
import multer from 'multer';
import { qualityController } from '../controllers/qualityController.js';

// Restrict uploads to images only (8MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed'));
    }
  }
});

const router = Router();

// Health check endpoint (for UI to proactively show "waking up" status if Render is cold)
router.get('/health', qualityController.checkHealth);

// The main prediction endpoint
router.post('/classify', upload.single('file'), qualityController.classifyImage);

export default router;
