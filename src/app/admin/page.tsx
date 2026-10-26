'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';
import { ETAPE_LABELS } from '@/lib/workflow-ui';
import { formatDateFr } from '@/lib/format';

export default function AdminDashboardPage() {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const cas = snap.cases;

  const dossiersRecus = cas.filter((c) => c.etape === 'constatation_recue').length;
  const dossiersEnCours = cas.filter((c) => c.etape !== 'cloture' && c.etape !== 'fin_procedure').length;
  const dossiersEnRetard = cas.filter((c) => c.echeance && new Date(c.echeance) < new Date()).length;

  const casParEtape: Record<string, typeof cas> = {};
  for (const c of cas) {
    if (!casParEtape[c.etape]) casParEtape[c.etape] = [];
    casParEtape[c.etape].push(c);
  }

  const titres = [
    { code: 'constatation_recue', label: 'Constatations' },
    { code: 'analyse_gravite', label: 'Analyse' },
    { code: 'convocation_seance', label: 'Convocations' },
    { code: 'seance_presente', label: 'Séances' },
    { code: 'decision_licenciement', label: 'Décisions' },
    { code: 'cloture', label: 'Clos' },
  ];

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Tableau de bord</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Vue d’ensemble des dossiers.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/dossiers" className="btn-pill">Voir tous les dossiers</Link>
          <Link href="/admin/avancement" className="btn-pill">Avancement</Link>
        </div>
      </header>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>{dossiersRecus}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Dossiers reçus</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--cyan-fonce)' }}>{dossiersEnCours}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>En cours</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#8a5a00' }}>{dossiersEnRetard}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>En retard</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--violet)' }}>{cas.length}</div>
          <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Total dossiers</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Répartition par étape</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {titres.filter((t) => casParEtape[t.code]).map((t) => (
            <Link key={t.code} href={`/admin/dossiers?etape=${t.code}`} className="btn-pill" style={{ justifyContent: 'space-between', fontWeight: 600 }}>
              <span>{t.label}</span>
              <span style={{ backgroundColor: 'var(--navy)', color: 'var(--blanc)', borderRadius: '999px', padding: '1px 10px', fontWeight: 700 }}>
                {casParEtape[t.code].length}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Échéances du jour</h2>
        {cas.filter((c) => c.echeance && new Date(c.echeance).getTime() <= Date.now() + 24 * 3600000).length === 0 ? (
          <div style={{ padding: '20px', color: 'var(--texte-secondaire)', textAlign: 'center' }}>Aucune échéance prévue aujourd’hui.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {cas.filter((c) => c.echeance && new Date(c.echeance).getTime() <= Date.now() + 24 * 3600000).map((c) => (
              <div key={c.reference} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--encre)' }}>{c.reference}</div>
                <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Étape : {ETAPE_LABELS[c.etape] || c.etape}</div>
                <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>Échéance : {c.echeance ? formatDateFr(c.echeance) : '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
