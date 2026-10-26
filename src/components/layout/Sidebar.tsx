'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getMenu, type Role } from '@/lib/menu';

interface SidebarProps {
  role: Role;
  userName?: string;
}

const USER_ROLES: Record<Role, string> = {
  admin: 'Responsable département',
  juriste: 'Juriste',
  assistant: 'Assistant',
};

export default function Sidebar({ role, userName = role.charAt(0).toUpperCase() + role.slice(1) }: SidebarProps) {
  const pathname = usePathname();
  const menu = getMenu(role);

  return (
    <aside className="sidebar flow-sidebar bg-sidebar flow-navy text-sidebar-foreground">
      <div className="sidebar-brand">
        <div className="logo-box">
          <span className="logo-placeholder">ACX Flow</span>
        </div>
        <span className="sidebar-brand-label">ACX Flow</span>
      </div>

      <nav className="sidebar-nav flow-nav">
        {menu.items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const hasSub = item.subitems && item.subitems.length > 0;

          return (
            <div key={item.id} className="sidebar-group flow-group">
              <div className="sidebar-group-header flow-group-header">
                <Link
                  href={item.href}
                  className={`sidebar-item flow-item ${isActive ? 'active' : ''} flow-hover`}
                  onClick={(e) => { if (hasSub) e.preventDefault(); }}
                >
                  <span className="sidebar-item-text flow-item-text">{item.label}</span>
                  {hasSub && <span className="sidebar-item-dot" />}
                </Link>
                {hasSub && (
                  <div className="sidebar-submenu flow-submenu">
                    {item.subitems?.map((sub) => {
                      const subActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                      return (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className={`sidebar-subitem flow-subitem ${subActive ? 'active' : ''} flow-subhover`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-user flow-user bg-card flow-card-text">
        <div className="sidebar-user-info flow-user-info">
          <div className="sidebar-user-avatar flow-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-text flow-user-text">
            <div className="sidebar-user-name flow-user-name">{userName}</div>
            <div className="sidebar-user-role flow-user-role">{USER_ROLES[role]}</div>
          </div>
        </div>
        <div className="sidebar-user-version flow-user-version">Démo v1.0</div>
      </div>
    </aside>
  );
}
