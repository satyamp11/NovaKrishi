import React from 'react';
import { Sparkles, Radio, ArrowRight, Leaf } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../translations';

interface SplashScreenProps {
  language: Language;
  onLanguageSelect: (lang: Language) => void;
  onContinue: () => void;
  sunlightMode: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  language,
  onLanguageSelect,
  onContinue,
  sunlightMode
}) => {
  const t = translations[language];

  return (
    <div className={`w-full min-h-screen flex flex-col justify-between p-6 sm:p-12 transition-colors ${
      sunlightMode ? 'bg-white text-black' : 'bg-[#faf9f6] text-slate-900'
    }`}>
      {/* Top Branding Section */}
      <div className="pt-8 text-center flex flex-col items-center max-w-xl mx-auto space-y-4">
        {/* Logo Image */}
        <div className="relative mb-2">
          <img 
            src="/logo.png" 
            alt="NovaKrishi Logo" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="w-36 h-36 object-cover rounded-full shadow-2xl ring-4 ring-[#e8f5e9] border-2 border-emerald-600/30"
          />
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-2 rounded-xl shadow-lg animate-bounce">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <span className="font-script text-3xl text-[#2d6a4f] font-bold block">
          Welcome to
        </span>

        <h1 className="font-serif-title text-4xl sm:text-5xl font-extrabold text-[#1b4332] tracking-tight">
          {t.appName}
        </h1>

        <p className="text-xs font-black uppercase text-[#2d6a4f] tracking-widest bg-[#e8f5e9] px-4 py-1.5 rounded-full border border-[#2d6a4f]/20">
          {t.appSubhead}
        </p>

        <p className="text-sm text-slate-600 max-w-sm font-medium leading-relaxed italic">
          "{t.tagline}"
        </p>
      </div>

      {/* Network Illustration Graphic */}
      <div className="my-8 max-w-xl mx-auto w-full bg-white border border-slate-200/80 rounded-3xl p-6 text-center shadow-xl space-y-4">
        <p className="text-xs font-bold text-[#1b4332] uppercase tracking-wide flex items-center justify-center gap-1.5">
          <Leaf className="w-4 h-4 text-[#2d6a4f]" />
          <span>Community Early Warning Network</span>
        </p>

        <div className="flex items-center justify-around py-4">
          <div className="flex flex-col items-center space-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5e9] border-2 border-[#2d6a4f] flex items-center justify-center text-2xl shadow">
              👨‍🌾
            </div>
            <span className="text-xs text-slate-800 font-bold">Farmer A</span>
            <span className="text-[10px] text-[#2d6a4f] font-bold">Uploads Scan</span>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-500 flex items-center justify-center animate-pulse">
              <Radio className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] text-amber-700 font-extrabold">AI Hotspot</span>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5e9] border-2 border-[#2d6a4f] flex items-center justify-center text-2xl shadow">
              👩‍🌾
            </div>
            <span className="text-xs text-slate-800 font-bold">Farmer B</span>
            <span className="text-[10px] text-amber-700 font-bold">Gets Alert</span>
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-emerald-50/60 rounded-xl p-3 font-medium border border-emerald-100">
          🛡️ Protects 5 km radius around your village when disease is detected.
        </div>
      </div>

      {/* Language Selection & Action Button */}
      <div className="max-w-xl mx-auto w-full space-y-5 pb-6">
        <div>
          <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-2 text-center">
            {t.selectLanguage}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { code: 'hi', label: 'हिंदी' },
              { code: 'en', label: 'English' },
              { code: 'mr', label: 'मराठी' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageSelect(lang.code as Language)}
                className={`py-3 rounded-2xl font-bold text-xs border transition-all ${
                  language === lang.code
                    ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-md scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-4 bg-[#1b4332] hover:bg-[#143326] text-white font-black text-base rounded-2xl shadow-xl shadow-[#1b4332]/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
        >
          <span>{t.splashButton}</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
};
