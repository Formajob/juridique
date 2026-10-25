'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getMenu, type Role } from '@/lib/menu';

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const menu = getMenu(role);

  return (
    <aside className="layout-sidebar">
      <div className="sidebar-brand">
        <div className="logo-box" style={{ width: 40, height: 16 }}>
          <span className="logo-placeholder" style={{ fontSize: 9, letterSpacing: '0.04em' }}>ACX</span>
        </div>
        <span className="sidebar-label" style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>
          ACX Flow
        </span>
      </div>

      <nav className="sidebar-nav">
        {menu.items.map((item) => (
          <div key={item.id} className="sidebar-group">
            <div className="sidebar-group-header">
              <Link
                href={item.href}
                className="sidebar-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'none',
                  color: 'var(--encre)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                <span className="sidebar-item-text">{item.label}</span>
                <span className="sidebar-item-dot" />
              </Link>
              {item.subitems && (
                <div className="sidebar-submenu">
                  {item.subitems.map((sub) => {
                    const isActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                    return (
                      <Link
                        key={sub.id}
                        href={sub.href}
                        className={`sidebar-subitem ${isActive ? 'active' : ''}`}
                        style={{ display: 'block', padding: '6px 12px', fontSize: 12, color: isActive ? 'var(--cyan)' : 'var(--texte-secondaire)', textDecoration: 'none' }}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--filet)' }}>
        <span className="sidebar-label" style={{ fontSize: 11, color: 'var(--texte-secondaire)' }}>
          Démo
        </span>
      </div>
    </aside>
  );
}

