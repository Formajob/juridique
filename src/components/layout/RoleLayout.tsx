'use client';

import { ReactNode } from 'react';
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

export default function RoleLayout({ role, children }: RoleLayoutProps) {
  return (
    <div className="layout bg-background text-foreground">
      <Sidebar role={role} userName={DEMO_USER_NAMES[role]} />
      <main className="layout-main">{children}</main>
    </div>
  );
}
