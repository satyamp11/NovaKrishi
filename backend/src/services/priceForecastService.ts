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

// Strips HTML/gateway-error bodies down to a short, safe, human-readable string.
// Render's platform-level error pages return full HTML documents (with embedded
// base64 fonts) instead of JSON when the upstream ML service is asleep, crashed,
// or restarting. We never want to forward that raw markup to the client.
function sanitizeErrorBody(body: string): string {
  if (!body) return '';
  const looksLikeHtml = /<!DOCTYPE|<html|<head|<body/i.test(body);
  if (looksLikeHtml) {
    return 'The upstream ML service returned a gateway error page instead of data.';
  }
  return body.slice(0, 300);
}

async function doFetch<T>(urlString: string, timeoutMs: number): Promise<T> {
  const abort = new AbortController();

  const fetchPromise = fetch(urlString, { signal: abort.signal })
    .then(async (res) => {
      if (!res.ok) {
        const rawBody = await res.text().catch(() => '');
        const safeBody = sanitizeErrorBody(rawBody);
        if (res.status === 422) {
          throw new PriceForecastServiceError(`Validation error: ${safeBody}`, 'VALIDATION_ERROR');
        }
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          // These are the codes Render's proxy returns while the free-tier
          // instance is asleep, restarting, or crash-looping.
          throw new PriceForecastServiceError(
            `ML service is unavailable (HTTP ${res.status}). It may be waking up from sleep.`,
            'SERVICE_UNAVAILABLE'
          );
        }
        throw new PriceForecastServiceError(`API returned error ${res.status}: ${safeBody}`, 'API_ERROR');
      }
      return res.json();
    });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      abort.abort(); // Attempt to clean up underlying socket
      reject(new PriceForecastServiceError(`API timed out after ${timeoutMs}ms`, 'TIMEOUT'));
    }, timeoutMs);
  });

  return Promise.race([fetchPromise, timeoutPromise]);
}

async function fetchFromApi<T>(
  endpoint: string,
  queryParams: Record<string, any> = {},
  // Render free-tier cold starts can take 30-50s. 10s was too aggressive and
  // caused false timeouts/502s on the very first request after idle.
  timeoutMs: number = 30000,
  useCache: boolean = false
): Promise<T> {
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

  try {
    const data = await doFetch<T>(urlString, timeoutMs);

    if (useCache) {
      cacheMap.set(urlString, { timestamp: Date.now(), data });
    }

    return data;
  } catch (err: any) {
    const isColdStartError =
      err instanceof PriceForecastServiceError &&
      (err.code === 'TIMEOUT' || err.code === 'SERVICE_UNAVAILABLE');

    // One automatic retry: the first request to a sleeping Render service is
    // what wakes it up. By the time we retry a few seconds later it's often
    // already up, so most users never see an error at all.
    if (isColdStartError) {
      console.warn(`⚠️ [PriceForecast] ${err.message} on ${endpoint} — retrying once after wake-up delay...`);
      try {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        const data = await doFetch<T>(urlString, timeoutMs);
        if (useCache) {
          cacheMap.set(urlString, { timestamp: Date.now(), data });
        }
        return data;
      } catch (retryErr: any) {
        console.error(`❌ [PriceForecast] Retry failed on ${endpoint}:`, retryErr.message);
        if (retryErr instanceof PriceForecastServiceError) throw retryErr;
        throw new PriceForecastServiceError(`Failed to reach API: ${retryErr.message}`, 'SERVICE_UNAVAILABLE');
      }
    }

    if (err instanceof PriceForecastServiceError) {
      console.error(`❌ [PriceForecast] Error on endpoint ${endpoint}:`, err.message);
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
    return fetchFromApi<string[]>('/states', {}, 30000, true);
  },

  async getDistricts(state: string): Promise<string[]> {
    return fetchFromApi<string[]>('/districts', { State: state }, 30000, false);
  },

  async getCommodities(state?: string, district?: string): Promise<string[]> {
    return fetchFromApi<string[]>('/commodities', { State: state, District: district }, 30000, false);
  },

  async getVarieties(state?: string, district?: string, commodity?: string): Promise<string[]> {
    return fetchFromApi<string[]>('/varieties', { State: state, District: district, Commodity: commodity }, 30000, false);
  },

  async getGrades(state?: string, district?: string, commodity?: string, variety?: string): Promise<string[]> {
    return fetchFromApi<string[]>('/grades', { State: state, District: district, Commodity: commodity, Variety: variety }, 30000, false);
  },

  async getMonths(): Promise<number[]> {
    return fetchFromApi<number[]>('/months', {}, 30000, true);
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
    // 35s timeout for cold starts on the heavy ML model endpoint
    return fetchFromApi<PricePredictionResponse>('/predict-price', query, 35000, false);
  }
};
