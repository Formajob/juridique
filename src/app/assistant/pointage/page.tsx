'use client';

/**
 * Page complète. Même fichier pour :
 * src/app/juriste/pointage/page.tsx
 * src/app/assistant/pointage/page.tsx
 *
 * Vue membre VDM : huit tags en lignes, carte active, minuteur, journal, départ.
 * Nécessite src/lib/presence-demo.ts. Pas de second menu.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import {
  PEOPLE,
  TAGS,
  Segment,
  TagId,
  dayKey,
  formatClock,
  formatHm,
  getPresence,
  overLimit,
  registerDeparture,
  secondsOf,
  startTag,
  subscribePresence,
  tagOf,
} from '@/lib/presence-demo';

const SHIFT_MIN = 7.5 * 3600;

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function Icon({ id }: { id: TagId }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (id === 'shift') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></svg>;
  if (id === 'pause') return <svg {...common}><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>;
  if (id === 'lunch') return <svg {...common}><path d="M4 10h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2z" /><path d="M8 10V6M12 10V5M16 10V6" /></svg>;
  if (id === 'meeting') return <svg {...common}><path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" /><circle cx="9.5" cy="8" r="3" /><path d="M21 20v-1a3.5 3.5 0 0 0-2.5-3.3" /><path d="M16.5 5.2a3 3 0 0 1 0 5.6" /></svg>;
  if (id === 'rencontre') return <svg {...common}><path d="M8 11l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>;
  if (id === 'formation') return <svg {...common}><path d="M3 8l9-4 9 4-9 4-9-4z" /><path d="M7 10.5V16c2 1.5 8 1.5 10 0v-5.5" /></svg>;
  if (id === 'absent') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M8 8l8 8M16 8l-8 8" /></svg>;
  return <svg {...common}><path d="M12 3c2 3 2 5 0 7 3 0 6 2 6 5a6 6 0 1 1-12 0c0-3 3-5 6-5-2-2-2-4 0-7z" /></svg>;
}

export default function PointagePage() {
  const path = usePathname() || '';
  const role = path.includes('/assistant') ? 'assistant' : 'juriste';
  const state = useSyncExternalStore(subscribePresence, getPresence, getPresence);
  const now = useNow();
  const places = PEOPLE.filter((p) => p.role === role);
  const [personId, setPersonId] = useState(places[0]?.id || '');
  const [ask, setAsk] = useState(false);
  const [confirmClose, setConfirmClose] = useState<TagId | null>(null);
  const day = dayKey(now);
  const person = places.find((p) => p.id === personId) || places[0];
  const mine = person ? state.segments.filter((s) => s.personId === person.id && dayKey(new Date(s.start)) === day) : [];
  const open = mine.find((s) => s.end === null);
  const gone = person ? state.departures.find((d) => d.personId === person.id && d.day === day) : undefined;
  const activeSec = open ? secondsOf(open, now) : 0;
  const late = open ? overLimit(open.tag, activeSec) : false;
  const tag = open ? tagOf(open.tag) : null;
  const shiftSec = mine.filter((s) => s.tag === 'shift').reduce((sum, s) => sum + secondsOf(s, now), 0);
  const shiftRatio = Math.min(100, Math.round((shiftSec / SHIFT_MIN) * 100));
  const remain = open && tag?.limitSec != null && !tag.minimum ? tag.limitSec - activeSec : null;

  function choose(id: TagId) {
    if (!person || gone) return;
    if (id === 'absent' || id === 'conge') { setConfirmClose(id); return; }
    startTag(person.id, id);
    setAsk(false);
  }

  return (
    <div className="jx-pt">
      <style>{CSS}</style>
      <header className="head">
        <div>
          <div className="kicker">Xceed · Juridique</div>
          <h1>Présence du jour</h1>
          <p className="sub">{now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {now.toLocaleTimeString('fr-FR')}</p>
        </div>
        <div className="total">
          <span>Shift total</span>
          <b>{formatClock(shiftSec)}</b>
          <div className="bar" aria-hidden="true"><i style={{ width: `${shiftRatio}%` }} /></div>
          <small>{shiftSec >= SHIFT_MIN ? 'Minimum 7 h 30 atteint' : `${formatHm(SHIFT_MIN - shiftSec)} avant 7 h 30`}</small>
        </div>
      </header>

      <label className="who">Je pointe en tant que
        <select value={person?.id || ''} onChange={(e) => { setPersonId(e.target.value); setAsk(false); setConfirmClose(null); }}>
          {places.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
        </select>
      </label>

      {gone ? (
        <Farewell person={person?.nom || ''} gone={gone} mine={mine} now={now} />
      ) : (
        <div className="layout">
          <section className="card">
            <h2>Tags</h2>
            <p className="hint">Un seul tag actif. Le clic ferme le tag en cours et ouvre le nouveau. La ligne passe au rouge en dépassement.</p>
            <div className="lines">
              {TAGS.map((t) => {
                const on = open?.tag === t.id;
                const sec = mine.filter((s) => s.tag === t.id).reduce((sum, s) => sum + secondsOf(s, now), 0);
                const rowLate = on && overLimit(t.id, activeSec);
                return (
                  <button key={t.id} type="button" className={`line ${on ? 'on' : ''} ${rowLate ? 'over' : ''}`} onClick={() => choose(t.id)}>
                    <span className="ico" style={{ color: t.color, background: t.bg }}><Icon id={t.id} /></span>
                    <span className="lab">
                      <strong>{t.label}</strong>
                      <em>{t.limitSec == null ? 'Sans limite' : t.minimum ? '7 h 30 minimum' : `${t.limitSec / 60} min max`}</em>
                    </span>
                    <span className="time">{on ? formatClock(activeSec) : sec ? formatHm(sec) : '—'}</span>
                    {rowLate && <span className="flag">Dépassement</span>}
                  </button>
                );
              })}
            </div>
          </section>

          <section className={`card active ${late ? 'late' : ''}`}>
            <h2>Tag actif</h2>
            {tag && open ? (
              <>
                <div className="hero" style={{ color: tag.color }}>
                  <span className="ico big" style={{ background: tag.bg }}><Icon id={tag.id} /></span>
                  <div>
                    <b>{tag.label}</b>
                    <span>Début {new Date(open.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="timer">{formatClock(activeSec)}</div>
                {remain != null && !late && <p className="hint">{formatHm(remain)} avant la limite</p>}
                {late && <p className="overtext">Dépassement · {formatHm(Math.abs(remain ?? 0))}</p>}
                {tag.minimum && <p className="hint">Le shift n’a pas de plafond. Le minimum de 7 h 30 se lit dans le total.</p>}
                {(tag.id === 'absent' || tag.id === 'conge') && <p className="hint">Ce tag ferme la journée. Pas de minuteur de shift.</p>}
              </>
            ) : (
              <p className="hint">Aucun tag ouvert. Choisissez une ligne à gauche pour démarrer.</p>
            )}
            <button className="act" type="button" disabled={!open && shiftSec === 0} onClick={() => setAsk(true)}>Enregistrer mon départ</button>
          </section>
        </div>
      )}

      {!gone && <Journal mine={mine} now={now} />}

      {confirmClose && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmClose(null); }}>
          <div className="dialog" role="dialog" aria-modal="true">
            <h2>{tagOf(confirmClose).label} ferme la journée</h2>
            <p>Absent et Congé n’ouvrent pas de minuteur de shift. Le départ est enregistré tout de suite.</p>
            <div className="acts">
              <button className="act" type="button" onClick={() => { if (person) startTag(person.id, confirmClose); setConfirmClose(null); }}>Confirmer</button>
              <button className="ghost" type="button" onClick={() => setConfirmClose(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {ask && person && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setAsk(false); }}>
          <div className="dialog" role="dialog" aria-modal="true">
            <h2>Décharge de départ</h2>
            <p>Le tag en cours est fermé. Choisissez la décharge.</p>
            <button className="choice" type="button" onClick={() => { registerDeparture(person.id, 'objectif'); setAsk(false); }}>
              <b>Objectif dépassé</b>
              <span>L’écart de départ anticipé n’est pas calculé.</span>
            </button>
            <button className="choice" type="button" onClick={() => { registerDeparture(person.id, 'urgence'); setAsk(false); }}>
              <b>Urgence</b>
              <span>L’écart sous 7 h 30 est calculé.</span>
            </button>
            <button className="ghost" type="button" onClick={() => setAsk(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Journal({ mine, now }: { mine: Segment[]; now: Date }) {
  const ordered = [...mine].sort((a, b) => a.start.localeCompare(b.start));
  return (
    <section className="card journal">
      <h2>Journal du jour</h2>
      {ordered.length === 0 ? <p className="hint">Aucun segment pour l’instant.</p> : (
        <ol>
          {ordered.map((s) => {
            const t = tagOf(s.tag);
            const sec = secondsOf(s, now);
            return (
              <li key={s.id}>
                <span className="dot" style={{ background: t.color }} />
                <div>
                  <b>{t.label}</b>
                  <span>
                    {new Date(s.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {s.end ? new Date(s.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'en cours'}
                    {' · '}{formatHm(sec)}
                  </span>
                </div>
                {overLimit(s.tag, sec) && <em>Dépassement</em>}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function Farewell({ person, gone, mine, now }: { person: string; gone: { discharge: string; gapMin: number | null; at: string }; mine: Segment[]; now: Date }) {
  const totals = TAGS.map((t) => ({
    t,
    sec: mine.filter((s) => s.tag === t.id).reduce((sum, s) => sum + secondsOf(s, now), 0),
  })).filter((x) => x.sec > 0);
  return (
    <section className="card farewell">
      <h2>Départ enregistré</h2>
      <p className="bye">Bonne fin de journée{person ? `, ${person}` : ''}.</p>
      <p className="hint">
        {gone.discharge === 'urgence'
          ? `Urgence. Écart calculé : ${gone.gapMin ?? 0} min sous 7 h 30.`
          : 'Objectif dépassé. L’écart de départ anticipé n’est pas calculé.'}
        {' '}Départ à {new Date(gone.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.
      </p>
      <div className="totals">
        {totals.map(({ t, sec }) => (
          <div key={t.id}><b style={{ color: t.color }}>{t.label}</b><span>{formatHm(sec)}</span></div>
        ))}
      </div>
      <Journal mine={mine} now={now} />
    </section>
  );
}

const CSS = `
.jx-pt { color: #18213b; font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
.jx-pt * { box-sizing: border-box; }
.jx-pt button, .jx-pt select { font: inherit; }
.jx-pt button { cursor: pointer; }
.jx-pt h1 { margin: 4px 0 0; font-size: 28px; letter-spacing: -.03em; color: #0b1330; }
.jx-pt h2 { margin: 0 0 6px; font-size: 15px; color: #0b1330; }
.jx-pt .kicker { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #0aa8bd; font-weight: 800; }
.jx-pt .sub, .jx-pt .hint { color: #62708a; font-size: 13px; line-height: 1.45; }
.jx-pt .head { display: flex; justify-content: space-between; gap: 16px; align-items: end; }
.jx-pt .total { min-width: 220px; text-align: right; }
.jx-pt .total span { display: block; color: #62708a; font-size: 12px; font-weight: 800; }
.jx-pt .total b { display: block; font-size: 32px; letter-spacing: -.04em; color: #0b1330; font-variant-numeric: tabular-nums; }
.jx-pt .total small { color: #62708a; font-size: 12px; }
.jx-pt .bar { height: 8px; border-radius: 99px; background: #eef1f6; overflow: hidden; margin: 6px 0; }
.jx-pt .bar i { display: block; height: 100%; background: #4f46e5; }
.jx-pt .who { display: grid; gap: 4px; margin: 14px 0; max-width: 280px; font-size: 12px; font-weight: 800; color: #62708a; }
.jx-pt select { border: 1px solid #e4e8f1; border-radius: 10px; padding: 8px 10px; background: #fff; color: #18213b; }
.jx-pt .layout { display: grid; grid-template-columns: 1.15fr .85fr; gap: 12px; }
.jx-pt .card { background: #fff; border: 1px solid #e4e8f1; border-radius: 18px; padding: 14px; }
.jx-pt .lines { display: grid; gap: 6px; }
.jx-pt .line { display: grid; grid-template-columns: 36px 1fr auto auto; gap: 10px; align-items: center; width: 100%; text-align: left; border: 1px solid #e4e8f1; background: #fff; border-radius: 12px; padding: 8px 10px; color: #18213b; }
.jx-pt .line.on { border-color: #9eeaf4; background: #f4fcfe; }
.jx-pt .line.over { border-color: #f3c3be; background: #fdeceb; color: #b42318; }
.jx-pt .ico { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; }
.jx-pt .ico.big { width: 46px; height: 46px; }
.jx-pt .lab { display: grid; }
.jx-pt .lab strong { font-size: 14px; }
.jx-pt .lab em { font-style: normal; color: #62708a; font-size: 11.5px; }
.jx-pt .line.over .lab em, .jx-pt .line.over .time { color: #b42318; }
.jx-pt .time { font-variant-numeric: tabular-nums; font-weight: 800; font-size: 13px; }
.jx-pt .flag { font-size: 11px; font-weight: 800; color: #b42318; }
.jx-pt .hero { display: flex; gap: 10px; align-items: center; }
.jx-pt .hero b { display: block; font-size: 18px; }
.jx-pt .hero span { color: #62708a; font-size: 12.5px; }
.jx-pt .timer { margin: 10px 0 4px; font-size: 52px; font-weight: 800; letter-spacing: -.05em; color: #0b1330; font-variant-numeric: tabular-nums; line-height: 1; }
.jx-pt .active.late { border-color: #f3c3be; background: #fff8f7; }
.jx-pt .active.late .timer, .jx-pt .overtext { color: #b42318; }
.jx-pt .overtext { margin: 0; font-weight: 800; }
.jx-pt .act, .jx-pt .ghost, .jx-pt .choice { border-radius: 12px; padding: 10px 12px; font-weight: 800; }
.jx-pt .act { display: inline-flex; margin-top: 14px; border: 0; background: #0b1330; color: #fff; }
.jx-pt .act:disabled { opacity: .4; cursor: not-allowed; }
.jx-pt .ghost { border: 1px solid #e4e8f1; background: #fff; color: #0b1330; }
.jx-pt .journal { margin-top: 12px; }
.jx-pt ol { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 8px; }
.jx-pt li { display: grid; grid-template-columns: 12px 1fr auto; gap: 8px; align-items: center; }
.jx-pt li b { display: block; color: #0b1330; font-size: 13px; }
.jx-pt li span { color: #62708a; font-size: 12px; }
.jx-pt li em { font-style: normal; color: #b42318; font-size: 11px; font-weight: 800; }
.jx-pt .dot { width: 10px; height: 10px; border-radius: 50%; }
.jx-pt .overlay { position: fixed; inset: 0; z-index: 80; background: rgba(11,19,48,.46); display: flex; align-items: center; justify-content: center; padding: 18px; }
.jx-pt .dialog { width: min(440px, 100%); background: #fff; border-radius: 18px; padding: 16px; display: grid; gap: 8px; }
.jx-pt .choice { display: grid; text-align: left; border: 1px solid #e4e8f1; background: #fff; }
.jx-pt .choice span { font-weight: 650; color: #62708a; font-size: 12.5px; }
.jx-pt .bye { margin: 0; font-size: 20px; color: #0b1330; font-weight: 800; }
.jx-pt .totals { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.jx-pt .totals div { border: 1px solid #e4e8f1; border-radius: 12px; padding: 8px 10px; min-width: 92px; }
.jx-pt .totals b, .jx-pt .totals span { display: block; }
.jx-pt .totals span { color: #62708a; font-size: 12px; }
.jx-pt .farewell .journal { border: 0; padding: 8px 0 0; }
@media (max-width: 900px) {
  .jx-pt .head, .jx-pt .layout { display: grid; grid-template-columns: 1fr; }
  .jx-pt .total { text-align: left; }
}
`;
