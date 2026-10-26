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

export default function RoleLayout({ role, children }: RoleLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#f6f7fb] text-[#18213b]">
<Suspense fallback={<div className="w-64 shrink-0 bg-[#0b1330]" />}>
      <Sidebar role={role} userName={DEMO_USER_NAMES[role]} />
    </Suspense>
      <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-auto">{children}</main>
    </div>
  );
}