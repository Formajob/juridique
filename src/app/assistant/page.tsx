import Link from 'next/link';
import { DEMO_POINTAGE_PERSONNES } from '@/lib/demo-people';

const DEMO_CASES = [
  { ref: 'DEMO-2026-0001', etape: 'constatation_recue', statut: 'En cours', reception: true },
  { ref: 'DEMO-2026-0002', etape: 'constatation_recue', statut: 'En cours', reception: true },
  { ref: 'DEMO-2026-0003', etape: 'constatation_recue', statut: 'En cours', reception: true },
  { ref: 'DEMO-2026-0004', etape: 'analyse_gravite', statut: 'En cours', reception: true },
  { ref: 'DEMO-2026-0005', etape: 'analyse_gravite', statut: 'En cours', reception: true },
  { ref: 'DEMO-2026-0006', etape: 'convocation_seance', statut: 'En attente', reception: true },
];

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

  const dossiersEnReception = cas.filter((c) => c.etape === 'constatation_recue').length;

  return (
    <>
      <header className="g-page-head g-rise" style={{ ['--d' as string]: '.02s' }}>
        <div>
          <div className="g-kicker"><i /> Espace Assistant</div>
          <h1>Tableau de bord</h1>
          <p>Vue d&rsquo;ensemble de la réception de démonstration. Ni motif, ni gravité, ni sanction.</p>
        </div>
        <div className="g-tools">
          <Link href="/assistant/reception" className="g-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
            </svg>
            Ouvrir la réception
          </Link>
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
            <span className="g-delta is-warn">à traiter</span>
          </div>
          <b className="g-value g-num">{dossiersEnReception}</b>
          <span className="g-label">À réceptionner</span>
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
          <b className="g-value g-num">{DEMO_POINTAGE_PERSONNES.length}</b>
          <span className="g-label">Places d&rsquo;assistant</span>
        </article>

        <article className="g-kpi g-glass">
          <div className="g-kpi-top">
            <span className="g-kpi-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 15l3.5-4 3 2.5L20 7" />
              </svg>
            </span>
            <span className="g-delta">démo</span>
          </div>
          <b className="g-value g-num">{casParEtape.size}</b>
          <span className="g-label">Étapes concernées</span>
        </article>
      </section>

      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.1s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">Réception en cours</h3>
            <p className="g-card-sub">Répartition des dossiers de démonstration encore à la réception.</p>
          </div>
          <span className="g-tag">Démo</span>
        </div>

        <div className="g-bars">
          {TITRES_ETAPES.filter((t) => casParEtape.has(t.code)).map((t) => {
            const n = casParEtape.get(t.code)!.length;
            return (
              <Link key={t.code} href="/assistant/reception" className="g-bar">
                <span className="g-bar-label"><i style={{ background: '#3b82f6', color: '#3b82f6' }} />{t.label}</span>
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
          <span>La réception se note, elle ne stocke rien</span>
        </div>
      </section>

      <footer className="g-foot">
        <span>ACX Flow · Espace Assistant</span>
        <span className="g-tag">Glassy V22</span>
      </footer>
    </>
  );
}
