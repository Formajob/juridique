'use client';

import Link from 'next/link';
import { DEMO_CASES, createDemoAppointments } from '@/lib/demo-cases';
import { formatDateFr, formatDateTimeFr } from '@/lib/format';

const ETAPE_LABELS: Record<string, string> = {
  constatation_recue: 'Constatation recue',
  analyse_gravite: 'Analyse gravite',
  sanction_faute_non_grave: 'Sanction faute non grave',
  convocation_seance: 'Convocation seance',
  seance_presente: 'Seance presente',
  seance_absente: 'Seance absente',
  depot_inspection_absence: 'Depot inspection absence',
  investigations: 'Investigations',
  decision_licenciement: 'Decision licenciement',
  decision_mise_a_pied: 'Decision mise a pied',
  decision_sanction: 'Decision sanction',
  fin_procedure: 'Fin de procedure',
  cloture: 'Cloture',
};

export default function AdminCalendarPage() {
  const appointments = createDemoAppointments();

  return (
    <div className="wrap-admin">
      <header className="header">
        <div>
          <h1 className="header-title">Calendrier</h1>
          <p style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>Créneaux de convocation de démonstration.</p>
        </div>
      </header>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {appointments.map((appt) => {
            const dossier = DEMO_CASES.find(c => c.reference === appt.dossier);
            return (
              <Link key={appt.id} href={`/admin/dossiers/${appt.dossier}`} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-etape">Convocation</span>
                  <span className="badge badge-navy">{dossier?.statut || 'En attente'}</span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--encre)' }}>{appt.dossier}</div>
                <div style={{ fontSize: 13, color: 'var(--texte-secondaire)' }}>{formatDateTimeFr(appt.debut)} · {appt.lieu}</div>
                <div style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>{dossier?.statut || 'dossier'}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
