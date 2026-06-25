'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusUpdateSelect } from '@/components/StatusUpdateSelect';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { api } from '@/lib/api';
import type { Application, ApplicationStatus } from '@/types';

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'COMPLETED', label: 'Completed' },
];

const APPLICATION_LABELS: Record<string, string> = {
  BIRTH_CERTIFICATE: 'Birth Certificate',
  DOMICILE_CERTIFICATE: 'Domicile Certificate',
  CHARACTER_CERTIFICATE: 'Character Certificate',
};

export default function AdminApplicationsPage() {
  const { user, ready } = useCurrentUser({ requireRole: 'ADMIN' });
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    api
      .get<Application[]>('/applications/admin/all')
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  function handleStatusChange(id: string, newStatus: ApplicationStatus) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    );
  }

  return (
    <AppShell user={user}>
      <PageHeader
        title="All document requests"
        subtitle={`${applications.length} request${applications.length === 1 ? '' : 's'} across the registry.`}
      />

      <div className="p-8">
        {loading ? (
          <p className="text-sm text-ink-muted">Loading…</p>
        ) : applications.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-md px-4 py-12 text-center">
            <p className="text-sm text-ink-muted">No document requests in the system yet.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-medium">Tracking no.</th>
                  <th className="px-4 py-3 font-medium">Document</th>
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Purpose</th>
                  <th className="px-4 py-3 font-medium">Filed</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Update</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted whitespace-nowrap">
                      {a.trackingNo}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {APPLICATION_LABELS[a.type] ?? a.type}
                    </td>
                    <td className="px-4 py-3 text-ink-muted whitespace-nowrap">{a.applicantName}</td>
                    <td className="px-4 py-3 text-ink-muted max-w-xs">
                      <span className="line-clamp-2">{a.purpose || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusUpdateSelect
                        id={a.id}
                        currentStatus={a.status}
                        options={STATUS_OPTIONS}
                        endpoint="/applications"
                        onUpdated={(newStatus) => handleStatusChange(a.id, newStatus)}
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
