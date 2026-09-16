import React from 'react';
import { ArrowRight, ShoppingCart, Star, MapPin, ShieldCheck, Leaf } from 'lucide-react';
import { ProductCard } from '../ui/ProductCard';

interface MarketplacePreviewSectionProps {
  onExploreMarketplace?: () => void;
  onAddToCart?: (productId: string) => void;
}

export const MarketplacePreviewSection: React.FC<MarketplacePreviewSectionProps> = ({
  onExploreMarketplace = () => {},
  onAddToCart = () => {},
}) => {
  const sampleProducts = [
    {
      id: 'p1',
      title: 'Fresh Farm Tomatoes (Grade-A)',
      category: 'Vegetables',
      price: 32,
      unit: 'kg',
      availableQuantity: 4500,
      farmerName: 'Green Valley FPO',
      fpoName: 'Green Valley Producer FPO',
      location: { district: 'Nashik', state: 'Maharashtra' },
      isVerifiedFPO: true,
      isOrganicCertified: true,
      rating: 4.9,
      reviewCount: 48,
      imageUrl: '/images/crops/tomato.jpg',
    },
    {
      id: 'p2',
      title: 'Organic Potatoes (Desi Aloo)',
      category: 'Vegetables',
      price: 24,
      unit: 'kg',
      availableQuantity: 8000,
      farmerName: 'Gorakhpur Farmers Co-Op',
      fpoName: 'Gorakhpur FPO Collective',
      location: { district: 'Gorakhpur', state: 'Uttar Pradesh' },
      isVerifiedFPO: true,
      isOrganicCertified: true,
      rating: 4.8,
      reviewCount: 32,
      imageUrl: '/images/crops/potato.jpg',
    },
    {
      id: 'p3',
      title: 'Premium Sharbati Wheat',
      category: 'Grains',
      price: 2450,
      unit: 'Quintal',
      availableQuantity: 120,
      farmerName: 'Malwa Farmers FPO',
      fpoName: 'Malwa Agriculture Producer Co',
      location: { district: 'Ujjain', state: 'Madhya Pradesh' },
      isVerifiedFPO: true,
      isOrganicCertified: false,
      rating: 4.95,
      reviewCount: 64,
      imageUrl: '/images/crops/wheat.jpg',
    },
    {
      id: 'p4',
      title: 'Fresh Red Onions (Export Grade)',
      category: 'Vegetables',
      price: 28,
      unit: 'kg',
      availableQuantity: 6200,
      farmerName: 'Solapur Organic Produce',
      fpoName: 'Solapur Farmers FPO',
      location: { district: 'Solapur', state: 'Maharashtra' },
      isVerifiedFPO: true,
      isOrganicCertified: true,
      rating: 4.7,
      reviewCount: 29,
      imageUrl: '/images/crops/onion.jpg',
    },
    {
      id: 'p5',
      title: 'Organic Alphonso Mangoes',
      category: 'Fruits',
      price: 120,
      unit: 'kg',
      availableQuantity: 1500,
      farmerName: 'Konkan Farmer Collective',
      fpoName: 'Ratnagiri Mango FPO',
      location: { district: 'Ratnagiri', state: 'Maharashtra' },
      isVerifiedFPO: true,
      isOrganicCertified: true,
      rating: 5.0,
      reviewCount: 88,
      imageUrl: '/images/crops/mango.jpg',
    },
  ];

  return (
    <section id="marketplace-preview" className="py-16 bg-white font-sans border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>DIRECT MARKETPLACE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#143022] font-sans tracking-tight">
              Fresh From the Farm
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Buy directly from verified farmers and FPOs with zero middleman commissions.
            </p>
          </div>

          <button
            onClick={onExploreMarketplace}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 text-[#1b4332] font-black text-xs border border-emerald-200 hover:bg-emerald-100 transition-all self-start md:self-auto"
          >
            <span>View All Produce</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {sampleProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={onAddToCart}
              onBuyNow={onExploreMarketplace}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
