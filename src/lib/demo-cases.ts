// Données de démonstration : dossiers fictifs.

import type { Case } from '@/types/database';

export const DEMO_WORKFLOW_STEPS = [
  { code: 'constatation_recue', label: 'Constatation recue' },
  { code: 'analyse_gravite', label: 'Analyse gravite' },
  { code: 'sanction_faute_non_grave', label: 'Sanction faute non grave' },
  { code: 'convocation_seance', label: 'Convocation seance' },
  { code: 'seance_presente', label: 'Seance presente' },
  { code: 'seance_absente', label: 'Seance absente' },
  { code: 'depot_inspection_absence', label: 'Depot inspection absence' },
  { code: 'investigations', label: 'Investigations' },
  { code: 'decision_licenciement', label: 'Decision licenciement' },
  { code: 'decision_mise_a_pied', label: 'Decision mise a pied' },
  { code: 'decision_sanction', label: 'Decision sanction' },
  { code: 'fin_procedure', label: 'Fin de procedure' },
  { code: 'cloture', label: 'Cloture' },
] as const;

export type DemoRef = 'DEMO-2026-0001' | 'DEMO-2026-0002' | 'DEMO-2026-0003' | 'DEMO-2026-0004' | 'DEMO-2026-0005' | 'DEMO-2026-0006' | 'DEMO-2026-0007' | 'DEMO-2026-0008' | 'DEMO-2026-0009' | 'DEMO-2026-0010' | 'DEMO-2026-0011';

function generateAffectationFixe(lob: string, department: string): Case['affectationFixe'] {
  return { lob, department } as Case['affectationFixe'];
}

export function createDemoCases(): Case[] {
  interface RawCase {
    ref: string;
    etape: string;
    statut: string;
    reception: boolean;
    agentId: string;
    juristeId: string | null;
    echeance: string | null;
  }

  const demoCases: RawCase[] = [
    // Constatations
    { ref: 'DEMO-2026-0001', etape: 'constatation_recue', statut: 'En cours', reception: true, agentId: 'person-juriste-1', juristeId: 'person-juriste-1', echeance: null },
    { ref: 'DEMO-2026-0002', etape: 'constatation_recue', statut: 'En cours', reception: true, agentId: 'person-juriste-2', juristeId: null, echeance: null },
    { ref: 'DEMO-2026-0003', etape: 'constatation_recue', statut: 'En cours', reception: true, agentId: 'person-juriste-1', juristeId: 'person-juriste-2', echeance: null },

    // Analyse
    { ref: 'DEMO-2026-0004', etape: 'analyse_gravite', statut: 'En cours', reception: true, agentId: 'person-juriste-2', juristeId: 'person-juriste-2', echeance: null },
    { ref: 'DEMO-2026-0005', etape: 'analyse_gravite', statut: 'En cours', reception: true, agentId: 'person-juriste-1', juristeId: 'person-juriste-1', echeance: null },

    // Convocations
    { ref: 'DEMO-2026-0006', etape: 'convocation_seance', statut: 'En attente', reception: true, agentId: 'person-juriste-1', juristeId: null, echeance: new Date(Date.now() + 3 * 86400000).toISOString() },
    { ref: 'DEMO-2026-0007', etape: 'convocation_seance', statut: 'En attente', reception: true, agentId: 'person-juriste-2', juristeId: 'person-juriste-2', echeance: new Date(Date.now() + 7 * 86400000).toISOString() },

    // Séances présentées
    { ref: 'DEMO-2026-0008', etape: 'seance_presente', statut: 'Terminé', reception: true, agentId: 'person-juriste-1', juristeId: 'person-juriste-1', echeance: null },
    { ref: 'DEMO-2026-0009', etape: 'seance_presente', statut: 'Terminé', reception: true, agentId: 'person-juriste-2', juristeId: 'person-juriste-2', echeance: null },

    // Séances absentes
    { ref: 'DEMO-2026-0010', etape: 'seance_absente', statut: 'En attente', reception: true, agentId: 'person-juriste-1', juristeId: null, echeance: new Date(Date.now() + 2 * 86400000).toISOString() },

    // Dépôt inspection absence
    { ref: 'DEMO-2026-0011', etape: 'depot_inspection_absence', statut: 'En cours', reception: true, agentId: 'person-juriste-2', juristeId: 'person-juriste-2', echeance: null },
  ];

  const cases: Case[] = [];
  for (const c of demoCases) {
    cases.push({
      id: `case-${c.ref}`,
      reference: c.ref,
      agentId: c.agentId,
      affectationFixe: generateAffectationFixe('VL', 'VL'),
      etape: c.etape,
      statut: c.statut,
      reception: c.reception,
      creePar: c.agentId,
      juristeId: c.juristeId,
      echeance: c.echeance,
      tenantId: 'juridique-xceed',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    });
  }

  return cases;
}

// Export pour les imports directs
export const DEMO_CASES = createDemoCases();

// ─── Données factices pour le calendrier ────────────────────────────────────

export interface DemoAppointment {
  id: string;
  dossier: string;
  debut: string;
  fin: string;
  lieu: string;
  statut: string;
}

export function createDemoAppointments(): DemoAppointment[] {
  const now = new Date();
  const appointments: DemoAppointment[] = [];

  const appSeed: Array<[string, string, string, string]> = [
    ['DEMO-2026-0006', '2026-11-03T10:00:00Z', '2026-11-03T11:00:00Z', 'Salle 1'],
    ['DEMO-2026-0007', '2026-11-07T14:00:00Z', '2026-11-07T15:30:00Z', 'Salle 2'],
    ['DEMO-2026-0008', '2026-10-20T09:00:00Z', '2026-10-20T10:30:00Z', 'Salle 1'],
    ['DEMO-2026-0009', '2026-10-27T11:00:00Z', '2026-10-27T12:00:00Z', 'Salle 3'],
  ];

  for (const [dossier, debut, fin, lieu] of appSeed) {
    appointments.push({
      id: `appt-${dossier}`,
      dossier,
      debut: new Date(debut).toISOString(),
      fin: new Date(fin).toISOString(),
      lieu,
      statut: 'Confirmé',
    });
  }

  return appointments;
}

