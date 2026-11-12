'use client';

import { ReactNode, Suspense } from 'react';
import type { Role } from '@/lib/const';
import Sidebar from './Sidebar';

const DEMO_USER_NAMES: Record<Role, string> = {
  admin: 'Admin',
  juriste: 'Juriste 1',
  assistant: 'Assistant 1',
};

interface RoleLayoutProps {
  role: Role;
  children: ReactNode;
}

/**
 * Coquille commune aux trois espaces.
 * Le fond animé est déjà rendu par src/app/layout.tsx : ne pas en ajouter un second ici.
 */
export default function RoleLayout({ role, children }: RoleLayoutProps) {
  return (
    <div className="g-app">
      <Suspense fallback={<div className="g-side g-glass" />}>
        <Sidebar role={role} userName={DEMO_USER_NAMES[role]} />
      </Suspense>
      <main className="g-main">{children}</main>
    </div>
  );
}
