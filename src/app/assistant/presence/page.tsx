'use client';

/**
 * Pointage personnel — Juriste / Assistant.
 * Huit tags, un seul actif, minuteur qui tourne, dépassement en rouge, journal du jour.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  subscribePresence, getPresence, PEOPLE, TAGS, startTag, registerDeparture,
  dayKey, overLimit, secondsOf, formatClock, type TagId,
} from '@/lib/presence-demo';

export default function AssistantPresencePage() {
  const state = useSyncExternalStore(subscribePresence, getPresence, getPresence);
  const assistants = PEOPLE.filter((p) => p.role === 'assistant');
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const day = dayKey(now);
  const [selectedPersonId, setSelectedPersonId] = useState<string>(assistants[0]?.id || '');

  const todaySegments = state.segments.filter((s) => dayKey(new Date(s.start)) === day);

  const personSegments: Record<string, typeof state.segments[number] | null> = {};
  assistants.forEach((person) => {
    personSegments[person.id] = null;
    todaySegments.forEach((seg) => {
      if (seg.personId === person.id) personSegments[person.id] = seg;
    });
  });

  const person = assistants.find((p) => p.id === selectedPersonId) || assistants[0];
  const seg = personSegments[person?.id || ''] || null;
  const isActif = seg !== null && seg.end === null;
  const tag = seg ? seg.tag : null;
  const activeSec = seg ? secondsOf(seg, now) : 0;
  const late = tag ? overLimit(tag, activeSec) : false;
  const tagDef = TAGS.find((t) => t.id === tag);

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

  const journal = todaySegments.filter((s) => s.personId === person?.id);

  return (
    <>
      <header className="g-page-head g-rise" style={{ ['--d' as string]: '.02s' }}>
        <div>
          <div className="g-kicker"><i /> Espace Assistant · Pointage</div>
          <h1>Pointage — Assistant</h1>
          <p>Huit tags, un seul actif à la fois, minuteur, dépassement en rouge, journal du jour.</p>
        </div>
        <span className="g-chip">{assistants.length} place{assistants.length > 1 ? 's' : ''}</span>
      </header>

      <section className="g-rise" style={{ ['--d' as string]: '.05s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
        {assistants.map((p) => {
          const s = personSegments[p.id];
          const isOn = s !== null && s.end === null;
          const active = selectedPersonId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPersonId(p.id)}
              className="g-glass"
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 18,
                border: `1px solid ${active ? 'rgba(37,99,235,.45)' : 'var(--g-stroke)'}`,
                background: active ? 'rgba(37,99,235,.08)' : 'var(--g-glass)',
                boxShadow: active ? '0 18px 40px -26px rgba(37,99,235,.65)' : 'var(--g-shadow)',
                transition: '.2s',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <b style={{ fontSize: 14, letterSpacing: '-.01em' }}>{p.nom}</b>
                <span className={`g-badge ${isOn ? 'is-ok' : ''}`}><i className="g-dot" />{isOn ? 'En activité' : 'Inactif'}</span>
              </div>
              <span style={{ display: 'block', marginTop: 4, fontSize: 10.5, fontWeight: 750, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--g-muted-2)' }}>
                {p.role === 'juriste' ? 'Juriste' : 'Assistant'}
              </span>
            </button>
          );
        })}
      </section>

      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.08s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">{person?.nom}</h3>
            <p className="g-card-sub">{isActif ? 'Temps écoulé sur le tag en cours.' : 'Aucun tag actif pour cette place.'}</p>
          </div>
          {isActif && tagDef ? (
            <span className="g-badge" style={{ color: tagDef.color, background: tagDef.bg }}>
              <i className="g-dot" style={{ background: tagDef.color }} />{tagDef.label}
            </span>
          ) : (
            <span className="g-badge"><i className="g-dot" />Journée libre</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <b
            className="g-num"
            suppressHydrationWarning
            style={{ fontSize: 44, letterSpacing: '-.04em', lineHeight: 1, color: late ? 'var(--g-bad)' : 'var(--g-text)' }}
          >
            {isActif ? formatClock(activeSec) : '—:—:—'}
          </b>
          <span style={{ fontSize: 12, fontWeight: 700, color: late ? 'var(--g-bad)' : 'var(--g-muted)' }}>
            {isActif ? (late ? 'Dépassement du plafond' : 'Temps écoulé') : 'Choisir un tag ci-dessous'}
          </span>
        </div>

        <div className="g-card-head" style={{ marginTop: 18 }}>
          <div>
            <h3 className="g-card-title">Choisir un tag</h3>
            <p className="g-card-sub">Un clic ferme le tag en cours et ouvre le nouveau.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TAGS.map((t) => {
            const on = tag === t.id && isActif;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTagChange(t.id)}
                disabled={!!(seg && seg.end !== null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  height: 34,
                  padding: '0 13px',
                  borderRadius: 999,
                  border: `1px solid ${on ? 'rgba(37,99,235,.5)' : 'rgba(15,35,80,.14)'}`,
                  background: on ? t.bg : 'rgba(255,255,255,.82)',
                  color: on ? t.color : 'var(--g-text)',
                  fontSize: 12,
                  fontWeight: 750,
                  whiteSpace: 'nowrap',
                  cursor: seg && seg.end !== null ? 'not-allowed' : 'pointer',
                  opacity: seg && seg.end !== null ? 0.55 : 1,
                  transition: '.18s',
                }}
              >
                <i className="g-dot" style={{ background: t.color }} />
                {t.label}
              </button>
            );
          })}
        </div>

        {isActif && (
          <>
            <div className="g-card-foot" style={{ marginTop: 18 }}>
              <span>La sortie enregistre l&rsquo;heure de départ</span>
              <span className="g-tag">Pas de paie</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="g-btn g-btn--ghost g-btn--sm" style={{ whiteSpace: 'nowrap' }} onClick={() => handleDeparture('objectif')}>
                Départ (objectif)
              </button>
              <button
                type="button"
                className="g-btn g-btn--ghost g-btn--sm"
                style={{ color: 'var(--g-bad)', whiteSpace: 'nowrap' }}
                onClick={() => handleDeparture('urgence')}
              >
                Départ (urgence)
              </button>
            </div>
          </>
        )}
      </section>

      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.11s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">Journal du jour</h3>
            <p className="g-card-sub">{person?.nom} · les mouvements de la journée.</p>
          </div>
          <span className="g-tag">{journal.length} mouvement{journal.length > 1 ? 's' : ''}</span>
        </div>
        {journal.length === 0 ? (
          <p className="g-empty">Aucun mouvement aujourd&rsquo;hui pour cette place.</p>
        ) : (
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>Tag</th><th>Début</th><th>Fin</th><th>Durée</th></tr>
              </thead>
              <tbody>
                {journal.map((s) => {
                  const d = TAGS.find((t) => t.id === s.tag);
                  const end = s.end ? new Date(s.end) : null;
                  const start = new Date(s.start);
                  return (
                    <tr key={s.id} style={{ cursor: 'default' }}>
                      <td>
                        <span className="g-badge" style={{ color: d?.color, background: d?.bg }}>
                          <i className="g-dot" style={{ background: d?.color }} />{d ? d.label : s.tag}
                        </span>
                      </td>
                      <td className="g-num">{start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="g-num">{end ? end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="g-num">{end ? Math.floor((end.getTime() - start.getTime()) / 60000) + ' min' : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="g-foot">
        <span>ACX Flow · Pointage — présence du bureau seulement</span>
        <span className="g-tag">Glassy V22</span>
      </footer>
    </>
  );
}
