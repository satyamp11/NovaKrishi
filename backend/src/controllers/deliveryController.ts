import { Request, Response } from 'express';
import { deliveryService } from '../services/deliveryService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { gpsSimulationService } from '../services/gpsSimulationService.js';

export const deliveryController = {
  // POST /api/delivery
  async createDelivery(req: AuthenticatedRequest, res: Response) {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ success: false, message: 'orderId is required.' });
      }

      const delivery = await deliveryService.createDelivery(req.body);
      return res.status(201).json({
        success: true,
        message: 'Delivery dispatch record created successfully.',
        delivery
      });
    } catch (error: any) {
      console.error('Error in createDelivery controller:', error);
      return res.status(500).json({ success: false, message: error.message || 'Unable to create delivery dispatch.' });
    }
  },

  // GET /api/delivery/:id
  async getDeliveryById(req: Request, res: Response) {
    try {
      const deliveryId = req.params.id as string;
      const delivery = await deliveryService.getDeliveryById(deliveryId);
      if (!delivery) {
        return res.status(404).json({ success: false, message: 'Delivery record not found.' });
      }
      return res.status(200).json({ success: true, delivery });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Unable to fetch delivery details.' });
    }
  },

  // GET /api/orders/:orderId/tracking
  async getOrderTracking(req: Request, res: Response) {
    try {
      const orderId = req.params.orderId as string;
      const tracking = await deliveryService.getOrderTracking(orderId);
      return res.status(200).json({ success: true, tracking });
    } catch (error: any) {
      console.error('Error in getOrderTracking controller:', error);
      return res.status(500).json({ success: false, message: error.message || 'Unable to fetch order tracking.' });
    }
  },

  // POST /api/delivery/location
  async updateLocation(req: Request, res: Response) {
    try {
      const { lat, lng } = req.body;
      if (lat === undefined || lng === undefined) {
        return res.status(400).json({ success: false, message: 'lat and lng are required.' });
      }

      const updated = await deliveryService.updateLocation(req.body);
      return res.status(200).json({
        success: true,
        message: 'Vehicle location snapshot updated.',
        delivery: updated
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Unable to update location.' });
    }
  },

  // POST /api/orders/:orderId/tracking/start
  async startSimulation(req: Request, res: Response) {
    try {
      const orderId = req.params.orderId as string;
      const result = await gpsSimulationService.startSimulation(orderId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to start simulation.' });
    }
  },

  // POST /api/orders/:orderId/tracking/stop
  async stopSimulation(req: Request, res: Response) {
    try {
      const orderId = req.params.orderId as string;
      const result = gpsSimulationService.stopSimulation(orderId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to stop simulation.' });
    }
  }
};
