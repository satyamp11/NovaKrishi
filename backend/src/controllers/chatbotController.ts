// backend/src/controllers/chatbotController.ts
import type { Request, Response } from 'express';
import { mandiService } from '../services/mandiService.js';
import { weatherService } from '../services/weatherService.js';
import { alertService } from '../services/alertService.js';
import { priceForecastService } from '../services/priceForecastService.js';
import { matchFaq } from '../data/faqResponses.js';

type Language = 'en' | 'hi';
type Intent = 'mandi' | 'disease' | 'weather' | 'alerts' | 'forecast' | 'navigation' | 'faq' | 'generic_farming' | 'unknown';

interface ChatbotRequestBody {
  message: string;
  language?: Language;
  state?: string;
  district?: string;
}

// ── Intent keyword map ───────────────────────────────────────────────────

const INTENT_KEYWORDS: Record<Exclude<Intent, 'faq' | 'unknown'>, string[]> = {
  mandi:      ['mandi', 'price', 'bhav', 'rate', 'cost', 'kitna', 'भाव', 'कीमत', 'मंडी', 'market'],
  disease:    ['disease', 'bimari', 'spots', 'yellow', 'infection', 'pest', 'keeda', 'रोग', 'बीमारी', 'कीट', 'धब्बे', 'pila', 'jhulsa', 'blight', 'rust'],
  weather:    ['weather', 'rain', 'mausam', 'humidity', 'temperature', 'बारिश', 'मौसम', 'barish'],
  alerts:     ['alert', 'outbreak', 'near me', 'cluster', 'warning', 'अलर्ट', 'प्रकोप', 'खतरा', 'nearby'],
  forecast:   ['forecast', 'predict', 'will rise', 'will fall', 'next month', 'अनुमान', 'भविष्यवाणी', 'badhega', 'ghategaa', 'बढ़ेगा', 'घटेगा'],
  navigation: ['how do i', 'how to', 'where is', 'kaise', 'kahan', 'कैसे', 'कहां', 'guide me'],
  generic_farming: ['loan', 'subsidy', 'seed', 'fertilizer', 'irrigation', 'pani', 'water', 'yojana', 'scheme', 'tractor', 'kisan', 'kharif', 'rabi', 'sowing', 'harvest', 'market rate', 'pesticide', 'khad', 'बीज', 'खाद', 'सिंचाई', 'लोन', 'सब्सिडी', 'पानी'],
};

function detectIntent(message: string): Intent {
  const normalized = message.toLowerCase();
  if (INTENT_KEYWORDS.forecast.some((k) => normalized.includes(k)))   return 'forecast';
  if (INTENT_KEYWORDS.alerts.some((k) => normalized.includes(k)))     return 'alerts';
  if (INTENT_KEYWORDS.disease.some((k) => normalized.includes(k)))    return 'disease';
  if (INTENT_KEYWORDS.weather.some((k) => normalized.includes(k)))    return 'weather';
  if (INTENT_KEYWORDS.mandi.some((k) => normalized.includes(k)))      return 'mandi';
  if (matchFaq(message))                                               return 'faq';
  if (INTENT_KEYWORDS.navigation.some((k) => normalized.includes(k))) return 'navigation';
  if (INTENT_KEYWORDS.generic_farming.some((k) => normalized.includes(k))) return 'generic_farming';
  return 'unknown';
}

// ── Commodity name extraction ────────────────────────────────────────────

const KNOWN_COMMODITIES = [
  'wheat', 'gehu', 'gehun', 'गेहूं',
  'rice', 'dhan', 'chawal', 'paddy', 'धान',
  'tomato', 'tamatar', 'टमाटर',
  'potato', 'aloo', 'आलू',
  'onion', 'pyaz', 'प्याज',
  'sugarcane', 'ganna', 'गन्ना',
  'maize', 'makka', 'मक्का',
  'cotton', 'kapas', 'कपास',
  'mustard', 'sarson', 'सरसों',
  'soyabean', 'soya', 'सोयाबीन',
  'gram', 'chana', 'चना',
  'groundnut', 'moongfali', 'मूंगफली',
];

function extractCommodity(message: string): string | undefined {
  const normalized = message.toLowerCase();
  return KNOWN_COMMODITIES.find((c) => normalized.includes(c));
}

// ── State name → canonical alias map (all 28 states + 8 UTs) ──────────────
const STATE_ALIASES: Record<string, string> = {
  // Full names
  'andhra pradesh': 'Andhra Pradesh',
  'arunachal pradesh': 'Arunachal Pradesh',
  'assam': 'Assam',
  'bihar': 'Bihar',
  'chhattisgarh': 'Chhattisgarh',
  'goa': 'Goa',
  'gujarat': 'Gujarat',
  'haryana': 'Haryana',
  'himachal pradesh': 'Himachal Pradesh',
  'jharkhand': 'Jharkhand',
  'karnataka': 'Karnataka',
  'kerala': 'Kerala',
  'madhya pradesh': 'Madhya Pradesh',
  'maharashtra': 'Maharashtra',
  'manipur': 'Manipur',
  'meghalaya': 'Meghalaya',
  'mizoram': 'Mizoram',
  'nagaland': 'Nagaland',
  'odisha': 'Odisha',
  'orissa': 'Odisha',
  'punjab': 'Punjab',
  'rajasthan': 'Rajasthan',
  'sikkim': 'Sikkim',
  'tamil nadu': 'Tamil Nadu',
  'tamilnadu': 'Tamil Nadu',
  'telangana': 'Telangana',
  'tripura': 'Tripura',
  'uttar pradesh': 'Uttar Pradesh',
  'up': 'Uttar Pradesh',
  'uttarakhand': 'Uttarakhand',
  'uttrakhand': 'Uttarakhand',
  'west bengal': 'West Bengal',
  // UTs
  'delhi': 'Delhi',
  'chandigarh': 'Chandigarh',
  'puducherry': 'Puducherry',
  'pondicherry': 'Puducherry',
  'jammu and kashmir': 'Jammu and Kashmir',
  'ladakh': 'Ladakh',
  // Hinglish / common shortforms
  'mp': 'Madhya Pradesh',
  'hp': 'Himachal Pradesh',
  'ap': 'Andhra Pradesh',
  'wb': 'West Bengal',
  'tn': 'Tamil Nadu',
};

/**
 * Extracts a canonical Indian state name from the user's message.
 * Returns undefined if no state is mentioned.
 */
function extractStateFromMessage(message: string): string | undefined {
  const normalized = message.toLowerCase();
  // Longest match first to avoid 'up' matching inside 'group'
  const sorted = Object.keys(STATE_ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of sorted) {
    if (normalized.includes(alias)) {
      return STATE_ALIASES[alias];
    }
  }
  return undefined;
}

// ── Intent handlers ──────────────────────────────────────────────────────

async function handleMandi(message: string, lang: Language, farmerState?: string, farmerDistrict?: string) {
  const commodity = extractCommodity(message);

  // Extract location from message text first (user may mention any state/city)
  const mentionedDistrict = extractDistrictFromMessage(message);
  const mentionedState = extractStateFromMessage(message);

  // Use message-extracted location; fall back to farmer's saved location
  const resolvedState    = mentionedState    ?? farmerState;
  const resolvedDistrict = mentionedDistrict ?? farmerDistrict;

  const locationLabel = mentionedDistrict ?? mentionedState ?? resolvedDistrict ?? resolvedState ?? 'India';

  try {
    const result = await mandiService.getMandiPrices({
      state:     resolvedState,
      district:  resolvedDistrict,
      commodity,
      limit: 5,
    });

    const rates = result.rates ?? [];
    if (!rates.length) {
      return {
        reply:
          lang === 'hi'
            ? `माफ़ करें, ${locationLabel} में ${commodity ?? 'किसी फसल'} का आज का भाव उपलब्ध नहीं है। कृपया थोड़ी देर बाद या किसी अन्य जिले के साथ कोशिश करें।`
            : `Sorry, no price data found for ${commodity ?? 'any commodity'} in ${locationLabel} today. Please try again later or mention a nearby district.`,
        payload: null,
      };
    }

    const locationDisplay = mentionedDistrict ?? mentionedState ?? 'your area';
    const lines = rates
      .slice(0, 5)
      .map((r) => `• ${r.name}: ₹${r.price.toLocaleString('en-IN')}/${r.unit} — ${r.mandi}`)
      .join('\n');

    return {
      reply:
        lang === 'hi'
          ? `📊 ${locationDisplay} के आज के मंडी भाव:\n${lines}`
          : `📊 Today's mandi prices in ${locationDisplay}:\n${lines}`,
      payload: rates,
    };
  } catch {
    return {
      reply:
        lang === 'hi'
          ? 'अभी मंडी भाव लाने में समस्या आ रही है। कृपया थोड़ी देर बाद कोशिश करें।'
          : "I'm having trouble fetching mandi prices. Please try again shortly.",
      payload: null,
    };
  }
}

// ── Comprehensive district → lat/lon map (80+ Indian cities) ────────────
const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  // Uttar Pradesh
  Gorakhpur:      { lat: 26.7606, lon: 83.3732 },
  Lucknow:        { lat: 26.8467, lon: 80.9462 },
  Kanpur:         { lat: 26.4499, lon: 80.3319 },
  Varanasi:       { lat: 25.3176, lon: 82.9739 },
  Agra:           { lat: 27.1767, lon: 78.0081 },
  Prayagraj:      { lat: 25.4358, lon: 81.8463 },
  Allahabad:      { lat: 25.4358, lon: 81.8463 },
  Meerut:         { lat: 28.9845, lon: 77.7064 },
  Noida:          { lat: 28.5355, lon: 77.3910 },
  Ghaziabad:      { lat: 28.6692, lon: 77.4538 },
  Mathura:        { lat: 27.4924, lon: 77.6737 },
  Aligarh:        { lat: 27.8974, lon: 78.0880 },
  Bareilly:       { lat: 28.3670, lon: 79.4304 },
  Moradabad:      { lat: 28.8386, lon: 78.7733 },
  Saharanpur:     { lat: 29.9680, lon: 77.5510 },
  Deoria:         { lat: 26.5022, lon: 83.7836 },
  Basti:          { lat: 26.7980, lon: 82.7245 },
  Azamgarh:       { lat: 26.0684, lon: 83.1837 },
  Jhansi:         { lat: 25.4484, lon: 78.5685 },
  Faizabad:       { lat: 26.7752, lon: 82.1497 },
  Ayodhya:        { lat: 26.7930, lon: 82.1998 },
  Lakhimpur:      { lat: 27.9479, lon: 80.7763 },
  Raebareli:      { lat: 26.2329, lon: 81.2396 },
  // Delhi / NCR
  Delhi:          { lat: 28.6139, lon: 77.2090 },
  'New Delhi':    { lat: 28.6139, lon: 77.2090 },
  Faridabad:      { lat: 28.4082, lon: 77.3178 },
  Gurugram:       { lat: 28.4595, lon: 77.0266 },
  Gurgaon:        { lat: 28.4595, lon: 77.0266 },
  // Maharashtra
  Mumbai:         { lat: 19.0760, lon: 72.8777 },
  Pune:           { lat: 18.5204, lon: 73.8567 },
  Nashik:         { lat: 20.0110, lon: 73.7903 },
  Nagpur:         { lat: 21.1458, lon: 79.0882 },
  Aurangabad:     { lat: 19.8762, lon: 75.3433 },
  Solapur:        { lat: 17.6599, lon: 75.9064 },
  Kolhapur:       { lat: 16.7050, lon: 74.2433 },
  Ratnagiri:      { lat: 16.9902, lon: 73.3120 },
  Amravati:       { lat: 20.9333, lon: 77.7500 },
  // Rajasthan
  Jaipur:         { lat: 26.9124, lon: 75.7873 },
  Jodhpur:        { lat: 26.2389, lon: 73.0243 },
  Udaipur:        { lat: 24.5854, lon: 73.7125 },
  Kota:           { lat: 25.2138, lon: 75.8648 },
  Bharatpur:      { lat: 27.2152, lon: 77.5030 },
  Ajmer:          { lat: 26.4499, lon: 74.6399 },
  Bikaner:        { lat: 28.0229, lon: 73.3119 },
  // Punjab / Haryana
  Ludhiana:       { lat: 30.9010, lon: 75.8523 },
  Amritsar:       { lat: 31.6340, lon: 74.8723 },
  Chandigarh:     { lat: 30.7333, lon: 76.7794 },
  Patiala:        { lat: 30.3398, lon: 76.3869 },
  Rohtak:         { lat: 28.8955, lon: 76.6066 },
  Karnal:         { lat: 29.6857, lon: 76.9905 },
  Hisar:          { lat: 29.1492, lon: 75.7217 },
  Ambala:         { lat: 30.3782, lon: 76.7767 },
  // MP / CG
  Indore:         { lat: 22.7196, lon: 75.8577 },
  Bhopal:         { lat: 23.2599, lon: 77.4126 },
  Gwalior:        { lat: 26.2183, lon: 78.1828 },
  Ujjain:         { lat: 23.1765, lon: 75.7885 },
  Raipur:         { lat: 21.2514, lon: 81.6296 },
  Bilaspur:       { lat: 22.0796, lon: 82.1391 },
  // Gujarat
  Ahmedabad:      { lat: 23.0225, lon: 72.5714 },
  Surat:          { lat: 21.1702, lon: 72.8311 },
  Rajkot:         { lat: 22.3039, lon: 70.8022 },
  Vadodara:       { lat: 22.3072, lon: 73.1812 },
  Junagadh:       { lat: 21.5222, lon: 70.4579 },
  Anand:          { lat: 22.5645, lon: 72.9289 },
  // Bihar / Jharkhand
  Patna:          { lat: 25.5941, lon: 85.1376 },
  Gaya:           { lat: 24.7955, lon: 84.9994 },
  Muzaffarpur:    { lat: 26.1209, lon: 85.3647 },
  Ranchi:         { lat: 23.3441, lon: 85.3096 },
  Jamshedpur:     { lat: 22.8046, lon: 86.2029 },
  // South India
  Bangalore:      { lat: 12.9716, lon: 77.5946 },
  Bengaluru:      { lat: 12.9716, lon: 77.5946 },
  Chennai:        { lat: 13.0827, lon: 80.2707 },
  Hyderabad:      { lat: 17.3850, lon: 78.4867 },
  Coimbatore:     { lat: 11.0168, lon: 76.9558 },
  Thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
  Wayanad:        { lat: 11.6854, lon: 76.1320 },
  Ernakulam:      { lat: 10.0161, lon: 76.3093 },
  Kochi:          { lat: 9.9312, lon: 76.2673 },
  // Other
  Shimla:         { lat: 31.1048, lon: 77.1734 },
  Dehradun:       { lat: 30.3165, lon: 78.0322 },
  Haridwar:       { lat: 29.9457, lon: 78.1642 },
  Bhubaneswar:    { lat: 20.2961, lon: 85.8245 },
  Kolkata:        { lat: 22.5726, lon: 88.3639 },
  Guwahati:       { lat: 26.1445, lon: 91.7362 },
};

// Aliases for common alternate spellings / Hinglish names
const DISTRICT_ALIASES: Record<string, string> = {
  'gorakhpur': 'Gorakhpur', 'gkp': 'Gorakhpur',
  'noida': 'Noida', 'नोएडा': 'Noida',
  'delhi': 'Delhi', 'new delhi': 'New Delhi', 'दिल्ली': 'Delhi',
  'mumbai': 'Mumbai', 'मुंबई': 'Mumbai',
  'lucknow': 'Lucknow', 'लखनऊ': 'Lucknow',
  'varanasi': 'Varanasi', 'banaras': 'Varanasi', 'kashi': 'Varanasi', 'बनारस': 'Varanasi',
  'kanpur': 'Kanpur', 'कानपुर': 'Kanpur',
  'agra': 'Agra', 'आगरा': 'Agra',
  'jaipur': 'Jaipur', 'जयपुर': 'Jaipur',
  'pune': 'Pune', 'पुणे': 'Pune',
  'hyderabad': 'Hyderabad', 'हैदराबाद': 'Hyderabad',
  'chennai': 'Chennai', 'चेन्नई': 'Chennai',
  'bangalore': 'Bangalore', 'bengaluru': 'Bengaluru', 'बेंगलुरू': 'Bengaluru',
  'kolkata': 'Kolkata', 'calcutta': 'Kolkata', 'कोलकाता': 'Kolkata',
  'prayagraj': 'Prayagraj', 'allahabad': 'Allahabad', 'प्रयागराज': 'Prayagraj',
  'meerut': 'Meerut', 'मेरठ': 'Meerut',
  'ghaziabad': 'Ghaziabad', 'गाजियाबाद': 'Ghaziabad',
  'patna': 'Patna', 'पटना': 'Patna',
  'indore': 'Indore', 'इंदौर': 'Indore',
  'bhopal': 'Bhopal', 'भोपाल': 'Bhopal',
  'dehradun': 'Dehradun', 'देहरादून': 'Dehradun',
  'shimla': 'Shimla', 'शिमला': 'Shimla',
  'ludhiana': 'Ludhiana', 'amritsar': 'Amritsar',
  'chandigarh': 'Chandigarh', 'चंडीगढ़': 'Chandigarh',
  'surat': 'Surat', 'सूरत': 'Surat',
  'ahmedabad': 'Ahmedabad', 'अहमदाबाद': 'Ahmedabad',
  'nashik': 'Nashik', 'नासिक': 'Nashik',
  'nagpur': 'Nagpur', 'नागपुर': 'Nagpur',
  'gurgaon': 'Gurgaon', 'gurugram': 'Gurugram', 'गुरुग्राम': 'Gurugram',
  'faridabad': 'Faridabad', 'फरीदाबाद': 'Faridabad',
  'ranchi': 'Ranchi', 'रांची': 'Ranchi',
  'kochi': 'Kochi', 'cochin': 'Kochi', 'कोच्चि': 'Kochi',
  'guwahati': 'Guwahati', 'गुवाहाटी': 'Guwahati',
};

/**
 * Tries to extract a known district/city name from the user's message.
 * Returns the canonical city name or undefined if none found.
 */
function extractDistrictFromMessage(message: string): string | undefined {
  const normalized = message.toLowerCase().trim();

  // Check aliases first (exact and partial)
  for (const [alias, canonical] of Object.entries(DISTRICT_ALIASES)) {
    if (normalized.includes(alias.toLowerCase())) {
      return canonical;
    }
  }

  // Check canonical names
  for (const city of Object.keys(DISTRICT_COORDS)) {
    if (normalized.includes(city.toLowerCase())) {
      return city;
    }
  }

  return undefined;
}

async function handleWeather(message: string, lang: Language, district?: string) {
  // 1. Try to extract city from the user's actual message text
  // 2. Fall back to the farmer's saved district
  // 3. Final fallback: ask user to specify
  const mentionedCity = extractDistrictFromMessage(message);
  const districtName = mentionedCity ?? district;

  if (!districtName) {
    return {
      reply:
        lang === 'hi'
          ? 'कृपया अपना जिला या शहर बताएं, जैसे: "Noida mein weather kaisa hai?" या "Jaipur ka mausam batao"'
          : 'Please mention your city or district, e.g. "What is the weather in Noida?" or "Delhi weather"',
      payload: null,
    };
  }

  const coords = DISTRICT_COORDS[districtName];
  if (!coords) {
    return {
      reply:
        lang === 'hi'
          ? `माफ़ करें, ${districtName} का मौसम डेटा उपलब्ध नहीं है। कृपया एक प्रमुख जिले का नाम दें।`
          : `Sorry, I don't have weather data for "${districtName}" yet. Please try a major district name.`,
      payload: null,
    };
  }

  try {
    const raw = await weatherService.getCurrentWeather(coords.lat, coords.lon);
    const temp: number = Math.round(raw?.main?.temp ?? 0);
    const humidity: number = raw?.main?.humidity ?? 0;
    const condition: string = raw?.weather?.[0]?.description ?? 'N/A';
    const windSpeed: number = raw?.wind?.speed ?? 0;
    const feelsLike: number = Math.round(raw?.main?.feels_like ?? temp);

    // Disease risk from humidity + temp
    const risk = humidity > 80 ? (lang === 'hi' ? '🔴 उच्च' : '🔴 High')
                : humidity > 60 ? (lang === 'hi' ? '🟡 मध्यम' : '🟡 Moderate')
                : (lang === 'hi' ? '🟢 कम' : '🟢 Low');

    return {
      reply:
        lang === 'hi'
          ? `🌤️ ${districtName} का मौसम:\n🌡️ तापमान: ${temp}°C (महसूस: ${feelsLike}°C)\n💧 नमी: ${humidity}%\n💨 हवा: ${windSpeed} m/s\n🌥️ स्थिति: ${condition}\n🦠 रोग जोखिम: ${risk}`
          : `🌤️ Weather in ${districtName}:\n🌡️ Temp: ${temp}°C (Feels like: ${feelsLike}°C)\n💧 Humidity: ${humidity}%\n💨 Wind: ${windSpeed} m/s\n🌥️ Condition: ${condition}\n🦠 Disease Risk: ${risk}`,
      payload: { temp, humidity, condition, windSpeed, diseaseRiskIndex: risk, district: districtName },
    };
  } catch (err) {
    console.error('[KrishiBot] Weather fetch error:', err);
    return {
      reply:
        lang === 'hi'
          ? `${districtName} का मौसम डेटा अभी उपलब्ध नहीं है (API सीमा या नेटवर्क त्रुटि)। कृपया फिर से कोशिश करें।`
          : `Weather data for ${districtName} is unavailable right now (API limit or network error). Please try again.`,
      payload: null,
    };
  }
}

async function handleAlerts(message: string, lang: Language, farmerState?: string, farmerDistrict?: string) {
  // Extract location from message first (same pattern as handleMandi)
  const mentionedDistrict = extractDistrictFromMessage(message);
  const mentionedState    = extractStateFromMessage(message);

  // Priority: message-extracted > farmer's saved profile location
  const resolvedDistrict = mentionedDistrict ?? farmerDistrict;
  const resolvedState    = mentionedState    ?? farmerState;

  // Build a human-readable label for the response
  const locationLabel = mentionedDistrict
    ? mentionedDistrict
    : mentionedState
    ? mentionedState
    : resolvedDistrict
    ? resolvedDistrict
    : null; // null means "no location known"

  try {
    const alerts = await alertService.getRelevantAlerts(resolvedState, resolvedDistrict);
    if (!alerts.length) {
      const areaLabel = locationLabel
        ?? (lang === 'hi' ? 'किसी क्षेत्र' : 'any area');
      return {
        reply:
          lang === 'hi'
            ? `✅ अच्छी खबर! ${areaLabel} में अभी कोई सक्रिय बीमारी अलर्ट नहीं है।`
            : `✅ Good news! No active disease alerts in ${areaLabel} right now.`,
        payload: [],
      };
    }

    const lines = alerts
      .slice(0, 5)
      .map((a) => {
        if (a.type === 'disease') {
          const name = lang === 'hi' ? a.diseaseHindi : a.diseaseName;
          return `⚠️ ${name} [${a.severity}] — ${a.district}`;
        }
        if (a.type === 'price') return `📉 ${a.commodity}: ${a.direction === 'spike' ? '↑' : '↓'} ${a.percentChange}% — ${a.district}`;
        if (a.type === 'weather') return `🌧️ ${a.condition} — ${a.district}`;
        return '';
      })
      .filter(Boolean)
      .join('\n');

    // If no location was provided, clearly label the data as "recent/India-wide"
    const displayLabel = locationLabel
      ? (lang === 'hi' ? locationLabel : locationLabel)
      : (lang === 'hi' ? 'हाल के (भारत-व्यापी)' : 'Recent (India-wide)');

    const askHint = !locationLabel
      ? (lang === 'hi'
        ? '\n\n📍 अपने क्षेत्र के अलर्ट के लिए अपना जिला बताएं, जैसे: "Ghaziabad ke alerts"'
        : '\n\n📍 For alerts in your area, mention your district, e.g. "Alerts in Nashik"')
      : '';

    return {
      reply:
        lang === 'hi'
          ? `🚨 ${displayLabel} के सक्रिय अलर्ट (${alerts.length}):\n${lines}\n\n📱 पूरी जानकारी के लिए अलर्ट टैब खोलें।${askHint}`
          : `🚨 Active alerts — ${displayLabel} (${alerts.length}):\n${lines}\n\n📱 Open the Alerts tab for full details.${askHint}`,
      payload: alerts,
    };
  } catch {
    return {
      reply:
        lang === 'hi'
          ? 'अलर्ट डेटा लाने में समस्या हुई। कृपया फिर से कोशिश करें।'
          : "Couldn't fetch alert data right now. Please try again.",
      payload: null,
    };
  }
}



async function handleForecast(message: string, lang: Language, state?: string, district?: string) {
  const commodity = extractCommodity(message);
  if (!commodity || !state || !district) {
    return {
      reply:
        lang === 'hi'
          ? 'भविष्यवाणी के लिए कृपया फसल का नाम, राज्य और जिला बताएं। उदाहरण: "Gorakhpur mein gehu ka bhav badhega kya?"'
          : 'For a forecast, please mention the crop, state, and district. Example: "Will wheat price rise in Gorakhpur?"',
      payload: null,
    };
  }
  try {
    const currentMonth = new Date().getMonth() + 1;
    const prediction = await priceForecastService.predictPrice({
      state,
      district,
      commodity,
      variety: 'Common',
      grade: 'FAQ',
      arrivalMonth: currentMonth,
    });
    const price = prediction.predicted_modal_price;
    return {
      reply:
        lang === 'hi'
          ? `📈 ${commodity} का अनुमानित मॉडल भाव: ₹${Math.round(price).toLocaleString('en-IN')}/क्विंटल (${district}, ${state})`
          : `📈 Predicted modal price for ${commodity}: ₹${Math.round(price).toLocaleString('en-IN')}/Quintal (${district}, ${state})`,
      payload: prediction,
    };
  } catch {
    return {
      reply:
        lang === 'hi'
          ? 'भविष्यवाणी सेवा अभी उपलब्ध नहीं है (ML सर्वर स्लीप मोड में हो सकता है)। कृपया कुछ मिनट बाद कोशिश करें।'
          : "The forecast service is unavailable right now (ML server may be waking up). Please try again in a minute.",
      payload: null,
    };
  }
}

function handleDiseaseFaq(lang: Language) {
  return {
    reply:
      lang === 'hi'
        ? '🦠 फसल बीमारी के लिए: Scan टैब खोलें → प्रभावित पत्ते की साफ़ फोटो अपलोड करें → AI तुरंत बीमारी पहचान कर इलाज बताएगा। आप मुझे लक्षण भी बता सकते हैं जैसे "टमाटर पर पीले धब्बे"।'
        : '🦠 For crop disease: Open the Scan tab → upload a clear photo of the affected leaf → AI will identify the disease and suggest treatment. You can also describe symptoms like "yellow spots on tomato".',
    payload: null,
  };
}

function handleNavigationFallback(lang: Language) {
  return {
    reply:
      lang === 'hi'
        ? 'मैं आपको ऐप में मार्गदर्शन कर सकता हूँ। आप किस बारे में जानना चाहते हैं:\n• 🌾 मंडी भाव देखना\n• 🦠 फसल स्कैन करना\n• 🚨 रोग अलर्ट देखना\n• 🛒 Marketplace पर फसल बेचना'
        : "I can guide you around the app. What would you like to do?\n• 🌾 Check mandi prices\n• 🦠 Scan crop for disease\n• 🚨 View disease alerts\n• 🛒 Sell produce on Marketplace",
    payload: null,
  };
}

function handleGenericFarming(lang: Language, message: string) {
  // TODO: LLM API Integration (OpenAI/Gemini/Claude)
  // System Prompt for LLM: "Tum KrishiBot ho, ek Hindi-English bilingual farming assistant. Sirf agriculture, mandi, crop, weather, logistics se related helpful jawab do, short aur practical."
  // For now, return a smart keyword-based fallback response.
  return {
    reply:
      lang === 'hi'
        ? '🌱 बीज, खाद, या लोन जैसी खेती से जुड़ी अन्य जानकारी के लिए, कृपया हमारे Marketplace पर जाएँ या अपने नज़दीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।'
        : '🌱 For other farming queries like seeds, fertilizers, or loans, please check our Marketplace or contact your nearest Krishi Vigyan Kendra (KVK).',
    payload: null,
  };
}

function handleUnknown(lang: Language) {
  return {
    reply:
      lang === 'hi'
        ? 'माफ़ कीजिए, मैं अभी इस सवाल का सटीक जवाब नहीं दे पा रहा हूँ। कृपया नीचे दिए गए विकल्पों में से चुनें या अपना सवाल थोड़ा और स्पष्ट लिखें:\n• 🌾 Mandi Prices\n• 🦠 Disease Help\n• 🌤️ Weather Risk\n• 🚨 Alerts'
        : "Sorry, I am not able to give an exact answer to this question right now. Please choose from the options below or make your question more specific:\n• 🌾 Mandi Prices\n• 🦠 Disease Help\n• 🌤️ Weather Risk\n• 🚨 Alerts",
    payload: null,
  };
}

// ── Main exported controller ─────────────────────────────────────────────

export async function handleChatbotMessage(req: Request, res: Response) {
  try {
    const { message, language = 'en', state, district } = req.body as ChatbotRequestBody;

    if (!message?.trim()) {
      return res.status(400).json({ reply: 'Please type a message.', payload: null });
    }

    const lang: Language = language === 'hi' ? 'hi' : 'en';
    const intent = detectIntent(message);

    let result: { reply: string; payload: unknown };

    switch (intent) {
      case 'mandi':
        result = await handleMandi(message, lang, state, district);
        break;
      case 'weather':
        result = await handleWeather(message, lang, district);
        break;
      case 'alerts':
        result = await handleAlerts(message, lang, state, district);
        break;
      case 'forecast':
        result = await handleForecast(message, lang, state, district);
        break;
      case 'disease':
        result = handleDiseaseFaq(lang);
        break;
      case 'faq': {
        const faq = matchFaq(message);
        result = faq
          ? { reply: faq.reply[lang], payload: null }
          : handleUnknown(lang);
        break;
      }
      case 'navigation':
        result = handleNavigationFallback(lang);
        break;
      case 'generic_farming':
        result = handleGenericFarming(lang, message);
        break;
      default:
        result = handleUnknown(lang);
    }

    return res.status(200).json({ intent, ...result });
  } catch (err) {
    console.error('[KrishiBot] Controller error:', err);
    return res.status(500).json({
      reply: 'Something went wrong on our end. Please try again.',
      payload: null,
    });
  }
}
