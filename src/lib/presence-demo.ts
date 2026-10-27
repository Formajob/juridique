/**
 * Remplace / ajoute src/lib/presence-demo.ts
 * Présence démo des 5 places. Aucun nom réel, aucune donnée VD.
 */

export type TagId = 'shift' | 'pause' | 'lunch' | 'meeting' | 'rencontre' | 'formation' | 'absent' | 'conge';
export type Discharge = 'objectif' | 'urgence';

export interface PersonPlace {
  id: string;
  nom: string;
  role: 'juriste' | 'assistant';
}

export interface TagDef {
  id: TagId;
  label: string;
  color: string;
  bg: string;
  limitSec: number | null;
  minimum: boolean;
}

export interface Segment {
  id: string;
  personId: string;
  tag: TagId;
  start: string;
  end: string | null;
  trace: { at: string; author: string; from: TagId; to: TagId }[];
}

export interface Departure {
  personId: string;
  day: string;
  at: string;
  discharge: Discharge;
  gapMin: number | null;
}

export interface RapportRow {
  personId: string;
  nom: string;
  day: string;
  seconds: Record<TagId, number>;
  alerts: string[];
}

export interface PresenceState {
  segments: Segment[];
  departures: Departure[];
  savedMonths: Record<string, { savedAt: string; rows: RapportRow[] }>;
}

export const PEOPLE: PersonPlace[] = [
  { id: 'person-juriste-1', nom: 'Juriste 1', role: 'juriste' },
  { id: 'person-juriste-2', nom: 'Juriste 2', role: 'juriste' },
  { id: 'person-assistant-1', nom: 'Assistant 1', role: 'assistant' },
  { id: 'person-assistant-2', nom: 'Assistant 2', role: 'assistant' },
  { id: 'person-assistant-3', nom: 'Assistant 3', role: 'assistant' },
];

export const TAGS: TagDef[] = [
  { id: 'shift', label: 'Shift', color: '#4f46e5', bg: '#eef2ff', limitSec: 7.5 * 3600, minimum: true },
  { id: 'pause', label: 'Pause', color: '#d97706', bg: '#fffbeb', limitSec: 30 * 60, minimum: false },
  { id: 'lunch', label: 'Lunch', color: '#ea580c', bg: '#fff7ed', limitSec: 60 * 60, minimum: false },
  { id: 'meeting', label: 'Réunion', color: '#2563eb', bg: '#eff6ff', limitSec: 60 * 60, minimum: false },
  { id: 'rencontre', label: 'Rencontre', color: '#7c3aed', bg: '#f5f3ff', limitSec: 60 * 60, minimum: false },
  { id: 'formation', label: 'Formation', color: '#059669', bg: '#ecfdf5', limitSec: 60 * 60, minimum: false },
  { id: 'absent', label: 'Absent', color: '#b42318', bg: '#fdeceb', limitSec: null, minimum: false },
  { id: 'conge', label: 'Congé', color: '#0f766e', bg: '#f0fdfa', limitSec: null, minimum: false },
];

const KEY = 'juridique-presence-v1';
const listeners = new Set<() => void>();
let memory: PresenceState | null = null;

export function tagOf(id: string) {
  return TAGS.find((t) => t.id === id) || TAGS[0];
}

export function dayKey(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function monthKey(d = new Date()) {
  return dayKey(d).slice(0, 7);
}

export function formatClock(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function formatHm(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
}

function atHour(day: string, h: number, min = 0) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0).toISOString();
}

function seed(): PresenceState {
  const day = dayKey();
  const seg = (personId: string, tag: TagId, start: string, end: string | null, n: number): Segment => ({
    id: `seed-${personId}-${n}`,
    personId,
    tag,
    start,
    end,
    trace: [],
  });
  return {
    segments: [
      seg('person-juriste-1', 'shift', atHour(day, 8), null, 1),
      seg('person-juriste-2', 'shift', atHour(day, 8), atHour(day, 10, 30), 1),
      seg('person-juriste-2', 'meeting', atHour(day, 10, 30), null, 2),
      seg('person-assistant-1', 'shift', atHour(day, 8), atHour(day, 10, 12), 1),
      seg('person-assistant-1', 'pause', atHour(day, 10, 12), null, 2),
      seg('person-assistant-2', 'shift', atHour(day, 8), null, 1),
      seg('person-assistant-3', 'absent', atHour(day, 8), atHour(day, 8, 1), 1),
    ],
    departures: [
      { personId: 'person-assistant-3', day, at: atHour(day, 8, 1), discharge: 'objectif', gapMin: null },
    ],
    savedMonths: {},
  };
}

function emit() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('presence-demo'));
  listeners.forEach((l) => l());
}

export function getPresence(): PresenceState {
  if (memory) return memory;
  if (typeof window === 'undefined') return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PresenceState;
      if (parsed && Array.isArray(parsed.segments)) {
        memory = parsed;
        return memory;
      }
    }
  } catch {
    // ignore
  }
  memory = seed();
  try { window.localStorage.setItem(KEY, JSON.stringify(memory)); } catch { /* ignore */ }
  return memory;
}

export function setPresence(next: PresenceState) {
  memory = next;
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
  emit();
}

export function subscribePresence(listener: () => void) {
  listeners.add(listener);
  if (typeof window === 'undefined') return () => listeners.delete(listener);
  const kick = () => listener();
  window.addEventListener('storage', kick);
  window.addEventListener('presence-demo', kick);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', kick);
    window.removeEventListener('presence-demo', kick);
  };
}

export function resetPresence() {
  setPresence(seed());
}

export function openSegment(personId: string, now = new Date()) {
  return getPresence().segments.find((s) => s.personId === personId && s.end === null && dayKey(new Date(s.start)) === dayKey(now));
}

export function departureOf(personId: string, day = dayKey()) {
  return getPresence().departures.find((d) => d.personId === personId && d.day === day);
}

export function secondsOf(segment: Segment, now = new Date()) {
  const end = segment.end ? new Date(segment.end).getTime() : now.getTime();
  return Math.max(0, Math.floor((end - new Date(segment.start).getTime()) / 1000));
}

export function overLimit(tag: TagId, seconds: number) {
  const def = tagOf(tag);
  if (def.limitSec == null || def.minimum) return false;
  return seconds > def.limitSec;
}

export function startTag(personId: string, tag: TagId, author = 'Membre') {
  const now = new Date();
  const day = dayKey(now);
  if (departureOf(personId, day)) return;
  const s = getPresence();
  const segments = s.segments.map((seg) => (
    seg.personId === personId && seg.end === null ? { ...seg, end: now.toISOString() } : seg
  ));
  segments.push({
    id: `seg-${personId}-${Date.now()}`,
    personId,
    tag,
    start: now.toISOString(),
    end: tag === 'absent' || tag === 'conge' ? now.toISOString() : null,
    trace: [],
  });
  const departures = tag === 'absent' || tag === 'conge'
    ? [...s.departures.filter((d) => !(d.personId === personId && d.day === day)), { personId, day, at: now.toISOString(), discharge: 'objectif' as Discharge, gapMin: null }]
    : s.departures;
  setPresence({ ...s, segments, departures });
}

export function registerDeparture(personId: string, discharge: Discharge) {
  const now = new Date();
  const day = dayKey(now);
  const s = getPresence();
  const open = s.segments.find((seg) => seg.personId === personId && seg.end === null);
  const segments = s.segments.map((seg) => seg.id === open?.id ? { ...seg, end: now.toISOString() } : seg);
  const shiftSec = segments
    .filter((seg) => seg.personId === personId && seg.tag === 'shift' && dayKey(new Date(seg.start)) === day)
    .reduce((sum, seg) => sum + secondsOf(seg, now), 0);
  const gapMin = discharge === 'urgence' ? Math.max(0, Math.round((7.5 * 3600 - shiftSec) / 60)) : null;
  const departures = [
    ...s.departures.filter((d) => !(d.personId === personId && d.day === day)),
    { personId, day, at: now.toISOString(), discharge, gapMin },
  ];
  setPresence({ ...s, segments, departures });
}

export function correctTag(segmentId: string, to: TagId, author: string) {
  const s = getPresence();
  const segments = s.segments.map((seg) => {
    if (seg.id !== segmentId || seg.tag === to) return seg;
    return { ...seg, tag: to, trace: [...seg.trace, { at: new Date().toISOString(), author, from: seg.tag, to }] };
  });
  setPresence({ ...s, segments });
}

export function rowsForMonth(month: string, now = new Date()): RapportRow[] {
  const rows: RapportRow[] = [];
  const days = new Set<string>();
  getPresence().segments.forEach((seg) => {
    const day = dayKey(new Date(seg.start));
    if (day.startsWith(month)) days.add(day);
  });
  [...days].sort().forEach((day) => {
    PEOPLE.forEach((person) => {
      const seconds = Object.fromEntries(TAGS.map((t) => [t.id, 0])) as Record<TagId, number>;
      getPresence().segments
        .filter((seg) => seg.personId === person.id && dayKey(new Date(seg.start)) === day)
        .forEach((seg) => { seconds[seg.tag] += secondsOf(seg, now); });
      const total = Object.values(seconds).reduce((a, b) => a + b, 0);
      if (!total) return;
      const departed = !!departureOf(person.id, day) || day < dayKey(now);
      const alerts: string[] = [];
      if (departed && seconds.shift > 0 && seconds.shift < 7.5 * 3600) alerts.push('Shift sous 7 h 30');
      if (seconds.pause > 30 * 60) alerts.push('Pause au-dessus de 30 min');
      if (seconds.lunch > 60 * 60) alerts.push('Lunch au-dessus de 60 min');
      rows.push({ personId: person.id, nom: person.nom, day, seconds, alerts });
    });
  });
  return rows;
}

export function saveMonth(month: string) {
  const s = getPresence();
  if (s.savedMonths[month]) return;
  setPresence({ ...s, savedMonths: { ...s.savedMonths, [month]: { savedAt: new Date().toISOString(), rows: rowsForMonth(month) } } });
}

export function rapportCsv(rows: RapportRow[]) {
  const head = ['Membre', 'Jour', ...TAGS.map((t) => t.label), 'Alertes'];
  const lines = rows.map((r) => [
    r.nom,
    r.day,
    ...TAGS.map((t) => formatHm(r.seconds[t.id])),
    r.alerts.join(' | '),
  ].join(';'));
  return [head.join(';'), ...lines].join('\n');
}
