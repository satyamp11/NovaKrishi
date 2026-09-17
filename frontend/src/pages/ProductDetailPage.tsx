import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Leaf,
  Star,
  ShoppingCart,
  Zap,
  TrendingUp,
  Truck,
  CheckCircle2,
  Building2,
  Calendar,
  Package,
} from 'lucide-react';
import {
  Navbar,
  Footer,
  Button,
  Badge,
  Card,
  LoadingState,
  ErrorState,
  useToast,
} from '../components/ui';
import { apiService, ProductItem } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { CartDrawer } from '../components/cart/CartDrawer';

export interface ProductDetailPageProps {
  productId: string;
  onBackToMarketplace?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBackToMarketplace = () => {},
  onNavigateTab = () => {},
}) => {
  const { user, token, openAuthModal } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.getProductById(productId);
        if (res.success && res.product) {
          setProduct(res.product);
          setQuantity(res.product.minOrderQuantity || 1);
        } else {
          setError(res.message || 'Product not found.');
        }
      } catch (err) {
        setError('Network error loading produce details.');
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user || !token) {
      toast.info('Authentication Required', 'Please sign in to add items to cart.');
      openAuthModal('login');
      return;
    }

    setActionLoading(true);
    try {
      const res = await apiService.addToCart(token, product.id, quantity);
      if (res.success) {
        toast.success('Added to Cart', `${quantity} ${product.unit} of ${product.title} added to cart.`);
        setIsCartOpen(true);
      } else {
        toast.error('Add to Cart Failed', res.message || 'Unable to add item to cart.');
      }
    } catch (err) {
      toast.error('Error', 'Network error adding to cart.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!user || !token) {
      toast.info('Authentication Required', 'Please sign in to proceed to Checkout.');
      openAuthModal('login');
      return;
    }

    setActionLoading(true);
    try {
      const res = await apiService.addToCart(token, product.id, quantity);
      if (res.success) {
        setIsCartOpen(true);
      } else {
        toast.error('Checkout Error', res.message || 'Unable to proceed to checkout.');
      }
    } catch (err) {
      toast.error('Error', 'Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <Navbar
        activeTab="marketplace"
        onNavigate={(tab) => onNavigateTab(tab)}
        user={user}
        onOpenAuth={(mode) => openAuthModal(mode)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Back Button */}
        <button
          onClick={onBackToMarketplace}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        {loading && <LoadingState message="Loading produce details..." />}

        {error && !loading && (
          <ErrorState
            title="Produce Details Error"
            message={error}
            onRetry={onBackToMarketplace}
          />
        )}

        {!loading && !error && product && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Image Gallery & Badges */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-96 sm:h-[450px] relative">
                {(() => {
                  const img = product.imageUrl || '';
                  const isTomato =
                    product.title.toLowerCase().includes('tomato') ||
                    product.title.toLowerCase().includes('tamatar') ||
                    img.includes('1592924357228');

                  const isMango =
                    product.title.toLowerCase().includes('mango') ||
                    product.title.toLowerCase().includes('aam') ||
                    img.includes('1553279768');

                  const isGhee = product.title.toLowerCase().includes('ghee');
                  const isWheatOrCert =
                    product.title.toLowerCase().includes('wheat') ||
                    img.toLowerCase().includes('certificate') ||
                    img.toLowerCase().includes('yhills') ||
                    img.toLowerCase().includes('completion') ||
                    img.toLowerCase().includes('award') ||
                    img.toLowerCase().includes('internship');

                  const finalImg = isTomato
                    ? '/images/fresh-tomato.jpg'
                    : isMango
                    ? 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80'
                    : isGhee
                    ? '/images/ghee.jpg'
                    : isWheatOrCert
                    ? '/images/wheat.jpg'
                    : (img && img !== '/images/crops/tomato.jpg' && img !== '/images/crops/mango.jpg'
                        ? img
                        : '/images/wheat.jpg');
                  return (
                    <img
                      src={finalImg}
                      alt={product.title}
                      onError={(e) => {
                        if (isTomato) {
                          e.currentTarget.src = '/images/fresh-tomato.jpg';
                        } else if (isMango) {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80';
                        } else {
                          e.currentTarget.src = '/images/wheat.jpg';
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  );
                })()}
                
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                  <Badge variant="primary" size="md">
                    {product.category}
                  </Badge>
                  {product.isVerifiedFPO && (
                    <Badge variant="success" size="md" icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}>
                      Verified FPO
                    </Badge>
                  )}
                  {product.isOrganicCertified && (
                    <Badge variant="earth" size="md" icon={<Leaf className="w-4 h-4 text-emerald-600" />}>
                      Organic Certified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Produce Info & Supplier Specs */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-slate-500">({product.reviewCount} Reviews)</span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    Stock: {product.availableQuantity} {product.unit}
                  </Badge>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {product.title}
                </h1>
              </div>

              {/* Price & Mandi Benchmark Box */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Direct Farmer Selling Price
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black text-emerald-800 tracking-tight">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">/ {product.unit}</span>
                  </div>
                </div>

                {product.mandiBenchmarkPrice && (
                  <div className="text-right border-l border-slate-200 pl-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      APMC Mandi Benchmark
                    </span>
                    <span className="text-base font-semibold text-slate-400 line-through">
                      ₹{product.mandiBenchmarkPrice.toLocaleString()} / {product.unit}
                    </span>
                  </div>
                )}
              </div>

              {/* Supplier / Farmer Box (Matching User Prompt Example) */}
              <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {product.fpoName ? product.fpoName : product.farmerName}
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {product.location.village ? `${product.location.village}, ` : ''}
                          {product.location.district}, {product.location.state}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Badge variant="primary" size="md">
                    Direct from Farmer
                  </Badge>
                </div>
              </div>

              {/* Quantity Selector & Order Buttons */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Quantity ({product.unit})</span>
                  <span>Min Order: {product.minOrderQuantity} {product.unit}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => setQuantity(Math.max(product.minOrderQuantity || 1, quantity - 1))}
                      className="px-3.5 py-2 text-sm font-black text-slate-700 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-sm font-extrabold text-slate-900 bg-white border-x border-slate-200">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.availableQuantity, quantity + 1))}
                      className="px-3.5 py-2 text-sm font-black text-slate-700 hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Price</span>
                    <span className="text-xl font-black text-emerald-800">
                      ₹{(product.price * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="lg"
                    isLoading={actionLoading}
                    leftIcon={<ShoppingCart className="w-5 h-5 text-emerald-700" />}
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    isLoading={actionLoading}
                    rightIcon={<Zap className="w-5 h-5 fill-white" />}
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Produce Description & Quality
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlacedSuccess={() => onNavigateTab('orders')}
      />

      {/* Footer */}
      <Footer onNavigate={(tab) => onNavigateTab(tab)} />
    </div>
  );
};
