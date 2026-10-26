// Configuration des branches et transitions autorisées.

import type { WorkflowStep } from '@/types/database';

export interface BranchNode {
  code: string;
  label: string;
  action?: string;
}

export interface BranchConfig {
  from: string;
  steps: BranchNode[];
  transitions: string[];
}

export const BRANCHES: BranchConfig[] = [
  {
    from: 'constatation_recue',
    steps: [
      { code: 'analyse_gravite', label: 'Lancer l’analyse' },
    ],
    transitions: ['analyse_gravite'],
  },
  {
    from: 'analyse_gravite',
    steps: [
      { code: 'sanction_faute_non_grave', label: 'Faute non grave : sanction directe' },
      { code: 'convocation_seance', label: 'Faute grave : convocation' },
    ],
    transitions: ['sanction_faute_non_grave', 'convocation_seance'],
  },
  {
    from: 'sanction_faute_non_grave',
    steps: [
      { code: 'cloture', label: 'Clore la procédure' },
    ],
    transitions: ['cloture'],
  },
  {
    from: 'convocation_seance',
    steps: [
      { code: 'seance_presente', label: 'Agent présent' },
      { code: 'seance_absente', label: 'Agent absent' },
    ],
    transitions: ['seance_presente', 'seance_absente'],
  },
  {
    from: 'seance_presente',
    steps: [
      { code: 'pv_seance', label: 'PV établi, copie remise' },
    ],
    transitions: ['pv_seance'],
  },
  {
    from: 'pv_seance',
    steps: [
      { code: 'decision_licenciement', label: 'Faute grave : licenciement' },
      { code: 'decision_mise_a_pied', label: 'Faute grave : mise à pied' },
      { code: 'decision_sanction', label: 'Faute non grave : sanction' },
      { code: 'fin_procedure', label: 'Absence du fait' },
    ],
    transitions: ['decision_licenciement', 'decision_mise_a_pied', 'decision_sanction', 'fin_procedure'],
  },
  {
    from: 'seance_absente',
    steps: [
      { code: 'depot_inspection_absence', label: 'Déposer la poursuite à l’inspection' },
    ],
    transitions: ['depot_inspection_absence'],
  },
  {
    from: 'depot_inspection_absence',
    steps: [
      { code: 'investigations', label: 'Ouvrir les investigations' },
    ],
    transitions: ['investigations'],
  },
  {
    from: 'investigations',
    steps: [
      { code: 'decision_licenciement', label: 'Faute grave : licenciement' },
      { code: 'decision_mise_a_pied', label: 'Faute grave : mise à pied' },
      { code: 'decision_sanction', label: 'Faute non grave : sanction' },
      { code: 'fin_procedure', label: 'Absence du fait' },
    ],
    transitions: ['decision_licenciement', 'decision_mise_a_pied', 'decision_sanction', 'fin_procedure'],
  },
  {
    from: 'decision_licenciement',
    steps: [
      { code: 'notification_48h', label: 'Rappel des 48 heures' },
    ],
    transitions: ['notification_48h'],
  },
  {
    from: 'decision_mise_a_pied',
    steps: [
      { code: 'notification_48h', label: 'Rappel des 48 heures' },
    ],
    transitions: ['notification_48h'],
  },
  {
    from: 'notification_48h',
    steps: [
      { code: 'depot_inspection_decision', label: 'Dépôt de la procédure à l’inspection' },
    ],
    transitions: ['depot_inspection_decision'],
  },
  {
    from: 'depot_inspection_decision',
    steps: [
      { code: 'cloture', label: 'Clore la procédure' },
    ],
    transitions: ['cloture'],
  },
  {
    from: 'decision_sanction',
    steps: [
      { code: 'cloture', label: 'Clore la procédure' },
    ],
    transitions: ['cloture'],
  },
  {
    from: 'fin_procedure',
    steps: [
      { code: 'cloture', label: 'Clore la procédure' },
    ],
    transitions: ['cloture'],
  },
];
