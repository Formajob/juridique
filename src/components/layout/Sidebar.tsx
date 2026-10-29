'use client';

/**
 * Menu latéral ACX Flow : navy, logo, « By ACX Maroc », icônes, sous-menus animés.
 * Ne pas le recopier dans les pages : RoleLayout l'affiche déjà.
 * Styles : src/styles/flow-shell.css (préfixe .fx-).
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';
import { etapePageGroup } from '@/lib/workflow-ui';
import { FlowLogo, FlowTag } from '@/components/brand/FlowBrand';
import { IconChevron, MenuIcon } from '@/components/flow/icons';
import { getMenu, type Role } from '@/lib/menu';

interface SidebarProps {
  role: Role;
  userName?: string;
}

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Responsable département',
  juriste: 'Juriste',
  assistant: 'Assistant',
};

const SPACE_LABEL: Record<Role, string> = {
  admin: 'Espace Juridique',
  juriste: 'Espace Juridique',
  assistant: 'Espace Assistant',
};

function hrefMatches(currentPath: string, currentSearch: string, href: string) {
  const [path, query = ''] = href.split('?');
  if (currentPath !== path) return false;
  const current = new URLSearchParams(currentSearch);
  const target = new URLSearchParams(query);
  for (const [key, value] of target.entries()) {
    if (current.get(key) !== value) return false;
  }
  if (query === '' && current.toString() !== '') return false;
  return true;
}

export default function Sidebar({ role, userName = role.charAt(0).toUpperCase() + role.slice(1) }: SidebarProps) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const search = searchParams?.toString() || '';
  const menu = getMenu(role);

  // Read from workflow store
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of menu.items) {
      if (!item.subitems?.length) continue;
      const childActive = item.subitems.some((sub) => hrefMatches(pathname, search, sub.href));
      initial[item.id] = childActive || item.id === 'dossiers';
    }
    return initial;
  });

  // Compute unread counts per step for Dossiers submenu
  const getUnreadCount = (step: string): number => {
    return snap.cases.filter((c) => c.etape === step && !c.notifie).length;
  };

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const item of menu.items) {
        if (!item.subitems?.length) continue;
        const childActive = item.subitems.some((sub) => hrefMatches(pathname, search, sub.href));
        if (childActive) next[item.id] = true;
      }
      return next;
    });
  }, [menu.items, pathname, search]);

  return (
    <aside className="jx-side">
      <style>{CSS}</style>
      <FlowLogo variant="light" height={30} />
      <FlowTag variant="light" />
      <p className="space">{SPACE_LABEL[role]}</p>
      <nav>
        {menu.items.map((item) => {
          const hasSub = !!item.subitems?.length;
          const parentActive = hrefMatches(pathname, search, item.href);
          const open = openGroups[item.id] ?? false;

          if (!hasSub) {
            return (
              <Link key={item.id} href={item.href} className={parentActive ? 'nav on' : 'nav'} aria-current={parentActive ? 'page' : undefined}>
                {item.label}
              </Link>
            );
          }

          // Dossiers menu with notifications
          if (item.id === 'dossiers') {
            return (
              <div key={item.id}>
                <button
                  type="button"
                  className="nav parent"
                  aria-expanded={open}
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [item.id]: !open }))}
                >
                  {item.label}
                  <span className="caret">{open ? '▾' : '▸'}</span>
                </button>
                {open && (
                  <div className="kids">
                    {item.subitems!.map((sub) => {
                      // Extract etape from href query: /admin/dossiers?etape=constatation_recue
                      const params = new URLSearchParams(sub.href.split('?')[1] || '');
                      const step = params.get('etape') || '';
                      const active = hrefMatches(pathname, search, sub.href);
                      return (
                        <Link key={sub.id} href={sub.href} className={active ? 'child on' : 'child'} aria-current={active ? 'page' : undefined}>
                          {sub.label}
                          {getUnreadCount(step) > 0 && <span className="badge">{getUnreadCount(step)}</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={item.id}>
              <button
                type="button"
                className="nav parent"
                aria-expanded={open}
                onClick={() => setOpenGroups((prev) => ({ ...prev, [item.id]: !open }))}
              >
                {item.label}
                <span className="caret">{open ? '▾' : '▸'}</span>
              </button>
              {open && (
                <div className="kids">
                  {item.subitems!.map((sub) => {
                    const active = hrefMatches(pathname, search, sub.href);
                    return (
                      <Link key={sub.id} href={sub.href} className={active ? 'child on' : 'child'} aria-current={active ? 'page' : undefined}>
                        {sub.label}
                      </Link >
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="foot">
        <strong>{userName}</strong>
        {ROLE_LABEL[role]}
      </div>
    </aside>
  );
}

const CSS = `
.jx-side {
  width: 248px;
  flex-shrink: 0;
  min-height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px 12px 16px;
  color: #d5deef;
  background: #0b1330;
  font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif;
}
.jx-side * { box-sizing: border-box; }
.jx-side .flow-logo { width: 196px; height: 30px; object-fit: contain; object-position: left center; }
.jx-side .flow-tag { margin: 8px 0 16px; }
.jx-side .space {
  margin: 0 8px 10px;
  font-size: 11px;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: #8ea0c3;
  font-weight: 800;
}
.jx-side nav { display: flex; flex-direction: column; gap: 2px; flex: 1; overflow-y: auto; }
.jx-side .nav, .jx-side .child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #c5cee2;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  font: inherit;
}
.jx-side .badge {
  display: inline-block;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: 6px;
  border-radius: 999px;
  background: #f3c3be;
  color: #b42318;
  font-size: 11px;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
}
.jx-side .nav { padding: 9px 12px; font-weight: 700; font-size: 14px; }
.jx-side .child { padding: 7px 12px 7px 28px; font-size: 13px; font-weight: 650; color: #aeb9d2; }
.jx-side .nav:hover, .jx-side .child:hover { background: rgba(255,255,255,.05); color: #fff; }
.jx-side .nav.on, .jx-side .child.on {
  background: rgba(38,212,234,.12);
  color: #fff;
  box-shadow: inset 3px 0 0 #26d4ea;
}
.jx-side .kids { display: flex; flex-direction: column; margin: 0 0 4px; }
.jx-side .caret { font-size: 10px; opacity: .7; }
.jx-side .foot {
  margin-top: auto;
  padding: 12px 8px 0;
  border-top: 1px solid rgba(255,255,255,.08);
  font-size: 12px;
  color: #9aabc4;
}
.jx-side .foot strong { display: block; color: #fff; font-size: 13px; }
`;
