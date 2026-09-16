import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CloudSun, 
  ChevronRight, Camera, FileText, AlertCircle, TrendingUp, User, MapPin,
  CheckCircle2, RefreshCw, Sprout, ArrowRight
} from 'lucide-react';
import type { Language, FarmerProfile, WeatherData, OutbreakCluster, CommunityActivity, RiskLevel } from '../types';
import { apiService, CropScanRecord, CommunityAlertRecord, MarketRate } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

interface HomeDashboardProps {
  language: Language;
  farmer: FarmerProfile;
  weather: WeatherData;
  riskLevel: RiskLevel;
  activeClusters: OutbreakCluster[];
  activities?: CommunityActivity[];
  onNavigateToScan: () => void;
  onNavigateToMap: () => void;
  onNavigateToAlerts: () => void;
  onNavigateToMandi?: () => void;
  onNavigateToProfile?: () => void;
  sunlightMode: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  language,
  farmer,
  weather,
  riskLevel,
  activeClusters,
  onNavigateToScan,
  onNavigateToMap,
  onNavigateToAlerts,
  onNavigateToProfile,
  sunlightMode
}) => {
  const { user, token } = useAuth();
  const [scanHistory, setScanHistory] = useState<CropScanRecord[]>([]);
  const [loadingScans, setLoadingScans] = useState<boolean>(true);
  const [communityAlerts, setCommunityAlerts] = useState<CommunityAlertRecord[]>([]);
  const [mandiRates, setMandiRates] = useState<MarketRate[]>([]);
  const [loadingMandi, setLoadingMandi] = useState<boolean>(true);

  const farmerName = user?.name || farmer.name || (language === 'hi' ? 'किसान भाई' : 'Farmer');
  const farmerState = user?.state || farmer.state || 'Uttar Pradesh';
  const farmerDistrict = user?.district || farmer.district || 'Gorakhpur';
  const farmerVillage = user?.village || farmer.village || 'Pipraich';
  const primaryCrop = user?.primaryCrop || farmer.mainCrops[0] || 'Wheat';

  // Load Farmer's Scan History from Backend
  useEffect(() => {
    async function loadScans() {
      if (token) {
        setLoadingScans(true);
        const res = await apiService.getFarmerScans(token);
        if (res.success && res.scans) {
          setScanHistory(res.scans);
        }
        setLoadingScans(false);
      } else {
        setLoadingScans(false);
      }
    }
    loadScans();
  }, [token]);

  // Load Community Alerts relevant to farmer's location
  useEffect(() => {
    async function loadAlerts() {
      const res = await apiService.getCommunityAlerts({
        state: farmerState,
        district: farmerDistrict,
        crop: primaryCrop
      });
      if (res.success && res.alerts) {
        setCommunityAlerts(res.alerts);
      }
    }
    loadAlerts();
  }, [farmerState, farmerDistrict, primaryCrop]);

  // Load Mandi Rates for Farmer's Location
  useEffect(() => {
    async function loadMandi() {
      setLoadingMandi(true);
      const res = await apiService.getMarketRates({
        state: farmerState,
        district: farmerDistrict,
        limit: 4
      });
      if (res.success && res.rates) {
        setMandiRates(res.rates);
      }
      setLoadingMandi(false);
    }
    loadMandi();
  }, [farmerState, farmerDistrict]);

  return (
    <div className={`w-full min-h-screen pb-20 transition-colors ${
      sunlightMode ? 'bg-white text-black' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. TOP GREETING & LOCATION HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] text-white pt-6 pb-12 px-4 sm:px-6 lg:px-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{farmerVillage}, {farmerDistrict} ({farmerState})</span>
              </span>
              <span className="bg-emerald-950/80 text-emerald-200 border border-white/10 text-[11px] font-bold px-2.5 py-1 rounded-full">
                🌾 {primaryCrop}
              </span>
            </div>

            {/* Farmer Greeting */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif-title tracking-tight text-white mt-1">
              {language === 'hi' ? `नमस्ते, ${farmerName} 👋` : `Namaste, ${farmerName} 👋`}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base font-medium max-w-2xl mt-1.5 leading-relaxed">
              {language === 'hi'
                ? 'अपनी फसल के स्वास्थ्य की जांच करें और नजदीकी बीमारी के प्रकोप से सुरक्षित रहें।'
                : 'Check your crop health and stay protected from nearby disease outbreaks.'}
            </p>
          </div>

          {/* Weather Status & Outbreak Alert Summary */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0">
            <div className="p-2.5 bg-amber-400/20 rounded-xl text-amber-300">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">{weather.temp}°C • {weather.condition}</div>
              <div className="text-xs text-emerald-200 font-medium">💧 {weather.humidity}% Humidity • {farmerDistrict}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-6">
        
        {/* 2. PRIMARY ACTION HERO CARD: SCAN YOUR CROP */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
            <Sprout className="w-64 h-64 text-[#1b4332]" />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                  {language === 'hi' ? 'मुख्य सेवा / PRIMARY ACTION' : 'PRIMARY ACTION'}
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black font-serif-title text-[#1b4332]">
                {language === 'hi' ? 'अपनी फसल की जांच करें (SCAN YOUR CROP)' : 'SCAN YOUR CROP'}
              </h2>
              
              <p className="text-slate-600 text-sm sm:text-base font-semibold leading-relaxed">
                {language === 'hi'
                  ? 'अपनी फसल की पत्ती की स्पष्ट फोटो अपलोड करें या खींचें। तुरंत AI द्वारा बीमारी की सटीक पहचान और दवा की सिफारिश पाएं।'
                  : 'Upload or capture a clear photo of your crop leaf. Get instant AI-powered disease assessment and certified spray remedies.'}
              </p>
            </div>

            {/* Prominent Scan Action Button */}
            <button
              onClick={onNavigateToScan}
              className="w-full md:w-auto bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-[#1b4332]/30 hover:shadow-xl transition-all flex items-center justify-center gap-3 group/btn shrink-0"
            >
              <Camera className="w-6 h-6 text-emerald-400 group-hover/btn:scale-110 transition-transform" />
              <span>{language === 'hi' ? '📷 फसल की जांच करें' : '📷 Scan Crop Now'}</span>
              <ArrowRight className="w-5 h-5 text-emerald-300 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* 3. QUICK ACTIONS GRID */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 px-1">
            {language === 'hi' ? 'त्वरित सेवाएं / QUICK ACTIONS' : 'QUICK ACTIONS'}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Quick Button 1: Scan Crop */}
            <button
              onClick={onNavigateToScan}
              className="bg-emerald-700 text-white p-4 rounded-2xl font-black text-sm shadow-md hover:bg-emerald-800 transition-all flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span>{language === 'hi' ? 'फसल जांच' : 'Scan Crop'}</span>
            </button>

            {/* Quick Button 2: Scan History */}
            <a
              href="#scans-section"
              className="bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl font-black text-sm shadow-sm hover:border-emerald-500 hover:text-emerald-900 transition-all flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <span>{language === 'hi' ? 'जांच इतिहास' : 'Scan History'}</span>
            </a>

            {/* Quick Button 3: Community Alerts */}
            <button
              onClick={onNavigateToAlerts}
              className="bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl font-black text-sm shadow-sm hover:border-amber-500 hover:text-amber-900 transition-all flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <span>{language === 'hi' ? 'बीमारी अलर्ट' : 'Community Alerts'}</span>
            </button>

            {/* Quick Button 4: Mandi Rates */}
            <a
              href="#mandi-section"
              className="bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl font-black text-sm shadow-sm hover:border-emerald-500 hover:text-emerald-900 transition-all flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span>{language === 'hi' ? 'आज का मंडी भाव' : 'Mandi Rates'}</span>
            </a>

          </div>
        </div>

        {/* 4. DASHBOARD SECTIONS GRID: SCAN HISTORY & COMMUNITY ALERTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: MY SCAN HISTORY */}
          <div id="scans-section" className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1b4332] font-serif-title">
                    {language === 'hi' ? 'मेरा फसल जांच इतिहास' : 'My Scan History'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'hi' ? 'आपकी पिछली फसल स्वास्थ्य रिपोर्ट' : 'Your previous AI disease diagnosis records'}
                  </p>
                </div>
              </div>

              <button
                onClick={onNavigateToScan}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>+ {language === 'hi' ? 'नई जांच' : 'New Scan'}</span>
              </button>
            </div>

            {/* Scan History Records */}
            {loadingScans ? (
              <div className="py-8 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Loading your scan history...</span>
              </div>
            ) : scanHistory.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 space-y-3">
                <Sprout className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No previous crop scans found.</p>
                <button
                  onClick={onNavigateToScan}
                  className="bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow"
                >
                  Scan Crop Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {scanHistory.map((scan) => {
                  const formattedDate = new Date(scan.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <div
                      key={scan.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          scan.result === 'Healthy'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {scan.result === 'Healthy' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900">{scan.cropName}</h4>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              scan.result === 'Healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {scan.result === 'Healthy' ? (language === 'hi' ? 'स्वस्थ' : 'Healthy') : (language === 'hi' ? 'संक्रमित' : 'Infected')}
                            </span>
                          </div>
                          
                          <p className="text-xs font-bold text-slate-600 mt-0.5">
                            {language === 'hi' ? scan.diseaseHindi : scan.diseaseName}
                          </p>
                          <span className="text-[10px] text-slate-400 font-semibold">{formattedDate} • Confidence {scan.confidence}%</span>
                        </div>
                      </div>

                      <button
                        onClick={onNavigateToScan}
                        className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors shrink-0"
                      >
                        {language === 'hi' ? 'देखें' : 'View Details'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: RELEVANT COMMUNITY ALERTS & TODAY'S MANDI RATES */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* COMMUNITY ALERTS CARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-extrabold text-[#1b4332] font-serif-title">
                    {language === 'hi' ? 'सामुदायिक बीमारी अलर्ट' : 'Community Alerts'}
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  📍 {farmerDistrict}
                </span>
              </div>

              <div className="space-y-3">
                {communityAlerts.map((alert) => {
                  let title = '';
                  let description = '';
                  let footer = '';

                  if (alert.type === 'disease') {
                    title = language === 'hi' ? alert.diseaseHindi : alert.diseaseName;
                    description = (language === 'hi' ? alert.recommendationsHindi?.[0] : alert.recommendations?.[0]) || '';
                    footer = `Crop: ${alert.crop} • ${alert.centerVillage}`;
                  } else if (alert.type === 'price') {
                    title = `${alert.commodity} Price Alert`;
                    description = alert.description;
                    footer = `${alert.direction.toUpperCase()} (${alert.percentChange}%)`;
                  } else if (alert.type === 'weather') {
                    title = `${alert.condition} Alert`;
                    description = alert.description;
                    footer = alert.recommendation;
                  }

                  return (
                    <div key={alert.id} className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                          ⚠️ {title}
                        </span>
                        <span className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-full">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 font-medium leading-relaxed">
                        {description}
                      </p>
                      <div className="text-[11px] font-bold text-slate-500 pt-1 flex items-center justify-between">
                        <span>{footer}</span>
                        <button onClick={onNavigateToAlerts} className="text-amber-800 underline font-black">View Alert</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MANDI RATES CARD */}
            <div id="mandi-section" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-extrabold text-[#1b4332] font-serif-title">
                    {language === 'hi' ? "आज का मंडी भाव" : "Today's Mandi Rates"}
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  📍 {farmerDistrict} Mandi
                </span>
              </div>

              {loadingMandi ? (
                <div className="py-4 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Loading Mandi Prices...</span>
                </div>
              ) : mandiRates.length === 0 ? (
                <p className="text-xs font-semibold text-slate-500 text-center py-4">No mandi rates found for {farmerDistrict}.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {mandiRates.map((rate) => (
                    <div key={rate.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-slate-800">{rate.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{rate.mandi}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-700">₹{rate.price.toLocaleString('en-IN')} / {rate.unit}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{rate.arrivalDate || 'Today'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* 5. FARMER PROFILE SUMMARY CARD */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1b4332] text-emerald-300 font-black text-lg flex items-center justify-center shadow">
              {farmerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-base font-extrabold text-[#1b4332]">{farmerName}</h4>
              <p className="text-xs text-slate-500 font-semibold">
                📍 {farmerVillage}, {farmerDistrict}, {farmerState} • Primary Crop: <span className="text-emerald-700 font-bold">{primaryCrop}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToProfile}
            className="w-full md:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-slate-600" />
            <span>{language === 'hi' ? 'प्रोफाइल प्रबंधित करें' : 'View / Edit Profile'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
