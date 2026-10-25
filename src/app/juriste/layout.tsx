import type { ReactNode } from 'react';
import type { Role } from '@/lib/const';
import RoleLayout from '@/components/layout/RoleLayout';

export default function JuristeLayout({ children }: { children: ReactNode }) {
  return <RoleLayout role="juriste">{children}</RoleLayout>;
}
