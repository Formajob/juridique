'use client';

/**
 * Réception — assistant. Habillage Glassy V22.
 * La réception se note, elle ne stocke rien : aucun fichier, aucun motif.
 */

import { useState } from 'react';
import Link from 'next/link';
import { DEMO_CASES } from '@/lib/demo-cases';

const ETAPE_LABELS: Record<string, string> = {
  constatation_recue: 'Constatation reçue',
  analyse_gravite: 'Analyse gravité',
  sanction_faute_non_grave: 'Sanction faute non grave',
  convocation_seance: 'Convocation séance',
  seance_presente: 'Séance présente',
  seance_absente: 'Séance absente',
  depot_inspection_absence: 'Dépôt inspection absence',
  investigations: 'Investigations',
  decision_licenciement: 'Décision licenciement',
  decision_mise_a_pied: 'Décision mise à pied',
  decision_sanction: 'Décision sanction',
  fin_procedure: 'Fin de procédure',
  cloture: 'Clôture',
};

export default function AssistantReceptionPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [docStatus, setDocStatus] = useState('');

  const aVenir = DEMO_CASES.filter((c) => c.etape === 'constatation_recue' && c.reception === false);
  const enCours = DEMO_CASES.filter((c) => c.etape === 'constatation_recue' && c.reception === true);

  const handleRecevoir = () => {
    if (!selected) return;
    alert(`Dossier ${selected} → réception notée (démo).`);
  };

  return (
    <>
      <header className="g-top g-rise" style={{ ['--d' as string]: '.02s' }}>
        <div>
          <div className="g-kicker"><i /> Espace Assistant · Réception</div>
          <h1>Réception</h1>
          <p className="g-lead">
            Note le statut de réception et la remise des documents. On note qu&apos;une copie a été remise, on ne stocke
            pas le fichier.
          </p>
        </div>
        <div className="g-tools">
          <Link href="/assistant/saisie" className="g-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Saisir un dossier
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
          <b className="g-value g-num">{aVenir.length}</b>
          <span className="g-label">À réceptionner</span>
        </article>
        <article className="g-kpi g-glass">
          <div className="g-kpi-top">
            <span className="g-kpi-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span className="g-delta is-ok">notées</span>
          </div>
          <b className="g-value g-num">{enCours.length}</b>
          <span className="g-label">En réception</span>
        </article>
        <article className="g-kpi g-glass">
          <div className="g-kpi-top">
            <span className="g-kpi-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M12 3v18M3 12h18" />
              </svg>
            </span>
            <span className="g-delta">ce jour</span>
          </div>
          <b className="g-value g-num">{selected ? 1 : 0}</b>
          <span className="g-label">Dossier ouvert</span>
        </article>
      </section>

      <section className="g-grid-2 g-rise" style={{ ['--d' as string]: '.09s' }}>
        <article className="g-card g-glass">
          <div className="g-card-head">
            <div>
              <h3 className="g-card-title">À réceptionner ({aVenir.length})</h3>
              <p className="g-card-sub">Un clic sélectionne le dossier et ouvre la note de réception.</p>
            </div>
          </div>
          {aVenir.length === 0 ? (
            <p className="g-empty">Aucun dossier à réceptionner.</p>
          ) : (
            <ul className="g-list">
              {aVenir.map((c) => (
                <li key={c.reference}>
                  <button
                    type="button"
                    className="g-list-item"
                    onClick={() => setSelected(c.reference)}
                    style={selected === c.reference ? { background: 'var(--g-glass-2)', borderColor: 'rgba(37,99,235,.35)' } : undefined}
                  >
                    <span className="g-list-main">
                      <b>{c.reference}</b>
                      <span>{ETAPE_LABELS[c.etape]}</span>
                    </span>
                    <span className="g-list-side">
                      <span className="g-badge is-warn"><i className="g-dot" />À faire</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="g-card-foot">
            <span>Réception seulement</span>
            <span>Ni motif, ni sanction</span>
          </div>
        </article>

        <article className="g-card g-glass">
          <div className="g-card-head">
            <div>
              <h3 className="g-card-title">En réception ({enCours.length})</h3>
              <p className="g-card-sub">Dossiers dont la réception est déjà notée.</p>
            </div>
          </div>
          {enCours.length === 0 ? (
            <p className="g-empty">Aucun dossier en réception.</p>
          ) : (
            <ul className="g-list">
              {enCours.map((c) => (
                <li key={c.reference}>
                  <div className="g-list-item" style={{ cursor: 'default', opacity: 0.75 }}>
                    <span className="g-list-main">
                      <b>{c.reference}</b>
                      <span>{ETAPE_LABELS[c.etape]}</span>
                    </span>
                    <span className="g-list-side">
                      <span className="g-badge is-ok"><i className="g-dot" />Notée</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="g-card-foot">
            <span>Copie remise : note seulement</span>
            <span>Aucun fichier stocké</span>
          </div>
        </article>
      </section>

      {selected && (
        <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.12s' }}>
          <div className="g-card-head">
            <div>
              <h3 className="g-card-title">Note de réception · {selected}</h3>
              <p className="g-card-sub">Statut du document et commentaire libre. Rien n&apos;est envoyé.</p>
            </div>
            <span className="g-badge is-info">{selected}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 13 }}>
            <label className="g-field">
              <span>Statut de réception</span>
              <select value={docStatus} onChange={(e) => setDocStatus(e.target.value)}>
                <option value="">Sélectionner…</option>
                <option value="remis">Remis</option>
                <option value="recu">Reçu</option>
                <option value="manquant">Manquant</option>
              </select>
            </label>
            <label className="g-field">
              <span>Note</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Commentaire (optionnel, non stocké)"
              />
            </label>
          </div>

          <div className="g-card-foot" style={{ marginTop: 16 }}>
            <span>La note met à jour la fiche du dossier</span>
            <button type="button" className="g-btn" onClick={handleRecevoir}>
              Enregistrer la réception
            </button>
          </div>
        </section>
      )}

      <footer className="g-foot">
        <span>ACX Flow · Espace Assistant — réception</span>
        <span className="g-tag">Glassy V22</span>
      </footer>
    </>
  );
}
