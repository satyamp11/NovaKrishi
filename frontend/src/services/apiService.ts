import type { MarketRate, FruitQualityPrediction } from '../types';
export type { MarketRate };
import { MOCK_MARKET_RATES, ALL_INDIAN_STATES } from '../mockData';

/**
 * Resolves the backend API base URL:
 * - Checks VITE_API_URL, VITE_API_BASE_URL, or VITE_BACKEND_URL
 * - Strips trailing slashes and ensures /api path
 * - In production (import.meta.env.PROD), defaults to 'https://novakrishi.onrender.com/api'
 * - In development, defaults to '/api' (proxied by Vite dev server to localhost:5000)
 */
const getApiBaseUrl = (): string => {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    ''
  ).trim();

  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  // When running a production build, default to the deployed Render backend
  if (import.meta.env.PROD) {
    return 'https://novakrishi.onrender.com/api';
  }

  // Local development default uses the Vite proxy configuration
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Safely parses a fetch Response as JSON. If the server (or a proxy in front
// of it, e.g. Render's gateway) returned an HTML error page instead of JSON,
// this returns a clean fallback message instead of dumping raw markup into
// the UI.
async function safeParseJson(response: Response): Promise<{ success: boolean; data?: any; message?: string; code?: string }> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return {
      success: false,
      message: response.ok
        ? 'Unexpected response from server.'
        : `Server is unavailable (HTTP ${response.status}). It may be waking up — please try again in a moment.`,
      code: response.ok ? 'INVALID_RESPONSE' : 'SERVICE_UNAVAILABLE',
    };
  }
  try {
    return await response.json();
  } catch {
    return { success: false, message: 'Received malformed data from server.', code: 'INVALID_RESPONSE' };
  }
}

export type UserRole = 'farmer' | 'consumer' | 'bulk_buyer' | 'delivery_partner' | 'admin';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type ProductCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Grains'
  | 'Pulses'
  | 'Spices'
  | 'Dairy'
  | 'Organic Products'
  | 'Seeds'
  | 'Fertilizers'
  | 'Farm Equipment';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type ExtendedPaymentState =
  | 'PENDING'
  | 'PAID'
  | 'HELD_FOR_ORDER'
  | 'RELEASE_PENDING'
  | 'RELEASED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'FAILED';

export type DeliveryStatus =
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export type BulkRequestStatus =
  | 'OPEN'
  | 'QUOTES_RECEIVED'
  | 'ACCEPTED'
  | 'FULFILLED'
  | 'CANCELLED';

export interface AdminMetricsDTO {
  totalFarmers: number;
  verifiedFarmers: number;
  pendingFarmers: number;
  totalConsumers: number;
  totalBulkBuyers: number;
  totalDeliveryPartners: number;
  totalOrders: number;
  totalGMV: number;
  activeDeliveries: number;
  platformRevenue: number;
  disputesCount: number;
}

export interface BulkRequestDTO {
  id: string;
  requestNumber: string;
  buyer: {
    id: string;
    name: string;
    organizationName: string;
    phone: string;
  };
  productTitle: string;
  category: string;
  targetQuantity: number;
  unit: string;
  deliveryCity: string;
  deliveryState: string;
  requiredByDate: string;
  targetPricePerUnit?: number;
  status: BulkRequestStatus;
  matchingFarmers: {
    farmerId: string;
    farmerName: string;
    fpoName: string;
    district: string;
    availableQty: number;
  }[];
  offers: {
    id: string;
    farmerId: string;
    farmerName: string;
    fpoName: string;
    farmerDistrict: string;
    farmerState: string;
    offeredQuantity: number;
    offeredPricePerUnit: number;
    totalOfferAmount: number;
    logisticsIncluded: boolean;
    notes: string;
    status: string;
    createdAt: string;
  }[];
  acceptedOfferId?: string;
  createdAt: string;
}

export interface LocationWaypoint {
  id?: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  priority?: 'HIGH' | 'MEDIUM' | 'NORMAL' | 'URGENT';
  demandKg?: number;
}

export interface OptimizedWaypoint extends LocationWaypoint {
  sequenceOrder: number;
  legDistanceKm: number;
  legDurationMinutes: number;
  estimatedArrival: string;
}

export interface RouteOptimizationResponse {
  success: boolean;
  timestamp: string;
  metrics: {
    originalDistanceKm: number;
    optimizedDistanceKm: number;
    distanceSavedKm: number;
    savingsPercentage: number;
    originalDurationMinutes: number;
    optimizedDurationMinutes: number;
    timeSavedMinutes: number;
    originalFuelLiters: number;
    optimizedFuelLiters: number;
    fuelSavedLiters: number;
    costSavedINR: number;
  };
  optimizedRoute: OptimizedWaypoint[];
  aiEngineInfo: {
    engineName: string;
    algorithm: string;
    isDemoEngine: boolean;
    pythonEndpointConfigured: boolean;
  };
}

export interface DeliveryTrackingData {
  id: string;
  orderId: string;
  orderNumber: string;
  deliveryPartner: {
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
    vehicleNumber: string;
  };
  pickupLocation: {
    address: string;
    district: string;
    state: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    district: string;
    state: string;
    lat: number;
    lng: number;
  };
  currentLocation: {
    address: string;
    lat: number;
    lng: number;
    speedKmH: number;
    heading: number;
    lastUpdated: string;
  };
  status: DeliveryStatus;
  estimatedArrival: string;
  distanceRemainingKm: number;
  isDemoSimulator: boolean;
  orderStatusTimeline: {
    step: string;
    label: string;
    isCompleted: boolean;
    timestamp?: string;
  }[];
  createdAt: string;
}

export interface CropForecastItem {
  crop: string;
  category: string;
  currentDemand: string;
  expectedDemandPercent: number;
  timeframe: string;
  confidenceScore: number;
  trend: 'RISING' | 'STABLE' | 'PEAK' | 'DECLINING';
  recommendedStockAction: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  regionalDistrict: string;
  historicalDemandSeries: { date: string; demandQty: number; avgPrice: number }[];
  forecastedDemandSeries: { date: string; predictedQty: number; predictedPrice: number }[];
  aiModelMetaData: {
    modelName: string;
    modelType: string;
    lastTrained: string;
    pythonEndpointConfigured: boolean;
  };
}

export interface AIDemandForecastResponse {
  success: boolean;
  timestamp: string;
  region: {
    state: string;
    district: string;
  };
  totalCropsAnalyzed: number;
  modelStatus: string;
  forecasts: CropForecastItem[];
}

export interface ProductItem {
  id: string;
  title: string;
  category: ProductCategory;
  price: number;
  unit: string;
  mandiBenchmarkPrice?: number;
  availableQuantity: number;
  minOrderQuantity: number;
  description?: string;
  imageUrl: string;
  farmerId: string;
  farmerName: string;
  fpoName?: string;
  isVerifiedFPO: boolean;
  isOrganicCertified: boolean;
  location: {
    village?: string;
    district: string;
    state: string;
  };
  rating: number;
  reviewCount: number;
  harvestDate?: string;
  status: 'available' | 'sold_out' | 'unlisted';
  createdAt: string;
}

export interface CartPopulatedItem {
  productId: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  availableQuantity: number;
  imageUrl: string;
  farmerId: string;
  farmerName: string;
  fpoName?: string;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  success: boolean;
  totalItems: number;
  subtotalAmount: number;
  items: CartPopulatedItem[];
  message?: string;
}

export interface OrderItemDTO {
  productId: string;
  title: string;
  category: string;
  imageUrl: string;
  unit: string;
  pricePerUnit: number;
  quantity: number;
  subtotal: number;
}

export interface PriceBreakdownData {
  consumerTotal: number;
  farmerEarnings: number;
  logisticsCost: number;
  platformFee: number;
  intermediarySavings: number;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  buyer: {
    id: string;
    name: string;
    emailOrPhone: string;
    role: string;
  };
  seller: {
    id: string;
    name: string;
    fpoName?: string;
    district: string;
    state: string;
  };
  items: OrderItemDTO[];
  subtotalAmount: number;
  logisticsFee: number;
  totalAmount: number;
  priceBreakdown: PriceBreakdownData;
  deliveryAddress: {
    streetAddress: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  paymentStatus: ExtendedPaymentState;
  paymentMethod: string;
  orderStatus: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    updatedAt: string;
    note?: string;
  }[];
  paymentHistory: {
    state: ExtendedPaymentState;
    transactionId?: string;
    timestamp: string;
    note?: string;
  }[];
  deliveryPartner?: {
    id?: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsFilterParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  state?: string;
  district?: string;
  organicOnly?: boolean;
  verifiedOnly?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'stock';
  page?: number;
  limit?: number;
}

export interface ProductsApiResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  products: ProductItem[];
  message?: string;
}

export interface MandiPricesFilterParams {
  state?: string;
  district?: string;
  mandi?: string;
  commodity?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MandiPricesApiResponse {
  success: boolean;
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  states: string[];
  districts?: string[];
  commodities?: string[];
  categories: string[];
  rates: MarketRate[];
}

export interface FarmInfo {
  fpoName?: string;
  fpoRegistrationNumber?: string;
  landSizeAcres?: number;
  primaryCrop?: string;
  organicCertified?: boolean;
}

export interface DeliveryAddress {
  streetAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

export interface BusinessInfo {
  organizationName?: string;
  gstin?: string;
  businessType?: 'Wholesaler' | 'Retailer' | 'Processor' | 'Hotel/Restaurant' | 'Exporter' | 'Other';
  annualVolumeEstimate?: string;
}

export interface VehicleInfo {
  vehicleType?: 'TwoWheeler' | 'MiniTruck' | 'HeavyTruck' | 'RefrigeratedVan';
  vehicleNumber?: string;
  licenseNumber?: string;
  operatingDistrict?: string;
  maxCapacityKg?: number;
}

export interface AuthUser {
  id: string;
  name: string;
  emailOrPhone: string;
  role: UserRole;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  verificationStatus?: VerificationStatus;
  state: string;
  district: string;
  village?: string;
  primaryCrop?: string;
  profileImage?: string;
  
  farmInfo?: FarmInfo;
  deliveryAddress?: DeliveryAddress;
  businessInfo?: BusinessInfo;
  vehicleInfo?: VehicleInfo;

  createdAt: string;
}

export interface AuthApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

export interface RegisterPayload {
  name: string;
  emailOrPhone: string;
  password?: string;
  role: UserRole;
  state?: string;
  district?: string;
  village?: string;
  primaryCrop?: string;
  adminSecretKey?: string;

  farmInfo?: FarmInfo;
  deliveryAddress?: DeliveryAddress;
  businessInfo?: BusinessInfo;
  vehicleInfo?: VehicleInfo;
}

export interface CropScanRecord {
  id: string;
  farmerId: string;
  cropName: string;
  diseaseName: string;
  diseaseHindi: string;
  confidence: number;
  imageUrl?: string;
  result: 'Healthy' | 'Infected';
  recommendations?: string[];
  recommendationsHindi?: string[];
  createdAt: string;
}

export interface CommunityAlertRecord {
  id: string;
  diseaseName: string;
  diseaseHindi: string;
  crop: string;
  state: string;
  district: string;
  centerVillage: string;
  severity: 'Critical' | 'Warning' | 'Low';
  reportCount: number;
  description: string;
  descriptionHindi: string;
  recommendations: string[];
  recommendationsHindi: string[];
  createdAt: string;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('krishi_shield_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiService = {
  // Admin Dashboard API Methods (Phase 12)
  async getAdminMetrics(token: string): Promise<{ success: boolean; metrics?: AdminMetricsDTO; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to fetch admin metrics.' };
    }
  },

  async getAdminFarmers(token: string): Promise<{ success: boolean; total: number; farmers: AuthUser[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/farmers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, total: 0, farmers: [], message: 'Failed to fetch farmers list.' };
    }
  },

  async verifyFarmer(token: string, farmerId: string, status: VerificationStatus): Promise<{ success: boolean; farmer?: AuthUser; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/farmers/${farmerId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to update farmer verification status.' };
    }
  },

  // Bulk Buyer RFQ Marketplace API Methods (Phase 11)
  async createBulkRequest(
    token: string,
    payload: {
      productTitle: string;
      category?: string;
      targetQuantity: number;
      unit?: string;
      deliveryCity: string;
      deliveryState: string;
      requiredByDate: string;
      targetPricePerUnit?: number;
    }
  ): Promise<{ success: boolean; bulkRequest?: BulkRequestDTO; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/bulk-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to create bulk request.' };
    }
  },

  async getBulkRequests(token: string): Promise<{ success: boolean; total: number; bulkRequests: BulkRequestDTO[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/bulk-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, total: 0, bulkRequests: [], message: 'Failed to fetch bulk requests.' };
    }
  },

  async createFarmerOffer(
    token: string,
    requestId: string,
    payload: {
      offeredQuantity: number;
      offeredPricePerUnit: number;
      logisticsIncluded?: boolean;
      notes?: string;
    }
  ): Promise<{ success: boolean; bulkRequest?: BulkRequestDTO; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/bulk-requests/${requestId}/offers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to submit quotation offer.' };
    }
  },

  async acceptFarmerOffer(
    token: string,
    requestId: string,
    offerId: string
  ): Promise<{ success: boolean; bulkRequest?: BulkRequestDTO; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/bulk-requests/${requestId}/offers/${offerId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to accept quotation offer.' };
    }
  },

  // AI Assisted Route Optimization Method (Phase 10)
  async optimizeRoute(payload?: {
    pickupLocations?: LocationWaypoint[];
    deliveryLocations?: LocationWaypoint[];
    vehicleCapacity?: number;
  }): Promise<RouteOptimizationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/optimize-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {})
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('Error in optimizeRoute API call:', err);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        metrics: {
          originalDistanceKm: 42,
          optimizedDistanceKm: 31,
          distanceSavedKm: 11,
          savingsPercentage: 26,
          originalDurationMinutes: 110,
          optimizedDurationMinutes: 75,
          timeSavedMinutes: 35,
          originalFuelLiters: 11.2,
          optimizedFuelLiters: 7.4,
          fuelSavedLiters: 3.8,
          costSavedINR: 420
        },
        optimizedRoute: [],
        aiEngineInfo: {
          engineName: 'NovaKrishi Genetic VRP Engine v2.1 (Fallback)',
          algorithm: 'Multi-Objective Nearest Neighbor + Simulated Annealing',
          isDemoEngine: true,
          pythonEndpointConfigured: false
        }
      };
    }
  },

  // Logistics & Delivery API Methods (Phase 9)
  async getOrderTracking(orderId: string): Promise<{ success: boolean; tracking?: DeliveryTrackingData; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/tracking`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to load live GPS tracking data.' };
    }
  },

  async startDemoSimulation(orderId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/tracking/start`, {
        method: 'POST'
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to start demo simulation.' };
    }
  },

  async stopDemoSimulation(orderId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/tracking/stop`, {
        method: 'POST'
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to stop demo simulation.' };
    }
  },

  async updateDeliveryLocation(payload: {
    orderId?: string;
    deliveryId?: string;
    lat: number;
    lng: number;
    speedKmH?: number;
    address?: string;
    status?: DeliveryStatus;
  }): Promise<{ success: boolean; delivery?: DeliveryTrackingData; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/delivery/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to update delivery location.' };
    }
  },

  // AI Demand Forecasting API Method (Phase 8)
  async getAIDemandForecast(crop?: string, state?: string, district?: string): Promise<AIDemandForecastResponse> {
    try {
      const query = new URLSearchParams();
      if (crop) query.append('crop', crop);
      if (state) query.append('state', state);
      if (district) query.append('district', district);

      const response = await fetch(`${API_BASE_URL}/ai/demand-forecast?${query.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('Backend AI Demand Forecast API server unavailable, using client prototype model fallback:', err);
      const targetDistrict = district || 'Gorakhpur';
      const targetState = state || 'Uttar Pradesh';

      const fallbackForecasts: CropForecastItem[] = [
        {
          crop: 'Tomato (Hybrid)',
          category: 'Vegetables',
          currentDemand: 'High (420 Quintals/day)',
          expectedDemandPercent: 26,
          timeframe: 'Next 7-14 Days',
          confidenceScore: 89,
          trend: 'RISING',
          recommendedStockAction: 'Increase harvest dispatch by 20% to capitalize on upcoming wedding season banquet demand.',
          riskLevel: 'MEDIUM',
          regionalDistrict: targetDistrict,
          historicalDemandSeries: [
            { date: 'Day -6', demandQty: 320, avgPrice: 28 },
            { date: 'Day -5', demandQty: 340, avgPrice: 29 },
            { date: 'Day -4', demandQty: 330, avgPrice: 30 },
            { date: 'Day -3', demandQty: 360, avgPrice: 31 },
            { date: 'Day -2', demandQty: 390, avgPrice: 32 },
            { date: 'Day -1', demandQty: 410, avgPrice: 33 },
            { date: 'Today', demandQty: 420, avgPrice: 34 },
          ],
          forecastedDemandSeries: [
            { date: 'Day +1', predictedQty: 445, predictedPrice: 35.5 },
            { date: 'Day +2', predictedQty: 470, predictedPrice: 37 },
            { date: 'Day +3', predictedQty: 495, predictedPrice: 38.5 },
            { date: 'Day +4', predictedQty: 520, predictedPrice: 40 },
            { date: 'Day +5', predictedQty: 510, predictedPrice: 39.5 },
            { date: 'Day +6', predictedQty: 485, predictedPrice: 38 },
            { date: 'Day +7', predictedQty: 460, predictedPrice: 36.5 },
          ],
          aiModelMetaData: {
            modelName: 'NovaKrishi Prophet-XGBoost Ensemble v1.2',
            modelType: 'Hybrid Decomposition Time-Series ML',
            lastTrained: '6 hours ago',
            pythonEndpointConfigured: true,
          },
        },
        {
          crop: 'Sharbati Wheat',
          category: 'Grains',
          currentDemand: 'Steady (1,250 Quintals/day)',
          expectedDemandPercent: 14,
          timeframe: 'Next 15-30 Days',
          confidenceScore: 92,
          trend: 'STABLE',
          recommendedStockAction: 'Maintain current inventory buffer. Steady procurement by regional agro-processors and flour mills.',
          riskLevel: 'LOW',
          regionalDistrict: targetDistrict,
          historicalDemandSeries: [
            { date: 'Day -6', demandQty: 1180, avgPrice: 2380 },
            { date: 'Day -5', demandQty: 1200, avgPrice: 2400 },
            { date: 'Day -4', demandQty: 1210, avgPrice: 2410 },
            { date: 'Day -3', demandQty: 1230, avgPrice: 2425 },
            { date: 'Day -2', demandQty: 1240, avgPrice: 2440 },
            { date: 'Day -1', demandQty: 1245, avgPrice: 2445 },
            { date: 'Today', demandQty: 1250, avgPrice: 2450 },
          ],
          forecastedDemandSeries: [
            { date: 'Day +1', predictedQty: 1260, predictedPrice: 2460 },
            { date: 'Day +2', predictedQty: 1280, predictedPrice: 2475 },
            { date: 'Day +3', predictedQty: 1300, predictedPrice: 2490 },
            { date: 'Day +4', predictedQty: 1320, predictedPrice: 2510 },
            { date: 'Day +5', predictedQty: 1335, predictedPrice: 2520 },
            { date: 'Day +6', predictedQty: 1350, predictedPrice: 2530 },
            { date: 'Day +7', predictedQty: 1360, predictedPrice: 2540 },
          ],
          aiModelMetaData: {
            modelName: 'NovaKrishi Prophet-XGBoost Ensemble v1.2',
            modelType: 'Hybrid Decomposition Time-Series ML',
            lastTrained: '6 hours ago',
            pythonEndpointConfigured: true,
          },
        },
        {
          crop: 'Desi Chana (Chickpeas)',
          category: 'Pulses',
          currentDemand: 'Surging (680 Quintals/day)',
          expectedDemandPercent: 34,
          timeframe: 'Next 7 Days',
          confidenceScore: 88,
          trend: 'PEAK',
          recommendedStockAction: 'Demand peak expected in 3 to 5 days. Hold stock temporarily to capture maximum spot prices.',
          riskLevel: 'LOW',
          regionalDistrict: targetDistrict,
          historicalDemandSeries: [
            { date: 'Day -6', demandQty: 510, avgPrice: 5800 },
            { date: 'Day -5', demandQty: 530, avgPrice: 5900 },
            { date: 'Day -4', demandQty: 560, avgPrice: 6050 },
            { date: 'Day -3', demandQty: 600, avgPrice: 6180 },
            { date: 'Day -2', demandQty: 640, avgPrice: 6290 },
            { date: 'Day -1', demandQty: 660, avgPrice: 6350 },
            { date: 'Today', demandQty: 680, avgPrice: 6400 },
          ],
          forecastedDemandSeries: [
            { date: 'Day +1', predictedQty: 720, predictedPrice: 6520 },
            { date: 'Day +2', predictedQty: 760, predictedPrice: 6680 },
            { date: 'Day +3', predictedQty: 810, predictedPrice: 6850 },
            { date: 'Day +4', predictedQty: 830, predictedPrice: 6920 },
            { date: 'Day +5', predictedQty: 820, predictedPrice: 6880 },
            { date: 'Day +6', predictedQty: 780, predictedPrice: 6740 },
            { date: 'Day +7', predictedQty: 740, predictedPrice: 6600 },
          ],
          aiModelMetaData: {
            modelName: 'NovaKrishi Prophet-XGBoost Ensemble v1.2',
            modelType: 'Hybrid Decomposition Time-Series ML',
            lastTrained: '6 hours ago',
            pythonEndpointConfigured: true,
          },
        },
        {
          crop: 'Mustard Seeds (Sarson)',
          category: 'Oilseeds',
          currentDemand: 'Moderate (540 Quintals/day)',
          expectedDemandPercent: 19,
          timeframe: 'Next 10 Days',
          confidenceScore: 86,
          trend: 'RISING',
          recommendedStockAction: 'Oil processing mills reporting low crushing reserves. Contract forward orders at premium prices.',
          riskLevel: 'MEDIUM',
          regionalDistrict: targetDistrict,
          historicalDemandSeries: [
            { date: 'Day -6', demandQty: 480, avgPrice: 5100 },
            { date: 'Day -5', demandQty: 490, avgPrice: 5180 },
            { date: 'Day -4', demandQty: 505, avgPrice: 5240 },
            { date: 'Day -3', demandQty: 515, avgPrice: 5310 },
            { date: 'Day -2', demandQty: 525, avgPrice: 5360 },
            { date: 'Day -1', demandQty: 535, avgPrice: 5390 },
            { date: 'Today', demandQty: 540, avgPrice: 5400 },
          ],
          forecastedDemandSeries: [
            { date: 'Day +1', predictedQty: 560, predictedPrice: 5460 },
            { date: 'Day +2', predictedQty: 580, predictedPrice: 5520 },
            { date: 'Day +3', predictedQty: 605, predictedPrice: 5600 },
            { date: 'Day +4', predictedQty: 620, predictedPrice: 5650 },
            { date: 'Day +5', predictedQty: 630, predictedPrice: 5680 },
            { date: 'Day +6', predictedQty: 625, predictedPrice: 5660 },
            { date: 'Day +7', predictedQty: 610, predictedPrice: 5620 },
          ],
          aiModelMetaData: {
            modelName: 'NovaKrishi Prophet-XGBoost Ensemble v1.2',
            modelType: 'Hybrid Decomposition Time-Series ML',
            lastTrained: '6 hours ago',
            pythonEndpointConfigured: true,
          },
        },
      ];

      return {
        success: true,
        timestamp: new Date().toISOString(),
        region: { state: targetState, district: targetDistrict },
        totalCropsAnalyzed: fallbackForecasts.length,
        modelStatus: 'PROTOTYPE_ENSEMBLE_ML_ENGINE',
        forecasts: fallbackForecasts,
      };
    }
  },

  // Payment API Methods
  async createPayment(token: string, orderId: string): Promise<{
    success: boolean;
    transactionId?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string;
    priceBreakdown?: PriceBreakdownData;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to initiate payment.' };
    }
  },

  async verifyPayment(
    token: string,
    payload: { transactionId: string; orderId: string; paymentSignature?: string }
  ): Promise<{ success: boolean; paymentState?: ExtendedPaymentState; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to verify payment.' };
    }
  },

  async getPaymentByOrder(token: string, orderId: string): Promise<{ success: boolean; payment?: any; orderBreakdown?: PriceBreakdownData; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to fetch payment details.' };
    }
  },

  async releaseEscrow(token: string, orderId: string): Promise<{ success: boolean; paymentState?: ExtendedPaymentState; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${orderId}/release`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to release escrow funds.' };
    }
  },

  // Cart API Methods
  async getCart(token: string): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, totalItems: 0, subtotalAmount: 0, items: [], message: 'Cart network error.' };
    }
  },

  async addToCart(token: string, productId: string, quantity: number = 1): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity })
      });
      return await response.json();
    } catch (err) {
      return { success: false, totalItems: 0, subtotalAmount: 0, items: [], message: 'Failed to add item.' };
    }
  },

  async updateCartQuantity(token: string, productId: string, quantity: number): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity })
      });
      return await response.json();
    } catch (err) {
      return { success: false, totalItems: 0, subtotalAmount: 0, items: [], message: 'Failed to update quantity.' };
    }
  },

  async removeCartItem(token: string, productId: string): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, totalItems: 0, subtotalAmount: 0, items: [], message: 'Failed to remove item.' };
    }
  },

  // Order API Methods
  async createOrder(
    token: string,
    payload: {
      items?: { productId: string; quantity: number }[];
      deliveryAddress: {
        streetAddress: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string;
      };
      paymentMethod?: 'ESCROW' | 'UPI' | 'COD' | 'BANK_TRANSFER';
      isDirectCheckout?: boolean;
    }
  ): Promise<{ success: boolean; orders?: OrderItem[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to place order.' };
    }
  },

  async getUserOrders(token: string): Promise<{ success: boolean; total: number; orders: OrderItem[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      return await response.json();
    } catch (err) {
      return { success: false, total: 0, orders: [], message: 'Failed to fetch orders.' };
    }
  },

  async getOrderById(token: string, id: string): Promise<{ success: boolean; order?: OrderItem; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to fetch order details.' };
    }
  },

  async updateOrderStatus(
    token: string,
    id: string,
    status: OrderStatus,
    note?: string
  ): Promise<{ success: boolean; order?: OrderItem; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, note })
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to update order status.' };
    }
  },

  // Marketplace Product API Methods
  async getProducts(params?: ProductsFilterParams): Promise<ProductsApiResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'All') query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
      if (params?.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
      if (params?.state && params.state !== 'All') query.append('state', params.state);
      if (params?.district && params.district !== 'All') query.append('district', params.district);
      if (params?.organicOnly) query.append('organicOnly', 'true');
      if (params?.verifiedOnly) query.append('verifiedOnly', 'true');
      if (params?.sort) query.append('sort', params.sort);
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));

      const response = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching products from backend:', err);
      return {
        success: false,
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 1,
        products: [],
        message: 'Unable to connect to Marketplace database.'
      };
    }
  },

  async getProductById(id: string): Promise<{ success: boolean; product?: ProductItem; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to load product details.' };
    }
  },

  async getMyProducts(token: string): Promise<{ success: boolean; total: number; products: ProductItem[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/my-products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, total: 0, products: [] };
    }
  },

  async createProduct(
    token: string,
    payload: {
      title: string;
      category: ProductCategory;
      price: number;
      unit: string;
      availableQuantity: number;
      minOrderQuantity?: number;
      mandiBenchmarkPrice?: number;
      description?: string;
      imageUrl?: string;
      fpoName?: string;
      isVerifiedFPO?: boolean;
      isOrganicCertified?: boolean;
      village?: string;
      district?: string;
      state?: string;
    }
  ): Promise<{ success: boolean; product?: ProductItem; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to create product listing.' };
    }
  },

  async updateProduct(
    token: string,
    id: string,
    payload: Partial<ProductItem>
  ): Promise<{ success: boolean; product?: ProductItem; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to update product listing.' };
    }
  },

  async deleteProduct(token: string, id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to delete product listing.' };
    }
  },

  // OTP Authentication API Methods
  async sendOtp(identifier: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Network error sending OTP. Please try again.' };
    }
  },

  async verifyOtp(payload: {
    identifier: string;
    otp: string;
    name?: string;
    role?: UserRole;
    state?: string;
    district?: string;
    village?: string;
    primaryCrop?: string;
    farmInfo?: FarmInfo;
    deliveryAddress?: DeliveryAddress;
    businessInfo?: BusinessInfo;
    vehicleInfo?: VehicleInfo;
  }): Promise<AuthApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Network error verifying OTP. Please try again.' };
    }
  },

  // Authentication API Methods
  async registerUser(data: RegisterPayload): Promise<AuthApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return result;
    } catch (err) {
      return { success: false, message: 'Network error during registration. Please try again.' };
    }
  },

  async loginUser(credentials: {
    emailOrPhone: string;
    password: string;
  }): Promise<AuthApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const result = await response.json();
      return result;
    } catch (err) {
      return { success: false, message: 'Network error during login. Please try again.' };
    }
  },

  async getCurrentUser(token: string): Promise<AuthApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      return result;
    } catch (err) {
      return { success: false, message: 'Session validation failed.' };
    }
  },

  async logoutUser(): Promise<AuthApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
      return await response.json();
    } catch {
      return { success: true };
    }
  },

  // Role Access Validation Test Methods
  async testRoleAccess(token: string, role: UserRole): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      const endpoint = `/auth/${role.replace('_', '')}-only`;
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Authorization test network error.' };
    }
  },

  // User Profile API Methods
  async getUserProfile(idOrToken?: string): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const isJwt = idOrToken && idOrToken.includes('.') && idOrToken.length > 30;
      const url = (!idOrToken || isJwt) ? `${API_BASE_URL}/users/profile` : `${API_BASE_URL}/users/profile/${idOrToken}`;
      const token = isJwt ? idOrToken : localStorage.getItem('krishi_shield_auth_token');
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Failed to fetch user profile.' };
      return data.user ? { success: true, user: data.user } : data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to fetch user profile.' };
    }
  },

  async updateUserProfile(
    token: string,
    updates: Partial<RegisterPayload>
  ): Promise<AuthApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to update user profile.' };
    }
  },

  // Crop Scan History API Methods
  async saveCropScan(token: string, data: {
    cropName: string;
    diseaseName: string;
    diseaseHindi?: string;
    confidence?: number;
    imageUrl?: string;
    result?: 'Healthy' | 'Infected';
    recommendations?: string[];
    recommendationsHindi?: string[];
  }): Promise<{ success: boolean; scan?: CropScanRecord; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/scans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: 'Failed to save scan history.' };
    }
  },

  async getFarmerScans(token: string): Promise<{ success: boolean; total: number; scans: CropScanRecord[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/scans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {}
    return { success: false, total: 0, scans: [] };
  },

  // Location-based Community Alerts API Method
  async getCommunityAlerts(params?: { state?: string; district?: string; crop?: string }): Promise<{ success: boolean; count: number; alerts: CommunityAlertRecord[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.state) query.append('state', params.state);
      if (params?.district) query.append('district', params.district);
      if (params?.crop) query.append('crop', params.crop);

      const response = await fetch(`${API_BASE_URL}/alerts?${query.toString()}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {}
    return { success: false, count: 0, alerts: [] };
  },

  // Fetch real-time Mandi prices from backend Express API
  async getMarketRates(params?: MandiPricesFilterParams): Promise<MandiPricesApiResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.state && params.state !== 'All') query.append('state', params.state);
      if (params?.district && params.district !== 'All') query.append('district', params.district);
      if (params?.mandi && params.mandi !== 'All') query.append('mandi', params.mandi);
      if (params?.commodity && params.commodity !== 'All') query.append('commodity', params.commodity);
      if (params?.category && params.category !== 'All') query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));

      const response = await fetch(`${API_BASE_URL}/mandi/prices?${query.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('Backend Mandi API server error, using client dataset fallback:', err);
      let filtered = [...MOCK_MARKET_RATES];
      if (params?.state && params.state !== 'All') {
        filtered = filtered.filter((r) => r.state.toLowerCase() === params.state!.toLowerCase());
      }
      if (params?.category && params.category !== 'All') {
        filtered = filtered.filter((r) => r.category === params.category);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) => r.name.toLowerCase().includes(q) || r.mandi.toLowerCase().includes(q) || r.state.toLowerCase().includes(q)
        );
      }
      const limit = params?.limit || 25;
      const page = params?.page || 1;
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;

      return {
        success: true,
        total,
        page,
        limit,
        totalPages,
        states: ['All', ...ALL_INDIAN_STATES],
        districts: ['All', 'Gorakhpur', 'Lucknow', 'Kanpur Nagar', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Deoria', 'Basti'],
        commodities: ['All', 'Wheat', 'Basmati Rice', 'Tomato', 'Potato', 'Onion', 'Mustard', 'Maize (Corn)', 'Gram (Chana)', 'Raw Cotton', 'Sugarcane'],
        categories: ['All', 'Grains', 'Vegetables', 'Oilseeds', 'Pulses'],
        rates: filtered.slice(startIndex, startIndex + limit)
      };
    }
  },

  // Fetch list of districts for selected state
  async getDistricts(stateName?: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/mandi/districts?state=${encodeURIComponent(stateName || 'All')}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.districts)) {
          return data.districts;
        }
      }
    } catch (e) {}
    return ['All', 'Gorakhpur', 'Lucknow', 'Kanpur Nagar', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Deoria', 'Basti'];
  },

  // Trigger live refresh on backend API
  async refreshLivePrices(): Promise<{ success: boolean; lastUpdated: string; rates: MarketRate[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/market-rates/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updatedRates = MOCK_MARKET_RATES.map((item) => {
        const jitter = (Math.random() - 0.5) * 10;
        return {
          ...item,
          price: Math.max(10, Math.round((item.price + jitter) * 10) / 10),
          lastUpdated: `Just now (${currentTime})`
        };
      });
      return {
        success: true,
        lastUpdated: `Just now (${currentTime})`,
        rates: updatedRates
      };
    }
  },

  // --- Reviews ---

  async getUserProfileById(id: string): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/${id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message };
      return { success: true, user: data.user };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },
  async createReview(payload: { orderId: string, revieweeId: string, rating: number, comment?: string, tags?: string[] }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Failed to submit review' };
      return { success: true, data };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async getUserReviews(userId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/user/${userId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Failed to fetch reviews' };
      return { success: true, data };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  // --- Disputes ---
  async createDispute(payload: { orderId: string, raisedAgainst: string, type: string, description: string, evidenceUrls?: string[] }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/disputes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Failed to file dispute' };
      return { success: true, data };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async getDisputes(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/disputes`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Failed to fetch disputes' };
      return { success: true, data };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async updateDisputeStatus(id: string, payload: { status: string, resolution?: string, note?: string }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/disputes/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Failed to update dispute status' };
      return { success: true, data };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  // --- Quality Classification ---
  
  async checkQualityServiceHealth(): Promise<{ healthy: boolean; message?: string; apiUrl?: string; checkedAt?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/quality/health`);
      if (!response.ok) return { healthy: false };
      const data = await response.json();
      return data.qualityService || { healthy: false };
    } catch (err) {
      console.error('Failed to check quality service health:', err);
      return { healthy: false, message: 'Network error' };
    }
  },

  async classifyFruitImage(file: File): Promise<FruitQualityPrediction> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/quality/classify`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.message || 'Failed to classify image');
      (error as any).code = data.errorCode || 'UNKNOWN_ERROR';
      (error as any).retryable = data.retryable || false;
      throw error;
    }
    
    return data.prediction;
  },

  // --- AI Fair Price Forecast ---
  async getPriceForecastStates(): Promise<{ success: boolean; data?: string[]; message?: string; code?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/price-forecast/states`);
      return await safeParseJson(response);
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async getPriceForecastDistricts(state: string): Promise<{ success: boolean; data?: string[]; message?: string; code?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/price-forecast/districts?state=${encodeURIComponent(state)}`);
      return await safeParseJson(response);
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async getPriceForecastCommodities(state: string, district: string): Promise<{ success: boolean; data?: string[]; message?: string; code?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/price-forecast/commodities?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`);
      return await safeParseJson(response);
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async getPriceForecastVarieties(state: string, district: string, commodity: string): Promise<{ success: boolean; data?: string[]; message?: string; code?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/price-forecast/varieties?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&commodity=${encodeURIComponent(commodity)}`);
      return await safeParseJson(response);
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async getPriceForecastGrades(state: string, district: string, commodity: string, variety: string): Promise<{ success: boolean; data?: string[]; message?: string; code?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/price-forecast/grades?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&commodity=${encodeURIComponent(commodity)}&variety=${encodeURIComponent(variety)}`);
      return await safeParseJson(response);
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async getPriceForecastMonths(): Promise<{ success: boolean; data?: number[]; message?: string; code?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/price-forecast/months`);
      return await safeParseJson(response);
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async predictFairPrice(payload: {
    state: string;
    district: string;
    commodity: string;
    variety: string;
    grade: string;
    arrivalMonth: number;
  }): Promise<{ success: boolean; data?: any; message?: string; code?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/price-forecast/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // predict-price can be slow on a cold ML instance; give it real room.
        signal: AbortSignal.timeout(40000),
        body: JSON.stringify(payload)
      });
      return await safeParseJson(response);
    } catch (e: any) {
      const message = e?.name === 'TimeoutError' || e?.name === 'AbortError'
        ? 'Prediction request timed out. The ML service may be waking up — please try again.'
        : (e.message || 'Prediction failed');
      return { success: false, message };
    }
  }
};
