import React, { useState, useEffect } from 'react';
import { Smartphone, Lock, CheckCircle2, User, Sprout, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import type { Language, FarmerProfile } from '../types';
import { translations } from '../translations';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  language: Language;
  onLoginComplete: (profile: FarmerProfile) => void;
  sunlightMode: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  language,
  onLoginComplete,
  sunlightMode
}) => {
  const t = translations[language];
  const { sendOtp, verifyOtp } = useAuth();
  
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('Rajesh Kumar');
  const [village, setVillage] = useState('Kheri Sadh');
  const [district, setDistrict] = useState('Rohtak');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Tomato', 'Wheat']);
  const [gpsPermission, setGpsPermission] = useState(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 45s Cooldown timer
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

  const availableCrops = ['Tomato', 'Wheat', 'Potato', 'Cotton', 'Rice', 'Mustard'];

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter(c => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!phone || phone.trim().length < 5) {
      setErrorMessage(language === 'hi' ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें' : 'Please enter a valid mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(phone.trim());
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
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!otp || otp.trim().length !== 6) {
      setErrorMessage(language === 'hi' ? 'कृपया 6 अंकों का OTP दर्ज करें' : 'Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({
        identifier: phone.trim(),
        otp: otp.trim(),
        name,
        district,
        village,
        primaryCrop: selectedCrops.join(', ')
      });

      if (res.success) {
        setSuccessMessage('Verified successfully!');
        setTimeout(() => {
          setStep('profile');
        }, 500);
      } else {
        setErrorMessage(res.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setErrorMessage('Error verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isTimerActive) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await sendOtp(phone.trim());
      if (res.success) {
        setSuccessMessage('New OTP sent successfully.');
        setResendTimer(45);
        setIsTimerActive(true);
      } else {
        setErrorMessage(res.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setErrorMessage('Error resending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginComplete({
      name,
      phone,
      village,
      district,
      state: "Haryana",
      mainCrops: selectedCrops,
      locationPermission: gpsPermission,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    });
  };

  return (
    <div className={`w-full min-h-screen flex items-center justify-center p-4 sm:p-8 transition-colors ${
      sunlightMode ? 'bg-white text-black' : 'bg-[#faf9f6] text-slate-900'
    }`}>
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img 
            src="/logo.png" 
            alt="NovaKrishi Logo" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="w-24 h-24 object-cover rounded-full mx-auto shadow-md border-2 border-emerald-600/30"
          />
          <h1 className="font-serif-title font-extrabold text-3xl text-[#1b4332]">
            {step === 'profile' ? t.profileTitle : t.loginTitle}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {step === 'profile' ? 'Setup your farm details for spatial alerts' : t.loginSub}
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Enter Phone Number */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="relative">
                <Smartphone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1b4332] hover:bg-[#143326] text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>{t.getOtp}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter 6-digit OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider">
                  Enter 6-Digit OTP Code
                </label>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  +91 {phone}
                </span>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3.5 pl-12 pr-4 font-black text-slate-900 text-center tracking-[0.4em] text-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1b4332] hover:bg-[#143326] text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <span>{t.verifyLogin}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                Change Phone Number
              </button>

              <button
                type="button"
                disabled={isTimerActive || loading}
                onClick={handleResendOtp}
                className={`font-black ${
                  isTimerActive ? 'text-slate-400 cursor-not-allowed' : 'text-emerald-700 hover:underline'
                }`}
              >
                {isTimerActive ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Farmer Profile Setup */}
        {step === 'profile' && (
          <form onSubmit={handleCompleteSetup} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider">
                {t.farmerName}
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider">
                  {t.village}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider">
                  {t.district}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  required
                />
              </div>
            </div>

            {/* Crops Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider flex items-center gap-1">
                <Sprout className="w-4 h-4 text-[#2d6a4f]" />
                <span>{t.selectCrops}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCrops.map((crop) => {
                  const isSelected = selectedCrops.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleCrop(crop)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-[#1b4332] text-white border-[#1b4332]'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {crop} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GPS Switch */}
            <div className="bg-[#e8f5e9] p-4 rounded-2xl border border-[#2d6a4f]/20 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#1b4332] text-xs">{t.enableGps}</h4>
                <p className="text-[11px] text-slate-600 font-medium">{t.gpsDesc}</p>
              </div>
              <button
                type="button"
                onClick={() => setGpsPermission(!gpsPermission)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  gpsPermission ? 'bg-[#1b4332]' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  gpsPermission ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#1b4332] hover:bg-[#143326] text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <span>{t.startApp}</span>
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
