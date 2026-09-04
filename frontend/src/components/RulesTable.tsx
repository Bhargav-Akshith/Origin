import { CheckCircle2, XCircle, FileText, ChevronRight } from 'lucide-react';
import type { ExtractedField } from '../types';
import { type Language, translations } from '../i18n/translations';

interface Props {
  fields: ExtractedField[];
  selectedField: ExtractedField | null;
  onSelectField: (field: ExtractedField) => void;
  lang: Language;
}

export function RulesTable({ fields, selectedField, onSelectField, lang }: Props) {
  const t = translations[lang];

  const getRuleDetails = (type: string) => {
    switch (type) {
      case 'mfg_address':
        return { clause: 'Rule 6(1)(a)', requirement: t.rule_mfg_address };
      case 'generic_name':
        return { clause: 'Rule 6(1)(b)', requirement: t.rule_generic_name };
      case 'net_quantity':
        return { clause: 'Rule 6(1)(c)', requirement: t.rule_net_quantity };
      case 'mfg_date':
        return { clause: 'Rule 6(1)(d)', requirement: t.rule_mfg_date };
      case 'expiry_date':
        return { clause: 'Rule 6(1)(d)', requirement: t.rule_expiry_date };
      case 'mrp':
        return { clause: 'Rule 6(1)(e)', requirement: t.rule_mrp };
      case 'consumer_care':
        return { clause: 'Rule 6(1)(k)', requirement: t.rule_consumer_care };
      case 'country_origin':
        return { clause: 'Rule 6(1)(n)', requirement: t.rule_country_origin };
      default:
        return { clause: 'Rule 6(1)', requirement: 'Mandatory Declaration' };
    }
  };

  const validCount = fields.filter(f => f.is_valid).length;

  return (
    <div className="gov-card p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-700" />
            {t.tableTitle}
          </h3>
          <p className="text-[11px] text-slate-500">
            {t.tableSubtitle}
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-300">
          {validCount} / {fields.length} {t.verifiedOutOf}
        </span>
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider bg-slate-50">
              <th className="py-2.5 px-2.5">{t.thClause}</th>
              <th className="py-2.5 px-2.5">{t.thDeclaration}</th>
              <th className="py-2.5 px-2.5">{t.thDetectedValue}</th>
              <th className="py-2.5 px-2.5">{t.thStatus}</th>
              <th className="py-2.5 px-1 text-center">{t.thInspect}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fields.map((field) => {
              const isSelected = selectedField?.field_type === field.field_type;
              const { clause, requirement } = getRuleDetails(field.field_type);
              const isValid = field.is_valid;

              return (
                <tr
                  key={field.field_type}
                  onClick={() => onSelectField(field)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/90 font-medium'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Clause Badge */}
                  <td className="py-2.5 px-2.5 align-top">
                    <span className="font-mono text-[10px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 inline-block">
                      {clause}
                    </span>
                  </td>

                  {/* Declaration Name & Legal Requirement */}
                  <td className="py-2.5 px-2.5 align-top">
                    <p className="font-bold text-slate-900">{field.field_label}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{requirement}</p>
                  </td>

                  {/* Detected Value */}
                  <td className="py-2.5 px-2.5 align-top font-mono text-[11px] max-w-[200px]" title={field.raw_text || ''}>
                    {field.normalized_value || field.raw_text ? (
                      <span className="text-slate-800 font-semibold block truncate">
                        {field.normalized_value || field.raw_text}
                      </span>
                    ) : (
                      <span className="text-rose-600 italic font-sans text-[11px] font-medium">
                        {t.omittedOnPackaging}
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-2.5 align-top">
                    {isValid ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> {t.passBadge}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-300">
                        <XCircle className="w-3 h-3" /> {t.violationBadge}
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-2.5 px-1 text-center align-top">
                    <ChevronRight className={`w-4 h-4 mx-auto ${isSelected ? 'text-blue-700' : 'text-slate-400'}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
