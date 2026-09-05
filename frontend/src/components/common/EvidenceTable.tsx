import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Eye, 
  ShieldCheck 
} from 'lucide-react';
import type { ExtractedField } from '../../types';

interface EvidenceTableProps {
  fields: ExtractedField[];
  selectedField: ExtractedField | null;
  onSelectField: (field: ExtractedField | null) => void;
  lang?: 'en' | 'hi';
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({
  fields,
  selectedField,
  onSelectField
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VALID' | 'BREACH'>('ALL');

  const filteredFields = fields.filter((f) => {
    const matchesSearch = 
      (f.field_label || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.raw_text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.normalized_value || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.field_type || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'ALL' ||
      (filterStatus === 'VALID' && f.is_valid) ||
      (filterStatus === 'BREACH' && !f.is_valid);

    return matchesSearch && matchesFilter;
  });

  const getClauseNumber = (type: string) => {
    switch (type) {
      case 'mrp': return 'Rule 6(1)(e)';
      case 'net_quantity': return 'Rule 6(1)(c)';
      case 'mfg_date': return 'Rule 6(1)(d)';
      case 'expiry_date': return 'Rule 6(1)(d)';
      case 'country_origin': return 'Rule 6(10)';
      case 'mfg_address': return 'Rule 6(1)(a)';
      case 'consumer_care': return 'Rule 6(1)(f)';
      case 'generic_name': return 'Rule 6(1)(b)';
      default: return 'Rule 6';
    }
  };

  const validCount = fields.filter(f => f.is_valid).length;
  const totalCount = fields.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header & Controls Bar */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              Statutory Evidence Extraction Table
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              {validCount}/{totalCount} Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Legal Metrology (Packaged Commodities) Rules, 2011 Mandatory Declarations
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search declarations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-[#0F2942] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('VALID')}
              className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors cursor-pointer ${
                filterStatus === 'VALID'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Valid ({validCount})
            </button>
            <button
              onClick={() => setFilterStatus('BREACH')}
              className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors cursor-pointer ${
                filterStatus === 'BREACH'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Breach ({totalCount - validCount})
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3.5 w-24">Clause</th>
              <th className="py-2.5 px-3.5 w-48">Declaration Field</th>
              <th className="py-2.5 px-3.5">Detected Packaging Value (Normalized)</th>
              <th className="py-2.5 px-3.5 w-28 text-center">Confidence</th>
              <th className="py-2.5 px-3.5 w-24 text-center">Source Panel</th>
              <th className="py-2.5 px-3.5 w-28 text-center">Legal Status</th>
              <th className="py-2.5 px-3.5 w-20 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredFields.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No statutory fields matched the search criteria.
                </td>
              </tr>
            ) : (
              filteredFields.map((field) => {
                const isSelected = selectedField?.field_type === field.field_type;
                const confidencePct = Math.round(field.confidence * 100);

                return (
                  <tr
                    key={field.field_type || field.id}
                    onClick={() => onSelectField(isSelected ? null : field)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 ring-1 ring-blue-500/50 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Clause */}
                    <td className="py-3 px-3.5 font-mono text-[11px] font-bold text-blue-900">
                      {getClauseNumber(field.field_type)}
                    </td>

                    {/* Field Label */}
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900">{field.field_label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{field.field_type}</div>
                    </td>

                    {/* Detected Value */}
                    <td className="py-3 px-3.5">
                      {field.normalized_value || field.raw_text ? (
                        <div>
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {field.normalized_value || field.raw_text}
                          </span>
                          {field.raw_text && field.raw_text !== field.normalized_value && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Raw: {field.raw_text}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-rose-600 italic font-semibold text-[11px]">
                          [Missing or Omitted on Packaging]
                        </span>
                      )}
                      {field.validation_message && !field.is_valid && (
                        <div className="text-[10px] text-rose-600 font-medium mt-1">
                          ⚠ {field.validation_message}
                        </div>
                      )}
                    </td>

                    {/* AI Confidence */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
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
                        <span className="font-mono font-bold text-[11px] text-slate-700">
                          {confidencePct}%
                        </span>
                      </div>
                    </td>

                    {/* Source Angle */}
                    <td className="py-3 px-3.5 text-center">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {field.image_index !== undefined ? `Angle ${field.image_index + 1}` : 'Angle 1'}
                      </span>
                    </td>

                    {/* Legal Status */}
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          field.is_valid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        {field.is_valid ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                        )}
                        <span>{field.is_valid ? 'PASS' : 'BREACH'}</span>
                      </span>
                    </td>

                    {/* Inspect Action */}
                    <td className="py-3 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectField(isSelected ? null : field);
                        }}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                        title="Highlight bounding box on packaging canvas"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
