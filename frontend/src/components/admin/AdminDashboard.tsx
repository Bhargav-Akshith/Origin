import { 
  Users, 
  FileCheck2, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  ShieldAlert, 
  ArrowUpRight
} from 'lucide-react';
import type { AdminDashboardStats, ScanSession } from '../../types';
import { type Language } from '../../i18n/translations';

interface Props {
  stats: AdminDashboardStats;
  lang: Language;
  onSelectScan: (scan: ScanSession) => void;
  onNavigateTab: (tab: string) => void;
}

export function AdminDashboard({ stats, onSelectScan, onNavigateTab }: Props) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Executive Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div 
          onClick={() => onNavigateTab('users')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled Officers</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.total_users}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {stats.active_users} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Central & State Legal Metrology Officers</p>
        </div>

        {/* Total Inspections */}
        <div 
          onClick={() => onNavigateTab('submissions')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Physical Inspections</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.total_inspections}</span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {stats.compliance_rate}% Pass Rate
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats.compliant_count} Passed • {stats.non_compliant_count} Flagged</p>
        </div>

        {/* Pending Case Reviews */}
        <div 
          onClick={() => onNavigateTab('submissions')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Adjudications</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.pending_reviews_count}</span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Action Required
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting Senior Legal Officer clearance</p>
        </div>

        {/* Critical Breaches & Seizure Notices */}
        <div 
          onClick={() => onNavigateTab('alerts')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-rose-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Section 39 Notices</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-700">{stats.critical_breaches_count}</span>
            <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              High Severity
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Immediate statutory seizure alerts issued</p>
        </div>
      </div>

      {/* 2. Middle Row: AI OCR Diagnostics + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* System Health & AI Engine Monitor (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Central Optical Inference Pipeline (Vision & OCR v2.2)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Mean Inference Latency</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{stats.avg_ai_latency_ms} ms</p>
                <span className="text-[10px] text-emerald-600 font-medium">99.4% SLA Target Met</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">OCR Confidence Score</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">94.8%</p>
                <span className="text-[10px] text-blue-600 font-medium">CLAHE Filter Active</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Rule Parsing Accuracy</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">100.0%</p>
                <span className="text-[10px] text-emerald-600 font-medium">Rules 6(1)(a)-(n)</span>
              </div>
            </div>

            {/* Compliance Bar Progress */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">National Commodity Compliance Index</span>
                <span className="text-blue-700 font-bold">{stats.compliance_rate}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${stats.compliance_rate}%` }}
                />
                <div 
                  className="bg-rose-500 h-full transition-all duration-500" 
                  style={{ width: `${100 - stats.compliance_rate}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> 
                  Compliant ({stats.compliant_count})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> 
                  Non-Compliant ({stats.non_compliant_count})
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Status: <strong className="text-slate-800">{stats.system_health_status}</strong></span>
            <button
              onClick={() => onNavigateTab('ai')}
              className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              View Diagnostic Metrics <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Priority Alerts & Ticker (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Active Enforcement Alerts
                </h3>
              </div>
              <button 
                onClick={() => onNavigateTab('alerts')}
                className="text-xs text-blue-700 hover:underline font-semibold"
              >
                View All ({stats.active_alerts.length})
              </button>
            </div>

            <div className="space-y-2.5 mt-3">
              {stats.active_alerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No critical alerts at this time.
                </div>
              ) : (
                stats.active_alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-lg border text-xs transition-colors ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-blue-50/70 border-blue-200 text-blue-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          alert.severity === 'CRITICAL' ? 'bg-rose-600' : 'bg-amber-600'
                        }`} />
                        {alert.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{alert.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 text-right">
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Open Security Audit Logs →
            </button>
          </div>
        </div>
      </div>

      {/* 3. Recent Inspection Submissions Stream */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Recent Physical Inspections & Submissions
            </h3>
            <p className="text-xs text-slate-500">Live feed of commodity packages screened by field officers</p>
          </div>
          <button
            onClick={() => onNavigateTab('submissions')}
            className="text-xs font-bold bg-[#0F2942] hover:bg-[#1E3A8A] text-white px-3.5 py-1.5 rounded shadow-sm transition-colors"
          >
            Manage All Submissions
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Commodity & SKU Title</th>
                <th className="p-3">Regulatory Category</th>
                <th className="p-3">Compliance Score</th>
                <th className="p-3">Statutory Verdict</th>
                <th className="p-3">Case Workflow</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {stats.recent_scans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No physical inspections recorded yet.
                  </td>
                </tr>
              ) : (
                stats.recent_scans.map((scan) => {
                  const isCompliant = scan.overall_verdict === 'COMPLIANT';
                  return (
                    <tr key={scan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{scan.product_name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {scan.id.slice(0, 8)}</span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-[200px] truncate">{scan.category}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-800">{scan.compliance_score}%</span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isCompliant
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}>
                          {scan.overall_verdict}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                          {scan.workflow_status || 'NEW'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            onSelectScan(scan);
                            onNavigateTab('submissions');
                          }}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
                        >
                          Review Case
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
    </div>
  );
}
