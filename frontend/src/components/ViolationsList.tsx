import { Scale, FileWarning } from 'lucide-react';
import type { Violation } from '../types';
import { type Language, translations } from '../i18n/translations';

interface Props {
  violations: Violation[];
  lang: Language;
}

export function ViolationsList({ violations, lang }: Props) {
  const t = translations[lang];

  if (violations.length === 0) {
    return (
      <div className="gov-card p-4 border-l-4 border-l-emerald-600 bg-emerald-50/40">
        <div className="flex items-center space-x-2 text-emerald-800">
          <Scale className="w-5 h-5 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider">{t.zeroViolationsTitle}</h4>
        </div>
        <p className="text-xs text-emerald-700 mt-1">
          {t.zeroViolationsDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="gov-card p-4 border-l-4 border-l-rose-600">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
        <div className="flex items-center space-x-2">
          <FileWarning className="w-4 h-4 text-rose-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            {t.violationsListTitle} ({violations.length})
          </h4>
        </div>
        <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
          {t.actionRequiredNotice}
        </span>
      </div>

      <div className="space-y-2.5">
        {violations.map((v, idx) => (
          <div key={idx} className="bg-rose-50/60 border border-rose-200 rounded p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-rose-200">
                {v.clause} &bull; {v.rule_id}
              </span>
              <span className="text-[10px] font-extrabold uppercase text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                {v.severity}
              </span>
            </div>

            <p className="font-bold text-slate-900 mt-1.5">{v.issue_title}</p>
            <p className="text-slate-600 text-[11px] mt-0.5">{v.description}</p>

            {v.evidence_snippet && (
              <div className="mt-2 bg-white p-1.5 rounded border border-rose-100 text-[10px] text-slate-500 font-mono">
                <span className="font-semibold text-slate-700">{t.packagingEvidence}: </span>
                {v.evidence_snippet}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
