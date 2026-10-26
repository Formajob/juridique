import { ReactNode } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';

export default function AssistantLayout({ children }: { children: ReactNode }) {
  return <RoleLayout role="assistant">{children}</RoleLayout>;
}
