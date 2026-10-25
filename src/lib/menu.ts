// Menu par rôle.
// Structure : { id, label, items?: MenuItem[] }

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  subitems?: MenuItem[];
}

export interface RoleMenu {
  id: string;
  label: string;
  items: MenuItem[];
}

export const MENU_ADMIN: RoleMenu = {
  id: 'admin',
  label: 'Admin',
  items: [
    { id: 'dashboard', label: 'Tableau de bord', href: '/admin' },
    {
      id: 'dossiers',
      label: 'Dossiers',
      href: '/admin/dossiers',
      subitems: [
        { id: 'dossiers-constatations', label: 'Constatations', href: '/admin/dossiers?etape=constatation_recue' },
        { id: 'dossiers-analyse', label: 'Analyse', href: '/admin/dossiers?etape=analyse_gravite' },
        { id: 'dossiers-convocations', label: 'Convocations', href: '/admin/dossiers?etape=convocation_seance' },
        { id: 'dossiers-seances', label: 'Séances', href: '/admin/dossiers?etape=seance_presente' },
        { id: 'dossiers-decisions', label: 'Décisions', href: '/admin/dossiers?etape=decision_licenciement' },
        { id: 'dossiers-echelles', label: 'Échéances', href: '/admin/dossiers' },
        { id: 'dossiers-clos', label: 'Clos', href: '/admin/dossiers?etape=cloture' },
      ],
    },
    { id: 'presence', label: 'Présence', href: '/admin/présence' },
    { id: 'calendar', label: 'Calendrier', href: '/admin/calendrier' },
    { id: 'search', label: 'Recherche', href: '/admin/recherche' },
  ],
};

export const MENU_JURISTE: RoleMenu = {
  id: 'juriste',
  label: 'Juriste',
  items: [
    { id: 'dashboard', label: 'Tableau de bord', href: '/juriste' },
    {
      id: 'dossiers',
      label: 'Dossiers',
      href: '/juriste/dossiers',
      subitems: [
        { id: 'dossiers-atraiter', label: 'À traiter', href: '/juriste/dossiers?etape=constatation_recue' },
        { id: 'dossiers-analyse', label: 'Analyse', href: '/juriste/dossiers?etape=analyse_gravite' },
        { id: 'dossiers-convocations', label: 'Convocations', href: '/juriste/dossiers?etape=convocation_seance' },
        { id: 'dossiers-seances', label: 'Séances', href: '/juriste/dossiers?etape=seance_presente' },
        { id: 'dossiers-decisions', label: 'Décisions', href: '/juriste/dossiers?etape=decision_licenciement' },
      ],
    },
    { id: 'pointage', label: 'Pointage', href: '/juriste/pointage' },
    { id: 'calendar', label: 'Calendrier', href: '/juriste/calendrier' },
    { id: 'search', label: 'Recherche', href: '/juriste/recherche' },
  ],
};

export const MENU_ASSISTANT: RoleMenu = {
  id: 'assistant',
  label: 'Assistant',
  items: [
    { id: 'dashboard', label: 'Tableau de bord', href: '/assistant' },
    { id: 'reception', label: 'Réception', href: '/assistant/reception' },
    { id: 'scanner', label: 'Scanner', href: '/assistant/scanner' },
    { id: 'documents', label: 'Documents', href: '/assistant/documents' },
    { id: 'pointage', label: 'Pointage', href: '/assistant/pointage' },
  ],
};

export type Role = 'admin' | 'juriste' | 'assistant';

export function getMenu(role: Role): RoleMenu {
  switch (role) {
    case 'admin':
      return MENU_ADMIN;
    case 'juriste':
      return MENU_JURISTE;
    case 'assistant':
      return MENU_ASSISTANT;
  }
}
