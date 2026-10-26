'use client';

import { useState, useEffect } from 'react';
import { createDemoTodayPointage, DEMO_POINTAGE_EST_DEPART } from '@/lib/demo-pointage';
import { POINTAGE_STATUTS } from '@/lib/const';

const STATUT_COLORS: Record<string, string> = {
  shift: 'var(--cyan-fonce)', pause: 'var(--violet)', lunch: '#b8860b',
  meeting: '#2a5a8c', rencontre: '#6a2a8c', formation: '#2a5a8c',
  absent: '#757575', conge: '#8a6a00',
};

const STATUT_LABELS: Record<string, string> = {
  shift: 'Shift', pause: 'Pause', lunch: 'Lunch', meeting: 'Réunion',
  rencontre: 'Rencontre', formation: 'Formation', absent: 'Absent', conge: 'Congé',
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function AdminPresencePage() {
  const shifts = createDemoTodayPointage();
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Présence équipe</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>
            Les 5 places en direct — statut et temps de chaque pointeur.
          </p>
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--navy)', fontFamily: '"SF Mono", Consolas, monospace' }}>
          {formatTime(timerSeconds)}
        </div>
      </header>

      <div className="pointage-grid">
        {shifts.map((shift) => {
          const identifiant = shift.utilisateur?.identifiant ?? shift.utilisateurId;
          const estDepart = DEMO_POINTAGE_EST_DEPART[identifiant as keyof typeof DEMO_POINTAGE_EST_DEPART] ?? false;
          const isActif = shift.statut === 'shift' || shift.statut === 'pause' || shift.statut === 'lunch' || shift.statut === 'meeting' || shift.statut === 'rencontre' || shift.statut === 'formation';

          return (
            <div key={shift.id} className="card card-hover">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--encre)', fontSize: 15 }}>{shift.utilisateur?.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--texte-secondaire)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{shift.utilisateur?.role}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: isActif ? STATUT_COLORS[shift.statut] : '#adb5bd' }} />
                  <span className={`badge badge-${shift.statut}`} style={{ fontSize: 10 }}>
                    {STATUT_LABELS[shift.statut]}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--navy)', fontFamily: '"SF Mono", Consolas, monospace', lineHeight: 1 }}>
                  {isActif ? formatTime(timerSeconds) : '—:—:—'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--texte-secondaire)', marginTop: 4 }}>
                  {isActif ? 'Temps écoulé sur ce statut' : 'Inactif'}
                </div>
              </div>

              <div style={{ paddingTop: 16, borderTop: '1px solid var(--filet)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: estDepart ? 'var(--cyan-fonce)' : 'var(--texte-secondaire)' }}>
                  {estDepart ? 'Départ enregistré' : 'Pas encore départé'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--texte-secondaire)' }}>
                  {shift.statut === 'absent' || shift.statut === 'conge' ? 'Absent' : 'Présent'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>
          Légende des statuts
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {POINTAGE_STATUTS.map((s) => (
            <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--texte-secondaire)' }}>
              <span className={`badge badge-${s.id}`} style={{ fontSize: 10 }}>{s.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
