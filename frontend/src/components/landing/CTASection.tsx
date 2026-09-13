import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Language } from '../../types';
import logoImg from '../../assets/NovaKrishi.jpeg';

interface CTASectionProps {
  language?: Language;
  onExploreMarketplace?: () => void;
  onJoinNovaKrishi?: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({
  language = 'en',
  onExploreMarketplace = () => {},
  onJoinNovaKrishi = () => {},
}) => {
  return (
    <section className="py-20 bg-[#1b4332] text-white font-sans border-t border-emerald-900 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        
        <img 
          src={logoImg} 
          alt="NovaKrishi" 
          className="w-14 h-14 rounded-3xl shadow-lg border border-emerald-700 mx-auto object-contain bg-white" 
        />

        <h2 className="text-4xl sm:text-5xl font-extrabold font-sans tracking-tight text-white leading-tight">
          {language === 'hi' ? 'निष्पक्ष खाद्य आपूर्ति श्रृंखला बनाएं।' : 'Build a Fairer Food Supply Chain.'}
        </h2>

        <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto font-medium">
          {language === 'hi' ? 'सीधे जुड़ें। पारदर्शी व्यापार करें। स्मार्ट डिलीवरी पाएँ।' : 'Connect directly. Trade transparently. Deliver intelligently.'}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onExploreMarketplace}
            className="bg-white text-[#1b4332] hover:bg-emerald-50 px-8 py-4 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 border border-emerald-200 w-full sm:w-auto"
          >
            <span>{language === 'hi' ? 'मंडी बाज़ार देखें' : 'Explore Marketplace'}</span>
            <ArrowRight className="w-5 h-5 text-[#1b4332]" />
          </button>

          <button
            onClick={onJoinNovaKrishi}
            className="bg-emerald-800 hover:bg-emerald-700 text-white border-2 border-emerald-500 px-8 py-4 rounded-2xl font-extrabold text-base shadow-md transition-all w-full sm:w-auto"
          >
            <span>{language === 'hi' ? 'नोवाकृषि से जुड़ें' : 'Join NovaKrishi'}</span>
          </button>
        </div>

      </div>
    </section>
  );
};
