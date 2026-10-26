'use client';

import { useState, useEffect, useRef } from 'react';
import { createDemoTodayPointage } from '@/lib/demo-pointage';
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

const STATUT_MAX: Record<string, string> = {
  shift: '7h30 min', pause: '30 min max', lunch: '60 min', meeting: '60 min',
  rencontre: 'Séance d’écoute', formation: '60 min', absent: 'Sans limite', conge: 'Sans limite',
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function AssistantPointagePage() {
  const shifts = createDemoTodayPointage();
  const shift = shifts.find((s) => s.utilisateurId === 'person-assistant-1');
  const personne = shift?.utilisateur;
  const estDepart = shift?.statut === 'absent';

  const [activeStatut, setActiveStatut] = useState<string | null>(shift?.statut || null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [departEnregistre, setDepartEnregistre] = useState(!!estDepart);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeStatut && !departEnregistre) {
      timerRef.current = window.setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current); timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeStatut, departEnregistre]);

  const handleStatut = (s: string) => {
    setActiveStatut(s === activeStatut ? null : s);
    if (s !== activeStatut) setTimerSeconds(0);
  };

  const handleDepart = () => {
    setDepartEnregistre(true); setActiveStatut(null); setTimerSeconds(0);
  };

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Pointage</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>
            {personne?.nom} · {personne?.role}
          </p>
        </div>
        <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>
          {departEnregistre ? 'Départ enregistré' : 'En service'}
        </div>
      </header>

      <div style={{ display: 'grid', gap: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: activeStatut ? STATUT_COLORS[activeStatut] : '#adb5bd' }} />
            <span style={{ fontWeight: 600, color: 'var(--encre)' }}>
              Statut actuel : {activeStatut ? STATUT_LABELS[activeStatut] : '—'}
            </span>
          </div>
          {activeStatut && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 20, padding: 20, background: 'var(--fond)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: 12, color: 'var(--texte-secondaire)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Temps écoulé</div>
              <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--navy)', fontFamily: '"SF Mono", Consolas, monospace' }}>{formatTime(timerSeconds)}</div>
              <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>{STATUT_MAX[activeStatut]}</div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            {POINTAGE_STATUTS.map((s) => {
              const isActive = activeStatut === s.id;
              return (
                <button key={s.id} onClick={() => handleStatut(s.id)} className="btn-pill"
                  style={{
                    justifyContent: 'space-between', padding: '10px 14px', opacity: isActive ? 1 : 0.6,
                    cursor: isActive || departEnregistre ? 'not-allowed' : 'pointer',
                    borderColor: isActive ? STATUT_COLORS[s.id] : 'var(--filet)',
                    backgroundColor: isActive ? `${STATUT_COLORS[s.id]}15` : 'var(--blanc)',
                    color: isActive ? STATUT_COLORS[s.id] : 'var(--encre)', fontWeight: isActive ? 700 : 600,
                  }}
                  disabled={isActive || departEnregistre}
                >
                  <span>{s.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{departEnregistre ? '—' : 'Départ'}</span>
                </button>
              );
            })}
          </div>
        </div>        {/* Bouton depart */} <div className="card"> <div style={{ display: "flex", alignItems: "center", gap: 10 }}> <div style={{ width: 10, height: 10, borderRadius: "50%", background: departEnregistre ? "var(--cyan-fonce)" : "#adb5bd" }} /> <span style={{ fontWeight: 600, color: "var(--encre)" }}>{departEnregistre ? "Départ déjà enregistré" : "Enregistrer mon départ"}</span> </div> <button onClick={handleDepart} className="btn-primary" disabled={departEnregistre || !activeStatut} style={{ width: "100%", marginTop: 12 }}>{departEnregistre ? "Départ enregistré" : "Enregistrer mon départ"}</button> </div> {/* Informations */} <div className="card"> <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--encre)", marginBottom: 12 }}>Règles du pointage</h3> <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}> {POINTAGE_STATUTS.map((s) => ( <div key={s.id} style={{ fontSize: 12, color: "var(--texte-secondaire)" }}> <span className={`badge badge-${s.id}`} style={{ marginRight: 6, fontSize: 10 }}>{s.label}</span> {STATUT_MAX[s.id]} </div> ))} </div> </div> </div> </div> ); }