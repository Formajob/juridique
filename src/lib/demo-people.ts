// Données de démonstration : personnes, départements, lobs.
// Seuls les libellés "Juriste 1", "Juriste 2", "Assistant 1", "Assistant 2",
// "Assistant 3" sont autorisés. Aucun nom réel, aucune adresse e-mail inventée.

import type { Department, Lob, Person } from '@/types/database';
import { DEMO_PERSONNES } from '@/types/database';

export const DEMO_PEOPLE: Person[] = DEMO_PERSONNES.map((p, i) => ({
  id: `person-${p.identifiant}`,
  identifiant: p.identifiant,
  nom: p.nom,
  email: null,
  role: p.role,
  actif: true,
  tenantId: 'juridique-xceed',
  createdAt: new Date(2026, 0, 1, 9, 0, 0).toISOString(),
}));

export const DEMO_DEPARTMENTS: Department[] = [
  { id: 'dep-VL', code: 'VL', label: 'VL', tenantId: 'juridique-xceed', createdAt: new Date().toISOString() },
  { id: 'dep-SAC', code: 'SAC', label: 'SAC', tenantId: 'juridique-xceed', createdAt: new Date().toISOString() },
  { id: 'dep-RET', code: 'RET', label: 'RET', tenantId: 'juridique-xceed', createdAt: new Date().toISOString() },
  { id: 'dep-STC', code: 'STC', label: 'STC', tenantId: 'juridique-xceed', createdAt: new Date().toISOString() },
  { id: 'dep-SAC-AFFAIRE', code: 'SAC_AFFAIRE', label: 'SAC Affaire', tenantId: 'juridique-xceed', createdAt: new Date().toISOString() },
  { id: 'dep-STC-AFFAIRE', code: 'STC_AFFAIRE', label: 'STC Affaire', tenantId: 'juridique-xceed', createdAt: new Date().toISOString() },
  { id: 'dep-PAV', code: 'PAV', label: 'PAV', tenantId: 'juridique-xceed', createdAt: new Date().toISOString() },
];

export const DEMO_LOBS: Lob[] = [
  { id: 'lob-GV', code: 'GV', label: 'GV', tenantId: 'juridique-xceed', createdAt: new Date().toISOString() },
  { id: 'lob-VL', code: 'VL', label: 'VL', tenantId: 'juridique-xceed', createdAt: new Date().toISOString() },
];

export { DEMO_PERSONNES };

// Points de présence pour le pointage
export const DEMO_POINTAGE_PERSONNES = [
  { id: 'person-juriste-1', nom: 'Juriste 1', identifiant: 'juriste-1', role: 'juriste' as const },
  { id: 'person-juriste-2', nom: 'Juriste 2', identifiant: 'juriste-2', role: 'juriste' as const },
  { id: 'person-assistant-1', nom: 'Assistant 1', identifiant: 'assistant-1', role: 'assistant' as const },
  { id: 'person-assistant-2', nom: 'Assistant 2', identifiant: 'assistant-2', role: 'assistant' as const },
  { id: 'person-assistant-3', nom: 'Assistant 3', identifiant: 'assistant-3', role: 'assistant' as const },
];

