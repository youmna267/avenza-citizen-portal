'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { api } from '@/lib/api';
import type { Complaint } from '@/types';

export default function ComplaintsListPage() {
  const { user, ready } = useCurrentUser();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    api
      .get<Complaint[]>('/complaints')
      .then(setComplaints)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <PageHeader
        title="My complaints"
        subtitle="Every complaint you've filed with the Office of Public Records."
        action={
          <Link
            href="/complaints/new"
            className="bg-gov-900 hover:bg-gov-800 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors whitespace-nowrap"
          >
            File a new complaint
          </Link>
        }
      />

      <div className="p-8">
        {loading ? (
          <p className="text-sm text-ink-muted">Loading…</p>
        ) : complaints.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-md px-4 py-12 text-center">
            <p className="text-sm text-ink-muted mb-4">No complaints filed yet.</p>
            <Link href="/complaints/new" className="text-accent text-sm hover:underline">
              File your first complaint
            </Link>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-medium">Tracking no.</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Filed</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{c.trackingNo}</td>
                    <td className="px-4 py-3 text-ink">{c.title}</td>
                    <td className="px-4 py-3 text-ink-muted">{c.category}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
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
