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
    <>
      <header className="g-page-head g-rise" style={{ ['--d' as string]: '.02s' }}>
        <div>
          <div className="g-kicker"><i /> Espace Assistant · Documents</div>
          <h1>Documents</h1>
          <p>Note le remis ou la réception des documents. Un document n&rsquo;est pas stocké, seulement noté.</p>
        </div>
        {selected && <span className="g-chip">{selected}</span>}
      </header>

      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.05s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">Dossiers disponibles</h3>
            <p className="g-card-sub">Un clic sélectionne le dossier, puis ouvre la note de document.</p>
          </div>
          <span className="g-tag">{snap.cases.length}</span>
        </div>
        <ul className="g-list">
          {snap.cases.map((c) => (
            <li key={c.reference}>
              <button
                type="button"
                className="g-list-item"
                onClick={() => setSelected(c.reference)}
                style={selected === c.reference ? { background: 'var(--g-glass-2)', borderColor: 'rgba(37,99,235,.35)' } : undefined}
              >
                <span className="g-list-main">
                  <b>{c.reference}</b>
                  <span>{ETAPE_LABELS[c.etape] || c.etape}</span>
                </span>
                <span className="g-list-side">→</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selected && (
        <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.08s' }}>
          <div className="g-card-head">
            <div>
              <h3 className="g-card-title">{selected}</h3>
              <p className="g-card-sub">Choisir l&rsquo;action puis enregistrer. La fiche garde la trace.</p>
            </div>
          </div>
          <label className="g-field" style={{ maxWidth: 360 }}>
            <span>Action</span>
            <select value={action || ''} onChange={(e) => setAction(e.target.value)}>
              <option value="">Sélectionner…</option>
              <option value="remis">Document remis</option>
              <option value="recu">Document reçu</option>
              <option value="perdu">Document manquant</option>
            </select>
          </label>
          <div className="g-card-foot" style={{ marginTop: 16 }}>
            <span>Rien n&rsquo;est envoyé ni stocké</span>
            <button className="g-btn" onClick={handleEnregistrer} disabled={!action}>Enregistrer</button>
          </div>
        </section>
      )}

      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.11s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">Reçu des autres onglets</h3>
            <p className="g-card-sub">Les derniers mouvements lus dans le workflow partagé.</p>
          </div>
        </div>
        {snap.events.length === 0 ? (
          <p className="g-empty">Aucun mouvement.</p>
        ) : (
          <ul className="g-list">
            {snap.events.slice(0, 10).map((e) => (
              <li key={e.id}>
                <div className="g-list-item" style={{ cursor: 'default' }}>
                  <span className="g-list-main">
                    <b>{e.dossier}</b>
                    <span>{e.action}</span>
                  </span>
                  <span className="g-list-side g-mono" suppressHydrationWarning>{new Date(e.date).toLocaleString('fr-FR')}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="g-foot">
        <span>ACX Flow · Documents — assistant</span>
        <span className="g-tag">Glassy V22</span>
      </footer>
    </>
  );
}
