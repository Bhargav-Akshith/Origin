import React, { useState } from 'react';
import { 
  Scale, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';
import type { ScanSession } from '../../types';
import { reviewScanApi, reinspectScanApi } from '../../services/api';

interface ReviewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  scan: ScanSession | null;
  onReviewCompleted: (updatedScan: ScanSession) => void;
  lang?: 'en' | 'hi';
}

export const ReviewActionModal: React.FC<ReviewActionModalProps> = ({
  isOpen,
  onClose,
  scan,
  onReviewCompleted
}) => {
  if (!isOpen || !scan) return null;

  const [notes, setNotes] = useState(scan.reviewer_notes || '');
  const [overrideVerdict, setOverrideVerdict] = useState<'COMPLIANT' | 'NON_COMPLIANT'>(
    scan.overall_verdict === 'COMPLIANT' ? 'COMPLIANT' : 'NON_COMPLIANT'
  );
  const [actionType, setActionType] = useState<'ACCEPT' | 'OVERRIDE' | 'REINSPECT'>('ACCEPT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (actionType === 'REINSPECT') {
        const updated = await reinspectScanApi(scan.id);
        onReviewCompleted(updated);
        onClose();
      } else {
        const targetVerdict = actionType === 'ACCEPT' ? scan.overall_verdict : overrideVerdict;
        const targetWorkflowStatus = targetVerdict === 'COMPLIANT' ? 'COMPLETED' : 'NOTICE_ISSUED';
        const finalNotes = notes.trim() || `Adjudicated as ${targetVerdict} via ${actionType} action.`;
        
        const updated = await reviewScanApi(scan.id, targetWorkflowStatus, finalNotes, targetVerdict);
        onReviewCompleted(updated);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review action');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-lg w-full overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-[#0F2942] px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/40">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Statutory Adjudication & Case Review
              </h3>
              <p className="text-[11px] text-slate-300">
                Rule 32 Legal Metrology Assessment Protocol • ID: #{scan.id.substring(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Action Tabs */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Inspection Summary */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Commodity:</span>
              <span className="font-bold text-slate-900">{scan.product_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">AI Calculated Verdict:</span>
              <span
                className={`font-black uppercase ${
                  scan.overall_verdict === 'COMPLIANT' ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {scan.overall_verdict} ({Math.round(scan.compliance_score || 0)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Flagged Breaches:</span>
              <span className="font-bold text-slate-800">{(scan.violations || []).length}</span>
            </div>
          </div>

          {/* Adjudication Decision Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1.5">
              Select Adjudication Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Accept */}
              <button
                type="button"
                onClick={() => setActionType('ACCEPT')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  actionType === 'ACCEPT'
                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/30 font-bold text-emerald-900'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 mx-auto mb-1 ${
                    actionType === 'ACCEPT' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-[11px] font-extrabold">ACCEPT</div>
                <div className="text-[9px] text-slate-500">Confirm Verdict</div>
              </button>

              {/* Override */}
              <button
                type="button"
                onClick={() => setActionType('OVERRIDE')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  actionType === 'OVERRIDE'
                    ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/30 font-bold text-blue-900'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck
                  className={`w-4 h-4 mx-auto mb-1 ${
                    actionType === 'OVERRIDE' ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-[11px] font-extrabold">OVERRIDE</div>
                <div className="text-[9px] text-slate-500">Modify Verdict</div>
              </button>

              {/* Reinspect */}
              <button
                type="button"
                onClick={() => setActionType('REINSPECT')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  actionType === 'REINSPECT'
                    ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500/30 font-bold text-amber-900'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 mx-auto mb-1 ${
                    actionType === 'REINSPECT' ? 'text-amber-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-[11px] font-extrabold">REINSPECT</div>
                <div className="text-[9px] text-slate-500">Request Re-scan</div>
              </button>
            </div>
          </div>

          {/* If Override, pick override verdict */}
          {actionType === 'OVERRIDE' && (
            <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200">
              <label className="text-[11px] font-bold text-blue-900 block mb-1">
                New Overridden Statutory Verdict:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideVerdict('COMPLIANT')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    overrideVerdict === 'COMPLIANT'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  ✓ Force COMPLIANT
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideVerdict('NON_COMPLIANT')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    overrideVerdict === 'NON_COMPLIANT'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  ⚠ Force NON-COMPLIANT
                </button>
              </div>
            </div>
          )}

          {/* Adjudication / Review Notes */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
              Statutory Reviewer Notes & Legal Rationale (Permanent Audit Log):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter legal rationale, physical verification observations, or grounds for override..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0F2942] hover:bg-[#1E3A8A] text-amber-300 hover:text-white font-bold rounded-lg text-xs shadow flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>{isSubmitting ? 'Recording Adjudication...' : 'Confirm & Apply Decision'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
