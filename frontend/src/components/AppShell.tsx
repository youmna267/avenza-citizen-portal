import { Sidebar } from './Sidebar';
import type { User } from '@/types';

export function AppShell({
  user,
  children,
}: {
  user?: User | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar user={user} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
