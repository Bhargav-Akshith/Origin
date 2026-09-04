import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Sparkles, Layers, RefreshCw } from 'lucide-react';
import type { DemoSkuPreset } from '../types';
import { type Language, translations } from '../i18n/translations';
import { CameraScannerModal } from './CameraScannerModal';

interface Props {
  demoSkus: DemoSkuPreset[];
  onSelectDemo: (demoId: string) => void;
  onUpload: (file: File, productName: string, category: string) => void;
  isLoading: boolean;
  selectedScanId?: string;
  lang: Language;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const name = productName.trim() || file.name.replace(/\.[^/.]+$/, '');
      onUpload(file, name, category);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const name = productName.trim() || file.name.replace(/\.[^/.]+$/, '');
      onUpload(file, name, category);
    }
  };

  return (
    <div className="gov-card p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-700" />
            {t.ingestionTitle}
          </h2>
          <p className="text-xs text-slate-500">
            {t.ingestionSubtitle}
          </p>
        </div>
        <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-300">
          {t.ingestionBadge}
        </span>
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
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
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

          {/* Interactive Drop Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors flex flex-col items-center justify-center min-h-[140px] ${
              dragActive
                ? 'border-blue-600 bg-blue-50/70'
                : 'border-slate-300 bg-slate-50/50 hover:border-blue-500 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />

            {isLoading ? (
              <div className="flex flex-col items-center py-2">
                <RefreshCw className="w-8 h-8 text-blue-700 animate-spin mb-2" />
                <p className="text-xs font-bold text-slate-900">{t.processingText}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.processingSub}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1.5 bg-[#0F2942] hover:bg-[#1E3A8A] text-white text-xs font-semibold px-3.5 py-1.5 rounded shadow-sm transition-colors"
                  >
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span>{t.uploadBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded border border-slate-300 shadow-sm transition-colors"
                  >
                    <Camera className="w-4 h-4 text-blue-700" />
                    <span>{t.cameraBtn}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {t.dragDropText}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {t.formatSupportText}
                </p>
              </>
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
                  className={`w-full text-left p-2.5 rounded border transition-all text-xs flex items-center justify-between ${
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
          const name = productName.trim() || file.name.replace(/\.[^/.]+$/, '');
          onUpload(file, name, category);
        }}
        lang={lang}
      />
    </div>
  );
}
