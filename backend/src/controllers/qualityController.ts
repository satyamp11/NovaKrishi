import { Request, Response } from 'express';
import { fruitQualityService, FruitClassificationError } from '../services/fruitQualityService.js';

export const qualityController = {
  /**
   * GET /api/quality/health
   * Reports whether the external Fruit Classification ML service is currently reachable.
   * Frontend uses this to proactively show "quality check temporarily unavailable" state.
   */
  async getServiceHealth(req: Request, res: Response) {
    const status = await fruitQualityService.checkHealth();
    return res.status(200).json({
      success: true,
      qualityService: {
        healthy: status.healthy,
        message: status.message,
        apiUrl: process.env.FRUIT_CLASSIFICATION_API_URL || 'NOT_CONFIGURED',
        checkedAt: new Date().toISOString()
      }
    });
  },

  /**
   * POST /api/quality/classify
   * Accepts a fruit image upload (via multer), validates it,
   * and proxies it to the external ML API for quality classification.
   *
   * Returns the raw ML API prediction — no fabricated fallbacks.
   * If the ML service is unavailable, returns a clear 503 with retry guidance.
   */
  async classifyFruitImage(req: Request, res: Response) {
    try {
      // multer populates req.file after middleware runs
      const file = (req as any).file as Express.Multer.File | undefined;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided. Please upload a fruit image (JPEG, PNG, or WebP).'
        });
      }

      const prediction = await fruitQualityService.classifyFruitImage(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      return res.status(200).json({
        success: true,
        prediction,
        meta: {
          filename: file.originalname,
          sizeBytes: file.size,
          mimetype: file.mimetype,
          classifiedAt: new Date().toISOString()
        }
      });

    } catch (err) {
      if (err instanceof FruitClassificationError) {
        // Map error codes to appropriate HTTP status codes
        const statusCode = err.code === 'TIMEOUT' ? 504
          : err.code === 'SERVICE_UNAVAILABLE' ? 503
          : err.code === 'API_ERROR' ? 502
          : 500;

        return res.status(statusCode).json({
          success: false,
          errorCode: err.code,
          message: err.message,
          retryable: err.code === 'TIMEOUT' || err.code === 'SERVICE_UNAVAILABLE'
        });
      }

      console.error('Unexpected error in qualityController.classifyFruitImage:', err);
      return res.status(500).json({
        success: false,
        message: 'An unexpected server error occurred during fruit quality classification.'
      });
    }
  }
};
