// backend/src/data/faqResponses.ts
// Static bilingual FAQ knowledge base for KrishiBot.

export interface FaqEntry {
  id: string;
  keywords: string[]; // matched against lowercased user message
  reply: { en: string; hi: string };
}

export const FAQ_RESPONSES: FaqEntry[] = [
  {
    id: "greeting-fallback",
    keywords: ["hi", "hello", "namaste", "hey", "helo", "namaskar"],
    reply: {
      en: "Namaste! I'm KrishiBot 🌾 — ask me about mandi prices, crop diseases, weather risk, or alerts near you.",
      hi: "नमस्ते! मैं कृषि बॉट हूँ 🌾 — मुझसे मंडी भाव, फसल रोग, मौसम जोखिम या आस-पास के अलर्ट के बारे में पूछें।",
    },
  },
  {
    id: "thanks-fallback",
    keywords: ["thank you", "thanks", "dhanyavad", "shukriya", "thnks"],
    reply: {
      en: "You're welcome! Let me know if you have more farming questions. 🌱",
      hi: "आपका स्वागत है! अगर और कोई सवाल हो तो बताएं। 🌱",
    },
  },
  {
    id: "scan-howto",
    keywords: ["how to scan", "scan kaise", "disease scan", "photo upload", "leaf photo", "patta"],
    reply: {
      en: "To scan your crop: open the Scan tab → take or upload a clear photo of the affected leaf → AI will detect the disease and suggest treatment in both Hindi and English.",
      hi: "फसल स्कैन करने के लिए: Scan टैब खोलें → प्रभावित पत्ते की साफ़ फोटो लें या अपलोड करें → AI बीमारी पहचान कर दोनों भाषाओं में इलाज बताएगा।",
    },
  },
  {
    id: "early-blight",
    keywords: ["early blight", "yellow spots tomato", "tamatar pila", "ageti jhulsa"],
    reply: {
      en: "Early Blight shows as brown/yellow spots with concentric rings on lower leaves. Remove infected leaves, avoid overhead watering, and apply Mancozeb 75% WP or copper-based fungicide every 7–10 days.",
      hi: "Early Blight में निचली पत्तियों पर भूरे-पीले घेरेदार धब्बे दिखते हैं। संक्रमित पत्तियाँ हटाएं, ऊपर से पानी न दें, और हर 7-10 दिन में मैनकोज़ेब 75% डब्लूपी का छिड़काव करें।",
    },
  },
  {
    id: "wheat-rust",
    keywords: ["wheat rust", "pila ratua", "yellow rust", "gehu rust"],
    reply: {
      en: "Yellow Rust in wheat appears as yellow stripes on leaves. Apply Propiconazole 25% EC at first sight of yellow spots. Avoid excess nitrogen fertilizer.",
      hi: "गेहूं में पीला रतुआ पत्तियों पर पीली धारियों के रूप में दिखता है। पीले धब्बे दिखते ही प्रोपिकोनाज़ोल 25% ईसी का छिड़काव करें। अधिक नाइट्रोजन खाद से बचें।",
    },
  },
  {
    id: "mandi-howto",
    keywords: ["mandi rates kahan", "where to check mandi", "mandi rates kaise dekhe", "bhav kahan"],
    reply: {
      en: "Go to the Mandi Prices section, select your state, district, and commodity to see today's rate along with a 7-day price trend chart.",
      hi: "Mandi Prices सेक्शन में जाएं, अपना राज्य, जिला और फसल चुनें — आज का भाव और 7-दिन का ट्रेंड चार्ट दिख जाएगा।",
    },
  },
  {
    id: "marketplace-howto",
    keywords: ["marketplace kaise", "how to sell", "list produce", "upaj bechni", "fasal bechni"],
    reply: {
      en: "In the Marketplace tab → tap 'List Produce' → add crop name, quantity, price and photos. Buyers can then place orders directly with you.",
      hi: "Marketplace टैब में 'List Produce' दबाएं → फसल का नाम, मात्रा, भाव और फोटो जोड़ें। खरीदार सीधे आपसे ऑर्डर कर सकेंगे।",
    },
  },
  {
    id: "price-alert-setup",
    keywords: ["price alert", "bhav alert", "notify price", "alert set kaise"],
    reply: {
      en: "Set a Price Alert from any commodity card in the Mandi section — you'll be notified when the price rises or drops more than 15% from the current rate.",
      hi: "Mandi सेक्शन में किसी भी फसल के कार्ड से Price Alert सेट करें — जब भाव 15% से ज़्यादा बढ़े या घटे तो सूचना मिलेगी।",
    },
  },
  {
    id: "pm-kisan",
    keywords: ["pm kisan", "pm kisan yojana", "pm kisan scheme", "pmkisan"],
    reply: {
      en: "PM-KISAN provides ₹6,000/year to eligible farmer families in 3 installments of ₹2,000 each. Apply at pmkisan.gov.in using your Aadhaar and land records.",
      hi: "PM-KISAN योजना में पात्र किसान परिवारों को साल में ₹6,000, 3 किस्तों में मिलते हैं। pmkisan.gov.in पर आधार और भूमि रिकॉर्ड से आवेदन करें।",
    },
  },
  {
    id: "kisan-credit-card",
    keywords: ["kisan credit card", "kcc", "credit card kisan", "loan kisan"],
    reply: {
      en: "Kisan Credit Card (KCC) gives farmers short-term loans for crop needs at subsidized interest rates. Apply at any nationalized or cooperative bank with land documents.",
      hi: "Kisan Credit Card (KCC) किसानों को खेती के लिए सस्ती ब्याज दर पर अल्पकालिक ऋण देता है। किसी भी राष्ट्रीयकृत या सहकारी बैंक में भूमि दस्तावेज़ों के साथ आवेदन करें।",
    },
  },
  {
    id: "fertilizer-general",
    keywords: ["fertilizer", "khaad", "which fertilizer", "urea", "dap", "npk"],
    reply: {
      en: "Fertilizer needs depend on soil test results. Generally, use NPK at sowing, top-dress with urea during vegetative growth. Get a soil test for precise crop-specific recommendations.",
      hi: "खाद की ज़रूरत मिट्टी जांच पर निर्भर है। सामान्यतः बुवाई पर NPK और वानस्पतिक वृद्धि में यूरिया डालें। सटीक सलाह के लिए मिट्टी जांच कराएं।",
    },
  },
  {
    id: "pesticide-general",
    keywords: ["pesticide", "keetnashak", "which pesticide", "spray", "keeda"],
    reply: {
      en: "Use the Disease Scanner to identify the exact pest/disease first — it will suggest a targeted treatment. Avoid overusing broad-spectrum pesticides to protect soil health.",
      hi: "पहले Disease Scanner से सही कीट/बीमारी पहचानें — यह सटीक इलाज बताएगा। मिट्टी की सेहत बचाने के लिए सामान्य कीटनाशकों का अत्यधिक उपयोग न करें।",
    },
  },
  {
    id: "sowing-wheat",
    keywords: ["wheat sowing", "gehu bonai", "when to sow wheat", "gehu kab boen"],
    reply: {
      en: "Wheat is sown mid-October to end of November (Rabi season) in North India. Harvesting happens around March–April.",
      hi: "उत्तर भारत में गेहूं मध्य अक्टूबर से नवंबर अंत (रबी सीजन) में बोया जाता है और मार्च-अप्रैल में कटाई होती है।",
    },
  },
  {
    id: "sowing-paddy",
    keywords: ["paddy sowing", "dhan bonai", "rice sowing", "dhan kab boen"],
    reply: {
      en: "Paddy (rice) is sown in June–July at the start of Kharif/monsoon season, with harvesting in October–November.",
      hi: "धान की बुवाई जून-जुलाई में खरीफ/मानसून सीजन में होती है, और कटाई अक्टूबर-नवंबर में।",
    },
  },
  {
    id: "profile-update",
    keywords: ["update profile", "profile edit", "farmer profile change", "profile kaise badle"],
    reply: {
      en: "Go to your Profile icon (top corner) → Edit Profile to update your name, village, district, state, or primary crops.",
      hi: "प्रोफाइल आइकन → Edit Profile में जाकर नाम, गाँव, जिला, राज्य या मुख्य फसलें बदलें।",
    },
  },
  {
    id: "delivery-partner",
    keywords: ["delivery partner", "delivery join", "delivery agent", "delivery kaise bane"],
    reply: {
      en: "To become a Delivery Partner, look for 'Join as Delivery Partner' in the app and submit your vehicle and ID details for verification.",
      hi: "Delivery Partner बनने के लिए ऐप में 'Join as Delivery Partner' ढूंढें और वाहन व पहचान विवरण जमा करें।",
    },
  },
  {
    id: "bulk-buyer",
    keywords: ["bulk buyer", "bulk order", "large quantity", "thok kharidari"],
    reply: {
      en: "Bulk Buyers can register from Marketplace → 'Register as Bulk Buyer' to place large-quantity orders directly with multiple farmers.",
      hi: "Bulk Buyer बनने के लिए Marketplace → 'Register as Bulk Buyer' से रजिस्टर करें और कई किसानों से बड़ी मात्रा में ऑर्डर करें।",
    },
  },
  {
    id: "language-change",
    keywords: ["change language", "bhasha badle", "hindi english", "language switch"],
    reply: {
      en: "Switch the app language anytime using the EN/हि toggle at the top of the screen or in this chat window.",
      hi: "स्क्रीन के ऊपर या इस चैट में EN/हि टॉगल से कभी भी भाषा बदलें।",
    },
  },
  {
    id: "weather-risk-explain",
    keywords: ["weather risk meaning", "risk index", "what is weather risk", "mausam risk kya"],
    reply: {
      en: "The Weather Risk Index combines temperature, humidity, and rainfall for your district to estimate crop disease outbreak risk. Higher humidity = higher risk.",
      hi: "Weather Risk Index आपके जिले के तापमान, नमी और बारिश से फसल रोग के खतरे का अनुमान देता है। अधिक नमी = अधिक खतरा।",
    },
  },
  {
    id: "price-forecast-explain",
    keywords: ["price forecast", "bhav prediction", "price predict", "bhav badhega"],
    reply: {
      en: "Price Forecast uses machine learning on historical mandi data to estimate whether a commodity's price will rise or fall. Select your crop and district in the Mandi section.",
      hi: "Price Forecast ऐतिहासिक मंडी डेटा पर ML से अनुमान लगाता है कि भाव बढ़ेगा या घटेगा। Mandi सेक्शन में फसल और जिला चुनें।",
    },
  },
  {
    id: "account-support",
    keywords: ["contact support", "help team", "customer care", "problem", "issue"],
    reply: {
      en: "For account or technical issues, use Help & Support in Settings, or email us through the contact form in the app footer.",
      hi: "खाते या तकनीकी समस्या के लिए Settings में Help & Support, या ऐप के नीचे दिए contact फ़ॉर्म से ईमेल करें।",
    },
  },
];

/**
 * Returns the best matching FAQ entry for a message, or null if none match.
 */
export function matchFaq(message: string): FaqEntry | null {
  const normalized = message.toLowerCase();
  for (const entry of FAQ_RESPONSES) {
    if (entry.keywords.some((kw) => normalized.includes(kw))) {
      return entry;
    }
  }
  return null;
}
