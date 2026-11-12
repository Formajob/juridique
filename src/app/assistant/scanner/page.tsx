'use client';

import { useState } from 'react';
import { DEMO_CASES } from '@/lib/demo-cases';
import { DEMO_POINTAGE_EST_DEPART } from '@/lib/demo-pointage';

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

export default function AssistantScannerPage() {
  const [jeton, setJeton] = useState('');
  const [resultat, setResultat] = useState<{ ref: string; heure: string; juriste: string } | null>(null);

  const handleLire = () => {
    // Simulation de lecture : un jeton aléatoire correspond à DEMO-2026-0006
    const ref = jeton ? jeton : 'DEMO-2026-0006';
    setResultat({
      ref,
      heure: '10:30',
      juriste: 'Juriste 1',
    });
  };

  return (
    <>
      <header className="g-page-head g-rise" style={{ ['--d' as string]: '.02s' }}>
        <div>
          <div className="g-kicker"><i /> Espace Assistant · Scanner</div>
          <h1>Scanner</h1>
          <p>Lit le jeton QR et affiche la personne attendue. Rien n&apos;est enregistré.</p>
        </div>
        <span className="g-chip">Démo</span>
      </header>

      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.05s', maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <div
          className="g-scan"
          onClick={() => document.getElementById('jeton')?.focus()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('jeton')?.focus(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M4 8V5h3M20 8V5h-3M4 16v3h3M20 16v3h-3" />
            <path d="M4 12h16" />
          </svg>
          <b>Scanner le QR du rendez-vous</b>
          <span>Le lecteur n&apos;est pas branché sur cette copie : saisir le jeton.</span>
        </div>

        <label className="g-field" style={{ marginTop: 16 }}>
          <span>Jeton (ou scannez le QR)</span>
          <input
            id="jeton"
            value={jeton}
            onChange={(e) => setJeton(e.target.value)}
            placeholder="Ex: DEMO-2026-0006"
          />
        </label>

        <button onClick={handleLire} className="g-btn" style={{ width: '100%', marginTop: 14 }}>
          Lire le jeton
        </button>
      </section>

      {resultat && (
        <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.08s', maxWidth: 560, margin: '0 auto', width: '100%', textAlign: 'center' }}>
          <span className="g-badge is-ok" style={{ margin: '0 auto' }}><i className="g-dot" />Jeton lu</span>
          <div className="g-num" style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', marginTop: 10 }}>{resultat.ref}</div>
          <div className="g-card-sub" style={{ marginTop: 8 }}>
            Heure : <b>{resultat.heure}</b> · Juriste à appeler : <b>{resultat.juriste}</b>
          </div>
          <div className="g-card-foot" style={{ justifyContent: 'center', marginTop: 14 }}>
            <span>Personne attendue : Assistant 1</span>
          </div>
        </section>
      )}

      <footer className="g-foot">
        <span>ACX Flow · Scanner — réception</span>
        <span className="g-tag">Glassy V22</span>
      </footer>
    </>
  );
}
