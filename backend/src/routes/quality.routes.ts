import { Router } from 'express';
import multer from 'multer';
import { qualityController } from '../controllers/qualityController.js';

export const qualityRouter = Router();

// ─── Multer config: memory storage, image-only, 8MB limit ────────────────────
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are accepted.`));
    }
  }
});

// Error handler for multer validation errors (file too large, wrong type)
function handleMulterError(err: any, _req: any, res: any, next: any) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err && err.message && err.message.includes('Invalid file type')) {
    return res.status(415).json({ success: false, message: err.message });
  }
  next(err);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/quality/health - Check if ML classification service is reachable
qualityRouter.get('/health', qualityController.getServiceHealth);

// POST /api/quality/classify - Upload fruit image and get quality prediction
qualityRouter.post(
  '/classify',
  (req, res, next) => upload.single('file')(req, res, (err) => handleMulterError(err, req, res, next)),
  qualityController.classifyFruitImage
);

export default qualityRouter;
