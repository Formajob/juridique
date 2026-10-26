'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useSyncExternalStore } from 'react';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';
import { etapePageGroup, ETAPE_LABELS, pageTitleFor } from '@/lib/workflow-ui';
import { formatDateFr } from '@/lib/format';

function JuristeDossiersPageInner() {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const params = useSearchParams();
  const etapeQuery = params.get('etape');

  const isEcheances = etapeQuery === null;

  let title = isEcheances ? 'Échéances' : pageTitleFor(etapeQuery, 'juriste');
  let items = snap.cases;
  if (isEcheances) {
    items = snap.cases.filter((c) => !!c.echeance).sort((a, b) => new Date(a.echeance!).getTime() - new Date(b.echeance!).getTime());
  } else {
    const group = etapePageGroup(etapeQuery!);
    items = group.length ? snap.cases.filter((c) => group.includes(c.etape)) : snap.cases.filter((c) => c.etape === etapeQuery);
  }

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">{title}</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>
            {items.length} dossier{items.length > 1 ? 's' : ''}.
          </p>
        </div>
        <Link href="/juriste/dossiers/nouveau" className="btn-pill">Nouveau dossier</Link>
        <Link href="/juriste/dossiers" className="btn-pill">Tous / Échéances</Link>
      </header>

      <div className="card" style={{ marginTop: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--filet)' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Référence</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Identifiant agent</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Activité</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Étape</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Échéance</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => {
              const overdue = c.echeance && new Date(c.echeance) < new Date();
              return (
                <tr key={c.reference} style={{ borderBottom: '1px solid var(--filet)' }}>
                  <td style={{ padding: '8px' }}>
                    <Link href={`/juriste/dossiers/${c.reference}`} style={{ fontWeight: 600, color: 'var(--encre)' }}>{c.reference}</Link>
                  </td>
                  <td style={{ padding: '8px' }}>{c.agentId}</td>
                  <td style={{ padding: '8px' }}>{c.affectationFixe?.lob || ''} / {c.affectationFixe?.department || ''}</td>
                  <td style={{ padding: '8px' }}>{ETAPE_LABELS[c.etape] || c.etape}</td>
                  <td style={{ padding: '8px', color: overdue ? '#a00' : 'inherit', fontWeight: overdue ? 700 : 400 }}>
                    {c.echeance ? formatDateFr(c.echeance) : '—'}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--texte-secondaire)' }}>Aucun dossier.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
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
  );
}

export default function JuristeDossiersPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Chargement…</div>}>
      <JuristeDossiersPageInner />
    </Suspense>
  );
}

