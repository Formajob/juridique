import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createDemoDashboardData } from '@/lib/demo-dashboard';
import { BRANCHES } from '@/lib/workflow-branch';
import { formatDateFr } from '@/lib/format';

const ETAPE_LABELS: Record<string, string> = {
  constatation_recue: 'Constatation recue',
  analyse_gravite: 'Analyse gravite',
  sanction_faute_non_grave: 'Sanction faute non grave',
  convocation_seance: 'Convocation seance',
  seance_presente: 'Seance presente',
  seance_absente: 'Seance absente',
  depot_inspection_absence: 'Depot inspection absence',
  investigations: 'Investigations',
  decision_licenciement: 'Decision licenciement',
  decision_mise_a_pied: 'Decision mise a pied',
  decision_sanction: 'Decision sanction',
  fin_procedure: 'Fin de procedure',
  cloture: 'Cloture',
};

interface PageProps {
  params: { reference: string };
}

export default function AdminDossierDetailPage({ params }: PageProps) {
  const cas = createDemoDashboardData();
  const dossier = cas.find((c) => c.reference === params.reference);

  if (!dossier) {
    notFound();
  }

  const branch = BRANCHES.find((b) => b.from === dossier.etape);

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Dossier {dossier.reference}</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>
            Étape actuelle : {ETAPE_LABELS[dossier.etape] || dossier.etape} · Statut : {dossier.statut}
          </p>
        </div>
        <Link href="/admin/dossiers" className="btn-pill">Retour</Link>
      </header>

      <div style={{ display: 'grid', gap: 16 }}>
        {/* Étape courante */}
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
              Référence : <span className="code">{dossier.reference}</span> · Réception : {dossier.reception ? 'Oui' : 'Non'} · Créé par : {dossier.creePar}
            </p>
          </div>
        </div>

        {/* Branche autorisée */}
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>
            Branche autorisée — étape courante :
            <span style={{ marginLeft: 8, textTransform: 'capitalize' }}>{ETAPE_LABELS[dossier.etape] || dossier.etape}</span>
          </h2>
          {branch ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {branch.steps.map((s) => {
                const allowed = branch.transitions.includes(s.code);
                return (
                  <Link
                    key={s.code}
                    href={`/admin/dossiers/${dossier.reference}`}
                    className="btn-pill"
                    style={{
                      justifyContent: 'space-between',
                      fontWeight: 600,
                      opacity: allowed ? 1 : 0.5,
                      cursor: allowed ? 'pointer' : 'not-allowed',
                    }}
                    onClick={(e) => { if (!allowed) e.preventDefault(); }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>{ETAPE_LABELS[s.code] || s.code}</div>
                    </div>
                    <span style={{ opacity: allowed ? 1 : 0.4 }}>→</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '20px', color: 'var(--texte-secondaire)', textAlign: 'center' }}>
              Cette étape n&rsquo;ouvre pas de branche vers une autre étape.
            </div>
          )}
        </div>

        {/* Événements */}
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Événements ({dossier.reference})</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {cas.map((c) => (
              <div key={c.reference} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--encre)' }}>{c.reference}</div>
                <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>
                  {ETAPE_LABELS[c.etape] || c.etape} · {c.statut}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
