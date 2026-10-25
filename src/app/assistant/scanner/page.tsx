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
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Scanner</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Lit le jeton QR et affiche la personne attendue.</p>
        </div>
      </header>

      <div className="card" style={{ marginTop: 16, maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', border: '2px dashed var(--filet)', borderRadius: 8, background: 'var(--fond)', cursor: 'pointer' }}>
            <div style={{ textAlign: 'center', color: 'var(--texte-secondaire)' }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--navy)' }}>📷</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Scanner le QR du rendez-vous</div>
            </div>
          </div>

          <div className="field">
            <label>Jeton (ou scannez le QR)</label>
            <input
              value={jeton}
              onChange={(e) => setJeton(e.target.value)}
              placeholder="Ex: DEMO-2026-0006"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--filet)', borderRadius: 6, fontFamily: 'var(--font-inter)' }}
            />
          </div>

          <button
            onClick={handleLire}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            Lire le jeton
          </button>
        </div>
      </div>

      {resultat && (
        <div className="card" style={{ marginTop: 16, maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--navy)' }}>{resultat.ref}</div>
          <div style={{ fontSize: 13, color: 'var(--texte-secondaire)', marginTop: 8 }}>
            Heure : <strong>{resultat.heure}</strong>
          </div>
          <div style={{ fontSize: 13, color: 'var(--texte-secondaire)', marginTop: 4 }}>
            Juriste à appeler : <strong>{resultat.juriste}</strong>
          </div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)', marginTop: 16 }}>
            Personne attendue : Assistant 1
          </div>
        </div>
      )}
    </div>
  );
}
