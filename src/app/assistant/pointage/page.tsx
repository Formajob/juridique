'use client';

import { useState } from 'react';
import { DEMO_POINTAGE_EST_DEPART } from '@/lib/demo-pointage';
import { POINTAGE_STATUTS } from '@/lib/const';

interface PointageCellProps {
  label: string;
  isActif: boolean;
  isDepart: boolean;
  onClick: () => void;
}

function PointageCell({ label, isActif, isDepart, onClick }: PointageCellProps) {
  return (
    <button
      onClick={onClick}
      className="btn-pill"
      style={{
        justifyContent: 'space-between',
        padding: '10px 14px',
        opacity: isActif ? 1 : 0.5,
        cursor: isActif ? 'pointer' : 'not-allowed',
        borderColor: isActif ? 'var(--cyan)' : 'var(--filet)',
        backgroundColor: isActif ? 'rgba(38,212,234,0.08)' : 'var(--blanc)',
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: 12, color: isActif ? 'var(--cyan)' : 'var(--texte-secondaire)' }}>
        {isDepart ? 'Deja depart' : 'Depart'}
      </span>
    </button>
  );
}

export default function AssistantPointagePage() {
  const [activeStatut, setActiveStatut] = useState<string | null>(null);
  const [total, setTotal] = useState<string | null>(null);

  const handleStatut = (s: string) => {
    setActiveStatut(s === activeStatut ? null : s);
    setTotal(s === activeStatut ? null : '1h00');
  };

  const estDepart = DEMO_POINTAGE_EST_DEPART['assistant-1'] ?? false;

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Pointage</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Assistant 1 · pointage de depart</p>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--encre)' }}>Assistant 1</span>
            <span style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Statut: {activeStatut || '-'}</span>
            {total && (
              <span style={{ backgroundColor: 'var(--navy)', color: 'white', padding: '2px 10px', borderRadius: '6px', fontWeight: 600, marginLeft: 8 }}>
                {total}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 12 }}>
            {POINTAGE_STATUTS.map((s) => (
              <PointageCell
                key={s.id}
                label={s.label}
                isActif={activeStatut === s.id}
                isDepart={estDepart}
                onClick={() => handleStatut(s.id)}
              />
            ))}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <button className="btn-primary" disabled={!activeStatut}>
              Enregistrer mon depart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
