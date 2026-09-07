/**
 * Unit tests for fruitQualityService
 *
 * Mock response shape CONFIRMED by live smoke test on 2026-09-07:
 * POST https://fruit-classification-way1.onrender.com/predict → HTTP 200
 * {"success":true,"message":"Prediction successful","filename":"test_apple.png",
 *  "product":"Apple","product_confidence":95.36,"quality":"Good","quality_confidence":99.97}
 */

// In ESM + ts-jest, jest global must be imported explicitly
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Increase timeout for the global setup.ts MongoMemoryServer.create() call
jest.setTimeout(30000);

import { fruitQualityService, FruitClassificationError } from '../services/fruitQualityService.js';

// ─── Real response shape from live smoke test ─────────────────────────────────
const REAL_MOCK_RESPONSE = {
  success: true,
  message: 'Prediction successful',
  filename: 'test_apple.png',
  product: 'Apple',
  product_confidence: 95.36,
  quality: 'Good',
  quality_confidence: 99.97
};

// ─── Fetch mock setup ─────────────────────────────────────────────────────────
const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn() as any;
  process.env.FRUIT_CLASSIFICATION_API_URL = 'https://mock-api.com';
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

// ─── checkHealth ──────────────────────────────────────────────────────────────
describe('fruitQualityService.checkHealth()', () => {
  it('returns healthy:true when API responds 200', async () => {
    (global.fetch as jest.Mock<any>).mockResolvedValueOnce({
      ok: true, status: 200,
      text: async () => '{"status":"healthy","model_loaded":true}'
    });

    const result = await fruitQualityService.checkHealth();
    expect(result.healthy).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://mock-api.com/health',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('returns healthy:false with message when API returns non-200', async () => {
    (global.fetch as jest.Mock<any>).mockResolvedValueOnce({ ok: false, status: 503 });

    const result = await fruitQualityService.checkHealth();
    expect(result.healthy).toBe(false);
    expect(result.message).toContain('503');
  });

  it('returns healthy:false with "timed out" message on AbortError', async () => {
    const abortErr = Object.assign(new Error('Aborted'), { name: 'AbortError' });
    (global.fetch as jest.Mock<any>).mockRejectedValueOnce(abortErr);

    const result = await fruitQualityService.checkHealth();
    expect(result.healthy).toBe(false);
    expect(result.message).toMatch(/timed out|cold/i);
  });

  it('returns healthy:false when FRUIT_CLASSIFICATION_API_URL is not set', async () => {
    delete process.env.FRUIT_CLASSIFICATION_API_URL;
    const result = await fruitQualityService.checkHealth();
    expect(result.healthy).toBe(false);
    expect(result.message).toContain('not configured');
  });
});

// ─── classifyFruitImage ───────────────────────────────────────────────────────
describe('fruitQualityService.classifyFruitImage()', () => {
  const buffer = Buffer.from('mock-image-bytes');

  it('returns real-shaped prediction on HTTP 200', async () => {
    (global.fetch as jest.Mock<any>).mockResolvedValueOnce({
      ok: true,
      json: async () => REAL_MOCK_RESPONSE
    });

    const result = await fruitQualityService.classifyFruitImage(buffer, 'apple.jpg', 'image/jpeg');

    expect(result).toMatchObject({
      success: true,
      message: 'Prediction successful',
      product: 'Apple',
      product_confidence: 95.36,
      quality: 'Good',
      quality_confidence: 99.97
    });

    const [url, init] = (global.fetch as jest.Mock<any>).mock.calls[0] as [string, any];
    expect(url).toBe('https://mock-api.com/predict');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
  });

  it('throws FruitClassificationError with code API_ERROR on non-2xx', async () => {
    (global.fetch as jest.Mock<any>).mockResolvedValueOnce({
      ok: false, status: 400,
      text: async () => '{"detail":"Invalid image"}'
    });

    let caught: FruitClassificationError | undefined;
    try {
      await fruitQualityService.classifyFruitImage(buffer, 'bad.jpg', 'image/jpeg');
    } catch (err) {
      caught = err as FruitClassificationError;
    }
    expect(caught).toBeInstanceOf(FruitClassificationError);
    expect(caught?.code).toBe('API_ERROR');
  });

  it('throws FruitClassificationError with code TIMEOUT on AbortError', async () => {
    const abortErr = Object.assign(new Error('Aborted'), { name: 'AbortError' });
    (global.fetch as jest.Mock<any>).mockRejectedValueOnce(abortErr);

    let caught: FruitClassificationError | undefined;
    try {
      await fruitQualityService.classifyFruitImage(buffer, 'slow.jpg', 'image/jpeg');
    } catch (err) {
      caught = err as FruitClassificationError;
    }
    expect(caught).toBeInstanceOf(FruitClassificationError);
    expect(caught?.code).toBe('TIMEOUT');
    expect(caught?.message).toMatch(/timed out/i);
  });

  it('throws FruitClassificationError with code SERVICE_UNAVAILABLE when URL not set', async () => {
    delete process.env.FRUIT_CLASSIFICATION_API_URL;

    let caught: FruitClassificationError | undefined;
    try {
      await fruitQualityService.classifyFruitImage(buffer, 'img.jpg', 'image/jpeg');
    } catch (err) {
      caught = err as FruitClassificationError;
    }
    expect(caught).toBeInstanceOf(FruitClassificationError);
    expect(caught?.code).toBe('SERVICE_UNAVAILABLE');
    expect(caught?.message).toContain('not configured');
  });

  it('throws FruitClassificationError with code SERVICE_UNAVAILABLE on network error', async () => {
    (global.fetch as jest.Mock<any>).mockRejectedValueOnce(new Error('Network failure'));

    let caught: FruitClassificationError | undefined;
    try {
      await fruitQualityService.classifyFruitImage(buffer, 'img.jpg', 'image/jpeg');
    } catch (err) {
      caught = err as FruitClassificationError;
    }
    expect(caught).toBeInstanceOf(FruitClassificationError);
    expect(caught?.code).toBe('SERVICE_UNAVAILABLE');
    expect(caught?.message).toContain('Network failure');
  });
});
