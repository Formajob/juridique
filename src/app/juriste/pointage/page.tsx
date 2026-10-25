'use client';

import { useState } from 'react';
import { createDemoTodayPointage } from '@/lib/demo-pointage';
import { POINTAGE_STATUTS } from '@/lib/const';

interface PointageCellProps {
  label: string;
  isActif: boolean;
  isDepart: boolean;
  onClick: () => void;
  total: string | null;
}

function PointageCell({ label, isActif, isDepart, onClick, total }: PointageCellProps) {
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
        {isDepart ? 'Deja parti' : 'Depart'}
      </span>
    </button>
  );
}

export default function JuristePointagePage() {
  const [activeStatut, setActiveStatut] = useState<string | null>(null);
  const [total, setTotal] = useState<string | null>(null);
  const shifts = createDemoTodayPointage();
  const personne = shifts[0]?.utilisateur;

  const handleStatut = (s: string) => {
    setActiveStatut(s === activeStatut ? null : s);
    setTotal(s === activeStatut ? null : '1h00');
  };

  const estDepart = true;

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Pointage</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Charger un statut et démarrer mon départ.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--encre)' }}>{personne?.nom || 'Juriste'}</span>
            <span style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Statut: {activeStatut || '-'}</span>
            {total && (
              <span style={{ backgroundColor: 'var(--navy)', color: 'white', padding: '2px 10px', borderRadius: '6px', fontWeight: 600, marginLeft: 8 }}>
                {total}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 12 }}>
            {POINTAGE_STATUTS.map((s) => (
              <button
                key={s.id}
                className="btn-pill"
                style={{
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  opacity: activeStatut === s.id ? 1 : 0.5,
                  cursor: activeStatut === s.id ? 'pointer' : 'not-allowed',
                  borderColor: activeStatut === s.id ? 'var(--cyan)' : 'var(--filet)',
                  backgroundColor: activeStatut === s.id ? 'rgba(38,212,234,0.08)' : 'var(--blanc)',
                }}
                onClick={() => handleStatut(s.id)}
              >
                <span>{s.label}</span>
                <span style={{ fontSize: 12, color: activeStatut === s.id ? 'var(--cyan)' : 'var(--texte-secondaire)' }}>
                  {estDepart ? 'Deja parti' : 'Depart'}
                </span>
              </button>
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
