import { mandiService } from './mandiService.js';
import { priceForecastService } from './priceForecastService.js';

export interface PriceAlertRecord {
  id: string;
  type: 'price';
  commodity: string;
  district: string;
  state: string;
  direction: 'spike' | 'drop';
  percentChange: number;
  description: string;
  currentPrice: number;
  predictedPrice: number;
  severity: 'Critical' | 'Warning' | 'Low';
  createdAt: string;
}

const cacheMap = new Map<string, { timestamp: number; alerts: PriceAlertRecord[] }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

export const priceAlertService = {
  async detectPriceAlerts(state: string, district: string): Promise<PriceAlertRecord[]> {
    const cacheKey = `${state.toLowerCase()}_${district.toLowerCase()}`;
    const cached = cacheMap.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[priceAlertService] Cache hit for ${district}`);
      return cached.alerts;
    }

    console.log(`[priceAlertService] Cache miss for ${district}, calling ML API`);
    const alerts: PriceAlertRecord[] = [];
    const currentMonth = new Date().getMonth() + 1;

    try {
      // 1. Get current recorded prices for the district from mandiService
      const result = await mandiService.getPrices({ state, district, limit: 100 });
      if (!result.success || !result.rates || result.rates.length === 0) {
        return [];
      }

      // Group by commodity, pick the first one
      const commodityMap = new Map<string, any>();
      for (const rate of result.rates) {
        if (!commodityMap.has(rate.name)) {
          commodityMap.set(rate.name, rate);
        }
      }

      // 2. For each tracked commodity, predict fair price
      const trackedCommodities = Array.from(commodityMap.values());
      
      for (const record of trackedCommodities) {
        const commodity = record.name;
        const currentPrice = record.price || record.modalPrice;
        // Use sensible defaults matching the UI
        const variety = record.variety || 'Common';
        const grade = record.grade || 'FAQ';

        try {
          const prediction = await priceForecastService.predictFairPrice({
            state,
            district,
            commodity,
            variety,
            grade,
            arrivalMonth: currentMonth
          });

          if (prediction && prediction.predicted_modal_price) {
            const predictedPrice = prediction.predicted_modal_price;
            const deviation = ((predictedPrice - currentPrice) / currentPrice) * 100;
            const absDeviation = Math.abs(deviation);

            if (absDeviation > 15) {
              alerts.push({
                id: `price-alert-${district}-${commodity}-${Date.now()}`,
                type: 'price',
                commodity,
                district,
                state,
                direction: deviation > 0 ? 'spike' : 'drop',
                percentChange: Math.round(absDeviation * 10) / 10,
                currentPrice,
                predictedPrice,
                description: `Predicted price for ${commodity} is expected to ${deviation > 0 ? 'surge' : 'drop'} by ${Math.round(absDeviation)}% (₹${Math.round(predictedPrice)}/Qtl) compared to our mandi price database.`,
                severity: absDeviation > 25 ? 'Critical' : 'Warning',
                createdAt: new Date().toISOString()
              });
            }
          }
        } catch (err) {
          // Skip if one commodity fails to predict (e.g. timeout, service cold)
          console.warn(`[priceAlertService] Failed to predict price for ${commodity} in ${district}:`, err);
        }
      }

      // Update cache
      cacheMap.set(cacheKey, { timestamp: Date.now(), alerts });
      return alerts;
    } catch (err) {
      console.error(`[priceAlertService] Error detecting price alerts for ${district}:`, err);
      return [];
    }
  }
};
