'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { api } from '@/lib/api';
import type { Application } from '@/types';

const APPLICATION_LABELS: Record<string, string> = {
  BIRTH_CERTIFICATE: 'Birth Certificate',
  DOMICILE_CERTIFICATE: 'Domicile Certificate',
  CHARACTER_CERTIFICATE: 'Character Certificate',
};

export default function ApplicationsListPage() {
  const { user, ready } = useCurrentUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    api
      .get<Application[]>('/applications')
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  return (
    <AppShell user={user}>
      <PageHeader
        title="My document requests"
        subtitle="Every certificate request you've submitted."
        action={
          <Link
            href="/applications/new"
            className="bg-gov-900 hover:bg-gov-800 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors whitespace-nowrap"
          >
            Request a document
          </Link>
        }
      />

      <div className="p-8">
        {loading ? (
          <p className="text-sm text-ink-muted">Loading…</p>
        ) : applications.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-md px-4 py-12 text-center">
            <p className="text-sm text-ink-muted mb-4">No document requests submitted yet.</p>
            <Link href="/applications/new" className="text-accent text-sm hover:underline">
              Submit your first request
            </Link>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-medium">Tracking no.</th>
                  <th className="px-4 py-3 font-medium">Document</th>
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Filed</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{a.trackingNo}</td>
                    <td className="px-4 py-3 text-ink">{APPLICATION_LABELS[a.type] ?? a.type}</td>
                    <td className="px-4 py-3 text-ink-muted">{a.applicantName}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
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
