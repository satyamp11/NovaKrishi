import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { scanService } from '../services/scanService.js';
import { aiScannerService } from '../services/aiScannerService.js';
export const scanController = {
  async createScan(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { cropName, diseaseName, diseaseHindi, confidence, imageUrl, result, recommendations, recommendationsHindi } = req.body;
      if (!cropName || !diseaseName) {
        return res.status(400).json({ success: false, message: 'Crop name and disease name are required' });
      }

      const scan = await scanService.createScan(req.user.id, {
        cropName,
        diseaseName,
        diseaseHindi: diseaseHindi || diseaseName,
        confidence: confidence || 95,
        imageUrl: imageUrl || '',
        result: result || 'Infected',
        recommendations: recommendations || [],
        recommendationsHindi: recommendationsHindi || []
      });

      return res.status(201).json({ success: true, scan });
    } catch (err) {
      console.error('Error creating crop scan:', err);
      return res.status(500).json({ success: false, message: 'Server error saving crop scan record' });
    }
  },

  async getFarmerScans(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { total, scans } = await scanService.getFarmerScans(req.user.id, page, limit);

      return res.status(200).json({
        success: true,
        total,
        page,
        limit,
        scans
      });
    } catch (err) {
      console.error('Error fetching crop scans:', err);
      return res.status(500).json({ success: false, message: 'Server error fetching crop scans' });
    }
  },

  async analyzeImage(req: AuthenticatedRequest, res: Response) {
    try {
      const { image, mimeType } = req.body;
      
      if (!image) {
        return res.status(400).json({ success: false, message: 'Image base64 data is required' });
      }

      // Default to jpeg if mimeType not provided
      const resolvedMimeType = mimeType || 'image/jpeg';
      
      // Basic size validation (approximate check based on base64 length)
      if (image.length > 50 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'Image is too large. Please upload an image under 35MB.' });
      }

      const analysis = await aiScannerService.analyzeImage(image, resolvedMimeType);
      
      return res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (err: any) {
      console.error('Error analyzing image:', err);
      return res.status(500).json({ 
        success: false, 
        message: err.message || 'Server error analyzing image with AI' 
      });
    }
  }
};
