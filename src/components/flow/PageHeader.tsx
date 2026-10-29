import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Affiche l'indicateur « En direct » (les données suivent l'activité). */
  live?: boolean;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, live, action }: PageHeaderProps) {
  return (
    <header className="fx-head">
      <div>
        <div className="fx-head-row">
          <h1 className="fx-title">{title}</h1>
          {live && (
            <span className="fx-live">
              <span className="fx-live-dot" aria-hidden="true" />
              En direct
            </span>
          )}
        </div>
        {subtitle && <p className="fx-sub">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}