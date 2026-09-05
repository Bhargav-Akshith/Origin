import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, HelpCircle, FileCheck, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'verdict' | 'workflow' | 'field';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const norm = (status || '').toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case 'COMPLIANT':
      case 'PASS':
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          label: 'COMPLIANT'
        };
      case 'NON_COMPLIANT':
      case 'FAIL':
      case 'VIOLATION':
      case 'REJECTED':
      case 'NOTICE_ISSUED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />,
          label: norm === 'NOTICE_ISSUED' ? 'NOTICE ISSUED' : 'NON-COMPLIANT'
        };
      case 'UNDER_REVIEW':
      case 'REVIEW_REQUIRED':
      case 'PENDING':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />,
          label: norm === 'UNDER_REVIEW' ? 'UNDER REVIEW' : 'REVIEW REQUIRED'
        };
      case 'PROCESSING':
      case 'UPLOADING':
      case 'OCR_PROCESSING':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700',
          icon: <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />,
          label: 'PROCESSING'
        };
      case 'NEW':
      case 'CREATED':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700',
          icon: <FileCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />,
          label: 'NEW'
        };
      case 'PROCESSING_FAILED':
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
          icon: <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />,
          label: 'FAILED'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
          label: status || 'UNKNOWN'
        };
    }
  };

  const { bg, icon, label } = getStyle();

  const sizeClass = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-black tracking-wide'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg border shadow-xs transition-colors ${bg} ${sizeClass}`}
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
};
