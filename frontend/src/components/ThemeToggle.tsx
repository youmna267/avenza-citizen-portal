'use client';

import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm text-sidebar-text hover:bg-white/5 hover:text-white transition-colors"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <span className="flex items-center gap-3">
        {isDark ? (
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
            <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 2.5v1.5M10 16v1.5M17.5 10H16M4 10H2.5M15.3 4.7l-1.1 1.1M5.8 14.2l-1.1 1.1M15.3 15.3l-1.1-1.1M5.8 5.8 4.7 4.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
            <path d="M16.5 11.8A6.5 6.5 0 0 1 8.2 3.5a6.5 6.5 0 1 0 8.3 8.3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        )}
        {isDark ? 'Light theme' : 'Dark theme'}
      </span>
      <span
        className={`relative w-8 h-4.5 rounded-full transition-colors ${isDark ? 'bg-accent' : 'bg-white/20'}`}
        style={{ height: '18px' }}
      >
        <span
          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
            isDark ? 'translate-x-[15px]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
