'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSyncExternalStore } from 'react';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';
import { ETAPE_LABELS } from '@/lib/workflow-ui';
import { BRANCHES } from '@/lib/workflow-branch';
import { createDemoTodayPointage } from '@/lib/demo-pointage';
import { formatDateFr } from '@/lib/format';

const SCHEMA_STEPS: { label: string; etape: string | null; codes: string[] }[] = [
  { label: 'Constatations', etape: 'constatation_recue', codes: ['constatation_recue'] },
  { label: 'Analyse', etape: 'analyse_gravite', codes: ['analyse_gravite'] },
  { label: 'Convocations', etape: 'convocation_seance', codes: ['convocation_seance'] },
  { label: 'Séances', etape: 'seance_presente', codes: ['seance_presente', 'seance_absente', 'pv_seance'] },
  { label: 'Décisions', etape: 'decision_licenciement', codes: ['decision_licenciement', 'decision_mise_a_pied', 'decision_sanction', 'fin_procedure', 'notification_48h', 'depot_inspection_decision', 'depot_inspection_absence', 'investigations', 'sanction_faute_non_grave'] },
  { label: 'Échéances', etape: null, codes: [] },
  { label: 'Clos', etape: 'cloture', codes: ['cloture'] },
];

function typeEcheance(etape: string): string {
  if (etape === 'constatation_recue') return '8 jours après réception';
  if (etape === 'convocation_seance') return '8 jours après convocation';
  if (etape === 'decision_licenciement' || etape === 'decision_mise_a_pied') return '48 heures';
  return 'Échéance';
}

export default function AdminDashboardPage() {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const cas = snap.cases;

  const total = cas.length;
  const clos = cas.filter((c) => c.etape === 'cloture').length;
  const enCours = total - clos;
  const recus = cas.filter((c) => c.etape === 'constatation_recue').length;
  const enRetard = cas.filter((c) => c.etape !== 'cloture' && !!c.echeance && new Date(c.echeance) < new Date()).length;

  const stepCounts = SCHEMA_STEPS.map((s) => ({
    ...s,
    count: s.label === 'Échéances'
      ? cas.filter((c) => !!c.echeance).length
      : cas.filter((c) => s.codes.includes(c.etape)).length,
  }));

  const limit = Date.now() + 24 * 3600000;
  const echeancesJour = cas
    .filter((c) => !!c.echeance && new Date(c.echeance).getTime() <= limit)
    .sort((a, b) => new Date(a.echeance!).getTime() - new Date(b.echeance!).getTime());

  const [ref, setRef] = useState(cas[0]?.reference || '');
  const dossier = cas.find((c) => c.reference === ref);
  const events = dossier ? snap.events.filter((e) => e.dossier === dossier.reference).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const passedSteps = Array.from(new Set(events.map((e) => e.etape)));
  const branch = dossier ? BRANCHES.find((b) => b.from === dossier.etape) : undefined;
  const closed = dossier?.etape === 'cloture';

  const maxStepCount = Math.max(1, ...stepCounts.map((s) => s.count));
  const dansDelai = total - clos - enRetard;
  const donutStyle = {
    background: `conic-gradient(#2a8c5a 0% ${((clos / total) * 100) || 0}%, #a00 ${((clos / total) * 100) || 0}% ${(((clos + enRetard) / total) * 100) || 0}%, #1a3a6b ${(((clos + enRetard) / total) * 100) || 0}% 100%)`,
  };
  const now = Date.now();
  const criticalDossiers = cas
    .filter((c) => !!c.echeance && c.etape !== 'cloture')
    .map((c) => ({ ...c, diff: new Date(c.echeance!).getTime() - now }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 8);
  const shifts = createDemoTodayPointage();
  const bureauNames = ['Juriste 1', 'Juriste 2', 'Assistant 1', 'Assistant 2', 'Assistant 3'];
  const bureau = bureauNames.map((name) => shifts.find((s) => s.utilisateur?.nom === name) || { utilisateur: { nom: name, role: 'bureau' }, statut: 'inconnu' });

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Tableau de bord</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Vue d’ensemble du traitement des dossiers.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/dossiers" className="btn-pill">Voir tous les dossiers</Link>
          <Link href="/admin/avancement" className="btn-pill">Avancement</Link>
        </div>
      </header>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginTop: 16 }}>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>{recus}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Dossiers reçus</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--cyan-fonce)' }}>{enCours}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>En cours</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#a00' }}>{enRetard}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>En retard</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--violet)' }}>{clos}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Clos</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Répartition par étape</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {stepCounts.map((s) => (
            <Link
              key={s.label}
              href={s.label === 'Échéances' ? '/admin/dossiers' : `/admin/dossiers?etape=${s.etape}`}
              className="btn-pill"
              style={{ justifyContent: 'space-between', fontWeight: 600 }}
            >
              <span>{s.label}</span>
              <span style={{ backgroundColor: 'var(--navy)', color: 'var(--blanc)', borderRadius: '999px', padding: '1px 10px', fontWeight: 700 }}>
                {s.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Graphiques lus dans les dossiers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--encre)', marginBottom: 8 }}>Volume par étape</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {stepCounts.map((s) => (
                <div key={s.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 36px', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>{s.label}</span>
                  <div style={{ background: 'var(--filet)', borderRadius: 4, height: 16, overflow: 'hidden' }}>
                    <div style={{ width: `${(s.count / maxStepCount) * 100}%`, background: 'var(--navy)', height: '100%' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--encre)', marginBottom: 8 }}>Statut des dossiers</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', ...donutStyle }} />
              <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#2a8c5a', marginRight: 6 }} />Clos : {clos}</div>
                <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#1a3a6b', marginRight: 6 }} />Dans le délai : {dansDelai}</div>
                <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#a00', marginRight: 6 }} />En retard : {enRetard}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Alertes critiques</h2>
        {criticalDossiers.length === 0 ? (
          <div style={{ padding: '20px', color: 'var(--texte-secondaire)', textAlign: 'center' }}>Aucune alerte critique.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {criticalDossiers.map((c: any) => {
              const overdue = c.diff < 0;
              const soon = c.diff >= 0 && c.diff <= 2 * 24 * 3600000;
              const color = overdue ? '#a00' : soon ? '#b45309' : 'var(--navy)';
              return (
                <Link key={c.reference} href={`/admin/dossiers/${c.reference}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, textDecoration: 'none', color: 'var(--encre)', padding: '8px 10px', borderLeft: `4px solid ${color}`, background: 'var(--fond-carte, #f9fafb)' }}>
                  <span style={{ fontWeight: 600 }}>{c.reference}</span>
                  <span style={{ fontSize: 12, color }}>{overdue ? 'En retard' : soon ? 'Échéance proche' : 'Dans le délai'} — {c.echeance ? new Date(c.echeance).toLocaleDateString('fr-FR') : ''}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>


      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Échéances du jour</h2>
        {echeancesJour.length === 0 ? (
          <div style={{ padding: '20px', color: 'var(--texte-secondaire)', textAlign: 'center' }}>Aucune échéance prévue aujourd’hui.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {echeancesJour.map((c) => (
              <div key={c.reference} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--encre)' }}>{c.reference}</div>
                  <span style={{ fontSize: 11, color: 'var(--texte-secondaire)' }}>{typeEcheance(c.etape)}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Étape : {ETAPE_LABELS[c.etape] || c.etape}</div>
                <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Échéance : {c.echeance ? formatDateFr(c.echeance) : '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Process d’un dossier</h2>
        <select value={ref} onChange={(e) => setRef(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--filet)', borderRadius: 6, marginBottom: 12 }}>
          {cas.map((c) => <option key={c.reference} value={c.reference}>{c.reference}</option>)}
        </select>
        {dossier && (
          <ol style={{ paddingLeft: 20, display: 'grid', gap: 6, fontSize: 13 }}>
            {passedSteps.map((s) => (
              <li key={s} style={{ color: 'var(--texte-secondaire)' }}>{ETAPE_LABELS[s] || s} — passé</li>
            ))}
            <li style={{ fontWeight: 700, color: 'var(--encre)' }}>
              {ETAPE_LABELS[dossier.etape] || dossier.etape} — étape actuelle
            </li>
            {!closed && branch && branch.steps.map((s) => (
              <li key={s.code} style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic' }}>Branche suivante possible : {s.label}</li>
            ))}
            {closed && <li style={{ color: 'var(--texte-secondaire)' }}>Dossier clos — aucune branche ouverte.</li>}
          </ol>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Présence du bureau</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {bureau.map((s: any) => (
            <div key={s.utilisateur?.nom} className="card" style={{ padding: '12px 16px', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, color: 'var(--encre)', fontSize: 14 }}>{s.utilisateur?.nom}</div>
              <div style={{ fontSize: 11, color: 'var(--texte-secondaire)', marginTop: 4 }}>{s.statut || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}