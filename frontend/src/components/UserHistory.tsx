import { useState } from 'react';
import { History, Download, Eye } from 'lucide-react';
import type { ScanSession } from '../types';
import { getReportPdfUrl } from '../services/api';
import { type Language } from '../i18n/translations';

interface Props {
  scans: ScanSession[];
  onSelectScan: (scan: ScanSession) => void;
  lang: Language;
}

export function UserHistory({ scans, onSelectScan }: Props) {
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');

  const filteredScans = scans.filter((s) => {
    const matchesSearch = s.product_name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
    const matchesVerdict = verdictFilter === 'ALL' || s.overall_verdict === verdictFilter;
    return matchesSearch && matchesVerdict;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Inspector Field Submission & Audit History
            </h2>
            <p className="text-xs text-slate-500">
              Chronological log of commodities screened, spatial bounding box evidence, and signed PDF certificates
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Filter SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 outline-none"
          />

          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none font-medium text-slate-700"
          >
            <option value="ALL">All Verdicts</option>
            <option value="COMPLIANT">COMPLIANT</option>
            <option value="NON_COMPLIANT">NON-COMPLIANT</option>
          </select>
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScans.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No inspection records matching criteria found.
          </div>
        ) : (
          filteredScans.map((scan) => {
            const isCompliant = scan.overall_verdict === 'COMPLIANT';
            return (
              <div
                key={scan.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{scan.product_name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">Case #{scan.id.slice(0, 8)}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isCompliant
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}>
                      {scan.overall_verdict}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1 text-xs">
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Category:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{scan.category}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Compliance Score:</span>
                      <span className="font-bold text-blue-700">{scan.compliance_score}%</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Workflow Status:</span>
                      <span className="font-bold text-slate-700">{scan.workflow_status || 'NEW'}</span>
                    </div>
                  </div>

                  {scan.reviewer_notes && (
                    <div className="mt-2.5 p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700">
                      <strong>Reviewer Remarks:</strong> {scan.reviewer_notes}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectScan(scan)}
                    className="flex items-center space-x-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Evidence Canvas</span>
                  </button>

                  <a
                    href={getReportPdfUrl(scan.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                    title="Download Official Certificate"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
