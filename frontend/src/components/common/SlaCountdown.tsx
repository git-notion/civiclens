import React from 'react';
import { calculateSlaRemaining } from '../../utils/grievanceRules';
import { Clock, AlertTriangle } from 'lucide-react';

interface SlaCountdownProps {
  createdAt: string;
  slaDeadlineHours: number;
  isResolved?: boolean;
}

export const SlaCountdown: React.FC<SlaCountdownProps> = ({
  createdAt,
  slaDeadlineHours,
  isResolved,
}) => {
  if (isResolved) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800 tabular-nums">
        <Clock className="w-3.5 h-3.5" />
        SLA Met & Closed
      </span>
    );
  }

  const { hoursRemaining, isBreached, formatted } = calculateSlaRemaining(
    createdAt,
    slaDeadlineHours
  );

  if (isBreached) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-300 dark:border-rose-800 tabular-nums">
        <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
        {formatted}
      </span>
    );
  }

  if (hoursRemaining < 12) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-300 dark:border-amber-800 tabular-nums">
        <Clock className="w-3.5 h-3.5" />
        {formatted}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-[#777064] dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 rounded border border-[#C9B99F] dark:border-slate-700 tabular-nums">
      <Clock className="w-3.5 h-3.5" />
      {formatted}
    </span>
  );
};
