export type Language = 'en' | 'hi' | 'mr';

export type TabType = 'landing' | 'home' | 'scan' | 'map' | 'alerts' | 'profile' | 'community' | 'splash' | 'login' | 'result' | 'report';


export type RiskLevel = 'safe' | 'warning' | 'outbreak';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface FarmerProfile {
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  mainCrops: string[];
  locationPermission: boolean;
  avatar: string;
}

export interface DiseaseInfo {
  id: string;
  name: string;
  nameHindi: string;
  crop: string;
  cropHindi: string;
  confidence: number;
  severity: Severity;
  symptoms: string[];
  symptomsHindi: string[];
  organicAction: string[];
  organicActionHindi: string[];
  chemicalAction: string[];
  chemicalActionHindi: string[];
  prevention: string[];
  preventionHindi: string[];
  sampleImage: string;
}

export interface OutbreakReport {
  id: string;
  farmerName: string;
  village: string;
  district: string;
  crop: string;
  diseaseName: string;
  diseaseHindi: string;
  severity: Severity;
  distanceKm: number;
  timestamp: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  status: 'verified' | 'pending';
}

export interface OutbreakCluster {
  id: string;
  diseaseName: string;
  diseaseHindi: string;
  crop: string;
  cropHindi: string;
  centerVillage: string;
  lat: number;
  lng: number;
  radiusKm: number;
  reportCount: number;
  severity: Severity;
  lastReportTime: string;
  recommendations: string[];
  recommendationsHindi: string[];
}

export interface WeatherData {
  temp: number;
  condition: string;
  conditionHindi: string;
  humidity: number;
  diseaseRiskIndex: 'Low' | 'Moderate' | 'High';
  riskMessage: string;
  riskMessageHindi: string;
}

export interface CommunityActivity {
  id: string;
  village: string;
  district: string;
  crop: string;
  diseaseName: string;
  timeAgo: string;
  actionType: 'scan' | 'report' | 'contained';
}

export interface MarketRate {
  id: string;
  name: string;
  nameHindi: string;
  category: 'Grains' | 'Vegetables' | 'Oilseeds' | 'Pulses' | string;
  price: number;
  unit: string;
  unitHindi: string;
  mandi: string;
  mandiHindi: string;
  district?: string;
  districtHindi?: string;
  state: string;
  variety?: string;
  grade?: string;
  minPrice?: number;
  maxPrice?: number;
  modalPrice?: number;
  arrivalDate?: string;
  isRealtimeApi?: boolean;
  priceChange: number;
  lastUpdated: string;
  trend7d: number[];
  trend30d: number[];
  image?: string;
}

// --- Buyer Reliability & Payments ---

export interface ReliabilityMetrics {
  score: number;
  totalOrders: number;
  completedOrders: number;
  disputesRaisedAgainst: number;
  disputesResolved: number;
  avgPaymentDelayDays: number;
  badge: 'trusted' | 'good' | 'new' | 'flagged';
}

export interface Review {
  _id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: 'farmer' | 'consumer' | 'bulk_buyer';
  rating: number;
  comment?: string;
  tags: string[];
  createdAt: string;
}

export type DisputeType = 'payment_delay' | 'non_payment' | 'quality_issue' | 'no_show' | 'other';
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'rejected';

export interface Dispute {
  _id: string;
  orderId: string;
  raisedBy: string;
  raisedAgainst: string;
  type: DisputeType;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  evidenceUrls: string[];
  statusHistory: {
    status: DisputeStatus;
    updatedAt: string;
    note?: string;
  }[];
  createdAt: string;
  resolvedAt?: string;
}

// ─── Fruit Quality Classification ML API ──────────────────────────────────────
// Response shape confirmed by live smoke test on 2026-09-07:
// POST https://fruit-classification-way1.onrender.com/predict → HTTP 200
// {"success":true,"message":"Prediction successful","filename":"test_apple.png",
//  "product":"Apple","product_confidence":95.36,"quality":"Good","quality_confidence":99.97}

export type FruitQualityGrade = 'Good' | 'Bad' | 'Average';

export interface FruitQualityPrediction {
  /** Whether the prediction succeeded */
  success: boolean;
  /** Human-readable status message from the ML API */
  message: string;
  /** Filename that was processed */
  filename: string;
  /** Detected fruit/product name e.g. "Apple", "Mango", "Banana" */
  product: string;
  /** Confidence for the product classification, 0–100 (e.g. 95.36 means 95.36%) */
  product_confidence: number;
  /** Quality grade: "Good" | "Bad" | "Average" */
  quality: FruitQualityGrade | string;
  /** Confidence for the quality grade, 0–100 (e.g. 99.97 means 99.97%) */
  quality_confidence: number;
}
