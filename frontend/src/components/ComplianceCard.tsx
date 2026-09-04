import { ShieldCheck, AlertOctagon, FileDown } from 'lucide-react';
import type { ScanSession } from '../types';
import { type Language, translations } from '../i18n/translations';

interface Props {
  scan: ScanSession | null;
  lang: Language;
}

export function ComplianceCard({ scan, lang }: Props) {
  if (!scan) return null;

  const t = translations[lang];
  const isCompliant = scan.overall_verdict === 'COMPLIANT';

  return (
    <div className="gov-card p-4">
      {/* Official Verdict Banner */}
      <div
        className={`p-3.5 rounded-lg border flex items-center justify-between ${
          isCompliant
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isCompliant ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {isCompliant ? <ShieldCheck className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/70">
                {t.statutoryAssessment}
              </span>
              <span className="text-xs font-semibold">
                {t.score}: <b>{scan.compliance_score}%</b>
              </span>
            </div>
            <h3 className="text-lg font-extrabold tracking-tight">
              {isCompliant ? t.clearanceTitle : t.nonComplianceTitle}
            </h3>
          </div>
        </div>

        {/* 1-Click PDF Inspection Report Download */}
        {scan.report_url && (
          <a
            href={scan.report_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 bg-[#0F2942] hover:bg-[#1E3A8A] text-white text-xs font-semibold px-3 py-2 rounded shadow transition-colors"
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            <span>{t.pdfCertificateBtn}</span>
          </a>
        )}
      </div>

      {/* Verification Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-3 pt-3 border-t border-slate-200">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t.commodity}</span>
          <span className="font-bold text-slate-900 truncate block">{scan.product_name}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t.category}</span>
          <span className="font-medium text-slate-700 truncate block">{scan.category}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t.violationsCount}</span>
          <span className={`font-bold ${scan.violations.length > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
            {scan.violations.length} {t.clauseBreaches}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t.digitalSha}</span>
          <span className="font-mono text-[10px] text-slate-600 truncate block" title={scan.sha256_hash || ''}>
            {scan.sha256_hash ? `${scan.sha256_hash.slice(0, 12)}...` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
