'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getMenu, type Role } from '@/lib/menu';
import { FlowLogo, FlowTag } from '@/components/brand/FlowBrand';

interface SidebarProps {
  role: Role;
  userName?: string;
}

const USER_ROLES: Record<Role, string> = {
  admin: 'Responsable département',
  juriste: 'Juriste',
  assistant: 'Assistant',
};

function hrefMatches(currentPath: string, currentSearch: string, href: string) {
  const [path, query = ''] = href.split('?');
  if (currentPath !== path) return false;
  const current = new URLSearchParams(currentSearch);
  const target = new URLSearchParams(query);
  for (const [key, value] of target.entries()) {
    if (current.get(key) !== value) return false;
  }
  // If target has no query, only match when current has no query too.
  if (query === '' && current.toString() !== '') return false;
  return true;
}

export default function Sidebar({ role, userName = role.charAt(0).toUpperCase() + role.slice(1) }: SidebarProps) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const search = searchParams?.toString() || '';
  const menu = getMenu(role);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of menu.items) {
      if (item.subitems?.length) {
        const childActive = item.subitems.some((sub) => hrefMatches(pathname, search, sub.href));
        const parentActive = hrefMatches(pathname, search, item.href);
        initial[item.id] = childActive || parentActive;
      }
    }
    return initial;
  });

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-64 shrink-0 bg-[#0b1330] text-white flex flex-col min-h-screen border-r border-white/10">
      <div className="px-5 py-6 flex flex-col items-start gap-2 border-b border-white/10">
        <FlowLogo variant="light" height={34} />
        <FlowTag variant="light" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menu.items.map((item) => {
          const hasSub = !!item.subitems?.length;
          const parentActive = hrefMatches(pathname, search, item.href);
          const childActive = hasSub ? item.subitems!.some((sub) => hrefMatches(pathname, search, sub.href)) : false;
          const open = openGroups[item.id] ?? false;

          return (
            <div key={item.id} className="space-y-0.5">
              {hasSub ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    parentActive || childActive
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-white/60">{open ? '▾' : '▸'}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    parentActive
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )}

              {hasSub && open && (
                <div className="ml-3 pl-3 border-l border-white/15 flex flex-col gap-0.5">
                  {item.subitems!.map((sub) => {
                    const active = hrefMatches(pathname, search, sub.href);
                    return (
                      <Link
                        key={sub.id}
                        href={sub.href}
                        className={`block px-2 py-1.5 rounded-md text-xs transition-colors ${
                          active
                            ? 'bg-white text-[#0b1330] font-semibold'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{userName}</div>
            <div className="text-xs text-white/60 truncate">{USER_ROLES[role]}</div>
          </div>
        </div>
        <div className="text-[11px] text-white/40">Démo v1.0</div>
      </div>
    </aside>
  );
}