import Link from 'next/link';
import { createDemoDashboardData } from '@/lib/demo-dashboard';

const ETAPE_ORDER = [
  'constatation_recue',
  'analyse_gravite',
  'sanction_faute_non_grave',
  'convocation_seance',
  'seance_presente',
  'seance_absente',
  'depot_inspection_absence',
  'investigations',
  'decision_licenciement',
  'decision_mise_a_pied',
  'decision_sanction',
  'fin_procedure',
  'cloture',
] as const;

const ETAPE_LABEL: Record<string, string> = {
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

export default function AdminDossiersPage() {
  const cas = createDemoDashboardData();

  // Grouper par étape, en conservant l'ordre
  const groupe = new Map<string, typeof cas>();
  for (const c of cas) {
    if (!groupe.has(c.etape)) groupe.set(c.etape, []);
    groupe.get(c.etape)!.push(c);
  }

  const etapesOrdonnees = ETAPE_ORDER.filter(code => groupe.has(code));

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Dossiers</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Dossiers de démonstration par étape.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 20 }}>
        {etapesOrdonnees.map((etape) => {
          const items = groupe.get(etape)!;
          const etapeLabel = ETAPE_LABEL[etape] || etape;
          const nextSteps = (ETAPE_ORDER as readonly string[]).filter(s => s > etape && groupe.has(s));
          const hasNext = nextSteps.length > 0;
          const nextLabel = hasNext ? nextSteps.join(', ') : 'Accès fermé';

          return (
            <div key={etape} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)' }}>
                  <span className={`badge badge-${etape.replace(/_/g, '_')}`} style={{ marginRight: 8 }}>{etapeLabel}</span>
                  <span style={{ fontSize: 12, color: 'var(--texte-secondaire)', fontWeight: 400 }}>({items.length})</span>
                </h2>
                <span className="badge badge-navy">{items.length} dossier{items.length > 1 ? 's' : ''}</span>
              </div>
              <ul className="list" style={{ paddingLeft: 0 }}>
                {items.map((c) => (
                  <li key={c.reference}>
                    <Link
                      href={`/admin/dossiers/${c.reference}`}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--filet)', textDecoration: 'none', color: 'var(--encre)' }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.reference}</div>
                        <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>{ETAPE_LABEL[c.etape] || c.etape} · {c.statut}</div>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>→ {nextLabel}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
