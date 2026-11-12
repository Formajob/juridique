'use client';

import Link from 'next/link';
import SaisieDossierForm from '@/components/dossiers/SaisieDossierForm';

export default function JuristeNouveauDossierPage() {
  return (
    <div className="g-page">
      <header className="g-page-head">
        <div>
          <div className="g-kicker"><i /> Espace Juriste · Saisie</div>
          <h1>Saisie d’un nouveau dossier</h1>
          <p>Crée un dossier dans le workflow partagé.</p>
        </div>
        <Link href="/juriste/dossiers" className="g-btn g-btn--ghost g-btn--sm">Retour aux dossiers</Link>
      </header>
      <div className="g-card g-glass">
        <SaisieDossierForm redirectBase="/juriste/dossiers" defaultCreePar="Juriste 1" />
      </div>
    </div>
  );
}