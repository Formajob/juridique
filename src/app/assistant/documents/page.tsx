'use client';

import { useState } from 'react';
import { useSyncExternalStore } from 'react';
import { getWorkflowState, subscribeWorkflow, noteDocument } from '@/lib/workflow-store';
import { ETAPE_LABELS } from '@/lib/workflow-ui';

export default function AssistantDocumentsPage() {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const [selected, setSelected] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);

  const handleEnregistrer = () => {
    if (!selected || !action) return;
    const label = action === 'remis' ? 'Document remis' : action === 'recu' ? 'Document reçu' : 'Document manquant';
    noteDocument(selected, label);
    alert(`Dossier ${selected} → ${label} noté dans la fiche.`);
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
            {snap.cases.map((c) => (
              <li key={c.reference}>
                <button
                  onClick={() => setSelected(c.reference)}
                  className="btn-pill"
                  style={{ justifyContent: 'space-between', fontWeight: 600 }}
                >
                  <span>{c.reference}</span>
                  <span style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>{ETAPE_LABELS[c.etape] || c.etape}</span>
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

        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Reçu des autres onglets</h2>
          <ul className="list" style={{ paddingLeft: 0 }}>
            {snap.events.slice(0, 10).map((e) => (
              <li key={e.id} style={{ padding: '6px 0', fontSize: 12, color: 'var(--texte-secondaire)' }}>
                {e.dossier} — {e.action} — {new Date(e.date).toLocaleString('fr-FR')}
              </li>
            ))}
            {snap.events.length === 0 && <li style={{ color: 'var(--texte-secondaire)' }}>Aucun.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
