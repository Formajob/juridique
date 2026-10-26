'use client';

import Link from 'next/link';
import SaisieDossierForm from '@/components/dossiers/SaisieDossierForm';

export default function AssistantSaisiePage() {
  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Saisie d’un nouveau dossier</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>
            Enregistre un nouveau dossier dans le workflow partagé.
          </p>
        </div>
        <Link href="/assistant/reception" className="btn-pill">Réception</Link>
      </header>
      <div className="card" style={{ marginTop: 16 }}>
        <SaisieDossierForm defaultCreePar="Assistant 1" />
      </div>
    </div>
  );
}