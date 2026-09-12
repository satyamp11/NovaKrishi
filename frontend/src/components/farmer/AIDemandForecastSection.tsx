import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, RefreshCw, Cpu, ChevronRight } from 'lucide-react';
import { Badge, Button, LoadingState, ErrorState } from '../ui';
import { apiService, CropForecastItem } from '../../services/apiService';

export const AIDemandForecastSection: React.FC<{ district?: string; state?: string }> = ({
  district = 'Gorakhpur',
  state = 'Uttar Pradesh',
}) => {
  const [forecasts, setForecasts] = useState<CropForecastItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCropIndex, setSelectedCropIndex] = useState<number>(0);

  const fetchForecasts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getAIDemandForecast(undefined, state, district);
      if (res.success && res.forecasts) {
        setForecasts(res.forecasts);
      } else {
        setError('Unable to load AI forecasting data.');
      }
    } catch (err) {
      setError('Network error connecting to AI Forecasting API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, [district, state]);

  const activeForecast = forecasts[selectedCropIndex] || forecasts[0];

  return (
    <div className="space-y-6">
      {/* Section Title Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm" icon={<Cpu className="w-3.5 h-3.5 text-emerald-400" />}>
              Phase 8: AI Demand Forecasting
            </Badge>
            <Badge variant="earth" size="sm">
              District: {district}, {state}
            </Badge>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>AI Agricultural Demand & Price Forecast</span>
            <Sparkles className="w-5 h-5 text-emerald-400 fill-emerald-400 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Predictive time-series ML modeling forecasting crop demand spikes, mandi price trends, and optimal harvest inventory strategy.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-white border-slate-700 hover:bg-slate-800"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={fetchForecasts}
        >
          Re-Run ML Model
        </Button>
      </div>

      {/* Demo / Prototype AI Model Label Notice */}
      <div className="p-3 bg-amber-950/60 border border-amber-900/80 rounded-2xl text-amber-200 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>AI Model Engine:</strong> NovaKrishi Prophet-XGBoost Ensemble v1.2 (Prototype ML Engine)
          </span>
        </div>
        <span className="text-[10px] bg-amber-900 px-2 py-0.5 rounded font-mono font-bold text-amber-300">
          Modular Python ML Hook Configured
        </span>
      </div>

      {loading && <LoadingState message="Running AI Demand & Price Forecast models..." />}

      {error && !loading && <ErrorState title="AI Engine Error" message={error} onRetry={fetchForecasts} />}

      {!loading && !error && forecasts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Crop Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Analyzed Regional Commodities ({forecasts.length})
            </h3>

            <div className="space-y-2">
              {forecasts.map((f, idx) => {
                const isSelected = selectedCropIndex === idx;
                return (
                  <div
                    key={f.crop}
                    onClick={() => setSelectedCropIndex(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-900 text-white border-emerald-700 shadow-md'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm">{f.crop}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          +{f.expectedDemandPercent}%
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                        Confidence: {f.confidenceScore}% • Trend: {f.trend}
                      </p>
                    </div>

                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Crop AI Forecast Detail Card */}
          {activeForecast && (
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">{activeForecast.crop}</span>
                    <Badge variant="primary" size="sm">
                      {activeForecast.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    District Forecast Target: {activeForecast.regionalDistrict}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Expected Demand</span>
                    <span className="text-lg font-black text-emerald-700">
                      +{activeForecast.expectedDemandPercent}% {activeForecast.timeframe}
                    </span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 font-extrabold text-sm">
                    {activeForecast.confidenceScore}% AI Confidence
                  </div>
                </div>
              </div>

              {/* Recommendation Box */}
              <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-900 space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-black uppercase text-emerald-300">
                    AI Inventory Recommendation:
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-semibold leading-relaxed">
                  "{activeForecast.recommendedStockAction}"
                </p>
              </div>

              {/* Historical vs Forecasted Demand SVG Chart — CSS LAYOUT FIX:
                  Bars use percentage heights. For % height to resolve to real px,
                  every ancestor in the flex column must have a DEFINITE height.
                  The chart container is h-44. Each column is `flex flex-col h-full`.
                  The bar sits inside a `flex-1` track div (items-end so bar grows
                  from the bottom). Without the track wrapper the column itself had
                  no definite height and `height: 60%` collapsed to 0px. */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                    7-Day Historical vs 7-Day Forecasted Demand Trend (Quintals)
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Historical
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> AI Forecasted
                    </span>
                  </div>
                </div>

                {/* Chart container: fixed height so child % heights resolve correctly */}
                <div className="h-44 w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-stretch justify-between gap-1.5">
                  {/* Historical Bars */}
                  {activeForecast.historicalDemandSeries.map((h) => {
                    const heightPercent = Math.min(100, Math.max(15, (h.demandQty / 350) * 100));
                    return (
                      <div key={h.date} className="flex-1 h-full flex flex-col items-center gap-1 group">
                        <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {h.demandQty}Q
                        </span>
                        {/* Track: fills remaining vertical space so the bar's
                            percentage height has a real, definite parent to
                            resolve against (without this, the bar collapses
                            to 0px). */}
                        <div className="w-full flex-1 flex items-end">
                          <div
                            className="w-full bg-slate-300 group-hover:bg-slate-400 rounded-t-md transition-all"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 truncate">{h.date}</span>
                      </div>
                    );
                  })}

                  {/* Vertical divider between historical and forecast */}
                  <div className="h-full w-0.5 bg-slate-300 mx-1 shrink-0" />

                  {/* Forecasted Bars */}
                  {activeForecast.forecastedDemandSeries.map((f) => {
                    const heightPercent = Math.min(100, Math.max(15, (f.predictedQty / 350) * 100));
                    return (
                      <div key={f.date} className="flex-1 h-full flex flex-col items-center gap-1 group">
                        <span className="text-[9px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          {f.predictedQty}Q
                        </span>
                        <div className="w-full flex-1 flex items-end">
                          <div
                            className="w-full bg-emerald-600 group-hover:bg-emerald-500 rounded-t-md transition-all shadow-xs"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-extrabold text-emerald-800 truncate">{f.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Risk Level & Meta Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Market Risk Level</span>
                  <span className="font-extrabold text-emerald-800">{activeForecast.riskLevel} Risk</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Demand Trend</span>
                  <span className="font-extrabold text-slate-900">{activeForecast.trend}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Model Reference</span>
                  <span className="font-semibold text-slate-700 truncate block">Prophet-XGB Ensemble</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
