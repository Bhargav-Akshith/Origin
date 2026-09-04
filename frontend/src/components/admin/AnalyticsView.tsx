import { BarChart3, TrendingUp, ShieldAlert } from 'lucide-react';
import type { AdminDashboardStats } from '../../types';
import { type Language } from '../../i18n/translations';

interface Props {
  stats?: AdminDashboardStats;
  lang: Language;
}

export function AnalyticsView({ }: Props) {
  // Category distribution data
  const categories = [
    { name: 'Packaged Food & Beverages', count: 18, compliant: 15, nonCompliant: 3, rate: 83.3 },
    { name: 'Cosmetics & Personal Care', count: 12, compliant: 8, nonCompliant: 4, rate: 66.7 },
    { name: 'Pharmaceuticals Pre-packs', count: 9, compliant: 9, nonCompliant: 0, rate: 100.0 },
    { name: 'Household Chemicals & Cleaners', count: 7, compliant: 6, nonCompliant: 1, rate: 85.7 },
    { name: 'Electronics & Smart Wearables', count: 14, compliant: 7, nonCompliant: 7, rate: 50.0 },
    { name: 'Agricultural Staples & Grains', count: 11, compliant: 10, nonCompliant: 1, rate: 90.9 }
  ];

  // Most common statutory violation clauses
  const topViolations = [
    { clause: 'Rule 6(1)(e)', title: 'Unit Sale Price (USP) / Tax Inclusion Omission', count: 14, pct: 42 },
    { clause: 'Rule 6(1)(n)', title: 'Country of Origin Declaration Missing', count: 9, pct: 27 },
    { clause: 'Rule 6(1)(k)', title: 'Consumer Redressal Email/Helpline Omitted', count: 6, pct: 18 },
    { clause: 'Rule 6(1)(c)', title: 'Non-SI Standard Metric Units for Net Quantity', count: 4, pct: 13 }
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              National Commodity Compliance Analytics & Sector Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Macro compliance trends across market sectors and statutory clause violation frequencies
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown + Top Breach Clauses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Category Compliance Table & Progress Bars (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-700" />
              Sector-Wise Compliance Distribution
            </h3>
            <span className="text-xs font-semibold text-slate-500">6 Key Consumer Sectors</span>
          </div>

          <div className="space-y-3.5">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-800 font-semibold">{cat.name}</span>
                  <span className="text-slate-600">
                    <strong className={cat.rate >= 80 ? 'text-emerald-700' : 'text-rose-700'}>
                      {cat.rate}%
                    </strong> ({cat.compliant}/{cat.count} Passed)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 h-full" 
                    style={{ width: `${cat.rate}%` }} 
                  />
                  <div 
                    className="bg-rose-500 h-full" 
                    style={{ width: `${100 - cat.rate}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Statutory Breach Clauses (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Top Breached Clauses
              </h3>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Rule 6 Priority
              </span>
            </div>

            <div className="space-y-3 mt-3">
              {topViolations.map((v, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {v.clause}
                    </span>
                    <span className="font-bold text-slate-700">{v.count} Flagged ({v.pct}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">{v.title}</p>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${v.pct * 2}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
            <strong>Advisory Note:</strong> Electronics and Imported Goods exhibit the lowest compliance rating (50.0%) due to missing Country of Origin disclosures under Rule 6(1)(n).
          </div>
        </div>
      </div>
    </div>
  );
}
