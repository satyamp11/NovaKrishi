import { Response } from 'express';
import { authService } from '../services/authService.js';
import { otpService } from '../services/otpService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const authController = {
  // POST /api/auth/send-otp - Request OTP for mobile or email
  async sendOtp(req: AuthenticatedRequest, res: Response) {
    try {
      const { identifier, emailOrPhone, phone } = req.body;
      const targetIdentifier = identifier || emailOrPhone || phone;

      if (!targetIdentifier) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number or email address is required.'
        });
      }

      const result = await otpService.sendOtp(targetIdentifier);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in sendOtp controller:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while generating OTP. Please try again.'
      });
    }
  },

  // POST /api/auth/verify-otp - Verify OTP and Authenticate User
  async verifyOtp(req: AuthenticatedRequest, res: Response) {
    try {
      const { identifier, emailOrPhone, phone, otp, name, state, district, village, primaryCrop } = req.body;
      const targetIdentifier = identifier || emailOrPhone || phone;

      if (!targetIdentifier) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number or email address is required.'
        });
      }

      if (!otp) {
        return res.status(400).json({
          success: false,
          message: '6-digit OTP code is required.'
        });
      }

      const result = await otpService.verifyOtp(targetIdentifier, otp, {
        name,
        state,
        district,
        village,
        primaryCrop
      });

      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in verifyOtp controller:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while verifying OTP. Please try again.'
      });
    }
  },

  async register(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await authService.register(req.body);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(201).json(result);
    } catch (error) {
      console.error('Error during registration:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected server error occurred during registration.',
        error: error
      });
    }
  },

  async login(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await authService.login(req.body);
      if (!result.success) {
        return res.status(401).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({
        success: false,
        message: 'An unexpected server error occurred during login.'
      });
    }
  },

  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized request.'
        });
      }
      return res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch user profile.'
      });
    }
  },

  async logout(_req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
};
