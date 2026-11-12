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
  // Rendu identique au serveur, l'heure n'arrive qu'après le montage.
  const [now, setNow] = useState(() => new Date(0));
  useEffect(() => {
    setNow(new Date());
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
          <p className="sub" suppressHydrationWarning>{now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {now.toLocaleTimeString('fr-FR')}</p>
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
body.g-body.g-body .jx-pt{color:var(--g-text);font-family:Inter,ui-sans-serif,system-ui,"Segoe UI",sans-serif;display:flex;flex-direction:column;gap:14px}
body.g-body.g-body .jx-pt *{box-sizing:border-box}
body.g-body.g-body .jx-pt button,body.g-body.g-body .jx-pt select{font:inherit}
body.g-body.g-body .jx-pt button{cursor:pointer}
body.g-body.g-body .jx-pt h1{margin:6px 0 0;font-size:26px;letter-spacing:-.035em;color:var(--g-text);font-weight:760}
body.g-body.g-body .jx-pt h2{margin:0 0 6px;font-size:15px;letter-spacing:-.02em;color:var(--g-text);font-weight:730}
body.g-body.g-body .jx-pt .kicker{display:inline-flex;align-items:center;gap:7px;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#0e7490;font-weight:800}
body.g-body.g-body .jx-pt .kicker:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--g-cyan);box-shadow:0 0 0 3px rgba(8,145,178,.16)}
body.g-body.g-body .jx-pt .sub,body.g-body.g-body .jx-pt .hint{color:var(--g-muted);font-size:13px;line-height:1.5}
body.g-body.g-body .jx-pt .head{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;flex-wrap:wrap}
body.g-body.g-body .jx-pt .total{
  min-width:240px;padding:14px 16px;border-radius:20px;border:1px solid var(--g-stroke);
  background:var(--g-glass);box-shadow:var(--g-shadow),inset 0 1px 0 rgba(255,255,255,.7);
  backdrop-filter:blur(var(--g-blur)) saturate(160%);
}
body.g-body.g-body .jx-pt .total span{display:block;color:var(--g-muted-2);font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
body.g-body.g-body .jx-pt .total b{display:block;font-size:30px;letter-spacing:-.04em;color:var(--g-text);font-variant-numeric:tabular-nums;line-height:1.15}
body.g-body.g-body .jx-pt .total small{color:var(--g-muted);font-size:11.5px;font-weight:650}
body.g-body.g-body .jx-pt .bar{height:6px;border-radius:99px;background:rgba(15,35,80,.1);overflow:hidden;margin:8px 0 6px}
body.g-body.g-body .jx-pt .bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#2563eb,#0891b2)}
body.g-body.g-body .jx-pt .who{display:grid;gap:5px;margin:0;max-width:280px;font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--g-muted-2)}
body.g-body.g-body .jx-pt select{
  border:1px solid rgba(15,35,80,.16);border-radius:12px;padding:0 11px;height:38px;
  background:rgba(255,255,255,.9);color:var(--g-text);font-weight:700;font-size:12.5px;
}
body.g-body.g-body .jx-pt .layout{display:grid;grid-template-columns:1.05fr .95fr;gap:16px;align-items:start}
body.g-body.g-body .jx-pt .card{
  padding:18px;border-radius:22px;border:1px solid var(--g-stroke);
  background:var(--g-glass);box-shadow:var(--g-shadow),inset 0 1px 0 rgba(255,255,255,.7);
  backdrop-filter:blur(var(--g-blur)) saturate(160%);
}
body.g-body.g-body .jx-pt .lines{display:grid;gap:7px;margin-top:6px}
body.g-body.g-body .jx-pt .line{
  display:grid;grid-template-columns:36px 1fr auto auto;gap:10px;align-items:center;width:100%;text-align:left;
  border:1px solid rgba(15,35,80,.1);background:rgba(255,255,255,.72);border-radius:14px;padding:9px 11px;
  color:var(--g-text);transition:.18s;
}
body.g-body.g-body .jx-pt .line:hover{border-color:rgba(37,99,235,.4);box-shadow:0 10px 22px -18px rgba(37,99,235,.8)}
body.g-body.g-body .jx-pt .line.on{border-color:rgba(8,145,178,.45);background:rgba(8,145,178,.08);box-shadow:0 0 0 3px rgba(8,145,178,.1)}
body.g-body.g-body .jx-pt .line.over{border-color:rgba(225,29,72,.4);background:rgba(225,29,72,.07);color:#be123c}
body.g-body.g-body .jx-pt .ico{width:32px;height:32px;border-radius:10px;display:grid;place-items:center}
body.g-body.g-body .jx-pt .ico.big{width:46px;height:46px;border-radius:14px}
body.g-body.g-body .jx-pt .lab{display:grid}
body.g-body.g-body .jx-pt .lab strong{font-size:13.5px;font-weight:750;letter-spacing:-.01em}
body.g-body.g-body .jx-pt .lab em{font-style:normal;color:var(--g-muted);font-size:11.5px}
body.g-body.g-body .jx-pt .line.over .lab em,body.g-body.g-body .jx-pt .line.over .time{color:#be123c}
body.g-body.g-body .jx-pt .time{font-variant-numeric:tabular-nums;font-weight:800;font-size:13px}
body.g-body.g-body .jx-pt .flag{font-size:10.5px;font-weight:800;color:#be123c;background:rgba(225,29,72,.1);border-radius:999px;padding:2px 8px}
body.g-body.g-body .jx-pt .hero{display:flex;gap:12px;align-items:center}
body.g-body.g-body .jx-pt .hero b{display:block;font-size:18px;letter-spacing:-.02em}
body.g-body.g-body .jx-pt .hero span{color:var(--g-muted);font-size:12.5px}
body.g-body.g-body .jx-pt .timer{margin:14px 0 4px;font-size:52px;font-weight:800;letter-spacing:-.05em;color:var(--g-text);font-variant-numeric:tabular-nums;line-height:1}
body.g-body.g-body .jx-pt .active.late{border-color:rgba(225,29,72,.35);background:rgba(255,247,246,.9)}
body.g-body.g-body .jx-pt .active.late .timer,body.g-body.g-body .jx-pt .overtext{color:#be123c}
body.g-body.g-body .jx-pt .overtext{margin:0;font-weight:800}
body.g-body.g-body .jx-pt .act,body.g-body.g-body .jx-pt .ghost,body.g-body.g-body .jx-pt .choice{border-radius:999px;padding:0 16px;height:38px;font-weight:750;font-size:12.5px}
body.g-body.g-body .jx-pt .act{
  display:inline-flex;align-items:center;margin-top:16px;border:0;color:#fff;
  background:linear-gradient(120deg,#2563eb,#0891b2);box-shadow:0 14px 26px -16px rgba(37,99,235,.8);
}
body.g-body.g-body .jx-pt .act:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
body.g-body.g-body .jx-pt .ghost{border:1px solid rgba(15,35,80,.14);background:rgba(255,255,255,.85);color:var(--g-text)}
body.g-body.g-body .jx-pt .ghost:hover{border-color:rgba(124,58,237,.4);color:#6d28d9}
body.g-body.g-body .jx-pt .journal{margin-top:0}
body.g-body.g-body .jx-pt ol{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:6px}
body.g-body.g-body .jx-pt li{display:grid;grid-template-columns:12px 1fr auto;gap:10px;align-items:center;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.55);border:1px solid rgba(15,35,80,.07)}
body.g-body.g-body .jx-pt li b{display:block;color:var(--g-text);font-size:13px}
body.g-body.g-body .jx-pt li span{color:var(--g-muted);font-size:12px}
body.g-body.g-body .jx-pt li em{font-style:normal;color:#be123c;font-size:10.5px;font-weight:800;background:rgba(225,29,72,.1);border-radius:999px;padding:2px 8px}
body.g-body.g-body .jx-pt .dot{width:10px;height:10px;border-radius:50%}
body.g-body.g-body .jx-pt .overlay{position:fixed;inset:0;z-index:80;background:rgba(11,19,48,.46);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px}
body.g-body.g-body .jx-pt .dialog{
  width:min(440px,100%);background:rgba(255,255,255,.96);border:1px solid var(--g-stroke);
  border-radius:22px;padding:20px;display:grid;gap:10px;box-shadow:0 40px 90px -40px rgba(15,23,42,.55);
}
body.g-body.g-body .jx-pt .choice{display:grid;text-align:left;border:1px solid rgba(15,35,80,.12);background:rgba(255,255,255,.9);height:auto;padding:12px 14px;border-radius:14px}
body.g-body.g-body .jx-pt .choice:hover{border-color:rgba(37,99,235,.45)}
body.g-body.g-body .jx-pt .choice span{font-weight:650;color:var(--g-muted);font-size:12.5px}
body.g-body.g-body .jx-pt .bye{margin:0;font-size:20px;color:var(--g-text);font-weight:800;letter-spacing:-.02em}
body.g-body.g-body .jx-pt .totals{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
body.g-body.g-body .jx-pt .totals div{border:1px solid rgba(15,35,80,.1);border-radius:14px;padding:9px 12px;min-width:96px;background:rgba(255,255,255,.7)}
body.g-body.g-body .jx-pt .totals b,body.g-body.g-body .jx-pt .totals span{display:block}
body.g-body.g-body .jx-pt .totals span{color:var(--g-muted);font-size:12px}
body.g-body.g-body .jx-pt .farewell .journal{border:0;padding:8px 0 0;background:transparent;box-shadow:none}
@media (max-width:900px){
  body.g-body.g-body .jx-pt .head,body.g-body.g-body .jx-pt .layout{display:grid;grid-template-columns:1fr}
  body.g-body.g-body .jx-pt .total{text-align:left}
}
`;
