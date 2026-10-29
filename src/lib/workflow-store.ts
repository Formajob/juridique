// Store client partagé pour le workflow juridique.
// Persisté en localStorage pour que les passages d'un onglet à l'autre
// mettent à jour le même dossier.

import type { Case, CaseEvent, Appointment } from '@/types/database';
import { createDemoDashboardData } from '@/lib/demo-dashboard';
import { createDemoCaseEvents, createDemoAppointments } from '@/lib/demo-events';

const STORAGE_KEY = 'juridique-workflow-store-v1';

export interface WorkflowStore {
  cases: Case[];
  events: CaseEvent[];
  appointments: Appointment[];
}

function seed(): WorkflowStore {
  return {
    cases: createDemoDashboardData(),
    events: createDemoCaseEvents(),
    appointments: createDemoAppointments(),
  };
}

let state: WorkflowStore | null = null;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== 'undefined';
}

function load(): WorkflowStore {
  if (!isBrowser()) return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WorkflowStore;
      if (parsed && Array.isArray(parsed.cases)) return parsed;
    }
  } catch {
    // ignore
  }
  const s = seed();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
  return s;
}

function save(s: WorkflowStore) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function getWorkflowState(): WorkflowStore {
  if (!state) state = load();
  return state;
}

export function subscribeWorkflow(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setWorkflowState(next: WorkflowStore) {
  state = next;
  save(state);
  listeners.forEach((l) => l());
}

export function resetWorkflowStore() {
  const s = seed();
  state = s;
  save(s);
  listeners.forEach((l) => l());
}

function computeEcheance(step: string): string | null | undefined {
  const now = Date.now();
  switch (step) {
    case 'constatation_recue':
      return new Date(now + 8 * 86400000).toISOString();
    case 'decision_licenciement':
    case 'decision_mise_a_pied':
      return new Date(now + 48 * 3600000).toISOString();
    case 'analyse_gravite':
      return new Date(now + 8 * 86400000).toISOString();
    case 'convocation_seance':
      return new Date(now + 8 * 86400000).toISOString();
    case 'notification_48h':
      return new Date(now + 48 * 3600000).toISOString();
    case 'cloture':
      return null;
    default:
      return undefined;
  }
}

export function transitionCase(ref: string, toStep: string, action: string, origin: string) {
  const s = getWorkflowState();
  const idx = s.cases.findIndex((c) => c.reference === ref);
  if (idx < 0) return;
  const c = s.cases[idx];
  const echeance = computeEcheance(toStep);
  const updated: Case = {
    ...c,
    etape: toStep,
    statut: toStep === 'cloture' ? 'Clos' : c.statut,
    echeance: echeance === undefined ? c.echeance : echeance,
    notifie: c.notifie,
  };
  const newCases = [...s.cases];
  newCases[idx] = updated;

  const evt: CaseEvent = {
    id: `evt-${ref}-${Date.now()}`,
    dossier: ref,
    etape: toStep,
    action: `${action} (${origin})`,
    auteur: 'Juriste',
    date: new Date().toISOString(),
    tenantId: c.tenantId,
  };

  let appointments = s.appointments;
  if (toStep === 'convocation_seance') {
    appointments = [
      ...appointments,
      {
        id: `appt-${ref}-${Date.now()}`,
        dossier: ref,
        debut: new Date(Date.now() + 3 * 86400000).toISOString(),
        fin: new Date(Date.now() + 3 * 86400000 + 3600000).toISOString(),
        lieu: 'Salle 1',
        statut: 'Confirmé',
        tenantId: c.tenantId,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  setWorkflowState({ cases: newCases, events: [evt, ...s.events], appointments });
}

export function createCase(input: Partial<Case> & { reference?: string }): Case {
  const s = getWorkflowState();
  const trimmedRef = input.reference?.trim();
  const nextNumber = s.cases.reduce((max, c) => {
    const match = c.reference.match(/(\d+)\s*$/);
    const n = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, n);
  }, 0) + 1;
  const reference = trimmedRef || `DEMO-2026-${String(nextNumber).padStart(4, '0')}`;
  const etape = input.etape || 'constatation_recue';
  const echeance =
    input.echeance === undefined
      ? (computeEcheance(etape) ?? null)
      : input.echeance;
  const newCase: Case = {
    id: `case-${reference}-${Date.now()}`,
    reference,
    agentId: input.agentId ?? null,
    affectationFixe: input.affectationFixe || { lob: 'VL', department: 'VL' },
    etape,
    statut: input.statut || (etape === 'cloture' ? 'Clos' : 'En cours'),
    reception: input.reception ?? false,
    notifie: false,
    creePar: input.creePar || 'Saisie',
    juristeId: input.juristeId ?? null,
    echeance,
    tenantId: input.tenantId || 'juridique-xceed',
    createdAt: new Date().toISOString(),
  };

  const evt: CaseEvent = {
    id: `evt-${reference}-${Date.now()}`,
    dossier: reference,
    etape,
    action: 'Dossier saisi',
    auteur: newCase.creePar,
    date: new Date().toISOString(),
    tenantId: newCase.tenantId,
  };

  setWorkflowState({
    cases: [newCase, ...s.cases],
    events: [evt, ...s.events],
    appointments: s.appointments,
  });

  return newCase;
}

export function markAsRead(ref: string) {
  const s = getWorkflowState();
  const caseIdx = s.cases.findIndex((c) => c.reference === ref);
  if (caseIdx < 0) return;
  const updated = {
    ...s.cases[caseIdx],
    notifie: true,
  };
  const newCases = [...s.cases];
  newCases[caseIdx] = updated;
  setWorkflowState({ ...s, cases: newCases });
}
export function noteDocument(ref: string, action: string) {
  const s = getWorkflowState();
  const c = s.cases.find((x) => x.reference === ref);
  const evt: CaseEvent = {
    id: `evt-${ref}-${Date.now()}`,
    dossier: ref,
    etape: c?.etape || '',
    action: `${action} (Documents)`,
    auteur: 'Assistant',
    date: new Date().toISOString(),
    tenantId: c?.tenantId || 'juridique-xceed',
  };
  setWorkflowState({ ...s, events: [evt, ...s.events] });
}
