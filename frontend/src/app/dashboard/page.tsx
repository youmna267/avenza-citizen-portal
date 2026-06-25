'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { api } from '@/lib/api';
import type { Complaint, Application } from '@/types';

const APPLICATION_LABELS: Record<string, string> = {
  BIRTH_CERTIFICATE: 'Birth Certificate',
  DOMICILE_CERTIFICATE: 'Domicile Certificate',
  CHARACTER_CERTIFICATE: 'Character Certificate',
};

export default function DashboardPage() {
  const { user, ready } = useCurrentUser();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    Promise.all([
      api.get<Complaint[]>('/complaints'),
      api.get<Application[]>('/applications'),
    ])
      .then(([c, a]) => {
        setComplaints(c);
        setApplications(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  const openComplaints = complaints.filter((c) => c.status !== 'RESOLVED').length;
  const pendingApplications = applications.filter(
    (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW',
  ).length;

  return (
    <AppShell user={user}>
      <PageHeader
        title={`Welcome, ${user?.fullName?.split(' ')[0] ?? 'Citizen'}`}
        subtitle="An overview of your submissions with Avenza."
      />

      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <SummaryCard label="Total complaints" value={complaints.length} />
          <SummaryCard label="Open complaints" value={openComplaints} accent />
          <SummaryCard label="Pending applications" value={pendingApplications} accent />
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/complaints/new"
            className="bg-gov-900 hover:bg-gov-800 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
          >
            File a new complaint
          </Link>
          <Link
            href="/applications/new"
            className="border border-border text-ink hover:bg-surface-alt text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
          >
            Request a document
          </Link>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <h2 className="font-serif text-lg text-ink">Recent complaints</h2>
            <Link href="/complaints" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : complaints.length === 0 ? (
            <EmptyState message="No complaints filed yet." />
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
            <h2 className="font-serif text-lg text-ink">Recent document requests</h2>
            <Link href="/applications" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : applications.length === 0 ? (
            <EmptyState message="No document requests submitted yet." />
          ) : (
            <div className="space-y-2">
              {applications.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="bg-surface border border-border rounded-md px-4 py-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-ink-muted font-mono">{a.trackingNo}</p>
                    <p className="text-sm font-medium text-ink truncate">
                      {APPLICATION_LABELS[a.type] ?? a.type}
                    </p>
                    <p className="text-xs text-ink-muted">For: {a.applicantName}</p>
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

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
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
