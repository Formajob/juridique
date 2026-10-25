// Recherche admin : fiche agent et parcours de dossiers (sans motif).

import Link from 'next/link';
import { DEMO_PEOPLE } from '@/lib/demo-people';
import { createDemoDashboardData } from '@/lib/demo-dashboard';

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

const TITRES_ETAPES = [
  { code: 'constatation_recue', label: 'Constatations' },
  { code: 'analyse_gravite', label: 'Analyse' },
  { code: 'convocation_seance', label: 'Convocations' },
  { code: 'seance_presente', label: 'Séances' },
  { code: 'decision_licenciement', label: 'Décisions' },
  { code: 'decision_mise_a_pied', label: 'Décisions' },
  { code: 'decision_sanction', label: 'Décisions' },
  { code: 'cloture', label: 'Clos' },
];

export default function AdminSearchPage() {
  const cas = createDemoDashboardData();

  // Fiches agents
  const agents = DEMO_PEOPLE.map((p) => ({
    ...p,
    dossiers: cas.filter((c) => c.agentId === p.id),
  }));

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Recherche</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Fiches agent et parcours de dossiers (sans motif).</p>
        </div>
      </header>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 16 }}>Agents</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {agents.map((agent) => (
            <div key={agent.id} className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 600, color: 'var(--encre)', marginBottom: 8 }}>{agent.nom}</div>
              <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>
                {DEMO_PEOPLE.find(p => p.identifiant === agent.identifiant)?.role || agent.role}
              </div>
              <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>
                {agent.dossiers.length} dossier{agent.dossiers.length > 1 ? 's' : ''}
              </div>
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {agent.dossiers.map((d) => (
                  <Link
                    key={d.reference}
                    href={`/admin/dossiers/${d.reference}`}
                    className="btn-pill"
                    style={{ fontSize: 12, fontWeight: 500, padding: '4px 10px' }}
                  >
                    {d.reference} · {ETAPE_LABELS[d.etape] || d.etape}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
