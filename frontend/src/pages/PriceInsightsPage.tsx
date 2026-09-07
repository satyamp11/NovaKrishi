import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  MapPin,
  BarChart3,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Navbar, Footer, Button, Badge, LoadingState } from '../components/ui';
import { FairPriceEstimator } from '../components/price/FairPriceEstimator';
import { apiService } from '../services/apiService';
import type { MarketRate } from '../types';
import { useAuth } from '../context/AuthContext';

export interface PriceInsightsPageProps {
  onNavigateTab?: (tab: string) => void;
}

const ALL_STATES = [
  'All',
  'Maharashtra',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Rajasthan',
  'Punjab',
  'Gujarat',
];

const CATEGORIES = ['All', 'Vegetables', 'Grains', 'Oilseeds', 'Pulses'];

export const PriceInsightsPage: React.FC<PriceInsightsPageProps> = ({
  onNavigateTab = () => {},
}) => {
  const { user, openAuthModal } = useAuth();

  const [rates, setRates] = useState<MarketRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<'7d' | '30d'>('7d');
  const [selectedCropForChart, setSelectedCropForChart] = useState<string>('Fresh Tomatoes');

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await apiService.getMarketRates({
        state: selectedState !== 'All' ? selectedState : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        limit: 16,
      });
      if (res.success && res.rates) {
        setRates(res.rates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshLivePrices = async () => {
    setRefreshing(true);
    try {
      const res = await apiService.refreshLivePrices();
      if (res.success && res.rates) {
        setRates(res.rates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [selectedState, selectedCategory, searchQuery]);

  const activeRateItem =
    rates.find((r) => r.name.toLowerCase().includes(selectedCropForChart.toLowerCase())) ||
    rates[0];

  const trendData =
    selectedTrendPeriod === '7d'
      ? activeRateItem?.trend7d || [26, 27, 29, 28, 30, 31, 32]
      : activeRateItem?.trend30d || [20, 22, 25, 27, 28, 30, 32];

  const minTrend = Math.min(...trendData);
  const maxTrend = Math.max(...trendData);
  const range = maxTrend - minTrend || 1;

  // Generate SVG path for trend visual
  const svgWidth = 600;
  const svgHeight = 180;
  const padding = 30;

  const points = trendData.map((val, idx) => {
    const x = padding + (idx / (trendData.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - ((val - minTrend) / range) * (svgHeight - padding * 2);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0},${svgHeight - padding} L ${points[0]?.x || 0},${svgHeight - padding} Z`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar
        activeTab="price-insights"
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
            <span className="text-emerald-400 font-bold">Price Insights</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  variant="primary"
                  size="sm"
                  icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                >
                  AI Price Intelligence Engine
                </Badge>
                <Badge variant="earth" size="sm">
                  Agmarknet & APMC Live Benchmarks
                </Badge>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Real-Time Arbitrage v2.0
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Price Insights & Market Trends</span>
                <TrendingUp className="w-7 h-7 text-emerald-400 shrink-0" />
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Understand real-time Mandi market rates across major regional agricultural hubs. Track 7-day and 30-day price momentum to know exactly when and where to sell for maximum profit.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-slate-700 hover:bg-slate-800"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
                onClick={handleRefreshLivePrices}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Live Rates'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigateTab('demand-forecast')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                AI Demand Forecast
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block text-[11px] font-semibold">Active APMC Mandis</span>
              <span className="text-base font-extrabold text-white">520+ Markets</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block text-[11px] font-semibold">Tracked Commodities</span>
              <span className="text-base font-extrabold text-white">48 Crops</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block text-[11px] font-semibold">Average Arbitrage Gain</span>
              <span className="text-base font-extrabold text-emerald-400">+18.5% Above Distress</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block text-[11px] font-semibold">Rate Sync Frequency</span>
              <span className="text-base font-extrabold text-white">Every 15 Minutes</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Interactive Filter Bar */}
        <section className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search crop, mandi, or district (e.g. Tomatoes, Nashik)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-stone-300 rounded-2xl font-medium w-full focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* State Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> State:
              </span>
              {ALL_STATES.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedState(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedState === st
                      ? 'bg-[#1b4332] text-white shadow-xs'
                      : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                    : 'bg-white text-slate-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Live Mandi Rate Cards Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl font-black text-slate-900">
                Live Mandi Benchmarks ({rates.length} Rates Found)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Select card to visualize price trends below
            </span>
          </div>

          {loading ? (
            <LoadingState message="Fetching real-time Mandi price feeds from APMC clusters..." />
          ) : rates.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No matching mandi rates found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or choosing "All" states to view nationwide agricultural rates.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedState('All');
                  setSelectedCategory('All');
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {rates.map((rate) => {
                const isUp = rate.priceChange >= 0;
                const isSelected =
                  activeRateItem && activeRateItem.name === rate.name;

                return (
                  <div
                    key={rate.id}
                    onClick={() => setSelectedCropForChart(rate.name)}
                    className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer space-y-3 relative group ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-stone-200 hover:border-emerald-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
                        {rate.name}
                      </span>
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${
                          isUp
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{isUp ? `+${rate.priceChange}%` : `${rate.priceChange}%`}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-2xl font-black text-[#1b4332]">
                        ₹{rate.price.toLocaleString()}
                        <span className="text-xs font-bold text-slate-500 font-sans">
                          {' '}
                          / {rate.unit}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{rate.mandi}, {rate.state}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-600">{rate.category || 'Agri'}</span>
                      <span className="font-semibold text-emerald-700">
                        {rate.lastUpdated || 'Updated Live'}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Interactive Price Trend Chart Visual */}
        {activeRateItem && (
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    TREND VISUALIZATION
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Commodity: <strong className="text-slate-900">{activeRateItem.name}</strong>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#143022] mt-1">
                  Price Trajectory ({activeRateItem.mandi}, {activeRateItem.state})
                </h3>
              </div>

              {/* 7D vs 30D Toggle */}
              <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200">
                <button
                  onClick={() => setSelectedTrendPeriod('7d')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    selectedTrendPeriod === '7d'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7-Day Horizon
                </button>
                <button
                  onClick={() => setSelectedTrendPeriod('30d')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    selectedTrendPeriod === '30d'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  30-Day Horizon
                </button>
              </div>
            </div>

            {/* SVG Interactive Chart */}
            <div className="bg-[#f7f9f5] p-5 rounded-2xl border border-stone-200 overflow-x-auto">
              <div className="min-w-[550px]">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-48 overflow-visible"
                >
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline Grids */}
                  <line
                    x1={padding}
                    y1={padding}
                    x2={svgWidth - padding}
                    y2={padding}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={padding}
                    y1={svgHeight / 2}
                    x2={svgWidth - padding}
                    y2={svgHeight / 2}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={padding}
                    y1={svgHeight - padding}
                    x2={svgWidth - padding}
                    y2={svgHeight - padding}
                    stroke="#cbd5e1"
                  />

                  {/* Area fill */}
                  <path d={areaD} fill="url(#priceGradient)" />

                  {/* Line path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive coordinate points */}
                  {points.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        fill="#ffffff"
                        stroke="#059669"
                        strokeWidth="3"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#1b4332"
                      >
                        ₹{pt.val}
                      </text>
                      <text
                        x={pt.x}
                        y={svgHeight - 12}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill="#64748b"
                      >
                        {selectedTrendPeriod === '7d'
                          ? `D-${points.length - 1 - i}`
                          : `W-${points.length - 1 - i}`}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* AI Advisor Panel for Selected Rate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">
                  AI Selling Advice
                </span>
                <p className="text-xs font-extrabold text-[#1b4332]">
                  {activeRateItem.priceChange >= 0
                    ? 'Hold or sell in high-grade direct contracts. Bullish momentum active.'
                    : 'Dispatch harvest to nearby processing hubs before spot rate dips further.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-1">
                <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                  Price Volatility
                </span>
                <p className="text-xs font-extrabold text-slate-800">
                  {Math.abs(activeRateItem.priceChange) > 6 ? 'High (±8%)' : 'Moderate (±3%)'}
                  {' • '}
                  <span className="font-semibold text-slate-500">Normal seasonality</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-1">
                <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                  Direct Buyer Demand
                </span>
                <p className="text-xs font-extrabold text-emerald-700">
                  Active B2B RFQs available on NovaKrishi Marketplace
                </p>
              </div>
            </div>

          </section>
        )}

        {/* AI Fair Price ML Predictor */}
        <section>
          <FairPriceEstimator />
        </section>

        {/* Cross-Link Cards to Other AI Modules */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                Next Feature
              </span>
              <h4 className="text-lg font-black text-slate-900">AI Demand Forecast</h4>
              <p className="text-xs text-slate-600">
                Predict future procurement spikes and harvest timing up to 14 days in advance using Prophet-XGBoost machine learning.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('demand-forecast')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Explore Demand Forecast
            </Button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                Logistics Optimization
              </span>
              <h4 className="text-lg font-black text-slate-900">Smart Route Optimization</h4>
              <p className="text-xs text-slate-600">
                Reduce mandi transit distance and transport costs using our Vehicle Routing Problem (VRP) solver.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('logistics-optimization')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Explore Route Optimization
            </Button>
          </div>
        </section>

      </main>

      <Footer onNavigate={onNavigateTab} />
    </div>
  );
};
