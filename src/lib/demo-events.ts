// Données de démonstration : événements de cas et rendez-vous.

import type { Appointment, CaseEvent } from '@/types/database';

export function createDemoCaseEvents(): CaseEvent[] {
  const events: CaseEvent[] = [];
  const now = new Date();

  const eventSeed: Array<[string, string, string, string]> = [
    ['DEMO-2026-0001', 'constatation_recue', 'Réception du dossier', 'Juriste 1'],
    ['DEMO-2026-0001', 'analyse_gravite', 'Analyse de gravité effectuée', 'Juriste 1'],
    ['DEMO-2026-0004', 'constatation_recue', 'Réception du dossier', 'Juriste 2'],
    ['DEMO-2026-0005', 'constatation_recue', 'Réception du dossier', 'Juriste 1'],
    ['DEMO-2026-0006', 'constatation_recue', 'Réception du dossier', 'Juriste 1'],
    ['DEMO-2026-0006', 'convocation_seance', 'Convocation émise', 'Juriste 1'],
    ['DEMO-2026-0007', 'constatation_recue', 'Réception du dossier', 'Juriste 2'],
    ['DEMO-2026-0007', 'convocation_seance', 'Convocation émise', 'Juriste 2'],
    ['DEMO-2026-0008', 'constatation_recue', 'Réception du dossier', 'Juriste 1'],
    ['DEMO-2026-0008', 'convocation_seance', 'Convocation émise', 'Juriste 1'],
    ['DEMO-2026-0008', 'seance_presente', 'Séance tenue avec présentation', 'Juriste 1'],
    ['DEMO-2026-0009', 'constatation_recue', 'Réception du dossier', 'Juriste 2'],
    ['DEMO-2026-0009', 'convocation_seance', 'Convocation émise', 'Juriste 2'],
    ['DEMO-2026-0009', 'seance_presente', 'Séance tenue avec présentation', 'Juriste 2'],
    ['DEMO-2026-0009', 'pv_seance', 'PV de séance établi', 'Juriste 2'],
    ['DEMO-2026-0010', 'constatation_recue', 'Réception du dossier', 'Juriste 1'],
    ['DEMO-2026-0010', 'convocation_seance', 'Convocation émise', 'Juriste 1'],
    ['DEMO-2026-0010', 'seance_absente', 'Déclaration d absence', 'Juriste 1'],
    ['DEMO-2026-0011', 'constatation_recue', 'Réception du dossier', 'Juriste 2'],
    ['DEMO-2026-0011', 'depot_inspection_absence', 'Dépôt d inspection', 'Juriste 2'],
  ];

  let seq = 0;
  for (const [ref, etape, action, auteur] of eventSeed) {
    const date = new Date(now);
    date.setSeconds(date.getSeconds() - (seq % 20));
    seq++;
    events.push({
      id: `evt-${ref}-${seq}`,
      dossier: ref,
      etape,
      action,
      auteur,
      date: date.toISOString(),
      tenantId: 'juridique-xceed',
    });
  }

  return events;
}

export function createDemoAppointments(): Appointment[] {
  const now = new Date();
  const appointments: Appointment[] = [];

  const appSeed: Array<[string, string, string, string]> = [
    ['DEMO-2026-0006', '2026-11-03T10:00:00Z', '2026-11-03T11:00:00Z', 'Salle 1'],
    ['DEMO-2026-0007', '2026-11-07T14:00:00Z', '2026-11-07T15:30:00Z', 'Salle 2'],
    ['DEMO-2026-0008', '2026-10-20T09:00:00Z', '2026-10-20T10:30:00Z', 'Salle 1'],
    ['DEMO-2026-0009', '2026-10-27T11:00:00Z', '2026-10-27T12:00:00Z', 'Salle 3'],
  ];

  for (const [ref, debut, fin, lieu] of appSeed) {
    appointments.push({
      id: `appt-${ref}`,
      dossier: ref,
      debut: new Date(debut).toISOString(),
      fin: new Date(fin).toISOString(),
      lieu,
      statut: 'Confirmé',
      tenantId: 'juridique-xceed',
      createdAt: new Date().toISOString(),
    });
  }

  return appointments;
}
