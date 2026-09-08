import { Router } from 'express';
import { priceForecastController } from '../controllers/priceForecastController.js';

export const priceForecastRouter = Router();

priceForecastRouter.get('/states', priceForecastController.getStates);
priceForecastRouter.get('/districts', priceForecastController.getDistricts);
priceForecastRouter.get('/commodities', priceForecastController.getCommodities);
priceForecastRouter.get('/varieties', priceForecastController.getVarieties);
priceForecastRouter.get('/grades', priceForecastController.getGrades);
priceForecastRouter.get('/months', priceForecastController.getMonths);
priceForecastRouter.post('/predict', priceForecastController.predictPrice);
