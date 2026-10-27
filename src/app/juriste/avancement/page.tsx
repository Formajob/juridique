'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSyncExternalStore } from 'react';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';

type Status = 'delai' | 'retard' | 'attente' | 'clos';
interface DossierItem { ref: string; lob: string; agent: string; juriste: string; statut: Status; detail: string; echeance: string | null; }
interface StepMeta { id: string; x: number; y: number; label: string; onglet: string; echeance: string; next: { id: string; label: string }[]; }
interface Arrow { from: string; d: string; join?: boolean; }
interface LabelItem { from: string; text: string; x: number; y: number; }

const W = 136, H = 56, BUS = 1188;

const STEP_META: StepMeta[] = [
  { id: 'constatation_recue', x: 342, y: 8, label: 'Constatation reçue', onglet: 'Constatations', echeance: '8 jours pour lancer l’analyse', next: [{ id: 'analyse_gravite', label: 'Lancer l’analyse' }] },
  { id: 'analyse_gravite', x: 342, y: 112, label: 'Analyse', onglet: 'Analyse', echeance: '8 jours après la réception', next: [{ id: 'sanction_faute_non_grave', label: 'Faute non grave : sanction directe' }, { id: 'convocation_seance', label: 'Faute grave : convocation' }] },
  { id: 'sanction_faute_non_grave', x: 24, y: 248, label: 'Sanction directe', onglet: 'Décisions', echeance: 'Pas de séance. Pas d’inspection.', next: [{ id: 'cloture', label: 'Clore' }] },
  { id: 'convocation_seance', x: 342, y: 248, label: 'Convocation', onglet: 'Convocations', echeance: '8 jours · présence non notée', next: [{ id: 'seance_presente', label: 'Présent : noter la séance' }, { id: 'seance_absente', label: 'Absent : noter l’absence' }] },
  { id: 'seance_presente', x: 180, y: 400, label: 'Séance présente', onglet: 'Séances', echeance: 'Le papier reste dehors', next: [{ id: 'pv_seance', label: 'Noter le PV remis' }] },
  { id: 'pv_seance', x: 180, y: 528, label: 'PV de séance', onglet: 'Séances', echeance: 'Choix non saisi', next: [{ id: 'decision_licenciement', label: 'Faute grave : licenciement' }, { id: 'decision_mise_a_pied', label: 'Faute grave : mise à pied' }, { id: 'decision_sanction', label: 'Faute non grave : sanction' }, { id: 'fin_procedure', label: 'Absence du fait' }] },
  { id: 'seance_absente', x: 520, y: 400, label: 'Agent absent', onglet: 'Séances', echeance: 'Dépôt non saisi', next: [{ id: 'depot_inspection_absence', label: 'Déposer à l’inspection' }] },
  { id: 'depot_inspection_absence', x: 520, y: 528, label: 'Dépôt inspection', onglet: 'Décisions', echeance: 'Branche absence', next: [{ id: 'investigations', label: 'Ouvrir les investigations' }] },
  { id: 'investigations', x: 520, y: 656, label: 'Investigations', onglet: 'Décisions', echeance: 'L’outil note l’ouverture. Il n’enquête pas.', next: [{ id: 'decision_licenciement', label: 'Faute grave : licenciement' }, { id: 'decision_mise_a_pied', label: 'Faute grave : mise à pied' }, { id: 'decision_sanction', label: 'Faute non grave : sanction' }, { id: 'fin_procedure', label: 'Absence du fait' }] },
  { id: 'decision_licenciement', x: 180, y: 820, label: 'Licenciement', onglet: 'Décisions', echeance: 'Puis les 48 heures', next: [{ id: 'notification_48h', label: 'Rappel des 48 heures' }] },
  { id: 'decision_mise_a_pied', x: 340, y: 820, label: 'Mise à pied', onglet: 'Décisions', echeance: 'Puis les 48 heures', next: [{ id: 'notification_48h', label: 'Rappel des 48 heures' }] },
  { id: 'decision_sanction', x: 500, y: 820, label: 'Sanction', onglet: 'Décisions', echeance: 'Pas d’inspection', next: [{ id: 'cloture', label: 'Clore' }] },
  { id: 'fin_procedure', x: 660, y: 820, label: 'Absence du fait', onglet: 'Décisions', echeance: 'Pas d’inspection', next: [{ id: 'cloture', label: 'Clore' }] },
  { id: 'notification_48h', x: 230, y: 960, label: 'Rappel 48 h', onglet: 'Décisions', echeance: '48 heures. Visible aussi dans Échéances.', next: [{ id: 'depot_inspection_decision', label: 'Dépôt à l’inspection' }] },
  { id: 'depot_inspection_decision', x: 230, y: 1088, label: 'Dépôt inspection', onglet: 'Décisions', echeance: 'Après les 48 heures', next: [{ id: 'cloture', label: 'Clore' }] },
  { id: 'cloture', x: 342, y: 1216, label: 'Clos', onglet: 'Clos', echeance: 'Aucune branche ouverte', next: [] },
];

export default function AvancementPage() {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const byId = Object.fromEntries(STEP_META.map(s => [s.id, s]));
  function dossiersFor(code: string): DossierItem[] {
    return snap.cases.filter(c => c.etape === code).map(c => {
      const late = !!c.echeance && new Date(c.echeance) < new Date();
      const clos = c.etape === 'cloture';
      const statut: Status = clos ? 'clos' : late ? 'retard' : c.echeance ? 'delai' : 'attente';
      const dateStr = c.echeance ? new Date(c.echeance).toLocaleDateString('fr-FR') : '';
      const detail = clos ? 'Clos · aucune branche ouverte' : late ? `En retard · échéance dépassée le ${dateStr}` : c.echeance ? `Dans le délai · échéance ${dateStr}` : 'En attente · aucune échéance';
      return { ref: c.reference, lob: c.affectationFixe?.lob || '-', agent: c.agentId || '-', juriste: c.juriste?.nom || '-', statut, detail, echeance: c.echeance ?? null };
    });
  }
  const steps = STEP_META.map(m => ({ ...m, dossiers: dossiersFor(m.id) }));
  const count = (step: { dossiers: DossierItem[] }, kind: Status) => step.dossiers.filter(d => d.statut === kind).length;
  const [selectedId, setSelectedId] = useState<string | null>('analyse_gravite');
  const popRef = useRef<HTMLDivElement>(null);
  const [popStyle, setPopStyle] = useState<{ left: number; top: number; cls: string; tail: number } | null>(null);
  const CX = (id: string) => byId[id].x + W / 2;
  const B = (id: string) => byId[id].y + H;
  const T = (id: string) => byId[id].y;
  const arrows = [
    { from: 'constatation_recue', d: `M ${CX('constatation_recue')} ${B('constatation_recue')} V ${T('analyse_gravite')}` },
    { from: 'analyse_gravite', d: `M ${CX('analyse_gravite')} ${B('analyse_gravite')} V 196 H ${CX('sanction_faute_non_grave')} V ${T('sanction_faute_non_grave')}` },
    { from: 'analyse_gravite', d: `M ${CX('analyse_gravite')} ${B('analyse_gravite')} V ${T('convocation_seance')}` },
    { from: 'sanction_faute_non_grave', d: `M ${CX('sanction_faute_non_grave')} ${B('sanction_faute_non_grave')} V ${BUS} H ${CX('cloture')} V ${T('cloture')}` },
    { from: 'convocation_seance', d: `M ${CX('convocation_seance')} ${B('convocation_seance')} V 352 H ${CX('seance_presente')} V ${T('seance_presente')}` },
    { from: 'convocation_seance', d: `M ${CX('convocation_seance')} ${B('convocation_seance')} V 352 H ${CX('seance_absente')} V ${T('seance_absente')}` },
    { from: 'seance_presente', d: `M ${CX('seance_presente')} ${B('seance_presente')} V ${T('pv_seance')}` },
    { from: 'seance_absente', d: `M ${CX('seance_absente')} ${B('seance_absente')} V ${T('depot_inspection_absence')}` },
    { from: 'depot_inspection_absence', d: `M ${CX('depot_inspection_absence')} ${B('depot_inspection_absence')} V ${T('investigations')}` },
    { from: 'pv_seance', d: `M ${CX('pv_seance')} ${B('pv_seance')} V 748 H 488 V 772`, join: true },
    { from: 'investigations', d: `M ${CX('investigations')} ${B('investigations')} V 748 H 488`, join: true },
    { from: 'pv investig', d: `M ${CX('decision_licenciement')} 772 V ${T('decision_licenciement')}` },
    { from: 'pv investig', d: `M ${CX('decision_mise_a_pied')} 772 V ${T('decision_mise_a_pied')}` },
    { from: 'pv investig', d: `M ${CX('decision_sanction')} 772 V ${T('decision_sanction')}` },
    { from: 'pv investig', d: `M ${CX('fin_procedure')} 772 V ${T('fin_procedure')}` },
    { from: 'pv investig', d: `M ${CX('decision_licenciement')} 772 H ${CX('fin_procedure')}`, join: true },
    { from: 'decision_licenciement', d: `M ${CX('decision_licenciement')} ${B('decision_licenciement')} V 918 H ${CX('notification_48h')} V ${T('notification_48h')}` },
    { from: 'decision_mise_a_pied', d: `M ${CX('decision_mise_a_pied')} ${B('decision_mise_a_pied')} V 918 H ${CX('notification_48h')} V ${T('notification_48h')}` },
    { from: 'notification_48h', d: `M ${CX('notification_48h')} ${B('notification_48h')} V ${T('depot_inspection_decision')}` },
    { from: 'depot_inspection_decision', d: `M ${CX('depot_inspection_decision')} ${B('depot_inspection_decision')} V ${BUS} H ${CX('cloture')} V ${T('cloture')}` },
    { from: 'decision_sanction', d: `M ${CX('decision_sanction')} ${B('decision_sanction')} V ${BUS} H ${CX('cloture')} V ${T('cloture')}` },
    { from: 'fin_procedure', d: `M ${CX('fin_procedure')} ${B('fin_procedure')} V ${BUS} H ${CX('cloture')} V ${T('cloture')}` },
  ];
  const labels = [
    { from: 'constatation_recue', text: 'Lancer l’analyse', x: CX('constatation_recue'), y: (B('constatation_recue') + T('analyse_gravite')) / 2 },
    { from: 'analyse_gravite', text: 'Faute non grave', x: (CX('analyse_gravite') + CX('sanction_faute_non_grave')) / 2, y: 196 },
    { from: 'analyse_gravite', text: 'Faute grave', x: CX('analyse_gravite'), y: (196 + T('convocation_seance')) / 2 },
    { from: 'sanction_faute_non_grave', text: 'puis Clos', x: CX('sanction_faute_non_grave'), y: 560 },
    { from: 'convocation_seance', text: 'Présent', x: CX('seance_presente'), y: (352 + T('seance_presente')) / 2 },
    { from: 'convocation_seance', text: 'Absent', x: CX('seance_absente'), y: (352 + T('seance_absente')) / 2 },
    { from: 'seance_presente', text: 'PV remis', x: CX('seance_presente'), y: (B('seance_presente') + T('pv_seance')) / 2 },
    { from: 'seance_absente', text: 'Dépôt', x: CX('seance_absente'), y: (B('seance_absente') + T('depot_inspection_absence')) / 2 },
    { from: 'depot_inspection_absence', text: 'Investigations', x: CX('depot_inspection_absence'), y: (B('depot_inspection_absence') + T('investigations')) / 2 },
    { from: 'pv investig', text: 'Même choix', x: 488, y: 772 },
    { from: 'decision_licenciement', text: '48 h', x: CX('notification_48h'), y: (918 + T('notification_48h')) / 2 },
    { from: 'decision_mise_a_pied', text: '48 h', x: CX('notification_48h'), y: (918 + T('notification_48h')) / 2 },
    { from: 'notification_48h', text: 'Dépôt', x: CX('notification_48h'), y: (B('notification_48h') + T('depot_inspection_decision')) / 2 },
    { from: 'depot_inspection_decision', text: 'Clos', x: (CX('depot_inspection_decision') + CX('cloture')) / 2, y: BUS },
    { from: 'decision_sanction', text: 'Clos', x: CX('decision_sanction'), y: 1040 },
    { from: 'fin_procedure', text: 'Clos', x: CX('fin_procedure'), y: 1040 },
  ];
  const hot = (from: string, id: string | null) => !!id && from.split(' ').includes(id);
  const selectedStep = steps.find(s => s.id === selectedId) || null;
  const nextIds = new Set(selectedStep?.next.map(n => n.id) || []);
  const placePop = useCallback(() => {
    if (!selectedId || !popRef.current) return;
    const card = document.querySelector(`.card[data-id="${selectedId}"]`) as HTMLElement | null;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const pop = popRef.current;
    const bw = 270; const bh = pop.offsetHeight || 220;
    const vw = window.innerWidth; const vh = window.innerHeight; const gap = 12;
    let left = 0, top = 0, cls = '';
    if (r.right + gap + bw <= vw - 8) { cls = 'pop right'; left = r.right + gap; top = r.top - 4; }
    else if (r.left - gap - bw >= 8) { cls = 'pop left'; left = r.left - gap - bw; top = r.top - 4; }
    else if (vh - r.bottom > r.top) { cls = 'pop below'; left = Math.max(8, Math.min(r.left, vw - bw - 8)); top = r.bottom + gap; }
    else { cls = 'pop above'; left = Math.max(8, Math.min(r.left, vw - bw - 8)); top = r.top - gap - bh; }
    top = Math.max(8, Math.min(top, vh - Math.min(bh, vh - 16) - 8));
    left = Math.max(8, Math.min(left, vw - bw - 8));
    const tail = cls === 'pop right' || cls === 'pop left' ? r.top + r.height / 2 - top - 6 : r.left + r.width / 2 - left - 6;
    setPopStyle({ left, top, cls, tail: Math.max(16, tail) });
  }, [selectedId]);
  useEffect(() => { if (selectedId) requestAnimationFrame(() => placePop()); else setPopStyle(null); }, [selectedId, placePop]);
  useEffect(() => {
    function onScrollResize() { if (selectedId) placePop(); }
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);
    return () => { window.removeEventListener('scroll', onScrollResize, true); window.removeEventListener('resize', onScrollResize); };
  }, [selectedId, placePop]);
  const total = snap.cases.length;
  const enCours = snap.cases.filter(c => c.etape !== 'cloture').length;
  const clos = snap.cases.filter(c => c.etape === 'cloture').length;
  const retard = snap.cases.filter(c => c.etape !== 'cloture' && !!c.echeance && new Date(c.echeance) < new Date()).length;
  return (
    <div className="wrap-admin">
      <style>{`
        :root { --navy: #0b1330; --encre: #18213b; --muted: #62708a; --fond: #f6f7fb; --filet: #e4e8f1; --cyan-d: #0aa8bd; --vert: #1f8a56; --vert-bg: #e8f6ee; --rouge: #b42318; --rouge-bg: #fdeceb; --ambre: #9a6700; --ambre-bg: #fff6e0; }
        .page { max-width: 1180px; margin: 0 auto; padding: 24px 18px 48px; }
        .kicker { display: flex; align-items: center; gap: 8px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--cyan-d); font-weight: 700; }
        .kicker i { width: 8px; height: 8px; border-radius: 50%; background: #26d4ea; display: inline-block; }
        h1 { margin: 8px 0 4px; font-size: 28px; letter-spacing: -.03em; color: var(--navy); }
        .lead { margin: 0 0 14px; max-width: 760px; color: var(--muted); font-size: 14.5px; line-height: 1.5; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }
        .stat { background: #fff; border: 1px solid var(--filet); border-radius: 14px; padding: 12px 14px; }
        .stat b { display: block; font-size: 24px; color: var(--navy); letter-spacing: -.03em; }
        .stat span { font-size: 12px; color: var(--muted); }
        .stat.alert b { color: var(--rouge); }
        .board { background: #fff; border: 1px solid var(--filet); border-radius: 20px; padding: 14px 12px 18px; overflow: auto; }
        .board h2 { margin: 0 12px 2px; font-size: 15px; }
        .board .hint { margin: 0 12px 10px; color: var(--muted); font-size: 12.5px; }
        .canvas { position: relative; width: 820px; height: 1288px; margin: 0 auto; }
        svg.links { position: absolute; inset: 0; width: 820px; height: 1288px; z-index: 1; pointer-events: none; }
        .card { position: absolute; width: 136px; min-height: 56px; padding: 6px 8px 7px; z-index: 2; border: 1px solid var(--filet); background: #fff; border-radius: 12px; text-align: left; cursor: pointer; }
        .card:hover { border-color: #b7c3d8; }
        .card.on { border-color: var(--cyan-d); box-shadow: 0 0 0 3px rgba(38,212,234,.28); }
        .card.next { border-color: var(--cyan-d); }
        .card.empty { background: #fbfcfe; }
        .card.empty .n { color: #9aa6bd; }
        .ong { font-size: 9px; letter-spacing: .05em; text-transform: uppercase; color: var(--cyan-d); font-weight: 800; }
        .n { font-size: 20px; line-height: 1; color: var(--navy); letter-spacing: -.03em; }
        .lab { font-size: 12px; font-weight: 750; line-height: 1.2; }
        .sub { margin-top: 2px; font-size: 10.5px; color: var(--muted); }
        .late { color: var(--rouge); font-weight: 750; }
        .onarrow { position: absolute; z-index: 4; transform: translate(-50%, -50%); background: #fff; border: 1px solid #d5deec; border-radius: 999px; padding: 2px 7px; font-size: 11px; font-weight: 750; color: var(--navy); white-space: nowrap; pointer-events: none; line-height: 1.3; }
        .onarrow.hot { border-color: var(--cyan-d); color: var(--cyan-d); background: #f3fcfe; }
        .pop { position: fixed; display: block; width: 270px; z-index: 50; background: #fff; border: 1px solid #9eeaf4; border-radius: 16px; box-shadow: 0 16px 36px rgba(11,19,48,.16); padding: 12px 12px 10px; }
        .pop:before { content: ""; position: absolute; width: 12px; height: 12px; background: #fff; border: 1px solid #9eeaf4; transform: rotate(45deg); }
        .pop.right:before { left: -7px; top: var(--tail, 22px); border-right: 0; border-top: 0; }
        .pop.left:before { right: -7px; top: var(--tail, 22px); border-left: 0; border-bottom: 0; }
        .pop.below:before { top: -7px; left: var(--tail, 28px); border-right: 0; border-bottom: 0; }
        .pop.above:before { bottom: -7px; left: var(--tail, 28px); border-left: 0; border-top: 0; }
        .pop h3 { margin: 0; font-size: 15px; color: var(--navy); }
        .pop .top { display: flex; justify-content: space-between; gap: 8px; align-items: start; }
        .x { border: 0; background: #f3f6fb; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; color: var(--muted); font-size: 16px; line-height: 1; flex: 0 0 24px; }
        .where { margin: 4px 0 0; font-size: 12.5px; color: var(--muted); line-height: 1.4; }
        .ensuite { margin: 12px 0; padding: 10px; border-radius: 12px; background: #f4fcfe; border: 1px solid #d7f4f8; }
        .ensuite p { margin: 0 0 6px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--cyan-d); font-weight: 800; }
        .ensuite button { display: block; width: 100%; text-align: left; margin-top: 6px; cursor: pointer; border: 1px solid #d7f4f8; background: #fff; border-radius: 10px; padding: 7px 8px; color: var(--navy); font-size: 12.5px; font-weight: 700; }
        .pills { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
        .pill { font-size: 11.5px; border-radius: 999px; padding: 3px 8px; font-weight: 750; }
        .ok { background: var(--vert-bg); color: var(--vert); }
        .bad { background: var(--rouge-bg); color: var(--rouge); }
        .wait { background: var(--ambre-bg); color: var(--ambre); }
        .mute { background: #f3f6fb; color: var(--muted); }
        ul.dossiers { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; max-height: 168px; overflow: auto; }
        ul.dossiers li { border-top: 1px solid var(--filet); padding-top: 8px; }
        .ref { font-weight: 750; font-size: 13px; color: var(--navy); }
        .meta { font-size: 12px; color: var(--muted); line-height: 1.35; }
        .note { margin: 10px 12px 0; color: var(--muted); font-size: 12.5px; line-height: 1.45; }
        @media (max-width: 980px) { .stats { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 640px) { .stats { grid-template-columns: 1fr 1fr; } }
      `}</style>
      <main className="page">
        <div className="kicker"><i></i> Données réelles · workflow partagé</div>
        <h1>Avancement</h1>
        <p className="lead">Le schéma se lit de haut en bas. La mention est sur la flèche. Un clic fait sortir la bulle de la carte.</p>
        <section className="stats">
          <div className="stat"><b>{total}</b><span>Dossiers</span></div>
          <div className="stat"><b>{enCours}</b><span>En cours</span></div>
          <div className="stat"><b>{clos}</b><span>Clos</span></div>
          <div className="stat alert"><b>{retard}</b><span>En retard, parmi les en cours</span></div>
        </section>
        <section className="board">
          <h2>Schéma des constatations</h2>
          <p className="hint">Clique une carte. La bulle sort de cette carte.</p>
          <div className="canvas" id="canvas">
            <svg className="links" viewBox="0 0 820 1288">
              <defs>
                <marker id="ah" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0,0.8 L7,4 L0,7.2 Z" fill="#c5d0e0" /></marker>
                <marker id="ah-hot" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0,0.8 L7,4 L0,7.2 Z" fill="#0aa8bd" /></marker>
              </defs>
              {arrows.map((a, idx) => (
                <path key={idx} d={a.d} fill="none" stroke={hot(a.from, selectedId) ? '#0aa8bd' : '#c5d0e0'} strokeWidth={hot(a.from, selectedId) ? 2.4 : 1.6} strokeLinejoin="round" strokeLinecap="round" markerEnd={a.join ? undefined : (hot(a.from, selectedId) ? 'url(#ah-hot)' : 'url(#ah)')} data-from={a.from} />
              ))}
            </svg>
            {labels.map((lb, idx) => (
              <span key={idx} className={`onarrow ${hot(lb.from, selectedId) ? 'hot' : ''}`} style={{ left: lb.x, top: lb.y }} data-from={lb.from}>{lb.text}</span>
            ))}
            {steps.map(step => {
              const late = count(step, 'retard');
              const empty = step.dossiers.length === 0;
              const isOn = selectedId === step.id;
              const isNext = nextIds.has(step.id);
              return (
                <button key={step.id} type="button" data-id={step.id} className={`card ${empty ? 'empty' : ''} ${isOn ? 'on' : ''} ${isNext ? 'next' : ''}`} style={{ left: step.x, top: step.y }} onClick={() => setSelectedId(prev => (prev === step.id ? null : step.id))}>
                  <div className="ong">{step.onglet}</div>
                  <div className="n">{step.dossiers.length}</div>
                  <div className="lab">{step.label}</div>
                  <div className="sub">{late ? <span className="late">{late} en retard</span> : (step.dossiers.length ? `${step.dossiers.length} dossier${step.dossiers.length > 1 ? 's' : ''}` : 'Aucun')}</div>
                </button>
              );
            })}
          </div>
          <p className="note">Références réelles du workflow partagé. Sanction directe, sanction et absence du fait vont au clos, sans inspection. Seuls le licenciement et la mise à pied passent par les 48 heures, puis par le dépôt.</p>
        </section>
      </main>
      {selectedStep && (
        <div ref={popRef} className={popStyle?.cls || 'pop right'} style={popStyle ? { left: popStyle.left, top: popStyle.top, ['--tail' as any]: `${popStyle.tail}px` } : { left: -9999, top: -9999 }}>
          <div className="top">
            <div>
              <h3>{selectedStep.label}</h3>
              <p className="where">{selectedStep.dossiers.length} dossier{selectedStep.dossiers.length > 1 ? 's' : ''} · onglet {selectedStep.onglet}</p>
            </div>
            <button className="x" type="button" aria-label="Fermer" onClick={() => setSelectedId(null)}>×</button>
          </div>
          <p className="where">{selectedStep.echeance}</p>
          <div className="ensuite">
            <p>Sortie suivante</p>
            {selectedStep.next.length ? selectedStep.next.map(nx => (
              <button key={nx.id} type="button" data-go={nx.id} onClick={() => setSelectedId(nx.id)}>? {nx.label}</button>
            )) : <div className="where">Aucune sortie. Le dossier est clos.</div>}
          </div>
          {selectedStep.dossiers.length ? (
            <>
              <div className="pills">
                {count(selectedStep, 'delai') ? <span className="pill ok">{count(selectedStep, 'delai')} dans le délai</span> : null}
                {count(selectedStep, 'retard') ? <span className="pill bad">{count(selectedStep, 'retard')} en retard</span> : null}
                {count(selectedStep, 'attente') ? <span className="pill wait">{count(selectedStep, 'attente')} en attente</span> : null}
                {count(selectedStep, 'clos') ? <span className="pill mute">{count(selectedStep, 'clos')} clos</span> : null}
              </div>
              <ul className="dossiers">
                {selectedStep.dossiers.map(d => (
                  <li key={d.ref}>
                    <div className="ref">{d.ref}</div>
                    <div className="meta">{d.lob} · {d.agent} · {d.juriste}<br />{d.detail}</div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="where">Aucun dossier sur cette étape.</p>
          )}
        </div>
      )}
    </div>
  );
}
