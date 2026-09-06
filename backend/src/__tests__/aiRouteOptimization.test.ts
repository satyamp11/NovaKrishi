import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import { aiRouteOptimizationService } from '../services/aiRouteOptimizationService.js';
import { getPerishabilityScore } from '../config/cropPerishability.js';

describe('AI Route Optimization Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, PYTHON_ROUTING_SERVICE_URL: 'https://test-ml.com' };
    // Assign a fresh jest.fn() — type is inferred, no TS annotation needed
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // ─── cropPerishability unit tests ────────────────────────────────────────────

  describe('cropPerishability', () => {
    it('returns expected scores for known crops', () => {
      expect(getPerishabilityScore('tomato')).toBe(0.85);
      expect(getPerishabilityScore('Spinach')).toBe(0.9);
      expect(getPerishabilityScore(' WHEAT ')).toBe(0.1);
    });

    it('returns 0.5 for unknown or empty crops', () => {
      expect(getPerishabilityScore('alienfruit')).toBe(0.5);
      expect(getPerishabilityScore()).toBe(0.5);
      expect(getPerishabilityScore('')).toBe(0.5);
    });
  });

  // ─── optimizeRoute integration tests ─────────────────────────────────────────

  describe('optimizeRoute integration', () => {
    const mockPayload = {
      pickupLocations: [{ name: 'Pickup1', lat: 10, lng: 20 }],
      deliveryLocations: [{ name: 'Delivery1', lat: 30, lng: 40 }],
      quantityKg: 100
    };

    it('uses ML API when available and maps response correctly', async () => {
      const mockFetch = global.fetch as jest.Mock;
      // Call 1: health check ok
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
      // Call 2: find-best-route ok
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          best_route: {
            route: ['Pickup1', 'Delivery1'],
            distance_km: 15,
            google_duration_min: 25,
            ml_travel_time_min: 23,
            ml_delivery_cost_inr: 500,
            score: 0.95
          },
          alternatives: []
        })
      });

      const response = await aiRouteOptimizationService.optimizeRoute(mockPayload);

      expect(response.success).toBe(true);
      expect(response.aiEngineInfo.isDemoEngine).toBe(false);
      expect(response.optimizedRoute).toHaveLength(2);
      expect(response.optimizedRoute[1].name).toBe('Delivery1');
      expect(response.mlInsights).toBeDefined();
      expect(response.mlInsights?.mlTravelTimeMin).toBe(23);
      expect(response.metrics.optimizedDistanceKm).toBe(15);
    });

    it('falls back to heuristic prototype if ML API health check fails', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const response = await aiRouteOptimizationService.optimizeRoute(mockPayload);

      expect(response.success).toBe(true);
      expect(response.aiEngineInfo.isDemoEngine).toBe(true);
      expect(response.mlInsights).toBeUndefined();
    });

    it('falls back to heuristic prototype if ML API returns 500', async () => {
      const mockFetch = global.fetch as jest.Mock;
      // Call 1: health check ok
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
      // Call 2: route request 500
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const response = await aiRouteOptimizationService.optimizeRoute(mockPayload);

      expect(response.success).toBe(true);
      expect(response.aiEngineInfo.isDemoEngine).toBe(true);
      expect(response.mlInsights).toBeUndefined();
    });
  });
});
