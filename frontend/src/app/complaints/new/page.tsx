'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { api, ApiException } from '@/lib/api';
import type { Complaint } from '@/types';

const CATEGORIES = [
  'Water Supply',
  'Electricity',
  'Roads & Infrastructure',
  'Sanitation',
  'Public Safety',
  'Healthcare',
  'Education',
  'Other',
];

export default function NewComplaintPage() {
  const { user, ready } = useCurrentUser();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Complaint | null>(null);

  if (!ready) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const complaint = await api.post<Complaint>('/complaints', {
        title,
        category,
        description,
      });
      setSuccess(complaint);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : 'Unable to submit complaint.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AppShell user={user}>
        <PageHeader title="Complaint submitted" />
        <div className="p-8 max-w-xl">
          <div className="bg-surface border border-border rounded-lg p-8 text-center">
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-2">
              Complaint submitted
            </p>
            <h2 className="font-serif text-2xl text-ink mb-4">
              Tracking number: {success.trackingNo}
            </h2>
            <p className="text-ink-muted text-sm mb-6">
              Keep this number for reference. You can track the status of this complaint from
              your complaints list at any time.
            </p>
            <Link
              href="/complaints"
              className="inline-block bg-gov-900 hover:bg-gov-800 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
            >
              View my complaints
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <PageHeader
        title="File a complaint"
        subtitle="Describe the issue clearly. It will be routed to the relevant department."
      />

      <div className="p-8 max-w-xl">
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ink mb-1">
              Title
            </label>
            <input
              id="title"
              required
              minLength={5}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Brief summary of the issue"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-ink mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-ink mb-1">
              Description
            </label>
            <textarea
              id="description"
              required
              minLength={10}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              placeholder="Provide details: location, date, and what happened"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gov-900 hover:bg-gov-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-md transition-colors"
          >
            {loading ? 'Submitting…' : 'Submit complaint'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
