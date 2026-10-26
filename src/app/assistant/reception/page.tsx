'use client';

import { useState } from 'react';
import Link from 'next/link';
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

export default function AssistantReceptionPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const aVenir = DEMO_CASES.filter(c => c.etape === 'constatation_recue' && c.reception === false);
  const enCours = DEMO_CASES.filter(c => c.etape === 'constatation_recue' && c.reception === true);

  const handleRecevoir = () => {
    if (!selected) return;
    alert(`Dossier ${selected} → réception notée (démo).`);
  };

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Réception</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Note le statut de réception et la remise des documents.</p>
        </div>
      </header>

      <div style={{ marginBottom: 16 }}>
        <Link href="/assistant/saisie" className="btn-pill">Saisir un nouveau dossier</Link>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>À réceptionner ({aVenir.length})</h2>
          <ul className="list" style={{ paddingLeft: 0 }}>
            {aVenir.map((c) => (
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
          {aVenir.length === 0 && (
            <div style={{ padding: '20px', color: 'var(--texte-secondaire)', textAlign: 'center' }}>Aucun dossier à réceptionner.</div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>En réception ({enCours.length})</h2>
          <ul className="list" style={{ paddingLeft: 0 }}>
            {enCours.map((c) => (
              <li key={c.reference}>
                <button
                  disabled
                  className="btn-pill"
                  style={{ justifyContent: 'space-between', fontWeight: 600, opacity: 0.6 }}
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
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Note de réception : {selected}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="field">
                <label>Statut de réception</label>
                <select
                  value=""
                  onChange={(e) => {}}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--filet)', borderRadius: 6, fontFamily: 'var(--font-inter)' }}
                >
                  <option value="">Sélectionner…</option>
                  <option value="remis">Remis</option>
                  <option value="recu">Reçu</option>
                  <option value="manquant">Manquant</option>
                </select>
              </div>
              <div className="field">
                <label>Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="Commentaire (optionnel, non stocké)"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--filet)', borderRadius: 6, fontFamily: 'var(--font-inter)' }}
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn-primary" onClick={handleRecevoir}>
                Enregistrer la réception
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
