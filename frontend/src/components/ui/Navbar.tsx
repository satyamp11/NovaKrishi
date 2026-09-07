import React, { useState } from 'react';
import {
  Sprout,
  Search,
  User,
  Menu,
  X,
  ShoppingBag,
  TrendingUp,
  Truck,
  Sparkles,
  ShieldCheck,
  Globe,
  ShoppingCart,
  Package,
  Cpu,
  Building2,
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

export interface NavbarProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onOpenCart?: () => void;
  user?: { name: string; role?: string } | null;
  onLogout?: () => void;
  language?: string;
  onLanguageChange?: (lang: 'en' | 'hi') => void;
  cartItemCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'landing',
  onNavigate = () => {},
  onOpenAuth = () => {},
  onOpenCart = () => {},
  user = null,
  onLogout = () => {},
  language = 'en',
  onLanguageChange = () => {},
  cartItemCount = 0,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: language === 'hi' ? 'मुख्य पृष्ठ' : 'Home' },
    { id: 'marketplace', label: language === 'hi' ? 'मंडी बाज़ार' : 'Marketplace' },
    { id: 'how-it-works', label: language === 'hi' ? 'यह कैसे काम करता है' : 'How It Works' },
    { id: 'role-dashboard', label: language === 'hi' ? 'किसान व FPO' : 'Farmers & FPOs' },
    { id: 'bulk-buyer-nav', label: language === 'hi' ? 'थोक खरीदार' : 'Bulk Buyers' },
    { id: 'ai-forecast-nav', label: language === 'hi' ? 'एआई सलाह' : 'AI Insights' },
    { id: 'logistics', label: language === 'hi' ? 'लॉजिस्टिक्स' : 'Logistics' },
  ];

  const handleNavClick = (tabId: string) => {
    if (tabId === 'bulk-buyer-nav') {
      onNavigate('role-dashboard');
    } else if (tabId === 'ai-forecast-nav') {
      onNavigate('demand-forecast');
    } else if (tabId === 'how-it-works') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      onNavigate(tabId);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs font-sans">
      {/* 1. Thin Announcement Bar */}
      <div className="bg-[#1b4332] text-emerald-100 py-1.5 px-3 sm:px-4 text-[10px] sm:text-[11px] font-bold text-center flex items-center justify-center gap-1.5 sm:gap-2 border-b border-emerald-900">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="truncate">{language === 'hi' ? 'सीधा व्यापार कृषि बाज़ार • 100% एस्क्रो सुरक्षित • शून्य बिचौलिए कमीशन' : 'Direct Trade Agricultural Marketplace • 100% Escrow Protected • Zero Intermediary Margins'}</span>
      </div>

      {/* 2. Primary Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none" onClick={() => handleNavClick('landing')}>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#1b4332] flex items-center justify-center text-white shadow-xs border border-emerald-800 shrink-0">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-brand tracking-tight text-[#1b4332]">
                  Nova<span className="text-emerald-600 font-brand italic">Krishi</span>
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hidden sm:block">
                Direct Agricultural Marketplace
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-[#1b4332] font-black border border-emerald-200'
                      : 'text-slate-700 hover:text-[#1b4332] hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => onNavigate('marketplace')}
              className="p-2 rounded-xl text-slate-600 hover:text-[#1b4332] hover:bg-slate-100 transition-colors"
              title="Search Produce Marketplace"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="p-2 rounded-xl text-slate-600 hover:text-[#1b4332] hover:bg-slate-100 transition-colors relative"
              title="View Produce Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#1b4332] px-2 py-1 rounded-lg border border-slate-200"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Authentication Action Buttons */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('role-dashboard')}
                  className="hidden sm:inline-flex border-slate-300 text-slate-800"
                >
                  {user.name} ({user.role?.toUpperCase()})
                </Button>
                <Button variant="ghost" size="xs" onClick={onLogout} className="text-slate-500 hover:text-red-600 hidden sm:inline-flex">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenAuth('login')}
                  className="text-slate-700 hover:text-[#1b4332]"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenAuth('register')}
                  className="bg-[#1b4332] hover:bg-[#143022] text-white font-bold"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-[#1b4332] hover:bg-slate-100 rounded-xl"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 p-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
                  activeTab === link.id
                    ? 'bg-emerald-50 text-[#1b4332] font-black'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {/* Mobile Language Switcher */}
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-700" />
                <span>Switch Language</span>
              </span>
              <span className="text-emerald-700 font-extrabold">{language === 'en' ? 'हिन्दी (Hindi)' : 'English'}</span>
            </button>

            {!user ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => { onOpenAuth('login'); setIsMobileMenuOpen(false); }}>
                  Login
                </Button>
                <Button variant="primary" size="sm" className="bg-[#1b4332]" onClick={() => { onOpenAuth('register'); setIsMobileMenuOpen(false); }}>
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => { onNavigate('role-dashboard'); setIsMobileMenuOpen(false); }}>
                  {user.name} ({user.role?.toUpperCase()})
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="text-red-600 hover:bg-red-50">
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
