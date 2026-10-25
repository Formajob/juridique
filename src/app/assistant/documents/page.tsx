'use client';

import { useState } from 'react';
import { DEMO_CASES } from '@/lib/demo-cases';

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

export default function AssistantDocumentsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);

  const handleEnregistrer = () => {
    if (!selected || !action) return;
    alert(`Dossier ${selected} → ${action === 'remis' ? 'Remis' : 'Reçu'} (démo).`);
  };

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Documents</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Note le remis ou la réception des documents.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Dossiers disponibles</h2>
          <ul className="list" style={{ paddingLeft: 0 }}>
            {DEMO_CASES.map((c) => (
              <li key={c.reference}>
                <button
                  onClick={() => setSelected(c.reference)}
                  className="btn-pill"
                  style={{ justifyContent: 'space-between', fontWeight: 600 }}
                >
                  <span>{c.reference}</span>
                  <span style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>{ETAPE_LABELS[c.etape]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {selected && (
          <div className="card">
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>{selected}</h2>
            <div className="field">
              <label>Action</label>
              <select
                value={action || ''}
                onChange={(e) => setAction(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--filet)', borderRadius: 6, fontFamily: 'var(--font-inter)' }}
              >
                <option value="">Sélectionner…</option>
                <option value="remis">Document remis</option>
                <option value="recu">Document reçu</option>
                <option value="perdu">Document manquant</option>
              </select>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn-primary" onClick={handleEnregistrer}>
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
