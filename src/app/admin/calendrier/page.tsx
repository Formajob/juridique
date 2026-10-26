'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';
import { formatDateTimeFr } from '@/lib/format';

export default function AdminCalendarPage() {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Calendrier</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Créneaux de convocation.</p>
        </div>
      </header>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {snap.appointments.map((appt) => {
            const dossier = snap.cases.find((c) => c.reference === appt.dossier);
            return (
              <Link key={appt.id} href={`/admin/dossiers/${appt.dossier}`} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-etape">Convocation</span>
                  <span className="badge badge-navy">{dossier?.statut || 'En attente'}</span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--encre)' }}>{appt.dossier}</div>
                <div style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>{formatDateTimeFr(appt.debut)} · {appt.lieu}</div>
                <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>{dossier?.etape || 'dossier'}</div>
              </Link>
            );
          })}
          {snap.appointments.length === 0 && <div style={{ color: 'var(--texte-secondaire)' }}>Aucune convocation.</div>}
        </div>
      </div>
    </div>
  );
}
