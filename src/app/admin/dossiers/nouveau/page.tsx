'use client';

import Link from 'next/link';
import SaisieDossierForm from '@/components/dossiers/SaisieDossierForm';

export default function AdminNouveauDossierPage() {
  return (
    <div className="g-page">
      <header className="g-page-head">
        <div>
          <div className="g-kicker"><i /> Espace Juridique · Saisie</div>
          <h1>Saisie d&rsquo;un nouveau dossier</h1>
          <p>Crée un dossier dans le workflow partagé.</p>
        </div>
        <Link href="/admin/dossiers" className="g-btn g-btn--ghost g-btn--sm">Retour aux dossiers</Link>
      </header>
      <div className="g-card g-glass">
        <SaisieDossierForm redirectBase="/admin/dossiers" defaultCreePar="Admin" />
      </div>
    </div>
  );
}