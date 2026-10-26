'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSyncExternalStore } from 'react';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';
import { ETAPE_LABELS } from '@/lib/workflow-ui';
import { BRANCHES } from '@/lib/workflow-branch';

const PAGE_GROUPS = [
  { label: 'Constatations', etape: 'constatation_recue', codes: ['constatation_recue'] },
  { label: 'Analyse', etape: 'analyse_gravite', codes: ['analyse_gravite'] },
  { label: 'Convocations', etape: 'convocation_seance', codes: ['convocation_seance'] },
  { label: 'Séances', etape: 'seance_presente', codes: ['seance_presente', 'seance_absente', 'pv_seance'] },
  { label: 'Décisions', etape: 'decision_licenciement', codes: ['decision_licenciement', 'decision_mise_a_pied', 'decision_sanction', 'fin_procedure', 'notification_48h', 'depot_inspection_decision', 'depot_inspection_absence', 'investigations', 'sanction_faute_non_grave'] },
  { label: 'Clos', etape: 'cloture', codes: ['cloture'] },
];

function tabForStep(step: string): string {
  if (step === 'constatation_recue') return 'Constatations';
  if (step === 'analyse_gravite') return 'Analyse';
  if (step === 'convocation_seance') return 'Convocations';
  if (step === 'seance_presente' || step === 'seance_absente' || step === 'pv_seance') return 'Séances';
  if (step === 'cloture') return 'Clos';
  return 'Décisions';
}

export default function AvancementPage() {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const [ref, setRef] = useState(snap.cases[0]?.reference || '');

  const total = snap.cases.length;
  const clos = snap.cases.filter((c) => c.etape === 'cloture').length;
  const retard = snap.cases.filter((c) => c.echeance && new Date(c.echeance) < new Date()).length;
  const dansDelai = total - clos - retard;

  const groupCounts = PAGE_GROUPS.map((g) => ({
    ...g,
    count: snap.cases.filter((c) => g.codes.includes(c.etape)).length,
  }));
  const maxCount = Math.max(1, ...groupCounts.map((g) => g.count));

  const dossier = snap.cases.find((c) => c.reference === ref);
  const events = dossier ? snap.events.filter((e) => e.dossier === dossier.reference).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const passédSteps = Array.from(new Set(events.map((e) => e.etape)));
  const branch = dossier ? BRANCHES.find((b) => b.from === dossier.etape) : undefined;
  const closed = dossier?.etape === 'cloture';

  const donutStyle = {
    background: `conic-gradient(#2a8c5a 0% ${((clos / total) * 100) || 0}%, #a00 ${((clos / total) * 100) || 0}% ${(((clos + retard) / total) * 100) || 0}%, #1a3a6b ${(((clos + retard) / total) * 100) || 0}% 100%)`,
  };

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Avancement</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Statistiques et graphiques lus dans les dossiers.</p>
        </div>
        <Link href="/admin" className="btn-pill">Tableau de bord</Link>
      </header>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginTop: 16 }}>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>{total}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Dossiers</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--cyan-fonce)' }}>{total - clos}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>En cours</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#2a8c5a' }}>{clos}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Clos</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#a00' }}>{retard}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>En retard</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Volume par onglet du schéma</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {groupCounts.map((g) => (
            <Link key={g.label} href={`/admin/dossiers?etape=${g.etape}`} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 40px', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--encre)' }}>
              <span style={{ fontSize: 13 }}>{g.label}</span>
              <div style={{ background: 'var(--filet)', borderRadius: 4, height: 18, overflow: 'hidden' }}>
                <div style={{ width: `${(g.count / maxCount) * 100}%`, background: 'var(--navy)', height: '100%' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{g.count}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Répartition clos / dans le délai / en retard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ width: 140, height: 140, borderRadius: '50%', ...donutStyle }} />
          <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
            <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#2a8c5a', marginRight: 6 }} />Clos : {clos}</div>
            <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#1a3a6b', marginRight: 6 }} />Dans le délai : {dansDelai}</div>
            <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#a00', marginRight: 6 }} />En retard : {retard}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Process d un dossier</h2>
        <select value={ref} onChange={(e) => setRef(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--filet)', borderRadius: 6, marginBottom: 12 }}>
          {snap.cases.map((c) => <option key={c.reference} value={c.reference}>{c.reference}</option>)}
        </select>
        {dossier && (
          <ol style={{ paddingLeft: 20, display: 'grid', gap: 6, fontSize: 13 }}>
            {passédSteps.map((s) => (
              <li key={s} style={{ color: 'var(--texte-secondaire)' }}>{ETAPE_LABELS[s] || s} - passé</li>
            ))}
            <li style={{ fontWeight: 700, color: 'var(--encre)' }}>
              {ETAPE_LABELS[dossier.etape] || dossier.etape} - etape actuelle ({tabForStep(dossier.etape)})
            </li>
            {!closed && branch && branch.steps.map((s) => (
              <li key={s.code} style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic' }}>Suivant possible : {s.label}</li>
            ))}
            {closed && <li style={{ color: 'var(--texte-secondaire)' }}>Dossier clos - aucune branche ouverte.</li>}
          </ol>
        )}
      </div>
    </div>
  );
}
