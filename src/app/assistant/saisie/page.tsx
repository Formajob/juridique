'use client';

import Link from 'next/link';
import SaisieDossierForm from '@/components/dossiers/SaisieDossierForm';

export default function AssistantSaisiePage() {
  return (
    <div className="g-page">
      <header className="g-page-head">
        <div>
          <div className="g-kicker"><i /> Espace Assistant · Saisie</div>
          <h1>Saisie d’un nouveau dossier</h1>
          <p>Enregistre un nouveau dossier dans le workflow partagé.</p>
        </div>
        <Link href="/assistant/reception" className="g-btn g-btn--ghost g-btn--sm">Réception</Link>
      </header>
      <div className="g-card g-glass">
        <SaisieDossierForm defaultCreePar="Assistant 1" />
      </div>
    </div>
  );
}