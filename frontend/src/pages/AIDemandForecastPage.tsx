import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Cpu,
  ShieldCheck,
  MapPin,
  ArrowLeft,
  BarChart2,
  Clock,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Navbar, Footer, Button, Badge } from '../components/ui';
import { AIDemandForecastSection } from '../components/farmer/AIDemandForecastSection';
import { useAuth } from '../context/AuthContext';

export interface AIDemandForecastPageProps {
  onNavigateTab?: (tab: string) => void;
}

const REGIONAL_PRESETS = [
  { state: 'Uttar Pradesh', district: 'Gorakhpur' },
  { state: 'Maharashtra', district: 'Nashik' },
  { state: 'Rajasthan', district: 'Jaipur' },
  { state: 'Madhya Pradesh', district: 'Indore' },
  { state: 'Punjab', district: 'Ludhiana' },
];

export const AIDemandForecastPage: React.FC<AIDemandForecastPageProps> = ({
  onNavigateTab = () => {},
}) => {
  const { user, openAuthModal } = useAuth();
  const [selectedRegionIndex, setSelectedRegionIndex] = useState<number>(0);
  const currentRegion = REGIONAL_PRESETS[selectedRegionIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar
        activeTab="demand-forecast"
        onNavigate={onNavigateTab}
        user={user}
        onOpenAuth={openAuthModal}
      />

      {/* Header Hero Banner */}
      <section className="bg-slate-950 text-white py-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <button
              onClick={() => onNavigateTab('landing')}
              className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigateTab('marketplace')}
              className="hover:text-emerald-400 transition-colors"
            >
              Marketplace
            </button>
            <span>/</span>
            <span className="text-emerald-400 font-bold">AI Demand Forecast</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  variant="primary"
                  size="sm"
                  icon={<Cpu className="w-3.5 h-3.5 text-emerald-400" />}
                >
                  Phase 8: Machine Learning Engine
                </Badge>
                <Badge variant="earth" size="sm">
                  Prophet + XGBoost Ensemble
                </Badge>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Predictive Time-Series v1.2
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                <span>AI Demand Forecast</span>
                <Sparkles className="w-7 h-7 text-emerald-400 fill-emerald-400 animate-pulse shrink-0" />
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Predict upcoming agricultural demand spikes, mandi price trajectories, and calculate the optimal harvest window before market saturation.
              </p>
            </div>

            {/* Quick Regional Dropdown Selector */}
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-2 shrink-0 sm:min-w-[260px]">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Forecasting Region:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {REGIONAL_PRESETS.map((preset, idx) => (
                  <button
                    key={`${preset.district}-${preset.state}`}
                    onClick={() => setSelectedRegionIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedRegionIndex === idx
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {preset.district}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400">
                Current: {currentRegion.district}, {currentRegion.state}
              </span>
            </div>
          </div>

          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/80 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">Forecast Horizon</p>
                <p className="text-sm font-extrabold text-white">7 to 14 Days Ahead</p>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/80 shrink-0">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">Avg Model Confidence</p>
                <p className="text-sm font-extrabold text-emerald-400">89.4% ML Score</p>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/80 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">Recommendation Window</p>
                <p className="text-sm font-extrabold text-white">Optimal Harvest: Day 3-6</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Forecast Section Embedded */}
        <AIDemandForecastSection
          district={currentRegion.district}
          state={currentRegion.state}
        />

        {/* Explainable AI Architecture Strip */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase tracking-wider">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>EXPLAINABLE AI ENGINE ARCHITECTURE</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#143022] tracking-tight">
            How NovaKrishi Predicts Agricultural Demand & Price Surges
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Our machine learning pipeline fuses three orthogonal data streams to produce non-linear, risk-calibrated demand projections for smallholders and FPOs:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-5 rounded-2xl bg-[#f4f7f2] border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                01
              </div>
              <h4 className="text-sm font-black text-slate-900">APMC Mandi Influx Trajectories</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aggregates daily arrival volumes from Agmarknet and regional trading mandis to detect pre-glut supply conditions before spot rates plummet.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f4f7f2] border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                02
              </div>
              <h4 className="text-sm font-black text-slate-900">Consumer & Bulk Procurement Signals</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitors B2B purchase contracts, festival calendar spikes, and institutional procurement requirements across urban consumption clusters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f4f7f2] border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                03
              </div>
              <h4 className="text-sm font-black text-slate-900">Hyper-Local Weather & Crop Stress</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Integrates precipitation anomaly models and heat stress indices to predict localized harvesting delays or accelerated maturation windows.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certified for farmer decision support under the Digital Agriculture Mission.</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('price-insights')}
              >
                View Price Insights
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigateTab('marketplace')}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Explore Marketplace Produce
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer onNavigate={onNavigateTab} />
    </div>
  );
};
