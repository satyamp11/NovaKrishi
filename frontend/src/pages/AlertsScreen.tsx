import React from 'react';
import { 
  AlertTriangle, ShieldAlert, Camera, MapPin, Clock, CheckCircle2, ArrowRight, Shield, CloudLightning, TrendingUp, TrendingDown, RefreshCcw
} from 'lucide-react';
import type { Language, OutbreakCluster, DiseaseAlertRecord, PriceAlertRecord, WeatherAlertRecord } from '../types';
import { translations } from '../translations';
import { AudioNarrationPlayer } from '../components/AudioNarrationPlayer';

interface AlertsScreenProps {
  language: Language;
  clusters: OutbreakCluster[];
  loading?: boolean;
  error?: string | null;
  onNavigateToScan: () => void;
  onNavigateToMap: () => void;
  sunlightMode: boolean;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  language,
  clusters,
  loading = false,
  error = null,
  onNavigateToScan,
  onNavigateToMap,
  sunlightMode
}) => {
  const t = translations[language];

  // Helper to render disease card
  const renderDiseaseCard = (cluster: DiseaseAlertRecord) => (
    <div key={cluster.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-red-200 relative overflow-hidden space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <span className="bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow">
          <AlertTriangle className="w-4 h-4 fill-current" />
          {t.emergencyBadge || 'OUTBREAK'}
        </span>
        <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Reported {cluster.lastReportTime}
        </span>
      </div>

      <div className="space-y-1">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-red-600" />
          {cluster.centerVillage} ({cluster.radiusKm || 5} km radius node)
        </span>
        <h3 className="font-serif-title font-extrabold text-2xl text-slate-900">
          {language === 'hi' ? cluster.diseaseHindi : cluster.diseaseName}
        </h3>
        <p className="text-xs text-slate-600 font-semibold">
          Affected Crop: <span className="text-[#1b4332] font-bold">{cluster.crop}</span> • {cluster.reportCount} Farmers Reported
        </p>
      </div>

      <div className="bg-[#f4f7f4] rounded-2xl p-4 border border-[#2d6a4f]/20">
        <AudioNarrationPlayer
          language={language}
          textToNarrate={
            language === 'hi'
              ? `चेतावनी! आपके गांव ${cluster.centerVillage} के पास ${cluster.diseaseHindi} का प्रकोप है। तुरंत सुरक्षात्मक छिड़काव करें।`
              : `Warning! ${cluster.diseaseName} outbreak reported near ${cluster.centerVillage}. Apply preventive spray immediately.`
          }
        />
      </div>

      <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 space-y-2">
        <h4 className="font-bold text-[#1b4332] text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#2d6a4f]" />
          <span>Immediate Preventive Steps</span>
        </h4>
        <ul className="text-xs text-slate-700 space-y-2 font-medium">
          {(language === 'hi' && cluster.recommendationsHindi ? cluster.recommendationsHindi : cluster.recommendations).map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={onNavigateToScan} className="flex-1 py-3 bg-[#1b4332] hover:bg-[#143326] text-white font-bold text-xs rounded-2xl shadow flex items-center justify-center gap-2">
          <Camera className="w-4 h-4" />
          <span>Scan My Field Now</span>
        </button>
        <button onClick={onNavigateToMap} className="px-5 py-3 border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl">
          View Map
        </button>
      </div>
    </div>
  );

  const renderPriceCard = (alert: PriceAlertRecord) => (
    <div key={alert.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-200 relative overflow-hidden space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <span className="bg-amber-500 text-white font-extrabold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow">
          {alert.direction === 'spike' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          MARKET ALERT
        </span>
      </div>
      <div className="space-y-1">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-amber-500" />
          {alert.district}, {alert.state}
        </span>
        <h3 className="font-serif-title font-extrabold text-2xl text-slate-900">
          {alert.percentChange}% Price {alert.direction === 'spike' ? 'Spike' : 'Drop'} Detected
        </h3>
        <p className="text-sm text-slate-600 font-semibold">{alert.description}</p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow flex items-center justify-center gap-2">
          View AI Price Estimator
        </button>
      </div>
    </div>
  );

  const renderWeatherCard = (alert: WeatherAlertRecord) => (
    <div key={alert.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-blue-200 relative overflow-hidden space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <span className="bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow">
          <CloudLightning className="w-4 h-4" />
          SEVERE WEATHER
        </span>
      </div>
      <div className="space-y-1">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-blue-600" />
          {alert.district}
        </span>
        <h3 className="font-serif-title font-extrabold text-2xl text-slate-900">
          {alert.condition}
        </h3>
        <p className="text-sm text-slate-600 font-medium">{alert.description}</p>
      </div>
      <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-100 space-y-2 mt-4">
        <h4 className="font-bold text-blue-800 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Recommendation</span>
        </h4>
        <p className="text-xs text-slate-700 font-medium">{alert.recommendation}</p>
      </div>
    </div>
  );

  return (
    <div className={`w-full min-h-screen transition-colors ${
      sunlightMode ? 'bg-white text-black' : 'bg-[#faf9f6] text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
        
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="font-script text-3xl text-[#2d6a4f] font-bold block mb-1">
              Emergency Advisory
            </span>
            <h1 className="font-serif-title text-3xl sm:text-4xl font-extrabold text-[#1b4332] flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-red-600 animate-bounce" />
              <span>{t.alertsTitle || 'Community Alerts'}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-red-100 text-red-700 font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-red-200">
              🚨 {clusters.length} Active Alerts
            </span>
            <button
              onClick={onNavigateToScan}
              className="bg-[#1b4332] hover:bg-[#143326] text-white px-5 py-2 rounded-full text-xs font-bold shadow flex items-center gap-1.5"
            >
              <span>Scan Crop Anomaly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <RefreshCcw className="w-8 h-8 text-emerald-600 animate-spin" />
             <p className="text-sm font-bold text-slate-500">Scanning region for alerts...</p>
           </div>
        ) : error ? (
           <div className="bg-red-50 rounded-3xl p-8 border border-red-200 text-center space-y-4">
             <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
             <h3 className="text-xl font-bold text-slate-900">Unable to load alerts</h3>
             <p className="text-sm text-slate-600">{error}</p>
             <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white font-bold text-sm rounded-full">Retry</button>
           </div>
        ) : clusters.length === 0 ? (
           <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-200 text-center space-y-4">
             <Shield className="w-12 h-12 text-emerald-500 mx-auto" />
             <h3 className="text-xl font-bold text-slate-900">No Active Alerts</h3>
             <p className="text-sm text-slate-600">Your region is currently clear of any reported diseases, severe weather, or extreme price fluctuations.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {clusters.map((alert) => {
              switch (alert.type) {
                case 'disease':
                  return renderDiseaseCard(alert as DiseaseAlertRecord);
                case 'price':
                  return renderPriceCard(alert as PriceAlertRecord);
                case 'weather':
                  return renderWeatherCard(alert as WeatherAlertRecord);
                default:
                  return null;
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};
