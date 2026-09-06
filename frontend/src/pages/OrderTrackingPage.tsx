import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Package,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  Navigation,
  Sparkles,
  PhoneCall,
  UserCheck,
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
import { apiService, DeliveryTrackingData, DeliveryStatus } from '../services/apiService';
import { ReliabilityBadge } from '../components/ui/ReliabilityBadge';
import { EscrowStatusTimeline } from '../components/checkout/EscrowStatusTimeline';
import { useAuth } from '../context/AuthContext';

export interface OrderTrackingPageProps {
  orderId: string;
  onBackToOrders?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  orderId,
  onBackToOrders = () => {},
  onNavigateTab = () => {},
}) => {
  const { user, token, openAuthModal } = useAuth();
  const toast = useToast();

  const [tracking, setTracking] = useState<DeliveryTrackingData | null>(null);
  const [paymentState, setPaymentState] = useState<any>(null);
  const [deliveryPartnerProfile, setDeliveryPartnerProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Controlled Demo Simulator State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);

  const fetchTracking = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getOrderTracking(orderId);
      if (res.success && res.tracking) {
        setTracking(res.tracking);
        
        // Fetch delivery partner profile for reliability badge
        if (res.tracking.deliveryPartner?.id) {
          const profileRes = await apiService.getUserProfile(res.tracking.deliveryPartner.id);
          if (profileRes.success && profileRes.user) {
            setDeliveryPartnerProfile(profileRes.user);
          }
        }
      } else {
        setError(res.message || 'Unable to load tracking details.');
      }

      // Fetch payment/escrow status
      if (token) {
        const paymentRes = await fetch(`/api/payments/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const paymentData = await paymentRes.json();
        if (paymentData.success) {
          setPaymentState(paymentData.payment || paymentData); // paymentData.payment has paymentState and escrowTimeline
        }
      }
    } catch (err) {
      setError('Network error connecting to tracking API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchTracking();
    }
  }, [orderId]);

  // Controlled Demo Simulator Effect
  useEffect(() => {
    let interval: any;
    if (isSimulating && tracking) {
      interval = setInterval(async () => {
        setSimStep((prev) => {
          const nextStep = (prev + 1) % 6;
          
          // Simulated highway route coordinates from Gorakhpur to Lucknow
          const routePoints = [
            { lat: 26.7606, lng: 83.3732, address: 'Gorakhpur FPO Producer Hub', speed: 0, dist: 270, status: 'PICKED_UP' },
            { lat: 26.7800, lng: 82.8000, address: 'En-route NH-27 near Basti Expressway', speed: 56, dist: 210, status: 'IN_TRANSIT' },
            { lat: 26.7900, lng: 82.2000, address: 'En-route NH-27 near Ayodhya Hub', speed: 64, dist: 142, status: 'IN_TRANSIT' },
            { lat: 26.8100, lng: 81.5000, address: 'Approaching Barabanki Logistics Toll', speed: 48, dist: 75, status: 'IN_TRANSIT' },
            { lat: 26.8400, lng: 81.0000, address: 'Lucknow Outer Ring Road Exit', speed: 35, dist: 18, status: 'OUT_FOR_DELIVERY' },
            { lat: 26.8467, lng: 80.9462, address: 'Gomti Nagar Destination Hub', speed: 0, dist: 0, status: 'DELIVERED' },
          ];

          const currentP = routePoints[nextStep];

          // Push live location update to backend API
          apiService.updateDeliveryLocation({
            orderId: tracking.orderId,
            lat: currentP.lat,
            lng: currentP.lng,
            speedKmH: currentP.speed,
            address: currentP.address,
            status: currentP.status as DeliveryStatus,
          }).then((res) => {
            if (res.success && res.delivery) {
              setTracking(res.delivery);
            }
          });

          if (currentP.status === 'DELIVERED') {
            setIsSimulating(false);
            toast.success('Simulated Delivery Completed!', 'Produce shipment reached destination.');
          }

          return nextStep;
        });
      }, 3500);
    }

    return () => clearInterval(interval);
  }, [isSimulating, tracking]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar activeTab="orders" onNavigate={onNavigateTab} user={user} onOpenAuth={openAuthModal} />

      {/* Header Banner */}
      <section className="bg-stone-950 text-white py-10 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={onBackToOrders}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to My Orders</span>
              </button>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Live GPS Crop Shipment Tracking</span>
                <Truck className="w-6 h-6 text-emerald-400" />
              </h1>
              <p className="text-xs text-stone-300 mt-1">
                Order Reference: {tracking?.orderNumber || orderId} • Real-time vehicle telemetry & route optimization
              </p>
            </div>

            {/* Controlled Demo Simulator Control Panel */}
            <div className="bg-amber-950/80 p-3 rounded-2xl border border-amber-900 flex items-center gap-3">
              <div className="text-right">
                <Badge variant="warning" size="sm" icon={<Sparkles className="w-3 h-3 text-amber-400" />}>
                  DEMO GPS SIMULATOR
                </Badge>
                <span className="text-[10px] text-amber-200 block font-mono mt-0.5">Simulated vehicle telemetry</span>
              </div>

              <Button
                variant="primary"
                size="xs"
                className="bg-amber-600 hover:bg-amber-500 text-white"
                leftIcon={isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                onClick={() => {
                  setIsSimulating(!isSimulating);
                  if (!isSimulating) toast.info('Demo GPS Simulation Started', 'Animating vehicle route on map.');
                }}
              >
                {isSimulating ? 'Pause Sim' : 'Run Demo GPS'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {loading && <LoadingState message="Connecting to GPS telemetry feed..." />}

        {error && !loading && <ErrorState title="Tracking Data Error" message={error} onRetry={fetchTracking} />}

        {!loading && !error && tracking && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Visual GPS Map & Telemetry Details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* High-Contrast Interactive Map Container */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
                {/* Map Control Bar */}
                <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span className="font-bold text-white">Live Route Telemetry</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                      Speed: {tracking.currentLocation.speedKmH} km/h
                    </span>
                  </div>

                  {tracking.isDemoSimulator && (
                    <Badge variant="warning" size="sm">
                      DEMO - Controlled Location Simulator
                    </Badge>
                  )}
                </div>

                {/* Visual Map Representation Area */}
                <div className="min-h-[420px] sm:min-h-[384px] h-auto w-full bg-slate-950 relative flex flex-col justify-between p-4 sm:p-6 overflow-hidden gap-4">
                  {/* Subtle Grid Map Pattern Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

                  {/* Highway Route Path Line */}
                  <div className="absolute top-1/2 left-6 sm:left-12 right-6 sm:right-12 h-1.5 bg-slate-800 rounded-full hidden sm:block">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_#10b981]"
                      style={{
                        width: `${Math.max(10, Math.min(100, ((270 - tracking.distanceRemainingKm) / 270) * 100))}%`,
                      }}
                    />
                  </div>

                  {/* Origin Node (Gorakhpur FPO Hub) */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="bg-slate-900/90 border border-slate-700 p-2.5 sm:p-3 rounded-2xl shadow-lg backdrop-blur-xs flex items-center gap-2 max-w-full sm:max-w-xs">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        A
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Pickup Origin</span>
                        <span className="text-xs font-black text-white truncate block">{tracking.pickupLocation.address}</span>
                      </div>
                    </div>

                    {/* Destination Node (Lucknow) */}
                    <div className="bg-slate-900/90 border border-slate-700 p-2.5 sm:p-3 rounded-2xl shadow-lg backdrop-blur-xs flex items-center justify-between sm:justify-end gap-2 max-w-full sm:max-w-xs text-left sm:text-right">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination</span>
                        <span className="text-xs font-black text-white truncate block">{tracking.destination.address}</span>
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        B
                      </div>
                    </div>
                  </div>

                  {/* Active Vehicle Marker Position on Map */}
                  <div className="relative z-20 my-auto text-center py-4 sm:py-0">
                    <div className="inline-flex flex-col items-center animate-bounce">
                      <div className="bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-1.5 border border-emerald-300">
                        <Truck className="w-4 h-4 text-slate-950 shrink-0" />
                        <span className="truncate">{tracking.deliveryPartner.vehicleNumber} ({tracking.currentLocation.speedKmH} km/h)</span>
                      </div>
                      <div className="w-2 h-2 bg-emerald-400 rotate-45 -mt-1 shadow-xs" />
                    </div>
                  </div>

                  {/* Map Bottom Telemetry Bar */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-xs text-xs gap-2">
                    <div className="flex items-center gap-2 text-slate-300 min-w-0">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-white truncate">
                        Position: {tracking.currentLocation.address}
                      </span>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Distance Remaining</span>
                      <span className="text-sm font-black text-emerald-400">{tracking.distanceRemainingKm} km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Timeline Section */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Order Dispatch Status Timeline
                </h3>

                <div className="space-y-4 pt-2">
                  {tracking.orderStatusTimeline.map((step, idx) => (
                    <div key={step.step} className="flex items-start gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          step.isCompleted
                            ? 'bg-emerald-700 text-white ring-4 ring-emerald-100'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {step.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="flex-1 pb-3 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-bold ${step.isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.label}
                          </h5>
                          {step.isCompleted && (
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Driver & Delivery Partner Details */}
            <div className="lg:col-span-4 space-y-6">
              {/* Delivery Partner Profile Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-sm font-black text-slate-900">Assigned Logistics Partner</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Driver Name</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-black text-slate-900">{tracking.deliveryPartner.name}</span>
                      {deliveryPartnerProfile && (
                        <ReliabilityBadge metrics={deliveryPartnerProfile.reliability} />
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Vehicle Info</span>
                    <span className="font-bold text-slate-800">
                      {tracking.deliveryPartner.vehicleType} • {tracking.deliveryPartner.vehicleNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Support</span>
                    <span className="font-semibold text-slate-700">{tracking.deliveryPartner.phone}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    leftIcon={<PhoneCall className="w-3.5 h-3.5 text-emerald-700" />}
                    onClick={() => toast.info('Calling Driver', `Dialing ${tracking.deliveryPartner.phone}...`)}
                  >
                    Call Delivery Driver
                  </Button>
                </div>
              </div>

              {/* ETA Summary Card */}
              <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-900 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-extrabold uppercase text-emerald-300">Estimated Delivery Time</span>
                </div>

                <span className="text-3xl font-black text-white block">3 Hours 45 Mins</span>

                <p className="text-xs text-emerald-200 leading-relaxed">
                  Temperature-controlled cold chain vehicle maintaining 4°C for crop freshness.
                </p>
              </div>

              {/* Escrow Status Timeline */}
              {paymentState && paymentState.escrowTimeline && (
                <EscrowStatusTimeline
                  timeline={paymentState.escrowTimeline}
                  currentPaymentState={paymentState.paymentState}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <Footer onNavigate={onNavigateTab} />
    </div>
  );
};
