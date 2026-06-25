'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { api } from '@/lib/api';
import type { Complaint, Application } from '@/types';

export default function AdminOverviewPage() {
  const { user, ready } = useCurrentUser({ requireRole: 'ADMIN' });
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    Promise.all([
      api.get<Complaint[]>('/complaints/admin/all'),
      api.get<Application[]>('/applications/admin/all'),
    ])
      .then(([c, a]) => {
        setComplaints(c);
        setApplications(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  const pendingComplaints = complaints.filter((c) => c.status !== 'RESOLVED').length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED').length;
  const pendingApplications = applications.filter(
    (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW',
  ).length;
  const completedApplications = applications.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'APPROVED',
  ).length;

  return (
    <AppShell user={user}>
      <PageHeader
        title="Registry overview"
        subtitle="System-wide activity across all submissions on Avenza."
      />

      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total complaints" value={complaints.length} />
          <StatCard label="Pending complaints" value={pendingComplaints} accent />
          <StatCard label="Total document requests" value={applications.length} />
          <StatCard label="Pending requests" value={pendingApplications} accent />
        </div>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <h2 className="font-serif text-lg text-ink">Latest complaints</h2>
            <Link href="/admin/complaints" className="text-xs text-accent hover:underline">
              Manage all complaints
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : complaints.length === 0 ? (
            <EmptyState message="No complaints in the system yet." />
          ) : (
            <div className="space-y-2">
              {complaints.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="bg-surface border border-border rounded-md px-4 py-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-ink-muted font-mono">{c.trackingNo}</p>
                    <p className="text-sm font-medium text-ink truncate">{c.title}</p>
                    <p className="text-xs text-ink-muted">{c.category}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <h2 className="font-serif text-lg text-ink">Latest document requests</h2>
            <Link href="/admin/applications" className="text-xs text-accent hover:underline">
              Manage all requests
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : applications.length === 0 ? (
            <EmptyState message="No document requests in the system yet." />
          ) : (
            <div className="space-y-2">
              {applications.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="bg-surface border border-border rounded-md px-4 py-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-ink-muted font-mono">{a.trackingNo}</p>
                    <p className="text-sm font-medium text-ink truncate">{a.applicantName}</p>
                    <p className="text-xs text-ink-muted">{a.type.replace(/_/g, ' ')}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-5 py-4">
      <p className="text-2xl font-serif text-ink">{value}</p>
      <p className={`text-xs mt-1 ${accent ? 'text-accent' : 'text-ink-muted'}`}>{label}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-surface border border-dashed border-border rounded-md px-4 py-8 text-center">
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  );
}
