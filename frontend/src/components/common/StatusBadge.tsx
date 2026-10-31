import React from 'react';
import { GrievanceStatus } from '../../types';

interface StatusBadgeProps {
  status: GrievanceStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (status === 'Resolved') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded border border-[#B2D4B6] bg-[#EAF2EB] text-[#1B5E20] dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#1B5E20] dark:bg-emerald-400" />
        Resolved
      </span>
    );
  }

  if (status === 'Escalated') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded border border-[#48234F] bg-[#48234F]/10 text-[#48234F] dark:border-red-500/60 dark:bg-red-950/40 dark:text-red-300 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#48234F] dark:bg-red-400 animate-pulse" />
        Escalated / Action Required
      </span>
    );
  }

  if (status === 'In Progress') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded border border-amber-600/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
        In Progress
      </span>
    );
  }

  // Under Review (Default)
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded border border-[#C9B99F] bg-[#FAF7F0] text-[#777064] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#777064] dark:bg-slate-400" />
      Under Review
    </span>
  );
};
