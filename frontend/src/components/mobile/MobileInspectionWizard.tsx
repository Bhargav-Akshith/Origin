import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  ChevronRight, 
  X, 
  ShieldCheck, 
  Tag, 
  Calendar, 
  MapPin, 
  Info
} from 'lucide-react';
import type { DemoSkuPreset } from '../../types';
import { CameraScannerModal } from '../CameraScannerModal';

interface StagedPhoto {
  file: File;
  previewUrl: string;
  angleLabel: string;
  stepName: string;
}

interface MobileInspectionWizardProps {
  demoSkus: DemoSkuPreset[];
  onSelectDemo: (demoId: string) => void;
  onSubmitInspection: (files: File[], productName: string, category: string) => void;
  isLoading: boolean;
  selectedScanId?: string;
  lang?: 'en' | 'hi';
}

export const MobileInspectionWizard: React.FC<MobileInspectionWizardProps> = ({
  demoSkus,
  onSelectDemo,
  onSubmitInspection,
  isLoading,
  selectedScanId,
  lang = 'en'
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Packaged Food, Edible Oils & Confectionery');
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showBenchmarkDrawer, setShowBenchmarkDrawer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stepConfigs = [
    {
      id: 'front',
      stepNum: 1,
      name: 'Front Principal Display',
      badge: 'Mandatory',
      themeColor: 'blue',
      headerBg: 'from-blue-700 to-indigo-900',
      btnBg: 'from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600',
      icon: <Tag className="w-5 h-5 text-cyan-300" />,
      targetFields: ['Generic Commodity Name', 'Brand / Trademark', 'Net Quantity (g / kg / ml / L)'],
      legalClauses: 'Rule 6(1)(b) & Rule 6(1)(c) • Principal Display Panel',
      diagramDesc: 'Center the front face with the primary Brand Name and Net Quantity SI metric units in frame.',
      capturePrompt: 'Capture Front Display Panel'
    },
    {
      id: 'back',
      stepNum: 2,
      name: 'Rear Declaration & MRP Panel',
      badge: 'Mandatory',
      themeColor: 'amber',
      headerBg: 'from-amber-700 to-orange-900',
      btnBg: 'from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600',
      icon: <Calendar className="w-5 h-5 text-amber-300" />,
      targetFields: ['Maximum Retail Price (MRP incl. taxes)', 'Unit Sale Price (USP)', 'Month & Year of Packing', 'Best Before / Expiry'],
      legalClauses: 'Rule 6(1)(d) & Rule 6(1)(e) • Retail Pricing & Dates',
      diagramDesc: 'Align the statutory back panel containing MRP box, tax inclusions, packing date, and batch code.',
      capturePrompt: 'Capture Rear Declarations & MRP Panel'
    },
    {
      id: 'side',
      stepNum: 3,
      name: 'Side Panel & Origin Statement',
      badge: 'Recommended',
      themeColor: 'purple',
      headerBg: 'from-purple-800 to-slate-900',
      btnBg: 'from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600',
      icon: <MapPin className="w-5 h-5 text-purple-300" />,
      targetFields: ['Manufacturer / Packer Address', 'Country of Origin', 'Consumer Care Officer Contact', 'FSSAI / Barcode'],
      legalClauses: 'Rule 6(1)(a), Rule 6(1)(f) & Rule 6(10) • Origin & Redressal',
      diagramDesc: 'Photograph the side panel with manufacturer details, origin country, and consumer grievance contact.',
      capturePrompt: 'Capture Side / Origin Panel'
    },
    {
      id: 'finalize',
      stepNum: 4,
      name: 'Multi-Panel Evidence Fusion',
      badge: 'Final Verification',
      themeColor: 'emerald',
      headerBg: 'from-emerald-800 to-teal-950',
      btnBg: 'from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-300" />,
      targetFields: ['All 8 Statutory LMPC Declarations', 'Cross-Panel Verification', 'Automated Legal Adjudication'],
      legalClauses: 'Legal Metrology (Packaged Commodities) Rules, 2011 Enforcement',
      diagramDesc: 'Review all staged packaging angles, confirm product category, and execute the AI decision engine.',
      capturePrompt: 'Execute LMPC Compliance Audit'
    }
  ];

  const currentConfig = stepConfigs[currentStep];
  const photoForCurrentStep = stagedPhotos.find((p) => p.stepName === currentConfig.id);

  const handleCapturePhoto = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    
    const newPhoto: StagedPhoto = {
      file,
      previewUrl,
      angleLabel: `Angle ${stagedPhotos.length + 1}: ${currentConfig.name}`,
      stepName: currentConfig.id
    };

    setStagedPhotos((prev) => {
      const filtered = prev.filter((p) => p.stepName !== currentConfig.id);
      return [...filtered, newPhoto];
    });

    if (!productName.trim()) {
      setProductName(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleCapturePhoto(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (stepId: string) => {
    setStagedPhotos((prev) => {
      const found = prev.find((p) => p.stepName === stepId);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((p) => p.stepName !== stepId);
    });
  };

  const handleFinalSubmit = () => {
    if (stagedPhotos.length === 0) return;
    const name = productName.trim() || 'Mobile Packaged Commodity';
    const files = stagedPhotos.map((p) => p.file);
    onSubmitInspection(files, name, category);
  };

  return (
    <div className="space-y-3.5 select-none">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Camera Modal */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          handleCapturePhoto(file);
          setIsCameraOpen(false);
        }}
        lang={lang}
      />

      {/* Step Navigation Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase text-slate-800 tracking-wider">
            Step-by-Step Packaging Capture
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Step {currentStep + 1} of 4: {currentConfig.name}
          </span>
        </div>

        {/* 4 Distinct Step Tabs with Status & Color Indicators */}
        <div className="grid grid-cols-4 gap-1.5">
          {stepConfigs.map((s, idx) => {
            const hasPhoto = stagedPhotos.some((p) => p.stepName === s.id);
            const isCurrent = currentStep === idx;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5 ${
                  isCurrent
                    ? 'bg-[#0F2942] text-amber-300 border-[#0F2942] font-black shadow-md scale-102 ring-2 ring-blue-500/30'
                    : hasPhoto
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                    : 'bg-slate-100 text-slate-500 border-slate-200 font-medium'
                }`}
              >
                <div className="text-[10px] flex items-center gap-1 font-bold">
                  {hasPhoto ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <span>P{s.stepNum}</span>
                  )}
                  <span className="truncate">{s.stepNum === 1 ? 'Front' : s.stepNum === 2 ? 'Back' : s.stepNum === 3 ? 'Side' : 'Audit'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Card with Dynamic Color & Panel Targets */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Dynamic Step Header */}
        <div className={`p-4 text-white bg-gradient-to-r ${currentConfig.headerBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm border border-white/20">
                {currentConfig.icon}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-200">
                  Angle {currentConfig.stepNum} of 3
                </span>
                <h3 className="text-sm font-black tracking-tight leading-tight text-white">
                  {currentConfig.name}
                </h3>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30">
              {currentConfig.badge}
            </span>
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/20 text-[11px] text-slate-200 font-mono">
            {currentConfig.legalClauses}
          </div>
        </div>

        {/* Step Body */}
        <div className="p-4 space-y-4">
          {/* Target Declarations checklist for this specific panel */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <Info className="w-3 h-3 text-blue-600" />
              <span>Statutory Targets for this Angle:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
              {currentConfig.targetFields.map((field, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <span>{field}</span>
                </div>
              ))}
            </div>
          </div>

          {/* If step 0-2: Photo capture or preview */}
          {currentStep < 3 ? (
            <div>
              {photoForCurrentStep ? (
                <div className="space-y-3">
                  {/* Photo Preview Card */}
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 aspect-video bg-black flex items-center justify-center shadow-md">
                    <img
                      src={photoForCurrentStep.previewUrl}
                      alt={photoForCurrentStep.angleLabel}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-500/50 shadow">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{currentConfig.name} Staged</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(currentConfig.id)}
                      className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1.5 shadow-lg cursor-pointer transition-colors"
                      title="Remove Photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-blue-700" />
                      <span>Retake Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="bg-[#0F2942] hover:bg-[#1E3A8A] text-amber-300 font-bold text-xs py-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Next Panel</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Primary Camera Button styled specifically for this panel */}
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r ${currentConfig.btnBg} text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98`}
                  >
                    <Camera className="w-6 h-6 text-amber-300" />
                    <span>{currentConfig.capturePrompt}</span>
                    <span className="text-[10px] text-white/80 font-normal">
                      Align packaging text inside camera reticle
                    </span>
                  </button>

                  {/* Choose from Gallery */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl border border-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-600" />
                    <span>Choose {currentConfig.name} from Gallery</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Step 4: Finalize & Run Audit */
            <div className="space-y-4">
              {/* Product Metadata Inputs */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Commodity / Brand Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Britannia Good Day Butter Cookies"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Statutory Regulatory Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none text-slate-800"
                  >
                    <option value="Packaged Food, Edible Oils & Confectionery">
                      Packaged Food, Edible Oils & Confectionery
                    </option>
                    <option value="Cosmetics, Soaps & Personal Hygiene">
                      Cosmetics, Soaps & Personal Hygiene
                    </option>
                    <option value="Pharmaceuticals & Nutrition Pre-packs">
                      Pharmaceuticals & Nutrition Pre-packs
                    </option>
                    <option value="Household Detergents & Chemical Commodities">
                      Household Detergents & Chemical Commodities
                    </option>
                    <option value="Electronics, Cables & Domestic Appliances">
                      Electronics, Cables & Domestic Appliances
                    </option>
                    <option value="General Consumer Commodities & Textiles">
                      General Consumer Commodities & Textiles
                    </option>
                  </select>
                </div>
              </div>

              {/* Staged Angles Visual Matrix */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
                  <span>Staged Packaging Angles ({stagedPhotos.length}/3):</span>
                  <span className={stagedPhotos.length >= 2 ? 'text-emerald-700' : 'text-amber-700'}>
                    {stagedPhotos.length >= 2 ? '✓ Ready for Multi-OCR Fusion' : '⚠ 1 photo staged'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {stepConfigs.slice(0, 3).map((cfg, idx) => {
                    const photo = stagedPhotos.find((p) => p.stepName === cfg.id);

                    return (
                      <div
                        key={cfg.id}
                        onClick={() => setCurrentStep(idx)}
                        className={`relative rounded-xl overflow-hidden border p-1 text-center aspect-square flex flex-col items-center justify-between transition-all cursor-pointer ${
                          photo
                            ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                            : 'bg-slate-100 border-dashed border-slate-300 text-slate-400'
                        }`}
                      >
                        {photo ? (
                          <>
                            <img
                              src={photo.previewUrl}
                              alt={cfg.name}
                              className="w-full h-12 object-cover rounded-lg"
                            />
                            <span className="text-[9px] font-bold text-emerald-800 truncate block mt-0.5">
                              P{idx + 1} Captured
                            </span>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-1">
                            <Camera className="w-4 h-4 text-slate-400 mb-0.5" />
                            <span className="text-[9px] font-bold text-slate-500">
                              + Angle {idx + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Big Launch Verification Button */}
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isLoading || stagedPhotos.length === 0}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-sm py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Executing Legal Metrology Multi-OCR Engine...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>🚀 EXECUTE LMPC STATUTORY AUDIT ({stagedPhotos.length} ANGLES)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1-Tap Benchmark Reference SKUs (Collapsible Quick Test Bar) */}
      <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowBenchmarkDrawer(!showBenchmarkDrawer)}
          className="w-full p-3 flex items-center justify-between text-left cursor-pointer hover:bg-slate-200/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-800">
              1-Tap Benchmark Reference SKUs ({demoSkus.length})
            </span>
          </div>
          <span className="text-[10px] font-bold text-blue-700">
            {showBenchmarkDrawer ? 'Hide Samples ▲' : 'Show Samples ▼'}
          </span>
        </button>

        {showBenchmarkDrawer && (
          <div className="p-3 pt-0 space-y-1.5 border-t border-slate-200/60">
            <p className="text-[10px] text-slate-500 mb-1.5">
              Select pre-configured reference test packages to instantly test compliance vs violation workflows:
            </p>
            {demoSkus.map((sku) => {
              const isSelected = selectedScanId === sku.id;
              const isCompliant = sku.expected_verdict === 'COMPLIANT';

              return (
                <button
                  key={sku.id}
                  type="button"
                  onClick={() => onSelectDemo(sku.id)}
                  disabled={isLoading}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-100 border-blue-600 shadow-sm ring-1 ring-blue-600 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="pr-2 min-w-0">
                    <span className="font-bold text-slate-900 block truncate">{sku.title}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{sku.category}</span>
                  </div>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                      isCompliant
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    {isCompliant ? 'PASS' : 'BREACH'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
