import React, { useState } from 'react';
import { 
  AlertTriangle, Radio, ChevronRight, MapPin, Shield, ArrowRight
} from 'lucide-react';
import type { Language, OutbreakCluster, OutbreakReport } from '../types';
import { translations } from '../translations';

interface CommunityMapProps {
  language: Language;
  clusters: OutbreakCluster[];
  reports: OutbreakReport[];
  sunlightMode: boolean;
  onNavigateToScan: () => void;
}

export const CommunityMap: React.FC<CommunityMapProps> = ({
  language,
  clusters,
  reports: _reports,
  sunlightMode,
  onNavigateToScan
}) => {
  const t = translations[language];
  const [diseaseFilter, setDiseaseFilter] = useState<string>('all');

  const filteredClusters = clusters.filter((c): c is Extract<OutbreakCluster, { type: 'disease' }> => c.type === 'disease').filter(c => {
    if (diseaseFilter !== 'all' && !c.diseaseName.toLowerCase().includes(diseaseFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const [selectedCluster, setSelectedCluster] = useState<Extract<OutbreakCluster, { type: 'disease' }> | null>(filteredClusters[0] || null);

  return (
    <div className={`w-full min-h-screen transition-colors ${
      sunlightMode ? 'bg-white text-black' : 'bg-[#faf9f6] text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
        
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="font-script text-3xl text-[#2d6a4f] font-bold block mb-1">
              Community Radar
            </span>
            <h1 className="font-serif-title text-3xl sm:text-4xl font-extrabold text-[#1b4332] flex items-center gap-3">
              <Radio className="w-8 h-8 text-red-600 animate-pulse" />
              <span>{t.mapTitle}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-[#1b4332] bg-[#e8f5e9] px-3.5 py-1.5 rounded-full border border-[#2d6a4f]/20 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2d6a4f]" />
              GPS Village Node: Kheri Sadh
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

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-sans-body">
          <button
            onClick={() => setDiseaseFilter('all')}
            className={`px-4 py-2 rounded-full font-bold transition-all ${
              diseaseFilter === 'all'
                ? 'bg-[#1b4332] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.mapFilterAll}
          </button>
          <button
            onClick={() => setDiseaseFilter('tomato')}
            className={`px-4 py-2 rounded-full font-bold transition-all ${
              diseaseFilter === 'tomato'
                ? 'bg-[#1b4332] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🍅 Tomato Blight
          </button>
          <button
            onClick={() => setDiseaseFilter('wheat')}
            className={`px-4 py-2 rounded-full font-bold transition-all ${
              diseaseFilter === 'wheat'
                ? 'bg-[#1b4332] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🌾 Wheat Rust
          </button>
        </div>

        {/* Responsive Desktop Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Outbreak Cluster List */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-serif-title font-bold text-xl text-[#1b4332] flex items-center gap-2">
              <span>Active Outbreak Zones ({filteredClusters.length})</span>
            </h3>

            <div className="space-y-3">
              {filteredClusters.map((cluster) => {
                const isSelected = selectedCluster?.id === cluster.id;
                return (
                  <div
                    key={cluster.id}
                    onClick={() => setSelectedCluster(cluster)}
                    className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-[#1b4332] ring-2 ring-[#1b4332]/20 bg-emerald-50/20'
                        : 'border-slate-200/80 hover:border-[#1b4332]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-red-100 text-red-600 font-bold">
                          <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            {cluster.severity} Outbreak
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-base mt-0.5">
                            {language === 'hi' ? cluster.diseaseHindi : cluster.diseaseName}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            📍 {cluster.centerVillage} • {cluster.radiusKm} km radius
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>👥 {cluster.reportCount} Verified Reports</span>
                      <span className="text-emerald-700">🕒 Updated {cluster.lastReportTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Radar Map Container */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-6 relative overflow-hidden min-h-[480px] flex flex-col justify-between">
              
              {/* Map Title Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-slate-800 text-sm">Interactive GPS Radar Visualization</span>
                </div>
                <span className="text-xs text-[#2d6a4f] bg-[#e8f5e9] px-3 py-1 rounded-full font-bold">
                  Village Radius 5 KM
                </span>
              </div>

              {/* Map Graphic Canvas Mockup */}
              <div className="relative flex-1 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-8 flex items-center justify-center overflow-hidden border border-slate-800">
                {/* Radar Grid Lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                
                {/* Pulse Radar Rings */}
                <div className="w-72 h-72 rounded-full border-2 border-emerald-500/40 animate-radar flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-2 border-amber-500/50 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center animate-ping" />
                  </div>
                </div>

                {/* Center Village Marker */}
                <div className="absolute flex flex-col items-center z-10">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shadow-2xl border-4 border-white animate-bounce">
                    🚨
                  </div>
                  <span className="bg-white text-slate-900 font-extrabold text-xs px-3 py-1 rounded-full shadow-lg mt-2">
                    {selectedCluster?.centerVillage || 'Kheri Sadh Outbreak Zone'}
                  </span>
                </div>
              </div>

              {/* Selected Cluster Details Footer */}
              {selectedCluster && (
                <div className="bg-[#e8f5e9] rounded-2xl p-4 border border-[#2d6a4f]/20 space-y-2">
                  <h4 className="font-bold text-[#1b4332] text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#2d6a4f]" />
                    <span>Recommended Preventive Protocol</span>
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 pl-6 list-disc font-medium">
                    {(language === 'hi' ? selectedCluster.recommendationsHindi : selectedCluster.recommendations).map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
