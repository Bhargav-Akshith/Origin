import { ClipboardCheck, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { DashboardMetrics } from '../types';
import { type Language, translations } from '../i18n/translations';

interface Props {
  metrics: DashboardMetrics | null;
  lang: Language;
}

export function MetricsBar({ metrics, lang }: Props) {
  const t = translations[lang];
  const total = metrics?.total_inspections ?? 0;
  const compliant = metrics?.compliant_count ?? 0;
  const nonCompliant = metrics?.non_compliant_count ?? 0;
  const rate = metrics?.compliance_rate ?? 0;
  const critical = metrics?.critical_violations_count ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
      {/* Metric 1 */}
      <div className="gov-card p-3.5 border-l-4 border-l-blue-600 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">{t.totalScanned}</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{total}</p>
          <span className="text-[10px] text-blue-600 font-medium">{t.batchLiveAudits}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <ClipboardCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Metric 2 */}
      <div className="gov-card p-3.5 border-l-4 border-l-emerald-600 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">{t.complianceRate}</p>
          <p className="text-2xl font-bold text-emerald-700 mt-0.5">{rate}%</p>
          <span className="text-[10px] text-emerald-600 font-medium">{compliant} {t.compliantSkus}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Metric 3 */}
      <div className="gov-card p-3.5 border-l-4 border-l-rose-600 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">{t.violationsFlagged}</p>
          <p className="text-2xl font-bold text-rose-700 mt-0.5">{nonCompliant}</p>
          <span className="text-[10px] text-rose-600 font-medium">{t.nonCompliantItems}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* Metric 4 */}
      <div className="gov-card p-3.5 border-l-4 border-l-amber-600 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">{t.criticalBreaches}</p>
          <p className="text-2xl font-bold text-amber-700 mt-0.5">{critical}</p>
          <span className="text-[10px] text-amber-600 font-medium">{t.noticeIssuable}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
          <AlertOctagon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
