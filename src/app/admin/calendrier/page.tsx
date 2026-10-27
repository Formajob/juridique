'use client';

/**
 * Remplace uniquement src/app/admin/calendrier/page.tsx
 * Ne pas recopier le menu, le logo, ni RoleLayout : le layout admin les a déjà.
 * Une case par dossier : rendez-vous s'il existe, sinon date de clôture
 * (dernier événement), sinon échéance. Pas de date de suivi.
 */

import { FormEvent, useMemo, useState, useSyncExternalStore } from 'react';
import type { Appointment, Case, CaseEvent } from '@/types/database';
import { ETAPE_LABELS } from '@/lib/workflow-ui';
import {
  getWorkflowState,
  resetWorkflowStore,
  setWorkflowState,
  subscribeWorkflow,
  transitionCase,
} from '@/lib/workflow-store';

const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const MOIS_C = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const DOW = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const NEXT: Record<string, { to: string; label: string; slot?: boolean; close?: boolean }[]> = {
  constatation_recue: [{ to: 'analyse_gravite', label: 'Lancer l’analyse' }],
  analyse_gravite: [
    { to: 'sanction_faute_non_grave', label: 'Faute non grave : sanction directe' },
    { to: 'convocation_seance', label: 'Faute grave : convocation', slot: true },
  ],
  sanction_faute_non_grave: [{ to: 'cloture', label: 'Clore la procédure', close: true }],
  convocation_seance: [
    { to: 'seance_presente', label: 'Agent présent' },
    { to: 'seance_absente', label: 'Agent absent' },
  ],
  seance_presente: [{ to: 'pv_seance', label: 'PV établi, copie remise' }],
  pv_seance: [
    { to: 'decision_licenciement', label: 'Licenciement' },
    { to: 'decision_mise_a_pied', label: 'Mise à pied' },
    { to: 'decision_sanction', label: 'Sanction' },
    { to: 'fin_procedure', label: 'Absence du fait' },
  ],
  seance_absente: [{ to: 'depot_inspection_absence', label: 'Déposer à l’inspection' }],
  depot_inspection_absence: [{ to: 'investigations', label: 'Ouvrir les investigations' }],
  investigations: [
    { to: 'decision_licenciement', label: 'Licenciement' },
    { to: 'decision_mise_a_pied', label: 'Mise à pied' },
    { to: 'decision_sanction', label: 'Sanction' },
    { to: 'fin_procedure', label: 'Absence du fait' },
  ],
  decision_licenciement: [{ to: 'notification_48h', label: 'Rappel des 48 heures' }],
  decision_mise_a_pied: [{ to: 'notification_48h', label: 'Rappel des 48 heures' }],
  notification_48h: [{ to: 'depot_inspection_decision', label: 'Dépôt à l’inspection' }],
  depot_inspection_decision: [{ to: 'cloture', label: 'Clore la procédure', close: true }],
  decision_sanction: [{ to: 'cloture', label: 'Clore la procédure', close: true }],
  fin_procedure: [{ to: 'cloture', label: 'Clore la procédure', close: true }],
  cloture: [],
};

const NEEDS_RDV = ['convocation_seance', 'seance_presente', 'seance_absente', 'pv_seance'];

type FilterId = 'tous' | 'planifie' | 'encours' | 'retard' | 'clos';
type Place = { date: string; time: string | null; kind: 'rdv' | 'clos' | 'echeance' };

function pad(n: number) {
  return String(n).padStart(2, '0');
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function timeKey(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromIso(iso: string) {
  return new Date(iso);
}
function fr(iso: string) {
  const p = iso.split('-');
  if (p.length < 3) return iso;
  return `${Number(p[2])} ${MOIS_C[Number(p[1]) - 1]} ${p[0]}`;
}
function monthLabel(y: number, m: number) {
  return `${MOIS[m].charAt(0).toUpperCase()}${MOIS[m].slice(1)} ${y}`;
}
function matrix(y: number, m: number) {
  const first = new Date(y, m, 1);
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(y, m, 1 - lead);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return dayKey(d);
  });
}
function inMonth(iso: string, y: number, m: number) {
  return iso.slice(0, 7) === `${y}-${pad(m + 1)}`;
}
function labelOf(step: string) {
  return ETAPE_LABELS[step] || step;
}
function latestAppointment(list: Appointment[], ref: string) {
  return list
    .filter((a) => a.dossier === ref)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}
function lastEvent(list: CaseEvent[], ref: string) {
  return list
    .filter((e) => e.dossier === ref)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}
function placeOf(c: Case, appt: Appointment | undefined, closedOn: string | null): Place | null {
  if (appt) {
    const d = fromIso(appt.debut);
    return { date: dayKey(d), time: timeKey(d), kind: 'rdv' };
  }
  if (c.etape === 'cloture' && closedOn) return { date: closedOn, time: null, kind: 'clos' };
  if (c.echeance) return { date: dayKey(fromIso(c.echeance)), time: null, kind: 'echeance' };
  return null;
}

export default function AdminCalendarPage() {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const today = useMemo(() => new Date(), []);
  const todayIso = dayKey(today);
  const [y, setY] = useState(today.getFullYear());
  const [m, setM] = useState(today.getMonth());
  const [filter, setFilter] = useState<FilterId>('tous');
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const rows = useMemo(() => {
    return snap.cases.map((c) => {
      const appt = latestAppointment(snap.appointments, c.reference);
      const ev = lastEvent(snap.events, c.reference);
      const closedOn = c.etape === 'cloture' && ev ? dayKey(fromIso(ev.date)) : null;
      const place = placeOf(c, appt, closedOn);
      const late = Boolean(c.echeance && c.etape !== 'cloture' && dayKey(fromIso(c.echeance)) < todayIso);
      return { c, appt, ev, place, late };
    });
  }, [snap, todayIso]);

  const visible = rows.filter((r) => {
    if (filter === 'planifie') return r.c.etape === 'convocation_seance' && Boolean(r.appt);
    if (filter === 'encours') return r.c.etape !== 'cloture';
    if (filter === 'retard') return r.late;
    if (filter === 'clos') return r.c.etape === 'cloture';
    return true;
  });

  const counts = {
    tous: rows.length,
    planifie: rows.filter((r) => r.c.etape === 'convocation_seance' && r.appt).length,
    encours: rows.filter((r) => r.c.etape !== 'cloture').length,
    retard: rows.filter((r) => r.late).length,
    clos: rows.filter((r) => r.c.etape === 'cloture').length,
  };

  const days = matrix(y, m);
  const byDay: Record<string, typeof visible> = {};
  const outside: typeof visible = [];
  const undated: typeof visible = [];
  visible.forEach((r) => {
    if (!r.place) { undated.push(r); return; }
    if (!inMonth(r.place.date, y, m)) { outside.push(r); return; }
    (byDay[r.place.date] ||= []).push(r);
  });
  Object.values(byDay).forEach((list) => list.sort(sortPlaced));
  outside.sort(sortPlaced);

  function shift(dir: number | 'today') {
    if (dir === 'today') { setY(today.getFullYear()); setM(today.getMonth()); return; }
    const d = new Date(y, m + dir, 1);
    setY(d.getFullYear());
    setM(d.getMonth());
  }

  function open(ref: string) {
    setSelected(ref);
    setPending(null);
    setNote('');
  }
  function close() {
    setSelected(null);
    setPending(null);
  }

  const current = rows.find((r) => r.c.reference === selected) || null;

  function go(to: string, label: string, slot?: { date: string; time: string; end: string; lieu: string }) {
    if (!current) return;
    if (to === 'convocation_seance' && !slot) { setPending(to); return; }
    transitionCase(current.c.reference, to, label, 'Calendrier');
    if (slot) writeSlot(current.c.reference, slot);
    setPending(null);
    setNote('Noté. Aucune lettre n’est rédigée, aucun envoi.');
  }

  function onSlot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!current) return;
    const data = new FormData(e.currentTarget);
    const slot = {
      date: String(data.get('date') || ''),
      time: String(data.get('time') || ''),
      end: String(data.get('end') || ''),
      lieu: String(data.get('lieu') || 'Salle 1'),
    };
    if (pending) go(pending, 'Convocation notée', slot);
    else writeSlot(current.c.reference, slot);
    setPending(null);
    setNote('Créneau noté. Aucun envoi.');
  }

  return (
    <div className="jx-cal">
      <style>{CSS}</style>
      <div className="top">
        <div>
          <div className="kicker">Xceed · Juridique</div>
          <h1>Calendrier</h1>
          <p className="sub">Mois en cours. Une convocation ou une séance est à l’heure du rendez-vous. Un clic ouvre le détail et les actions.</p>
        </div>
        <button className="ghost" type="button" onClick={() => resetWorkflowStore()}>Réinitialiser la démo</button>
      </div>

      <div className="filters" aria-label="Filtrer par statut">
        {([
          ['tous', 'Tous'],
          ['planifie', 'Planifiés'],
          ['encours', 'En cours'],
          ['retard', 'En retard'],
          ['clos', 'Clos'],
        ] as [FilterId, string][]).map(([id, label]) => (
          <button key={id} type="button" className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>
            {label} · {counts[id]}
          </button>
        ))}
      </div>
      <p className="rule">Création : oui. Suivi : pas de date séparée, c’est le dernier événement. Rendez-vous : seulement s’il est posé. Un dossier n’occupe qu’une case. Un retard ne change pas l’étape.</p>

      <section className="card">
        <div className="monthbar">
          <button className="iconbtn" type="button" aria-label="Mois précédent" onClick={() => shift(-1)}>‹</button>
          <strong>{monthLabel(y, m)}</strong>
          <button className="iconbtn" type="button" aria-label="Mois suivant" onClick={() => shift(1)}>›</button>
          <button className="ghost" type="button" onClick={() => shift('today')}>Aujourd’hui</button>
        </div>
        <div className="cal">
          {DOW.map((d) => <div key={d} className="dow">{d}</div>)}
          {days.map((iso) => {
            const off = !inMonth(iso, y, m);
            const weekDay = (new Date(`${iso}T12:00:00`).getDay() + 6) % 7;
            const cls = ['day', off ? 'off' : '', !off && weekDay >= 5 ? 'weekend' : '', iso === todayIso ? 'today' : ''].filter(Boolean).join(' ');
            return (
              <div key={iso} className={cls}>
                <div className="daynum">{Number(iso.slice(8))}</div>
                <div className="chips">
                  {(byDay[iso] || []).map((r) => (
                    <button
                      key={r.c.reference}
                      type="button"
                      className={chipClass(r, selected)}
                      onClick={() => open(r.c.reference)}
                    >
                      <b>{r.place?.time || (r.place?.kind === 'clos' ? 'Clos' : 'Échéance')}</b>
                      <span>{r.c.reference}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="below">
        <section className="card">
          <h2>Hors de ce mois · {outside.length}</h2>
          <Mini list={outside} onOpen={open} empty="Aucun dossier de ce filtre hors du mois." />
        </section>
        <section className="card">
          <h2>Sans date au calendrier · {undated.length}</h2>
          <Mini list={undated} onOpen={open} empty="Ces dossiers n’ont ni rendez-vous, ni clôture, ni échéance." />
        </section>
      </div>

      {current && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
            <div className="sheet-h">
              <div>
                <span className={`pill ${current.late ? 'bad' : current.c.etape === 'cloture' ? 'ok' : 'cyan'}`}>
                  {current.late ? 'En retard' : current.c.etape === 'cloture' ? 'Clos' : 'En cours'}
                </span>
                <h2 id="sheet-title">{current.c.reference}</h2>
                <p className="note">{labelOf(current.c.etape)} · {current.c.affectationFixe.lob || '—'} · {current.c.agentId || 'agent non précisé'}</p>
              </div>
              <button className="x" type="button" onClick={close} aria-label="Fermer">×</button>
            </div>
            <div className="sheet-b">
              <div className="dates">
                <div><small>Créé le</small><b>{fr(dayKey(fromIso(current.c.createdAt)))}</b></div>
                <div><small>Échéance</small><b>{current.c.echeance ? fr(dayKey(fromIso(current.c.echeance))) : '—'}</b></div>
                <div><small>Rendez-vous</small><b>{current.appt ? `${fr(dayKey(fromIso(current.appt.debut)))} · ${timeKey(fromIso(current.appt.debut))} · ${current.appt.lieu}` : 'Non posé'}</b></div>
                <div><small>Dernier événement</small><b>{current.ev ? current.ev.action : '—'}</b></div>
              </div>
              {NEEDS_RDV.includes(current.c.etape) && !current.appt && <p className="warn">Cette étape attend un rendez-vous. Il n’est pas encore posé.</p>}
              <Actions
                step={current.c.etape}
                pending={pending}
                appt={current.appt}
                onGo={(to, label) => {
                  const spec = (NEXT[current.c.etape] || []).find((n) => n.to === to);
                  if (spec?.slot) { setPending(to); return; }
                  go(to, label);
                }}
                onMove={() => setPending('move')}
                onSlot={onSlot}
              />
              {note && <p className="okmsg">{note}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function writeSlot(ref: string, slot: { date: string; time: string; end: string; lieu: string }) {
  const s = getWorkflowState();
  const debut = new Date(`${slot.date}T${slot.time}:00`).toISOString();
  const fin = new Date(`${slot.date}T${slot.end}:00`).toISOString();
  const owned = s.appointments.filter((a) => a.dossier === ref);
  const target = owned.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const dossier = s.cases.find((c) => c.reference === ref);
  const appointments = target
    ? s.appointments.map((a) => a.id === target.id ? { ...a, debut, fin, lieu: slot.lieu, statut: 'Confirmé' } : a)
    : [...s.appointments, {
        id: `appt-${ref}-${Date.now()}`,
        dossier: ref,
        debut,
        fin,
        lieu: slot.lieu,
        statut: 'Confirmé',
        tenantId: dossier?.tenantId || 'juridique-xceed',
        createdAt: new Date().toISOString(),
      }];
  setWorkflowState({ ...getWorkflowState(), appointments });
}

function sortPlaced(a: { place: Place | null; c: Case }, b: { place: Place | null; c: Case }) {
  const ta = a.place?.time || '99:99';
  const tb = b.place?.time || '99:99';
  return ta.localeCompare(tb) || a.c.reference.localeCompare(b.c.reference);
}
function chipClass(r: { place: Place | null; late: boolean; c: Case }, selected: string | null) {
  const kind = r.late ? 'late' : r.place?.kind === 'clos' ? 'clos' : r.place?.kind === 'rdv' ? 'rdv' : 'ech';
  return `chip ${kind}${selected === r.c.reference ? ' on' : ''}`;
}

function Mini({ list, onOpen, empty }: { list: { c: Case; place: Place | null }[]; onOpen: (ref: string) => void; empty: string }) {
  if (!list.length) return <p className="note">{empty}</p>;
  return (
    <>
      {list.map((r) => (
        <button key={r.c.reference} className="mini" type="button" onClick={() => onOpen(r.c.reference)}>
          <b>{r.c.reference} · {r.c.affectationFixe.lob || '—'}</b>
          <span>{labelOf(r.c.etape)} · {r.place ? `${r.place.time ? `${r.place.time} · ` : ''}${fr(r.place.date)}` : 'Pas de date représentative'}</span>
        </button>
      ))}
    </>
  );
}

function Actions({
  step, pending, appt, onGo, onMove, onSlot,
}: {
  step: string;
  pending: string | null;
  appt: Appointment | undefined;
  onGo: (to: string, label: string) => void;
  onMove: () => void;
  onSlot: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const next = NEXT[step] || [];
  const advances = next.filter((n) => !n.close);
  const closes = next.filter((n) => n.close);
  return (
    <>
      {advances.length > 0 && (
        <>
          <p className="note"><b>Avancer</b> · le choix est noté, il n’est pas envoyé.</p>
          <div className="acts">
            {advances.map((n) => <button key={n.to} className="act" type="button" onClick={() => onGo(n.to, n.label)}>{n.label}</button>)}
          </div>
        </>
      )}
      {closes.length > 0 && (
        <div className="acts">
          {closes.map((n) => <button key={n.to} className="act line" type="button" onClick={() => onGo(n.to, n.label)}>{n.label}</button>)}
        </div>
      )}
      {step === 'convocation_seance' && <div className="acts"><button className="act ghost" type="button" onClick={onMove}>Replacer le créneau</button></div>}
      {!next.length && <p className="note">Dossier clos. Aucune branche ouverte.</p>}
      {pending && (
        <form className="slot" onSubmit={onSlot}>
          <label>Date<input type="date" name="date" required defaultValue={appt ? dayKey(fromIso(appt.debut)) : ''} /></label>
          <label>Début<input type="time" name="time" required defaultValue={appt ? timeKey(fromIso(appt.debut)) : '10:00'} /></label>
          <label>Fin<input type="time" name="end" required defaultValue={appt ? timeKey(fromIso(appt.fin)) : '11:00'} /></label>
          <label>Lieu<input name="lieu" defaultValue={appt?.lieu || 'Salle 1'} /></label>
          <button className="act" type="submit">Noter le créneau</button>
        </form>
      )}
    </>
  );
}

const CSS = `
.jx-cal { color: #18213b; font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
.jx-cal * { box-sizing: border-box; }
.jx-cal button, .jx-cal input { font: inherit; }
.jx-cal button { cursor: pointer; }
.jx-cal h1 { margin: 4px 0 0; font-size: 28px; letter-spacing: -.03em; color: #0b1330; }
.jx-cal h2 { margin: 0 0 6px; font-size: 13px; color: #0b1330; }
.jx-cal .kicker { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #0aa8bd; font-weight: 800; }
.jx-cal .sub, .jx-cal .rule, .jx-cal .note { margin: 6px 0 0; color: #62708a; font-size: 13px; line-height: 1.45; }
.jx-cal .top { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 12px; }
.jx-cal .card { background: #fff; border: 1px solid #e4e8f1; border-radius: 18px; padding: 14px; }
.jx-cal .filters { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 10px; }
.jx-cal .filters button { border: 1px solid #e4e8f1; background: #fff; color: #62708a; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 800; }
.jx-cal .filters button.on { border-color: #0b1330; background: #0b1330; color: #fff; }
.jx-cal .monthbar { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.jx-cal .monthbar strong { flex: 1; text-align: center; font-size: 18px; color: #0b1330; }
.jx-cal .iconbtn, .jx-cal .ghost { border: 1px solid #e4e8f1; background: #fff; border-radius: 999px; height: 34px; padding: 0 12px; color: #0b1330; font-weight: 750; }
.jx-cal .iconbtn { width: 34px; padding: 0; }
.jx-cal .cal { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
.jx-cal .dow { text-align: center; font-size: 11px; font-weight: 800; color: #62708a; padding-bottom: 2px; }
.jx-cal .day { min-height: 118px; border: 1px solid #e4e8f1; border-radius: 12px; background: #fff; padding: 6px; display: flex; flex-direction: column; gap: 4px; }
.jx-cal .day.off { background: #f3f5f9; }
.jx-cal .day.weekend { background: #fbfcfe; }
.jx-cal .day.today { border-color: #9eeaf4; background: #f4fcfe; }
.jx-cal .daynum { font-size: 12px; font-weight: 800; color: #0b1330; }
.jx-cal .day.off .daynum { color: #9aa6bd; }
.jx-cal .day.today .daynum { color: #0aa8bd; }
.jx-cal .chips { display: flex; flex-direction: column; gap: 4px; }
.jx-cal .chip { display: flex; flex-direction: column; align-items: flex-start; width: 100%; border-radius: 8px; border: 1px solid #d5deec; background: #f7f9fc; color: #0b1330; padding: 4px 6px; text-align: left; line-height: 1.2; }
.jx-cal .chip b { font-size: 10px; letter-spacing: .02em; }
.jx-cal .chip span { font-size: 11px; font-weight: 800; }
.jx-cal .chip.rdv { border-color: #9eeaf4; background: #f4fcfe; }
.jx-cal .chip.late { border-color: #f3c3be; background: #fdeceb; color: #b42318; }
.jx-cal .chip.clos { border-color: #cfe8da; background: #e8f6ee; color: #1f8a56; }
.jx-cal .chip.on { outline: 2px solid #0b1330; }
.jx-cal .below { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
.jx-cal .mini { display: block; width: 100%; text-align: left; border: 0; border-bottom: 1px solid #e4e8f1; background: transparent; padding: 7px 0; }
.jx-cal .mini b { display: block; color: #0b1330; font-size: 13px; }
.jx-cal .mini span { display: block; margin-top: 2px; color: #62708a; font-size: 12px; }
.jx-cal .overlay { position: fixed; inset: 0; z-index: 80; display: flex; align-items: center; justify-content: center; background: rgba(11,19,48,.46); padding: 18px; }
.jx-cal .sheet { width: min(680px, 100%); max-height: min(90vh, 820px); overflow: auto; background: #fff; border-radius: 18px; }
.jx-cal .sheet-h { display: flex; gap: 12px; align-items: flex-start; padding: 16px 16px 12px; border-bottom: 1px solid #e4e8f1; }
.jx-cal .sheet-h h2 { margin: 6px 0 0; font-size: 22px; }
.jx-cal .x { margin-left: auto; width: 34px; height: 34px; border-radius: 999px; border: 1px solid #e4e8f1; background: #fff; font-weight: 800; }
.jx-cal .sheet-b { padding: 14px 16px 18px; }
.jx-cal .dates { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
.jx-cal .dates div { border: 1px solid #e4e8f1; border-radius: 12px; padding: 8px 10px; }
.jx-cal .dates small { display: block; color: #62708a; font-size: 11px; font-weight: 800; }
.jx-cal .pill { display: inline-block; border-radius: 99px; padding: 2px 7px; font-size: 11px; font-weight: 800; }
.jx-cal .ok { background: #e8f6ee; color: #1f8a56; }
.jx-cal .bad { background: #fdeceb; color: #b42318; }
.jx-cal .cyan { background: #e7fafd; color: #0aa8bd; }
.jx-cal .acts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.jx-cal .act { border: 0; border-radius: 999px; padding: 8px 12px; background: #0b1330; color: #fff; font-weight: 800; font-size: 13px; }
.jx-cal .act.line { background: #fff; color: #0b1330; border: 1px solid #e4e8f1; }
.jx-cal .act.ghost { background: #fff; color: #0b1330; border: 1px solid #e4e8f1; }
.jx-cal .slot { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.jx-cal .slot label { font-size: 12px; font-weight: 800; color: #62708a; }
.jx-cal .slot input { width: 100%; margin-top: 4px; border: 1px solid #e4e8f1; border-radius: 10px; padding: 8px 10px; }
.jx-cal .warn { margin-top: 8px; padding: 8px 10px; border-radius: 10px; background: #fff6e0; color: #9a6700; font-size: 12.5px; font-weight: 700; }
.jx-cal .okmsg { margin-top: 8px; padding: 8px 10px; border-radius: 10px; background: #e8f6ee; color: #1f8a56; font-size: 12.5px; font-weight: 750; }
@media (max-width: 900px) {
  .jx-cal .cal { grid-template-columns: repeat(7, minmax(92px, 1fr)); overflow-x: auto; }
  .jx-cal .below, .jx-cal .dates, .jx-cal .slot { grid-template-columns: 1fr; }
}
`;
