'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useSyncExternalStore, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getWorkflowState, subscribeWorkflow, transitionCase, markAsRead } from '@/lib/workflow-store';
import { BRANCHES } from '@/lib/workflow-branch';
import { ETAPE_LABELS } from '@/lib/workflow-ui';
import { formatDateFr } from '@/lib/format';
import { PEOPLE } from '@/lib/presence-demo';

function tabForStep(step: string): string {
  if (step === 'constatation_recue') return 'Constatations';
  if (step === 'analyse_gravite') return 'Analyse';
  if (step === 'convocation_seance') return 'Convocations';
  if (step === 'seance_presente' || step === 'seance_absente' || step === 'pv_seance') return 'Séances';
  if (step === 'cloture') return 'Clos';
  return 'Décisions';
}

function agentLabel(id?: string | null) {
  if (!id) return '—';
  const p = PEOPLE.find((x) => x.id === id);
  return p ? p.nom : id;
}

export default function AdminDossierDetailPage() {
  const params = useParams();
  const reference = params?.reference as string;
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const dossier = snap.cases.find((c) => c.reference === reference);
  // Le store lit localStorage : on rend la fiche après le montage pour coller au HTML serveur.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Après hydratation seulement : marquer lu avant ferait diverger le HTML du shell.
    if (!mounted) return;
    if (dossier) {
      // Les dossiers clos ne sont pas marqués comme lus : la notification persiste
      // pour indiquer le nombre de dossiers non-consultés dans cet onglet.
      if (dossier.etape !== 'cloture') {
        // Tâche séparée : la mutation du store ne doit pas tomber pendant l'hydratation.
        const id = window.setTimeout(() => markAsRead(reference), 0);
        return () => window.clearTimeout(id);
      }
    }
  }, [mounted, dossier?.reference]);

  if (!mounted) {
    return (
      <div className="g-page" aria-busy="true">
        <header className="g-page-head">
          <div>
            <div className="g-kicker"><i /> Fiche dossier</div>
            <h1>Dossier {reference}</h1>
            <p>Chargement de la fiche…</p>
          </div>
        </header>
      </div>
    );
  }

  if (!dossier) {
    notFound();
  }

  const branch = BRANCHES.find((b) => b.from === dossier.etape);
  const closed = dossier.etape === 'cloture';
  const events = snap.events
    .filter((e) => e.dossier === dossier.reference)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const passedSteps = Array.from(new Set(events.map((e) => e.etape)));

  return (
    <>
      <header className="g-page-head g-rise" style={{ ['--d' as string]: '.02s' }}>
        <div>
          <div className="g-kicker"><i /> Espace Juridique · Fiche dossier</div>
          <h1>Dossier {dossier.reference}</h1>
          <p>{`Étape actuelle : ${ETAPE_LABELS[dossier.etape] || dossier.etape} · Onglet : ${tabForStep(dossier.etape)}. Un dossier ne propose que sa branche permise.`}</p>
        </div>
        <div className="g-tools">
          <Link href="/admin/dossiers" className="g-btn g-btn--ghost g-btn--sm">Retour aux dossiers</Link>
        </div>
      </header>

      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.05s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">Repères du dossier</h3>
            <p className="g-card-sub">{`Référence ${dossier.reference} · Agent ${agentLabel(dossier.agentId)} · Activité ${dossier.affectationFixe?.lob || '—'} / ${dossier.affectationFixe?.department || '—'}`}</p>
          </div>
          <span className="g-badge is-info" suppressHydrationWarning>{ETAPE_LABELS[dossier.etape] || dossier.etape}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="g-badge is-ok" suppressHydrationWarning><i className="g-dot" />{dossier.statut}</span>
          {dossier.echeance && (
            <span className="g-badge is-warn" suppressHydrationWarning><i className="g-dot" />Échéance {formatDateFr(dossier.echeance)}</span>
          )}
          <span className="g-badge"><i className="g-dot" />Onglet {tabForStep(dossier.etape)}</span>
        </div>
      </section>

      <section className="g-grid-2 g-rise" style={{ ['--d' as string]: '.08s' }}>
        <article className="g-card g-glass">
          <div className="g-card-head">
            <div>
              <h3 className="g-card-title">Process de ce dossier</h3>
              <p className="g-card-sub">Les étapes passées, l&rsquo;étape courante, puis les suites permises.</p>
            </div>
          </div>
          <ul className="g-list">
            {passedSteps.map((s) => (
              <li key={s}>
                <div className="g-list-item" style={{ cursor: 'default' }}>
                  <span className="g-list-main">
                    <b>{ETAPE_LABELS[s] || s}</b>
                    <span>Passé</span>
                  </span>
                  <span className="g-list-side"><span className="g-badge"><i className="g-dot" />Fait</span></span>
                </div>
              </li>
            ))}
            <li>
              <div className="g-list-item" style={{ cursor: 'default', borderColor: 'rgba(37,99,235,.35)', background: 'rgba(37,99,235,.08)' }}>
                <span className="g-list-main">
                  <b>{ETAPE_LABELS[dossier.etape] || dossier.etape}</b>
                  <span>Étape actuelle · onglet {tabForStep(dossier.etape)}</span>
                </span>
                <span className="g-list-side"><span className="g-badge is-info"><i className="g-dot" />Ici</span></span>
              </div>
            </li>
            {!closed && branch && branch.steps.map((s) => (
              <li key={s.code}>
                <div className="g-list-item" style={{ cursor: 'default' }}>
                  <span className="g-list-main">
                    <b>Suivant possible · {s.label}</b>
                    <span>{ETAPE_LABELS[s.code] || s.code}</span>
                  </span>
                  <span className="g-list-side">→</span>
                </div>
              </li>
            ))}
            {closed && (
              <li>
                <div className="g-list-item" style={{ cursor: 'default' }}>
                  <span className="g-list-main"><b>Dossier clos</b><span>Aucune branche ouverte.</span></span>
                </div>
              </li>
            )}
          </ul>
        </article>

        <article className="g-card g-glass">
          <div className="g-card-head">
            <div>
              <h3 className="g-card-title">Branche autorisée</h3>
              <p className="g-card-sub">Un clic note la transition. Aucune lettre n&rsquo;est produite.</p>
            </div>
          </div>
          {closed ? (
            <p className="g-empty">Dossier clos — aucun bouton.</p>
          ) : branch ? (
            <ul className="g-list">
              {branch.steps.map((s) => (
                <li key={s.code}>
                  <button
                    type="button"
                    className="g-list-item"
                    onClick={() => transitionCase(dossier.reference, s.code, s.label, 'Fiche')}
                  >
                    <span className="g-list-main">
                      <b>{s.label}</b>
                      <span>{ETAPE_LABELS[s.code] || s.code}</span>
                    </span>
                    <span className="g-list-side">→</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="g-empty">Cette étape n&rsquo;ouvre pas de branche.</p>
          )}
          <div className="g-card-foot">
            <span>L&rsquo;outil ne juge pas, ne rédige pas, n&rsquo;envoie pas</span>
            <span className="g-tag">{branch?.steps.length || 0} issue{branch && branch.steps.length > 1 ? 's' : ''}</span>
          </div>
        </article>
      </section>

      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.11s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">Trace des passages</h3>
            <p className="g-card-sub">Chaque mouvement est horodaté avec son auteur.</p>
          </div>
          <span className="g-tag">{events.length} passage{events.length > 1 ? 's' : ''}</span>
        </div>
        {events.length === 0 ? (
          <p className="g-empty">Aucun passage enregistré.</p>
        ) : (
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Étape</th>
                  <th>Auteur</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td><b>{e.action}</b></td>
                    <td>{ETAPE_LABELS[e.etape] || e.etape}</td>
                    <td>{e.auteur}</td>
                    <td className="g-mono" suppressHydrationWarning>{new Date(e.date).toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="g-foot">
        <span>ACX Flow · Fiche dossier</span>
        <span className="g-tag">Glassy V22</span>
      </footer>
    </>
  );
}
