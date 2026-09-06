import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  ShieldCheck,
  XCircle,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Zap,
  Sparkles,
} from 'lucide-react';
import {
  Navbar,
  Footer,
  Button,
  Badge,
  Card,
  LoadingState,
  EmptyState,
  ErrorState,
  useToast,
} from '../components/ui';
import { CheckoutSummaryCard, EscrowStatus } from '../components/checkout/CheckoutSummaryCard';
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout';
import { apiService, OrderItem, OrderStatus, ExtendedPaymentState } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { ReliabilityBadge } from '../components/ui/ReliabilityBadge';
import { ReviewModal } from '../components/ReviewModal';
import { DisputeForm } from '../components/DisputeForm';
import { DisputeType } from '../types';

export interface OrdersPageProps {
  onNavigateTab?: (tab: string) => void;
}

const ORDER_STATUS_STEPS: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'PENDING', label: 'Order Placed', icon: Clock },
  { status: 'CONFIRMED', label: 'Farmer Confirmed', icon: CheckCircle2 },
  { status: 'PACKED', label: 'Produce Packed', icon: Package },
  { status: 'PICKED_UP', label: 'Picked Up', icon: Truck },
  { status: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: MapPin },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigateTab = () => {} }) => {
  const { user, token, openAuthModal } = useAuth();
  const toast = useToast();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Reliability & Disputes State
  const [counterparty, setCounterparty] = useState<any | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const { initiatePayment, isProcessing } = useRazorpayCheckout({
    onSuccess: () => {
      fetchOrders();
    },
    onPaymentHeld: () => {
      fetchOrders();
    }
  });

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getUserOrders(token);
      if (res.success) {
        setOrders(res.orders);
        if (res.orders.length > 0) {
          setSelectedOrderId(prev => {
            if (!prev || !res.orders.find(o => o.id === prev)) {
              return res.orders[0].id;
            }
            return prev;
          });
        } else {
          setSelectedOrderId(null);
        }
      } else {
        setError(res.message || 'Failed to fetch orders.');
      }
    } catch (err) {
      setError('Network error fetching orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchCounterparty = async () => {
      if (!selectedOrderId || !user) return;
      const order = orders.find(o => o.id === selectedOrderId);
      if (!order) return;
      
      const counterpartyId = user.id === order.buyer.id ? order.seller.id : order.buyer.id;
      const res = await apiService.getUserProfile(counterpartyId);
      if (res.success && res.user) {
        setCounterparty(res.user);
      } else {
        setCounterparty(null);
      }
    };
    fetchCounterparty();
  }, [selectedOrderId, orders, user]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      const res = await apiService.updateOrderStatus(token, orderId, newStatus);
      if (res.success) {
        toast.success('Status Updated', `Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error('Update Failed', res.message || 'Unable to update status.');
      }
    } catch (err) {
      toast.error('Error', 'Network error updating order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReleaseEscrow = async (orderId: string) => {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      const res = await apiService.releaseEscrow(token, orderId);
      if (res.success) {
        toast.success('Escrow Released!', res.message || 'Funds released directly to Farmer bank account.');
        fetchOrders();
      } else {
        toast.error('Escrow Release Failed', res.message || 'Unable to release escrow.');
      }
    } catch (err) {
      toast.error('Error', 'Network error releasing escrow.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be returned to the farmer.')) return;

    setUpdatingId(orderId);
    try {
      const res = await apiService.updateOrderStatus(token, orderId, 'CANCELLED', 'Order cancelled by buyer.');
      if (res.success) {
        toast.info('Order Cancelled', 'Order cancelled and stock restored to farmer.');
        fetchOrders();
      } else {
        toast.error('Cancellation Failed', res.message || 'Unable to cancel order.');
      }
    } catch (err) {
      toast.error('Error', 'Network error cancelling order.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string, tags: string[]) => {
    if (!token || !selectedOrderId || !counterparty) return;
    setIsSubmittingFeedback(true);
    try {
      const res = await apiService.createReview({
        orderId: selectedOrderId,
        revieweeId: counterparty.id || counterparty._id,
        rating,
        comment,
        tags
      });
      if (res.success) {
        toast.success('Review Submitted', 'Thank you for your feedback!');
        setIsReviewOpen(false);
      } else {
        toast.error('Error', res.message || 'Failed to submit review');
      }
    } catch (err) {
      toast.error('Error', 'Network error submitting review.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleDisputeSubmit = async (type: DisputeType, description: string, evidenceUrls: string[]) => {
    if (!token || !selectedOrderId || !counterparty) return;
    setIsSubmittingFeedback(true);
    try {
      const res = await apiService.createDispute({
        orderId: selectedOrderId,
        raisedAgainst: counterparty.id || counterparty._id,
        type,
        description,
        evidenceUrls
      });
      if (res.success) {
        toast.success('Dispute Raised', 'Admin has been notified and escrow is locked.');
        setIsDisputeOpen(false);
      } else {
        toast.error('Error', res.message || 'Failed to raise dispute');
      }
    } catch (err) {
      toast.error('Error', 'Network error raising dispute.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Navbar activeTab="orders" onNavigate={onNavigateTab} user={user} onOpenAuth={openAuthModal} />
        <main className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 flex-1">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Authentication Required</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please sign in to view your direct agricultural orders and escrow status.
          </p>
          <Button variant="primary" size="md" onClick={() => openAuthModal('login')}>
            Sign In / Register
          </Button>
        </main>
        <Footer onNavigate={onNavigateTab} />
      </div>
    );
  }

  const isFarmer = user.role === 'farmer' || user.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar activeTab="orders" onNavigate={onNavigateTab} user={user} onOpenAuth={openAuthModal} />

      {/* Header Banner */}
      <section className="bg-slate-950 text-white py-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="primary" size="sm">
                  Phase 6: Transparent Pricing & Escrow Architecture
                </Badge>
                <Badge variant="earth" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}>
                  Dynamic Price Allocation
                </Badge>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                {isFarmer ? 'Received Producer Orders' : 'Your Produce Direct Orders'}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Track direct agricultural shipments, transparent price breakdown, and escrow release status.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-white border-slate-700 hover:bg-slate-800"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchOrders}
            >
              Refresh Orders
            </Button>
          </div>
        </div>
      </section>

      {/* Orders List & Detail View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {loading && <LoadingState message="Fetching direct trade orders from database..." />}

        {error && !loading && <ErrorState title="Orders Error" message={error} onRetry={fetchOrders} />}

        {!loading && !error && orders.length === 0 && (
          <EmptyState
            title="No Orders Found"
            description="You have no active or completed direct trade orders."
            actionLabel="Explore Produce Marketplace"
            onAction={() => onNavigateTab('marketplace')}
          />
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Master List Column */}
            <div className="w-full lg:w-1/3 space-y-3 relative lg:sticky lg:top-32">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1 mb-2">
                <span>{orders.length} Order(s)</span>
                <span>{user.name}</span>
              </div>
              
              <div className="flex flex-col gap-3 max-h-[360px] lg:max-h-[800px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin">
                {orders.map((listOrd) => {
                  const isSelected = selectedOrderId === listOrd.id;
                  const isCancelledList = listOrd.orderStatus === 'CANCELLED';
                  return (
                    <button
                      key={listOrd.id}
                      onClick={() => setSelectedOrderId(listOrd.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500' 
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-black text-sm ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                          {listOrd.orderNumber}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          ₹{listOrd.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 mt-1">
                        <span className="text-xs text-slate-500 line-clamp-1">
                          {listOrd.items.map(i => i.title).join(', ')}
                        </span>
                        <div className="flex gap-2 flex-wrap mt-1">
                          <Badge variant={isCancelledList ? 'danger' : listOrd.orderStatus === 'DELIVERED' ? 'success' : 'warning'} size="sm">
                            {listOrd.orderStatus.replace('_', ' ')}
                          </Badge>
                          <Badge variant={listOrd.paymentStatus === 'RELEASED' ? 'success' : listOrd.paymentStatus === 'HELD_FOR_ORDER' ? 'warning' : listOrd.paymentStatus === 'REFUNDED' ? 'danger' : 'earth'} size="sm">
                            Escrow: {listOrd.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail View Column */}
            <div className="w-full lg:w-2/3">
              {(() => {
                const ord = orders.find(o => o.id === selectedOrderId);
                if (!ord) return null;

                const currentStepIndex = ORDER_STATUS_STEPS.findIndex((s) => s.status === ord.orderStatus);
                const isCancelled = ord.orderStatus === 'CANCELLED';
                const breakdown = ord.priceBreakdown || {
                  consumerTotal: ord.totalAmount,
                  farmerEarnings: Math.round(ord.subtotalAmount * 0.82),
                  logisticsCost: ord.logisticsFee + Math.round(ord.subtotalAmount * 0.11),
                  platformFee: Math.round(ord.subtotalAmount * 0.07),
                  intermediarySavings: Math.round(ord.subtotalAmount * 0.35),
                };
                const isBuyer = user.id === ord.buyer.id;

                return (
                <div key={ord.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  {/* Order Header Bar */}
                  <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 text-sm tracking-tight">{ord.orderNumber}</span>
                        <Badge
                          variant={
                            isCancelled
                              ? 'danger'
                              : ord.orderStatus === 'DELIVERED'
                              ? 'success'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {ord.orderStatus.replace('_', ' ')}
                        </Badge>

                        <Badge
                          variant={
                            ord.paymentStatus === 'RELEASED'
                              ? 'success'
                              : ord.paymentStatus === 'HELD_FOR_ORDER'
                              ? 'warning'
                              : ord.paymentStatus === 'REFUNDED'
                              ? 'danger'
                              : 'earth'
                          }
                          size="sm"
                          icon={<ShieldCheck className="w-3.5 h-3.5" />}
                        >
                          Escrow: {ord.paymentStatus}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Placed on {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Confirm Delivery & Release Escrow Action */}
                      {ord.orderStatus === 'DELIVERED' && ord.paymentStatus !== 'RELEASED' && (
                        <Button
                          variant="primary"
                          size="xs"
                          leftIcon={<Zap className="w-3.5 h-3.5 fill-white" />}
                          isLoading={updatingId === ord.id}
                          onClick={() => handleReleaseEscrow(ord.id)}
                        >
                          Confirm Delivery & Release Escrow to Farmer
                        </Button>
                      )}

                      {/* Farmer / Admin Status Control */}
                      {(user.role === 'farmer' || user.role === 'admin' || user.role === 'delivery_partner') && !isCancelled && ord.orderStatus !== 'DELIVERED' && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-600">Update Status:</span>
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                            disabled={updatingId === ord.id}
                            className="bg-white border border-slate-300 rounded-xl text-xs font-bold px-2.5 py-1 focus:ring-2 focus:ring-emerald-600"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PACKED">PACKED</option>
                            <option value="PICKED_UP">PICKED_UP</option>
                            <option value="IN_TRANSIT">IN_TRANSIT</option>
                            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                          </select>
                        </div>
                      )}

                      {/* Cancel Order Button */}
                      {(ord.orderStatus === 'PENDING' || ord.orderStatus === 'CONFIRMED') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleCancelOrder(ord.id)}
                          isLoading={updatingId === ord.id}
                        >
                          Cancel Order
                        </Button>
                      )}

                      {/* Review and Dispute Buttons */}
                      {!isCancelled && (
                        <div className="flex gap-2 border-l border-slate-200 pl-2 ml-1">
                          {ord.orderStatus === 'DELIVERED' && (
                            <Button variant="outline" size="xs" onClick={() => setIsReviewOpen(true)}>
                              Leave Review
                            </Button>
                          )}
                          <Button variant="ghost" size="xs" className="text-red-600 hover:bg-red-50" onClick={() => setIsDisputeOpen(true)}>
                            Raise Dispute
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clean Order Status Progress Timeline */}
                  {!isCancelled ? (
                    <div className="p-3.5 sm:p-6 bg-slate-50/50 border-b border-slate-100">
                      <div className="flex items-center justify-between overflow-x-auto py-2 scrollbar-none touch-pan-x">
                        {ORDER_STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStepIndex;
                          const isCurrent = idx === currentStepIndex;
                          const StepIcon = step.icon;

                          return (
                            <div key={step.status} className="flex items-center space-x-2 shrink-0 pr-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                  isCurrent
                                    ? 'bg-emerald-700 text-white ring-4 ring-emerald-100 shadow-xs'
                                    : isDone
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                <StepIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <span
                                  className={`text-xs block font-bold whitespace-nowrap ${
                                    isCurrent
                                      ? 'text-emerald-800'
                                      : isDone
                                      ? 'text-slate-800'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                              {idx < ORDER_STATUS_STEPS.length - 1 && (
                                <div className={`h-0.5 w-6 sm:w-10 ${idx < currentStepIndex ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border-b border-red-100 text-red-800 text-xs font-bold flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>This order was cancelled. Stock has been restored to the producer's inventory.</span>
                    </div>
                  )}

                  {/* Order Details & Price Breakdown Body */}
                  <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Items List & Parties */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Order Items</h4>
                        {ord.items.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=500&q=80'}
                                alt={item.title}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-200 shrink-0"
                              />
                              <div>
                                <h5 className="font-bold text-slate-900 text-xs">{item.title}</h5>
                                <p className="text-[11px] text-slate-500">
                                  ₹{item.pricePerUnit} × {item.quantity} {item.unit}
                                </p>
                              </div>
                            </div>
                            <span className="font-black text-slate-900 text-xs">₹{item.subtotal.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Buyer & Seller Info Summary */}
                      <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Buyer Details</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="font-bold text-slate-900">{ord.buyer.name}</p>
                            {!isBuyer && counterparty && counterparty.id === ord.buyer.id && (
                              <ReliabilityBadge metrics={counterparty.reliability} />
                            )}
                          </div>
                          <p className="text-slate-500 truncate">{ord.buyer.emailOrPhone}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Farmer / FPO</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="font-bold text-slate-900">{ord.seller.fpoName || ord.seller.name}</p>
                            {isBuyer && counterparty && counterparty.id === ord.seller.id && (
                              <ReliabilityBadge metrics={counterparty.reliability} />
                            )}
                          </div>
                          <p className="text-slate-500">{ord.seller.district}, {ord.seller.state}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Dynamic Price Breakdown Component */}
                    <div className="lg:col-span-5 space-y-4">
                      <CheckoutSummaryCard
                        orderId={ord.id}
                        amount={ord.totalAmount}
                        priceBreakdown={{
                          consumerTotal: breakdown.consumerTotal,
                          farmerEarnings: breakdown.farmerEarnings,
                          logisticsCost: breakdown.logisticsCost,
                          platformFee: breakdown.platformFee,
                          intermediarySavings: breakdown.intermediarySavings,
                        }}
                        escrowStatus={ord.paymentStatus as EscrowStatus}
                        onPay={() => initiatePayment(ord.id)}
                        isLoading={isProcessing}
                        showPayButton={isBuyer}
                        isBuyer={isBuyer}
                      />
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
            
          </div>
        )}
      </main>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingFeedback}
      />

      <DisputeForm
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        onSubmit={handleDisputeSubmit}
        isSubmitting={isSubmittingFeedback}
      />

      <Footer onNavigate={onNavigateTab} />
    </div>
  );
};
