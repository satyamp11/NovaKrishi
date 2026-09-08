/**
 * priceForecastService.ts
 * 
 * Integrates the ML Price Prediction API:
 * https://price-prediction-nolh.onrender.com
 *
 * Provides typed errors, explicit timeouts, and no fabricated fallbacks.
 */

// ─── Typed Error ──────────────────────────────────────────────────────────────

export class PriceForecastServiceError extends Error {
  public readonly code: 'SERVICE_UNAVAILABLE' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'API_ERROR' | 'VALIDATION_ERROR';

  constructor(
    message: string,
    code: 'SERVICE_UNAVAILABLE' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'API_ERROR' | 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'PriceForecastServiceError';
    this.code = code;
  }
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface PricePredictionResponse {
  currency: string;
  input: {
    Arrival_Month: number;
    Commodity: string;
    District: string;
    Grade: string;
    State: string;
    Variety: string;
  };
  model_version: number;
  predicted_modal_price: number;
  unit: string;
}

export interface PredictionParams {
  state: string;
  district: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalMonth: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  return (process.env.PRICE_PREDICTION_API_URL || 'https://price-prediction-nolh.onrender.com').replace(/\/+$/, '');
}

// Simple in-memory cache for static reference endpoints
const cacheMap = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchFromApi<T>(endpoint: string, queryParams: Record<string, any> = {}, timeoutMs: number = 10000, useCache: boolean = false): Promise<T> {
  const BASE_URL = getBaseUrl();
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  const urlString = url.toString();

  if (useCache && cacheMap.has(urlString)) {
    const cached = cacheMap.get(urlString)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const abort = new AbortController();

  const fetchPromise = fetch(urlString, { signal: abort.signal })
    .then(async (res) => {
      if (!res.ok) {
        const errorBody = await res.text().catch(() => '');
        if (res.status === 422) {
          throw new PriceForecastServiceError(`Validation error: ${errorBody}`, 'VALIDATION_ERROR');
        }
        throw new PriceForecastServiceError(`API returned error ${res.status}: ${errorBody}`, 'API_ERROR');
      }
      return res.json();
    });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      abort.abort(); // Attempt to clean up underlying socket
      reject(new PriceForecastServiceError(`API timed out after ${timeoutMs}ms`, 'TIMEOUT'));
    }, timeoutMs);
  });

  try {
    const data = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (useCache) {
      cacheMap.set(urlString, { timestamp: Date.now(), data });
    }
    
    return data;
  } catch (err: any) {
    if (err instanceof PriceForecastServiceError) {
      if (err.code === 'TIMEOUT') {
        console.warn(`⚠️ [PriceForecast] ${err.message} on endpoint ${endpoint}`);
      } else {
        console.error(`❌ [PriceForecast] Error on endpoint ${endpoint}:`, err.message);
      }
      throw err;
    }
    
    if (err.name === 'AbortError') {
      console.warn(`⚠️ [PriceForecast] Request aborted (likely timeout) on endpoint ${endpoint}`);
      throw new PriceForecastServiceError(`API timed out after ${timeoutMs}ms`, 'TIMEOUT');
    }
    
    console.error(`❌ [PriceForecast] Failed to reach API on ${endpoint}:`, err.message);
    throw new PriceForecastServiceError(`Failed to reach API: ${err.message}`, 'SERVICE_UNAVAILABLE');
  }
}

export const priceForecastService = {
  async getStates(): Promise<string[]> {
    return fetchFromApi<string[]>('/states', {}, 10000, true);
  },

  async getDistricts(state: string): Promise<string[]> {
    return fetchFromApi<string[]>('/districts', { State: state }, 10000, false);
  },

  async getCommodities(state?: string, district?: string): Promise<string[]> {
    return fetchFromApi<string[]>('/commodities', { State: state, District: district }, 10000, false);
  },

  async getVarieties(state?: string, district?: string, commodity?: string): Promise<string[]> {
    return fetchFromApi<string[]>('/varieties', { State: state, District: district, Commodity: commodity }, 10000, false);
  },

  async getGrades(state?: string, district?: string, commodity?: string, variety?: string): Promise<string[]> {
    return fetchFromApi<string[]>('/grades', { State: state, District: district, Commodity: commodity, Variety: variety }, 10000, false);
  },

  async getMonths(): Promise<number[]> {
    return fetchFromApi<number[]>('/months', {}, 10000, true);
  },

  async predictPrice(params: PredictionParams): Promise<PricePredictionResponse> {
    const query = {
      State: params.state,
      District: params.district,
      Commodity: params.commodity,
      Variety: params.variety,
      Grade: params.grade,
      Arrival_Month: params.arrivalMonth
    };
    // 20s timeout for cold starts on the heavy ML model endpoint
    return fetchFromApi<PricePredictionResponse>('/predict-price', query, 20000, false);
  }
};
