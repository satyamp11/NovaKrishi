import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DistrictCoordinates {
  locationId: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
}

// ─── In-Memory Dataset (loaded once at module import) ─────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Loads the real_route_locations.csv from backend/data/ into memory.
 * Uses Node.js built-in `fs` — no extra CSV library needed (679 rows, trivial).
 */
function loadDataset(): DistrictCoordinates[] {
  const csvPath = join(__dirname, '../../data/real_route_locations.csv');
  const raw = readFileSync(csvPath, 'utf-8');
  const lines = raw.trim().split('\n');

  // Skip header row
  const records: DistrictCoordinates[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV split: location_id,state,district,latitude,longitude
    // State/district names may contain commas only if quoted — none in this dataset do
    const cols = line.split(',');
    if (cols.length < 5) continue;

    const locationId = cols[0].trim();
    // Handle cases where state or district might span extra cols (defensive)
    const longitude = parseFloat(cols[cols.length - 1]);
    const latitude = parseFloat(cols[cols.length - 2]);
    const district = cols[cols.length - 3].trim();
    const state = cols.slice(1, cols.length - 3).join(',').trim();

    if (isNaN(latitude) || isNaN(longitude)) continue;

    records.push({ locationId, state, district, latitude, longitude });
  }

  console.info(`📍 LocationResolver: Loaded ${records.length} district coordinates from dataset.`);
  return records;
}

// Singleton in-memory dataset — loaded at server startup (fast, 679 rows)
const DISTRICT_DATASET: DistrictCoordinates[] = loadDataset();

// Build a fast O(1) lookup map: "state|district" (lowercase) → coordinates
const LOOKUP_MAP = new Map<string, DistrictCoordinates>();
for (const record of DISTRICT_DATASET) {
  const key = `${record.state.toLowerCase().trim()}|${record.district.toLowerCase().trim()}`;
  LOOKUP_MAP.set(key, record);
}

// ─── Haversine Distance (for findNearestDistrict) ─────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns real lat/lng for a given state + district.
 * Case-insensitive and trims whitespace.
 * Returns `null` (never throws) if no match found.
 *
 * @example
 *   getCoordinatesForDistrict('Uttar Pradesh', 'Gorakhpur')
 *   // → { latitude: 26.6677977, longitude: 83.3642334 }
 */
export function getCoordinatesForDistrict(
  state: string,
  district: string
): { latitude: number; longitude: number } | null {
  if (!state || !district) return null;

  const key = `${state.toLowerCase().trim()}|${district.toLowerCase().trim()}`;
  const record = LOOKUP_MAP.get(key);
  if (!record) return null;

  return { latitude: record.latitude, longitude: record.longitude };
}

/**
 * Given raw lat/lng, finds the closest known district using haversine distance.
 * Useful for reverse-resolving approximate coordinates to a named district.
 *
 * @returns The nearest district with its distance in km.
 */
export function findNearestDistrict(
  latitude: number,
  longitude: number
): { state: string; district: string; distanceKm: number } {
  let nearest: DistrictCoordinates | null = null;
  let minDist = Infinity;

  for (const record of DISTRICT_DATASET) {
    const dist = haversineKm(latitude, longitude, record.latitude, record.longitude);
    if (dist < minDist) {
      minDist = dist;
      nearest = record;
    }
  }

  if (!nearest) {
    return { state: 'Unknown', district: 'Unknown', distanceKm: -1 };
  }

  return {
    state: nearest.state,
    district: nearest.district,
    distanceKm: Math.round(minDist * 10) / 10
  };
}

/**
 * Returns the full loaded dataset (for testing / diagnostics only).
 */
export function getAllDistricts(): DistrictCoordinates[] {
  return DISTRICT_DATASET;
}
