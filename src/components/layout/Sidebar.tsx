'use client';

/**
 * Menu latéral ACX Flow — habillage Glassy V22.
 * La logique, les hrefs, les groupes et les compteurs ne changent pas :
 * seul le balisage visuel est remplacé (classes g-).
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';
import { FlowLogo, FlowTag } from '@/components/brand/FlowBrand';
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

const DEMO_EMAIL: Record<Role, string> = {
  admin: 'Espace Xceed',
  juriste: 'Démo · Juriste 1',
  assistant: 'Démo · Assistant 1',
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

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  avancement: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15l3.5-4 3 2.5L20 7" />
    </svg>
  ),
  dossiers: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M4 5h16v14H4z" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  ),
  presence: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  pointage: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  ),
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Sidebar({ role, userName = role.charAt(0).toUpperCase() + role.slice(1) }: SidebarProps) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const search = searchParams?.toString() || '';
  const menu = getMenu(role);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Compteurs lus dans le store de workflow
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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <aside className={`g-side g-glass${mobileOpen ? ' is-open' : ''}`}>
      <div className="g-brand">
        <FlowLogo variant="dark" height={30} />
        <button
          type="button"
          className="g-icon-btn g-nav-toggle"
          aria-label="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      <FlowTag variant="dark" />
      <div className="g-space"><i /> {SPACE_LABEL[role]}</div>

      <nav className="g-nav" aria-label="Navigation principale">
        {menu.items.map((item) => {
          const hasSub = !!item.subitems?.length;
          const parentActive = hrefMatches(pathname, search, item.href);
          const open = openGroups[item.id] ?? false;
          const childActive = hasSub && item.subitems!.some((sub) => hrefMatches(pathname, search, sub.href));
          const icon = ICONS[item.id] ?? ICONS.dashboard;

          if (!hasSub) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`g-nav-item${parentActive ? ' is-active' : ''}`}
                aria-current={parentActive ? 'page' : undefined}
              >
                {icon}
                {item.label}
              </Link>
            );
          }

          const unread = item.id === 'dossiers'
            ? item.subitems!.reduce((sum, sub) => {
                const params = new URLSearchParams(sub.href.split('?')[1] || '');
                const step = params.get('etape') || '';
                return sum + (step ? getUnreadCount(step) : 0);
              }, 0)
            : 0;

          return (
            <div key={item.id} className={`g-nav-group${open ? ' is-open' : ''}`}>
              <button
                type="button"
                aria-expanded={open}
                className={childActive || parentActive ? 'is-active-parent' : undefined}
                onClick={() => setOpenGroups((prev) => ({ ...prev, [item.id]: !open }))}
                style={childActive ? { color: 'var(--g-text)' } : undefined}
              >
                {icon}
                {item.label}
                {unread > 0 && <span className="g-nav-count" suppressHydrationWarning>{unread}</span>}
                <span className="g-chev" aria-hidden="true">›</span>
              </button>
              <div className="g-nav-sub">
                {item.subitems!.map((sub, subIndex) => {
                  const matches = hrefMatches(pathname, search, sub.href);
                  const firstMatch = item.subitems!.findIndex((x) => hrefMatches(pathname, search, x.href));
                  const active = matches && subIndex === firstMatch;
                  const params = new URLSearchParams(sub.href.split('?')[1] || '');
                  const step = params.get('etape') || '';
                  const n = item.id === 'dossiers' && step ? getUnreadCount(step) : 0;
                  return (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      className={active ? 'is-active' : undefined}
                      aria-current={active ? 'page' : undefined}
                    >
                      {sub.label}
                      {n > 0 && <span className="g-nav-count" suppressHydrationWarning>{n}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="g-who">
        <div className="g-session">
          <span className="g-avatar" aria-hidden="true">{initials(userName)}</span>
          <span className="g-session-meta">
            <b>{userName}</b>
            <span>{DEMO_EMAIL[role]}</span>
          </span>
        </div>
        <div className="g-side-foot">
          {ROLE_LABEL[role]}
          <br />
          Espace de démonstration · dossiers DEMO
        </div>
      </div>
    </aside>
  );
}
