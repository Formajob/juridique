'use client';

/**
 * Remplace uniquement src/app/admin/page.tsx
 * Ne pas recopier le menu : il est dans src/components/layout/Sidebar.tsx.
 * Les chiffres sont lus dans les dossiers du projet. Échéances est une vue, pas une septième pile.
 */

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import type { Case, CaseEvent } from '@/types/database';
import { createDemoTodayPointage } from '@/lib/demo-pointage';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';
import { ETAPE_LABELS } from '@/lib/workflow-ui';
import { BRANCHES } from '@/lib/workflow-branch';

const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const BUREAU = ['Juriste 1', 'Juriste 2', 'Assistant 1', 'Assistant 2', 'Assistant 3'];

const GROUPS: { id: string; label: string; stock: boolean; codes: string[] }[] = [
  { id: 'constatations', label: 'Constatations', stock: true, codes: ['constatation_recue'] },
  { id: 'analyse', label: 'Analyse', stock: true, codes: ['analyse_gravite'] },
  { id: 'convocations', label: 'Convocations', stock: true, codes: ['convocation_seance'] },
  { id: 'seances', label: 'Séances', stock: true, codes: ['seance_presente', 'seance_absente', 'pv_seance'] },
  { id: 'decisions', label: 'Décisions', stock: true, codes: ['decision_licenciement', 'decision_mise_a_pied', 'decision_sanction', 'fin_procedure', 'notification_48h', 'depot_inspection_decision', 'depot_inspection_absence', 'investigations', 'sanction_faute_non_grave'] },
  { id: 'clos', label: 'Clos', stock: true, codes: ['cloture'] },
  { id: 'echeances', label: 'Échéances', stock: false, codes: [] },
];

const TAGS: Record<string, { label: string; color: string; bg: string }> = {
  shift: { label: 'Shift', color: '#4f46e5', bg: '#eef2ff' },
  pause: { label: 'Pause', color: '#d97706', bg: '#fffbeb' },
  lunch: { label: 'Lunch', color: '#d97706', bg: '#fffbeb' },
  meeting: { label: 'Réunion', color: '#2563eb', bg: '#eff6ff' },
  rencontre: { label: 'Rencontre', color: '#2563eb', bg: '#eff6ff' },
  formation: { label: 'Formation', color: '#4f46e5', bg: '#eef2ff' },
  absent: { label: 'Absent', color: '#b42318', bg: '#fdeceb' },
  conge: { label: 'Congé', color: '#9a6700', bg: '#fff6e0' },
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fr(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MOIS_C[d.getMonth()]} ${d.getFullYear()}`;
}
function labelOf(step: string) {
  return ETAPE_LABELS[step] || step;
}
function kindOf(etape: string) {
  if (etape === 'constatation_recue' || etape === 'analyse_gravite') return '8 jours après la réception';
  if (etape === 'convocation_seance') return '8 jours après la convocation';
  if (etape === 'decision_licenciement' || etape === 'decision_mise_a_pied' || etape === 'notification_48h') return '48 heures';
  return '';
}
function echeanceText(iso: string | null, today: string) {
  if (!iso) return 'Pas d\'échéance';
  const key = dayKey(new Date(iso));
  if (key === today) return `Aujourd'hui · ${fr(iso)}`;
  if (key < today) return `Dépassée le ${fr(iso)}`;
  return fr(iso);
}
function elapsed(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return '0 min';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h} h ${pad(m)}` : `${m} min`;
}

export default function AdminDashboardPage() {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const today = useMemo(() => new Date(), []);
  const todayIso = dayKey(today);
  const [group, setGroup] = useState('constatations');
  const [ref, setRef] = useState('');

  const rows = snap.cases.map((c) => {
    const late = c.etape !== 'cloture' && !!c.echeance && dayKey(new Date(c.echeance)) < todayIso;
    const due = c.etape !== 'cloture' && !!c.echeance && dayKey(new Date(c.echeance)) <= todayIso;
    const statut = c.etape === 'cloture'
      ? { id: 'mute', label: 'Clos' }
      : late
        ? { id: 'bad', label: 'En retard' }
        : c.echeance
          ? { id: 'ok', label: 'Dans le délai' }
          : { id: 'wait', label: 'En attente' };
    return { c, late, due, statut };
  });

  const total = rows.length;
  const clos = rows.filter((r) => r.c.etape === 'cloture').length;
  const enCours = total - clos;
  const lateCount = rows.filter((r) => r.late).length;
  const counts = Object.fromEntries(GROUPS.map((g) => [g.id, rows.filter((r) => inGroup(r, g.id)).length]));
  const maxStock = Math.max(1, ...GROUPS.filter((g) => g.stock).map((g) => counts[g.id]));
  const shown = rows.filter((r) => inGroup(r, group));
  const dues = rows.filter((r) => r.due);
  const currentRef = rows.some((r) => r.c.reference === ref) ? ref : rows[0]?.c.reference || '';
  const current = rows.find((r) => r.c.reference === currentRef);
  const people = BUREAU.map((name) => createDemoTodayPointage().find((s) => s.utilisateur?.nom === name)).filter(Boolean);

  const longDate = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const groupLabel = GROUPS.find((g) => g.id === group)?.label || '';

  return (
    <div className="jx-dash">
      <style>{CSS}</style>
      <div className="top">
        <div>
          <div className="kicker">Xceed · Juridique</div>
          <h1>Tableau de bord</h1>
          <p className="sub">Vue d'ensemble du traitement. Les chiffres viennent des dossiers. L'assistant ne voit pas cette page : elle révèle l'étape, pas le motif.</p>
        </div>
        <div className="meta">
          <span className="badge">Démo · lus dans les dossiers</span>
          <div>{longDate}</div>
        </div>
      </div>

      <p className="proof">
        <b>{clos} clos + {enCours} en cours = {total}.</b> {lateCount === 0 ? 'Aucun retard.' : lateCount === 1 ? `Le retard est compris dans les ${enCours}.` : `Les ${lateCount} retards sont compris dans les ${enCours}.`} Un retard ne change pas l'étape.
      </p>

      <section className="kpis" aria-label="Totaux">
        <article className="kpi"><b>{total}</b><span>Reçus</span></article>
        <article className="kpi"><b>{enCours}</b><span>En cours</span></article>
        <article className="kpi"><b>{clos}</b><span>Clos</span></article>
        <article className="kpi late"><b>{lateCount}</b><span>En retard, dans les en cours</span></article>
      </section>

      <div className="grid">
        <section className="card">
          <h2>Volume par étape</h2>
          <p className="hint">Six étapes portent les dossiers. Échéances est une vue, pas une septième pile. Un clic ouvre la liste.</p>
          {GROUPS.map((g) => {
            const n = counts[g.id];
            const width = g.stock ? Math.round((n / maxStock) * 100) : 100;
            return (
              <button key={g.id} type="button" className={`step${g.stock ? '' : ' view'}${group === g.id ? ' on' : ''}`} onClick={() => setGroup(g.id)}>
                <span className="name">{g.label}{g.stock ? '' : ' · vue'}</span>
                <span className="bar"><i style={{ width: `${width}%` }} /></span>
                <span className="n">{n}</span>
              </button>
            );
          })}
          <div className="list">
            <h3>{groupLabel} · {shown.length} dossier{shown.length > 1 ? 's' : ''}</h3>
            {shown.length === 0 ? <p className="note">Aucun dossier dans cette vue.</p> : (
              <table>
                <thead>
                  <tr><th>Référence</th><th>Activité</th><th>Agent</th><th>Étape</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.c.reference} className="pick" onClick={() => setRef(r.c.reference)}>
                      <td className="ref">{r.c.reference}</td>
                      <td>{r.c.affectationFixe.lob || '—'}</td>
                      <td>{r.c.agentId || '—'}</td>
                      <td>{labelOf(r.c.etape)}</td>
                      <td><span className={`pill ${r.statut.id}`}>{r.statut.label}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="card">
          <h2>Échéances du jour</h2>
          <p className="hint">Aujourd'hui, ou déjà dépassées et encore ouvertes. 8 jours après la réception, 8 jours après la convocation, 48 heures après licenciement ou mise à pied.</p>
          {dues.length === 0 ? <p className="note">Aucune échéance aujourd'hui, ni dépassée.</p> : dues.map((r) => (
            <button key={r.c.reference} type="button" className="echeance" onClick={() => setRef(r.c.reference)}>
              <b>{r.c.reference} · {r.c.affectationFixe.lob || '—'}</b>
              <span>{kindOf(r.c.etape) || labelOf(r.c.etape)} · {echeanceText(r.c.echeance, todayIso)} · étape inchangée : {labelOf(r.c.etape)}</span>
            </button>
          ))}
        </section>
      </div>

      <div className="grid lower">
        <section className="card">
          <h2>Process d'un dossier</h2>
          <p className="hint">Le chemin de cette référence seulement. Pas le schéma entier. La branche suivante, rien au-delà.</p>
          <select className="refsel" aria-label="Choisir une référence" value={currentRef} onChange={(e) => setRef(e.target.value)}>
            {rows.map((r) => <option key={r.c.reference} value={r.c.reference}>{r.c.reference} · {labelOf(r.c.etape)}</option>)}
          </select>
          {current && <Path dossier={current.c} events={snap.events.filter((e) => e.dossier === current.c.reference)} />}
          {current && <p className="note"><Link href={`/admin/dossiers/${current.c.reference}`}>Ouvrir le dossier</Link></p>}
        </section>

        <section className="card">
          <h2>Présence du bureau</h2>
          <p className="hint">Deux juristes, trois assistants. Pas les agents, pas la production.</p>
          <div className="people">
            {people.map((s) => {
              const statut = s!.statut || 'absent';
              const tag = TAGS[statut] || TAGS.absent;
              const actif = !['absent', 'conge'].includes(statut);
              return (
                <article key={s!.id} className="person">
                  <div className="who">{s!.utilisateur?.nom}</div>
                  <span className="tag" style={{ color: tag.color, background: tag.bg }}>{tag.label}</span>
                  <div className="time">{actif ? elapsed(s!.debut) : 'Inactif'}</div>
                </article>
              );
            })}
          </div>
          <p className="note">Le détail des tags est la page <Link href="/admin/presence">Présence</Link>. Ici, seulement l'état du moment.</p>
        </section>
      </div>
    </div>
  );
}

function inGroup(r: { c: Case; due: boolean }, id: string) {
  if (id === 'echeances') return r.due;
  return GROUPS.find((g) => g.id === id)?.codes.includes(r.c.etape) || false;
}

function Path({ dossier, events }: { dossier: Case; events: CaseEvent[] }) {
  const ordered = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const steps: string[] = [];
  for (const ev of ordered) {
    if (ev.etape === dossier.etape) {
      if (!steps.includes(ev.etape)) steps.push(ev.etape);
      break;
    }
    if (!steps.includes(ev.etape)) steps.push(ev.etape);
  }
  if (!steps.includes(dossier.etape)) steps.push(dossier.etape);
  const next = dossier.etape === 'cloture' ? [] : (BRANCHES.find((b) => b.from === dossier.etape)?.steps || []);
  const lob = dossier.affectationFixe.lob || '—';

  return (
    <div className="path">
      {steps.map((step, i) => {
        const now = step === dossier.etape;
        const last = i === steps.length - 1;
        return (
          <div key={`${step}-${i}`}>
            <div className={`node ${now ? 'now' : 'past'}`}>
              <div className="rail"><span className="dot" />{!(last && !next.length) && <span className="stem" />}</div>
              <div className="node-body">
                <strong>{labelOf(step)}</strong>
                <small>{now ? `Étape actuelle · ${lob} · ${dossier.agentId || 'agent non précisé'}` : 'Passé'}</small>
              </div>
            </div>
            {!last && <div className="arrow-label">suite</div>}
          </div>
        );
      })}
      {next.length > 0 && (
        <>
          <div className="arrow-label">{next.map((n) => n.label).join(' · ')}</div>
          {next.map((n) => (
            <div key={n.code} className="node next">
              <div className="rail"><span className="dot" /></div>
              <div className="node-body"><strong>{n.label}</strong><small>Sortie possible, non choisie</small></div>
            </div>
          ))}
        </>
      )}
      {dossier.etape === 'cloture' && <p className="note">Dossier clos. Aucune branche ouverte.</p>}
    </div>
  );
}

const CSS = `
.jx-dash { color: #18213b; font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
.jx-dash * { box-sizing: border-box; }
.jx-dash button, .jx-dash select { font: inherit; }
.jx-dash button { cursor: pointer; }
.jx-dash h1 { margin: 4px 0 0; font-size: 28px; letter-spacing: -.03em; color: #0b1330; }
.jx-dash h2 { margin: 0 0 4px; font-size: 15px; color: #0b1330; }
.jx-dash h3 { margin: 0 0 8px; font-size: 13px; color: #0b1330; }
.jx-dash .kicker { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #0aa8bd; font-weight: 800; }
.jx-dash .sub { margin: 6px 0 0; color: #62708a; font-size: 14px; line-height: 1.45; max-width: 640px; }
.jx-dash .top { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 16px; }
.jx-dash .meta { text-align: right; color: #62708a; font-size: 13px; }
.jx-dash .badge { display: inline-block; margin-bottom: 6px; padding: 4px 8px; border-radius: 999px; background: #e7fafd; color: #0aa8bd; font-size: 11px; font-weight: 800; }
.jx-dash .proof { margin: 0 0 12px; padding: 8px 12px; border-radius: 12px; background: #fff; border: 1px solid #e4e8f1; color: #62708a; font-size: 13px; }
.jx-dash .proof b { color: #0b1330; }
.jx-dash .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; }
.jx-dash .kpi { background: #fff; border: 1px solid #e4e8f1; border-radius: 16px; padding: 14px 16px; }
.jx-dash .kpi b { display: block; font-size: 28px; letter-spacing: -.04em; color: #0b1330; line-height: 1; }
.jx-dash .kpi span { display: block; margin-top: 6px; font-size: 12px; color: #62708a; }
.jx-dash .kpi.late b { color: #b42318; }
.jx-dash .grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 12px; }
.jx-dash .lower { margin-top: 12px; }
.jx-dash .card { background: #fff; border: 1px solid #e4e8f1; border-radius: 18px; padding: 14px 14px 12px; }
.jx-dash .hint, .jx-dash .note { margin: 0 0 12px; color: #62708a; font-size: 12.5px; line-height: 1.45; }
.jx-dash .note { margin: 8px 0 0; }
.jx-dash .note a { color: #0aa8bd; font-weight: 800; text-decoration: none; }
.jx-dash .step { display: grid; grid-template-columns: 132px 1fr 28px; gap: 8px; align-items: center; width: 100%; margin: 0 0 6px; padding: 7px 8px; border: 1px solid transparent; border-radius: 10px; background: transparent; text-align: left; color: #18213b; }
.jx-dash .step:hover { background: #f8fafc; }
.jx-dash .step.on { border-color: #9eeaf4; background: #f4fcfe; }
.jx-dash .step .name { font-size: 13px; font-weight: 700; }
.jx-dash .bar { height: 8px; border-radius: 99px; background: #eef1f6; overflow: hidden; }
.jx-dash .bar i { display: block; height: 100%; background: #0b1330; border-radius: 99px; }
.jx-dash .step.on .bar i { background: #0aa8bd; }
.jx-dash .step .n { font-size: 13px; font-weight: 800; text-align: right; }
.jx-dash .step.view { color: #62708a; }
.jx-dash .step.view .bar i { background: #c5d0e0; }
.jx-dash .list { margin-top: 8px; border-top: 1px solid #e4e8f1; padding-top: 8px; overflow-x: auto; }
.jx-dash table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.jx-dash th { text-align: left; color: #62708a; font-weight: 700; font-size: 11px; padding: 0 6px 6px; }
.jx-dash td { padding: 7px 6px; border-top: 1px solid #e4e8f1; vertical-align: top; }
.jx-dash tr.pick { cursor: pointer; }
.jx-dash tr.pick:hover td { background: #f8fafc; }
.jx-dash .ref { font-weight: 800; color: #0b1330; }
.jx-dash .pill { display: inline-block; border-radius: 99px; padding: 2px 7px; font-size: 11px; font-weight: 800; }
.jx-dash .ok { background: #e8f6ee; color: #1f8a56; }
.jx-dash .bad { background: #fdeceb; color: #b42318; }
.jx-dash .wait { background: #fff6e0; color: #9a6700; }
.jx-dash .mute { background: #f3f6fb; color: #62708a; }
.jx-dash .echeance { display: block; width: 100%; text-align: left; border: 0; border-bottom: 1px solid #e4e8f1; background: transparent; padding: 9px 0; }
.jx-dash .echeance:last-child { border-bottom: 0; }
.jx-dash .echeance b { display: block; color: #0b1330; font-size: 13px; }
.jx-dash .echeance span { display: block; margin-top: 2px; color: #62708a; font-size: 12px; }
.jx-dash .path { display: grid; gap: 0; margin-top: 12px; }
.jx-dash .node { display: grid; grid-template-columns: 16px 1fr; gap: 8px; }
.jx-dash .rail { display: flex; flex-direction: column; align-items: center; }
.jx-dash .dot { width: 10px; height: 10px; border-radius: 50%; background: #c5d0e0; margin-top: 4px; }
.jx-dash .node.past .dot { background: #0b1330; }
.jx-dash .node.now .dot { background: #0aa8bd; box-shadow: 0 0 0 4px rgba(38,212,234,.25); }
.jx-dash .node.next .dot { background: #fff; border: 2px solid #0aa8bd; }
.jx-dash .stem { width: 2px; flex: 1; min-height: 18px; background: #d5deec; }
.jx-dash .node-body { padding-bottom: 4px; }
.jx-dash .node-body strong { font-size: 13px; }
.jx-dash .node-body small { display: block; color: #62708a; font-size: 11.5px; }
.jx-dash .arrow-label { font-size: 11px; font-weight: 800; color: #0aa8bd; margin: 0 0 4px 24px; }
.jx-dash select.refsel { width: 100%; margin-top: 4px; padding: 8px 10px; border: 1px solid #e4e8f1; border-radius: 10px; background: #fff; }
.jx-dash .people { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.jx-dash .person { border: 1px solid #e4e8f1; border-radius: 14px; padding: 10px; background: #fff; }
.jx-dash .who { font-size: 13px; font-weight: 800; color: #0b1330; }
.jx-dash .tag { display: inline-block; margin-top: 8px; padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 800; }
.jx-dash .time { margin-top: 6px; font-size: 12px; color: #62708a; }
@media (max-width: 1100px) {
  .jx-dash .kpis, .jx-dash .grid, .jx-dash .people { grid-template-columns: 1fr 1fr; }
  .jx-dash .top { flex-direction: column; align-items: start; }
  .jx-dash .meta { text-align: left; }
}
@media (max-width: 700px) {
  .jx-dash .kpis, .jx-dash .grid, .jx-dash .people { grid-template-columns: 1fr; }
}
`;
