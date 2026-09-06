export const cropPerishabilityRates: Record<string, number> = {
  // Highly Perishable
  'tomato': 0.85,
  'spinach': 0.9,
  'lettuce': 0.9,
  'strawberry': 0.85,
  'mushroom': 0.8,
  
  // Medium Perishable
  'apple': 0.6,
  'banana': 0.7,
  'mango': 0.65,
  'potato': 0.4,
  'onion': 0.4,
  'carrot': 0.5,

  // Low Perishable
  'wheat': 0.1,
  'rice': 0.1,
  'corn': 0.15,
  'pulses': 0.1,
  'dal': 0.1
};

/**
 * Returns a perishability score between 0 and 1.
 * Higher score = more perishable / urgent.
 */
export function getPerishabilityScore(cropName?: string): number {
  if (!cropName) return 0.5;
  const normalized = cropName.toLowerCase().trim();
  return cropPerishabilityRates[normalized] ?? 0.5;
}
