import Link from 'next/link';
import { DEMO_POINTAGE_PERSONNES } from '@/lib/demo-people';
import { createDemoTodayPointage } from '@/lib/demo-pointage';

const DEMO_CASES = [
  { ref: 'DEMO-2026-0001', etape: 'constatation_recue', statut: 'En cours', reception: true },
  { ref: 'DEMO-2026-0002', etape: 'constatation_recue', statut: 'En cours', reception: true },
  { ref: 'DEMO-2026-0003', etape: 'constatation_recue', statut: 'En cours', reception: true },
  { ref: 'DEMO-2026-0004', etape: 'analyse_gravite', statut: 'En cours', reception: true },
  { ref: 'DEMO-2026-0005', etape: 'analyse_gravite', statut: 'En cours', reception: true },
  { ref: 'DEMO-2026-0006', etape: 'convocation_seance', statut: 'En attente', reception: true },
];

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
  { code: 'constatation_recue', label: 'Réception' },
  { code: 'analyse_gravite', label: 'Analyse' },
  { code: 'convocation_seance', label: 'Convocations' },
  { code: 'seance_presente', label: 'Séances' },
  { code: 'decision_licenciement', label: 'Décisions' },
  { code: 'decision_mise_a_pied', label: 'Décisions' },
  { code: 'decision_sanction', label: 'Décisions' },
  { code: 'cloture', label: 'Clos' },
];

export default function AssistantDashboardPage() {
  const cas = DEMO_CASES;

  const casParEtape = new Map<string, typeof cas>();
  for (const c of cas) {
    if (!casParEtape.has(c.etape)) casParEtape.set(c.etape, []);
    casParEtape.get(c.etape)!.push(c);
  }

  const dossiersEnReception = cas.filter(c => c.etape === 'constatation_recue').length;

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Tableau de bord</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Vue d&rsquo;ensemble de la réception de démonstration.</p>
        </div>
        <Link href="/assistant/reception" className="btn-pill">RÉCEPTION</Link>
      </header>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>{dossiersEnReception}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>À réceptionner</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--cyan-fonce)' }}>{DEMO_POINTAGE_PERSONNES.length}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Places d&rsquo;assistant</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Réception en cours</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {TITRES_ETAPES.filter(t => casParEtape.has(t.code))
            .map((t) => (
              <Link key={t.code} href={`/assistant/reception`} className="btn-pill" style={{ justifyContent: 'space-between', fontWeight: 600 }}>
                <span>{t.label}</span>
                <span style={{ backgroundColor: 'var(--navy)', color: 'var(--blanc)', borderRadius: '999px', padding: '1px 10px', fontWeight: 700 }}>
                  {casParEtape.get(t.code)!.length}
                </span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
