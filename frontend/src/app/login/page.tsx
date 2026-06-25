'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SealMark } from '@/components/SealMark';
import { api, ApiException } from '@/lib/api';
import { saveSession } from '@/lib/auth';
import type { AuthResponse } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      saveSession(res.accessToken, res.refreshToken, res.user);
      router.push(res.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof ApiException ? err.message : 'Unable to sign in. Please try again.');
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
          Sign in
        </h1>
        <p className="text-gov-600/80 text-sm text-center mb-8">
          Sign in to your Avenza account
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-xl space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gov-700 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gov-700 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gov-900 hover:bg-gov-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-md transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-gov-600 font-medium hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
