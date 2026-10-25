'use client';

import { ReactNode } from 'react';
import type { Role } from '@/lib/const';
import Sidebar from './Sidebar';

interface RoleLayoutProps {
  role: Role;
  children: ReactNode;
}

export default function RoleLayout({ role, children }: RoleLayoutProps) {
  return (
    <div className="layout">
      <Sidebar role={role} />
      <main className="layout-main">{children}</main>
    </div>
  );
}
