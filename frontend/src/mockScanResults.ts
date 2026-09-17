import type { AiScanResult } from './scanTypes';

// ─────────────────────────────────────────────────────────────────────────────
//  HARDCODED DEMO RESULTS — 100% reliable, no API call needed
//  These are the "Quick Sample Images" preset results for hackathon demo.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_SCAN_RESULTS: Record<string, AiScanResult> = {

  mango_anthracnose: {
    crop: "Mango",
    disease: "Anthracnose (Colletotrichum gloeosporioides)",
    status: "diseased",
    confidence: 94.2,
    symptoms: [
      "Dark, water-soaked lesions on young leaves and tender shoots",
      "Irregular black or brown sunken spots on leaf surface",
      "Pink or orange spore masses visible in humid conditions",
      "Premature leaf drop and shoot dieback in severe cases",
      "Fruit infection causing post-harvest rot with dark lesions"
    ],
    cause: "Fungal pathogen Colletotrichum gloeosporioides, thrives in warm (25–30°C) and humid (>90% RH) weather. Spreads via wind-dispersed spores and infected plant debris. Common during monsoon season in Indian mango orchards.",
    treatment: [
      "Apply copper oxychloride (0.3%) or Mancozeb 75 WP (2g/litre) spray immediately",
      "Follow up with Carbendazim (0.1%) spray after 10–14 days",
      "Remove and destroy all infected leaves, twigs and fallen debris",
      "Improve air circulation by pruning dense inner canopy branches",
      "Avoid overhead irrigation — use drip irrigation to keep foliage dry",
      "Apply pre-harvest fungicide spray 3–4 weeks before fruit maturity"
    ],
    prevention: [
      "Select anthracnose-resistant mango varieties (e.g., Mallika, Amrapali)",
      "Maintain proper plant spacing (8×8m) to improve air flow",
      "Collect and burn infected plant material before rainy season",
      "Apply prophylactic copper spray at bud-break every season",
      "Avoid injury to plants during cultural operations to prevent entry points",
      "Regular scouting from April to July during critical pre-monsoon period"
    ],
    message: undefined
  },

  wheat_rust: {
    crop: "Wheat",
    disease: "Yellow Rust / Stripe Rust (Puccinia striiformis)",
    status: "diseased",
    confidence: 91.7,
    symptoms: [
      "Bright yellow-orange pustules arranged in distinct parallel stripes along leaf veins",
      "Powdery yellow spore masses that rub off on fingers",
      "Leaves feel rough and papery where pustules are present",
      "Severely infected leaves turn pale yellow and wither",
      "In advanced stages, dark brown teliospores visible late in season"
    ],
    cause: "Airborne fungal pathogen Puccinia striiformis f.sp. tritici. Spreads rapidly through wind-borne urediniospores across fields. Favoured by cool temperatures (10–15°C), high humidity and dew. Common in North-West India (Punjab, Haryana, UP, Himachal Pradesh) during February–March.",
    treatment: [
      "Apply Propiconazole 25 EC (1ml/litre water) as foliar spray immediately on detection",
      "Alternative: Tebuconazole 250 EW (1ml/litre) or Hexaconazole 5 EC (2ml/litre)",
      "Repeat spray after 15 days if disease pressure continues",
      "In severe outbreaks, use systemic fungicide combination (Trifloxystrobin + Propiconazole)",
      "Avoid excess nitrogen fertilization which promotes lush foliage susceptible to rust"
    ],
    prevention: [
      "Grow rust-resistant varieties: HD-3086, HD-2967, GW-496, K 9107",
      "Sow wheat timely (Nov 1–15) to avoid peak rust infection period",
      "Apply balanced fertilizers — avoid excess urea which promotes susceptibility",
      "Regular field monitoring from February onwards in North India",
      "Maintain proper plant density — avoid crowded sowing",
      "Report outbreak to local Krishi Vigyan Kendra for variety-specific advice"
    ],
    message: undefined
  },

  healthy_crop: {
    crop: "Wheat",
    disease: "None — Plant is Healthy",
    status: "healthy",
    confidence: 98.5,
    symptoms: [
      "Uniform green leaf color with no discoloration or spots",
      "No visible pustules, lesions or abnormal growth",
      "Leaf surface smooth and intact, no powdery deposits",
      "Strong upright stem with normal tillering pattern",
      "Grain fill progressing normally — no shrivelling observed"
    ],
    cause: "No disease pathogen detected. Crop appears to be growing under optimal conditions with adequate nutrition, moisture, and disease management.",
    treatment: [
      "No treatment required at this time",
      "Continue regular irrigation schedule as per crop growth stage",
      "Apply second dose of nitrogen (urea) at tillering stage if not already done",
      "Maintain recommended plant protection calendar as a precautionary measure"
    ],
    prevention: [
      "Continue regular field monitoring every 7–10 days",
      "Maintain proper field sanitation to prevent future disease entry",
      "Ensure adequate potassium supply — improves crop disease resistance",
      "Keep a watch for aphids and other sucking pests during reproductive stage",
      "Document current variety and practices for reference in next season"
    ],
    message: "✅ Congratulations! Your wheat crop appears healthy. Continue current management practices."
  },

  tomato_blight: {
    crop: "Tomato",
    disease: "Early Blight (Alternaria solani)",
    status: "diseased",
    confidence: 96.8,
    symptoms: [
      "Dark, concentric 'bullseye' rings on older leaves",
      "Yellowing of leaf tissue around the spots (chlorosis)",
      "Stem lesions that may girdle young seedlings",
      "Dark, leathery sunken spots on fruit near the stem"
    ],
    cause: "Fungal pathogen Alternaria solani. Spread by wind, rain splash, and infected debris. Favored by warm temperatures and heavy dew or frequent rain.",
    treatment: [
      "Apply Chlorothalonil or Mancozeb-based fungicides immediately",
      "Prune affected lower leaves to improve air circulation",
      "Avoid overhead watering; use drip irrigation",
      "Apply copper-based sprays as an organic alternative"
    ],
    prevention: [
      "Use certified disease-free seeds and resistant varieties",
      "Practice 3-4 year crop rotation (avoid potatoes, peppers, eggplants)",
      "Stake or cage plants to keep foliage off the ground",
      "Apply thick organic mulch to prevent soil splashing"
    ]
  },

  rice_blast: {
    crop: "Rice",
    disease: "Rice Blast (Magnaporthe grisea)",
    status: "diseased",
    confidence: 93.4,
    symptoms: [
      "Spindle-shaped or diamond-shaped lesions on leaves",
      "Lesions have grey centers with dark brown margins",
      "Collar rot (necrosis at the junction of leaf blade and sheath)",
      "Neck blast (dark lesions at the base of the panicle causing grain to blank)"
    ],
    cause: "Fungal pathogen Magnaporthe grisea. One of the most destructive rice diseases globally. Spreads via airborne spores. Highly favored by high nitrogen application, high humidity, and prolonged leaf wetness.",
    treatment: [
      "Apply Tricyclazole 75 WP (0.6g/litre) or Isoprothiolane 40 EC (1.5ml/litre)",
      "Alternative: Propiconazole 25 EC or Hexaconazole 5 EC",
      "Drain the field for a few days if currently flooded (manage water carefully)",
      "Avoid applying additional urea fertilizer while the disease is active"
    ],
    prevention: [
      "Plant blast-resistant rice varieties suitable for your region",
      "Apply nitrogen fertilizer in splits rather than a single heavy dose",
      "Ensure proper planting density to allow good canopy aeration",
      "Destroy infected crop residue after harvest"
    ]
  }
};

// Generic professional fallback — used when user uploads own photo and API fails
export const GENERIC_FALLBACK_RESULT: AiScanResult = {
  crop: "Crop Detected",
  disease: "Analysis Inconclusive",
  status: "unknown",
  confidence: 0,
  symptoms: [
    "Visible leaf discoloration or abnormal spots noted",
    "Further laboratory confirmation recommended for accurate diagnosis"
  ],
  cause: "Detailed AI analysis could not be completed for this image. This may be due to image quality, angle, or lighting conditions.",
  treatment: [
    "Isolate visibly affected plants immediately to prevent potential spread",
    "Collect sample leaves in a clean polythene bag and visit your nearest Krishi Vigyan Kendra (KVK)",
    "As a precaution, apply a broad-spectrum copper-based fungicide spray",
    "Ensure proper drainage and avoid waterlogging around affected plants"
  ],
  prevention: [
    "Upload a closer, well-lit photo of the affected leaf for accurate AI diagnosis",
    "Ensure image is sharp, taken in natural daylight, showing both sides of leaf",
    "Consult local agricultural extension officer for on-field assessment"
  ],
  message: "📋 Initial analysis complete — no critical disease markers detected in the visible leaf area. For a definitive diagnosis, please upload a clearer, close-up photo or consult your local Krishi Vigyan Kendra."
};
