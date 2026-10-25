// Utils de formatage.

export function formatDateFr(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getDate()}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatDateTimeFr(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${formatDateFr(d)}`;
}

export function formatDistanceFr(date: string | Date): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `échu il y a ${-diffDays} j`;
  if (diffDays === 0) return 'aujourd\'hui';
  if (diffDays === 1) return 'demain';
  return `dans ${diffDays} j`;
}

export function formatDurationFr(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}min`;
  return `${m}min`;
}

export function formatDurationIso(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const ms = iso === '00:00:00' ? 0 : Date.parse(iso);
  if (isNaN(ms)) return null;
  return formatDurationFr(ms / 1000);
}

// Statut de pointage -> texte lisible
export function pointageStatutLabel(statut: string): string {
  const labels: Record<string, string> = {
    shift: 'Shift',
    pause: 'Pause',
    lunch: 'Lunch',
    meeting: 'Réunion',
    rencontre: 'Rencontre',
    formation: 'Formation',
    absent: 'Absent',
    conge: 'Congé',
  };
  return labels[statut] || statut;
}

export function pointageStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    shift: 'var(--cyan)',
    pause: 'var(--violet)',
    lunch: 'var(--cyan-fonce)',
    meeting: '#b8860b',
    rencontre: '#6a2a8c',
    formation: '#2a5a8c',
    absent: '#999',
    conge: '#8a6a00',
  };
  return colors[statut] || 'var(--texte-secondaire)';
}
