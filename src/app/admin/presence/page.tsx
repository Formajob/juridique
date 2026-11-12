'use client';

/**
 * Présence — admin. Habillage Glassy V22.
 * Les règles ne bougent pas : mêmes huit tags, mêmes couleurs, même minuteur,
 * même départ de journée, aucune correction silencieuse.
 */

import { useState, useEffect, useSyncExternalStore } from 'react';
import {
  subscribePresence,
  getPresence,
  PEOPLE,
  TAGS,
  startTag,
  registerDeparture,
  dayKey,
  formatClock,
} from '@/lib/presence-demo';

const TABS = ['Temps réel', 'Historique', 'Gestion', 'Rapport'];

function initials(name: string) {
  return name.split(/\s+/).map((w) => w.charAt(0)).join('').slice(0, 2).toUpperCase();
}

export default function AdminPresencePage() {
  const state = useSyncExternalStore(subscribePresence, getPresence, getPresence);
  const [now, setNow] = useState(() => new Date());
  const [selectedPerson, setSelectedPerson] = useState<string | null>(PEOPLE[0]?.id || null);
  const day = dayKey(now);

  // Le minuteur avance à la seconde, comme avant.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const todaySegments = state.segments.filter((s) => dayKey(new Date(s.start)) === day);

  const personSegments: Record<string, (typeof state.segments)[number] | null> = {};
  PEOPLE.forEach((person) => {
    personSegments[person.id] = null;
    todaySegments.forEach((seg) => {
      if (seg.personId === person.id) personSegments[person.id] = seg;
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

  const activeCount = PEOPLE.filter((p) => {
    const seg = personSegments[p.id];
    return seg && !seg.end;
  }).length;

  return (
    <>
      <header className="g-top g-rise" style={{ ['--d' as string]: '.02s' }}>
        <div>
          <div className="g-kicker"><i /> Xceed · Juridique</div>
          <h1>Présence équipe</h1>
          <p className="g-lead">
            Gestion tracée des 5 places : Juriste 1, Juriste 2, Assistant 1, Assistant 2, Assistant 3.
            Un seul tag actif à la fois ; le clic ferme le tag en cours et ouvre le nouveau.
          </p>
        </div>
        <div className="g-tools">
          <span className="g-chip">
            <i className="g-dot" style={{ background: 'var(--g-ok)', color: 'var(--g-ok)' }} />
            {activeCount} en poste
          </span>
          <span className="g-date" suppressHydrationWarning>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </header>

      <nav className="g-tabs g-rise" style={{ ['--d' as string]: '.05s' }} aria-label="Vues de la présence">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`g-tab${tab === 'Temps réel' ? ' is-active' : ''}`}
            aria-current={tab === 'Temps réel' ? 'page' : undefined}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Cartes de pointage */}
      <section
        className="g-rise"
        style={{ ['--d' as string]: '.08s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 13 }}
      >
        {PEOPLE.map((person) => {
          const seg = personSegments[person.id];
          const isActif = seg !== null && !seg.end;
          const tag = seg ? seg.tag : null;
          const tagDef = tag ? TAGS.find((t) => t.id === tag) : null;
          const isDeparted = todaySegments.some(
            (s) => s.personId === person.id && s.end !== null && (s.tag === 'absent' || s.tag === 'conge')
          );
          const selected = selectedPerson === person.id;

          return (
            <article
              key={person.id}
              className="g-glass g-card"
              style={{
                padding: 15,
                gap: 12,
                borderColor: selected ? 'rgba(37,99,235,.45)' : undefined,
                boxShadow: selected ? 'var(--g-shadow),0 0 0 3px rgba(37,99,235,.12)' : undefined,
              }}
              onClick={() => setSelectedPerson(person.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="g-avatar" aria-hidden="true" style={{ background: isActif ? `linear-gradient(145deg,${getTagColor(tag)},var(--g-cyan-2))` : undefined }}>
                  {initials(person.nom)}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <b style={{ display: 'block', fontSize: 13 }}>{person.nom}</b>
                  <span style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--g-muted-2)' }}>
                    {person.role === 'juriste' ? 'Juriste' : 'Assistant'}
                  </span>
                </span>
                {tagDef ? (
                  <span className="g-badge" style={{ background: `${tagDef.color}14`, color: tagDef.color, borderColor: 'transparent' }}>
                    <i className="g-dot" />
                    {tagDef.label}
                  </span>
                ) : (
                  <span className="g-badge is-muted">—</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <b className="g-num" suppressHydrationWarning style={{ fontSize: 27, letterSpacing: '-.03em' }}>
                  {isActif && seg ? formatClock(Math.max(0, Math.floor((now.getTime() - new Date(seg.start).getTime()) / 1000))) : '—:—:—'}
                </b>
                <span style={{ fontSize: 10.5, color: 'var(--g-muted-2)', fontWeight: 650 }}>
                  {isActif ? 'tag actif' : isDeparted ? 'journée close' : 'inactif'}
                </span>
              </div>

              {isDeparted ? (
                <div className="g-badge is-muted" style={{ justifyContent: 'center', padding: '8px 10px' }}>
                  Départ enregistré
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {TAGS.map((t) => {
                    const on = tag === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleTagChange(person.id, t.id);
                        }}
                        disabled={isDeparted}
                        title={t.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          padding: '7px 4px',
                          borderRadius: 10,
                          border: `1px solid ${on ? t.color : 'var(--g-stroke)'}`,
                          background: on ? `${t.color}16` : 'var(--g-glass-2)',
                          color: on ? t.color : 'var(--g-muted)',
                          fontSize: 10.5,
                          fontWeight: 750,
                          lineHeight: 1.1,
                          whiteSpace: 'nowrap',
                          transition: 'all .2s',
                        }}
                      >
                        <i className="g-dot" style={{ background: t.color, color: t.color }} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {!isDeparted && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <button
                    type="button"
                    className="g-btn g-btn--ghost g-btn--sm"
                    style={{ whiteSpace: 'nowrap', padding: '0 8px' }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDeparture(person.id, 'objectif');
                    }}
                  >
                    Départ objectif
                  </button>
                  <button
                    type="button"
                    className="g-btn g-btn--ghost g-btn--sm"
                    style={{ color: 'var(--g-bad)', whiteSpace: 'nowrap', padding: '0 8px' }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDeparture(person.id, 'urgence');
                    }}
                  >
                    Départ urgence
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Historique */}
      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.12s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">Historique des mouvements</h3>
            <p className="g-card-sub">Journée en cours. Une correction est tracée avec son auteur.</p>
          </div>
          <span className="g-badge is-info">{todaySegments.length} mouvement{todaySegments.length > 1 ? 's' : ''}</span>
        </div>
        {todaySegments.length === 0 ? (
          <p className="g-empty">Aucun mouvement enregistré aujourd&apos;hui.</p>
        ) : (
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Tag</th>
                  <th>Début</th>
                  <th>Fin</th>
                  <th style={{ textAlign: 'right' }}>Durée</th>
                </tr>
              </thead>
              <tbody>
                {todaySegments.map((seg) => {
                  const person = PEOPLE.find((p) => p.id === seg.personId);
                  const tagDef = TAGS.find((t) => t.id === seg.tag);
                  const end = seg.end ? new Date(seg.end) : null;
                  const start = new Date(seg.start);
                  return (
                    <tr key={seg.id} style={{ cursor: 'default' }}>
                      <td><span className="g-ref">{person ? person.nom : 'Inconnu'}</span></td>
                      <td>
                        <span className="g-badge" style={{ color: tagDef?.color, background: `${tagDef?.color}14`, borderColor: 'transparent' }}>
                          <i className="g-dot" />
                          {tagDef ? tagDef.label : seg.tag}
                        </span>
                      </td>
                      <td className="g-num">{start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="g-num">{end ? end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="g-num" style={{ textAlign: 'right' }}>
                        {end ? `${Math.floor((end.getTime() - start.getTime()) / 60000)} min` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="g-card-foot">
          <span>Huit tags : shift, pause, lunch, réunion, rencontre, formation, absent, congé.</span>
          <span>Pas de paie, pas de salaire</span>
        </div>
      </section>

      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.16s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">Rapport du mois</h3>
            <p className="g-card-sub">Mois comptable AAAA-MM. Enregistrer le mois fige les totaux.</p>
          </div>
          <span className="g-tag">Rapport</span>
        </div>
        <p className="g-empty" style={{ padding: '14px 4px' }}>
          Rapport mensuel de présence — disponible via l&apos;onglet Rapport.
        </p>
      </section>

      <footer className="g-foot">
        <span>ACX Flow · Espace Juridique — présence du bureau seulement.</span>
        <span className="g-tag">Glassy V22</span>
      </footer>
    </>
  );
}
