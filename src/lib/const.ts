// Constantes communes à l'application.

export const APP_TITLE = 'ACX Flow';
export const APP_SUBTITLE = 'ACX Maroc';

export const DEMO_LABEL = 'Démo';

export const ROLES = {
  ADMIN: 'admin',
  JURISTE: 'juriste',
  ASSISTANT: 'assistant',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLES_LABELS: Record<Role, string> = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.JURISTE]: 'Juriste',
  [ROLES.ASSISTANT]: 'Assistant',
};

export const ROLES_DESCRIPTION: Record<Role, string> = {
  [ROLES.ADMIN]:
    'Responsable du département. Il voit le flux des dossiers et la présence de l\'équipe.',
  [ROLES.JURISTE]:
    'Il traite les dossiers et pointe. Deux places : Juriste 1, Juriste 2.',
  [ROLES.ASSISTANT]:
    'Il réceptionne, note la remise et la réception des documents, et scanne le QR d\'un rendez-vous. Trois places : Assistant 1, Assistant 2, Assistant 3.',
};

// ─── Unités de pointage (8 statuts) ──────────────────────────────────────────

export interface PointageStatutOptions {
  id: string;
  label: string;
  short: string;
  default: boolean;
}

export const POINTAGE_STATUTS: PointageStatutOptions[] = [
  { id: 'shift', label: 'Shift', short: 'Shift', default: true },
  { id: 'pause', label: 'Pause', short: 'Pause', default: false },
  { id: 'lunch', label: 'Lunch', short: 'Lunch', default: false },
  { id: 'meeting', label: 'Réunion', short: 'Réunion', default: false },
  { id: 'rencontre', label: 'Rencontre', short: 'Rencontre', default: false },
  { id: 'formation', label: 'Formation', short: 'Formation', default: false },
  { id: 'absent', label: 'Absent', short: 'Absent', default: false },
  { id: 'conge', label: 'Congé', short: 'Congé', default: false },
];

// ─── Délais de la procédure ──────────────────────────────────────────────────

export const DELAIS_DAYS_RECEPTION = 8; // jours après réception pour l'analyse
export const DELAIS_DAYS_CONVOCATION = 8; // jours après convocation
export const DELAIS_HOURS_NOTIFICATION = 48; // heures après décision

// ─── Inférence des droits et affichages par rôle (néxt pas) ─────────────────

export const DEMO_DEPARTMENTS = [
  'VL',
  'SAC',
  'RET',
  'STC',
  'SAC_AFFAIRE',
  'STC_AFFAIRE',
  'PAV',
] as const;

export type Department = (typeof DEMO_DEPARTMENTS)[number];

export const DEMO_LOBS = ['GV', 'VL'] as const;

export type Lob = (typeof DEMO_LOBS)[number];

export const DEMO_PERSONNES = [
  { identifiant: 'juriste-1', role: 'juriste', label: 'Juriste 1' },
  { identifiant: 'juriste-2', role: 'juriste', label: 'Juriste 2' },
  { identifiant: 'assistant-1', role: 'assistant', label: 'Assistant 1' },
  { identifiant: 'assistant-2', role: 'assistant', label: 'Assistant 2' },
  { identifiant: 'assistant-3', role: 'assistant', label: 'Assistant 3' },
] as const;

export type PersonneDemo = (typeof DEMO_PERSONNES)[number];