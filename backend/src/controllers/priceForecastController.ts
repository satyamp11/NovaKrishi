import { Request, Response } from 'express';
import { priceForecastService, PriceForecastServiceError } from '../services/priceForecastService.js';

function handleError(res: Response, err: unknown) {
  if (err instanceof PriceForecastServiceError) {
    if (err.code === 'TIMEOUT') {
      return res.status(504).json({ success: false, message: err.message, code: err.code });
    }
    if (err.code === 'VALIDATION_ERROR') {
      return res.status(422).json({ success: false, message: err.message, code: err.code });
    }
    return res.status(502).json({ success: false, message: err.message, code: err.code });
  }
  return res.status(500).json({ success: false, message: 'Internal Server Error' });
}

export const priceForecastController = {
  async getStates(req: Request, res: Response) {
    try {
      const data = await priceForecastService.getStates();
      res.json({ success: true, data });
    } catch (err) {
      handleError(res, err);
    }
  },

  async getDistricts(req: Request, res: Response) {
    try {
      const state = req.query.state as string;
      const data = await priceForecastService.getDistricts(state);
      res.json({ success: true, data });
    } catch (err) {
      handleError(res, err);
    }
  },

  async getCommodities(req: Request, res: Response) {
    try {
      const state = req.query.state as string;
      const district = req.query.district as string;
      const data = await priceForecastService.getCommodities(state, district);
      res.json({ success: true, data });
    } catch (err) {
      handleError(res, err);
    }
  },

  async getVarieties(req: Request, res: Response) {
    try {
      const state = req.query.state as string;
      const district = req.query.district as string;
      const commodity = req.query.commodity as string;
      const data = await priceForecastService.getVarieties(state, district, commodity);
      res.json({ success: true, data });
    } catch (err) {
      handleError(res, err);
    }
  },

  async getGrades(req: Request, res: Response) {
    try {
      const state = req.query.state as string;
      const district = req.query.district as string;
      const commodity = req.query.commodity as string;
      const variety = req.query.variety as string;
      const data = await priceForecastService.getGrades(state, district, commodity, variety);
      res.json({ success: true, data });
    } catch (err) {
      handleError(res, err);
    }
  },

  async getMonths(req: Request, res: Response) {
    try {
      const data = await priceForecastService.getMonths();
      res.json({ success: true, data });
    } catch (err) {
      handleError(res, err);
    }
  },

  async predictPrice(req: Request, res: Response) {
    try {
      const { state, district, commodity, variety, grade, arrivalMonth } = req.body;
      
      if (!state || !district || !commodity || !variety || !grade || !arrivalMonth) {
        return res.status(400).json({ success: false, message: 'Missing required parameters' });
      }

      const data = await priceForecastService.predictPrice({
        state,
        district,
        commodity,
        variety,
        grade,
        arrivalMonth: Number(arrivalMonth)
      });

      res.json({ success: true, data });
    } catch (err) {
      handleError(res, err);
    }
  }
};
