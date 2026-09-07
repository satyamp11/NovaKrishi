import React, { useState, useEffect } from 'react';
import { Sprout, Globe, Menu, X, ArrowRight, User, LogOut, Sparkles } from 'lucide-react';
import type { Language } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onGetStarted: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  onGetStarted,
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  useEffect(() => {
    const heroElement = document.getElementById('hero');
    if (!heroElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When hero is no longer intersecting sufficiently, transition to solid white navbar
        setIsScrolledPastHero(!entry.isIntersecting);
      },
      {
        threshold: 0.05,
        rootMargin: '-80px 0px 0px 0px',
      }
    );

    observer.observe(heroElement);
    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { id: 'hero', labelEn: 'Home', labelHi: 'मुख्य पृष्ठ', active: true },
    { id: 'marketplace-preview', labelEn: 'Marketplace', labelHi: 'मंडी बाज़ार' },
    { id: 'how-it-works', labelEn: 'How It Works', labelHi: 'यह कैसे काम करता है' },
    { id: 'live-prices', labelEn: 'Market Prices', labelHi: 'मंडी भाव' },
    { id: 'ai-insights', labelEn: 'AI Insights', labelHi: 'एआई सलाह' },
    { id: 'pricing-breakdown', labelEn: 'Fair Pricing', labelHi: 'पारदर्शी मूल्य' },
    { id: 'logistics-section', labelEn: 'Logistics', labelHi: 'लॉजिस्टिक्स' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        isScrolledPastHero
          ? 'bg-white border-b border-stone-200 shadow-2xs'
          : 'bg-white/90 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-b border-stone-200/70 sm:border-transparent'
      }`}
    >
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#1b4332] text-white py-1.5 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-center flex items-center justify-center gap-1.5 sm:gap-2 border-b border-emerald-900 leading-snug">
        <Sprout className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="truncate">Direct Trade Agricultural Marketplace • 100% Escrow Protected • Zero Middlemen</span>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none" onClick={() => handleLinkClick('hero')}>
            <img 
              src="/novakrishi-logo.png" 
              alt="NovaKrishi" 
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl shadow-xs shrink-0 object-contain bg-white" 
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xl sm:text-2xl font-black font-brand tracking-tight text-[#1b4332] leading-tight">
                NovaKrishi
              </span>
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-500 hidden sm:block">
                FROM FARM TO MARKET, WITHOUT MIDDLEMEN
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                  link.active
                    ? 'text-[#1b4332] border-b-2 border-[#1b4332] rounded-b-none pb-1'
                    : 'text-slate-700 hover:text-[#1b4332] hover:bg-emerald-50/60'
                }`}
              >
                {language === 'hi' ? link.labelHi : link.labelEn}
              </button>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Language Pill */}
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-700 bg-slate-100/80 hover:bg-slate-200 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Desktop Login / Sign Up */}
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onGetStarted}
                  className="px-4 py-2 text-xs font-bold bg-emerald-50 text-[#1b4332] rounded-xl border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{user.name}</span>
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-xs font-extrabold text-slate-800 hover:text-[#1b4332]"
                >
                  Login
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-5 py-2.5 text-xs font-black bg-[#1b4332] hover:bg-[#143022] text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-[#1b4332] hover:bg-slate-100 rounded-xl"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer with Auth CTAs */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 p-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#1b4332]"
              >
                {language === 'hi' ? link.labelHi : link.labelEn}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <button
                  onClick={() => { onGetStarted(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 text-xs font-bold text-slate-900"
                >
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>{user.name} ({user.role?.toUpperCase()})</span>
                </button>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs text-red-600 font-bold px-2 py-1 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50"
                >
                  Login
                </button>
                <button
                  onClick={() => { openAuthModal('register'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1b4332] text-white text-xs font-bold hover:bg-[#143022]"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
