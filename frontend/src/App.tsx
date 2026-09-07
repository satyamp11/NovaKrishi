import { useState, useEffect, useRef } from 'react';
import type { 
  TabType, Language, FarmerProfile, WeatherData, OutbreakCluster, 
  OutbreakReport, CommunityActivity, DiseaseInfo, RiskLevel 
} from './types';
import { 
  INITIAL_FARMER, INITIAL_WEATHER, INITIAL_CLUSTERS, 
  INITIAL_REPORTS, COMMUNITY_ACTIVITIES, DISEASE_DATABASE 
} from './mockData';

// Layout & Navigation Components
import { HeaderBar } from './components/HeaderBar';
import { BottomNavigation } from './components/BottomNavigation';
import { MobileFrameWrapper } from './layouts/MobileFrameWrapper';
import { OutbreakSimulatorModal } from './components/OutbreakSimulatorModal';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import { KrishiLandingPage } from './components/landing/KrishiLandingPage';
import { UIFoundationShowcase } from './pages/UIFoundationShowcase';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { RouteOptimizationPage } from './pages/RouteOptimizationPage';
import { AIDemandForecastPage } from './pages/AIDemandForecastPage';
import { PriceInsightsPage } from './pages/PriceInsightsPage';
import { ToastProvider, useToast } from './components/ui/Toast';
import { Navbar, Footer, Button, Badge } from './components/ui';

// Role Dashboards
import { FarmerDashboardView } from './pages/dashboards/FarmerDashboardView';
import { ConsumerDashboardView } from './pages/dashboards/ConsumerDashboardView';
import { BulkBuyerDashboardView } from './pages/dashboards/BulkBuyerDashboardView';
import { DeliveryPartnerDashboardView } from './pages/dashboards/DeliveryPartnerDashboardView';
import { AdminDashboardView } from './pages/dashboards/AdminDashboardView';

// Page Components
import { SplashScreen } from './pages/SplashScreen';
import { LoginScreen } from './pages/LoginScreen';
import { HomeDashboard } from './pages/HomeDashboard';
import { CropScanner } from './pages/CropScanner';
import { ScanResult } from './pages/ScanResult';
import { CommunityMap } from './pages/CommunityMap';
import { AlertsScreen } from './pages/AlertsScreen';
import { ReportScreen } from './pages/ReportScreen';
import { CommunityScreen } from './pages/CommunityScreen';
import { ProfileScreen } from './pages/ProfileScreen';

import { apiService, UserRole } from './services/apiService';

const PROTECTED_TABS: TabType[] = ['home', 'scan', 'result', 'map', 'alerts', 'report', 'community', 'profile'];

export function AppContent() {
  // App State - Default to 'landing' so Home Page opens first on load
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string>('ORD-2026-849201');
  const [language, setLanguage] = useState<Language>('hi');
  const [sunlightMode, setSunlightMode] = useState<boolean>(false);

  const { user, token, isAuthenticated, isLoading, setOnAuthSuccessCallback, openAuthModal, logout } = useAuth();
  const toast = useToast();

  // Test state for role previewing
  const [simulatedRole, setSimulatedRole] = useState<UserRole>('farmer');

  // Increment this key every time we navigate to 'orders' tab to force OrdersPage to remount + refetch
  const [ordersRefetchKey, setOrdersRefetchKey] = useState<number>(0);

  // Store intended destination tab for post-authentication redirect
  const pendingTabRef = useRef<string | null>(null);

  // Auto-redirect to role dashboard upon authentication if desired
  useEffect(() => {
    if (user && user.role) {
      setSimulatedRole(user.role);
    }
  }, [user]);

  // Central tab navigation — always forces fresh remount of OrdersPage
  const navigateToTab = (targetTab: string) => {
    if (targetTab === 'orders') {
      setOrdersRefetchKey((k) => k + 1);
    }
    setActiveTab(targetTab);
  };

  // Protected route guard logic
  const handleNavigateWithAuth = (targetTab: string) => {
    if (isAuthenticated || !PROTECTED_TABS.includes(targetTab as TabType)) {
      navigateToTab(targetTab);
    } else {
      pendingTabRef.current = targetTab;
      openAuthModal('login');
    }
  };

  // Set post-login / post-registration redirect to intended destination or marketplace
  useEffect(() => {
    setOnAuthSuccessCallback(() => {
      const destination = pendingTabRef.current || 'marketplace';
      pendingTabRef.current = null;
      setActiveTab(destination);
      toast.success('Authentication Successful', `Welcome ${user?.name || 'User'} (${user?.role ? user.role.replace('_', ' ').toUpperCase() : 'Member'})`);
    });
  }, [setOnAuthSuccessCallback, user, toast]);

  // Data State
  const [farmer, setFarmer] = useState<FarmerProfile>(INITIAL_FARMER);

  // Sync authenticated user into profile
  useEffect(() => {
    if (user) {
      setFarmer((prev) => ({
        ...prev,
        name: user.name,
        state: user.state,
        district: user.district,
        village: user.village || prev.village,
        mainCrops: user.primaryCrop ? [user.primaryCrop] : prev.mainCrops
      }));
    }
  }, [user]);

  const [weather] = useState<WeatherData>(INITIAL_WEATHER);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('warning');
  const [clusters, setClusters] = useState<OutbreakCluster[]>(INITIAL_CLUSTERS);
  const [reports, setReports] = useState<OutbreakReport[]>(INITIAL_REPORTS);
  const [activities, setActivities] = useState<CommunityActivity[]>(COMMUNITY_ACTIVITIES);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(2);

  // Active Diagnosis State
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiseaseInfo>(DISEASE_DATABASE.tomato_blight);
  const [scannedImage, setScannedImage] = useState<string>('');

  // Simulator Modal State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [demoNotification, setDemoNotification] = useState<string | null>(null);

  // Handlers
  const handleLoginComplete = (profile: FarmerProfile) => {
    setFarmer(profile);
    setActiveTab('home');
  };

  const handleScanComplete = (result: DiseaseInfo, uploadedImage: string) => {
    setCurrentDiagnosis(result);
    setScannedImage(uploadedImage);
    setActiveTab('result');

    if (token) {
      apiService.saveCropScan(token, {
        cropName: result.crop || 'Crop',
        diseaseName: result.name,
        diseaseHindi: result.nameHindi,
        confidence: result.confidence || 95,
        imageUrl: uploadedImage,
        result: result.name.toLowerCase().includes('healthy') ? 'Healthy' : 'Infected',
        recommendations: result.chemicalAction || result.organicAction || [],
        recommendationsHindi: result.chemicalActionHindi || result.organicActionHindi || []
      });
    }
  };

  const handleReportSubmitted = (newReport: OutbreakReport) => {
    setReports([newReport, ...reports]);
    setActivities([
      {
        id: `act-${Date.now()}`,
        village: newReport.village,
        district: newReport.district,
        crop: newReport.crop,
        diseaseName: newReport.diseaseHindi,
        timeAgo: 'Just now',
        actionType: 'report'
      },
      ...activities
    ]);
    setActiveTab('map');
  };

  const handleExecuteOutbreakDemo = () => {
    setRiskLevel('outbreak');
    setUnreadAlertsCount(prev => prev + 1);

    const newDemoCluster: OutbreakCluster = {
      id: `demo-cluster-${Date.now()}`,
      diseaseName: 'Tomato Early Blight',
      diseaseHindi: 'टमाटर अगेती झुलसा प्रकोप',
      crop: 'Tomato',
      cropHindi: 'टमाटर',
      centerVillage: 'Kheri Sadh',
      lat: 28.8955,
      lng: 76.6066,
      radiusKm: 3.2,
      reportCount: 5,
      severity: 'Critical',
      lastReportTime: 'Just now',
      recommendations: ['Apply Mancozeb spray immediately to border beds'],
      recommendationsHindi: ['तुरंत अपने खेत की सीमा पर मैनकोज़ेब का निरोधात्मक छिड़काव करें']
    };

    setClusters([newDemoCluster, ...clusters]);
    setDemoNotification('⚠️ HIGH RISK OUTBREAK ALERT: 5 farmers in your village reported Tomato Blight within 3.2 km!');
    handleNavigateWithAuth('alerts');

    setTimeout(() => {
      setDemoNotification(null);
    }, 8000);
  };

  // Navigate to product detail page
  const handleViewProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setActiveTab('product-detail');
  };

  // Navigate to Live GPS tracking page
  const handleViewOrderTracking = (orderId: string) => {
    setSelectedTrackingOrderId(orderId);
    setActiveTab('tracking');
  };

  // Test backend role authorization endpoint
  const handleTestRoleAuthorization = async (roleToTest: UserRole) => {
    if (!token) {
      toast.error('Authentication Required', 'Please sign in first to test backend role authorization middleware.');
      openAuthModal('login');
      return;
    }

    toast.info('Testing Backend Middleware', `Validating endpoint /api/auth/${roleToTest.replace('_', '')}-only...`);
    const res = await apiService.testRoleAccess(token, roleToTest);
    if (res.success) {
      toast.success('Authorization Granted! (200 OK)', res.message);
    } else {
      toast.error('Authorization Denied! (403 Forbidden)', res.message);
    }
  };

  const showHeaderAndNav = activeTab !== 'splash' && activeTab !== 'login' && activeTab !== 'landing' && activeTab !== 'ui-showcase' && activeTab !== 'role-dashboard' && activeTab !== 'marketplace' && activeTab !== 'product-detail' && activeTab !== 'orders' && activeTab !== 'logistics' && activeTab !== 'logistics-optimization' && activeTab !== 'demand-forecast' && activeTab !== 'price-insights' && activeTab !== 'mandi' && activeTab !== 'tracking';

  const activeUserRole: UserRole = user?.role || simulatedRole;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3 text-white">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-emerald-200 tracking-wider">
          Validating NovaKrishi session token...
        </span>
      </div>
    );
  }

  return (
    <MobileFrameWrapper sunlightMode={sunlightMode}>
      
      {/* Top Header Bar (When in Mobile Dashboard view) */}
      {showHeaderAndNav && (
        <HeaderBar
          language={language}
          onLanguageChange={setLanguage}
          sunlightMode={sunlightMode}
          onToggleSunlightMode={() => setSunlightMode(!sunlightMode)}
          onTriggerDemo={() => setIsSimulatorOpen(true)}
          unreadAlertsCount={unreadAlertsCount}
          activeTab={activeTab as TabType}
          onTabChange={handleNavigateWithAuth}
        />
      )}

      {/* Emergency Push Notification Banner Bar */}
      {demoNotification && (
        <div className="bg-red-600 text-white p-3 text-xs font-black flex items-center justify-between shadow-2xl animate-beacon z-50 sticky top-[60px]">
          <div className="flex items-center gap-2">
            <span className="text-base animate-bounce">⚠️</span>
            <span>{demoNotification}</span>
          </div>
          <button
            onClick={() => setDemoNotification(null)}
            className="bg-black/30 hover:bg-black/50 text-white px-2 py-1 rounded text-[10px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Screen Router */}
      <div className={`${sunlightMode ? 'sunlight-mode' : ''} ${showHeaderAndNav ? 'pb-20 md:pb-0' : ''} w-full min-w-0 overflow-x-hidden`}>
        
        {/* PHASE 4: Agricultural Marketplace Page */}
        {activeTab === 'marketplace' && (
          <MarketplacePage
            onNavigateToProductDetail={(id) => handleViewProductDetail(id)}
            onNavigateTab={(tab) => navigateToTab(tab)}
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        {/* PHASE 4: Product Detail View (/product/:id) */}
        {activeTab === 'product-detail' && (
          <ProductDetailPage
            productId={selectedProductId || '1'}
            onBackToMarketplace={() => setActiveTab('marketplace')}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* PHASE 5 & 6: Orders History & Escrow Page */}
        {activeTab === 'orders' && (
          <OrdersPage
            key={ordersRefetchKey}
            onNavigateTab={(tab) => {
              if (tab === 'orders') setOrdersRefetchKey((k) => k + 1);
              setActiveTab(tab);
            }}
          />
        )}

        {/* PHASE 9: Logistics Dashboard */}
        {activeTab === 'logistics' && (
          <LogisticsPage
            onNavigateTab={(tab) => setActiveTab(tab)}
            onNavigateToTracking={(orderId) => handleViewOrderTracking(orderId)}
          />
        )}

        {/* PHASE 10: AI Route Optimization Page (/logistics/optimization) */}
        {activeTab === 'logistics-optimization' && (
          <RouteOptimizationPage
            onNavigateTab={(tab) => navigateToTab(tab)}
          />
        )}

        {/* AI Demand Forecasting Page (/ai/demand-forecast) */}
        {activeTab === 'demand-forecast' && (
          <AIDemandForecastPage
            onNavigateTab={(tab) => navigateToTab(tab)}
          />
        )}

        {/* AI Price Insights & Market Rates Page (/price-insights) */}
        {(activeTab === 'price-insights' || activeTab === 'mandi') && (
          <PriceInsightsPage
            onNavigateTab={(tab) => navigateToTab(tab)}
          />
        )}

        {/* PHASE 9: Live GPS Order Tracking Page (/orders/:orderId/tracking) */}
        {activeTab === 'tracking' && (
          <OrderTrackingPage
            orderId={selectedTrackingOrderId}
            onBackToOrders={() => setActiveTab('orders')}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* PHASE 3: Role Management & Auth Dashboard Router */}
        {activeTab === 'role-dashboard' && (
          <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            
            {/* Multi-Role Testing Toolbar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-[11px] sm:text-xs font-black uppercase text-slate-500 shrink-0">Test Role Dashboard Views:</span>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {(['farmer', 'consumer', 'bulk_buyer', 'delivery_partner', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSimulatedRole(r)}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                        activeUserRole === r
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {r.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Backend Role Authorization Tester */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">Backend Middleware Test:</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleTestRoleAuthorization(activeUserRole)}
                >
                  Test `{activeUserRole}` Route Authorization
                </Button>
              </div>
            </div>

            {/* Active Role Dashboard View Render */}
            {activeUserRole === 'farmer' && (
              <FarmerDashboardView
                user={user || {
                  id: 'mock-farmer',
                  name: 'Rameshwar Singh',
                  emailOrPhone: 'farmer@novakrishi.agri',
                  role: 'farmer',
                  state: 'Uttar Pradesh',
                  district: 'Gorakhpur',
                  village: 'Rampur',
                  farmInfo: { fpoName: 'Gorakhpur Farmers Producer Co.' },
                  createdAt: new Date().toISOString()
                }}
                onNavigate={(t) => setActiveTab(t)}
              />
            )}

            {activeUserRole === 'consumer' && (
              <ConsumerDashboardView
                user={user || {
                  id: 'mock-consumer',
                  name: 'Anita Sharma',
                  emailOrPhone: 'anita@gmail.com',
                  role: 'consumer',
                  state: 'Uttar Pradesh',
                  district: 'Lucknow',
                  deliveryAddress: { streetAddress: 'Sector 4, Gomti Nagar', city: 'Lucknow' },
                  createdAt: new Date().toISOString()
                }}
                onNavigate={(t) => setActiveTab(t)}
              />
            )}

            {activeUserRole === 'bulk_buyer' && (
              <BulkBuyerDashboardView
                user={user || {
                  id: 'mock-bulk',
                  name: 'Vikram Agrotech',
                  emailOrPhone: 'procurement@vikramagri.com',
                  role: 'bulk_buyer',
                  state: 'Maharashtra',
                  district: 'Mumbai',
                  businessInfo: { organizationName: 'Vikram Agro Processing Ltd', gstin: '27AABCU9603R1ZN' },
                  createdAt: new Date().toISOString()
                }}
                onNavigate={(t) => setActiveTab(t)}
              />
            )}

            {activeUserRole === 'delivery_partner' && (
              <DeliveryPartnerDashboardView
                user={user || {
                  id: 'mock-delivery',
                  name: 'Suresh Kumar (Logistics)',
                  emailOrPhone: 'suresh.logistics@gmail.com',
                  role: 'delivery_partner',
                  state: 'Uttar Pradesh',
                  district: 'Gorakhpur',
                  vehicleInfo: { vehicleType: 'MiniTruck', vehicleNumber: 'UP53BT9821' },
                  createdAt: new Date().toISOString()
                }}
                onNavigate={(t) => setActiveTab(t)}
              />
            )}

            {activeUserRole === 'admin' && (
              <AdminDashboardView
                user={user || {
                  id: 'mock-admin',
                  name: 'System Governance Administrator',
                  emailOrPhone: 'admin@novakrishi.gov.in',
                  role: 'admin',
                  state: 'New Delhi',
                  district: 'Central Delhi',
                  createdAt: new Date().toISOString()
                }}
                onNavigate={(t) => setActiveTab(t)}
              />
            )}

          </div>
        )}

        {activeTab === 'ui-showcase' && (
          <UIFoundationShowcase />
        )}

        {activeTab === 'landing' && (
          <KrishiLandingPage
            language={language}
            onLanguageChange={setLanguage}
            onLaunchApp={() => handleNavigateWithAuth('marketplace')}
            onLaunchScanner={() => handleNavigateWithAuth('scan')}
            onNavigateTab={(tab) => navigateToTab(tab)}
          />
        )}

        {activeTab === 'splash' && (
          <SplashScreen
            language={language}
            onLanguageSelect={setLanguage}
            onContinue={() => setActiveTab('login')}
            sunlightMode={sunlightMode}
          />
        )}

        {activeTab === 'login' && (
          <LoginScreen
            language={language}
            onLoginComplete={handleLoginComplete}
            sunlightMode={sunlightMode}
          />
        )}

        {activeTab === 'home' && (
          <HomeDashboard
            language={language}
            farmer={farmer}
            weather={weather}
            riskLevel={riskLevel}
            activeClusters={clusters}
            activities={activities}
            onNavigateToScan={() => handleNavigateWithAuth('scan')}
            onNavigateToMap={() => handleNavigateWithAuth('map')}
            onNavigateToAlerts={() => handleNavigateWithAuth('alerts')}
            onNavigateToProfile={() => handleNavigateWithAuth('profile')}
            sunlightMode={sunlightMode}
          />
        )}

        {activeTab === 'scan' && (
          <CropScanner
            language={language}
            onScanComplete={handleScanComplete}
            onBack={() => handleNavigateWithAuth('home')}
            sunlightMode={sunlightMode}
          />
        )}

        {activeTab === 'result' && (
          <ScanResult
            language={language}
            disease={currentDiagnosis}
            scannedImage={scannedImage}
            onReportCase={() => handleNavigateWithAuth('report')}
            onBack={() => handleNavigateWithAuth('scan')}
            sunlightMode={sunlightMode}
          />
        )}

        {activeTab === 'map' && (
          <CommunityMap
            language={language}
            clusters={clusters}
            reports={reports}
            sunlightMode={sunlightMode}
            onNavigateToScan={() => handleNavigateWithAuth('scan')}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsScreen
            language={language}
            clusters={clusters}
            onNavigateToScan={() => handleNavigateWithAuth('scan')}
            onNavigateToMap={() => handleNavigateWithAuth('map')}
            sunlightMode={sunlightMode}
          />
        )}

        {activeTab === 'report' && (
          <ReportScreen
            language={language}
            farmer={farmer}
            initialDisease={currentDiagnosis}
            onReportSubmitted={handleReportSubmitted}
            onBack={() => handleNavigateWithAuth('result')}
            sunlightMode={sunlightMode}
          />
        )}

        {activeTab === 'community' && (
          <CommunityScreen
            language={language}
            activities={activities}
            sunlightMode={sunlightMode}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            language={language}
            onLanguageChange={setLanguage}
            farmer={farmer}
            submittedReports={reports}
            sunlightMode={sunlightMode}
            onToggleSunlightMode={() => setSunlightMode(!sunlightMode)}
            onLogout={() => {
              logout();
              setActiveTab('landing');
            }}
          />
        )}
      </div>

      {/* Footer for Role Dashboard */}
      {(activeTab === 'role-dashboard') && (
        <Footer onNavigate={(t) => setActiveTab(t)} />
      )}

      {/* Bottom Navigation Bar */}
      {showHeaderAndNav && (
        <BottomNavigation
          activeTab={activeTab as TabType}
          onTabChange={handleNavigateWithAuth}
          language={language}
          unreadAlertsCount={unreadAlertsCount}
          sunlightMode={sunlightMode}
        />
      )}

      {/* Hackathon Outbreak Simulator Guide Modal */}
      <OutbreakSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onRunSimulation={handleExecuteOutbreakDemo}
        language={language}
      />

      {/* Global Authentication Modal */}
      <AuthModal language={language} />

    </MobileFrameWrapper>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
