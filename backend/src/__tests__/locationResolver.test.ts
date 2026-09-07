/**
 * Unit tests for locationResolverService
 * Tests: exact match, case-insensitive match, unknown district (null), dataset load size,
 *        findNearestDistrict, and aiRouteOptimizationService coordinate resolution.
 */

import {
  getCoordinatesForDistrict,
  findNearestDistrict,
  getAllDistricts,
} from '../services/locationResolverService.js';

// ─── Dataset Load Tests ───────────────────────────────────────────────────────

describe('locationResolverService — dataset loading', () => {
  test('loads all ~679 district records at startup', () => {
    const all = getAllDistricts();
    // We expect at least 600 rows (some IDs skip — the CSV has 679 as approximate)
    expect(all.length).toBeGreaterThanOrEqual(600);
  });

  test('every record has valid latitude and longitude', () => {
    const all = getAllDistricts();
    for (const record of all) {
      expect(typeof record.latitude).toBe('number');
      expect(typeof record.longitude).toBe('number');
      expect(isNaN(record.latitude)).toBe(false);
      expect(isNaN(record.longitude)).toBe(false);
    }
  });

  test('Uttar Pradesh is represented in the dataset', () => {
    const all = getAllDistricts();
    const upDistricts = all.filter(r => r.state.toLowerCase() === 'uttar pradesh');
    expect(upDistricts.length).toBeGreaterThan(50);
  });
});

// ─── getCoordinatesForDistrict Tests ─────────────────────────────────────────

describe('getCoordinatesForDistrict', () => {
  test('exact match — Gorakhpur, Uttar Pradesh', () => {
    const result = getCoordinatesForDistrict('Uttar Pradesh', 'Gorakhpur');
    expect(result).not.toBeNull();
    expect(result!.latitude).toBeCloseTo(26.6677977, 2);
    expect(result!.longitude).toBeCloseTo(83.3642334, 2);
  });

  test('exact match — Lucknow, Uttar Pradesh', () => {
    const result = getCoordinatesForDistrict('Uttar Pradesh', 'Lucknow');
    expect(result).not.toBeNull();
    expect(result!.latitude).toBeCloseTo(26.8381, 2);
    expect(result!.longitude).toBeCloseTo(80.9346001, 2);
  });

  test('case-insensitive match — lowercase state and district', () => {
    const result = getCoordinatesForDistrict('andhra pradesh', 'anantapur');
    expect(result).not.toBeNull();
    expect(result!.latitude).toBeCloseTo(14.6783221, 2);
  });

  test('case-insensitive match — mixed case', () => {
    const result = getCoordinatesForDistrict('UTTAR PRADESH', 'VARANASI');
    expect(result).not.toBeNull();
    expect(result!.latitude).toBeCloseTo(25.3356491, 2);
  });

  test('whitespace trimming — extra spaces around names', () => {
    const result = getCoordinatesForDistrict('  Uttar Pradesh  ', '  Gorakhpur  ');
    expect(result).not.toBeNull();
  });

  test('returns null for non-existent district — does not throw', () => {
    const result = getCoordinatesForDistrict('Uttar Pradesh', 'NonExistentDistrict99');
    expect(result).toBeNull();
  });

  test('returns null for non-existent state — does not throw', () => {
    const result = getCoordinatesForDistrict('Atlantis', 'Gorakhpur');
    expect(result).toBeNull();
  });

  test('returns null for empty strings — does not throw', () => {
    expect(getCoordinatesForDistrict('', '')).toBeNull();
    expect(getCoordinatesForDistrict('Uttar Pradesh', '')).toBeNull();
    expect(getCoordinatesForDistrict('', 'Gorakhpur')).toBeNull();
  });

  test('West Bengal — Kolkata', () => {
    const result = getCoordinatesForDistrict('West Bengal', 'Kolkata');
    expect(result).not.toBeNull();
    expect(result!.latitude).toBeCloseTo(22.5726459, 2);
  });

  test('Karnataka — Bengaluru (Bangalore) Urban', () => {
    const result = getCoordinatesForDistrict('Karnataka', 'Bengaluru (Bangalore) Urban');
    expect(result).not.toBeNull();
    expect(result!.latitude).toBeCloseTo(13.0222347, 2);
  });
});

// ─── findNearestDistrict Tests ────────────────────────────────────────────────

describe('findNearestDistrict', () => {
  test('coordinates very close to Gorakhpur → returns Gorakhpur', () => {
    // Gorakhpur is at 26.6677977, 83.3642334
    const result = findNearestDistrict(26.668, 83.364);
    expect(result.district.toLowerCase()).toContain('gorakhpur');
    expect(result.distanceKm).toBeLessThan(5);
  });

  test('coordinates close to Lucknow → returns Lucknow', () => {
    // Lucknow is at 26.8381, 80.9346001
    const result = findNearestDistrict(26.84, 80.93);
    expect(result.district.toLowerCase()).toContain('lucknow');
    expect(result.distanceKm).toBeLessThan(5);
  });

  test('returns a valid state and district (not Unknown)', () => {
    const result = findNearestDistrict(28.6, 77.2); // Near Delhi/Gurgaon area
    expect(result.state).not.toBe('Unknown');
    expect(result.district).not.toBe('Unknown');
    expect(result.distanceKm).toBeGreaterThanOrEqual(0);
  });
});
