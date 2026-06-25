'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SealMark } from './SealMark';
import { ThemeToggle } from './ThemeToggle';
import { clearSession } from '@/lib/auth';
import type { User } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: JSX.Element;
}

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="2.5" width="6.5" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="8.5" width="6.5" height="9" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  complaint: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path d="M3 4.5C3 3.67 3.67 3 4.5 3h7.5l5 5v8.5c0 .83-.67 1.5-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-12Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 3v4.5a1 1 0 0 0 1 1H17" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path d="M5 2.5h7l4 4V16a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 16V4a1.5 1.5 0 0 1 1-1.5Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 2.5V6a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  registry: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 17c.6-3.3 3.3-5.5 6.5-5.5s5.9 2.2 6.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

const CITIZEN_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: ICONS.dashboard },
  { href: '/complaints', label: 'My complaints', icon: ICONS.complaint },
  { href: '/applications', label: 'My document requests', icon: ICONS.document },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: ICONS.dashboard },
  { href: '/admin/complaints', label: 'All complaints', icon: ICONS.complaint },
  { href: '/admin/applications', label: 'All document requests', icon: ICONS.document },
];

export function Sidebar({ user }: { user?: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? ADMIN_NAV : CITIZEN_NAV;

  function handleLogout() {
    // Call logout API to blacklist tokens in Redis, then clear local session
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {}); // fire-and-forget — clear session regardless
    }
    clearSession();
    router.push('/login');
  }

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-sidebar flex flex-col border-r border-black/20">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
        <SealMark size={34} />
        <div className="leading-tight min-w-0">
          <p className="font-serif text-base text-white tracking-wide truncate">
            Avenza
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-accent">
            {isAdmin ? 'Staff portal' : 'Citizen services'}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {isAdmin && (
          <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-sidebar-text/60">
            Registry
          </p>
        )}
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-sidebar-active text-white'
                  : 'text-sidebar-text hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <ThemeToggle />
      </div>

      <div className="px-3 pb-5 pt-3 border-t border-white/10">
        <div className="px-3 pb-2">
          <p className="text-sm text-white truncate">{user?.fullName}</p>
          <p className="text-xs text-sidebar-text truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sidebar-text hover:text-white hover:bg-white/5 rounded-md transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
            <path d="M7.5 17.5h-3A1.5 1.5 0 0 1 3 16V4a1.5 1.5 0 0 1 1.5-1.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M13 14l4-4-4-4M17 10H7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
