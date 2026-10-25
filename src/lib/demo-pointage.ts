// Données de démonstration : pointage (5 places).
// Un seul statut actif simultanément, un minuteur, le départ.

import type { PointageEntry, PointageShift } from '@/types/database';
import { DEMO_POINTAGE_PERSONNES } from './demo-people';

export function createDemoTodayPointage(): PointageShift[] {
  const now = new Date();
  const shiftStart = new Date(now);
  shiftStart.setHours(8, 0, 0, 0);

  const shifts: PointageShift[] = [];
  const pids = DEMO_POINTAGE_PERSONNES.map(p => p.identifiant);

  for (let i = 0; i < DEMO_POINTAGE_PERSONNES.length; i++) {
    const personne = DEMO_POINTAGE_PERSONNES[i];
    const isActif = i < 3;
    const id = `shift-${pids[i]}`;

    const shift: PointageShift = {
      id,
      utilisateurId: personne.id,
      utilisateur: { id: personne.id, identifiant: personne.identifiant, nom: personne.nom, email: null, role: personne.role, actif: true, tenantId: 'juridique-xceed', createdAt: new Date().toISOString() },
      statut: isActif ? 'shift' : 'absent',
      debut: shiftStart.toISOString(),
      fin: null,
      total: null,
      tenantId: 'juridique-xceed',
      createdAt: shiftStart.toISOString(),
    };

    const e = (statut: string, idx: number, ms: number): PointageEntry => ({
      id: `${id}-${idx}`,
      shiftId: id,
      statut,
      date: new Date(shiftStart.getTime() + ms).toISOString(),
      tenantId: 'juridique-xceed',
      createdAt: new Date().toISOString(),
    });

    const entries: PointageEntry[] = [];
    if (i === 0) {
      entries.push(e('shift', 1, 0));
    } else if (i === 1) {
      const p1 = 10 * 3600000 + 1800000;
      const p2 = 11 * 3600000;
      entries.push(e('shift', 1, 0));
      entries.push(e('pause', 2, p1));
      entries.push(e('pause', 3, p2));
      entries.push(e('shift', 4, p2 + 3600000));
    } else if (i === 2) {
      const l1 = 12 * 3600000;
      const l2 = 13 * 3600000;
      entries.push(e('shift', 1, 0));
      entries.push(e('lunch', 2, l1));
      entries.push(e('lunch', 3, l2));
      entries.push(e('shift', 4, l2 + 3600000));
    } else if (i === 3) {
      const f1 = 14 * 3600000;
      const f2 = 16 * 3600000;
      entries.push(e('shift', 1, 0));
      entries.push(e('formation', 2, f1));
      entries.push(e('formation', 3, f2));
      entries.push(e('shift', 4, f2 + 3600000));
    } else {
      const r1 = 15 * 3600000;
      const r2 = 16 * 3600000;
      entries.push(e('shift', 1, 0));
      entries.push(e('rencontre', 2, r1));
      entries.push(e('rencontre', 3, r2));
      entries.push(e('shift', 4, r2 + 3600000));
    }

    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    (shift as any).entries = entries;
    shifts.push(shift);
  }

  return shifts;
}

export const DEMO_POINTAGE_EST_DEPART = {
  'juriste-1': true,
  'juriste-2': false,
  'assistant-1': true,
  'assistant-2': false,
  'assistant-3': false,
} as const;
