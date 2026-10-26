'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';
import { getWorkflowState, subscribeWorkflow, transitionCase } from '@/lib/workflow-store';
import { BRANCHES } from '@/lib/workflow-branch';
import { ETAPE_LABELS } from '@/lib/workflow-ui';
import { formatDateFr } from '@/lib/format';

function tabForStep(step: string): string {
  if (step === 'constatation_recue') return 'Constatations';
  if (step === 'analyse_gravite') return 'Analyse';
  if (step === 'convocation_seance') return 'Convocations';
  if (step === 'seance_presente' || step === 'seance_absente' || step === 'pv_seance') return 'Séances';
  if (step === 'cloture') return 'Clos';
  return 'Décisions';
}

export default function JuristeDossierDetailPage() {
  const params = useParams();
  const reference = params?.reference as string;
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const dossier = snap.cases.find((c) => c.reference === reference);

  if (!dossier) {
    notFound();
  }

  const branch = BRANCHES.find((b) => b.from === dossier.etape);
  const closed = dossier.etape === 'cloture';
  const events = snap.events.filter((e) => e.dossier === dossier.reference).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const passedSteps = Array.from(new Set(events.map((e) => e.etape)));

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Dossier {dossier.reference}</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>
            Étape actuelle : {ETAPE_LABELS[dossier.etape] || dossier.etape} · Onglet : {tabForStep(dossier.etape)}
          </p>
        </div>
        <Link href="/juriste/dossiers" className="btn-pill">Retour</Link>
      </header>

      <div style={{ display: 'grid', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className={`badge badge-etape badge-${dossier.etape}`}>{ETAPE_LABELS[dossier.etape] || dossier.etape}</span>
              <span className="badge badge-navy">{dossier.statut}</span>
              {dossier.echeance && (
                <span className="badge badge-echeance">Échéance {formatDateFr(dossier.echeance)}</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>
              Référence : <span className="code">{dossier.reference}</span> · Identifiant agent : {dossier.agentId} · Activité : {dossier.affectationFixe?.lob} / {dossier.affectationFixe?.department}
            </p>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Process de ce dossier</h2>
          <ol style={{ paddingLeft: 20, display: 'grid', gap: 6, fontSize: 13 }}>
            {passedSteps.map((s) => (
              <li key={s} style={{ color: 'var(--texte-secondaire)' }}>
                {ETAPE_LABELS[s] || s} — passé
              </li>
            ))}
            <li style={{ fontWeight: 700, color: 'var(--encre)' }}>
              {ETAPE_LABELS[dossier.etape] || dossier.etape} — étape actuelle ({tabForStep(dossier.etape)})
            </li>
            {!closed && branch && branch.steps.map((s) => (
              <li key={s.code} style={{ color: 'var(--texte-secondaire)', fontStyle: 'italic' }}>
                Suivant possible : {s.label}
              </li>
            ))}
            {closed && <li style={{ color: 'var(--texte-secondaire)' }}>Dossier clos — aucune branche ouverte.</li>}
          </ol>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Branche autorisée</h2>
          {closed ? (
            <div style={{ padding: '20px', color: 'var(--texte-secondaire)', textAlign: 'center' }}>Dossier clos — aucun bouton.</div>
          ) : branch ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {branch.steps.map((s) => (
                <button
                  key={s.code}
                  className="btn-pill"
                  style={{ justifyContent: 'space-between', fontWeight: 600 }}
                  onClick={() => transitionCase(dossier.reference, s.code, s.label, 'Fiche')}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>{ETAPE_LABELS[s.code] || s.code}</div>
                  </div>
                  <span>→</span>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', color: 'var(--texte-secondaire)', textAlign: 'center' }}>
              Cette étape n’ouvre pas de branche.
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Trace des passages</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {events.map((e) => (
              <div key={e.id} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--encre)' }}>{e.action}</div>
                <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>
                  {ETAPE_LABELS[e.etape] || e.etape} · {new Date(e.date).toLocaleString('fr-FR')} · {e.auteur}
                </div>
              </div>
            ))}
            {events.length === 0 && <div style={{ color: 'var(--texte-secondaire)' }}>Aucun passage.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
