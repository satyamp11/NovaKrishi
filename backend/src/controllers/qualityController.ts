import { Request, Response } from 'express';
import { fruitQualityService, FruitClassificationError } from '../services/fruitQualityService.js';

export const qualityController = {
  checkHealth: async (req: Request, res: Response) => {
    try {
      const health = await fruitQualityService.checkHealth();
      res.status(200).json({ success: true, qualityService: health });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  classifyImage: async (req: Request, res: Response): Promise<void> => {
    try {
      const uploadedFile = (req as any).file;
      if (!uploadedFile) {
        res.status(400).json({ success: false, message: 'No image file uploaded' });
        return;
      }

      const prediction = await fruitQualityService.classifyFruitImage(
        uploadedFile.buffer,
        uploadedFile.originalname,
        uploadedFile.mimetype
      );

      res.status(200).json({ success: true, prediction });
    } catch (error: any) {
      if (error instanceof FruitClassificationError) {
        const statusMap = {
          'SERVICE_UNAVAILABLE': 503,
          'TIMEOUT': 504,
          'INVALID_RESPONSE': 502,
          'API_ERROR': 502
        };
        const statusCode = statusMap[error.code] || 500;
        const retryable = error.code === 'TIMEOUT' || error.code === 'SERVICE_UNAVAILABLE';
        
        res.status(statusCode).json({
          success: false,
          message: error.message,
          errorCode: error.code,
          retryable
        });
        return;
      }

      console.error('Unexpected error during fruit classification:', error);
      res.status(500).json({ success: false, message: 'Internal server error during classification' });
    }
  }
};
