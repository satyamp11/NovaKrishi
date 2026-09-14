import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import type { Language } from '../../types';
import logoImg from '../../assets/NovaKrishi.jpeg';

interface FooterProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection = () => {},
}) => {
  return (
    <footer className="bg-[#0f281e] text-slate-300 font-sans border-t border-emerald-950 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img 
<<<<<<< HEAD
                src="/logo.png" 
                alt="NovaKrishi Logo" 
                className="w-10 h-10 rounded-full object-cover bg-white shadow-md border border-emerald-600/30" 
=======
                src={logoImg} 
                alt="NovaKrishi" 
                className="w-10 h-10 rounded-2xl shadow-xs shrink-0 object-contain bg-white" 
>>>>>>> 17340e2183ac37732c701d2b2726090fff7df04a
              />
              <span className="text-2xl font-black font-serif tracking-tight text-white">
                Nova<span className="text-emerald-400 font-sans">Krishi</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              NovaKrishi connects farmers, FPOs, consumers and bulk buyers through a transparent digital marketplace powered by AI-driven insights and smart logistics.
            </p>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Direct Farm-to-Buyer Ecosystem</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><button onClick={() => onNavigateSection('hero')} className="hover:text-emerald-400">Home</button></li>
              <li><button onClick={() => onNavigateSection('marketplace-preview')} className="hover:text-emerald-400">Marketplace</button></li>
              <li><button onClick={() => onNavigateSection('how-it-works')} className="hover:text-emerald-400">How It Works</button></li>
              <li><button onClick={() => onNavigateSection('farmers')} className="hover:text-emerald-400">Farmers & FPOs</button></li>
              <li><button onClick={() => onNavigateSection('bulk-buyers')} className="hover:text-emerald-400">Bulk Buyers</button></li>
            </ul>
          </div>

          {/* Platform Capabilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><button onClick={() => onNavigateSection('ai-insights')} className="hover:text-emerald-400">AI Insights</button></li>
              <li><button onClick={() => onNavigateSection('live-prices')} className="hover:text-emerald-400">Market Prices</button></li>
              <li><button onClick={() => onNavigateSection('logistics-section')} className="hover:text-emerald-400">Logistics VRP</button></li>
              <li><button onClick={() => onNavigateSection('orders')} className="hover:text-emerald-400">Orders & Escrow</button></li>
              <li><button onClick={() => onNavigateSection('pricing-breakdown')} className="hover:text-emerald-400">Fair Pricing</button></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Support & Contact</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>+91 1800 266 7388 (Toll Free)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>support@novakrishi.gov.in</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Krishi Bhawan, New Delhi</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
          <p>© 2026 NovaKrishi Direct Agriculture Platform. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-emerald-400">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-emerald-400">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-emerald-400">Escrow Guidelines</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
