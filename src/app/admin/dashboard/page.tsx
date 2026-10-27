'use client';

import { useState } from 'react';

type Status = 'delai' | 'retard' | 'attente' | 'clos';
type StepState = 'past' | 'now' | 'next';
interface StepNode { t: string; s: StepState; }
interface CaseItem { ref: string; lob: string; agent: string; group: string; step: string; statut: Status; echeance: string; kind: string; due: boolean; late: boolean; path: StepNode[]; next: string[]; }
interface Group { id: string; label: string; stock: boolean; }
interface PersonObj { name: string; tag: string; time: string; color: string; bg: string; }
const GROUPS: Group[] = [
  { id: 'constatations', label: 'Constatations', stock: true },
  { id: 'analyse', label: 'Analyse', stock: true },
  { id: 'convocations', label: 'Convocations', stock: true },
  { id: 'seances', label: 'Séances', stock: true },
  { id: 'decisions', label: 'Décisions', stock: true },
  { id: 'clos', label: 'Clos', stock: true },
  { id: 'echeances', label: 'Échéances', stock: false }
];
const CASES: CaseItem[] = [
  { ref: 'JUR-2026-021', lob: 'GV', agent: 'AGT-1048', group: 'constatations', step: 'Constatation reçue', statut: 'delai', echeance: 'Aujourd\'hui · 26 oct. 2026', kind: '8 jours après la réception', due: true, late: false, path: [{ t: 'Constatation reçue', s: 'now' }], next: ['Lancer l\'analyse'] },
  { ref: 'JUR-2026-022', lob: 'VL', agent: 'AGT-2210', group: 'constatations', step: 'Constatation reçue', statut: 'delai', echeance: '3 nov. 2026', kind: '8 jours après la réception', due: false, late: false, path: [{ t: 'Constatation reçue', s: 'now' }], next: ['Lancer l\'analyse'] },
  { ref: 'JUR-2026-019', lob: 'GV', agent: 'AGT-1188', group: 'constatations', step: 'Constatation reçue', statut: 'retard', echeance: 'Dépassée le 18 oct. 2026', kind: '8 jours après la réception', due: true, late: true, path: [{ t: 'Constatation reçue', s: 'now' }], next: ['Lancer l\'analyse'] },
  { ref: 'JUR-2026-016', lob: 'VL', agent: 'AGT-2401', group: 'analyse', step: 'Analyse', statut: 'delai', echeance: '30 oct. 2026', kind: '8 jours après la réception', due: false, late: false, path: [{ t: 'Constatation reçue', s: 'past' }, { t: 'Analyse', s: 'now' }], next: ['Faute non grave : sanction directe', 'Faute grave : convocation'] },
  { ref: 'JUR-2026-014', lob: 'GV', agent: 'AGT-1760', group: 'analyse', step: 'Analyse', statut: 'retard', echeance: 'Dépassée le 19 oct. 2026', kind: '8 jours après la réception', due: true, late: true, path: [{ t: 'Constatation reçue', s: 'past' }, { t: 'Analyse', s: 'now' }], next: ['Faute non grave : sanction directe', 'Faute grave : convocation'] },
  { ref: 'JUR-2026-017', lob: 'VL', agent: 'AGT-3092', group: 'analyse', step: 'Analyse', statut: 'delai', echeance: '2 nov. 2026', kind: '8 jours après la réception', due: false, late: false, path: [{ t: 'Constatation reçue', s: 'past' }, { t: 'Analyse', s: 'now' }], next: ['Faute non grave : sanction directe', 'Faute grave : convocation'] },
  { ref: 'JUR-2026-011', lob: 'GV', agent: 'AGT-1884', group: 'convocations', step: 'Convocation', statut: 'delai', echeance: '2 nov. 2026', kind: '8 jours après la convocation', due: false, late: false, path: [{ t: 'Constatation reçue', s: 'past' }, { t: 'Analyse', s: 'past' }, { t: 'Convocation', s: 'now' }], next: ['Présent', 'Absent'] },
  { ref: 'JUR-2026-009', lob: 'VL', agent: 'AGT-1420', group: 'convocations', step: 'Convocation', statut: 'retard', echeance: 'Dépassée le 21 oct. 2026', kind: '8 jours après la convocation', due: true, late: true, path: [{ t: 'Constatation reçue', s: 'past' }, { t: 'Analyse', s: 'past' }, { t: 'Convocation', s: 'now' }], next: ['Présent', 'Absent'] },
  { ref: 'JUR-2026-008', lob: 'GV', agent: 'AGT-2011', group: 'seances', step: 'Séance présente', statut: 'attente', echeance: 'Pas d\'échéance', kind: '', due: false, late: false, path: [{ t: 'Convocation', s: 'past' }, { t: 'Séance présente', s: 'now' }], next: ['Noter le PV remis'] },
  { ref: 'JUR-2026-006', lob: 'VL', agent: 'AGT-2774', group: 'seances', step: 'PV de séance', statut: 'attente', echeance: 'Pas d\'échéance', kind: '', due: false, late: false, path: [{ t: 'Séance présente', s: 'past' }, { t: 'PV de séance', s: 'now' }], next: ['Licenciement', 'Mise à pied', 'Sanction', 'Absence du fait'] },
  { ref: 'JUR-2026-010', lob: 'GV', agent: 'AGT-1333', group: 'seances', step: 'Agent absent', statut: 'attente', echeance: 'Pas d\'échéance', kind: '', due: false, late: false, path: [{ t: 'Convocation', s: 'past' }, { t: 'Agent absent', s: 'now' }], next: ['Déposer à l\'inspection'] },
  { ref: 'JUR-2026-012', lob: 'VL', agent: 'AGT-1555', group: 'decisions', step: 'Sanction directe', statut: 'attente', echeance: 'Pas d\'inspection', kind: '', due: false, late: false, path: [{ t: 'Analyse', s: 'past' }, { t: 'Sanction directe', s: 'now' }], next: ['Clore'] },
  { ref: 'JUR-2026-005', lob: 'VL', agent: 'AGT-1902', group: 'decisions', step: 'Investigations', statut: 'attente', echeance: 'Pas d\'échéance', kind: '', due: false, late: false, path: [{ t: 'Agent absent', s: 'past' }, { t: 'Dépôt inspection', s: 'past' }, { t: 'Investigations', s: 'now' }], next: ['Licenciement', 'Mise à pied', 'Sanction', 'Absence du fait'] },
  { ref: 'JUR-2026-004', lob: 'GV', agent: 'AGT-1666', group: 'decisions', step: 'Licenciement', statut: 'attente', echeance: '48 h non ouvertes', kind: '', due: false, late: false, path: [{ t: 'PV de séance', s: 'past' }, { t: 'Licenciement', s: 'now' }], next: ['Rappel des 48 heures'] },
  { ref: 'JUR-2026-002', lob: 'GV', agent: 'AGT-2508', group: 'decisions', step: 'Sanction', statut: 'attente', echeance: 'Pas d\'inspection', kind: '', due: false, late: false, path: [{ t: 'PV de séance', s: 'past' }, { t: 'Sanction', s: 'now' }], next: ['Clore'] },
  { ref: 'JUR-2026-003', lob: 'VL', agent: 'AGT-1212', group: 'decisions', step: 'Rappel 48 h', statut: 'retard', echeance: '48 h dépassées le 24 oct. 2026', kind: '48 heures', due: true, late: true, path: [{ t: 'Licenciement', s: 'past' }, { t: 'Rappel 48 h', s: 'now' }], next: ['Dépôt à l\'inspection'] },
  { ref: 'JUR-2026-001', lob: 'VL', agent: 'AGT-1102', group: 'clos', step: 'Clos', statut: 'clos', echeance: 'Aucune branche', kind: '', due: false, late: false, path: [{ t: 'Sanction directe', s: 'past' }, { t: 'Clos', s: 'now' }], next: [] },
  { ref: 'JUR-2026-000', lob: 'GV', agent: 'AGT-2044', group: 'clos', step: 'Clos', statut: 'clos', echeance: 'Aucune branche', kind: '', due: false, late: false, path: [{ t: 'Absence du fait', s: 'past' }, { t: 'Clos', s: 'now' }], next: [] },
  { ref: 'JUR-2025-088', lob: 'VL', agent: 'AGT-1730', group: 'clos', step: 'Clos', statut: 'clos', echeance: 'Aucune branche', kind: '', due: false, late: false, path: [{ t: 'Mise à pied', s: 'past' }, { t: 'Rappel 48 h', s: 'past' }, { t: 'Dépôt inspection', s: 'past' }, { t: 'Clos', s: 'now' }], next: [] }
];
const PEOPLE: PersonObj[] = [
  { name: 'Juriste 1', tag: 'Shift', time: '2 h 14', color: '#4f46e5', bg: '#eef2ff' },
  { name: 'Juriste 2', tag: 'Réunion', time: '18 min', color: '#2563eb', bg: '#eff6ff' },
  { name: 'Assistant 1', tag: 'Pause', time: '12 min', color: '#d97706', bg: '#fffbeb' },
  { name: 'Assistant 2', tag: 'Shift', time: '3 h 02', color: '#4f46e5', bg: '#eef2ff' },
  { name: 'Assistant 3', tag: 'Absent', time: 'Depuis 9 h 02', color: '#b42318', bg: '#fdeceb' }
];
const STATUS: Record<Status, [string, string]> = {
  delai: ['ok', 'Dans le délai'], retard: ['bad', 'En retard'], attente: ['wait', 'En attente'], clos: ['mute', 'Clos']
};
function inGroup(c: CaseItem, id: string): boolean {
  if (id === 'echeances') return c.due;
  return c.group === id;
}
function countGroup(id: string): number { return CASES.filter(c => inGroup(c, id)).length; }
