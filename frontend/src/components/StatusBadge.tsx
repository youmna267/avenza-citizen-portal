type Status =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

const STYLES: Record<Status, string> = {
  SUBMITTED: 'bg-surface-alt text-ink-muted border-border',
  UNDER_REVIEW: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  REJECTED: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
};

const LABELS: Record<Status, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  RESOLVED: 'Resolved',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
