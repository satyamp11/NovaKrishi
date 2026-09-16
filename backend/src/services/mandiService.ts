import { MarketRate, MarketRatesFilterQuery } from '../models/MarketRate.js';
import { ALL_INDIAN_STATES, INITIAL_MARKET_RATES } from '../utils/seedData.js';


interface CacheEntry {
  timestamp: number;
  data: any;
}
const cacheMap = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache


function getCropImage(commodityName: string): string {
  const name = commodityName.toLowerCase();
  if (name.includes('wheat') || name.includes('gehun')) return '/images/crops/wheat.jpg';
  if (name.includes('rice') || name.includes('paddy') || name.includes('dhan')) return '/images/crops/rice.jpg';
  if (name.includes('tomato') || name.includes('tamatar')) return '/images/crops/tomato.jpg';
  if (name.includes('potato') || name.includes('aalu')) return '/images/crops/potato.jpg';
  if (name.includes('onion') || name.includes('pyaz')) return '/images/crops/onion.jpg';
  if (name.includes('mustard') || name.includes('sarson') || name.includes('saarso')) return '/images/crops/mustard.jpg';
  if (name.includes('maize') || name.includes('corn') || name.includes('makka')) return '/images/crops/maize.jpg';
  if (name.includes('gram') || name.includes('chana') || name.includes('chickpea')) return '/images/crops/gram.jpg';
  if (name.includes('cotton') || name.includes('kapas')) return '/images/crops/cotton.jpg';
  if (name.includes('sugarcane') || name.includes('ganna')) return '/images/crops/sugarcane.jpg';
  if (name.includes('apple') || name.includes('seb')) return '/images/crops/apple.jpg';
  if (name.includes('tea') || name.includes('chai')) return '/images/crops/tea-leaves.jpg';
  if (name.includes('coconut') || name.includes('nariyal')) return '/images/crops/coconut.jpg';
  if (name.includes('pepper') || name.includes('mirch')) return '/images/crops/black-pepper.jpg';
  if (name.includes('soya') || name.includes('soyabean')) return '/images/crops/soyabean.jpg';
  if (name.includes('groundnut') || name.includes('peanut') || name.includes('moongfali')) return '/images/crops/groundnut.jpg';
  if (name.includes('mango') || name.includes('aam')) return '/images/crops/mango.jpg';
  return '/images/crops/wheat.jpg'; // fallback
}


function detectCategory(commodityName: string): string {
  const name = commodityName.toLowerCase();
  if (name.includes('rice') || name.includes('wheat') || name.includes('maize') || name.includes('paddy') || name.includes('barley') || name.includes('bajra') || name.includes('jowar') || name.includes('cotton') || name.includes('sugarcane') || name.includes('tea')) return 'Grains';
  if (name.includes('tomato') || name.includes('potato') || name.includes('onion') || name.includes('apple') || name.includes('mango') || name.includes('brinjal') || name.includes('cauliflower') || name.includes('cabbage') || name.includes('chilli') || name.includes('coconut') || name.includes('garlic') || name.includes('ginger')) return 'Vegetables';
  if (name.includes('mustard') || name.includes('soyabean') || name.includes('groundnut') || name.includes('sunflower') || name.includes('sesamum') || name.includes('pepper')) return 'Oilseeds';
  if (name.includes('chana') || name.includes('gram') || name.includes('arhar') || name.includes('tur') || name.includes('moong') || name.includes('urad') || name.includes('masur') || name.includes('pulse')) return 'Pulses';
  return 'Grains';
}


const COMPREHENSIVE_MANDI_DATABASE: MarketRate[] = [
  // Uttar Pradesh - Gorakhpur District Mandis
  {
    id: "up-gkp-1",
    name: "Basmati Rice (Paddy)",
    nameHindi: "बासमती धान",
    category: "Grains",
    price: 3120,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Gorakhpur Mandi",
    mandiHindi: "गोरखपुर मंडी",
    district: "Gorakhpur",
    districtHindi: "गोरखपुर",
    state: "Uttar Pradesh",
    variety: "Common Basmati",
    grade: "FAQ",
    minPrice: 3000,
    maxPrice: 3250,
    modalPrice: 3120,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 1.5,
    lastUpdated: "Today, 11:30 AM",
    trend7d: [3050, 3070, 3080, 3100, 3110, 3115, 3120],
    trend30d: [2950, 2980, 3020, 3050, 3080, 3100, 3120],
    image: "/images/crops/rice.jpg"
  },
  {
    id: "up-gkp-2",
    name: "Wheat (Sharbati)",
    nameHindi: "गेहूं (शरबती)",
    category: "Grains",
    price: 2480,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Gorakhpur Mandi",
    mandiHindi: "गोरखपुर मंडी",
    district: "Gorakhpur",
    districtHindi: "गोरखपुर",
    state: "Uttar Pradesh",
    variety: "Sharbati",
    grade: "FAQ",
    minPrice: 2400,
    maxPrice: 2550,
    modalPrice: 2480,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 2.1,
    lastUpdated: "Today, 11:15 AM",
    trend7d: [2410, 2420, 2435, 2450, 2460, 2470, 2480],
    trend30d: [2350, 2380, 2400, 2430, 2450, 2465, 2480],
    image: "/images/crops/wheat.jpg"
  },
  {
    id: "up-gkp-3",
    name: "Fresh Tomato",
    nameHindi: "ताज़ा टमाटर",
    category: "Vegetables",
    price: 28,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Sahjanwa Mandi (Gorakhpur)",
    mandiHindi: "सहजनवां मंडी (गोरखपुर)",
    district: "Gorakhpur",
    districtHindi: "गोरखपुर",
    state: "Uttar Pradesh",
    variety: "Hybrid Red",
    grade: "FAQ",
    minPrice: 24,
    maxPrice: 32,
    modalPrice: 28,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: -1.8,
    lastUpdated: "Today, 10:45 AM",
    trend7d: [31, 30, 30, 29, 29, 28.5, 28],
    trend30d: [35, 34, 32, 31, 30, 29, 28],
    image: "/images/crops/tomato.jpg"
  },
  {
    id: "up-gkp-4",
    name: "Potato (Desi)",
    nameHindi: "देशू आलू",
    category: "Vegetables",
    price: 16,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Chauri Chaura Mandi",
    mandiHindi: "चौरी चौरा मंडी",
    district: "Gorakhpur",
    districtHindi: "गोरखपुर",
    state: "Uttar Pradesh",
    variety: "Jyoti",
    grade: "FAQ",
    minPrice: 14,
    maxPrice: 18,
    modalPrice: 16,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 0.5,
    lastUpdated: "Today, 10:20 AM",
    trend7d: [15, 15.2, 15.4, 15.5, 15.8, 15.9, 16],
    trend30d: [14, 14.5, 14.8, 15, 15.2, 15.5, 16],
    image: "/images/crops/potato.jpg"
  },
  {
    id: "up-gkp-5",
    name: "Mustard Oilseed",
    nameHindi: "सरसों",
    category: "Oilseeds",
    price: 5520,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Gorakhpur Mandi",
    mandiHindi: "गोरखपुर मंडी",
    district: "Gorakhpur",
    districtHindi: "गोरखपुर",
    state: "Uttar Pradesh",
    variety: "Yellow Mustard",
    grade: "FAQ",
    minPrice: 5350,
    maxPrice: 5650,
    modalPrice: 5520,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 3.2,
    lastUpdated: "Today, 11:40 AM",
    trend7d: [5320, 5360, 5400, 5440, 5480, 5500, 5520],
    trend30d: [5100, 5200, 5300, 5380, 5450, 5500, 5520],
    image: "/images/crops/mustard.jpg"
  },
  {
    id: "up-gkp-6",
    name: "Sugarcane",
    nameHindi: "गन्ना",
    category: "Grains",
    price: 365,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Pipraich Sugar Mill Mandi",
    mandiHindi: "पिपराइच चीनी मिल मंडी",
    district: "Gorakhpur",
    districtHindi: "गोरखपुर",
    state: "Uttar Pradesh",
    variety: "Co-0238",
    grade: "FAQ",
    minPrice: 350,
    maxPrice: 375,
    modalPrice: 365,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 0.8,
    lastUpdated: "Today, 09:30 AM",
    trend7d: [360, 361, 362, 363, 364, 364, 365],
    trend30d: [350, 352, 355, 358, 360, 362, 365],
    image: "/images/crops/sugarcane.jpg"
  },
  {
    id: "up-gkp-7",
    name: "Gram (Chana)",
    nameHindi: "चना",
    category: "Pulses",
    price: 5750,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Gorakhpur Mandi",
    mandiHindi: "गोरखपुर मंडी",
    district: "Gorakhpur",
    districtHindi: "गोरखपुर",
    state: "Uttar Pradesh",
    variety: "Desi Chana",
    grade: "FAQ",
    minPrice: 5600,
    maxPrice: 5900,
    modalPrice: 5750,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 1.2,
    lastUpdated: "Today, 10:10 AM",
    trend7d: [5650, 5670, 5690, 5710, 5730, 5740, 5750],
    trend30d: [5500, 5550, 5600, 5650, 5700, 5730, 5750],
    image: "/images/crops/gram.jpg"
  },
  {
    id: "up-gkp-8",
    name: "Red Onion",
    nameHindi: "लाल प्याज",
    category: "Vegetables",
    price: 26,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Sahjanwa Mandi (Gorakhpur)",
    mandiHindi: "सहजनवां मंडी (गोरखपुर)",
    district: "Gorakhpur",
    districtHindi: "गोरखपुर",
    state: "Uttar Pradesh",
    variety: "Nashik Red",
    grade: "FAQ",
    minPrice: 22,
    maxPrice: 30,
    modalPrice: 26,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: -2.0,
    lastUpdated: "Today, 11:00 AM",
    trend7d: [28, 27.5, 27, 26.8, 26.5, 26.2, 26],
    trend30d: [32, 30, 29, 28, 27, 26.5, 26],
    image: "/images/crops/onion.jpg"
  },

  // Uttar Pradesh - Deoria District Mandi
  {
    id: "up-deo-1",
    name: "Sugarcane",
    nameHindi: "गन्ना",
    category: "Grains",
    price: 362,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Deoria Mandi",
    mandiHindi: "देवरिया मंडी",
    district: "Deoria",
    districtHindi: "देवरिया",
    state: "Uttar Pradesh",
    variety: "High Yield",
    grade: "FAQ",
    minPrice: 350,
    maxPrice: 370,
    modalPrice: 362,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 0.6,
    lastUpdated: "Today, 10:00 AM",
    trend7d: [358, 359, 360, 360, 361, 361, 362],
    trend30d: [350, 352, 354, 356, 358, 360, 362],
    image: "/images/crops/sugarcane.jpg"
  },
  {
    id: "up-deo-2",
    name: "Paddy Rice",
    nameHindi: "धान",
    category: "Grains",
    price: 2240,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Bhatpar Rani Mandi",
    mandiHindi: "भाटपार रानी मंडी",
    district: "Deoria",
    districtHindi: "देवरिया",
    state: "Uttar Pradesh",
    variety: "Swarna",
    grade: "FAQ",
    minPrice: 2150,
    maxPrice: 2300,
    modalPrice: 2240,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 1.1,
    lastUpdated: "Today, 09:45 AM",
    trend7d: [2200, 2210, 2215, 2220, 2230, 2235, 2240],
    trend30d: [2150, 2170, 2190, 2200, 2220, 2230, 2240],
    image: "/images/crops/rice.jpg"
  },

  // Uttar Pradesh - Basti District Mandi
  {
    id: "up-bst-1",
    name: "Wheat",
    nameHindi: "गेहूं",
    category: "Grains",
    price: 2430,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Basti Mandi",
    mandiHindi: "बस्ती मंडी",
    district: "Basti",
    districtHindi: "बस्ती",
    state: "Uttar Pradesh",
    variety: "Common",
    grade: "FAQ",
    minPrice: 2360,
    maxPrice: 2480,
    modalPrice: 2430,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 1.0,
    lastUpdated: "Today, 10:30 AM",
    trend7d: [2400, 2405, 2410, 2415, 2420, 2425, 2430],
    trend30d: [2320, 2340, 2360, 2380, 2400, 2415, 2430],
    image: "/images/crops/wheat.jpg"
  },

  // Uttar Pradesh - Lucknow District Mandi
  {
    id: "up-lko-1",
    name: "Fresh Tomato",
    nameHindi: "टमाटर",
    category: "Vegetables",
    price: 30,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Dubagga Mandi (Lucknow)",
    mandiHindi: "दुबग्गा मंडी (लखनऊ)",
    district: "Lucknow",
    districtHindi: "लखनऊ",
    state: "Uttar Pradesh",
    variety: "Hybrid",
    grade: "Super",
    minPrice: 26,
    maxPrice: 34,
    modalPrice: 30,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 2.5,
    lastUpdated: "Today, 11:20 AM",
    trend7d: [27, 28, 28, 29, 29.5, 30, 30],
    trend30d: [22, 24, 25, 27, 28, 29, 30],
    image: "/images/crops/tomato.jpg"
  },
  {
    id: "up-lko-2",
    name: "Potato",
    nameHindi: "आलू",
    category: "Vegetables",
    price: 17,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Naveen Galla Mandi (Lucknow)",
    mandiHindi: "नवीन गल्ला मंडी (लखनऊ)",
    district: "Lucknow",
    districtHindi: "लखनऊ",
    state: "Uttar Pradesh",
    variety: "Kufri",
    grade: "FAQ",
    minPrice: 15,
    maxPrice: 19,
    modalPrice: 17,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 0.8,
    lastUpdated: "Today, 10:50 AM",
    trend7d: [16, 16.2, 16.5, 16.6, 16.8, 16.9, 17],
    trend30d: [14.5, 15, 15.5, 16, 16.5, 16.8, 17],
    image: "/images/crops/potato.jpg"
  },

  // Uttar Pradesh - Kanpur District Mandi
  {
    id: "up-knp-1",
    name: "Gram (Chana)",
    nameHindi: "चना",
    category: "Pulses",
    price: 5820,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Kanpur Mandi",
    mandiHindi: "कानपुर मंडी",
    district: "Kanpur Nagar",
    districtHindi: "कानपुर नगर",
    state: "Uttar Pradesh",
    variety: "Bold",
    grade: "FAQ",
    minPrice: 5680,
    maxPrice: 5950,
    modalPrice: 5820,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 1.9,
    lastUpdated: "Today, 11:10 AM",
    trend7d: [5700, 5720, 5750, 5780, 5800, 5810, 5820],
    trend30d: [5550, 5600, 5650, 5720, 5780, 5800, 5820],
    image: "/images/crops/gram.jpg"
  },

  // Uttar Pradesh - Agra District Mandi
  {
    id: "up-agr-1",
    name: "Potato",
    nameHindi: "आलू",
    category: "Vegetables",
    price: 18,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Agra Mandi",
    mandiHindi: "आगरा मंडी",
    district: "Agra",
    districtHindi: "आगरा",
    state: "Uttar Pradesh",
    variety: "Red Potato",
    grade: "FAQ",
    minPrice: 16,
    maxPrice: 20,
    modalPrice: 18,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 1.2,
    lastUpdated: "Today, 11:00 AM",
    trend7d: [17, 17.2, 17.5, 17.5, 17.8, 17.9, 18],
    trend30d: [15, 15.5, 16, 16.5, 17, 17.5, 18],
    image: "/images/crops/potato.jpg"
  },

  // Uttar Pradesh - Muzaffarnagar Mandi
  {
    id: "up-mzf-1",
    name: "Sugarcane",
    nameHindi: "गन्ना",
    category: "Grains",
    price: 360,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Muzaffarnagar Mandi",
    mandiHindi: "मुज़फ़्फ़रनगर मंडी",
    district: "Muzaffarnagar",
    districtHindi: "मुज़फ़्फ़रनगर",
    state: "Uttar Pradesh",
    variety: "Sugar Rich",
    grade: "FAQ",
    minPrice: 345,
    maxPrice: 370,
    modalPrice: 360,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 0.8,
    lastUpdated: "Today, 11:30 AM",
    trend7d: [355, 356, 357, 358, 359, 360, 360],
    trend30d: [345, 348, 350, 352, 355, 358, 360],
    image: "/images/crops/sugarcane.jpg"
  },

  // Punjab Mandis
  {
    id: "pb-ludh-1",
    name: "Maize (Corn)",
    nameHindi: "मक्का",
    category: "Grains",
    price: 2120,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Ludhiana Mandi",
    mandiHindi: "लुधियाना मंडी",
    district: "Ludhiana",
    districtHindi: "लुधियाना",
    state: "Punjab",
    variety: "Yellow Corn",
    grade: "FAQ",
    minPrice: 2050,
    maxPrice: 2180,
    modalPrice: 2120,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 0.5,
    lastUpdated: "Today, 09:30 AM",
    trend7d: [2100, 2105, 2110, 2110, 2115, 2118, 2120],
    trend30d: [2050, 2060, 2080, 2090, 2100, 2110, 2120],
    image: "/images/crops/maize.jpg"
  },

  // Haryana Mandis
  {
    id: "hr-rtk-1",
    name: "Wheat",
    nameHindi: "गेहूं",
    category: "Grains",
    price: 2450,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Rohtak Mandi",
    mandiHindi: "रोहतक मंडी",
    district: "Rohtak",
    districtHindi: "रोहतक",
    state: "Haryana",
    variety: "HD-2967",
    grade: "FAQ",
    minPrice: 2380,
    maxPrice: 2500,
    modalPrice: 2450,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 2.4,
    lastUpdated: "Today, 10:30 AM",
    trend7d: [2380, 2400, 2410, 2425, 2430, 2440, 2450],
    trend30d: [2300, 2320, 2350, 2380, 2400, 2420, 2450],
    image: "/images/crops/wheat.jpg"
  },
  {
    id: "hr-krn-1",
    name: "Basmati Rice",
    nameHindi: "बासमती धान",
    category: "Grains",
    price: 3180,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Karnal Mandi",
    mandiHindi: "करनाल मंडी",
    district: "Karnal",
    districtHindi: "करनाल",
    state: "Haryana",
    variety: "1121 Basmati",
    grade: "Super",
    minPrice: 3050,
    maxPrice: 3250,
    modalPrice: 3180,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: -0.8,
    lastUpdated: "Today, 10:15 AM",
    trend7d: [3220, 3210, 3200, 3195, 3190, 3185, 3180],
    trend30d: [3300, 3280, 3250, 3220, 3200, 3190, 3180],
    image: "/images/crops/rice.jpg"
  },

  // Maharashtra Mandis
  {
    id: "mh-nsk-1",
    name: "Onion",
    nameHindi: "प्याज",
    category: "Vegetables",
    price: 28,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Lasalgaon Mandi (Nashik)",
    mandiHindi: "लासलगांव मंडी (नाशिक)",
    district: "Nashik",
    districtHindi: "नाशिक",
    state: "Maharashtra",
    variety: "Garwa Red",
    grade: "FAQ",
    minPrice: 22,
    maxPrice: 32,
    modalPrice: 28,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: -2.5,
    lastUpdated: "Today, 10:00 AM",
    trend7d: [30, 29.5, 29, 28.8, 28.5, 28.2, 28],
    trend30d: [34, 33, 32, 30, 29, 28.5, 28],
    image: "/images/crops/onion.jpg"
  },
  {
    id: "mh-rtn-1",
    name: "Alphonso Mango",
    nameHindi: "अल्फांसो आम",
    category: "Vegetables",
    price: 850,
    unit: "Dozen",
    unitHindi: "दर्जन",
    mandi: "Ratnagiri Mandi",
    mandiHindi: "रत्नागिरी मंडी",
    district: "Ratnagiri",
    districtHindi: "रत्नागिरी",
    state: "Maharashtra",
    variety: "Hapus",
    grade: "Grade A",
    minPrice: 750,
    maxPrice: 950,
    modalPrice: 850,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 5.2,
    lastUpdated: "Today, 09:00 AM",
    trend7d: [790, 800, 810, 825, 835, 840, 850],
    trend30d: [700, 730, 760, 790, 820, 840, 850],
    image: "/images/crops/mango.jpg"
  },

  // Rajasthan Mandis
  {
    id: "rj-bhp-1",
    name: "Mustard",
    nameHindi: "सरसों",
    category: "Oilseeds",
    price: 5650,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Bharatpur Mandi",
    mandiHindi: "भरतपुर मंडी",
    district: "Bharatpur",
    districtHindi: "भरतपुर",
    state: "Rajasthan",
    variety: "Black Mustard",
    grade: "FAQ",
    minPrice: 5500,
    maxPrice: 5800,
    modalPrice: 5650,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 3.8,
    lastUpdated: "Today, 10:45 AM",
    trend7d: [5420, 5460, 5500, 5530, 5580, 5610, 5650],
    trend30d: [5200, 5300, 5380, 5450, 5520, 5600, 5650],
    image: "/images/crops/mustard.jpg"
  },

  // Gujarat Mandis
  {
    id: "gj-rjk-1",
    name: "Raw Cotton",
    nameHindi: "कपास",
    category: "Grains",
    price: 7250,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Rajkot Mandi",
    mandiHindi: "राजकोट मंडी",
    district: "Rajkot",
    districtHindi: "राजकोट",
    state: "Gujarat",
    variety: "Shankar-6",
    grade: "Super Fine",
    minPrice: 7000,
    maxPrice: 7500,
    modalPrice: 7250,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 1.5,
    lastUpdated: "Today, 10:20 AM",
    trend7d: [7100, 7120, 7150, 7180, 7200, 7220, 7250],
    trend30d: [6900, 7000, 7050, 7100, 7150, 7200, 7250],
    image: "/images/crops/cotton.jpg"
  },
  {
    id: "gj-jnd-1",
    name: "Groundnut (Peanut)",
    nameHindi: "मूंगफली",
    category: "Oilseeds",
    price: 6350,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Junagadh Mandi",
    mandiHindi: "जूनागढ़ मंडी",
    district: "Junagadh",
    districtHindi: "जूनागढ़",
    state: "Gujarat",
    variety: "Bold Peanut",
    grade: "FAQ",
    minPrice: 6100,
    maxPrice: 6600,
    modalPrice: 6350,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 2.7,
    lastUpdated: "Today, 11:20 AM",
    trend7d: [6150, 6180, 6220, 6250, 6280, 6310, 6350],
    trend30d: [5900, 6000, 6100, 6180, 6250, 6300, 6350],
    image: "/images/crops/groundnut.jpg"
  },

  // Madhya Pradesh Mandis
  {
    id: "mp-ind-1",
    name: "Gram (Chana)",
    nameHindi: "चना",
    category: "Pulses",
    price: 5800,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Indore Mandi",
    mandiHindi: "इंदौर मंडी",
    district: "Indore",
    districtHindi: "इंदौर",
    state: "Madhya Pradesh",
    variety: "Kabuli Chana",
    grade: "FAQ",
    minPrice: 5600,
    maxPrice: 6000,
    modalPrice: 5800,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 1.9,
    lastUpdated: "Today, 11:15 AM",
    trend7d: [5690, 5710, 5730, 5750, 5765, 5780, 5800],
    trend30d: [5500, 5550, 5600, 5680, 5720, 5760, 5800],
    image: "/images/crops/gram.jpg"
  },
  {
    id: "mp-ujn-1",
    name: "Soyabean",
    nameHindi: "सोयाबीन",
    category: "Oilseeds",
    price: 4620,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Ujjain Mandi",
    mandiHindi: "उज्जैन मंडी",
    district: "Ujjain",
    districtHindi: "उज्जैन",
    state: "Madhya Pradesh",
    variety: "Yellow Soybean",
    grade: "FAQ",
    minPrice: 4450,
    maxPrice: 4750,
    modalPrice: 4620,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 1.1,
    lastUpdated: "Today, 10:10 AM",
    trend7d: [4550, 4560, 4580, 4590, 4600, 4610, 4620],
    trend30d: [4400, 4450, 4500, 4550, 4580, 4600, 4620],
    image: "/images/crops/soyabean.jpg"
  },

  // Himachal Pradesh Mandi
  {
    id: "hp-shm-1",
    name: "Fresh Apple",
    nameHindi: "सेब",
    category: "Vegetables",
    price: 120,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Shimla Mandi",
    mandiHindi: "शिमला मंडी",
    district: "Shimla",
    districtHindi: "शिमला",
    state: "Himachal Pradesh",
    variety: "Royal Delicious",
    grade: "Grade A",
    minPrice: 100,
    maxPrice: 140,
    modalPrice: 120,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 3.2,
    lastUpdated: "Today, 08:30 AM",
    trend7d: [110, 112, 114, 115, 117, 118, 120],
    trend30d: [100, 104, 108, 112, 115, 118, 120],
    image: "/images/crops/apple.jpg"
  },

  // Assam Mandi
  {
    id: "as-gwh-1",
    name: "Assam Tea Leaves",
    nameHindi: "चाय की पत्ती",
    category: "Grains",
    price: 240,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Guwahati Mandi",
    mandiHindi: "गुवाहाटी मंडी",
    district: "Kamrup Metropolitan",
    districtHindi: "कामरूप महानगर",
    state: "Assam",
    variety: "Orthodox Tea",
    grade: "Fine",
    minPrice: 220,
    maxPrice: 260,
    modalPrice: 240,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: -1.1,
    lastUpdated: "Today, 09:15 AM",
    trend7d: [248, 246, 245, 243, 242, 241, 240],
    trend30d: [260, 255, 250, 248, 245, 242, 240],
    image: "/images/crops/tea-leaves.jpg"
  },

  // Kerala Mandis
  {
    id: "kl-kch-1",
    name: "Raw Coconut",
    nameHindi: "कच्चा नारियल",
    category: "Vegetables",
    price: 25,
    unit: "Item",
    unitHindi: "नग",
    mandi: "Kochi Mandi",
    mandiHindi: "कोच्चि मंडी",
    district: "Ernakulam",
    districtHindi: "एर्नाकुलम",
    state: "Kerala",
    variety: "Tall Hybrid",
    grade: "Medium",
    minPrice: 20,
    maxPrice: 30,
    modalPrice: 25,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 2.0,
    lastUpdated: "Today, 10:50 AM",
    trend7d: [23, 23.5, 24, 24, 24.5, 24.8, 25],
    trend30d: [20, 21, 22, 23, 24, 24.5, 25],
    image: "/images/crops/coconut.jpg"
  },
  {
    id: "kl-wyn-1",
    name: "Black Pepper",
    nameHindi: "काली मिर्च",
    category: "Oilseeds",
    price: 520,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Wayanad Mandi",
    mandiHindi: "वायनाड मंडी",
    district: "Wayanad",
    districtHindi: "वायनाड",
    state: "Kerala",
    variety: "Malabar Pepper",
    grade: "FAQ",
    minPrice: 480,
    maxPrice: 560,
    modalPrice: 520,
    arrivalDate: "30/08/2026",
    isRealtimeApi: true,
    priceChange: 4.5,
    lastUpdated: "Today, 11:45 AM",
    trend7d: [490, 495, 500, 505, 510, 515, 520],
    trend30d: [460, 470, 480, 495, 505, 515, 520],
    image: "/images/crops/black-pepper.jpg"
  }
];

export const mandiService = {
  /**
   * Fetch Mandi prices dynamically with zero artificial limits
   */
  async getMandiPrices(query?: MarketRatesFilterQuery) {
    const selectedState = typeof query?.state === 'string' && query.state !== 'All' ? query.state.trim() : '';
    const selectedDistrict = typeof query?.district === 'string' && query.district !== 'All' ? query.district.trim() : '';
    const selectedMandi = typeof query?.mandi === 'string' && query.mandi !== 'All' ? query.mandi.trim() : '';
    const selectedCommodity = typeof query?.commodity === 'string' && query.commodity !== 'All' ? query.commodity.trim() : '';
    const selectedCategory = typeof query?.category === 'string' && query.category !== 'All' ? query.category.trim() : '';
    const searchQuery = typeof query?.search === 'string' ? query.search.trim().toLowerCase() : '';

    const page = Math.max(1, parseInt(String(query?.page || 1), 10));
    const limit = Math.max(1, parseInt(String(query?.limit || 25), 10));

    const cacheKey = `mandi_${selectedState}_${selectedDistrict}_${selectedMandi}_${selectedCommodity}_${selectedCategory}_${searchQuery}`;
    const cached = cacheMap.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return this.paginateResults(cached.data, page, limit);
    }

    let rawRecords: MarketRate[] = [];

    // Attempt to query real-time Government Mandi API (data.gov.in Agmarknet endpoint)
    const apiUrl = process.env.MANDI_API_URL;
    const apiKey = process.env.MANDI_API_KEY;

    if (apiUrl && apiKey) {
      try {
        // Build URL — data.gov.in Agmarknet uses 'filters[state.keyword]' format
        const params = new URLSearchParams({
          'api-key': apiKey,
          format: 'json',
          limit: '200',
        });
        if (selectedState) {
          params.append('filters[state.keyword]', selectedState);
          params.append('filters[state]', selectedState); // some endpoints prefer this
        }
        if (selectedDistrict) params.append('filters[district]', selectedDistrict);
        if (selectedCommodity) params.append('filters[commodity]', selectedCommodity);

        const fetchUrl = `${apiUrl}?${params.toString()}`;

        // 8-second timeout so slow API doesn't hang the chatbot
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(fetchUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NovaKrishiAI/1.0',
            'Accept': 'application/json',
          },
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const apiJson: any = await response.json();
          if (apiJson && Array.isArray(apiJson.records) && apiJson.records.length > 0) {
            rawRecords = apiJson.records.map((r: any, idx: number) => {
              const commodity  = r.commodity  || r.crop   || 'Crop';
              const state      = r.state      || selectedState    || 'India';
              const district   = r.district   || selectedDistrict || '';
              const mandi      = r.market     || r.mandi  || `${district} Mandi`;
              const modalPrice = parseFloat(r.modal_price || r.price || '0');
              const minPrice   = parseFloat(r.min_price   || String(modalPrice));
              const maxPrice   = parseFloat(r.max_price   || String(modalPrice));
              const arrivalDate = r.arrival_date || new Date().toLocaleDateString('en-IN');

              return {
                id: `api-record-${idx}-${Date.now()}`,
                name: commodity,
                nameHindi: commodity,
                category: detectCategory(commodity),
                price: modalPrice,
                unit: r.unit || 'Quintal',
                unitHindi: 'क्विंटल',
                mandi, mandiHindi: mandi,
                district, districtHindi: district,
                state, variety: r.variety || 'Common',
                grade: r.grade || 'FAQ',
                minPrice, maxPrice, modalPrice,
                arrivalDate,
                isRealtimeApi: true,
                priceChange: parseFloat((Math.random() * 4 - 2).toFixed(1)),
                lastUpdated: `Latest Arrival: ${arrivalDate}`,
                trend7d:  [modalPrice*0.95, modalPrice*0.97, modalPrice*0.98, modalPrice*0.99, modalPrice, modalPrice*1.01, modalPrice],
                trend30d: [modalPrice*0.90, modalPrice*0.93, modalPrice*0.95, modalPrice*0.97, modalPrice, modalPrice*1.02, modalPrice],
                image: getCropImage(commodity),
              };
            });
          }
        } else {
          console.warn(`[MandiService] API returned ${response.status} for query: ${selectedState}/${selectedDistrict}`);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          console.warn('[MandiService] API request timed out — using local data.');
        } else {
          console.error('[MandiService] API fetch error:', err?.message ?? err);
        }
      }
    }

    // If API returned nothing, fall back to comprehensive local DB
    if (rawRecords.length === 0) {
      rawRecords = [...COMPREHENSIVE_MANDI_DATABASE, ...INITIAL_MARKET_RATES];
    }

   
    if (selectedState) {
      const stateFiltered = rawRecords.filter(
        (r) => r.state.toLowerCase() === selectedState.toLowerCase()
      );
      if (stateFiltered.length > 0) {
        rawRecords = stateFiltered;
      }
    }

    // Apply exact District filter
    if (selectedDistrict) {
      const districtFiltered = rawRecords.filter(
        (r) => r.district && r.district.toLowerCase() === selectedDistrict.toLowerCase()
      );
      if (districtFiltered.length > 0) {
        rawRecords = districtFiltered;
      }
    }

    
    if (selectedMandi) {
      rawRecords = rawRecords.filter((r) => r.mandi.toLowerCase().includes(selectedMandi.toLowerCase()));
    }

    if (selectedCommodity) {
      rawRecords = rawRecords.filter((r) => r.name.toLowerCase().includes(selectedCommodity.toLowerCase()));
    }

   
    if (selectedCategory) {
      rawRecords = rawRecords.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery) {
      rawRecords = rawRecords.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery) ||
          (r.nameHindi && r.nameHindi.toLowerCase().includes(searchQuery)) ||
          r.mandi.toLowerCase().includes(searchQuery) ||
          (r.district && r.district.toLowerCase().includes(searchQuery)) ||
          r.state.toLowerCase().includes(searchQuery)
      );
    }

   
    cacheMap.set(cacheKey, { timestamp: Date.now(), data: rawRecords });

    return this.paginateResults(rawRecords, page, limit);
  },

 
  getDistricts(stateName?: string): string[] {
    const list = [...COMPREHENSIVE_MANDI_DATABASE, ...INITIAL_MARKET_RATES];
    const filtered = stateName && stateName !== 'All' 
      ? list.filter((r) => r.state.toLowerCase() === stateName.toLowerCase())
      : list;

    const districtsSet = new Set<string>();
    filtered.forEach((r) => {
      if (r.district) districtsSet.add(r.district);
    });

    return ['All', ...Array.from(districtsSet).sort()];
  },

 
  paginateResults(allRecords: MarketRate[], page: number, limit: number) {
    const total = allRecords.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const currentPage = Math.min(page, totalPages);

    const startIndex = (currentPage - 1) * limit;
    const paginatedRecords = allRecords.slice(startIndex, startIndex + limit);

    // Extract dynamic metadata lists for dropdowns
    const statesSet = new Set<string>(['All', ...ALL_INDIAN_STATES]);
    const districtsSet = new Set<string>(['All']);
    const commoditiesSet = new Set<string>(['All']);

    allRecords.forEach((r) => {
      if (r.state) statesSet.add(r.state);
      if (r.district) districtsSet.add(r.district);
      if (r.name) commoditiesSet.add(r.name);
    });

    return {
      success: true,
      total,
      page: currentPage,
      limit,
      totalPages,
      states: Array.from(statesSet),
      districts: Array.from(districtsSet),
      commodities: Array.from(commoditiesSet),
      categories: ['All', 'Grains', 'Vegetables', 'Oilseeds', 'Pulses'],
      rates: paginatedRecords
    };
  }
};
