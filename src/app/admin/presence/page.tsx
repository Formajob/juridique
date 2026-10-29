'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { subscribePresence, getPresence, PEOPLE, TAGS, startTag, registerDeparture, dayKey, formatClock } from '@/lib/presence-demo';

export default function AdminPresencePage() {
  const state = useSyncExternalStore(subscribePresence, getPresence, getPresence);
  const now = new Date();
  const day = dayKey(now);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(PEOPLE[0]?.id || null);

  const todaySegments = state.segments.filter((s) => {
    const segDay = dayKey(new Date(s.start));
    return segDay === day;
  });

  const personSegments: Record<string, typeof state.segments[number] | null> = {};
  PEOPLE.forEach((person) => {
    personSegments[person.id] = null;
    todaySegments.forEach((seg) => {
      if (seg.personId === person.id) {
        personSegments[person.id] = seg;
      }
    });
  });

  const handleTagChange = (personId: string, tagId: string) => {
    startTag(personId, tagId as import('@/lib/presence-demo').TagId);
  };

  const handleDeparture = (personId: string, discharge: 'objectif' | 'urgence') => {
    registerDeparture(personId, discharge);
  };

  const getTagColor = (tagId: string | null) => {
    if (!tagId) return '#adb5bd';
    const tag = TAGS.find((t) => t.id === tagId);
    return tag ? tag.color : '#adb5bd';
  };

  return (
    <div className="jx-admin-presence">
      <style>{`
        .jx-admin-presence { color: #18213b; font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
        .jx-admin-presence h1 { margin: 4px 0 0; font-size: 24px; letter-spacing: -.03em; color: #0b1330; }
        .jx-admin-presence .kicker { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #0aa8bd; font-weight: 800; }
        .jx-admin-presence .sub { color: #62708a; font-size: 13px; line-height: 1.5; }
        .jx-admin-presence .section-title { font-size: 16px; font-weight: 800; color: #0b1330; margin: 24px 0 12px; }
        .jx-admin-presence .tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .jx-admin-presence .tab { padding: 8px 16px; border: 1px solid #e4e8f1; border-radius: 999px; background: #fff; color: #62708a; font-size: 12px; font-weight: 800; cursor: pointer; }
        .jx-admin-presence .tab.active { background: #0b1330; color: #fff; border-color: #0b1330; }
        .jx-admin-presence .card { background: #fff; border: 1px solid #e4e8f1; border-radius: 18px; padding: 16px; margin-bottom: 24px; }
        .jx-admin-presence .pointage-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 24px; }
        .jx-admin-presence .person-card { border: 1px solid #e4e8f1; border-radius: 18px; padding: 16px; background: #fff; }
        .jx-admin-presence .person-card.active { border-color: #9eeaf4; background: #f4fcfe; }
        .jx-admin-presence .person-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .jx-admin-presence .person-name { font-weight: 800; font-size: 14px; color: #0b1330; }
        .jx-admin-presence .person-role { font-size: 11px; color: #62708a; text-transform: uppercase; letter-spacing: .05em; }
        .jx-admin-presence .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .jx-admin-presence .tag-badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .jx-admin-presence .timer { font-size: 28px; font-weight: 800; color: #0b1330; font-variant-numeric: tabular-nums; line-height: 1; }
        .jx-admin-presence .timer-label { font-size: 11px; color: #62708a; margin-top: 4px; }
        .jx-admin-presence .tag-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
        .jx-admin-presence .tag-btn { padding: 8px 12px; border: 1px solid #e4e8f1; border-radius: 12px; background: #fff; color: #334155; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .2s; }
        .jx-admin-presence .tag-btn:hover { border-color: #9eeaf4; background: #f4fcfe; }
        .jx-admin-presence .tag-btn.active { border-color: #9eeaf4; background: #f4fcfe; color: #0b1330; }
        .jx-admin-presence .tag-btn.absent { color: #b42318; border-color: #fdeceb; }
        .jx-admin-presence .tag-btn.conge { color: #0f766e; border-color: #f0fdfa; }
        .jx-admin-presence .depart-btn { margin-top: 8px; padding: 8px 12px; border: 1px solid #e4e8f1; border-radius: 12px; background: #fff; color: #334155; font-size: 12px; font-weight: 700; cursor: pointer; width: 100%; }
        .jx-admin-presence .depart-btn:hover { background: #fdeceb; color: #b42318; border-color: #fdeceb; }
        .jx-admin-presence .depart-btn.urgence { background: #fdeceb; color: #b42318; border-color: #fdeceb; }
        .jx-admin-presence .history-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .jx-admin-presence .history-table th { text-align: left; color: #62708a; font-size: 11px; padding: 8px; border-bottom: 1px solid #e4e8f1; text-transform: uppercase; }
        .jx-admin-presence .history-table td { padding: 8px; border-bottom: 1px solid #e4e8f1; }
        .jx-admin-presence .history-table tr:hover { background: #f8fafc; }
      `}</style>

      <div>
        <div className="header">
          <div>
            <div className="kicker">Xceed · Juridique</div>
            <h1>Présence équipe — Admin</h1>
            <p className="sub">Gestion tracée des 5 places : Juriste 1, Juriste 2, Assistant 1, Assistant 2, Assistant 3.</p>
          </div>
        </div>

        <div className="tabs">
          {['Temps réel', 'Historique', 'Gestion', 'Rapport'].map((tab) => (
            <button key={tab} type="button" className={`tab ${tab === 'Temps réel' ? 'active' : ''}`}>
              {tab}
            </button>
          ))}
        </div>

      <div className="pointage-grid">
        {PEOPLE.map((person) => {
          const seg = personSegments[person.id];
          const isActif = seg !== null && seg.end === null;
          const tag = seg ? seg.tag : null;
          const tagDef = tag ? TAGS.find((t) => t.id === tag) : null;
          const isDeparted = todaySegments.some((s) => s.personId === person.id && s.end !== null && (s.tag === 'absent' || s.tag === 'conge'));

          return (
            <div key={person.id} className={`person-card ${selectedPerson === person.id ? 'active' : ''}`}>
              <div className="person-header">
                <div>
                  <div className="person-name">{person.nom}</div>
                  <div className="person-role">{person.role === 'juriste' ? 'Juriste' : 'Assistant'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="dot" style={{ background: isActif ? getTagColor(tag) : '#adb5bd' }} />
                  {tagDef ? (
                    <span className="tag-badge" style={{ background: '#f3f6fb', color: tagDef.color }}>
                      {tagDef.label}
                    </span>
                  ) : (
                    <span className="tag-badge" style={{ background: '#f3f6fb', color: '#62708a' }}>—</span>
                  )}
                </div>
              </div>

              <div className="timer">{isActif ? '—:—:—' : '—:—:—'}</div>
              <div className="timer-label">{isActif ? 'Tag actif' : 'Inactif'}</div>

              {isDeparted ? (
                <div style={{ marginTop: 8, padding: 8, background: '#f3f6fb', borderRadius: 10, fontSize: 11, color: '#62708a' }}>
                  Départ enregistré
                </div>
              ) : (
                <div className="tag-grid">
                  {TAGS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`tag-btn ${tag === t.id ? 'active' : ''} ${t.id === 'absent' ? 'absent' : ''} ${t.id === 'conge' ? 'conge' : ''}`}
                      onClick={() => handleTagChange(person.id, t.id)}
                      disabled={isDeparted}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              {!isDeparted && (
                <div style={{ marginTop: 8 }}>
                  <button type="button" className="depart-btn" onClick={() => handleDeparture(person.id, 'objectif')}>
                    Départ (objectif)
                  </button>
                  <button type="button" className="depart-btn urgence" onClick={() => handleDeparture(person.id, 'urgence')}>
                    Départ (urgence)
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="section-title">Historique des mouvements</div>
        <table className="history-table">
          <thead>
            <tr>
              <th>Membre</th>
              <th>Tag</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Durée</th>
            </tr>
          </thead>
          <tbody>
            {todaySegments.map((seg) => {
              const person = PEOPLE.find((p) => p.id === seg.personId);
              const tagDef = TAGS.find((t) => t.id === seg.tag);
              const end = seg.end ? new Date(seg.end) : null;
              const start = new Date(seg.start);
              return (
                <tr key={seg.id}>
                  <td>{person ? person.nom : 'Inconnu'}</td>
                  <td>{tagDef ? tagDef.label : seg.tag}</td>
                  <td>{start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{end ? end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td>{end ? Math.floor((end.getTime() - start.getTime()) / 60000) + ' min' : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="section-title">Rapport du mois</div>
        <p className="sub">Rapport mensuel de présence — disponible via l'onglet Rapport.</p>
      </div>

      </div>
    </div>
  );
}
