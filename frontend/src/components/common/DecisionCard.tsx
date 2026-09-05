import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  Download, 
  Scale, 
  Clock
} from 'lucide-react';
import type { ScanSession } from '../../types';
import { getReportPdfUrl } from '../../services/api';
import { StatusBadge } from './StatusBadge';

interface DecisionCardProps {
  scan: ScanSession | null;
  onOpenReviewModal?: () => void;
  onReinspect?: () => void;
  lang?: 'en' | 'hi';
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  scan,
  onOpenReviewModal,
  onReinspect
}) => {
  if (!scan) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400">
        <Scale className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p className="text-xs font-semibold">No active inspection loaded.</p>
      </div>
    );
  }

  const isCompliant = scan.overall_verdict === 'COMPLIANT';
  const isReviewRequired = scan.workflow_status === 'UNDER_REVIEW';
  const score = Math.round(scan.compliance_score || 0);
  const confidenceScore = Math.round((scan.confidence_score || 0.95) * 100);
  const totalViolations = (scan.violations || []).length;
  const pdfUrl = getReportPdfUrl(scan.id);

  return (
    <div
      className={`rounded-xl border shadow-sm transition-all overflow-hidden ${
        isCompliant
          ? 'bg-gradient-to-b from-emerald-950/20 via-white to-white border-emerald-300'
          : isReviewRequired
          ? 'bg-gradient-to-b from-amber-950/20 via-white to-white border-amber-300'
          : 'bg-gradient-to-b from-rose-950/20 via-white to-white border-rose-300'
      }`}
    >
      {/* Header Banner */}
      <div
        className={`p-4 border-b ${
          isCompliant
            ? 'bg-emerald-900/90 text-white border-emerald-800'
            : isReviewRequired
            ? 'bg-amber-900/90 text-white border-amber-800'
            : 'bg-rose-900/90 text-white border-rose-800'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isCompliant ? (
              <ShieldCheck className="w-6 h-6 text-emerald-300 shrink-0" />
            ) : isReviewRequired ? (
              <Clock className="w-6 h-6 text-amber-300 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-300 shrink-0" />
            )}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-200">
                LMPC Statutory Decision Engine
              </div>
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                {isCompliant
                  ? 'COMPLIANT — STATUTORY CLEARANCE GRANTED'
                  : isReviewRequired
                  ? 'REVIEW REQUIRED — ADJUDICATION PENDING'
                  : 'NON-COMPLIANT — STATUTORY BREACH DETECTED'}
              </h3>
            </div>
          </div>

          <StatusBadge status={scan.overall_verdict} size="sm" />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Compliance Score */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Compliance Score
            </span>
            <span
              className={`text-xl font-black font-mono ${
                score === 100
                  ? 'text-emerald-700'
                  : score >= 75
                  ? 'text-blue-700'
                  : 'text-rose-700'
              }`}
            >
              {score}%
            </span>
          </div>

          {/* Violations Count */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Clause Breaches
            </span>
            <span
              className={`text-xl font-black font-mono ${
                totalViolations === 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {totalViolations}
            </span>
          </div>

          {/* AI Confidence */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Model Confidence
            </span>
            <span className="text-xl font-black font-mono text-slate-800">
              {confidenceScore}%
            </span>
          </div>

          {/* Multi-angle Photos */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Packaging Angles
            </span>
            <span className="text-xl font-black font-mono text-slate-800">
              {scan.packaging_images?.length || 1}
            </span>
          </div>
        </div>

        {/* Commodity Info Row */}
        <div className="bg-white rounded-lg p-3 border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-semibold">Inspected Commodity:</span>
            <span className="font-bold text-slate-900 truncate max-w-[200px]">
              {scan.product_name}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-semibold">Regulatory Category:</span>
            <span className="font-bold text-slate-800 truncate max-w-[200px]">
              {scan.category}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-semibold">Workflow Status:</span>
            <StatusBadge status={scan.workflow_status} size="sm" type="workflow" />
          </div>
          {scan.sha256_hash && (
            <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-100">
              <span className="font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> Audit SHA-256:
              </span>
              <span className="font-mono text-[10px] text-slate-500 truncate max-w-[180px]">
                {scan.sha256_hash.substring(0, 16)}...
              </span>
            </div>
          )}
        </div>

        {/* Reviewer Notes if already reviewed */}
        {scan.reviewer_notes && (
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-800 block mb-0.5">
              Reviewer Adjudication Notes ({scan.reviewed_by || 'Chief Admin'}):
            </span>
            <p className="text-slate-700 italic font-medium">{scan.reviewer_notes}</p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 bg-[#0F2942] hover:bg-[#1E3A8A] text-white font-bold text-xs py-2.5 px-3 rounded-lg shadow flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download PDF Certificate</span>
          </a>

          {onOpenReviewModal && (
            <button
              type="button"
              onClick={onOpenReviewModal}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 px-3.5 rounded-lg shadow flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Adjudicate / Review</span>
            </button>
          )}

          {onReinspect && (
            <button
              type="button"
              onClick={onReinspect}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-3 rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Request secondary reinspection"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-inspect</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
