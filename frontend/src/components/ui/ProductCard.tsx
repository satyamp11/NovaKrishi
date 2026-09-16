import React from 'react';
import { MapPin, ShieldCheck, ShoppingCart, ArrowRight, Star, Leaf, UserCheck, Sparkles } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';

export interface ProductCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  availableQuantity: number;
  rating?: number;
  reviewCount?: number;
  farmerName: string;
  fpoName?: string;
  location: { village?: string; district: string; state: string } | string;
  isVerifiedFPO?: boolean;
  isOrganicCertified?: boolean;
  imageUrl?: string;
  mandiBenchmarkPrice?: number;
  onAddToCart?: (id: string) => void;
  onBuyNow?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  className?: string;
  matchReasons?: string[];
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  category,
  price,
  unit,
  availableQuantity,
  rating = 4.8,
  reviewCount = 12,
  farmerName,
  fpoName,
  location,
  isVerifiedFPO = false,
  isOrganicCertified = false,
  imageUrl = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=500&q=80',
  mandiBenchmarkPrice,
  onAddToCart,
  onBuyNow,
  onViewDetails,
  className = '',
  matchReasons,
}) => {
  const formattedLocation =
    typeof location === 'string'
      ? location
      : `${location.district}, ${location.state}`;

  const supplierDisplay = fpoName ? fpoName : farmerName;

  const isGhee = title.toLowerCase().includes('ghee');
  const isWheatOrCert =
    title.toLowerCase().includes('wheat') ||
    (imageUrl && (
      imageUrl.toLowerCase().includes('certificate') ||
      imageUrl.toLowerCase().includes('yhills') ||
      imageUrl.toLowerCase().includes('completion') ||
      imageUrl.toLowerCase().includes('award') ||
      imageUrl.toLowerCase().includes('internship')
    ));
  const finalImageUrl = isGhee
    ? '/images/ghee.jpg'
    : isWheatOrCert
    ? '/images/wheat.jpg'
    : (imageUrl || '/images/wheat.jpg');

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group ${className}`}
    >
      {matchReasons && matchReasons.length > 0 && (
        <div className="bg-indigo-50 border-b border-indigo-100 p-2 flex gap-1 overflow-x-auto scrollbar-none items-center">
          <span className="text-[10px] font-black uppercase text-indigo-700 mr-1 whitespace-nowrap shrink-0"><Sparkles className="w-3 h-3 inline mr-1 -mt-0.5" />AI Match</span>
          {matchReasons.map((reason, idx) => (
            <span key={idx} className="bg-white border border-indigo-200 text-indigo-800 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
              {reason}
            </span>
          ))}
        </div>
      )}

      {/* Product Image & Badges */}
      <div
        className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onViewDetails && onViewDetails(id)}
      >
        <img
          src={finalImageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <Badge variant="primary" size="sm">
            {category}
          </Badge>
          {isVerifiedFPO && (
            <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}>
              Verified FPO
            </Badge>
          )}
          {isOrganicCertified && (
            <Badge variant="earth" size="sm" icon={<Leaf className="w-3.5 h-3.5 text-emerald-600" />}>
              Organic
            </Badge>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{rating.toFixed(1)}</span>
          <span className="text-slate-400 text-[10px]">({reviewCount})</span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Product Title */}
          <h3
            onClick={() => onViewDetails && onViewDetails(id)}
            className="font-black text-slate-900 text-base group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-1"
          >
            {title}
          </h3>

          {/* Pricing Row */}
          <div className="flex items-baseline justify-between mt-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-800 tracking-tight">₹{price.toLocaleString()}</span>
              <span className="text-xs font-semibold text-slate-500">/ {unit}</span>
            </div>

            {mandiBenchmarkPrice && (
              <span className="text-[11px] text-slate-400 font-semibold line-through">
                Mandi: ₹{mandiBenchmarkPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Supplier / Farmer Block (As requested in prompt example) */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 truncate">{supplierDisplay}</span>
            <Badge variant="neutral" size="sm" icon={<UserCheck className="w-3 h-3 text-emerald-600" />}>
              Direct from Farmer
            </Badge>
          </div>
          <div className="flex items-center text-[11px] text-slate-500 gap-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{formattedLocation}</span>
          </div>
        </div>

        {/* Available Stock Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1">
          <span>Available Stock:</span>
          <span className={`font-bold ${availableQuantity > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {availableQuantity > 0 ? `${availableQuantity.toLocaleString()} ${unit}` : 'Out of Stock'}
          </span>
        </div>

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ShoppingCart className="w-3.5 h-3.5 text-emerald-700" />}
            onClick={() => onAddToCart && onAddToCart(id)}
          >
            Add to Cart
          </Button>
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => onBuyNow && onBuyNow(id)}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};
