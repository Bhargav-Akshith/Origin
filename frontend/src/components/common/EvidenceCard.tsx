import React from 'react';
import { CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import type { ExtractedField } from '../../types';

interface EvidenceCardProps {
  field: ExtractedField;
  isSelected?: boolean;
  onSelect?: (field: ExtractedField) => void;
  onViewImageCrop?: (field: ExtractedField) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  field,
  isSelected = false,
  onSelect,
  onViewImageCrop
}) => {
  const confidencePct = Math.round(field.confidence * 100);
  const isValid = field.is_valid;

  const getClauseForField = (type: string) => {
    switch (type) {
      case 'mrp':
        return 'Rule 6(1)(e) • Retail Sale Price & Taxes';
      case 'net_quantity':
        return 'Rule 6(1)(c) • Net Quantity & Metric SI Units';
      case 'mfg_date':
        return 'Rule 6(1)(d) • Month & Year of Packing';
      case 'expiry_date':
        return 'Rule 6(1)(d) • Expiry & Best Before Notice';
      case 'country_origin':
        return 'Rule 6(10) • Country of Origin / Importation';
      case 'mfg_address':
        return 'Rule 6(1)(a) • Manufacturer Name & Complete Address';
      case 'consumer_care':
        return 'Rule 6(1)(f) • Consumer Grievance Contact';
      case 'generic_name':
        return 'Rule 6(1)(b) • Generic Name of Commodity';
      default:
        return 'LMPC Rules, 2011';
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(field)}
      className={`rounded-xl border transition-all duration-200 p-3 text-left ${
        isSelected
          ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-500/30'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      {/* Header: Field Label & Status Badge */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              {field.field_label || field.field_type.toUpperCase()}
            </span>
            {field.image_index !== undefined && (
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                Angle {field.image_index + 1}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            {getClauseForField(field.field_type)}
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              isValid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-rose-50 text-rose-700 border-rose-300'
            }`}
          >
            {isValid ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
            )}
            <span>{isValid ? 'VERIFIED' : 'BREACH'}</span>
          </span>
        </div>
      </div>

      {/* Value Display */}
      <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/80 my-2">
        <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
          Detected Statutory Value:
        </div>
        <div className="text-xs font-bold text-slate-900 font-mono break-words">
          {field.normalized_value || field.raw_text || (
            <span className="text-rose-600 italic font-sans font-normal">
              [Omitted or Missing on Packaging Label]
            </span>
          )}
        </div>
        {field.raw_text && field.raw_text !== field.normalized_value && (
          <div className="text-[10px] text-slate-500 mt-1 font-mono break-words border-t border-slate-200/60 pt-1">
            <span className="font-semibold text-slate-400">Raw OCR: </span>
            {field.raw_text}
          </div>
        )}
      </div>

      {/* Validation Message if any */}
      {field.validation_message && !isValid && (
        <div className="text-[11px] font-medium text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 mb-2 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
          <span>{field.validation_message}</span>
        </div>
      )}

      {/* Footer: Confidence Bar & Bounding Box Action */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">AI Confidence:</span>
          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                confidencePct >= 90
                  ? 'bg-emerald-500'
                  : confidencePct >= 70
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <span className="font-bold text-slate-700 font-mono">{confidencePct}%</span>
        </div>

        {field.bbox && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewImageCrop) onViewImageCrop(field);
              else if (onSelect) onSelect(field);
            }}
            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            <span>Highlight</span>
          </button>
        )}
      </div>
    </div>
  );
};
