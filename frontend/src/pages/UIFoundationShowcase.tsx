import React, { useState } from 'react';
import {
  Sprout,
  ShoppingBag,
  TrendingUp,
  Truck,
  ShieldCheck,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  Navbar,
  Footer,
  Button,
  Input,
  Select,
  Modal,
  Badge,
  StatCard,
  ProductCard,
  SearchBar,
  SkeletonCard,
  EmptyState,
  ErrorState,
  useToast,
} from '../components/ui';

export const UIFoundationShowcase: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('landing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  // Form states
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [selectValue, setSelectValue] = useState('wheat');

  const sampleProducts = [
    {
      id: 'prod-1',
      title: 'Organic Sharbati Premium Wheat',
      category: 'Grains',
      price: 2450,
      unit: 'Quintal',
      mandiBenchmarkPrice: 2100,
      farmerName: 'Rameshwar Singh (FPO)',
      location: { district: 'Gorakhpur', state: 'Uttar Pradesh' },
      isVerifiedFPO: true,
      availableQuantity: 250,
      rating: 4.8,
      reviewCount: 24,
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'prod-2',
      title: 'Fresh Grade-A Red Tomatoes',
      category: 'Vegetables',
      price: 32,
      unit: 'kg',
      mandiBenchmarkPrice: 26,
      farmerName: 'Kisan Samridhi FPO',
      fpoName: 'Green Valley FPO',
      location: { district: 'Nashik', state: 'Maharashtra' },
      isVerifiedFPO: true,
      isOrganicCertified: true,
      availableQuantity: 1500,
      rating: 4.9,
      reviewCount: 42,
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'prod-3',
      title: 'Desi Chana (Chickpeas) Organic',
      category: 'Pulses',
      price: 5800,
      unit: 'Quintal',
      mandiBenchmarkPrice: 5200,
      farmerName: 'Suresh Kumar',
      location: { district: 'Indore', state: 'Madhya Pradesh' },
      isVerifiedFPO: false,
      availableQuantity: 120,
      rating: 4.7,
      reviewCount: 18,
      imageUrl: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=500&q=80',
    },
  ];

  const handleSearchSubmit = (query: string, category: string, location: string) => {
    toast.info('Search Executed', `Query: "${query || 'All'}" | Category: ${category} | Region: ${location}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Reusable Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          toast.success('Navigated', `Switched view to: ${tab}`);
        }}
        onOpenAuth={(mode) => {
          toast.info('Auth Modal Triggered', `Action: ${mode}`);
        }}
      />

      {/* Page Hero Header */}
      <section className="bg-stone-900 text-white py-12 border-b border-stone-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="md">
                  Phase 1: UI Foundation
                </Badge>
                <Badge variant="earth" size="md">
                  NovaKrishi Design System
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Nova<span className="text-emerald-400">Krishi</span> Startup Design System
              </h1>
              <p className="text-sm text-stone-300 mt-2 max-w-2xl leading-relaxed">
                A clean, modern, agricultural startup design foundation built with React 19, TypeScript, and Tailwind CSS v4. Features responsive components, accessible form controls, card design tokens, and state managers.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => toast.success('Design Tokens Ready', 'All Phase 1 UI components compiled cleanly.')}
              >
                Test Toast Trigger
              </Button>
              <Button variant="outline" size="md" className="border-stone-700 text-white hover:bg-stone-800" onClick={() => setIsModalOpen(true)}>
                Open Demo Modal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 flex-1 w-full">
        {/* Section 1: Key Platform Metrics (StatCards) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">1. Key Metrics & StatCards</h2>
              <p className="text-xs text-slate-500">Reusable stat components for real-time dashboard analytics.</p>
            </div>
            <Badge variant="success">StatCard Component</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Farmer Extra Earnings"
              value="+24.5%"
              change={18.2}
              changeLabel="vs local Mandis"
              icon={<TrendingUp className="w-5 h-5" />}
              variant="emerald"
            />
            <StatCard
              title="Active Verified FPOs"
              value="1,420"
              change={12.4}
              changeLabel="this month"
              icon={<ShieldCheck className="w-5 h-5" />}
              variant="amber"
            />
            <StatCard
              title="Direct Consumer Orders"
              value="28,450 Qtl"
              change={28.1}
              changeLabel="supply volume"
              icon={<ShoppingBag className="w-5 h-5" />}
              variant="emerald"
            />
            <StatCard
              title="Logistics Fuel Saved"
              value="3,840 Liters"
              change={-14.2}
              changeLabel="route optimization"
              icon={<Truck className="w-5 h-5" />}
              variant="earth"
            />
          </div>
        </section>

        {/* Section 2: SearchBar Component */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">2. Marketplace SearchBar</h2>
            <p className="text-xs text-slate-500">Compound search bar with category and location filters for B2C & B2B buyers.</p>
          </div>

          <SearchBar onSearch={handleSearchSubmit} />
        </section>

        {/* Section 3: Reusable Buttons Showcase */}
        <section className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">3. Reusable Button System</h2>
            <p className="text-xs text-slate-500">Standardized button hierarchy, sizes, states, and icon placements.</p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Variants</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Emerald</Button>
                <Button variant="secondary">Secondary Light</Button>
                <Button variant="outline">Outline Green</Button>
                <Button variant="ghost">Ghost Neutral</Button>
                <Button variant="danger">Danger Alert</Button>
                <Button variant="earthy">Earthy Stone</Button>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Sizes & States</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="xs">
                  Extra Small (xs)
                </Button>
                <Button variant="primary" size="sm">
                  Small (sm)
                </Button>
                <Button variant="primary" size="md">
                  Medium (md)
                </Button>
                <Button variant="primary" size="lg">
                  Large (lg)
                </Button>
                <Button variant="primary" size="sm" isLoading>
                  Loading State
                </Button>
                <Button variant="primary" size="sm" disabled>
                  Disabled
                </Button>
                <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Add Listing
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Product Cards (Produce Marketplace) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">4. Produce Product Cards</h2>
              <p className="text-xs text-slate-500">Direct-to-consumer and bulk buyer crop listing presentation cards.</p>
            </div>
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Listings
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                {...prod}
                onAddToCart={(id: string) => toast.success('Cart Updated', `Added item ${id}`)}
                onBuyNow={(id: string) => toast.info('Buy Now Triggered', `Item ID: ${id}`)}
              />
            ))}
          </div>
        </section>

        {/* Section 5: Reusable Form Controls (Inputs & Selects) */}
        <section className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">5. Form System (Inputs & Selects)</h2>
            <p className="text-xs text-slate-500">Accessible form elements with error handling, helper text, and icons.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Farmer Full Name"
              placeholder="e.g. Rameshwar Singh"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (e.target.value.length < 3) {
                  setInputError('Name must be at least 3 characters');
                } else {
                  setInputError('');
                }
              }}
              error={inputError}
              helperText="Enter name as registered on Khasra/Aadhaar"
              required
            />

            <Select
              label="Primary Crop Category"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              options={[
                { value: 'wheat', label: '🌾 Wheat (Gehun)' },
                { value: 'rice', label: '🌾 Rice / Paddy (Dhan)' },
                { value: 'pulses', label: '🫘 Pulses (Dal / Chana)' },
                { value: 'vegetables', label: '🥦 Fresh Vegetables' },
              ]}
              helperText="Selected crop will filter Mandi live rates"
            />

            <Input
              label="Expected Harvest Quantity"
              placeholder="e.g. 50"
              rightIcon={<span className="text-xs font-bold text-slate-500">Quintal</span>}
              helperText="Used by AI Demand Forecast"
            />
          </div>
        </section>

        {/* Section 6: Badges & Status Indicators */}
        <section className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">6. Badges & System Indicators</h2>
            <p className="text-xs text-slate-500">Role labels, verification tags, and order status pills.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary" dot>
              Farmer Role
            </Badge>
            <Badge variant="success" dot>
              Verified FPO
            </Badge>
            <Badge variant="warning" dot>
              Pending Delivery
            </Badge>
            <Badge variant="danger" dot>
              Outbreak Risk High
            </Badge>
            <Badge variant="info">Bulk Buyer</Badge>
            <Badge variant="neutral">Delivery Partner</Badge>
            <Badge variant="earth">Admin Verifier</Badge>
          </div>
        </section>

        {/* Section 7: UI State Managers (Loading, Empty, Error) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">7. Platform UI States</h2>
            <p className="text-xs text-slate-500">Standardized feedback screens for async data fetching.</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <Button variant={showLoading ? 'primary' : 'outline'} size="sm" onClick={() => setShowLoading(!showLoading)}>
              Toggle Skeleton Loader
            </Button>
            <Button variant={showEmpty ? 'primary' : 'outline'} size="sm" onClick={() => setShowEmpty(!showEmpty)}>
              Toggle Empty State
            </Button>
            <Button variant={showError ? 'primary' : 'outline'} size="sm" onClick={() => setShowError(!showError)}>
              Toggle Error State
            </Button>
          </div>

          {showLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {showEmpty && (
            <EmptyState
              title="No Direct Produce Listings Found"
              description="No farmers in Gorakhpur currently have organic wheat in stock. Check back tomorrow or adjust your distance radius."
              actionLabel="Post Procurement Request"
              onAction={() => toast.info('Request Created', 'Procurement request published to nearby FPOs.')}
            />
          )}

          {showError && (
            <ErrorState
              title="Mandi API Data Gateway Offline"
              message="The Government Data.gov.in Mandi price feed is currently experiencing latency. Local benchmark fallback rates are displayed."
              onRetry={() => {
                setShowError(false);
                toast.success('Retried Connection', 'Re-connected to Mandi price feed.');
              }}
            />
          )}
        </section>
      </main>

      {/* Reusable Modal Component Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Direct Produce Contract Terms"
        description="FPO Direct Trade Agreement between Rameshwar Singh & Buyer"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                toast.success('Agreement Accepted', 'Direct trade contract generated.');
              }}
            >
              Accept & Proceed
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p className="font-semibold text-slate-800">
            By agreeing to this Direct Trade contract on NovaKrishi:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Produce will be picked up directly from the farmer's village hub.</li>
            <li>Payment is held securely in platform escrow until quality inspection at dispatch.</li>
            <li>Logistics route is optimized using AI to ensure sub-24h delivery.</li>
            <li>No intermediary commission is deducted from the farmer's earnings.</li>
          </ul>
        </div>
      </Modal>

      {/* Reusable Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />
    </div>
  );
};
