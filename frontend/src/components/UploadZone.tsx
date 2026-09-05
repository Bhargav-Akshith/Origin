import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Sparkles, Layers, RefreshCw, X, Plus, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import type { DemoSkuPreset } from '../types';
import { type Language, translations } from '../i18n/translations';
import { CameraScannerModal } from './CameraScannerModal';

interface Props {
  demoSkus: DemoSkuPreset[];
  onSelectDemo: (demoId: string) => void;
  onUpload: (files: File[], productName: string, category: string) => void;
  isLoading: boolean;
  selectedScanId?: string;
  lang: Language;
}

interface StagedImage {
  file: File;
  previewUrl: string;
  angleLabel: string;
}

export function UploadZone({
  demoSkus,
  onSelectDemo,
  onUpload,
  isLoading,
  selectedScanId,
  lang
}: Props) {
  const t = translations[lang];
  const [dragActive, setDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Packaged Food, Edible Oils & Confectionery');
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const angleLabels = [
    'Front Panel (Brand & Net Quantity)',
    'Back Panel (MRP, USP & Declarations)',
    'Side Panel (Country of Origin & Batch)',
    'Bottom / Top Seal & Barcode'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const addFilesToStaged = (newFiles: FileList | File[]) => {
    const added: StagedImage[] = [];
    const currentCount = stagedImages.length;
    Array.from(newFiles).forEach((file, idx) => {
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        const labelIdx = (currentCount + idx) % angleLabels.length;
        added.push({
          file,
          previewUrl,
          angleLabel: `Angle ${currentCount + idx + 1}: ${angleLabels[labelIdx]}`
        });
      }
    });

    if (added.length > 0) {
      setStagedImages((prev) => [...prev, ...added]);
      if (!productName.trim() && added[0]) {
        setProductName(added[0].file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToStaged(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToStaged(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeStagedImage = (index: number) => {
    setStagedImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleStartScan = () => {
    if (stagedImages.length === 0) return;
    const name = productName.trim() || stagedImages[0].file.name.replace(/\.[^/.]+$/, '');
    const files = stagedImages.map((s) => s.file);
    onUpload(files, name, category);
  };

  const hasMinimumImages = stagedImages.length >= 2;

  return (
    <div className="gov-card p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-700" />
            {t.ingestionTitle} &bull; Multi-Angle Physical Packaging Ingestion
          </h2>
          <p className="text-xs text-slate-500">
            Rule 6 & Rule 12 Enforcement: Capture multiple packaging angles (Front & Back panels) for cross-panel evidence fusion.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded border border-blue-200 flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-blue-600" />
            2+ Angles Recommended
          </span>
          <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-300">
            {t.ingestionBadge}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3">
        {/* Upload Terminal (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t.commodityNameLabel}
              </label>
              <input
                type="text"
                placeholder={t.commodityNamePlaceholder}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t.categoryLabel}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none bg-white font-medium text-slate-800"
              >
                <option value="Packaged Food, Edible Oils & Confectionery">{t.catFood}</option>
                <option value="Cosmetics, Soaps & Personal Hygiene">{t.catCosmetics}</option>
                <option value="Pharmaceuticals & Nutrition Pre-packs">{t.catPharma}</option>
                <option value="Household Detergents & Chemical Commodities">{t.catChemicals}</option>
                <option value="Electronics, Cables & Domestic Appliances">{t.catElectronics}</option>
                <option value="General Consumer Commodities & Textiles">{t.catGeneral}</option>
              </select>
            </div>
          </div>

          {/* Interactive Multi-Image Drop Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors flex flex-col justify-between min-h-[160px] ${
              dragActive
                ? 'border-blue-600 bg-blue-50/70'
                : 'border-slate-300 bg-slate-50/50 hover:border-blue-500 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <RefreshCw className="w-8 h-8 text-blue-700 animate-spin mb-2" />
                <p className="text-xs font-bold text-slate-900">{t.processingText}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Running Multi-Image OCR & Evidence Fusion Engine...</p>
              </div>
            ) : stagedImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1.5 bg-[#0F2942] hover:bg-[#1E3A8A] text-white text-xs font-semibold px-3.5 py-1.5 rounded shadow-sm transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span>Select Packaging Photos (2+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded border border-slate-300 shadow-sm transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-blue-700" />
                    <span>{t.cameraBtn}</span>
                  </button>
                </div>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  Drag and drop 2 or more packaging photos (Front face + Rear declarations)
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Supports High-Res JPG, PNG, WEBP, HEIC up to 25MB per image
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {stagedImages.length} Packaging Angle{stagedImages.length > 1 ? 's' : ''} Staged
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                    >
                      <Plus className="w-3 h-3" /> Add Another Angle
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="text-[10px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-slate-100 px-2 py-0.5 rounded border border-slate-300"
                    >
                      <Camera className="w-3 h-3" /> Snap Photo
                    </button>
                  </div>
                </div>

                {/* Staged Image Thumbnails */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
                  {stagedImages.map((item, idx) => (
                    <div key={idx} className="relative group bg-white border border-slate-300 rounded p-1.5 flex items-center gap-2 shadow-sm">
                      <img
                        src={item.previewUrl}
                        alt={`Angle ${idx + 1}`}
                        className="w-12 h-12 object-cover rounded border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-[10px] font-bold text-slate-900 block truncate">
                          Angle {idx + 1}
                        </span>
                        <span className="text-[9px] text-slate-500 block truncate">
                          {idx === 0 ? 'Front Panel' : idx === 1 ? 'Back / MRP Panel' : idx === 2 ? 'Side Panel' : 'Detail'}
                        </span>
                        <span className="text-[8px] text-slate-400 font-mono">
                          {(item.file.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStagedImage(idx)}
                        className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 shadow cursor-pointer transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Multi-angle Guidance Message */}
                <div className="mt-2 pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-left text-[10px]">
                    {!hasMinimumImages ? (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        1 photo staged. For high clarification, add the rear declaration panel.
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Multi-angle set complete ({stagedImages.length} photos ready for fused OCR verification).
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleStartScan}
                    className="w-full sm:w-auto bg-[#0F2942] hover:bg-[#1E3A8A] text-amber-300 hover:text-white font-bold text-xs px-4 py-1.5 rounded shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Run Statutory Metrology Verification ({stagedImages.length})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1-Click Reference Test Samples (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {t.benchmarkTitle}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">{t.benchmarkSub}</span>
            </div>
            <p className="text-[10px] text-slate-500 mb-2">
              {t.benchmarkDesc}
            </p>
          </div>

          <div className="space-y-2">
            {demoSkus.map((sku) => {
              const isSelected = selectedScanId === sku.id;
              const isCompliant = sku.expected_verdict === 'COMPLIANT';

              return (
                <button
                  key={sku.id}
                  onClick={() => onSelectDemo(sku.id)}
                  disabled={isLoading}
                  className={`w-full text-left p-2.5 rounded border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 shadow-sm ring-1 ring-blue-600'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 leading-tight">{sku.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{sku.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isCompliant
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}
                    >
                      {isCompliant ? t.passBadge : t.violationBadge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Optical WebRTC Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          addFilesToStaged([file]);
        }}
        lang={lang}
      />
    </div>
  );
}

