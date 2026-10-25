'use client';

import Link from 'next/link';
import { createDemoTodayPointage } from '@/lib/demo-pointage';

const DEMO_CASES = [
  { reference: 'DEMO-2026-0004', etape: 'analyse_gravite', statut: 'En cours' },
  { reference: 'DEMO-2026-0005', etape: 'analyse_gravite', statut: 'En cours' },
  { reference: 'DEMO-2026-0006', etape: 'convocation_seance', statut: 'En attente' },
  { reference: 'DEMO-2026-0007', etape: 'convocation_seance', statut: 'En attente' },
  { reference: 'DEMO-2026-0008', etape: 'seance_presente', statut: 'Terminé' },
  { reference: 'DEMO-2026-0009', etape: 'seance_presente', statut: 'Terminé' },
  { reference: 'DEMO-2026-0010', etape: 'seance_absente', statut: 'En attente' },
  { reference: 'DEMO-2026-0011', etape: 'depot_inspection_absence', statut: 'En cours' },
  { reference: 'DEMO-2026-0012', etape: 'investigations', statut: 'En cours' },
];

const ETAPE_LABELS: Record<string, string> = {
  analyse_gravite: 'Analyse gravite',
  convocation_seance: 'Convocation seance',
  seance_presente: 'Seance presente',
  seance_absente: 'Seance absente',
  depot_inspection_absence: 'Depot inspection absence',
  investigations: 'Investigations',
  decision_licenciement: 'Decision licenciement',
  decision_mise_a_pied: 'Decision mise a pied',
  decision_sanction: 'Decision sanction',
  cloture: 'Cloture',
};

const TITRES_ETAPES = [
  { code: 'analyse_gravite', label: 'Analyse' },
  { code: 'convocation_seance', label: 'Convocations' },
  { code: 'seance_presente', label: 'Séances' },
  { code: 'seance_absente', label: 'Séances' },
  { code: 'depot_inspection_absence', label: 'Dépôt' },
  { code: 'investigations', label: 'Investigations' },
  { code: 'decision_licenciement', label: 'Décisions' },
  { code: 'decision_mise_a_pied', label: 'Décisions' },
  { code: 'decision_sanction', label: 'Décisions' },
  { code: 'cloture', label: 'Clos' },
];

export default function JuristeDashboardPage() {
  const cas = DEMO_CASES;

  const casParEtape: Record<string, typeof cas> = {};
  for (const c of cas) {
    if (!casParEtape[c.etape]) casParEtape[c.etape] = [];
    casParEtape[c.etape].push(c);
  }

  const dossiersRecus = cas.filter(c => c.etape === 'constatation_recue').length;
  const dossiersEnCours = cas.filter(c => !['cloture', 'fin_procedure', 'decision_licenciement', 'decision_mise_a_pied', 'decision_sanction'].includes(c.etape)).length;

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Tableau de bord</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Vue d&rsquo;ensemble des dossiers de démonstration.</p>
        </div>
        <Link href="/juriste/dossiers" className="btn-pill">Voir tous les dossiers</Link>
      </header>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>{dossiersRecus}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Dossiers reçus</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--cyan-fonce)' }}>{dossiersEnCours}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>En cours</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--violet)' }}>5</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Places de pointeurs</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Répartition par étape</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {TITRES_ETAPES.filter(t => casParEtape[t.code])
            .map((t) => (
              <Link key={t.code} href={`/juriste/dossiers?etape=${t.code}`} className="btn-pill" style={{ justifyContent: 'space-between', fontWeight: 600 }}>
                <span>{t.label}</span>
                <span style={{ backgroundColor: 'var(--navy)', color: 'var(--blanc)', borderRadius: '999px', padding: '1px 10px', fontWeight: 700 }}>
                  {casParEtape[t.code].length}
                </span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
