'use client';

/**
 * Remplace / ajoute src/components/presence/PresenceVdm.tsx
 * Vues VDM : pointage du membre, temps réel, historique, gestion, rapport.
 * Couleurs des tags = VDM. Le reste reste Flow, navy et cyan.
 */

import { FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import {
  PEOPLE,
  TAGS,
  TagId,
  correctTag,
  dayKey,
  departureOf,
  formatClock,
  formatHm,
  getPresence,
  monthKey,
  openSegment,
  overLimit,
  rapportCsv,
  registerDeparture,
  resetPresence,
  rowsForMonth,
  saveMonth,
  secondsOf,
  startTag,
  subscribePresence,
  tagOf,
} from '@/lib/presence-demo';

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function usePresence() {
  return useSyncExternalStore(subscribePresence, getPresence, getPresence);
}

/** @deprecated La page pointage est complète dans pointage-page.tsx. */
export function PointageJour({ role }: { role: 'juriste' | 'assistant' }) {
  const state = usePresence();
  const now = useNow();
  const places = PEOPLE.filter((p) => p.role === role);
  const [personId, setPersonId] = useState(places[0]?.id || '');
  const [ask, setAsk] = useState(false);
  const day = dayKey(now);
  const person = PEOPLE.find((p) => p.id === personId) || places[0];
  const open = person ? state.segments.find((s) => s.id === openSegment(person.id, now)?.id) : undefined;
  const gone = person ? state.departures.find((d) => d.personId === person.id && d.day === day) : undefined;
  const activeSec = open ? secondsOf(open, now) : 0;
  const shiftSec = person
    ? state.segments.filter((s) => s.personId === person.id && s.tag === 'shift' && dayKey(new Date(s.start)) === day).reduce((sum, s) => sum + secondsOf(s, now), 0)
    : 0;
  const late = open ? overLimit(open.tag, activeSec) : false;
  const tag = open ? tagOf(open.tag) : null;

  function choose(id: TagId) {
    if (!person || gone) return;
    startTag(person.id, id);
    setAsk(false);
  }

  return (
    <div className="jx-pre">
      <style>{CSS}</style>
      <div className="top">
        <div>
          <div className="kicker">Xceed · Juridique</div>
          <h1>Présence du jour</h1>
          <p className="sub">Un seul tag actif. Le clic ferme le tag en cours et ouvre le nouveau.</p>
        </div>
        <div className="shift-total">
          <span>Shift total</span>
          <b>{formatClock(shiftSec)}</b>
        </div>
      </div>
      <label className="who">Je pointe en tant que
        <select value={person?.id || ''} onChange={(e) => { setPersonId(e.target.value); setAsk(false); }}>
          {places.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
        </select>
      </label>

      {gone ? (
        <section className="card farewell">
          <h2>Départ enregistré</h2>
          <p>Bonne fin de journée.</p>
          <p className="note">{gone.discharge === 'urgence' ? `Urgence. Écart calculé : ${gone.gapMin ?? 0} min sous 7 h 30.` : 'Objectif dépassé. L’écart de départ anticipé n’est pas calculé.'}</p>
        </section>
      ) : (
        <>
          <div className="tags">
            {TAGS.map((t) => (
              <button key={t.id} type="button" className={open?.tag === t.id ? 'tag on' : 'tag'} style={{ color: t.color, background: t.bg, borderColor: open?.tag === t.id ? t.color : 'transparent' }} onClick={() => choose(t.id)}>
                <i style={{ background: t.color }} />
                {t.label}
                <small>{t.limitSec == null ? 'Sans limite' : t.minimum ? '7 h 30 min.' : `${t.limitSec / 60} min max`}</small>
              </button>
            ))}
          </div>
          <section className={`card active ${late ? 'late' : ''}`}>
            {tag && open ? (
              <>
                <div className="active-h">
                  <i style={{ background: tag.color }} />
                  <div>
                    <b>{tag.label}</b>
                    <span>Depuis {new Date(open.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="timer">{formatClock(activeSec)}</div>
                {late && <p className="over">Dépassement</p>}
              </>
            ) : <p className="note">Aucun tag ouvert. Choisissez-en un.</p>}
          </section>
          <div className="acts">
            <button className="act" type="button" disabled={!open} onClick={() => setAsk(true)}>Enregistrer mon départ</button>
          </div>
          {ask && (
            <section className="card">
              <h2>Décharge</h2>
              <div className="acts">
                <button className="ghost" type="button" onClick={() => registerDeparture(person.id, 'objectif')}>Objectif dépassé</button>
                <button className="ghost" type="button" onClick={() => registerDeparture(person.id, 'urgence')}>Urgence</button>
              </div>
              <p className="note">Objectif dépassé : l’écart de départ anticipé n’est pas calculé. Urgence : l’écart sous 7 h 30 est calculé.</p>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export function PresenceAdmin() {
  const state = usePresence();
  const now = useNow();
  const [tab, setTab] = useState<'live' | 'history' | 'manage' | 'report'>('live');
  const [filter, setFilter] = useState<TagId | 'tous'>('tous');
  const [personId, setPersonId] = useState(PEOPLE[0].id);
  const [histDay, setHistDay] = useState(dayKey(now));
  const [month, setMonth] = useState(monthKey(now));
  const [segId, setSegId] = useState('');
  const [nextTag, setNextTag] = useState<TagId>('shift');
  const [note, setNote] = useState('');

  const live = PEOPLE.map((p) => {
    const open = state.segments.find((s) => s.personId === p.id && s.end === null && dayKey(new Date(s.start)) === dayKey(now));
    const gone = departureOf(p.id, dayKey(now));
    return { p, open, gone, sec: open ? secondsOf(open, now) : 0 };
  });
  const counts = Object.fromEntries(TAGS.map((t) => [t.id, live.filter((x) => x.open?.tag === t.id).length])) as Record<TagId, number>;
  const shown = live.filter((x) => filter === 'tous' || x.open?.tag === filter);
  const history = state.segments
    .filter((s) => s.personId === personId && dayKey(new Date(s.start)) === histDay && s.end)
    .sort((a, b) => a.start.localeCompare(b.start));
  const saved = state.savedMonths[month];
  const rows = saved?.rows || rowsForMonth(month, now);

  function onCorrect(e: FormEvent) {
    e.preventDefault();
    if (!segId) return;
    correctTag(segId, nextTag, 'Admin');
    setNote('Correction tracée. L’admin ne pointe pas à la place du membre sans trace.');
  }

  function copyCsv() {
    const text = rapportCsv(rows);
    navigator.clipboard?.writeText(text).then(() => setNote('Tableau copié.')).catch(() => setNote('Copie refusée par le navigateur.'));
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `presence-${month}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="jx-pre">
      <style>{CSS}</style>
      <div className="top">
        <div>
          <div className="kicker">Xceed · Juridique</div>
          <h1>Présence de l’équipe</h1>
          <p className="sub">Cinq places. Pas les agents, pas les TL, pas les SPV, pas la production.</p>
        </div>
        <button className="ghost" type="button" onClick={() => resetPresence()}>Réinitialiser la démo</button>
      </div>
      <div className="tabs">
        {([['live', 'Temps réel'], ['history', 'Historique'], ['manage', 'Gestion'], ['report', 'Rapport']] as const).map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'live' && (
        <section className="card">
          <p className="hint">{live.filter((x) => x.open || x.gone).length} / {PEOPLE.length} membres vus aujourd’hui.</p>
          <div className="filters">
            <button type="button" className={filter === 'tous' ? 'on' : ''} onClick={() => setFilter('tous')}>Tous · {live.length}</button>
            {TAGS.map((t) => (
              <button key={t.id} type="button" className={filter === t.id ? 'on' : ''} onClick={() => setFilter(t.id)}>{t.label} · {counts[t.id]}</button>
            ))}
          </div>
          <div className="cards">
            {shown.map(({ p, open, gone, sec }) => {
              const t = open ? tagOf(open.tag) : null;
              const late = open ? overLimit(open.tag, sec) : false;
              return (
                <article key={p.id} className="person" style={{ borderColor: t?.color || '#e4e8f1' }}>
                  <b>{p.nom}</b>
                  {t ? <span className="pill" style={{ color: t.color, background: t.bg }}>{t.label}</span> : <span className="pill mute">Pas de tag ouvert</span>}
                  <div className={`timer small ${late ? 'late' : ''}`}>{open ? formatClock(sec) : '—:—:—'}</div>
                  {late && <p className="over">Dépassement</p>}
                  {gone && <p className="note">Départ enregistré · {gone.discharge === 'urgence' ? 'Urgence' : 'Objectif dépassé'}</p>}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'history' && (
        <section className="card">
          <div className="row">
            <label>Membre
              <select value={personId} onChange={(e) => setPersonId(e.target.value)}>{PEOPLE.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}</select>
            </label>
            <label>Jour<input type="date" value={histDay} onChange={(e) => setHistDay(e.target.value)} /></label>
          </div>
          {history.length === 0 ? <p className="note">Aucun segment fermé ce jour.</p> : history.map((s) => (
            <div key={s.id} className="seg">
              <b style={{ color: tagOf(s.tag).color }}>{tagOf(s.tag).label}</b>
              <span>{formatHm(secondsOf(s, now))} · {new Date(s.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} – {s.end ? new Date(s.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'ouvert'}</span>
            </div>
          ))}
        </section>
      )}

      {tab === 'manage' && (
        <section className="card">
          <p className="hint">L’admin corrige un tag. La correction est tracée, avec l’auteur. Il ne pointe pas à leur place sans trace.</p>
          <form onSubmit={onCorrect} className="row">
            <label>Segment
              <select value={segId} onChange={(e) => setSegId(e.target.value)} required>
                <option value="">Choisir</option>
                {state.segments.filter((s) => dayKey(new Date(s.start)) === dayKey(now)).map((s) => (
                  <option key={s.id} value={s.id}>{PEOPLE.find((p) => p.id === s.personId)?.nom} · {tagOf(s.tag).label}</option>
                ))}
              </select>
            </label>
            <label>Nouveau tag
              <select value={nextTag} onChange={(e) => setNextTag(e.target.value as TagId)}>
                {TAGS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
            <button className="act" type="submit">Corriger</button>
          </form>
          {state.segments.flatMap((s) => s.trace.map((tr) => (
            <p key={`${s.id}-${tr.at}`} className="note">{PEOPLE.find((p) => p.id === s.personId)?.nom} · {tagOf(tr.from).label} → {tagOf(tr.to).label} · {tr.author} · {new Date(tr.at).toLocaleString('fr-FR')}</p>
          )))}
          {note && <p className="okmsg">{note}</p>}
        </section>
      )}

      {tab === 'report' && (
        <section className="card">
          <div className="row">
            <label>Mois comptable<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label>
            <button className="ghost" type="button" onClick={copyCsv}>Copier et CSV</button>
            <button className="act" type="button" disabled={!!saved} onClick={() => { saveMonth(month); setNote(saved ? '' : 'Mois enregistré. Il ne se réécrit pas tout seul.'); }}>Enregistrer le mois</button>
          </div>
          {saved && <p className="note">Mois figé le {new Date(saved.savedAt).toLocaleString('fr-FR')}.</p>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Membre</th><th>Jour</th>
                  {TAGS.map((t) => <th key={t.id}>{t.label}</th>)}
                  <th>Alertes</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? <tr><td colSpan={11}>Aucune ligne ce mois.</td></tr> : rows.map((r) => (
                  <tr key={`${r.personId}-${r.day}`}>
                    <td>{r.nom}</td>
                    <td>{r.day}</td>
                    {TAGS.map((t) => <td key={t.id}>{r.seconds[t.id] ? formatHm(r.seconds[t.id]) : '—'}</td>)}
                    <td>{r.alerts.join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {note && <p className="okmsg">{note}</p>}
        </section>
      )}
    </div>
  );
}

const CSS = `
.jx-pre { color: #18213b; font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
.jx-pre * { box-sizing: border-box; }
.jx-pre button, .jx-pre select, .jx-pre input { font: inherit; }
.jx-pre button { cursor: pointer; }
.jx-pre h1 { margin: 4px 0 0; font-size: 28px; letter-spacing: -.03em; color: #0b1330; }
.jx-pre h2 { margin: 0 0 6px; font-size: 16px; color: #0b1330; }
.jx-pre .kicker { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #0aa8bd; font-weight: 800; }
.jx-pre .sub, .jx-pre .hint, .jx-pre .note { color: #62708a; font-size: 13px; line-height: 1.45; }
.jx-pre .top { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 14px; }
.jx-pre .shift-total { text-align: right; }
.jx-pre .shift-total span { display: block; color: #62708a; font-size: 12px; font-weight: 800; }
.jx-pre .shift-total b { font-size: 28px; color: #0b1330; letter-spacing: -.03em; }
.jx-pre .card { background: #fff; border: 1px solid #e4e8f1; border-radius: 18px; padding: 14px; margin-top: 12px; }
.jx-pre .who, .jx-pre label { display: grid; gap: 4px; font-size: 12px; font-weight: 800; color: #62708a; }
.jx-pre select, .jx-pre input { border: 1px solid #e4e8f1; border-radius: 10px; padding: 8px 10px; background: #fff; color: #18213b; }
.jx-pre .tags { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
.jx-pre .tag { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; border: 1px solid transparent; border-radius: 14px; padding: 10px; text-align: left; font-weight: 800; }
.jx-pre .tag small { font-weight: 650; font-size: 11px; opacity: .8; }
.jx-pre .tag i, .jx-pre .active-h i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.jx-pre .active-h { display: flex; gap: 8px; align-items: center; }
.jx-pre .active-h span, .jx-pre .seg span { display: block; color: #62708a; font-size: 12px; }
.jx-pre .timer { margin-top: 8px; font-size: 42px; font-weight: 800; letter-spacing: -.04em; color: #0b1330; font-variant-numeric: tabular-nums; }
.jx-pre .timer.small { font-size: 28px; }
.jx-pre .timer.late, .jx-pre .over { color: #b42318; }
.jx-pre .card.late { border-color: #f3c3be; background: #fff8f7; }
.jx-pre .over { margin: 4px 0 0; font-weight: 800; }
.jx-pre .acts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.jx-pre .act, .jx-pre .ghost { border-radius: 999px; padding: 8px 12px; font-weight: 800; }
.jx-pre .act { border: 0; background: #0b1330; color: #fff; }
.jx-pre .act:disabled { opacity: .45; cursor: not-allowed; }
.jx-pre .ghost { border: 1px solid #e4e8f1; background: #fff; color: #0b1330; }
.jx-pre .tabs, .jx-pre .filters { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
.jx-pre .tabs button, .jx-pre .filters button { border: 1px solid #e4e8f1; background: #fff; color: #62708a; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 800; }
.jx-pre .tabs button.on, .jx-pre .filters button.on { background: #0b1330; color: #fff; border-color: #0b1330; }
.jx-pre .cards { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.jx-pre .person { border: 1px solid #e4e8f1; border-radius: 14px; padding: 10px; background: #fff; }
.jx-pre .pill { display: inline-block; margin-top: 8px; padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 800; }
.jx-pre .pill.mute { background: #f3f6fb; color: #62708a; }
.jx-pre .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: end; }
.jx-pre .seg { display: flex; justify-content: space-between; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e4e8f1; }
.jx-pre .table-wrap { overflow-x: auto; margin-top: 10px; }
.jx-pre table { width: 100%; border-collapse: collapse; font-size: 12px; }
.jx-pre th, .jx-pre td { text-align: left; padding: 6px; border-top: 1px solid #e4e8f1; white-space: nowrap; }
.jx-pre th { color: #62708a; font-size: 11px; }
.jx-pre .okmsg { margin-top: 8px; padding: 8px 10px; border-radius: 10px; background: #e8f6ee; color: #1f8a56; font-size: 12.5px; font-weight: 700; }
.jx-pre .farewell p { margin: 4px 0; }
@media (max-width: 1100px) {
  .jx-pre .tags, .jx-pre .cards { grid-template-columns: 1fr 1fr; }
  .jx-pre .top { flex-direction: column; align-items: start; }
}
`;
