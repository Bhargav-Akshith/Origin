import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Download, 
  Scale, 
  RefreshCw
} from 'lucide-react';
import type { ScanSession } from '../../types';
import { getReportPdfUrl } from '../../services/api';

interface MobileDecisionViewProps {
  scan: ScanSession | null;
  onOpenReviewModal: () => void;
  onReinspect: () => void;
  onNavigateTab: (tab: any) => void;
  lang?: 'en' | 'hi';
}

export const MobileDecisionView: React.FC<MobileDecisionViewProps> = ({
  scan,
  onOpenReviewModal,
  onReinspect,
  onNavigateTab
}) => {
  if (!scan) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400">
        <Scale className="w-12 h-12 mx-auto mb-2 text-slate-300" />
        <p className="text-xs font-bold text-slate-600">No active inspection loaded.</p>
        <button
          type="button"
          onClick={() => onNavigateTab('inspect')}
          className="mt-3 bg-[#0F2942] text-amber-300 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
        >
          Start New Inspection
        </button>
      </div>
    );
  }

  const isCompliant = scan.overall_verdict === 'COMPLIANT';
  const isReviewRequired = scan.workflow_status === 'UNDER_REVIEW';
  const score = Math.round(scan.compliance_score || 0);
  const totalViolations = (scan.violations || []).length;
  const pdfUrl = getReportPdfUrl(scan.id);

  return (
    <div className="space-y-3 select-none">
      {/* Big Verdict Header Card */}
      <div
        className={`rounded-2xl p-5 border text-white shadow-lg ${
          isCompliant
            ? 'bg-gradient-to-br from-emerald-800 to-teal-950 border-emerald-600'
            : isReviewRequired
            ? 'bg-gradient-to-br from-amber-700 to-orange-950 border-amber-500'
            : 'bg-gradient-to-br from-rose-800 to-red-950 border-rose-600'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shrink-0">
              {isCompliant ? (
                <ShieldCheck className="w-7 h-7 text-emerald-300" />
              ) : isReviewRequired ? (
                <Clock className="w-7 h-7 text-amber-300" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-rose-300" />
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase font-extrabold tracking-widest text-slate-200">
                Statutory Assessment
              </div>
              <h2 className="text-lg font-black tracking-tight leading-tight">
                {isCompliant
                  ? 'COMPLIANT'
                  : isReviewRequired
                  ? 'REVIEW REQUIRED'
                  : 'NON-COMPLIANT'}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Score</span>
            <span className="text-2xl font-black font-mono leading-none">{score}%</span>
          </div>
        </div>

        {/* Commodity Info */}
        <div className="mt-4 pt-3 border-t border-white/15 text-xs space-y-1">
          <div className="font-extrabold text-white truncate text-sm">
            {scan.product_name}
          </div>
          <div className="text-[11px] text-slate-200 truncate">
            {scan.category}
          </div>
        </div>
      </div>

      {/* Quick Summary Metrics Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Declarations</span>
          <span className="text-lg font-black text-slate-900 font-mono">
            {scan.extracted_fields?.length || 0}
          </span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Violations</span>
          <span className={`text-lg font-black font-mono ${totalViolations === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {totalViolations}
          </span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Angles</span>
          <span className="text-lg font-black text-slate-900 font-mono">
            {scan.packaging_images?.length || 1}
          </span>
        </div>
      </div>

      {/* Flagged Violations Card List if any */}
      {totalViolations > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm space-y-2.5">
          <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Section 39 Statutory Violations Flagged ({totalViolations})</span>
          </div>

          <div className="space-y-2">
            {scan.violations.map((v, idx) => (
              <div key={idx} className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-extrabold text-rose-950">{v.issue_title}</span>
                  <span className="text-[9px] font-mono font-bold bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded shrink-0">
                    {v.clause}
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 mt-1">{v.description}</p>
                {v.evidence_snippet && (
                  <div className="text-[10px] text-slate-600 font-mono mt-1 bg-white p-1 rounded border border-rose-200">
                    Evidence: {v.evidence_snippet}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adjudication Review Workspace Trigger */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-black uppercase text-slate-900">
              Inspector Adjudication Actions
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            {scan.workflow_status}
          </span>
        </div>

        <p className="text-[11px] text-slate-500">
          Review evidence, confirm calculated verdict, force override, or issue secondary reinspection request.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenReviewModal}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-3 px-2 rounded-xl shadow flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>Adjudicate / Review</span>
          </button>

          <button
            type="button"
            onClick={onReinspect}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-2 rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Inspect</span>
          </button>
        </div>
      </div>

      {/* Download PDF Certificate Card */}
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#0F2942] hover:bg-[#1E3A8A] text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer block text-center"
      >
        <Download className="w-4 h-4 text-amber-400" />
        <span>Download Official PDF Certificate</span>
      </a>
    </div>
  );
};
