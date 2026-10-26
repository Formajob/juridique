// Libellés et regroupements pour le workflow.

export const ETAPE_LABELS: Record<string, string> = {
  constatation_recue: 'Constatation reçue',
  analyse_gravite: 'Analyse',
  sanction_faute_non_grave: 'Sanction faute non grave',
  convocation_seance: 'Convocation',
  seance_presente: 'Séance présente',
  seance_absente: 'Séance absente',
  pv_seance: 'PV de séance',
  depot_inspection_absence: 'Dépôt inspection (absence)',
  investigations: 'Investigations',
  decision_licenciement: 'Décision licenciement',
  decision_mise_a_pied: 'Décision mise à pied',
  decision_sanction: 'Décision sanction',
  fin_procedure: 'Fin de procédure',
  notification_48h: 'Notification 48h',
  depot_inspection_decision: 'Dépôt inspection (décision)',
  cloture: 'Clos',
};

export function etapePageGroup(etapeQuery: string | null): string[] {
  switch (etapeQuery) {
    case 'constatation_recue':
      return ['constatation_recue'];
    case 'analyse_gravite':
      return ['analyse_gravite'];
    case 'convocation_seance':
      return ['convocation_seance'];
    case 'seance_presente':
      return ['seance_presente', 'seance_absente', 'pv_seance'];
    case 'decision_licenciement':
      return [
        'decision_licenciement',
        'decision_mise_a_pied',
        'decision_sanction',
        'fin_procedure',
        'notification_48h',
        'depot_inspection_decision',
        'depot_inspection_absence',
        'investigations',
        'sanction_faute_non_grave',
        'pv_seance',
      ];
    case 'cloture':
      return ['cloture'];
    default:
      return [];
  }
}

export function isClosed(etape: string) {
  return etape === 'cloture';
}

export function pageTitleFor(etapeQuery: string | null, role: 'admin' | 'juriste') {
  switch (etapeQuery) {
    case 'constatation_recue':
      return role === 'juriste' ? 'À traiter' : 'Constatations';
    case 'analyse_gravite':
      return 'Analyse';
    case 'convocation_seance':
      return 'Convocations';
    case 'seance_presente':
      return 'Séances';
    case 'decision_licenciement':
      return 'Décisions';
    case 'cloture':
      return 'Clos';
    default:
      return 'Dossiers';
  }
}

export const PROCESS_ORDER: string[] = [
  'constatation_recue',
  'analyse_gravite',
  'sanction_faute_non_grave',
  'convocation_seance',
  'seance_presente',
  'pv_seance',
  'seance_absente',
  'depot_inspection_absence',
  'investigations',
  'decision_licenciement',
  'decision_mise_a_pied',
  'decision_sanction',
  'fin_procedure',
  'notification_48h',
  'depot_inspection_decision',
  'cloture',
];
