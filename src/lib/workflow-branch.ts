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
      { code: 'analyse_gravite', label: 'Analyser la gravité' },
    ],
    transitions: ['analyse_gravite'],
  },
  {
    from: 'analyse_gravite',
    steps: [
      { code: 'sanction_faute_non_grave', label: 'Sanction pour faute non grave' },
      { code: 'convocation_seance', label: 'Convocation à la séance' },
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
      { code: 'seance_presente', label: 'Séance présente' },
      { code: 'seance_absente', label: 'Séance absente' },
    ],
    transitions: ['seance_presente', 'seance_absente'],
  },
  {
    from: 'seance_presente',
    steps: [
      { code: 'pv_seance', label: 'Établir le PV' },
    ],
    transitions: ['pv_seance'],
  },
  {
    from: 'pv_seance',
    steps: [
      { code: 'decision_licenciement', label: 'Licenciement' },
      { code: 'decision_mise_a_pied', label: 'Mise à pied' },
      { code: 'decision_sanction', label: 'Sanction' },
      { code: 'fin_procedure', label: 'Fin de procédure' },
    ],
    transitions: ['decision_licenciement', 'decision_mise_a_pied', 'decision_sanction', 'fin_procedure'],
  },
  {
    from: 'seance_absente',
    steps: [
      { code: 'depot_inspection_absence', label: 'Dépôt de l\'inspection d\'absence' },
    ],
    transitions: ['depot_inspection_absence'],
  },
  {
    from: 'depot_inspection_absence',
    steps: [
      { code: 'investigations', label: 'Investigations' },
    ],
    transitions: ['investigations'],
  },
  {
    from: 'investigations',
    steps: [
      { code: 'decision_licenciement', label: 'Licenciement' },
      { code: 'decision_mise_a_pied', label: 'Mise à pied' },
      { code: 'decision_sanction', label: 'Sanction' },
      { code: 'fin_procedure', label: 'Fin de procédure' },
    ],
    transitions: ['decision_licenciement', 'decision_mise_a_pied', 'decision_sanction', 'fin_procedure'],
  },
  {
    from: 'decision_licenciement',
    steps: [
      { code: 'notification_48h', label: 'Notification 48h' },
    ],
    transitions: ['notification_48h'],
  },
  {
    from: 'decision_mise_a_pied',
    steps: [
      { code: 'notification_48h', label: 'Notification 48h' },
    ],
    transitions: ['notification_48h'],
  },
  {
    from: 'notification_48h',
    steps: [
      { code: 'depot_inspection_decision', label: 'Dépôt de l\'inspection de décision' },
    ],
    transitions: ['depot_inspection_decision'],
  },
  {
    from: 'depot_inspection_decision',
    steps: [
      { code: 'cloture', label: 'Clôturer' },
    ],
    transitions: ['cloture'],
  },
  {
    from: 'decision_sanction',
    steps: [
      { code: 'cloture', label: 'Clôturer' },
    ],
    transitions: ['cloture'],
  },
  {
    from: 'fin_procedure',
    steps: [
      { code: 'cloture', label: 'Clôturer' },
    ],
    transitions: ['cloture'],
  },
];
