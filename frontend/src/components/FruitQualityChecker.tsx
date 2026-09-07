import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, AlertTriangle, RefreshCw, Loader2, Info, CheckCircle2, XCircle, Leaf } from 'lucide-react';
import { apiService } from '../services/apiService';
import type { FruitQualityPrediction } from '../types';

// ─── Quality colour config ────────────────────────────────────────────────────

const QUALITY_CONFIG: Record<string, {
  bg: string; border: string; text: string; badgeCls: string; icon: React.ReactNode; label: string;
}> = {
  Good: {
    bg:       'bg-emerald-50',
    border:   'border-emerald-300',
    text:     'text-emerald-800',
    badgeCls: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    icon:     <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
    label:    'Good Quality',
  },
  Bad: {
    bg:       'bg-red-50',
    border:   'border-red-300',
    text:     'text-red-800',
    badgeCls: 'bg-red-100 text-red-800 border border-red-300',
    icon:     <XCircle className="w-6 h-6 text-red-500" />,
    label:    'Poor Quality',
  },
  Average: {
    bg:       'bg-amber-50',
    border:   'border-amber-300',
    text:     'text-amber-800',
    badgeCls: 'bg-amber-100 text-amber-800 border border-amber-300',
    icon:     <Info className="w-6 h-6 text-amber-500" />,
    label:    'Average Quality',
  },
};
const DEFAULT_CFG = QUALITY_CONFIG['Average'];

// ─── Confidence Bar ───────────────────────────────────────────────────────────

function ConfidenceBar({
  label, value, barColor
}: { label: string; value: number; barColor: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ result }: { result: FruitQualityPrediction }) {
  const cfg = QUALITY_CONFIG[result.quality] ?? DEFAULT_CFG;
  const productBarColor =
    result.product_confidence >= 80 ? 'bg-emerald-500'
    : result.product_confidence >= 50 ? 'bg-amber-400'
    : 'bg-red-400';
  const qualityBarColor =
    result.quality === 'Good' ? 'bg-emerald-500'
    : result.quality === 'Bad' ? 'bg-red-400'
    : 'bg-amber-400';

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {cfg.icon}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Detected Produce</p>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">{result.product}</h3>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${cfg.badgeCls}`}>
          {cfg.label}
        </span>
      </div>

      <hr className="border-gray-200" />

      {/* Confidence Bars */}
      <div className="space-y-3">
        <ConfidenceBar label="Product Confidence" value={result.product_confidence} barColor={productBarColor} />
        <ConfidenceBar label="Quality Confidence" value={result.quality_confidence} barColor={qualityBarColor} />
      </div>

      {/* Advisory */}
      <div className={`text-xs ${cfg.text} font-medium bg-white/60 rounded-xl px-4 py-2.5 leading-relaxed`}>
        {result.quality === 'Good'
          ? `✅ This ${result.product} is classified as fresh and market-ready with ${result.quality_confidence.toFixed(0)}% confidence.`
          : result.quality === 'Bad'
          ? `⚠️ This ${result.product} shows signs of poor quality. Consider re-inspection before listing on marketplace.`
          : `ℹ️ This ${result.product} is of average quality. Manual inspection recommended before pricing.`}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const FruitQualityChecker: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl,    setPreviewUrl]    = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [serviceDown,   setServiceDown]   = useState(false);
  const [result,        setResult]        = useState<FruitQualityPrediction | null>(null);
  const [error,         setError]         = useState<{ message: string; retryable: boolean } | null>(null);

  // Proactive health check on mount
  useEffect(() => {
    apiService.checkQualityServiceHealth().then(({ healthy }) => {
      if (!healthy) setServiceDown(true);
    });
  }, []);

  const handleImageSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError({ message: 'Please upload a valid image (JPEG, PNG, or WebP).', retryable: false });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError({ message: 'File is too large (max 8MB).', retryable: false });
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClassify = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);
    try {
      const prediction = await apiService.classifyFruitImage(selectedImage);
      setResult(prediction);
    } catch (err: unknown) {
      const e = err as { message?: string; retryable?: boolean };
      setError({
        message:   e.message   ?? 'Quality check unavailable, please try again.',
        retryable: e.retryable ?? false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 mb-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black">AI Fruit Quality Check</h2>
        </div>
        <p className="text-sm text-emerald-100 leading-relaxed">
          Upload a photo of your produce to instantly detect the fruit type and grade its quality using computer vision.
        </p>
      </div>

      {/* Service waking-up banner */}
      {serviceDown && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl flex gap-2.5 text-sm">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p><span className="font-semibold">AI service is waking up</span> — first analysis may take 15–20 seconds.</p>
        </div>
      )}

      {/* Upload zone */}
      {!selectedImage && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-base font-semibold text-gray-800">Upload Fruit Photo</p>
          <p className="text-sm text-gray-500 mt-1">Drag & drop or click — JPEG, PNG, WebP (max 8MB)</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
          />
        </div>
      )}

      {/* Preview + actions */}
      {selectedImage && previewUrl && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
            <img src={previewUrl} alt="Selected produce" className="w-full max-h-64 object-contain" />
            {!loading && !result && (
              <button
                onClick={clearSelection}
                className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full shadow hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error.message}</p>
                {error.retryable && (
                  <p className="mt-1 opacity-80">The AI service is waking up. Please wait ~30s and try again.</p>
                )}
              </div>
            </div>
          )}

          {/* Analyze button */}
          {!result && (
            <button
              onClick={handleClassify}
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Quality...
                </>
              ) : (
                <>
                  <Leaf className="w-5 h-5" />
                  Analyze Quality
                </>
              )}
            </button>
          )}

          {/* Result */}
          {result && (
            <>
              <ResultCard result={result} />
              <button
                onClick={clearSelection}
                className="w-full py-3 rounded-xl font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Test Another Image
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
