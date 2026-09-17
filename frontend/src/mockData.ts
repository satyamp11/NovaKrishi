import type { DiseaseInfo, OutbreakCluster, OutbreakReport, WeatherData, CommunityActivity, FarmerProfile } from './types';

// Complete list of 28 Indian States & 8 Union Territories
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

// High-quality crop disease sample photos from reliable CDN
export const CROP_IMAGES = {
  tomatoBlight: "/images/crops/tomato.jpg",
  mangoAnthracnose: "https://upload.wikimedia.org/wikipedia/commons/5/55/Mango_anthracnose_1a.jpg",
  wheatRust: "/images/crops/wheat.jpg",
  healthyWheat: "/images/crops/wheat.jpg",
  potatoBlight: "/images/crops/potato.jpg",
  cottonBacterial: "/images/crops/cotton.jpg",
};

export const INITIAL_FARMER: FarmerProfile = {
  name: "Rajesh Kumar",
  phone: "9876543210",
  village: "Kheri Sadh",
  district: "Rohtak",
  state: "Haryana",
  mainCrops: ["Tomato", "Wheat", "Cotton"],
  locationPermission: true,
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
};

export const INITIAL_WEATHER: WeatherData = {
  temp: 31,
  condition: "Humid & Overcast",
  conditionHindi: "नम एवं बादलों भरा",
  humidity: 88,
  diseaseRiskIndex: "High",
  riskMessage: "High moisture level creates ideal conditions for Late Blight germination.",
  riskMessageHindi: "उच्च नमी के कारण फंगल लीफ ब्लाइट फैलने का अत्यधिक जोखिम है।"
};

export const DISEASE_DATABASE: Record<string, DiseaseInfo> = {
  tomato_blight: {
    id: "tomato_blight",
    name: "Tomato Early Blight",
    nameHindi: "टमाटर अगेती झुलसा रोग",
    crop: "Tomato",
    cropHindi: "टमाटर",
    confidence: 94,
    severity: "High",
    symptoms: [
      "Concentric ring dark brown spots on lower leaves",
      "Yellowing halo around infected leaf tissue",
      "Premature leaf drop and stem lesions"
    ],
    symptomsHindi: [
      "निचली पत्तियों पर गोल भूरे छल्लेदार धब्बे",
      "संक्रमित भाग के चारों ओर पीला घेरा",
      "पत्तियों का असमय गिरना एवं तने पर घाव"
    ],
    organicAction: [
      "Spray 5% Neem leaf extract or Neem oil solution (5ml/L water) every 7 days",
      "Remove and safely burn lower infected leaves to curb spore travel",
      "Apply Trichoderma viride bio-fungicide to root zone"
    ],
    organicActionHindi: [
      "5% नीम की पत्ती का अर्क या नीम तेल (5ml/लीटर) प्रति सप्ताह छिड़कें",
      "संक्रमित निचली पत्तियों को तोड़कर खेत से दूर जला दें",
      "ट्राइकोडर्मा विरिडी जैव-फफूंदनाशी जड़ों में दें"
    ],
    chemicalAction: [
      "Spray Mancozeb 75% WP @ 2g per Liter of water immediately",
      "Follow up with Copper Oxychloride 50% WP @ 3g/L after 10 days"
    ],
    chemicalActionHindi: [
      "मैनकोज़ेब 75% डब्लूपी (2 ग्राम/लीटर पानी) का तुरंत छिड़काव करें",
      "10 दिनों के बाद कॉपर ऑक्सीक्लोराइड 50% डब्लूपी (3 ग्राम/लीटर) छिड़कें"
    ],
    prevention: [
      "Maintain 60cm row spacing for adequate air flow",
      "Avoid overhead sprinkler irrigation late in the evening"
    ],
    preventionHindi: [
      "हवा के संचार के लिए कतारों में 60 सेमी की दूरी रखें",
      "शाम के समय ऊपर से पानी के छिड़काव से बचें"
    ],
    sampleImage: CROP_IMAGES.tomatoBlight
  },
  wheat_rust: {
    id: "wheat_rust",
    name: "Yellow Rust of Wheat",
    nameHindi: "गेहूं का पीला रतुआ (हल्दी रोग)",
    crop: "Wheat",
    cropHindi: "गेहूं",
    confidence: 91,
    severity: "Critical",
    symptoms: [
      "Bright yellow powdery pustules arranged in linear stripes on leaves",
      "Yellow dust rub-off on hands when leaf is touched",
      "Rapid wilting of leaf blades during cool humid conditions"
    ],
    symptomsHindi: [
      "पत्तियों पर पीली पाउडर जैसी धारियां",
      "पत्ती को छूने पर हाथों में पीला पाउडर लगना",
      "ठंडे और नम मौसम में पत्तियों का तेजी से सूखना"
    ],
    organicAction: [
      "Spray fermented sour buttermilk (Lassi) solution (1L in 10L water)",
      "Dust wood ash mixed with sulfur over the crop canopy early morning"
    ],
    organicActionHindi: [
      "खट्टी छाछ/लस्सी का घोल (1 लीटर प्रति 10 लीटर पानी) छिड़कें",
      "सुबह तड़के राख और सल्फर का छिड़काव करें"
    ],
    chemicalAction: [
      "Spray Propiconazole 25% EC (Tilt) @ 1 ml per Liter of water immediately",
      "Repeat spray after 15 days if yellow stripes persist"
    ],
    chemicalActionHindi: [
      "प्रोपिकोनाज़ोल 25% ईसी (टिल-ट) 1 मि.ली. प्रति लीटर पानी का तुरंत छिड़काव करें",
      "यदि रोग बना रहे तो 15 दिन बाद दोबारा छिड़कें"
    ],
    prevention: [
      "Inspect border rows weekly during cold foggy mornings",
      "Alert village group immediately if yellow dust is observed"
    ],
    preventionHindi: [
      "कोहरे वाली सुबह खेत की मेड़ों की साप्ताहिक जांच करें",
      "पीली धूल दिखते ही तुरंत गांव के ग्रुप को सूचित करें"
    ],
    sampleImage: CROP_IMAGES.wheatRust
  },
  healthy_crop: {
    id: "healthy_crop",
    name: "Healthy Wheat Canopy",
    nameHindi: "स्वस्थ गेहूं की फसल",
    crop: "Wheat",
    cropHindi: "गेहूं",
    confidence: 98,
    severity: "Low",
    symptoms: ["No visible pathogens, clean green foliage", "Vigorous stem and uniform leaf coloration"],
    symptomsHindi: ["कोई बीमारी नहीं, हरी-भरी स्वस्थ पत्तियां", "मजबूत तना एवं एकसमान रंग"],
    organicAction: ["Continue standard organic compost application and balanced watering"],
    organicActionHindi: ["नियमित रूप से संतुलित सिंचाई और जैविक खाद देते रहें"],
    chemicalAction: ["No chemical pesticide needed at present stage"],
    chemicalActionHindi: ["वर्तमान में किसी रासायनिक छिड़काव की आवश्यकता नहीं है"],
    prevention: ["Keep farm borders free from wild weeds"],
    preventionHindi: ["खेत की मेड़ों को खरपतवार मुक्त रखें"],
    sampleImage: CROP_IMAGES.healthyWheat
  }
};

export const INITIAL_CLUSTERS: OutbreakCluster[] = [
  {
    id: "cluster-1",
    type: "disease",
    diseaseName: "Tomato Early Blight",
    diseaseHindi: "टमाटर अगेती झुलसा",
    crop: "Tomato",
    cropHindi: "टमाटर",
    centerVillage: "Kheri Sadh",
    lat: 28.8955,
    lng: 76.6066,
    radiusKm: 3.5,
    reportCount: 4,
    severity: "High",
    lastReportTime: "25 mins ago",
    recommendations: [
      "Inspect lower leaves of tomato plants immediately",
      "Apply preventive Mancozeb 75% WP spray if humidity >80%"
    ],
    recommendationsHindi: [
      "तुरंत अपने टमाटर के पौधों की निचली पत्तियों की जांच करें",
      "यदि हवा में नमी >80% है तो मैनकोज़ेब का निरोधात्मक छिड़काव करें"
    ]
  },
  {
    id: "cluster-2",
    type: "disease",
    diseaseName: "Yellow Rust of Wheat",
    diseaseHindi: "गेहूं का पीला रतुआ",
    crop: "Wheat",
    cropHindi: "गेहूं",
    centerVillage: "Sampla",
    lat: 28.7845,
    lng: 76.7725,
    radiusKm: 6.0,
    reportCount: 7,
    severity: "Critical",
    lastReportTime: "1 hour ago",
    recommendations: [
      "Apply Propiconazole spray to wheat crop within 24 hours",
      "Check northern borders of field facing incoming wind"
    ],
    recommendationsHindi: [
      "24 घंटे के भीतर गेहूं की फसल में प्रोपिकोनाज़ोल छिड़कें",
      "हवा की दिशा वाली उत्तरी मेड़ों की विशेष जांच करें"
    ]
  }
];

export const INITIAL_REPORTS: OutbreakReport[] = [
  {
    id: "rep-101",
    farmerName: "Suresh P.",
    village: "Kheri Sadh",
    district: "Rohtak",
    crop: "Tomato",
    diseaseName: "Tomato Early Blight",
    diseaseHindi: "टमाटर अगेती झुलसा",
    severity: "High",
    distanceKm: 1.2,
    timestamp: "25 mins ago",
    lat: 28.8920,
    lng: 76.6010,
    status: "verified"
  },
  {
    id: "rep-102",
    farmerName: "Balwan Singh",
    village: "Kheri Sadh",
    district: "Rohtak",
    crop: "Tomato",
    diseaseName: "Tomato Early Blight",
    diseaseHindi: "टमाटर अगेती झुलसा",
    severity: "High",
    distanceKm: 2.4,
    timestamp: "45 mins ago",
    lat: 28.8980,
    lng: 76.6120,
    status: "verified"
  },
  {
    id: "rep-103",
    farmerName: "Vikram R.",
    village: "Kheri Sadh",
    district: "Rohtak",
    crop: "Tomato",
    diseaseName: "Tomato Early Blight",
    diseaseHindi: "टमाटर अगेती झुलसा",
    severity: "Medium",
    distanceKm: 3.1,
    timestamp: "2 hours ago",
    lat: 28.9010,
    lng: 76.5980,
    status: "verified"
  },
  {
    id: "rep-104",
    farmerName: "Amit Kumar",
    village: "Sampla",
    district: "Rohtak",
    crop: "Wheat",
    diseaseName: "Yellow Rust of Wheat",
    diseaseHindi: "गेहूं का पीला रतुआ",
    severity: "Critical",
    distanceKm: 5.8,
    timestamp: "1 hour ago",
    lat: 28.7845,
    lng: 76.7725,
    status: "verified"
  }
];

export const FARMER_IMAGES = {
  farmerPrimary: "/hero.jpg",
  farmerInspect: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
  farmerGroup: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80",
  cropWheat: "/images/crops/wheat.jpg",
  cropTomato: "https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=800&q=80",
  cropField: "/hero.jpg"
};

export const COMMUNITY_ACTIVITIES: CommunityActivity[] = [
  {
    id: "act-1",
    village: "Kheri Sadh",
    district: "Rohtak",
    crop: "Tomato",
    diseaseName: "Tomato Early Blight",
    timeAgo: "10m ago",
    actionType: "report"
  },
  {
    id: "act-2",
    village: "Sampla",
    district: "Rohtak",
    crop: "Wheat",
    diseaseName: "Yellow Rust",
    timeAgo: "25m ago",
    actionType: "scan"
  },
  {
    id: "act-3",
    village: "Ismaila",
    district: "Rohtak",
    crop: "Cotton",
    diseaseName: "Healthy Crop verified",
    timeAgo: "1h ago",
    actionType: "contained"
  },
  {
    id: "act-4",
    village: "Kansala",
    district: "Rohtak",
    crop: "Potato",
    diseaseName: "Late Blight check",
    timeAgo: "2h ago",
    actionType: "scan"
  }
];

export const MOCK_MARKET_RATES: import('./types').MarketRate[] = [
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
    image: "/images/crops/wheat.jpg"
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
    image: "/images/crops/rice.jpg"
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
    image: "/images/crops/tomato.jpg"
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
    image: "/images/crops/potato.jpg"
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
    image: "/images/crops/onion.jpg"
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
    image: "/images/crops/mustard.jpg"
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
    image: "/images/crops/maize.jpg"
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
    image: "/images/crops/gram.jpg"
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
    image: "/images/crops/cotton.jpg"
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
    image: "/images/crops/sugarcane.jpg"
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
    image: "/images/crops/apple.jpg"
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
    image: "/images/crops/tea-leaves.jpg"
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
    image: "/images/crops/coconut.jpg"
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
    image: "/images/crops/black-pepper.jpg"
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
    image: "/images/crops/rice.jpg"
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
    image: "/images/crops/soyabean.jpg"
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
    image: "/images/crops/groundnut.jpg"
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

