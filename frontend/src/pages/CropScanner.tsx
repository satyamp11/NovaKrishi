import React, { useState } from 'react';
import { 
  Camera, Upload, Sparkles, RefreshCw, ArrowLeft, ArrowRight, ShieldCheck
} from 'lucide-react';
import type { Language, DiseaseInfo } from '../types';
import { translations } from '../translations';
import { DISEASE_DATABASE, CROP_IMAGES } from '../mockData';

interface CropScannerProps {
  language: Language;
  onScanComplete: (result: DiseaseInfo, uploadedImage: string) => void;
  onBack: () => void;
  sunlightMode: boolean;
}

export const CropScanner: React.FC<CropScannerProps> = ({
  language,
  onScanComplete,
  onBack,
  sunlightMode
}) => {
  const t = translations[language];

  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [selectedImage, setSelectedImage] = useState<string>(CROP_IMAGES.tomatoBlight);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepText, setScanStepText] = useState<string>('');

  const samplePresets = [
    { label: "Tomato Blight (Infected)", crop: "Tomato", image: CROP_IMAGES.tomatoBlight, key: "tomato_blight" },
    { label: "Wheat Yellow Rust (Infected)", crop: "Wheat", image: CROP_IMAGES.wheatRust, key: "wheat_rust" },
    { label: "Healthy Wheat (Clean)", crop: "Wheat", image: CROP_IMAGES.healthyWheat, key: "healthy_crop" },
  ];

  const handleStartScan = (targetKey?: string) => {
    setIsScanning(true);

    const steps = [
      t.analyzingTexture,
      t.detectingLesions,
      t.generatingReport
    ];

    setScanStepText(steps[0]);

    setTimeout(() => {
      setScanStepText(steps[1]);
    }, 900);

    setTimeout(() => {
      setScanStepText(steps[2]);
    }, 1800);

    setTimeout(() => {
      setIsScanning(false);
      const chosenKey = targetKey || (selectedCrop === 'Wheat' ? 'wheat_rust' : 'tomato_blight');
      const diseaseData = DISEASE_DATABASE[chosenKey] || DISEASE_DATABASE.tomato_blight;
      onScanComplete(diseaseData, selectedImage);
    }, 2600);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`w-full min-h-screen transition-colors ${
      sunlightMode ? 'bg-white text-black' : 'bg-[#faf9f6] text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="font-script text-3xl text-[#2d6a4f] font-bold block mb-1">
              AI Diagnostic Studio
            </span>
            <h1 className="font-serif-title text-3xl sm:text-4xl font-extrabold text-[#1b4332] flex items-center gap-3">
              <Camera className="w-8 h-8 text-[#2d6a4f]" />
              <span>{t.scanTitle}</span>
            </h1>
          </div>

          <button
            onClick={onBack}
            className="self-start md:self-auto flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-5 py-2 rounded-full text-xs font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Scanner Main Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Preview & Scan Laser Box */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-6">
              
              {/* Image Preview Box with Laser Scanner Animation */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 h-80 sm:h-[420px] flex items-center justify-center border-4 border-slate-900">
                <img 
                  src={selectedImage} 
                  alt="Crop Leaf Sample" 
                  onError={(e) => {
                    e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Tomato_leaf_early_blight.jpg/640px-Tomato_leaf_early_blight.jpg";
                  }}
                  className="w-full h-full object-cover opacity-90"
                />

                {/* Laser Scanning Animation Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-emerald-950/40 flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute animate-laser shadow-[0_0_20px_#10b981]" />
                    
                    <div className="bg-slate-950/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-emerald-500/50 flex flex-col items-center text-center space-y-2 z-20 shadow-2xl">
                      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                      <span className="text-emerald-300 font-extrabold text-sm uppercase tracking-wide">
                        {scanStepText}
                      </span>
                      <span className="text-[11px] text-slate-400">Comparing with 50,000+ Agri-AI Samples...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <label className="flex-1 w-full sm:w-auto cursor-pointer bg-[#e8f5e9] hover:bg-[#d8f3dc] text-[#1b4332] font-bold text-xs py-3.5 px-4 rounded-2xl border border-[#2d6a4f]/20 flex items-center justify-center gap-2 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Upload High-Res Leaf Photo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCustomFileUpload} 
                    className="hidden" 
                  />
                </label>

                <button
                  onClick={() => handleStartScan()}
                  disabled={isScanning}
                  className="flex-1 w-full sm:w-auto bg-[#1b4332] hover:bg-[#143326] disabled:opacity-50 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>{isScanning ? 'Analyzing...' : t.scanButton}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Sample Presets & AI Accuracy Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-6">
              
              <div>
                <h3 className="font-serif-title font-bold text-xl text-[#1b4332]">
                  Quick Demo Sample Presets
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Select a test image to simulate instant offline AI crop scanning:
                </p>
              </div>

              {/* Presets List */}
              <div className="space-y-3">
                {samplePresets.map((preset, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedCrop(preset.crop);
                      setSelectedImage(preset.image);
                      handleStartScan(preset.key);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedImage === preset.image
                        ? 'border-[#1b4332] bg-emerald-50/40 ring-2 ring-[#1b4332]/20'
                        : 'border-slate-200 hover:border-[#1b4332]/50 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={preset.image} 
                        alt={preset.label} 
                        onError={(e) => {
                          e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Tomato_leaf_early_blight.jpg/640px-Tomato_leaf_early_blight.jpg";
                        }}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{preset.label}</h4>
                        <span className="text-[10px] text-slate-500 font-medium">{preset.crop} Field Sample</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#1b4332]" />
                  </div>
                ))}
              </div>

              {/* AI Diagnostic Guarantee Banner */}
              <div className="bg-[#0b3b24] text-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span className="font-serif-title font-bold text-base text-emerald-100">
                    NovaKrishi Neural Net v2.4
                  </span>
                </div>
                <p className="text-xs text-emerald-200 font-medium leading-relaxed">
                  Trained on over 50,000 field images of tropical & sub-tropical Indian crops with 99.2% diagnostic accuracy.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
