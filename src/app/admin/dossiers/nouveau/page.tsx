'use client';

import Link from 'next/link';
import { FlowBanner, FlowName } from '@/components/brand/FlowBrand';
import SaisieDossierForm from '@/components/dossiers/SaisieDossierForm';

export default function AdminNouveauDossierPage() {
  return (
    <div className="wrap-admin">
      <FlowBanner 
        title={<FlowName />} 
        chip="Constatations"
        subtitle={`Saisie d'un nouveau dossier — ${new Date().toLocaleDateString('fr-FR')}`}
      >
        <header className="header-header">
          <div>
            <h1 className="header-title">Saisie d'un nouveau dossier</h1>
            <p style={{ fontSize: 13, color: '#62708a' }}>
              Crée un dossier dans le workflow partagé.
            </p>
          </div>
          <Link href="/admin/dossiers" className="btn-pill">Retour aux dossiers</Link>
        </header>
      </FlowBanner>
      <div className="card" style={{ marginTop: 16 }}>
        <SaisieDossierForm redirectBase="/admin/dossiers" defaultCreePar="Admin" />
      </div>
    </div>
  );
}