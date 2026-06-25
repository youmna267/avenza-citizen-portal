'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusUpdateSelect } from '@/components/StatusUpdateSelect';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { api } from '@/lib/api';
import type { Complaint, ComplaintStatus } from '@/types';

const STATUS_OPTIONS: { value: ComplaintStatus; label: string }[] = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'RESOLVED', label: 'Resolved' },
];

export default function AdminComplaintsPage() {
  const { user, ready } = useCurrentUser({ requireRole: 'ADMIN' });
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    api
      .get<Complaint[]>('/complaints/admin/all')
      .then(setComplaints)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  function handleStatusChange(id: string, newStatus: ComplaintStatus) {
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  }

  return (
    <AppShell user={user}>
      <PageHeader
        title="All complaints"
        subtitle={`${complaints.length} complaint${complaints.length === 1 ? '' : 's'} across the registry.`}
      />

      <div className="p-8">
        {loading ? (
          <p className="text-sm text-ink-muted">Loading…</p>
        ) : complaints.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-md px-4 py-12 text-center">
            <p className="text-sm text-ink-muted">No complaints in the system yet.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-medium">Tracking no.</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Filed</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Update</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted whitespace-nowrap">
                      {c.trackingNo}
                    </td>
                    <td className="px-4 py-3 text-ink max-w-xs">
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{c.description}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted whitespace-nowrap">{c.category}</td>
                    <td className="px-4 py-3 text-ink-muted whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusUpdateSelect
                        id={c.id}
                        currentStatus={c.status}
                        options={STATUS_OPTIONS}
                        endpoint="/complaints"
                        onUpdated={(newStatus) => handleStatusChange(c.id, newStatus)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
