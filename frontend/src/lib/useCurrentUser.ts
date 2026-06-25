'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, isAuthenticated } from '@/lib/auth';
import type { User, UserRole } from '@/types';

interface Options {
  requireRole?: UserRole;
}

export function useCurrentUser(options: Options = {}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    const stored = getStoredUser();

    if (options.requireRole && stored?.role !== options.requireRole) {
      // Logged in, but wrong role for this section — send to their own dashboard
      router.replace(stored?.role === 'ADMIN' ? '/admin' : '/dashboard');
      return;
    }

    setUser(stored);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return { user, ready };
}
