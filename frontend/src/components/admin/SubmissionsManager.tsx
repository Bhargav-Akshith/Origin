import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Search, 
  Eye, 
  FileText, 
  RefreshCw, 
  ShieldAlert,
  Download
} from 'lucide-react';
import type { ScanSession } from '../../types';
import { fetchAdminSubmissions, reviewSubmission, getReportPdfUrl } from '../../services/api';
import { type Language } from '../../i18n/translations';

interface Props {
  lang: Language;
  onInspectScanEvidence: (scan: ScanSession) => void;
}

export function SubmissionsManager({ onInspectScanEvidence }: Props) {
  const [submissions, setSubmissions] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verdictFilter, setVerdictFilter] = useState('ALL');

  const [activeReviewScan, setActiveReviewScan] = useState<ScanSession | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('COMPLETED');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [reviewVerdict, setReviewVerdict] = useState<string>('COMPLIANT');

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSubmissions(statusFilter, verdictFilter, search);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [statusFilter, verdictFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSubmissions();
  };

  const handleOpenReview = (scan: ScanSession) => {
    setActiveReviewScan(scan);
    setReviewStatus(scan.workflow_status || 'UNDER_REVIEW');
    setReviewVerdict(scan.overall_verdict || 'COMPLIANT');
    setReviewerNotes(scan.reviewer_notes || '');
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewScan) return;
    try {
      const updated = await reviewSubmission(
        activeReviewScan.id,
        reviewStatus,
        reviewerNotes,
        reviewVerdict
      );
      setSubmissions(submissions.map(s => s.id === updated.id ? updated : s));
      setActiveReviewScan(null);
    } catch (err) {
      alert('Error updating case review: ' + err);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Case Review & Submissions Adjudication Center
            </h2>
            <p className="text-xs text-slate-500">
              Audit field inspector packaging evidence, issue Section 39 notices, or grant statutory clearance
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU or Brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 outline-none"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none font-medium text-slate-700"
          >
            <option value="ALL">All Workflow Statuses</option>
            <option value="NEW">NEW</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="COMPLETED">COMPLETED (CLEAR)</option>
            <option value="NOTICE_ISSUED">SECTION 39 NOTICE</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none font-medium text-slate-700"
          >
            <option value="ALL">All Verdicts</option>
            <option value="COMPLIANT">COMPLIANT</option>
            <option value="NON_COMPLIANT">NON-COMPLIANT</option>
          </select>

          <button
            onClick={loadSubmissions}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Inspection Case ID & SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Inspection Date</th>
                <th className="p-3">Compliance Score</th>
                <th className="p-3">Statutory Verdict</th>
                <th className="p-3">Workflow State</th>
                <th className="p-3 text-right">Adjudication Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading submissions...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No inspection cases matching criteria found.
                  </td>
                </tr>
              ) : (
                submissions.map((scan) => {
                  const isCompliant = scan.overall_verdict === 'COMPLIANT';
                  return (
                    <tr key={scan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{scan.product_name}</div>
                        <span className="text-[10px] text-slate-500 font-mono">Case: {scan.id.slice(0, 8)}</span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-[180px] truncate">{scan.category}</td>
                      <td className="p-3 text-slate-500">
                        {new Date(scan.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          scan.workflow_status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : scan.workflow_status === 'NOTICE_ISSUED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : scan.workflow_status === 'UNDER_REVIEW'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {scan.workflow_status || 'NEW'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => onInspectScanEvidence(scan)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors inline-block"
                          title="Open Spatial Bounding Box Canvas"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenReview(scan)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded border border-blue-200 font-bold transition-colors"
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

      {/* Review Modal */}
      {activeReviewScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-300 max-h-[90vh] flex flex-col">
            <div className="bg-[#0F2942] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold">Adjudicate Statutory Case: {activeReviewScan.product_name}</h3>
                <p className="text-[11px] text-slate-300">Case Identifier: {activeReviewScan.id}</p>
              </div>
              <button
                onClick={() => setActiveReviewScan(null)}
                className="text-slate-300 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Top Overview Bar */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Category</span>
                  <p className="font-bold text-slate-800 truncate">{activeReviewScan.category}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Optical Score</span>
                  <p className="font-bold text-blue-700">{activeReviewScan.compliance_score}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Flagged Breaches</span>
                  <p className="font-bold text-rose-700">{activeReviewScan.violations.length} Violations</p>
                </div>
              </div>

              {/* Detected Violations Summary */}
              {activeReviewScan.violations.length > 0 && (
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg space-y-1.5">
                  <span className="font-bold text-rose-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Detected Legal Metrology Violations:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800">
                    {activeReviewScan.violations.map((v, i) => (
                      <li key={i}>
                        <strong>{v.clause}:</strong> {v.issue_title} — {v.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Status Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Workflow Adjudication Status
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold outline-none text-slate-800"
                  >
                    <option value="NEW">NEW</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="COMPLETED">APPROVED / COMPLIANT</option>
                    <option value="NOTICE_ISSUED">SECTION 39 LEGAL NOTICE ISSUED</option>
                    <option value="REJECTED">REJECTED / SEIZED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Final Regulatory Verdict Override
                  </label>
                  <select
                    value={reviewVerdict}
                    onChange={(e) => setReviewVerdict(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold outline-none text-slate-800"
                  >
                    <option value="COMPLIANT">COMPLIANT</option>
                    <option value="NON_COMPLIANT">NON_COMPLIANT</option>
                  </select>
                </div>
              </div>

              {/* Reviewer Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Reviewer Remarks & Case Notes
                </label>
                <textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  rows={3}
                  placeholder="Enter official adjudication reasoning, manufacturer rectifications, or seizure orders..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              {/* PDF Certificate Action */}
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span className="font-semibold text-slate-800">Inspection Certificate & Notice PDF</span>
                </div>
                <a
                  href={getReportPdfUrl(activeReviewScan.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span>Download Signed PDF</span>
                </a>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveReviewScan(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold shadow-sm"
                >
                  Commit Adjudication Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
