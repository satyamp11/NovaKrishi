import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { Calculator, AlertTriangle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { Button } from '../ui';
import { translations } from '../../translations';
import type { Language } from '../../types';

export const FairPriceEstimator: React.FC<{ language?: Language }> = ({ language = 'en' }) => {
  const t = translations[language] || translations['en'];

  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);
  const [varieties, setVarieties] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [months, setMonths] = useState<number[]>([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number | ''>('');

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isColdStart, setIsColdStart] = useState(false);

  const COLD_START_CODES = ['SERVICE_UNAVAILABLE', 'TIMEOUT'];

  // Helper to fetch list and handle empty arrays
  const fetchList = async (
    fetchFn: () => Promise<any>,
    setList: React.Dispatch<React.SetStateAction<any[]>>,
    setValue: React.Dispatch<React.SetStateAction<any>>,
    listName: string
  ) => {
    setIsLoadingList(true);
    setError(null);
    setIsColdStart(false);
    try {
      const res = await fetchFn();
      if (res.success && res.data) {
        if (res.data.length === 0) {
          setError(`${t.noOptionsAvailable} (${listName})`);
          setList([]);
        } else {
          setList(res.data);
        }
      } else if (res.code && COLD_START_CODES.includes(res.code)) {
        setIsColdStart(true);
        setError(`The ML service is waking up from sleep. This can take up to a minute on the first request — please wait and retry.`);
      } else {
        setError(res.message || 'Error fetching data');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadInitialLists = () => {
    fetchList(() => apiService.getPriceForecastStates(), setStates, setSelectedState, 'States');
    fetchList(() => apiService.getPriceForecastMonths(), setMonths, setSelectedMonth, 'Months');
  };

  useEffect(() => {
    loadInitialLists();
  }, []);

  useEffect(() => {
    setDistricts([]); setSelectedDistrict('');
    setCommodities([]); setSelectedCommodity('');
    setVarieties([]); setSelectedVariety('');
    setGrades([]); setSelectedGrade('');
    if (selectedState) {
      fetchList(() => apiService.getPriceForecastDistricts(selectedState), setDistricts, setSelectedDistrict, 'Districts');
    }
  }, [selectedState]);

  useEffect(() => {
    setCommodities([]); setSelectedCommodity('');
    setVarieties([]); setSelectedVariety('');
    setGrades([]); setSelectedGrade('');
    if (selectedState && selectedDistrict) {
      fetchList(() => apiService.getPriceForecastCommodities(selectedState, selectedDistrict), setCommodities, setSelectedCommodity, 'Commodities');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    setVarieties([]); setSelectedVariety('');
    setGrades([]); setSelectedGrade('');
    if (selectedState && selectedDistrict && selectedCommodity) {
      fetchList(() => apiService.getPriceForecastVarieties(selectedState, selectedDistrict, selectedCommodity), setVarieties, setSelectedVariety, 'Varieties');
    }
  }, [selectedCommodity]);

  useEffect(() => {
    setGrades([]); setSelectedGrade('');
    if (selectedState && selectedDistrict && selectedCommodity && selectedVariety) {
      fetchList(() => apiService.getPriceForecastGrades(selectedState, selectedDistrict, selectedCommodity, selectedVariety), setGrades, setSelectedGrade, 'Grades');
    }
  }, [selectedVariety]);

  const handlePredict = async () => {
    if (!selectedState || !selectedDistrict || !selectedCommodity || !selectedVariety || !selectedGrade || selectedMonth === '') return;
    
    setIsPredicting(true);
    setError(null);
    setPrediction(null);
    try {
      const res = await apiService.predictFairPrice({
        state: selectedState,
        district: selectedDistrict,
        commodity: selectedCommodity,
        variety: selectedVariety,
        grade: selectedGrade,
        arrivalMonth: selectedMonth as number,
      });

      if (res.success && res.data) {
        setPrediction(res.data);
      } else {
        setError(res.message || 'Prediction failed');
      }
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setIsPredicting(false);
    }
  };

  const getMonthName = (m: number) => {
    const d = new Date();
    d.setMonth(m - 1);
    return d.toLocaleString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US', { month: 'long' });
  };

  const readyToPredict = selectedState && selectedDistrict && selectedCommodity && selectedVariety && selectedGrade && selectedMonth !== '';

  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-400 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700 border border-emerald-200">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-slate-900">{t.fairPriceTitle}</h3>
          </div>
          <p className="text-sm text-slate-500 mt-2 font-medium max-w-sm">
            {t.fairPriceDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600">{t.selectState}</label>
          <select 
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">-- {t.selectState} --</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600">{t.selectDistrict}</label>
          <select 
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
            value={selectedDistrict} 
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedState || districts.length === 0}
          >
            <option value="">-- {t.selectDistrict} --</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600">{t.selectCommodity}</label>
          <select 
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
            value={selectedCommodity} 
            onChange={(e) => setSelectedCommodity(e.target.value)}
            disabled={!selectedDistrict || commodities.length === 0}
          >
            <option value="">-- {t.selectCommodity} --</option>
            {commodities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600">{t.selectVariety}</label>
          <select 
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
            value={selectedVariety} 
            onChange={(e) => setSelectedVariety(e.target.value)}
            disabled={!selectedCommodity || varieties.length === 0}
          >
            <option value="">-- {t.selectVariety} --</option>
            {varieties.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600">{t.selectGrade}</label>
          <select 
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
            value={selectedGrade} 
            onChange={(e) => setSelectedGrade(e.target.value)}
            disabled={!selectedVariety || grades.length === 0}
          >
            <option value="">-- {t.selectGrade} --</option>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600">{t.selectMonth}</label>
          <select 
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            disabled={months.length === 0}
          >
            <option value="">-- {t.selectMonth} --</option>
            {months.map(m => <option key={m} value={m}>{getMonthName(m)}</option>)}
          </select>
        </div>
      </div>

      {isLoadingList && (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading regions from ML API...
        </div>
      )}

      {error && !isLoadingList && (
        <div className="flex items-start gap-2 text-sm font-medium text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            {isColdStart && (
              <button
                type="button"
                onClick={loadInitialLists}
                className="mt-2 text-xs font-bold text-red-800 underline underline-offset-2 hover:text-red-900"
              >
                Retry now
              </button>
            )}
          </div>
        </div>
      )}

      {prediction && !error && !isPredicting && (
        <div className="bg-emerald-950 p-6 rounded-2xl border border-emerald-800 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-20"></div>
          
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">{t.predictedPrice}</span>
          </div>
          
          <div className="flex items-end gap-2">
            <div className="text-4xl font-black tracking-tight">
              {prediction.currency === 'INR' ? '₹' : ''}{prediction.predicted_modal_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-emerald-300 font-medium mb-1">
              {t.perUnit} {prediction.unit}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-emerald-800/50 flex items-center justify-between text-xs text-emerald-400/80">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>{t.aiModelV} {prediction.model_version}</span>
            </div>
            <div>
              {prediction.input.Commodity} ({prediction.input.Variety})
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 relative z-10">
        <Button 
          variant="primary" 
          className="w-full shadow-lg shadow-emerald-500/20 py-3.5"
          onClick={handlePredict}
          disabled={!readyToPredict || isPredicting || isLoadingList}
        >
          {isPredicting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> {t.predicting}
            </span>
          ) : (
            t.predictPriceBtn
          )}
        </Button>
      </div>

    </div>
  );
};
