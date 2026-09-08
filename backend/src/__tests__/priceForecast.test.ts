import { jest, describe, it, expect, afterEach } from '@jest/globals';
import { priceForecastService, PriceForecastServiceError } from '../services/priceForecastService.js';

// Create a simple mock for fetch
const originalFetch = global.fetch;

describe('Price Forecast Service Integration Tests', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should fetch states successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(['State1', 'State2']),
      })
    ) as jest.Mock;

    const states = await priceForecastService.getStates();
    expect(states).toEqual(['State1', 'State2']);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchUrl).toContain('/states');
  });

  it('should handle API timeouts (AbortError)', async () => {
    // Simulate fetch throwing an AbortError due to timeout
    global.fetch = jest.fn(() =>
      Promise.reject(Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }))
    ) as jest.Mock;

    await expect(priceForecastService.predictPrice({
      state: 'Test',
      district: 'Test',
      commodity: 'Test',
      variety: 'Test',
      grade: 'Test',
      arrivalMonth: 1
    })).rejects.toThrowError(PriceForecastServiceError);
    
    try {
      await priceForecastService.predictPrice({
        state: 'Test',
        district: 'Test',
        commodity: 'Test',
        variety: 'Test',
        grade: 'Test',
        arrivalMonth: 1
      });
    } catch (e: any) {
      expect(e.code).toBe('TIMEOUT');
    }
  });

  it('should handle 422 validation errors without fabricating prices', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 422,
        text: () => Promise.resolve('Missing required query parameters'),
      })
    ) as jest.Mock;

    try {
      await priceForecastService.getDistricts('');
      // Should not reach here
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e).toBeInstanceOf(PriceForecastServiceError);
      expect(e.code).toBe('VALIDATION_ERROR');
      expect(e.message).toContain('Missing required query parameters');
    }
  }, 10000);

  it('should successfully predict a price', async () => {
    const mockResponse = {
      predicted_modal_price: 2500,
      currency: 'INR',
      unit: 'per quintal',
      model_version: 3,
      input: {
        State: 'Test',
        District: 'Test',
        Commodity: 'Test',
        Variety: 'Test',
        Grade: 'Test',
        Arrival_Month: 1
      }
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    ) as jest.Mock;

    const res = await priceForecastService.predictPrice({
      state: 'Test',
      district: 'Test',
      commodity: 'Test',
      variety: 'Test',
      grade: 'Test',
      arrivalMonth: 1
    });

    expect(res).toEqual(mockResponse);
    expect(res.predicted_modal_price).toBe(2500);
  });
});
