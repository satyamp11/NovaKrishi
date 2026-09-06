import { Response } from 'express';
import { userService } from '../services/userService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const userController = {
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      const user = await userService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found.'
        });
      }

      return res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching user profile.'
      });
    }
  },

  async getUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found.'
        });
      }
      return res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Error fetching specific user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred.'
      });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      const { name, state, district, village, primaryCrop, profileImage, farmInfo, deliveryAddress, businessInfo, vehicleInfo } = req.body;

      const updatedUser = await userService.updateUserProfile(req.user.id, {
        name,
        state,
        district,
        village,
        primaryCrop,
        profileImage,
        farmInfo,
        deliveryAddress,
        businessInfo,
        vehicleInfo
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found or update failed.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while updating the profile.'
      });
    }
  }
};
