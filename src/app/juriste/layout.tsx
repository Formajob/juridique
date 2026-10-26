import { ReactNode } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';

export default function JuristeLayout({ children }: { children: ReactNode }) {
  return <RoleLayout role="juriste">{children}</RoleLayout>;
}
