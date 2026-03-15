import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

export function AppShell({ children, showNav = true }: { children: ReactNode; showNav?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[430px] min-h-screen relative">
        <div className={showNav ? 'pb-20' : ''}>
          {children}
        </div>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
