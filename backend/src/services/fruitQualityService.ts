/**
 * fruitQualityService.ts
 * 
 * Integrates the real Fruit Quality Classification ML API:
 * https://fruit-classification-way1.onrender.com
 *
 * Pattern: mirrors aiRouteOptimizationService.ts — env-var URL, health check,
 * timeout handling, typed error thrown on failure (no silent fake fallback).
 */

// ─── Typed Error ──────────────────────────────────────────────────────────────

export class FruitClassificationError extends Error {
  public readonly code: 'SERVICE_UNAVAILABLE' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'API_ERROR';

  constructor(
    message: string,
    code: 'SERVICE_UNAVAILABLE' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'API_ERROR'
  ) {
    super(message);
    this.name = 'FruitClassificationError';
    this.code = code;
  }
}

// ─── Response Type — import from shared types (confirmed by live smoke test) ───
export interface FruitQualityPrediction {
  success: boolean;
  message: string;
  filename: string;
  product: string;
  product_confidence: number;
  quality: string;
  quality_confidence: number;
  [key: string]: unknown; // allow API to add fields without breaking
}

// ─── Service ──────────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  return (process.env.FRUIT_CLASSIFICATION_API_URL || '').replace(/\/+$/, '');
}

export const fruitQualityService = {
  /**
   * Health check — calls GET /health with a 3-second timeout.
   */
  async checkHealth(): Promise<{ healthy: boolean; message?: string }> {
    const BASE_URL = getBaseUrl();
    if (!BASE_URL) {
      return { healthy: false, message: 'FRUIT_CLASSIFICATION_API_URL not configured' };
    }

    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 3000);

    try {
      const res = await fetch(`${BASE_URL}/health`, { signal: abort.signal });
      clearTimeout(timeout);
      if (res.ok) {
        return { healthy: true };
      }
      return { healthy: false, message: `Health check returned HTTP ${res.status}` };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return { healthy: false, message: 'Health check timed out (service may be cold-starting)' };
      }
      return { healthy: false, message: err.message || 'Unreachable' };
    }
  },

  /**
   * Classifies a fruit image via POST /predict.
   * Allows 20s for Render cold starts (matches route-optimization pattern).
   */
  async classifyFruitImage(
    fileBuffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<FruitQualityPrediction> {
    const BASE_URL = getBaseUrl();
    if (!BASE_URL) {
      throw new FruitClassificationError(
        'Fruit Classification API URL is not configured on the server.',
        'SERVICE_UNAVAILABLE'
      );
    }

    console.info(`🍎 [FruitQuality] Sending image "${filename}" (${Math.round(fileBuffer.length / 1024)}KB) to ${BASE_URL}/predict`);

    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 20000); // 20s for cold start

    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimetype });
      formData.append('file', blob, filename);

      const res = await fetch(`${BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
        signal: abort.signal
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorBody = await res.text().catch(() => '');
        console.error(`⚠️ [FruitQuality] API returned ${res.status}: ${errorBody}`);
        throw new FruitClassificationError(
          `Fruit Classification API returned error ${res.status}`,
          'API_ERROR'
        );
      }

      const data = await res.json();
      console.info(`✅ [FruitQuality] Prediction received:`, JSON.stringify(data));
      return data as FruitQualityPrediction;

    } catch (err: any) {
      clearTimeout(timeout);

      if (err instanceof FruitClassificationError) throw err;

      if (err.name === 'AbortError') {
        throw new FruitClassificationError(
          'Fruit Classification API timed out. The service may be waking up — please retry in 30 seconds.',
          'TIMEOUT'
        );
      }

      throw new FruitClassificationError(
        `Failed to reach Fruit Classification API: ${err.message}`,
        'SERVICE_UNAVAILABLE'
      );
    }
  }
};
