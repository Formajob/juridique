'use client';

import Link from 'next/link';

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

  const dossiersRecus = cas.filter((c) => c.etape === 'constatation_recue').length;
  const dossiersEnCours = cas.filter(
    (c) => !['cloture', 'fin_procedure', 'decision_licenciement', 'decision_mise_a_pied', 'decision_sanction'].includes(c.etape)
  ).length;

  return (
    <>
      <header className="g-page-head g-rise" style={{ ['--d' as string]: '.02s' }}>
        <div>
          <div className="g-kicker"><i /> Espace Juriste</div>
          <h1>Tableau de bord</h1>
          <p>Vue d&rsquo;ensemble des dossiers de démonstration. Un clic ouvre la liste de l&rsquo;étape.</p>
        </div>
        <div className="g-tools">
          <Link href="/juriste/dossiers" className="g-btn g-btn--ghost g-btn--sm">Voir tous les dossiers</Link>
        </div>
      </header>

      <section className="g-kpis g-rise" style={{ ['--d' as string]: '.06s' }}>
        <article className="g-kpi g-glass">
          <div className="g-kpi-top">
            <span className="g-kpi-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M4 5h16v14H4z" /><path d="M8 3v4M16 3v4M4 10h16" />
              </svg>
            </span>
            <span className="g-delta">{dossiersRecus} reçus</span>
          </div>
          <b className="g-value g-num">{dossiersRecus}</b>
          <span className="g-label">Dossiers reçus</span>
        </article>

        <article className="g-kpi g-glass">
          <div className="g-kpi-top">
            <span className="g-kpi-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
              </svg>
            </span>
            <span className="g-delta is-info">en cours</span>
          </div>
          <b className="g-value g-num">{dossiersEnCours}</b>
          <span className="g-label">Dossiers en cours</span>
        </article>

        <article className="g-kpi g-glass">
          <div className="g-kpi-top">
            <span className="g-kpi-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <circle cx="12" cy="8" r="3" /><path d="M5 19c1.2-3 3.4-4.5 7-4.5s5.8 1.5 7 4.5" />
              </svg>
            </span>
            <span className="g-delta">bureau</span>
          </div>
          <b className="g-value g-num">5</b>
          <span className="g-label">Places de pointeurs</span>
        </article>
      </section>

      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.1s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">Répartition par étape</h3>
            <p className="g-card-sub">Les étapes que le juriste suit. Un clic filtre la liste des dossiers.</p>
          </div>
        </div>
        <div className="g-bars">
          {TITRES_ETAPES.filter((t) => casParEtape[t.code]).map((t) => {
            const n = casParEtape[t.code].length;
            return (
              <Link key={t.code} href={`/juriste/dossiers?etape=${t.code}`} className="g-bar">
                <span className="g-bar-label"><i style={{ background: '#2563eb', color: '#2563eb' }} />{t.label}</span>
                <span className="g-track">
                  <span className="g-fill" style={{ width: `${Math.round((n / Math.max(1, cas.length)) * 100)}%` }} />
                </span>
                <span className="g-bar-val"><b className="g-num">{n}</b>dossier{n > 1 ? 's' : ''}</span>
              </Link>
            );
          })}
        </div>
        <div className="g-card-foot">
          <span>Total <b className="g-num">{cas.length}</b> dossiers de démonstration</span>
          <span>Aucun motif affiché</span>
        </div>
      </section>

      <footer className="g-foot">
        <span>ACX Flow · Espace Juriste</span>
        <span className="g-tag">Glassy V22</span>
      </footer>
    </>
  );
}
