'use client';

import Link from 'next/link';
import SaisieDossierForm from '@/components/dossiers/SaisieDossierForm';

export default function AdminNouveauDossierPage() {
  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Saisie d’un nouveau dossier</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>
            Crée un dossier dans le workflow partagé.
          </p>
        </div>
        <Link href="/admin/dossiers" className="btn-pill">Retour aux dossiers</Link>
      </header>
      <div className="card" style={{ marginTop: 16 }}>
        <SaisieDossierForm redirectBase="/admin/dossiers" defaultCreePar="Admin" />
      </div>
    </div>
  );
}