'use client';

import { useState } from 'react';
import { api, ApiException } from '@/lib/api';

export function StatusUpdateSelect<TStatus extends string>({
  id,
  currentStatus,
  options,
  endpoint,
  onUpdated,
}: {
  id: string;
  currentStatus: TStatus;
  options: { value: TStatus; label: string }[];
  endpoint: string; // e.g. '/complaints' or '/applications'
  onUpdated: (newStatus: TStatus) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(newStatus: TStatus) {
    if (newStatus === currentStatus) return;
    setError(null);
    setUpdating(true);
    try {
      await api.patch(`${endpoint}/${id}/status`, { status: newStatus });
      onUpdated(newStatus);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : 'Update failed');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <select
        value={currentStatus}
        disabled={updating}
        onChange={(e) => handleChange(e.target.value as TStatus)}
        className="text-xs rounded-md border border-border bg-bg px-2 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
