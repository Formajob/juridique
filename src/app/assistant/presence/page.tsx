'use client';

import { useState, useSyncExternalStore } from 'react';
import { subscribePresence, getPresence, PEOPLE, TAGS, startTag, registerDeparture, dayKey, overLimit, secondsOf, formatClock, type TagId } from '@/lib/presence-demo';

export default function AssistantPresencePage() {
  const state = useSyncExternalStore(subscribePresence, getPresence, getPresence);
  const assistants = PEOPLE.filter((p) => p.role === 'assistant');
  const now = new Date();
  const day = dayKey(now);
  const [selectedPersonId, setSelectedPersonId] = useState<string>(assistants[0]?.id || '');

  const todaySegments = state.segments.filter((s) => {
    const segDay = dayKey(new Date(s.start));
    return segDay === day;
  });

  const personSegments: Record<string, typeof state.segments[number] | null> = {};
  assistants.forEach((person) => {
    personSegments[person.id] = null;
    todaySegments.forEach((seg) => {
      if (seg.personId === person.id) {
        personSegments[person.id] = seg;
      }
    });
  });

  const person = assistants.find((p) => p.id === selectedPersonId) || assistants[0];
  const seg = personSegments[person?.id || ''] || null;
  const isActif = seg !== null && seg.end === null;
  const tag = seg ? seg.tag : null;
  const activeSec = seg ? secondsOf(seg, now) : 0;
  const late = tag ? overLimit(tag, activeSec) : false;

  const handleTagChange = (tagId: string) => {
    if (!person) return;
    if (tagId === 'absent' || tagId === 'conge') {
      registerDeparture(person.id, 'objectif');
    } else {
      startTag(person.id, tagId as TagId);
    }
  };

  const handleDeparture = (discharge: 'objectif' | 'urgence') => {
    if (!person) return;
    registerDeparture(person.id, discharge);
  };

  return (
    <div className="jx-presence">
      <style>{`
        .jx-presence { color: #18213b; font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
        .jx-presence h1 { margin: 4px 0 0; font-size: 24px; letter-spacing: -.03em; color: #0b1330; }
        .jx-presence .kicker { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #0aa8bd; font-weight: 800; }
        .jx-presence .sub { color: #62708a; font-size: 13px; line-height: 1.5; }
        .jx-presence .card { background: #fff; border: 1px solid #e4e8f1; border-radius: 18px; padding: 16px; margin-top: 12px; }
        .jx-presence .cards { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
        .jx-presence .person-card { border: 1px solid #e4e8f1; border-radius: 12px; padding: 12px; text-align: center; background: #fff; transition: border-color .2s; cursor: pointer; }
        .jx-presence .person-card.active { border-color: #9eeaf4; background: #f4fcfe; }
        .jx-presence .person-card .name { font-weight: 800; font-size: 13px; color: #0b1330; }
        .jx-presence .person-card .role { font-size: 11px; color: #62708a; text-transform: uppercase; letter-spacing: .05em; }
        .jx-presence .person-card .status { display: inline-block; padding: 3px 8px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-top: 4px; }
        .jx-presence .person-card .status.active { background: #e8f6ee; color: #1f8a56; }
        .jx-presence .timer-box { margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 12px; }
        .jx-presence .timer { font-size: 36px; font-weight: 800; color: #0b1330; font-variant-numeric: tabular-nums; line-height: 1; }
        .jx-presence .timer-late { color: #b42318; }
        .jx-presence .timer-label { font-size: 11px; color: #62708a; margin-top: 4px; }
        .jx-presence .tag-selector { margin-top: 16px; padding-top: 12px; border-top: 1px solid #e4e8f1; }
        .jx-presence .tag-selector .title { font-size: 12px; font-weight: 800; color: #62708a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .05em; }
        .jx-presence .tag-selector .tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .jx-presence .tag-selector .tag { padding: 8px 12px; border: 1px solid #e4e8f1; border-radius: 999px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .2s; }
        .jx-presence .tag-selector .tag.active { border-color: #9eeaf4; background: #f4fcfe; color: #0b1330; }
        .jx-presence .tag-selector .tag.absent { color: #b42318; border-color: #fdeceb; }
        .jx-presence .tag-selector .tag.conge { color: #0f766e; border-color: #f0fdfa; }
        .jx-presence .tag-selector .tag .icon { margin-right: 6px; display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: currentColor; }
        .jx-presence .tag-selector .tag .label { display: block; font-weight: 600; font-size: 12px; }
        .jx-presence .depart-section { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e4e8f1; }
        .jx-presence .depart-btn { padding: 10px 16px; border: 1px solid #e4e8f1; border-radius: 12px; background: #fff; color: #334155; font-size: 13px; font-weight: 700; cursor: pointer; margin-right: 8px; }
        .jx-presence .depart-btn:hover { background: #fdeceb; color: #b42318; border-color: #fdeceb; }
        .jx-presence .depart-btn.urgence { background: #fdeceb; color: #b42318; border-color: #fdeceb; }
        .jx-presence .journal { margin-top: 24px; }
        .jx-presence .journal .section-title { font-size: 14px; font-weight: 800; color: #0b1330; margin-bottom: 12px; }
        .jx-presence .journal-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .jx-presence .journal-table th { text-align: left; color: #62708a; font-size: 11px; padding: 8px; border-bottom: 1px solid #e4e8f1; text-transform: uppercase; }
        .jx-presence .journal-table td { padding: 8px; border-bottom: 1px solid #e4e8f1; }
        .jx-presence .journal-table tr:hover { background: #f8fafc; }
      `}</style>

      <div className="jx-presence">
        <div className="top">
          <div>
            <div className="kicker">Xceed · Juridique</div>
            <h1>Pointage — Assistant</h1>
            <p className="sub">Huit tags en lignes, un seul actif, minuteur, dépassement en rouge, journal du jour.</p>
          </div>
        </div>

        <div className="cards">
          {assistants.map((p) => {
            const s = personSegments[p.id];
            const isOn = s !== null && s.end === null;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPersonId(p.id)}
                className={`person-card ${selectedPersonId === p.id ? 'active' : ''}`}
              >
                <div className="name">{p.nom}</div>
                <div className="role">{p.role === 'juriste' ? 'Juriste' : 'Assistant'}</div>
                <div className="status" style={isOn ? { background: '#e8f6ee', color: '#1f8a56' } : { background: '#f3f6fb', color: '#62708a' }}>
                  {isOn ? 'En activité' : 'Inactif'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="timer-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#62708a', textTransform: 'uppercase' }}>{person?.nom}</span>
            {isActif && tag ? (
              <span style={{ background: '#f3f6fb', color: TAGS.find((t) => t.id === tag)?.color, padding: '2px 6px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                {TAGS.find((t) => t.id === tag)?.label}
              </span>
            ) : null}
          </div>
          <div className={`timer ${late ? 'timer-late' : ''}`}>{isActif ? formatClock(activeSec) : '—:—:—'}</div>
          <div className="timer-label">{isActif ? (late ? 'Dépassement en rouge' : 'Temps écoulé') : 'Aucun tag actif'}</div>
        </div>

        <div className="tag-selector">
          <div className="title">Choisir un tag</div>
          <div className="tags">
            {TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tag ${tag === t.id ? 'active' : ''} ${t.id === 'absent' ? 'absent' : ''} ${t.id === 'conge' ? 'conge' : ''}`}
                onClick={() => handleTagChange(t.id)}
                disabled={!!(seg && seg.end !== null)}
              >
                <span className="icon" style={{ background: t.color }} />
                <span className="label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {isActif && (
          <div className="depart-section">
            <button type="button" className="depart-btn" onClick={() => handleDeparture('objectif')}>
              Départ (objectif)
            </button>
            <button type="button" className="depart-btn urgence" onClick={() => handleDeparture('urgence')}>
              Départ (urgence)
            </button>
          </div>
        )}

        <div className="journal">
          <div className="section-title">Journal du jour</div>
          <table className="journal-table">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody>
              {todaySegments.filter((s) => s.personId === person?.id).map((s) => {
                const tagDef = TAGS.find((t) => t.id === s.tag);
                const end = s.end ? new Date(s.end) : null;
                const start = new Date(s.start);
                return (
                  <tr key={s.id}>
                    <td>{tagDef ? tagDef.label : s.tag}</td>
                    <td>{start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{end ? end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{end ? Math.floor((end.getTime() - start.getTime()) / 60000) + ' min' : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
