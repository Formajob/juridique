'use client';

/**
 * Même fichier pour :
 * src/app/admin/dossiers/page.tsx
 * src/app/juriste/dossiers/page.tsx
 *
 * Constatations : trois saisies. Pas de nom, pas de TL, pas de SPV, pas de n° saisi.
 * Le mail en attente n'est pas un dossier tant qu'il n'est pas validé.
 * Les autres entrées du menu Dossiers restent cette page, filtrée par l'étape.
 */

import Link from 'next/link';
import { FormEvent, Suspense, useMemo, useState, useSyncExternalStore } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Case } from '@/types/database';
import { BRANCHES } from '@/lib/workflow-branch';
import { createCase, getWorkflowState, setWorkflowState, subscribeWorkflow, transitionCase } from '@/lib/workflow-store';
import { ETAPE_LABELS, etapePageGroup, pageTitleFor } from '@/lib/workflow-ui';

const OBJETS = ['Abus de retard', 'Absence non justifié', 'Mise en objectif'];
const DEPS = ['VL', 'SAC', 'RET', 'STC', 'SAC_AFFAIRE', 'STC_AFFAIRE', 'PAV'];
const WAIT_KEY = 'juridique-attente-demo-v1';
const CSV_MODEL = 'Identifiant agent;Activité;Département;Date du fait;Heure;Date réception mail;Objet;Faits rapportés;Détails;Commentaire agent\nAGT-3302;VL;SAC;20/10/2026;14:10;27/10/2026;Abus de retard;Écart signalé sur un retard. Texte non qualifié.;Détail du fait, sans qualification.;\nAGT-3304;GV;RET;21/10/2026;09:30;27/10/2026;Mise en objectif;Faits transmis, sans qualification.;Détail de la mise en objectif.;';
const MAIL_MODEL = [
  'À : flow@acx.ma',
  'De : votre.adresse@gmail.com',
  'Objet : Abus de retard',
  '',
  'Identifiant agent : AGT-3302',
  'Activité : VL',
  'Département : SAC',
  'Date du fait : 20/10/2026',
  'Heure du fait : 14:10',
  'Objet : Abus de retard',
  'Faits rapportés : Écart signalé sur un retard. Texte non qualifié.',
  'Détails : Le détail du fait est ici, sans qualification.',
  'Commentaire agent :',
].join('\n');

type Mode = 'manuel' | 'csv' | 'mail';
type Intake = {
  agent: string; lob: string; department: string; mailDate: string; faitDate: string; faitHeure: string;
  objet: string; faits: string; details: string; commentaire: string; source: string; recuPar: string;
};
type WaitItem = Intake & { id: string; email: string; kind: 'test' | 'prod' | ''; missing: string[] };

const emptyForm = (): Intake => ({
  agent: '', lob: 'GV', department: '', mailDate: todayIso(), faitDate: '', faitHeure: '',
  objet: '', faits: '', details: '', commentaire: '', source: 'manuel', recuPar: 'Assistant 1',
});

function pad(n: number) { return String(n).padStart(2, '0'); }
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}
function fr(iso: string) {
  if (!iso) return '—';
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const [y, m, d] = iso.split('-');
  return `${Number(d)} ${mois[Number(m) - 1]} ${y}`;
}
function norm(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[°º]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
function canonObjet(v: string) {
  const n = norm(v);
  if (n === 'absence non justifiee') return 'Absence non justifié';
  return OBJETS.find((o) => norm(o) === n) || '';
}
function lobOf(v: string) {
  const s = norm(v);
  if (s === 'gv' || s === 'grande vitesse') return 'GV';
  if (s === 'vl') return 'VL';
  return '';
}
function parseLooseDate(v: string) {
  const s = v.trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (m) return `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`;
  return '';
}
function parseLooseTime(v: string) {
  const m = v.trim().match(/^(\d{1,2})[:h](\d{2})/);
  return m ? `${pad(Number(m[1]))}:${m[2]}` : '';
}
function fieldOf(c: Case, key: string) {
  const v = c.affectationFixe?.[key];
  return typeof v === 'string' ? v : '';
}
function factKey(agent: string, faitDate: string, objet: string) {
  const o = canonObjet(objet);
  if (!agent || !faitDate || !o) return '';
  return `${norm(agent)}|${faitDate}|${norm(o)}`;
}
function check(item: Intake, cases: Case[]) {
  if (!item.agent || !/\d/.test(item.agent)) return "L'identifiant agent est obligatoire.";
  if (!item.lob) return "L'activité est GV ou VL.";
  if (!item.mailDate) return 'La date de réception est obligatoire.';
  if (!canonObjet(item.objet)) return "Choisissez l'objet.";
  if (!item.faits) return 'Les faits rapportés sont obligatoires.';
  const key = factKey(item.agent, item.faitDate, item.objet);
  if (key && cases.some((c) => factKey(c.agentId || '', fieldOf(c, 'faitDate'), fieldOf(c, 'objet')) === key)) {
    return 'Même identifiant, même date du fait, même objet : déjà constaté.';
  }
  return '';
}
function nextRapport(cases: Case[]) {
  const n = cases.reduce((max, c) => {
    const m = fieldOf(c, 'rapport').match(/RF-(\d{4})-(\d+)/i);
    return m ? Math.max(max, parseInt(m[2], 10)) : max;
  }, 0) + 1;
  return `RF-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`;
}
function nextPreview(cases: Case[]) {
  const n = cases.reduce((max, c) => {
    const m = c.reference.match(/(\d+)\s*$/);
    return Math.max(max, m ? parseInt(m[1], 10) : 0);
  }, 0) + 1;
  const year = new Date().getFullYear();
  const prefix = cases.some((c) => c.reference.startsWith('DEMO-')) || !cases.length ? `DEMO-${year}-` : `JUR-${year}-`;
  const width = prefix.startsWith('DEMO') ? 4 : 3;
  return `${prefix}${String(n).padStart(width, '0')}`;
}
function seedWait(): WaitItem[] {
  const day = todayIso();
  const base = { department: 'SAC', faitHeure: '14:10', details: 'Détail du fait, sans qualification.', commentaire: '', source: 'mail', recuPar: 'Assistant 1', email: 'test.flow@gmail.com', kind: 'test' as const };
  return [
    { ...base, id: 'wait-demo-1', agent: 'AGT-3302', lob: 'VL', faitDate: '2026-10-20', mailDate: day, objet: 'Abus de retard', faits: 'Écart signalé sur un retard. Texte non qualifié.', missing: [] },
    { ...base, id: 'wait-demo-2', agent: 'AGT-3308', lob: 'GV', department: 'RET', faitDate: '2026-10-21', mailDate: day, objet: 'Absence non justifié', faits: '', email: 'prod.test@xceedcc.com', kind: 'prod', missing: ['faits'] },
  ];
}
function loadWait(): WaitItem[] {
  if (typeof window === 'undefined') return seedWait();
  try {
    const raw = window.localStorage.getItem(WAIT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WaitItem[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  const seeded = seedWait();
  window.localStorage.setItem(WAIT_KEY, JSON.stringify(seeded));
  return seeded;
}
function saveWait(items: WaitItem[]) {
  try { window.localStorage.setItem(WAIT_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

export default function DossiersPage() {
  return (
    <Suspense fallback={<p>Chargement…</p>}>
      <DossiersInner />
    </Suspense>
  );
}

function DossiersInner() {
  const path = usePathname() || '';
  const role = path.startsWith('/juriste') ? 'juriste' : 'admin';
  const base = role === 'juriste' ? '/juriste' : '/admin';
  const etape = useSearchParams().get('etape');
  if (etape === 'constatation_recue') return <Constatations base={base} />;
  return <DossierList role={role} base={base} etape={etape} />;
}

function Constatations({ base }: { base: string }) {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const [mode, setMode] = useState<Mode>('manuel');
  const [form, setForm] = useState<Intake>(emptyForm);
  const [note, setNote] = useState('');
  const [bad, setBad] = useState(false);
  const [csvRows, setCsvRows] = useState<(Intake & { errors: string[] })[]>([]);
  const [waiting, setWaiting] = useState<WaitItem[]>(() => loadWait());
  const [pendingId, setPendingId] = useState('');
  const [openRef, setOpenRef] = useState<string | null>(null);
  const received = snap.cases.filter((c) => c.etape === 'constatation_recue');
  const preview = nextPreview(snap.cases);
  const rapport = nextRapport(snap.cases);
  const opened = received.find((c) => c.reference === openRef) || null;

  function patch(partial: Partial<Intake>) {
    setForm((f) => ({ ...f, ...partial }));
  }
  function saveIntake(item: Intake, waitId = '') {
    const err = check(item, getWorkflowState().cases);
    if (err) { setBad(true); setNote(err); return; }
    const rf = nextRapport(getWorkflowState().cases);
    const created = createCase({
      agentId: item.agent,
      etape: 'constatation_recue',
      reception: true,
      creePar: item.recuPar || 'Saisie',
      echeance: addDays(item.mailDate, 8) ? new Date(`${addDays(item.mailDate, 8)}T12:00:00`).toISOString() : null,
      affectationFixe: {
        lob: item.lob,
        department: item.department,
        rapport: rf,
        faitDate: item.faitDate,
        faitHeure: item.faitHeure,
        objet: canonObjet(item.objet),
        faits: item.faits,
        details: item.details,
        commentaire: item.commentaire,
        source: item.source,
        recuPar: item.recuPar,
      },
    });
    const s = getWorkflowState();
    setWorkflowState({
      ...s,
      events: s.events.map((e) => e.dossier === created.reference && e.action === 'Dossier saisi' ? { ...e, action: `Constatation validée · ${rf}` } : e),
    });
    if (waitId) {
      const next = waiting.filter((w) => w.id !== waitId);
      setWaiting(next);
      saveWait(next);
      setPendingId('');
    }
    setForm(emptyForm());
    setBad(false);
    setNote(`${created.reference} créé. N° ${rf} attribué. Échéance le ${fr(addDays(item.mailDate, 8))}.`);
  }
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    saveIntake({ ...form, source: pendingId ? 'mail' : form.source }, pendingId);
  }

  return (
    <div className="jx-dos">
      <style>{CSS}</style>
      <div className="kicker">Xceed · Juridique</div>
      <h1>Constatations</h1>
      <p className="sub">Trois saisies. Le mail reçu crée un dossier en attente, sans collage. Le n° est attribué à la validation. Pas de nom, pas de TL, pas de SPV.</p>
      <section className="card">
        <div className="modes">
          {([['manuel', 'Saisie manuelle'], ['csv', 'Import CSV'], ['mail', 'Mail flow@acx.ma']] as [Mode, string][]).map(([id, label]) => (
            <button key={id} type="button" className={mode === id ? 'mode on' : 'mode'} onClick={() => setMode(id)}>{label}</button>
          ))}
        </div>
        {mode === 'manuel' && <p className="hint">Saisie du rapport de fait. Pas de n° à taper.</p>}
        {mode === 'csv' && (
          <>
            <p className="hint">Le modèle n’a pas de n° de rapport. Une ligne prête remplit le formulaire.</p>
            <div className="acts">
              <button className="ghost" type="button" onClick={() => downloadCsv()}>Télécharger le modèle</button>
              <button className="ghost" type="button" onClick={() => setCsvRows(parseCsv(CSV_MODEL))}>Essayer le modèle</button>
              <label className="ghost">Choisir un CSV<input type="file" accept=".csv,text/csv" hidden onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                file.text().then((text) => setCsvRows(parseCsv(text)));
              }} /></label>
            </div>
            {csvRows.length > 0 && (
              <table>
                <thead><tr><th>Agent</th><th>Objet</th><th>Contrôle</th></tr></thead>
                <tbody>
                  {csvRows.map((r, i) => (
                    <tr key={i} className="pick" onClick={() => {
                      if (r.errors.length) { setBad(true); setNote(r.errors[0]); return; }
                      setForm({ ...r, source: 'csv' });
                      setBad(false);
                      setNote('Ligne extraite. Enregistrer crée la constatation.');
                    }}>
                      <td>{r.agent || '—'}</td>
                      <td>{canonObjet(r.objet) || r.objet || '—'}</td>
                      <td>{r.errors.length ? <span className="pill bad">{r.errors[0]}</span> : <span className="pill ok">Prêt</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
        {mode === 'mail' && (
          <>
            <p className="hint">Un mail reçu apparaît ici tout seul. Rien n’est validé avant le clic. Gmail est accepté pour le test. La boîte Zoho n’est pas branchée sur cette copie : la file ci-dessous est la démo.</p>
            {waiting.length === 0 && <p className="note">Aucun mail en attente.</p>}
            {waiting.map((w) => (
              <article key={w.id} className="wait">
                <b>{w.agent || 'Sans identifiant'}</b> · {w.objet || 'Sans objet'}
                <p className="note">{w.email} · {w.kind === 'test' ? 'Test Gmail' : 'Prod'} · reçu {fr(w.mailDate)} · échéance {fr(addDays(w.mailDate, 8))}</p>
                <p className="note">{w.missing.length ? `À compléter : ${w.missing.join(', ')}` : 'Complet. Toujours en attente.'}</p>
                <div className="acts">
                  <button className="act" type="button" disabled={!!w.missing.length} onClick={() => saveIntake(w, w.id)}>Valider</button>
                  <button className="ghost" type="button" onClick={() => { setForm({ ...w, source: 'mail' }); setPendingId(w.id); setNote('Complétez, puis Enregistrer. Le dossier reste en attente jusque-là.'); }}>Compléter</button>
                  <button className="ghost" type="button" onClick={() => { const next = waiting.filter((x) => x.id !== w.id); setWaiting(next); saveWait(next); setNote('Rejeté. Aucun dossier créé.'); }}>Rejeter</button>
                </div>
              </article>
            ))}
            <p className="note">Modèle envoyé à la boîte. Le n° de rapport n’y est pas.</p>
            <pre className="model">{MAIL_MODEL}</pre>
          </>
        )}
        <form onSubmit={onSubmit}>
          <div className="fields">
            <label>Référence<input className="ro" readOnly value={preview} /></label>
            <label>N° du rapport<input className="ro" readOnly value={`Attribué à l'enregistrement · ${rapport}`} /></label>
            <label>Reçu par
              <select value={form.recuPar} onChange={(e) => patch({ recuPar: e.target.value })}>
                <option>Assistant 1</option>
                <option>Assistant 2</option>
                <option>Assistant 3</option>
              </select>
            </label>
            <label>Identifiant agent<input required placeholder="AGT-0000" value={form.agent} onChange={(e) => patch({ agent: e.target.value })} /></label>
            <label>Activité
              <select required value={form.lob} onChange={(e) => patch({ lob: e.target.value })}><option value="GV">GV</option><option value="VL">VL</option></select>
            </label>
            <label>Département
              <select value={form.department} onChange={(e) => patch({ department: e.target.value })}>
                <option value="">Non précisé</option>
                {DEPS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label>Date de réception<input type="date" required value={form.mailDate} onChange={(e) => patch({ mailDate: e.target.value })} /></label>
            <label>Échéance<input className="ro" readOnly value={form.mailDate ? fr(addDays(form.mailDate, 8)) : ''} /></label>
            <label>Date du fait<input type="date" value={form.faitDate} onChange={(e) => patch({ faitDate: e.target.value })} /></label>
            <label>Heure du fait<input type="time" value={form.faitHeure} onChange={(e) => patch({ faitHeure: e.target.value })} /></label>
            <label className="full">Objet
              <select required value={form.objet} onChange={(e) => patch({ objet: e.target.value })}>
                <option value="">Choisir</option>
                {OBJETS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="full">Faits rapportés<textarea value={form.faits} placeholder="Texte non qualifié." onChange={(e) => patch({ faits: e.target.value })} /></label>
            <label className="full">Détails<textarea value={form.details} placeholder="Détail du fait, sans qualification." onChange={(e) => patch({ details: e.target.value })} /></label>
            <label className="full">Commentaire agent, facultatif<textarea value={form.commentaire} placeholder="Peut rester vide." onChange={(e) => patch({ commentaire: e.target.value })} /></label>
          </div>
          <div className="acts">
            <button className="act" type="submit">Enregistrer en constatation</button>
            <button className="ghost" type="button" onClick={() => { setForm(emptyForm()); setPendingId(''); setNote(''); }}>Vider</button>
          </div>
        </form>
        {note && <p className={bad ? 'badmsg' : 'okmsg'}>{note}</p>}
      </section>
      <section className="card">
        <h2>Dossiers reçus</h2>
        <p className="hint">Un clic ouvre la fiche. La sortie est de lancer l’analyse.</p>
        {received.length === 0 ? <p className="note">Aucune constatation reçue.</p> : (
          <table>
            <thead><tr><th>Référence</th><th>Agent</th><th>Objet</th><th>Reçu le</th><th>Échéance</th><th>N°</th></tr></thead>
            <tbody>
              {received.map((c) => {
                const late = !!c.echeance && new Date(c.echeance) < new Date();
                return (
                  <tr key={c.id} className="pick" onClick={() => setOpenRef(c.reference)}>
                    <td className="ref">{c.reference}</td>
                    <td>{c.agentId || '—'}</td>
                    <td>{fieldOf(c, 'objet') || '—'}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>{c.echeance ? new Date(c.echeance).toLocaleDateString('fr-FR') : '—'}</td>
                    <td>{fieldOf(c, 'rapport') || '—'} {late && <span className="pill bad">Retard</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
      {opened && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpenRef(null); }}>
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="sheet-h">
              <div>
                <span className="pill mute">Constatation reçue</span>
                <h2>{opened.reference}</h2>
                <p className="note">{opened.affectationFixe.lob || '—'} · {opened.agentId || '—'} · {fieldOf(opened, 'rapport') || 'sans n°'}</p>
              </div>
              <button className="x" type="button" onClick={() => setOpenRef(null)}>×</button>
            </div>
            <div className="sheet-b">
              <p className="note">Objet : {fieldOf(opened, 'objet') || '—'}. Échéance {opened.echeance ? new Date(opened.echeance).toLocaleDateString('fr-FR') : '—'}.</p>
              {fieldOf(opened, 'faits') && <div className="faits">{fieldOf(opened, 'faits')}</div>}
              {fieldOf(opened, 'details') && <><p className="note">Détails</p><div className="faits">{fieldOf(opened, 'details')}</div></>}
              <p className="note">{fieldOf(opened, 'commentaire') ? `Commentaire agent : ${fieldOf(opened, 'commentaire')}` : 'Pas de commentaire agent.'}</p>
              <div className="acts">
                <button className="act" type="button" onClick={() => { transitionCase(opened.reference, 'analyse_gravite', 'Analyse lancée', 'Constatations'); setNote('Noté. Le dossier est dans Analyse. Aucune lettre.'); setOpenRef(null); }}>Lancer l’analyse</button>
                <Link className="ghost" href={`${base}/dossiers/${opened.reference}`}>Ouvrir la fiche</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const sep = lines[0].split(';').length >= lines[0].split(',').length ? ';' : ',';
  const headers = splitCsv(lines[0], sep).map(headerField);
  return lines.slice(1).map((line) => {
    const cells = splitCsv(line, sep);
    const item: Intake & { errors: string[] } = { ...emptyForm(), errors: [] };
    headers.forEach((field, i) => {
      if (!field) return;
      const raw = cells[i] || '';
      if (field === 'faitDate' || field === 'mailDate') item[field] = parseLooseDate(raw);
      else if (field === 'faitHeure') item.faitHeure = parseLooseTime(raw);
      else if (field === 'lob') item.lob = lobOf(raw);
      else (item as unknown as Record<string, string>)[field] = raw.trim();
    });
    if (!item.mailDate) item.mailDate = todayIso();
    item.source = 'csv';
    const err = check(item, getWorkflowState().cases);
    if (err) item.errors.push(err);
    return item;
  }).filter((item) => item.agent || item.faits || item.objet);
}
function headerField(header: string) {
  const map: Record<string, string> = {
    'identifiant agent': 'agent', identifiant: 'agent', activite: 'lob', departement: 'department',
    'date du fait': 'faitDate', heure: 'faitHeure', 'heure du fait': 'faitHeure',
    'date reception mail': 'mailDate', 'date reception': 'mailDate', 'date de reception': 'mailDate',
    objet: 'objet', 'faits rapportes': 'faits', faits: 'faits', details: 'details',
    'commentaire agent': 'commentaire', commentaire: 'commentaire',
  };
  return map[norm(header)] || '';
}
function splitCsv(line: string, sep: string) {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; continue; }
    if (ch === sep && !q) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}
function downloadCsv() {
  const blob = new Blob([CSV_MODEL], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'modele-rapport-de-fait.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function DossierList({ role, base, etape }: { role: 'admin' | 'juriste'; base: string; etape: string | null }) {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const [openRef, setOpenRef] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const isEcheances = role === 'admin' && etape === null;
  const title = isEcheances ? 'Échéances' : pageTitleFor(etape, role);
  const items = useMemo(() => {
    if (isEcheances) return snap.cases.filter((c) => !!c.echeance).sort((a, b) => new Date(a.echeance || 0).getTime() - new Date(b.echeance || 0).getTime());
    if (!etape) return snap.cases.filter((c) => c.etape !== 'cloture');
    const group = etapePageGroup(etape);
    return snap.cases.filter((c) => (group.length ? group : [etape]).includes(c.etape));
  }, [snap, etape, isEcheances]);
  const opened = snap.cases.find((c) => c.reference === openRef) || null;
  const next = opened ? BRANCHES.find((b) => b.from === opened.etape)?.steps || [] : [];

  return (
    <div className="jx-dos">
      <style>{CSS}</style>
      <div className="kicker">Xceed · Juridique</div>
      <h1>{title}</h1>
      <p className="sub">{items.length} dossier{items.length > 1 ? 's' : ''}. Un clic ouvre la décision de cette étape. Un retard ne change pas l’étape.</p>
      <section className="card">
        {items.length === 0 ? <p className="note">Aucun dossier dans cette vue.</p> : (
          <table>
            <thead><tr><th>Référence</th><th>Activité</th><th>Agent</th><th>Étape</th><th>Échéance</th><th>Statut</th></tr></thead>
            <tbody>
              {items.map((c) => {
                const late = c.etape !== 'cloture' && !!c.echeance && new Date(c.echeance) < new Date();
                const label = c.etape === 'cloture' ? 'Clos' : late ? 'En retard' : c.echeance ? 'Dans le délai' : 'En attente';
                const cls = c.etape === 'cloture' ? 'mute' : late ? 'bad' : c.echeance ? 'ok' : 'wait';
                return (
                  <tr key={c.id} className="pick" onClick={() => { setOpenRef(c.reference); setNote(''); }}>
                    <td className="ref">{c.reference}</td>
                    <td>{c.affectationFixe.lob || '—'}</td>
                    <td>{c.agentId || '—'}</td>
                    <td>{ETAPE_LABELS[c.etape] || c.etape}</td>
                    <td>{c.echeance ? new Date(c.echeance).toLocaleDateString('fr-FR') : '—'}</td>
                    <td><span className={`pill ${cls}`}>{label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
      {opened && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpenRef(null); }}>
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="sheet-h">
              <div>
                <h2>{opened.reference}</h2>
                <p className="note">{ETAPE_LABELS[opened.etape] || opened.etape} · {opened.affectationFixe.lob || '—'} · {opened.agentId || '—'}</p>
              </div>
              <button className="x" type="button" onClick={() => setOpenRef(null)}>×</button>
            </div>
            <div className="sheet-b">
              {next.length ? next.map((n) => (
                <button key={n.code} className="act" type="button" onClick={() => { transitionCase(opened.reference, n.code, n.label, title); setNote(`${n.label} noté. Aucune lettre.`); }}>{n.label}</button>
              )) : <p className="note">Dossier clos. Aucune branche ouverte.</p>}
              {note && <p className="okmsg">{note}</p>}
              <p className="note"><Link href={`${base}/dossiers/${opened.reference}`}>Ouvrir la fiche</Link></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.jx-dos { color: #18213b; font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
.jx-dos * { box-sizing: border-box; }
.jx-dos button, .jx-dos input, .jx-dos select, .jx-dos textarea { font: inherit; }
.jx-dos button { cursor: pointer; }
.jx-dos h1 { margin: 4px 0 0; font-size: 28px; letter-spacing: -.03em; color: #0b1330; }
.jx-dos h2 { margin: 0 0 6px; font-size: 16px; color: #0b1330; }
.jx-dos .kicker { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #0aa8bd; font-weight: 800; }
.jx-dos .sub, .jx-dos .hint, .jx-dos .note { color: #62708a; font-size: 13px; line-height: 1.45; }
.jx-dos .card { background: #fff; border: 1px solid #e4e8f1; border-radius: 18px; padding: 14px; margin-top: 12px; }
.jx-dos .modes, .jx-dos .acts { display: flex; flex-wrap: wrap; gap: 8px; }
.jx-dos .mode, .jx-dos .ghost, .jx-dos .act { border-radius: 999px; padding: 8px 12px; font-weight: 800; }
.jx-dos .mode, .jx-dos .ghost { border: 1px solid #e4e8f1; background: #fff; color: #0b1330; text-decoration: none; display: inline-flex; align-items: center; }
.jx-dos .mode.on, .jx-dos .act { border: 0; background: #0b1330; color: #fff; }
.jx-dos .act:disabled { opacity: .45; cursor: not-allowed; }
.jx-dos .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.jx-dos label { display: grid; gap: 4px; font-size: 12px; font-weight: 800; color: #62708a; }
.jx-dos label.full { grid-column: 1 / -1; }
.jx-dos input, .jx-dos select, .jx-dos textarea { width: 100%; border: 1px solid #e4e8f1; border-radius: 10px; padding: 8px 10px; color: #18213b; background: #fff; }
.jx-dos textarea { min-height: 74px; }
.jx-dos .ro { background: #f7f8fb; }
.jx-dos table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
.jx-dos th { text-align: left; color: #62708a; font-size: 11px; padding: 0 6px 6px; }
.jx-dos td { padding: 7px 6px; border-top: 1px solid #e4e8f1; vertical-align: top; }
.jx-dos tr.pick { cursor: pointer; }
.jx-dos tr.pick:hover td { background: #f8fafc; }
.jx-dos .ref { font-weight: 800; color: #0b1330; }
.jx-dos .pill { display: inline-block; border-radius: 99px; padding: 2px 7px; font-size: 11px; font-weight: 800; }
.jx-dos .ok { background: #e8f6ee; color: #1f8a56; }
.jx-dos .bad { background: #fdeceb; color: #b42318; }
.jx-dos .pill.wait { background: #fff6e0; color: #9a6700; }
.jx-dos .mute { background: #f3f6fb; color: #62708a; }
.jx-dos article.wait { margin-top: 8px; padding: 10px; border: 1px solid #e4e8f1; border-radius: 12px; }
.jx-dos .model { white-space: pre-wrap; background: #f7f8fb; border-radius: 12px; padding: 10px; font-size: 12px; }
.jx-dos .okmsg, .jx-dos .badmsg { margin-top: 8px; padding: 8px 10px; border-radius: 10px; font-size: 12.5px; font-weight: 700; }
.jx-dos .okmsg { background: #e8f6ee; color: #1f8a56; }
.jx-dos .badmsg { background: #fdeceb; color: #b42318; }
.jx-dos .overlay { position: fixed; inset: 0; z-index: 80; background: rgba(11,19,48,.46); display: flex; align-items: center; justify-content: center; padding: 18px; }
.jx-dos .sheet { width: min(640px, 100%); max-height: 90vh; overflow: auto; background: #fff; border-radius: 18px; }
.jx-dos .sheet-h, .jx-dos .sheet-b { padding: 14px 16px; }
.jx-dos .sheet-h { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid #e4e8f1; }
.jx-dos .x { width: 34px; height: 34px; border-radius: 99px; border: 1px solid #e4e8f1; background: #fff; }
.jx-dos .faits { margin-top: 6px; padding: 8px 10px; border-radius: 10px; background: #f7f8fb; font-size: 13px; }
.jx-dos .sheet-b .act { margin: 8px 8px 0 0; }
@media (max-width: 800px) { .jx-dos .fields { grid-template-columns: 1fr; } }
`;
