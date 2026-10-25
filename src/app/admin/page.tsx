import Link from 'next/link';
import { createDemoDashboardData } from '@/lib/demo-dashboard';
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

export default function AdminDashboardPage() {
  const cas = createDemoDashboardData();

  const dossiersRecus = cas.filter(c => c.etape === 'constatation_recue').length;
  const dossiersEnCours = cas.filter(c =>
    c.etape !== 'cloture' && c.etape !== 'fin_procedure' &&
    c.etape !== 'selon' && !['seance_presente','seance_absente','depot_inspection_absence','convocation_seance','decision_licenciement','decision_mise_a_pied','decision_sanction','pv_seance'].includes(c.etape)
  ).length;
  const dossiersEnRetard = cas.filter(c =>
    c.echeance && new Date(c.echeance) < new Date()
  ).length;

  const casParEtape: Record<string, typeof cas> = {};
  for (const c of cas) {
    if (!casParEtape[c.etape]) casParEtape[c.etape] = [];
    casParEtape[c.etape].push(c);
  }

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Tableau de bord</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Vue d&rsquo;ensemble des dossiers de démonstration.</p>
        </div>
        <Link href="/admin/dossiers" className="btn-pill">Voir tous les dossiers</Link>
      </header>

      {/* Statistiques */}
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
          <div style={{ fontSize: 28, fontWeight: 700, color: '#8a5a00' }}>{dossiersEnRetard}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>En retard</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--violet)' }}>5</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Places de pointeurs</div>
        </div>
      </div>

      {/* Répartition par étape */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Répartition par étape</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {TITRES_ETAPES.filter(t => casParEtape[t.code])
            .map((t) => (
              <Link key={t.code} href={`/admin/dossiers?etape=${t.code}`} className="btn-pill" style={{ justifyContent: 'space-between', fontWeight: 600 }}>
                <span>{t.label}</span>
                <span style={{ backgroundColor: 'var(--navy)', color: 'var(--blanc)', borderRadius: '999px', padding: '1px 10px', fontWeight: 700 }}>
                  {casParEtape[t.code].length}
                </span>
              </Link>
            ))}
        </div>
      </div>

      {/* Échéances du jour */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Échéances du jour</h2>
        {cas.filter(c => c.echeance && new Date(c.echeance).getTime() <= Date.now() + 24 * 3600000).length === 0 ? (
          <div style={{ padding: '20px', color: 'var(--texte-secondaire)', textAlign: 'center' }}>Aucune échéance prévue aujourd&rsquo;hui.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {cas.filter(c => c.echeance && new Date(c.echeance).getTime() <= Date.now() + 24 * 3600000)
              .map((c) => (
                <div key={c.reference} className="card" style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--encre)' }}>{c.reference}</div>
                  <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Étape : {ETAPE_LABELS[c.etape] || c.etape}</div>
                  <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Échéance : {c.echeance ? formatDateFr(c.echeance) : '—'}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
