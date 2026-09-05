import { useState, useEffect } from 'react';
import { Eye, ZoomIn, ZoomOut, RotateCcw, Crosshair, Layers } from 'lucide-react';
import type { ExtractedField, ScanSession } from '../types';
import { type Language, translations } from '../i18n/translations';

interface Props {
  scan: ScanSession | null;
  selectedField: ExtractedField | null;
  onSelectField: (field: ExtractedField | null) => void;
  lang: Language;
}

export function ScanCanvas({ scan, selectedField, onSelectField, lang }: Props) {
  const t = translations[lang];
  const [showBoxes, setShowBoxes] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);

  // Auto-switch to the angle containing the selected field if it has an image_index
  useEffect(() => {
    if (selectedField?.image_index !== undefined && selectedField.image_index !== null) {
      setActiveAngleIndex(selectedField.image_index);
    }
  }, [selectedField]);

  // Reset angle index when scan changes
  useEffect(() => {
    setActiveAngleIndex(0);
  }, [scan?.id]);

  if (!scan) {
    return (
      <div className="gov-card p-8 text-center flex flex-col items-center justify-center min-h-[350px] bg-slate-50">
        <Eye className="w-10 h-10 text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">{t.noPackageTitle}</p>
        <p className="text-xs text-slate-500 mt-1">
          {t.noPackageDesc}
        </p>
      </div>
    );
  }

  const packagingImages = scan.packaging_images && scan.packaging_images.length > 0
    ? scan.packaging_images
    : [{ url: scan.image_url, angle_label: 'Main / Front Panel', filename: 'primary_image.jpg' }];

  const currentAngle = packagingImages[activeAngleIndex] || packagingImages[0];
  const activeImageUrl = currentAngle?.url || scan.image_url;

  // Filter fields belonging to the current active angle (or all if no image_index assigned)
  const currentAngleFields = scan.extracted_fields.filter((f) => {
    if (f.image_index === undefined || f.image_index === null) return true;
    return f.image_index === activeAngleIndex;
  });

  return (
    <div className="gov-card flex flex-col overflow-hidden">
      {/* Multi-Angle Panel Switcher Bar (if multi-image capture is present) */}
      {packagingImages.length > 1 && (
        <div className="bg-[#0B1E33] px-3 py-2 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold uppercase tracking-wider text-[11px] text-amber-300">
              Multi-Angle Packaging Views ({packagingImages.length} Panels):
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {packagingImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveAngleIndex(idx)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeAngleIndex === idx
                    ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-300'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeAngleIndex === idx ? 'bg-slate-950' : 'bg-emerald-400'}`} />
                <span>Angle {idx + 1}: {img.angle_label || `Panel ${idx + 1}`}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-4 h-4 text-blue-700" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            {t.canvasTitle}
          </span>
          <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono font-semibold">
            {currentAngleFields.filter((f) => f.bbox).length} {t.spatialZones} on {currentAngle?.angle_label || 'Current Panel'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Toggle Bounding Boxes */}
          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 select-none">
            <input
              type="checkbox"
              checked={showBoxes}
              onChange={(e) => setShowBoxes(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[11px] font-medium">{t.showOverlays}</span>
          </label>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 border-l border-slate-300 pl-3">
            <button
              onClick={() => setZoom((prev) => Math.max(60, prev - 15))}
              className="p-1 rounded hover:bg-slate-200 text-slate-600"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono w-8 text-center font-semibold">{zoom}%</span>
            <button
              onClick={() => setZoom((prev) => Math.min(160, prev + 15))}
              className="p-1 rounded hover:bg-slate-200 text-slate-600"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative bg-slate-900 overflow-auto flex items-center justify-center p-4 min-h-[380px] max-h-[520px]">
        <div
          className="relative inline-block transition-transform duration-150"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
        >
          {/* Base Product Image */}
          <img
            src={activeImageUrl}
            alt={`${scan.product_name} - ${currentAngle?.angle_label || 'View'}`}
            className="max-h-[440px] w-auto rounded shadow-lg border border-slate-700 select-none object-contain"
          />

          {/* SVG Bounding Boxes Overlay */}
          {showBoxes && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {currentAngleFields.map((field) => {
                if (!field.bbox) return null;
                const isSelected = selectedField?.field_type === field.field_type;
                const isValid = field.is_valid;
                const strokeColor = isValid ? '#059669' : '#DC2626';
                const fillColor = isSelected
                  ? (isValid ? 'rgba(5, 150, 105, 0.35)' : 'rgba(220, 38, 38, 0.40)')
                  : (isValid ? 'rgba(5, 150, 105, 0.10)' : 'rgba(220, 38, 38, 0.16)');

                return (
                  <g
                    key={`${field.field_type}-${field.image_index ?? 0}`}
                    className="cursor-pointer pointer-events-auto transition-all"
                    onClick={() => onSelectField(isSelected ? null : field)}
                  >
                    <rect
                      x={field.bbox.x}
                      y={field.bbox.y}
                      width={field.bbox.w}
                      height={field.bbox.h}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '0.9' : '0.5'}
                      strokeDasharray={isValid ? 'none' : '1.5, 0.8'}
                      rx="0.5"
                    />
                    {/* Small status tag */}
                    <rect
                      x={field.bbox.x}
                      y={Math.max(0, field.bbox.y - 3.5)}
                      width={Math.min(field.bbox.w, 24)}
                      height="3.2"
                      fill={strokeColor}
                      rx="0.4"
                    />
                    <text
                      x={field.bbox.x + 1}
                      y={Math.max(2.4, field.bbox.y - 1.2)}
                      fill="#FFFFFF"
                      fontSize="2.1"
                      fontWeight="bold"
                    >
                      {field.field_type.toUpperCase().replace('_', ' ').slice(0, 12)}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Canvas Footer / Active Field Callout */}
      <div className="bg-slate-50 p-2.5 border-t border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {selectedField ? (
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                selectedField.is_valid ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            ></span>
            <span className="font-bold text-slate-900">{selectedField.field_label}:</span>
            <span className="text-slate-600 font-mono text-[11px] truncate max-w-[280px]">
              {selectedField.normalized_value || selectedField.raw_text || t.omittedOnPackaging}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                selectedField.is_valid
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {selectedField.is_valid ? t.passBadge : t.violationBadge}
            </span>
            {selectedField.image_index !== undefined && (
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                Panel {selectedField.image_index + 1}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-500 text-[11px]">
            {t.canvasHelp}
          </span>
        )}

        <div className="flex items-center space-x-3 text-[10px] font-semibold shrink-0">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2.5 h-2.5 bg-emerald-600 rounded-sm inline-block"></span> {t.verifiedPass}
          </span>
          <span className="flex items-center gap-1 text-rose-700">
            <span className="w-2.5 h-2.5 bg-rose-600 rounded-sm inline-block"></span> {t.statutoryViolation}
          </span>
        </div>
      </div>
    </div>
  );
}

