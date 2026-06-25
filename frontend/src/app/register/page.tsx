'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SealMark } from '@/components/SealMark';
import { api, ApiException } from '@/lib/api';
import { saveSession } from '@/lib/auth';
import type { AuthResponse } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    cnic: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        cnic: form.cnic || undefined,
      });
      saveSession(res.accessToken, res.refreshToken, res.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiException ? err.message : 'Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gov-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-sm w-full">
        <div className="flex justify-center mb-4">
          <SealMark size={48} />
        </div>
        <p className="font-serif text-lg text-white text-center mb-1">Avenza</p>
        <h1 className="font-serif text-2xl text-white text-center mb-1">
          Create your account
        </h1>
        <p className="text-gov-600/80 text-sm text-center mb-8">
          Register to access Avenza services
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-xl space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-ink mb-1">
              Full name
            </label>
            <input
              id="fullName"
              required
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gov-700 focus:border-transparent"
              placeholder="Jane Citizen"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gov-700 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-ink mb-1">
                Phone
              </label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gov-700 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
            <div>
              <label htmlFor="cnic" className="block text-sm font-medium text-ink mb-1">
                CNIC
              </label>
              <input
                id="cnic"
                value={form.cnic}
                onChange={(e) => update('cnic', e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gov-700 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gov-700 focus:border-transparent"
              placeholder="At least 8 characters"
            />
            <p className="text-xs text-slate-500 mt-1">
              Must include an uppercase letter, a lowercase letter, and a number or symbol.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gov-900 hover:bg-gov-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-md transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Already registered?{' '}
            <Link href="/login" className="text-gov-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
