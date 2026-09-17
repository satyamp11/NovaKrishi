import React from 'react';
import { 
  CheckCircle2, ArrowLeft, Radio, Sprout, AlertTriangle, ShieldCheck
} from 'lucide-react';
import type { Language, AiScanResult } from '../types';
import { translations } from '../translations';
import { AudioNarrationPlayer } from '../components/AudioNarrationPlayer';

interface ScanResultProps {
  language: Language;
  disease: AiScanResult;
  scannedImage: string;
  onReportCase: () => void;
  onBack: () => void;
  sunlightMode: boolean;
}

export const ScanResult: React.FC<ScanResultProps> = ({
  language,
  disease,
  scannedImage,
  onReportCase,
  onBack,
  sunlightMode
}) => {
  const t = translations[language];
  const isHindi = language === 'hi';

  const diseaseTitle = disease.disease || 'Unknown Disease';
  const symptomsList = disease.symptoms || [];
  const organicList = disease.treatment || [];
  const chemicalList = disease.prevention || [];

  const audioText = isHindi 
    ? `रोग का नाम: ${disease.disease}। फसल: ${disease.crop}। स्थिति: ${disease.status}।`
    : `Disease: ${disease.disease}. Crop: ${disease.crop}. Status: ${disease.status}.`;


  return (
    <div className={`w-full min-h-screen transition-colors ${
      sunlightMode ? 'bg-white text-black' : 'bg-[#faf9f6] text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="font-script text-3xl text-[#2d6a4f] font-bold block mb-1">
              AI Diagnostic Report
            </span>
            <h1 className="font-serif-title text-3xl sm:text-4xl font-extrabold text-[#1b4332] flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
              <span>{t.scanResultTitle}</span>
            </h1>
          </div>

          <button
            onClick={onBack}
            className="self-start md:self-auto flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-5 py-2 rounded-full text-xs font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Scanner</span>
          </button>
        </div>

        {/* Multi-column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image & Confidence Meter */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-5">
              
              <div className="relative rounded-2xl overflow-hidden h-72 bg-slate-950 border-4 border-slate-900">
                <img
                  src={scannedImage || "/images/crops/tomato.jpg"}
                  alt={diseaseTitle}
                  onError={(e) => { e.currentTarget.src = "/images/crops/tomato.jpg"; }}
                  className="w-full h-full object-cover"
                />

                {disease.status !== 'unknown' && (
                  <div className="absolute top-4 left-4 bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1.5 rounded-full shadow">
                    {disease.confidence}% AI Match
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur text-white p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <span>Detected Crop: <strong className="text-emerald-400">{disease.crop}</strong></span>
                  <span className={`${disease.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'} font-bold capitalize`}>
                    {disease.status}
                  </span>
                </div>
              </div>

              {/* Audio Narration Voice Bar */}
              <div className="bg-[#f4f7f4] rounded-2xl p-4 border border-[#2d6a4f]/20">
                <AudioNarrationPlayer
                  language={language}
                  textToNarrate={audioText}
                />
              </div>

              {/* Broadcast Report Button */}
              <button
                onClick={onReportCase}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform transform active:scale-98"
              >
                <Radio className="w-5 h-5 animate-pulse" />
                <span>Broadcast Alert to Village ({t.reportTitle})</span>
              </button>

            </div>
          </div>

          {/* Right Column: Detailed Remedies (Organic & Chemical) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6">
              
              {disease.status === 'unknown' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <p className="text-sm font-bold">{disease.message || 'The image could not be clearly recognized as a plant.'}</p>
                  </div>
                  <p className="text-slate-600 text-sm">Please go back and upload a clearer, well-lit photo of the affected crop leaf for an accurate AI diagnosis.</p>
                </div>
              ) : disease.status === 'healthy' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <p className="text-sm font-bold">Your {disease.crop} crop appears to be healthy!</p>
                  </div>
                  {chemicalList.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="font-bold text-slate-900 text-sm">Maintenance Tips:</h4>
                      <ul className="text-xs text-slate-700 space-y-2 font-medium">
                        {chemicalList.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#2d6a4f] bg-[#e8f5e9] px-3 py-1 rounded-full">
                      Verified Diagnosis
                    </span>
                    <h2 className="font-serif-title font-extrabold text-3xl text-slate-900 mt-2">
                      {diseaseTitle}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Crop: {disease.crop} • Cause: {disease.cause}
                    </p>
                  </div>

                  {/* Symptoms */}
                  {symptomsList.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-sm">Observed Symptoms:</h4>
                      <div className="flex flex-wrap gap-2">
                        {symptomsList.map((sym, i) => (
                          <span key={i} className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-200">
                            • {sym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Treatment */}
                  {organicList.length > 0 && (
                    <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 space-y-2">
                      <h4 className="font-bold text-[#1b4332] text-sm flex items-center gap-2">
                        <Sprout className="w-4.5 h-4.5 text-[#2d6a4f]" />
                        <span>Recommended Treatment:</span>
                      </h4>
                      <ul className="text-xs text-slate-700 space-y-2 font-medium">
                        {organicList.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prevention */}
                  {chemicalList.length > 0 && (
                    <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-100 space-y-2">
                      <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                        <ShieldCheck className="w-4.5 h-4.5 text-amber-600" />
                        <span>Prevention Steps:</span>
                      </h4>
                      <ul className="text-xs text-slate-700 space-y-2 font-medium">
                        {chemicalList.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
