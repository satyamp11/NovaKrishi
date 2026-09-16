import React, { useState, useEffect } from 'react';
import { X, Mail, User, MapPin, Sprout, AlertCircle, RefreshCw, LogIn, UserPlus, ShieldCheck, CheckCircle2, KeyRound, ArrowRight, Lock, Building2, Truck, ShoppingBag, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService, UserRole, RegisterPayload } from '../../services/apiService';
import type { Language } from '../../types';

interface AuthModalProps {
  language: Language;
}

const ALL_INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const AuthModal: React.FC<AuthModalProps> = ({ language }) => {
  const { authModalMode, closeAuthModal, openAuthModal, login, register, sendOtp, verifyOtp } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalMode === 'register' ? 'register' : 'login');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Role Selection (Default: 'farmer')
  const [role, setRole] = useState<UserRole>('farmer');

  useEffect(() => {
    if (authModalMode) {
      setActiveTab(authModalMode);
      setStep('form');
      setErrorMessage(null);
      setSuccessMessage(null);
      setOtp('');
    }
  }, [authModalMode]);

  // Lock background body scroll when AuthModal is open
  useEffect(() => {
    if (!authModalMode) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [authModalMode]);

  // Common Form Fields
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('Gorakhpur');

  // Farmer specific
  const [village, setVillage] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('');
  const [fpoName, setFpoName] = useState('');
  const [landSizeAcres, setLandSizeAcres] = useState('');

  // Consumer specific
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Bulk Buyer specific
  const [organizationName, setOrganizationName] = useState('');
  const [gstin, setGstin] = useState('');
  const [businessType, setBusinessType] = useState<'Wholesaler' | 'Retailer' | 'Processor' | 'Hotel/Restaurant' | 'Exporter' | 'Other'>('Wholesaler');

  // Delivery Partner specific
  const [vehicleType, setVehicleType] = useState<'TwoWheeler' | 'MiniTruck' | 'HeavyTruck' | 'RefrigeratedVan'>('MiniTruck');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [districtsList, setDistrictsList] = useState<string[]>(['Gorakhpur', 'Lucknow', 'Kanpur Nagar', 'Agra', 'Varanasi', 'Prayagraj']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Resend Countdown Timer State
  const [resendTimer, setResendTimer] = useState<number>(45);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, resendTimer]);

  useEffect(() => {
    async function loadDistricts() {
      if (state) {
        const dists = await apiService.getDistricts(state);
        const filtered = dists.filter((d) => d !== 'All');
        setDistrictsList(filtered.length > 0 ? filtered : ['Gorakhpur', 'Lucknow', 'Kanpur Nagar']);
        if (filtered.length > 0 && !filtered.includes(district)) {
          setDistrict(filtered[0]);
        }
      }
    }
    loadDistricts();
  }, [state]);

  if (!authModalMode) return null;

  // Handle Login Submit (Password or OTP trigger)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your registered email address or mobile number.');
      return;
    }

    if (authMethod === 'password') {
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }
      setLoading(true);
      try {
        const res = await login({ emailOrPhone: emailOrPhone.trim(), password });
        if (res.success) {
          setSuccessMessage('Logged in successfully!');
        } else {
          setErrorMessage(res.message || 'Invalid credentials.');
        }
      } catch (err) {
        setErrorMessage('Network error during login.');
      } finally {
        setLoading(false);
      }
    } else {
      // OTP Method
      setLoading(true);
      try {
        const res = await sendOtp(emailOrPhone.trim());
        if (res.success) {
          setStep('otp');
          setSuccessMessage(res.message || 'OTP sent successfully.');
          setResendTimer(45);
          setIsTimerActive(true);
        } else {
          setErrorMessage(res.message || 'Failed to send OTP.');
        }
      } catch (err) {
        setErrorMessage('Network error sending OTP.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters.');
      return;
    }

    if (!emailOrPhone.trim()) {
      setErrorMessage('Valid email address or mobile number is required.');
      return;
    }

    if (authMethod === 'password' && (!password || password.length < 6)) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    // Role-specific client validation
    if (role === 'bulk_buyer' && !organizationName.trim()) {
      setErrorMessage('Organization / Company name is required for Bulk Buyer signup.');
      return;
    }

    if (role === 'delivery_partner' && (!vehicleType || !vehicleNumber.trim())) {
      setErrorMessage('Vehicle type and vehicle registration number are required.');
      return;
    }

    if (role === 'consumer' && !streetAddress.trim() && !city.trim()) {
      setErrorMessage('Street address or city is required for delivery setup.');
      return;
    }

    if (authMethod === 'otp') {
      setLoading(true);
      try {
        const res = await sendOtp(emailOrPhone.trim());
        if (res.success) {
          setStep('otp');
          setSuccessMessage(res.message || 'OTP sent successfully.');
          setResendTimer(45);
          setIsTimerActive(true);
        } else {
          setErrorMessage(res.message || 'Failed to send OTP.');
        }
      } catch (err) {
        setErrorMessage('Network error sending OTP.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Direct Register with Password
    const payload: RegisterPayload = {
      name: name.trim(),
      emailOrPhone: emailOrPhone.trim(),
      password,
      role,
      state,
      district,
      village,
      primaryCrop,
      farmInfo: {
        fpoName,
        landSizeAcres: landSizeAcres ? parseFloat(landSizeAcres) : undefined,
        primaryCrop,
      },
      deliveryAddress: {
        streetAddress,
        city: city || district,
        state,
        pincode,
      },
      businessInfo: {
        organizationName,
        gstin,
        businessType,
      },
      vehicleInfo: {
        vehicleType,
        vehicleNumber,
        licenseNumber,
        operatingDistrict: district,
      },
    };

    setLoading(true);
    try {
      const res = await register(payload);
      if (res.success) {
        setSuccessMessage('Registration successful! Redirecting to role dashboard...');
      } else {
        setErrorMessage(res.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMessage('Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({
        identifier: emailOrPhone.trim(),
        otp: otp.trim(),
        name: activeTab === 'register' ? name.trim() : undefined,
        role: activeTab === 'register' ? role : undefined,
        state: activeTab === 'register' ? state : undefined,
        district: activeTab === 'register' ? district : undefined,
        village: activeTab === 'register' ? village : undefined,
        primaryCrop: activeTab === 'register' ? primaryCrop : undefined,
        farmInfo: { fpoName, primaryCrop },
        deliveryAddress: { streetAddress, city, state, pincode },
        businessInfo: { organizationName, gstin, businessType },
        vehicleInfo: { vehicleType, vehicleNumber, licenseNumber },
      });

      if (res.success) {
        setSuccessMessage('Verified successfully! Redirecting...');
      } else {
        setErrorMessage(res.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setErrorMessage('Network error verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: { id: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'farmer', label: 'Farmer / FPO', icon: <Sprout className="w-4 h-4 text-emerald-600" />, desc: 'Sell produce directly & view AI forecasts' },
    { id: 'consumer', label: 'Consumer', icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />, desc: 'Buy fresh farm produce directly' },
    { id: 'bulk_buyer', label: 'Bulk Buyer', icon: <Building2 className="w-4 h-4 text-emerald-600" />, desc: 'Procure bulk crops for B2B & institutions' },
    { id: 'delivery_partner', label: 'Delivery Partner', icon: <Truck className="w-4 h-4 text-emerald-600" />, desc: 'Provide logistics & optimized delivery' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in overflow-y-auto safe-pb">
      <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#1b4332] p-4 sm:p-6 text-white relative shrink-0">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/logo.png" 
              alt="NovaKrishi Logo" 
              className="w-10 h-10 rounded-full object-cover bg-white shadow-md border border-emerald-600/30 shrink-0" 
            />
            <div>
              <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-widest block">NovaKrishi Platform</span>
              <h3 className="text-xl sm:text-2xl font-black">
                {activeTab === 'login' ? 'Account Sign In' : 'Platform Registration'}
              </h3>
            </div>
          </div>

          {/* Tab Switcher Toolbar */}
          {step === 'form' && (
            <div className="flex bg-[#122e22] p-1 rounded-2xl mt-4 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  openAuthModal('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'login' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  openAuthModal('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'register' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Step 1: Login or Register Form */}
          {step === 'form' && (
            <form onSubmit={activeTab === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
              {/* REGISTER ONLY: Role Selector */}
              {activeTab === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
                    Select Platform Role *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {roleOptions.map((r) => {
                      const isSelected = role === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => setRole(r.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="mt-0.5">{r.icon}</div>
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 block">{r.label}</span>
                            <span className="text-[10px] text-slate-500 line-clamp-1 leading-tight">{r.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Auth Method Selector Toggle */}
              <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMethod('password')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    authMethod === 'password' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('otp')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    authMethod === 'otp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  SMS / Email OTP
                </button>
              </div>

              {/* REGISTER ONLY: Full Name */}
              {activeTab === 'register' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rameshwar Singh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Email / Mobile */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
                  Email Address or 10-Digit Mobile *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210 or user@novakrishi.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Password Field */}
              {authMethod === 'password' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* REGISTER ONLY: Role-Specific Fields */}
              {activeTab === 'register' && (
                <>
                  {/* Farmer Fields */}
                  {role === 'farmer' && (
                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-3">
                      <span className="text-xs font-bold text-emerald-900 block">🧑‍🌾 Farmer / FPO Details</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="State (e.g. Uttar Pradesh)"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="District (e.g. Gorakhpur)"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="FPO Name (Optional)"
                          value={fpoName}
                          onChange={(e) => setFpoName(e.target.value)}
                          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Primary Crop (e.g. Wheat)"
                          value={primaryCrop}
                          onChange={(e) => setPrimaryCrop(e.target.value)}
                          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Consumer Fields */}
                  {role === 'consumer' && (
                    <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl space-y-3">
                      <span className="text-xs font-bold text-blue-900 block">🛒 Consumer Delivery Address</span>
                      <input
                        type="text"
                        placeholder="Street Address / House No."
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Bulk Buyer Fields */}
                  {role === 'bulk_buyer' && (
                    <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl space-y-3">
                      <span className="text-xs font-bold text-amber-900 block">🏬 Organization / Business Info</span>
                      <input
                        type="text"
                        required
                        placeholder="Company / Organization Name *"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="GSTIN Number (Optional)"
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value)}
                          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value as any)}
                          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                        >
                          <option value="Wholesaler">Wholesaler</option>
                          <option value="Retailer">Retailer</option>
                          <option value="Processor">Food Processor</option>
                          <option value="Hotel/Restaurant">Hotel / Restaurant</option>
                          <option value="Exporter">Exporter</option>
                          <option value="Other">Other B2B</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Delivery Partner Fields */}
                  {role === 'delivery_partner' && (
                    <div className="p-3.5 bg-stone-100 border border-stone-200 rounded-xl space-y-3">
                      <span className="text-xs font-bold text-stone-900 block">🚚 Vehicle & Logistics Information</span>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value as any)}
                          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                        >
                          <option value="MiniTruck">Mini Truck (Bolero / Pickup)</option>
                          <option value="HeavyTruck">Heavy Commercial Truck</option>
                          <option value="RefrigeratedVan">Refrigerated Van</option>
                          <option value="TwoWheeler">Two Wheeler (Local Delivery)</option>
                        </select>
                        <input
                          type="text"
                          required
                          placeholder="Vehicle Reg No (e.g. UP53AB1234) *"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Driver License Number"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Sign In to Account' : `Register as ${role.replace('_', ' ').toUpperCase()}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter 6-digit OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                    ENTER 6-DIGIT OTP CODE *
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Sent to: {emailOrPhone}
                  </span>
                </div>

                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-12 pl-12 pr-4 text-center tracking-[0.4em] font-black text-xl bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Verify OTP & Authenticate</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Change Contact Details
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
