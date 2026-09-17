export interface MarketRate {
  id: string;
  name: string;
  nameHindi: string;
  category: string;
  price: number;
  unit: string;
  unitHindi: string;
  mandi: string;
  mandiHindi: string;
  state: string;
  priceChange: number;
  lastUpdated: string;
  trend7d: number[];
  trend30d: number[];
  image: string;
}

export interface DiseaseInfo {
  id: string;
  name: string;
  nameHindi: string;
  crop: string;
  cropHindi: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
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
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  distanceKm: number;
  timestamp: string;
  lat: number;
  lng: number;
  status: 'verified' | 'suspected' | 'contained';
}

export interface WeatherData {
  temp: number;
  condition: string;
  conditionHindi: string;
  humidity: number;
  diseaseRiskIndex: 'Low' | 'Moderate' | 'High' | 'Critical';
  riskMessage: string;
  riskMessageHindi: string;
}

export const ALL_INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export const INITIAL_MARKET_RATES: MarketRate[] = [
  {
    id: "mkt-wheat",
    name: "Wheat",
    nameHindi: "गेहूं",
    category: "Grains",
    price: 2450,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Rohtak Mandi",
    mandiHindi: "रोहतक मंडी",
    state: "Haryana",
    priceChange: 2.4,
    lastUpdated: "Today, 10:30 AM",
    trend7d: [2380, 2400, 2410, 2425, 2430, 2440, 2450],
    trend30d: [2300, 2320, 2350, 2380, 2400, 2420, 2450],
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-rice",
    name: "Basmati Rice",
    nameHindi: "बासमती धान",
    category: "Grains",
    price: 3180,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Karnal Mandi",
    mandiHindi: "करनाल मंडी",
    state: "Haryana",
    priceChange: -0.8,
    lastUpdated: "Today, 10:15 AM",
    trend7d: [3220, 3210, 3200, 3195, 3190, 3185, 3180],
    trend30d: [3300, 3280, 3250, 3220, 3200, 3190, 3180],
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-tomato",
    name: "Tomato",
    nameHindi: "टमाटर",
    category: "Vegetables",
    price: 32,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Azadpur Mandi",
    mandiHindi: "आज़ादपुर मंडी",
    state: "Delhi",
    priceChange: 4.1,
    lastUpdated: "Today, 09:45 AM",
    trend7d: [28, 29, 29, 30, 31, 31, 32],
    trend30d: [22, 24, 25, 27, 29, 30, 32],
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-potato",
    name: "Potato",
    nameHindi: "आलू",
    category: "Vegetables",
    price: 18,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Agra Mandi",
    mandiHindi: "आगरा मंडी",
    state: "Uttar Pradesh",
    priceChange: 1.2,
    lastUpdated: "Today, 11:00 AM",
    trend7d: [17, 17.2, 17.5, 17.5, 17.8, 17.9, 18],
    trend30d: [15, 15.5, 16, 16.5, 17, 17.5, 18],
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-onion",
    name: "Onion",
    nameHindi: "प्याज",
    category: "Vegetables",
    price: 28,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Nashik Mandi",
    mandiHindi: "नाशिक मंडी",
    state: "Maharashtra",
    priceChange: -2.5,
    lastUpdated: "Today, 10:00 AM",
    trend7d: [30, 29.5, 29, 28.8, 28.5, 28.2, 28],
    trend30d: [34, 33, 32, 30, 29, 28.5, 28],
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-mustard",
    name: "Mustard",
    nameHindi: "सरसों",
    category: "Oilseeds",
    price: 5650,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Bharatpur Mandi",
    mandiHindi: "भरतपुर मंडी",
    state: "Rajasthan",
    priceChange: 3.8,
    lastUpdated: "Today, 10:45 AM",
    trend7d: [5420, 5460, 5500, 5530, 5580, 5610, 5650],
    trend30d: [5200, 5300, 5380, 5450, 5520, 5600, 5650],
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-maize",
    name: "Maize (Corn)",
    nameHindi: "मक्का",
    category: "Grains",
    price: 2120,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Ludhiana Mandi",
    mandiHindi: "लुधियाना मंडी",
    state: "Punjab",
    priceChange: 0.5,
    lastUpdated: "Today, 09:30 AM",
    trend7d: [2100, 2105, 2110, 2110, 2115, 2118, 2120],
    trend30d: [2050, 2060, 2080, 2090, 2100, 2110, 2120],
    image: "https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-chana",
    name: "Gram (Chana)",
    nameHindi: "चना",
    category: "Pulses",
    price: 5800,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Indore Mandi",
    mandiHindi: "इंदौर मंडी",
    state: "Madhya Pradesh",
    priceChange: 1.9,
    lastUpdated: "Today, 11:15 AM",
    trend7d: [5690, 5710, 5730, 5750, 5765, 5780, 5800],
    trend30d: [5500, 5550, 5600, 5680, 5720, 5760, 5800],
    image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-cotton",
    name: "Raw Cotton",
    nameHindi: "कपास",
    category: "Grains",
    price: 7250,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Rajkot Mandi",
    mandiHindi: "राजकोट मंडी",
    state: "Gujarat",
    priceChange: 1.5,
    lastUpdated: "Today, 10:20 AM",
    trend7d: [7100, 7120, 7150, 7180, 7200, 7220, 7250],
    trend30d: [6900, 7000, 7050, 7100, 7150, 7200, 7250],
    image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-sugarcane",
    name: "Sugarcane",
    nameHindi: "गन्ना",
    category: "Grains",
    price: 360,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Muzaffarnagar Mandi",
    mandiHindi: "मुज़फ़्फ़रनगर मंडी",
    state: "Uttar Pradesh",
    priceChange: 0.8,
    lastUpdated: "Today, 11:30 AM",
    trend7d: [355, 356, 357, 358, 359, 360, 360],
    trend30d: [345, 348, 350, 352, 355, 358, 360],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-apple",
    name: "Fresh Apple",
    nameHindi: "सेब",
    category: "Vegetables",
    price: 120,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Shimla Mandi",
    mandiHindi: "शिमला मंडी",
    state: "Himachal Pradesh",
    priceChange: 3.2,
    lastUpdated: "Today, 08:50 AM",
    trend7d: [112, 114, 115, 116, 118, 119, 120],
    trend30d: [100, 105, 108, 112, 115, 118, 120],
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-tea",
    name: "Assam Tea Leaves",
    nameHindi: "असम चाय की पत्ती",
    category: "Grains",
    price: 280,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Guwahati Mandi",
    mandiHindi: "गुवाहाटी मंडी",
    state: "Assam",
    priceChange: 2.1,
    lastUpdated: "Today, 09:10 AM",
    trend7d: [270, 272, 274, 275, 276, 278, 280],
    trend30d: [250, 255, 260, 265, 270, 275, 280],
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-coconut",
    name: "Raw Coconut",
    nameHindi: "कच्चा नारियल",
    category: "Oilseeds",
    price: 45,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Kochi Mandi",
    mandiHindi: "कोच्चि मंडी",
    state: "Kerala",
    priceChange: -1.2,
    lastUpdated: "Today, 10:05 AM",
    trend7d: [47, 46.5, 46, 45.8, 45.5, 45.2, 45],
    trend30d: [50, 49, 48, 47, 46, 45.5, 45],
    image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-spices",
    name: "Black Pepper",
    nameHindi: "काली मिर्च",
    category: "Oilseeds",
    price: 610,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Wayanad Mandi",
    mandiHindi: "वायनाड मंडी",
    state: "Kerala",
    priceChange: 4.5,
    lastUpdated: "Today, 09:20 AM",
    trend7d: [580, 585, 590, 595, 600, 605, 610],
    trend30d: [550, 560, 570, 580, 590, 600, 610],
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-paddy-wb",
    name: "Paddy Rice (धान)",
    nameHindi: "अमन धान",
    category: "Grains",
    price: 2280,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Burdwan Mandi",
    mandiHindi: "वर्धमान मंडी",
    state: "West Bengal",
    priceChange: 1.8,
    lastUpdated: "Today, 10:40 AM",
    trend7d: [2220, 2235, 2240, 2250, 2260, 2270, 2280],
    trend30d: [2150, 2180, 2200, 2220, 2240, 2260, 2280],
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-soyabean",
    name: "Soyabean",
    nameHindi: "सोयाबीन",
    category: "Oilseeds",
    price: 4850,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Ujjain Mandi",
    mandiHindi: "उज्जैन मंडी",
    state: "Madhya Pradesh",
    priceChange: 2.2,
    lastUpdated: "Today, 11:25 AM",
    trend7d: [4720, 4750, 4780, 4800, 4820, 4840, 4850],
    trend30d: [4550, 4600, 4680, 4720, 4780, 4820, 4850],
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-groundnut",
    name: "Groundnut",
    nameHindi: "मूंगफली",
    category: "Oilseeds",
    price: 6400,
    unit: "Quintal",
    unitHindi: "क्विंटल",
    mandi: "Junagadh Mandi",
    mandiHindi: "जूनागढ़ मंडी",
    state: "Gujarat",
    priceChange: 3.1,
    lastUpdated: "Today, 10:50 AM",
    trend7d: [6200, 6240, 6280, 6310, 6350, 6380, 6400],
    trend30d: [5950, 6050, 6120, 6200, 6280, 6350, 6400],
    image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mkt-mango",
    name: "Alphonso / Banganapalle Mango",
    nameHindi: "आम",
    category: "Vegetables",
    price: 95,
    unit: "Kg",
    unitHindi: "किग्रा",
    mandi: "Vijayawada Mandi",
    mandiHindi: "विजयवाड़ा मंडी",
    state: "Andhra Pradesh",
    priceChange: 5.0,
    lastUpdated: "Today, 09:55 AM",
    trend7d: [88, 89, 91, 92, 93, 94, 95],
    trend30d: [75, 80, 83, 86, 90, 92, 95],
    image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80"
  }
];

export const INITIAL_WEATHER: WeatherData = {
  temp: 31,
  condition: "Humid & Overcast",
  conditionHindi: "नम एवं बादलों भरा",
  humidity: 88,
  diseaseRiskIndex: "High",
  riskMessage: "High moisture level creates ideal conditions for Late Blight germination.",
  riskMessageHindi: "उच्च नमी के कारण फंगल लीफ ब्लाइट फैलने का अत्यधिक जोखिम है।"
};
