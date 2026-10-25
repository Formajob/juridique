// Types de la base de données Juridique.

// ─── People ──────────────────────────────────────────────────────────────
export type Role =
  | 'agent'
  | 'tl'
  | 'spv'
  | 'sspv'
  | 'direction'
  | 'juriste'
  | 'assistant'
  | 'admin'
  | 'super_admin';

export interface Person {
  id: string;
  identifiant: string;
  nom: string;
  email: string | null;
  role: Role;
  actif: boolean;
  tenantId: string;
  createdAt: string;
}

// ─── Departments & Lobs ──────────────────────────────────────────────────
export interface Department {
  id: string;
  code: string;
  label: string;
  tenantId: string;
  createdAt: string;
}

export interface Lob {
  id: string;
  code: string;
  label: string;
  tenantId: string;
  createdAt: string;
}

// ─── Assignments ─────────────────────────────────────────────────────────
export interface Assignment {
  id: string;
  personneId: string;
  mois: string; // AAAA-MM
  lob: string;
  department: string | null;
  tl: string | null;
  sspv: string | null;
  tenantId: string;
  createdAt: string;
}

// ─── Workflow ────────────────────────────────────────────────────────────
export interface WorkflowStep {
  id: string;
  code: string;
  label: string;
  tenantId: string;
  createdAt: string;
}

export interface WorkflowTransition {
  id: string;
  fromStep: string;
  toStep: string;
  label: string;
  tenantId: string;
  createdAt: string;
}

// ─── Cases ──────────────────────────────────────────────────────────────
export interface CaseAffectionFixe {
  lob?: string;
  department?: string;
  tl?: string;
  sspv?: string;
  [key: string]: unknown;
}

export interface Case {
  id: string;
  reference: string; // unique, lisible
  agentId: string | null;
  agent?: Person;
  affectationFixe: CaseAffectionFixe;
  etape: string;
  statut: string;
  reception: boolean;
  creePar: string;
  juristeId: string | null;
  juriste?: Person;
  echeance: string | null;
  tenantId: string;
  createdAt: string;
}

export interface CaseEvent {
  id: string;
  dossier: string;
  etape: string;
  action: string;
  auteur: string;
  date: string;
  tenantId: string;
}

export interface Appointment {
  id: string;
  dossier: string;
  debut: string;
  fin: string;
  lieu: string;
  statut: string;
  tenantId: string;
  createdAt: string;
}

// ─── Notifications & QR ──────────────────────────────────────────────────
export interface NotificationTemplate {
  id: string;
  name: string;
  content: string;
  tenantId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  dossier: string;
  templateId: string | null;
  content: string;
  etat: string;
  cree: string;
  tenantId: string;
}

export interface QrToken {
  id: string;
  dossier: string;
  jeton: string;
  expiration: string;
  tenantId: string;
  createdAt: string;
}

// ─── Pointage ────────────────────────────────────────────────────────────
export interface PointageShift {
  id: string;
  utilisateurId: string;
  utilisateur?: Person;
  statut: string;
  debut: string;
  fin: string | null;
  total: string | null; // ISO interval
  tenantId: string;
  createdAt: string;
}

export interface PointageEntry {
  id: string;
  shiftId: string;
  statut: string;
  date: string;
  tenantId: string;
  createdAt: string;
}

// ─── Demo ────────────────────────────────────────────────────────────────
export const DEMO_CLIENT_TENANT = 'juridique-xceed';

export const DEMO_PERSONNES = [
  { identifiant: 'juriste-1', nom: 'Juriste 1', role: 'juriste' as Role },
  { identifiant: 'juriste-2', nom: 'Juriste 2', role: 'juriste' as Role },
  { identifiant: 'assistant-1', nom: 'Assistant 1', role: 'assistant' as Role },
  { identifiant: 'assistant-2', nom: 'Assistant 2', role: 'assistant' as Role },
  { identifiant: 'assistant-3', nom: 'Assistant 3', role: 'assistant' as Role },
] as const;

export type DemoPersonne = (typeof DEMO_PERSONNES)[number];

// Vannes fictives pour les dossiers DEMO
export const DEMO_REFS = [
  'DEMO-2026-0001',
  'DEMO-2026-0002',
  'DEMO-2026-0003',
  'DEMO-2026-0004',
  'DEMO-2026-0005',
  'DEMO-2026-0006',
  'DEMO-2026-0007',
  'DEMO-2026-0008',
  'DEMO-2026-0009',
  'DEMO-2026-0010',
] as const;

export type DemoRef = (typeof DEMO_REFS)[number];
