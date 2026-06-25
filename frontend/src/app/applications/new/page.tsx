'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { api, ApiException } from '@/lib/api';
import type { Application, ApplicationType } from '@/types';

const DOCUMENT_TYPES: { value: ApplicationType; label: string; description: string }[] = [
  {
    value: 'BIRTH_CERTIFICATE',
    label: 'Birth Certificate',
    description: 'Official record of birth registration',
  },
  {
    value: 'DOMICILE_CERTIFICATE',
    label: 'Domicile Certificate',
    description: 'Proof of permanent residence within the district',
  },
  {
    value: 'CHARACTER_CERTIFICATE',
    label: 'Character Certificate',
    description: 'Police-verified certificate of good conduct',
  },
];

export default function NewApplicationPage() {
  const { user, ready } = useCurrentUser();
  const [type, setType] = useState<ApplicationType>('BIRTH_CERTIFICATE');
  const [applicantName, setApplicantName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Application | null>(null);

  useEffect(() => {
    if (user?.fullName) setApplicantName(user.fullName);
  }, [user]);

  if (!ready) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const application = await api.post<Application>('/applications', {
        type,
        applicantName,
        purpose: purpose || undefined,
      });
      setSuccess(application);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : 'Unable to submit request.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AppShell user={user}>
        <PageHeader title="Request submitted" />
        <div className="p-8 max-w-xl">
          <div className="bg-surface border border-border rounded-lg p-8 text-center">
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-2">
              Request submitted
            </p>
            <h2 className="font-serif text-2xl text-ink mb-4">
              Tracking number: {success.trackingNo}
            </h2>
            <p className="text-ink-muted text-sm mb-6">
              Your document request has been received and will be reviewed by the issuing
              office. Track its progress from your document requests list.
            </p>
            <Link
              href="/applications"
              className="inline-block bg-gov-900 hover:bg-gov-800 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
            >
              View my document requests
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <PageHeader
        title="Request a document"
        subtitle="Select the certificate you need and confirm the applicant details."
      />

      <div className="p-8 max-w-xl">
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Document type</label>
            <div className="space-y-2">
              {DOCUMENT_TYPES.map((doc) => (
                <label
                  key={doc.value}
                  className={`flex items-start gap-3 border rounded-md px-3 py-3 cursor-pointer transition-colors ${
                    type === doc.value
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-ink-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="docType"
                    value={doc.value}
                    checked={type === doc.value}
                    onChange={() => setType(doc.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">{doc.label}</p>
                    <p className="text-xs text-ink-muted">{doc.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="applicantName" className="block text-sm font-medium text-ink mb-1">
              Applicant full name
            </label>
            <input
              id="applicantName"
              required
              minLength={2}
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-ink mb-1">
              Purpose <span className="text-ink-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="purpose"
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              placeholder="e.g. School admission, employment verification"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gov-900 hover:bg-gov-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-md transition-colors"
          >
            {loading ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
