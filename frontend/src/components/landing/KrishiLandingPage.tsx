import React from 'react';
import type { Language } from '../../types';

import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { TrustBenefitStrip } from './TrustBenefitStrip';
import { MarketplacePreviewSection } from './MarketplacePreviewSection';
import { MarketRatesSection } from './MarketRatesSection';
import { AIInsightsSection } from './AIInsightsSection';
import { HowItWorksSection } from './HowItWorksSection';
import { TransparentPricingSection } from './TransparentPricingSection';
import { FarmerImpactSection } from './FarmerImpactSection';
import { LogisticsSection } from './LogisticsSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

interface KrishiLandingPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLaunchApp: () => void;
  onLaunchScanner: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const KrishiLandingPage: React.FC<KrishiLandingPageProps> = ({
  language,
  onLanguageChange,
  onLaunchApp,
  onLaunchScanner,
  onNavigateTab,
}) => {
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onLaunchApp();
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* 1. STICKY NAVBAR */}
      <Navbar
        language={language}
        onLanguageChange={onLanguageChange}
        onGetStarted={onLaunchApp}
        onNavigateSection={scrollToSection}
      />

      {/* 2. HERO SECTION */}
      <HeroSection
        language={language}
        onExploreMarketplace={onLaunchApp}
        onJoinAsFarmer={onLaunchApp}
        onLearnMore={() => scrollToSection('how-it-works')}
      />

      {/* 3. TRUST / BENEFIT STRIP */}
      <TrustBenefitStrip />

      {/* 4. MARKETPLACE PREVIEW ("Fresh From the Farm") */}
      <MarketplacePreviewSection
        onExploreMarketplace={onLaunchApp}
        onAddToCart={() => onLaunchApp()}
      />

      {/* 5. LIVE MARKET PRICES ("Know the Market. Sell Smarter.") */}
      <MarketRatesSection language={language} />

      {/* 6. AI INSIGHTS SECTION ("AI That Helps Farmers Decide Better.") */}
      <AIInsightsSection
        onExploreAI={onLaunchApp}
        onNavigateDemandForecast={() => (onNavigateTab ? onNavigateTab('demand-forecast') : onLaunchApp())}
        onNavigatePriceInsights={() => (onNavigateTab ? onNavigateTab('price-insights') : onLaunchApp())}
        onNavigateRouteOptimization={() => (onNavigateTab ? onNavigateTab('logistics-optimization') : onLaunchApp())}
      />

      {/* 7. HOW IT WORKS */}
      <HowItWorksSection language={language} />

      {/* 8. TRANSPARENT PRICING ("Where Your Money Goes") */}
      <TransparentPricingSection />

      {/* 9. FARMER STORY & IMPACT ("Better Markets. Better Earnings.") */}
      <FarmerImpactSection
        language={language}
        onStartSelling={onLaunchApp}
      />

      {/* 10. LOGISTICS ("From Farm to Doorstep.") */}
      <LogisticsSection onTrackDelivery={onLaunchApp} />

      {/* 11. CALL TO ACTION SECTION */}
      <CTASection
        language={language}
        onExploreMarketplace={onLaunchApp}
        onJoinNovaKrishi={onLaunchApp}
      />

      {/* 12. DARK FOREST-GREEN FOOTER */}
      <Footer
        language={language}
        onLanguageChange={onLanguageChange}
        onNavigateSection={scrollToSection}
      />

    </div>
  );
};
