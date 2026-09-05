import React, { useState } from 'react';
import { 
  Layers, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { ExtractedField, PackagingImage } from '../../types';
import { EvidenceCard } from '../common/EvidenceCard';

interface MobileEvidenceListProps {
  fields: ExtractedField[];
  packagingImages?: PackagingImage[];
  selectedField: ExtractedField | null;
  onSelectField: (field: ExtractedField | null) => void;
  lang?: 'en' | 'hi';
}

export const MobileEvidenceList: React.FC<MobileEvidenceListProps> = ({
  fields,
  packagingImages = [],
  selectedField,
  onSelectField
}) => {
  const [filter, setFilter] = useState<'ALL' | 'VALID' | 'BREACH'>('ALL');
  const [activeAngleIndex, setActiveAngleIndex] = useState<number>(0);
  const [showImagePreview, setShowImagePreview] = useState<boolean>(true);

  const filteredFields = fields.filter((f) => {
    if (filter === 'VALID') return f.is_valid;
    if (filter === 'BREACH') return !f.is_valid;
    return true;
  });

  const validCount = fields.filter(f => f.is_valid).length;
  const totalCount = fields.length;

  const currentImage = packagingImages[activeAngleIndex] || packagingImages[0];

  return (
    <div className="space-y-3 select-none">
      {/* Packaging Image & Angle Switcher (Collapsible) */}
      {packagingImages.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div 
            onClick={() => setShowImagePreview(!showImagePreview)}
            className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-bold text-slate-900">
                Packaging Image ({packagingImages.length} Angle{packagingImages.length > 1 ? 's' : ''})
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <span>{showImagePreview ? 'Hide' : 'View'}</span>
              {showImagePreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {showImagePreview && (
            <div className="p-3 space-y-2.5">
              {/* Main Image View */}
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                {currentImage ? (
                  <img
                    src={currentImage.url}
                    alt={currentImage.angle_label}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 text-xs">No image loaded</div>
                )}
                {currentImage && (
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20">
                    {currentImage.angle_label}
                  </div>
                )}
              </div>

              {/* Angle selector pills */}
              {packagingImages.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {packagingImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveAngleIndex(idx)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer truncate ${
                        activeAngleIndex === idx
                          ? 'bg-[#0F2942] text-amber-300 border-[#0F2942] shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Angle {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs Header */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              Statutory Declarations
            </h3>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {validCount}/{totalCount} Valid
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`py-1.5 rounded-lg text-center text-xs font-bold transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('VALID')}
            className={`py-1.5 rounded-lg text-center text-xs font-bold transition-all cursor-pointer ${
              filter === 'VALID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Valid ({validCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('BREACH')}
            className={`py-1.5 rounded-lg text-center text-xs font-bold transition-all cursor-pointer ${
              filter === 'BREACH'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Breach ({totalCount - validCount})
          </button>
        </div>
      </div>

      {/* Evidence Cards Stream */}
      <div className="space-y-2">
        {filteredFields.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
            No declarations match the current filter.
          </div>
        ) : (
          filteredFields.map((field) => (
            <EvidenceCard
              key={field.field_type || field.id}
              field={field}
              isSelected={selectedField?.field_type === field.field_type}
              onSelect={onSelectField}
              onViewImageCrop={(f) => {
                if (f.image_index !== undefined && f.image_index < packagingImages.length) {
                  setActiveAngleIndex(f.image_index);
                }
                setShowImagePreview(true);
                onSelectField(f);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
