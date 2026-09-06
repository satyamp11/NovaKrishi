import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Play,
  Pause,
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
import { apiService, DeliveryTrackingData } from '../services/apiService';
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
  
  // Advanced Telemetry State
  const [maxDistance, setMaxDistance] = useState<number>(0);
  const [speedHistory, setSpeedHistory] = useState<number[]>([]);
  const [vehiclePos, setVehiclePos] = useState({ x: 50, y: 50 }); // base coordinates for 1000x100 viewBox
  const pathRef = useRef<SVGPathElement>(null);

  // Compute percentage safely
  const routePercent = maxDistance > 0 
    ? Math.max(0, Math.min(100, Math.round(((maxDistance - (tracking?.distanceRemainingKm || 0)) / maxDistance) * 100))) 
    : 0;

  // Waypoints configuration (percentages along the route)
  const waypoints = [
    { label: 'Basti Expressway', percent: 22 },
    { label: 'Ayodhya Hub', percent: 47 },
    { label: 'Barabanki Toll', percent: 72 }
  ];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (tracking) {
      setMaxDistance(prev => {
        // If simulation freshly restarts (status PICKED_UP), reset the max distance to the new starting distance
        if (tracking.status === 'PICKED_UP' && tracking.distanceRemainingKm > 0) {
          return tracking.distanceRemainingKm;
        }
        return Math.max(prev, tracking.distanceRemainingKm || 0);
      });

      if (tracking.currentLocation?.speedKmH !== undefined) {
        setSpeedHistory(prev => {
          const newHist = [...prev, tracking.currentLocation.speedKmH];
          return newHist.slice(-15); // keep last 15 ticks for sparkline
        });
      }
    }
  }, [tracking]);

  // Update vehicle position along the SVG path
  useEffect(() => {
    if (pathRef.current && tracking) {
      const pathEl = pathRef.current as any;
      const length = pathEl.getTotalLength ? pathEl.getTotalLength() : 1000;
      const progress = Math.max(0, Math.min(1, routePercent / 100));
      const point = pathEl.getPointAtLength ? pathEl.getPointAtLength(progress * length) : { x: 50, y: 50 };
      setVehiclePos({ x: point.x, y: point.y });
    }
  }, [routePercent, tracking, maxDistance]);

  // Controlled Demo Simulator Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSimulating && tracking) {
      interval = setInterval(async () => {
        try {
          const res = await apiService.getOrderTracking(orderId);
          if (res.success && res.tracking) {
            setTracking(res.tracking);
            
            if (res.tracking.status === 'DELIVERED') {
              setIsSimulating(false);
              toast.success('Simulated Delivery Completed!', 'Produce shipment reached destination.');
            }
          }
        } catch (err) {
          console.error("Polling failed", err);
        }
      }, 2500); // Poll every 2.5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      // Cleanup: stop simulation on unmount if it was running
      if (isSimulating) {
        // Use navigator.sendBeacon or fire-and-forget fetch to stop on unmount reliably
        apiService.stopDemoSimulation(orderId).catch(() => {});
      }
    };
  }, [isSimulating, tracking, orderId, toast]);

  const handleToggleSimulation = async () => {
    if (!isSimulating) {
      toast.info('Demo GPS Simulation Started', 'Animating vehicle route on map.');
      await apiService.startDemoSimulation(orderId);
      setIsSimulating(true);
    } else {
      toast.info('Demo GPS Simulation Paused', 'Vehicle telemetry stopped.');
      await apiService.stopDemoSimulation(orderId);
      setIsSimulating(false);
    }
  };

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
                <span className="text-[10px] text-amber-200 block font-mono mt-0.5">Demo Route: Gorakhpur → Lucknow</span>
              </div>

              <Button
                variant="primary"
                size="xs"
                className="bg-amber-600 hover:bg-amber-500 text-white"
                leftIcon={isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                onClick={handleToggleSimulation}
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

        {error && (
          <ErrorState 
            title="Tracking Data Error" 
            message={error} 
            onRetry={fetchTracking} 
          />
        )}
        
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
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                      Speed: {tracking.currentLocation.speedKmH} km/h
                      {/* Speed Sparkline */}
                      {speedHistory.length > 1 && (
                        <svg className="w-12 h-3 ml-1 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <polyline 
                            points={speedHistory.map((s, i) => `${(i / (speedHistory.length - 1)) * 100},${100 - (s / 100) * 100}`).join(' ')} 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="4" 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
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

                  {/* Fallback state when simulation hasn't started */}
                  {(tracking.status === 'ASSIGNED' || tracking.pickupLocation.address.includes('Pending')) ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-slate-400">
                      <Package className="w-12 h-12 mb-3 text-slate-600 opacity-50" />
                      <p className="font-semibold text-sm">Awaiting vehicle dispatch...</p>
                      <p className="text-xs mt-1 opacity-70">Tracking will commence once the route begins.</p>
                    </div>
                  ) : (
                    <>
                      {/* SVG Curved Route Path */}
                      <div className="absolute top-1/2 left-6 sm:left-12 right-6 sm:right-12 h-24 -translate-y-1/2 z-10 hidden sm:block">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
                          {/* Background muted path */}
                          <path 
                            d="M 20 50 C 300 -20, 700 120, 980 50" 
                            fill="none" 
                            stroke="#1e293b" 
                            strokeWidth="12" 
                            strokeLinecap="round" 
                          />
                          {/* Foreground active progress path */}
                          <path 
                            ref={pathRef}
                            d="M 20 50 C 300 -20, 700 120, 980 50" 
                            fill="none" 
                            stroke="url(#routeGradient)" 
                            strokeWidth="12" 
                            strokeLinecap="round" 
                            strokeDasharray="1000"
                            strokeDashoffset={1000 - (routePercent / 100) * 1000}
                            className="transition-all duration-[2500ms] ease-linear"
                          />
                          <defs>
                            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="50%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>

                          {/* Intermediate Waypoints */}
                          {waypoints.map((wp, i) => {
                            const isPassed = routePercent >= wp.percent;
                            // Calculate position for waypoint circle
                            // We use a rough heuristic X coordinate (percent * 10) since exact pointAtLength isn't reactive inside map
                            // But actually we can just estimate its position on the bezier curve or render simple markers
                            // For simplicity, we can render the waypoints overlaid as HTML elements instead, but SVG circles are fine if we map linearly.
                            // However, since it's a Bezier curve, linear X mapping isn't perfectly accurate.
                            // A better approach: render waypoints as part of the visual path by approximating their S-curve Y.
                            const x = 20 + (wp.percent / 100) * 960;
                            // Y approximation for the cubic bezier: 
                            // This is a rough visual approximation that looks good enough on the curve
                            const t = wp.percent / 100;
                            const y = Math.pow(1-t, 3)*50 + 3*Math.pow(1-t, 2)*t*(-20) + 3*(1-t)*Math.pow(t, 2)*120 + Math.pow(t, 3)*50;
                            
                            return (
                              <g key={i} className="transition-all duration-700">
                                <circle 
                                  cx={x} 
                                  cy={y} 
                                  r="8" 
                                  fill={isPassed ? "#10b981" : "#1e293b"} 
                                  stroke={isPassed ? "#fff" : "#475569"} 
                                  strokeWidth="3" 
                                />
                                <text 
                                  x={x} 
                                  y={y + 25} 
                                  textAnchor="middle" 
                                  fill={isPassed ? "#94a3b8" : "#475569"} 
                                  fontSize="12" 
                                  fontWeight="bold"
                                >
                                  {wp.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>

                        {/* Active Vehicle Marker mapped exactly to SVG point */}
                        <div 
                          className="absolute z-30 transition-all duration-[2500ms] ease-linear"
                          style={{
                            left: `${(vehiclePos.x / 1000) * 100}%`,
                            top: `${(vehiclePos.y / 100) * 100}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          {/* Tooltip Label */}
                          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-[10px] font-mono whitespace-nowrap shadow-xl">
                            {tracking.deliveryPartner.vehicleNumber} <span className="text-emerald-400">({tracking.currentLocation.speedKmH} km/h)</span>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 mt-[-1px]" />
                          </div>

                          {/* Primary Truck Icon */}
                          <div className="relative flex items-center justify-center w-10 h-10 bg-white rounded-full border-4 border-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-10 transition-transform hover:scale-110">
                            <Truck className="w-5 h-5 text-emerald-600" />
                            {tracking.status !== 'DELIVERED' && tracking.status !== 'PICKED_UP' && (
                              <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping opacity-75" />
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

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

                  {/* Active Vehicle Marker (Mobile Only) */}
                  <div className="sm:hidden relative z-20 my-auto text-center py-4">
                    <div className="inline-flex flex-col items-center relative">
                      <div className="bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1 rounded-md text-xs font-mono whitespace-nowrap mb-2 shadow-lg">
                        {tracking.deliveryPartner.vehicleNumber} <span className="text-emerald-400">({tracking.currentLocation.speedKmH} km/h)</span>
                      </div>
                      <div className="relative flex items-center justify-center w-12 h-12 bg-white rounded-full border-4 border-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.8)]">
                        <Truck className="w-6 h-6 text-emerald-600" />
                        {tracking.status !== 'DELIVERED' && tracking.status !== 'PICKED_UP' && (
                          <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
                        )}
                      </div>
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
                      <span className="text-sm font-black text-emerald-400">
                        {tracking.distanceRemainingKm} km <span className="text-emerald-500/80 text-xs font-semibold ml-1">({routePercent}% Complete)</span>
                      </span>
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
