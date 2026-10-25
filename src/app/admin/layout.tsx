import type { ReactNode } from 'react';
import type { Role } from '@/lib/const';
import RoleLayout from '@/components/layout/RoleLayout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleLayout role="admin">{children}</RoleLayout>;
}
