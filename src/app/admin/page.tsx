'use client';

/**
 * Tableau de bord admin — habillage Glassy V22.
 * Même logique qu'avant : les chiffres viennent du store de workflow, jamais d'une constante.
 * Échéances est une vue, pas une septième pile. L'assistant ne voit pas cette page.
 */

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import type { Case, CaseEvent } from '@/types/database';
import { createDemoTodayPointage } from '@/lib/demo-pointage';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';
import { ETAPE_LABELS } from '@/lib/workflow-ui';
import { BRANCHES } from '@/lib/workflow-branch';

const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const BUREAU = ['Juriste 1', 'Juriste 2', 'Assistant 1', 'Assistant 2', 'Assistant 3'];

interface StepGroup {
  id: string;
  label: string;
  stock: boolean;
  codes: string[];
}

const GROUPS: StepGroup[] = [
  { id: 'constatations', label: 'Constatations', stock: true, codes: ['constatation_recue'] },
  { id: 'analyse', label: 'Analyse', stock: true, codes: ['analyse_gravite'] },
  { id: 'convocations', label: 'Convocations', stock: true, codes: ['convocation_seance'] },
  { id: 'seances', label: 'Séances', stock: true, codes: ['seance_presente', 'seance_absente', 'pv_seance'] },
  { id: 'decisions', label: 'Décisions', stock: true, codes: ['decision_licenciement', 'decision_mise_a_pied', 'decision_sanction', 'fin_procedure', 'notification_48h', 'depot_inspection_decision', 'depot_inspection_absence', 'investigations', 'sanction_faute_non_grave'] },
  { id: 'clos', label: 'Clos', stock: true, codes: ['cloture'] },
  { id: 'echeances', label: 'Échéances', stock: false, codes: [] },
];

const GROUP_COLORS: Record<string, string> = {
  constatations: '#3b82f6',
  analyse: '#0ea5e9',
  convocations: '#22d3ee',
  seances: '#8b5cf6',
  decisions: '#a855f7',
  clos: '#64748b',
  echeances: '#cbd5e1',
};

const TAGS: Record<string, { label: string; color: string; bg: string }> = {
  shift: { label: 'Shift', color: '#4f46e5', bg: '#eef2ff' },
  pause: { label: 'Pause', color: '#d97706', bg: '#fffbeb' },
  lunch: { label: 'Lunch', color: '#d97706', bg: '#fffbeb' },
  meeting: { label: 'Réunion', color: '#2563eb', bg: '#eff6ff' },
  rencontre: { label: 'Rencontre', color: '#2563eb', bg: '#eff6ff' },
  formation: { label: 'Formation', color: '#4f46e5', bg: '#eef2ff' },
  absent: { label: 'Absent', color: '#b42318', bg: '#fdeceb' },
  conge: { label: 'Congé', color: '#9a6700', bg: '#fff6e0' },
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fr(iso: string) {
  if (!iso) return '—';
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  // On lit la partie date de l'ISO (UTC) : même résultat sur le serveur et
  // dans le navigateur, quel que soit le fuseau horaire.
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${Number(d)} ${mois[Number(m) - 1]} ${y}`;
}
function labelOf(step: string) {
  return ETAPE_LABELS[step] || step;
}
function kindOf(etape: string) {
  if (etape === 'constatation_recue' || etape === 'analyse_gravite') return '8 jours après la réception';
  if (etape === 'convocation_seance') return '8 jours après la convocation';
  if (etape === 'decision_licenciement' || etape === 'decision_mise_a_pied' || etape === 'notification_48h') return '48 heures';
  return '';
}
function echeanceText(iso: string | null, today: string) {
  if (!iso) return "Pas d'échéance";
  const key = dayKey(new Date(iso));
  if (key === today) return `Aujourd'hui · ${fr(iso)}`;
  if (key < today) return `Dépassée le ${fr(iso)}`;
  return fr(iso);
}
function elapsed(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return '0 min';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h} h ${pad(m)}` : `${m} min`;
}
function presenceCode(value: unknown): string {
  if (typeof value === 'string' && value) return value;
  if (value && typeof value === 'object') {
    const id = (value as { id?: unknown }).id;
    if (typeof id === 'string' && id) return id;
  }
  return 'absent';
}
function initials(name: string) {
  return name.split(/\s+/).map((w) => w.charAt(0)).join('').slice(0, 2).toUpperCase();
}

export default function AdminDashboardPage(_props?: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  // Le tableau de bord dépend de la date du jour : on ne l'affiche qu'après
  // l'hydratation. Sans cela, une page pré-rendue un autre jour affiche des
  // échéances différentes de celles calculées par le navigateur.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // La date est calculée côté client après montage : évite un écart avec la page pré-rendue.
  const [today, setToday] = useState<Date>(() => new Date());
  useEffect(() => {
    setToday(new Date());
    const t = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const todayIso = dayKey(today);
  const [group, setGroup] = useState('constatations');
  const [ref, setRef] = useState('');

  const rows = snap.cases.map((c) => {
    const late = c.etape !== 'cloture' && !!c.echeance && dayKey(new Date(c.echeance)) < todayIso;
    const due = c.etape !== 'cloture' && !!c.echeance && dayKey(new Date(c.echeance)) <= todayIso;
    const statut = c.etape === 'cloture'
      ? { id: 'mute', label: 'Clos' }
      : late
        ? { id: 'bad', label: 'En retard' }
        : c.echeance
          ? { id: 'ok', label: 'Dans le délai' }
          : { id: 'wait', label: 'En attente' };
    return { c, late, due, statut };
  });

  const total = rows.length;
  const clos = rows.filter((r) => r.c.etape === 'cloture').length;
  const enCours = total - clos;
  const lateCount = rows.filter((r) => r.late).length;
  const okCount = rows.filter((r) => r.statut.id === 'ok').length;
  const waitCount = rows.filter((r) => r.statut.id === 'wait').length;
  const counts = Object.fromEntries(GROUPS.map((g) => [g.id, rows.filter((r) => inGroup(r, g.id)).length]));
  const maxStock = Math.max(1, ...GROUPS.filter((g) => g.stock).map((g) => counts[g.id]));
  const shown = rows.filter((r) => inGroup(r, group));
  const dues = rows.filter((r) => r.due);
  const currentRef = rows.some((r) => r.c.reference === ref) ? ref : rows[0]?.c.reference || '';
  const current = rows.find((r) => r.c.reference === currentRef);
  const people = BUREAU.map((name) => createDemoTodayPointage().find((s) => s.utilisateur?.nom === name)).filter(Boolean);

  // Prochaine échéance : la plus proche, encore ouverte.
  const next = useMemo(() => {
    const open = rows.filter((r) => r.c.etape !== 'cloture' && r.c.echeance);
    if (!open.length) return null;
    const sorted = [...open].sort((a, b) => String(a.c.echeance).localeCompare(String(b.c.echeance)));
    const future = sorted.find((r) => dayKey(new Date(r.c.echeance as string)) >= todayIso);
    return future || sorted[0];
  }, [rows, todayIso]);

  const daysLeft = next?.c.echeance
    ? Math.round((new Date(dayKey(new Date(next.c.echeance)) + 'T00:00:00').getTime() - new Date(todayIso + 'T00:00:00').getTime()) / 86400000)
    : 0;

  // Anneau : clos, dans le délai, en retard, en attente.
  const segs = [
    { key: 'clos', n: clos, color: '#64748b' },
    { key: 'ok', n: okCount, color: '#3b82f6' },
    { key: 'bad', n: lateCount, color: '#e11d48' },
    { key: 'wait', n: waitCount, color: '#cbd5e1' },
  ];
  const sumSegs = Math.max(1, segs.reduce((s, x) => s + x.n, 0));
  let acc = 0;
  const gradient = segs
    .map((s) => {
      const from = (acc / sumSegs) * 100;
      acc += s.n;
      const to = (acc / sumSegs) * 100;
      return `${s.color} ${from.toFixed(1)}% ${to.toFixed(1)}%`;
    })
    .join(', ');

  const longDate = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const groupLabel = GROUPS.find((g) => g.id === group)?.label || '';

  const icons = {
    inbox: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16v14H4z" /><path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    ),
    hourglass: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3h10M7 21h10M8 3c0 4 8 5 8 9s-8 5-8 9M16 3c0 4-8 5-8 9s8 5 8 9" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    alert: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 2 21h20L12 3z" /><path d="M12 10v4M12 17h.01" />
      </svg>
    ),
  };

  if (!mounted) {
    return (
      <>
        <header className="g-top">
          <div>
            <div className="g-kicker"><i /> Espace Juridique</div>
            <h1>Tableau de bord</h1>
            <p className="g-lead">Chargement du tableau de bord…</p>
          </div>
        </header>
        <section className="g-kpis">
          {[0, 1, 2, 3].map((i) => (
            <article key={i} className="g-kpi g-glass" aria-hidden="true">
              <div className="g-kpi-top"><span className="g-kpi-ico" /></div>
              <b className="g-value g-num">—</b>
              <span className="g-label">…</span>
            </article>
          ))}
        </section>
      </>
    );
  }

  return (
    <>
      <header className="g-top g-rise" style={{ ['--d' as string]: '.02s' }}>
        <div>
          <div className="g-kicker"><i /> Xceed · Juridique</div>
          <h1>Tableau de bord</h1>
          <p className="g-lead">
            Vue d&apos;ensemble du traitement. Les chiffres viennent des dossiers. L&apos;assistant ne voit pas cette page :
            elle révèle l&apos;étape, pas le motif.
          </p>
        </div>
        <div className="g-tools">
          <span className="g-date" suppressHydrationWarning>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
            {longDate}
          </span>
        </div>
      </header>

      {/* Prochaine échéance */}
      {next && (
        <section className="g-hero g-glass g-rise" style={{ ['--d' as string]: '.06s' }}>
          <div>
            <div className="g-kicker"><i /> Prochaine échéance</div>
            <h2>
              {next.c.reference} · <em>{labelOf(next.c.etape)}</em>
            </h2>
            <p>
              {kindOf(next.c.etape) || 'Échéance du dossier'} · {next.c.affectationFixe.lob || '—'} ·{' '}
              {next.late ? `dépassée depuis le ${fr(String(next.c.echeance))}` : `à traiter avant le ${fr(String(next.c.echeance))}`}.
              L&apos;étape ne change pas toute seule.
            </p>
            <div className="g-hero-actions">
              <Link className="g-btn" href={`/admin/dossiers/${next.c.reference}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                </svg>
                Ouvrir le dossier
              </Link>
              <Link className="g-btn g-btn--ghost" href="/admin/dossiers">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                </svg>
                Voir les dossiers
              </Link>
            </div>
          </div>
          <div className="g-hero-side">
            <b className="g-num">{Math.max(0, daysLeft)}</b>
            <span>{daysLeft < 0 ? 'jours de retard' : daysLeft === 0 ? "aujourd'hui" : 'jours restants'}</span>
            <small>{next.c.echeance ? fr(String(next.c.echeance)) : ''}</small>
          </div>
        </section>
      )}

      {/* Indicateurs */}
      <section className="g-kpis" aria-label="Totaux">
        <article className="g-kpi g-glass g-rise" style={{ ['--d' as string]: '.1s' }}>
          <div className="g-kpi-top">
            <span className="g-kpi-ico">{icons.inbox}</span>
            <span className="g-delta">{total} reçus</span>
          </div>
          <b className="g-value g-num">{enCours}</b>
          <span className="g-label">Dossiers en cours</span>
        </article>

        <article className="g-kpi g-glass g-rise" style={{ ['--d' as string]: '.13s' }}>
          <div className="g-kpi-top">
            <span className="g-kpi-ico">{icons.hourglass}</span>
            <span className="g-delta is-ok">{okCount} dans le délai</span>
          </div>
          <b className="g-value g-num">{clos}</b>
          <span className="g-label">Dossiers clos</span>
        </article>

        <article className="g-kpi g-glass g-rise" style={{ ['--d' as string]: '.16s' }}>
          <div className="g-kpi-top">
            <span className="g-kpi-ico">{icons.alert}</span>
            <span className={`g-delta ${lateCount ? 'is-bad' : 'is-ok'}`}>{lateCount ? 'à traiter' : 'aucun'}</span>
          </div>
          <b className="g-value g-num" style={{ color: lateCount ? 'var(--g-bad)' : undefined }}>{lateCount}</b>
          <span className="g-label">En retard, dans les en cours</span>
        </article>

        <article className="g-kpi g-glass g-rise" style={{ ['--d' as string]: '.19s' }}>
          <div className="g-kpi-top">
            <span className="g-kpi-ico">{icons.check}</span>
            <span className="g-delta">{waitCount} en attente</span>
          </div>
          <b className="g-value g-num">{total}</b>
          <span className="g-label">Dossiers reçus au total</span>
        </article>
      </section>

      {/* Volume par étape + répartition */}
      <section className="g-grid-2">
        <article className="g-card g-glass g-rise" style={{ ['--d' as string]: '.22s' }}>
          <div className="g-card-head">
            <div>
              <h3 className="g-card-title">Volume par étape</h3>
              <p className="g-card-sub">
                Six étapes portent les dossiers. Échéances est une vue, pas une septième pile. Un clic filtre la table.
              </p>
            </div>
            <div className="g-tabs" role="tablist" aria-label="Périmètre">
              <button
                type="button"
                role="tab"
                aria-selected={group === 'echeances'}
                className={`g-tab${group === 'echeances' ? ' is-active' : ''}`}
                onClick={() => setGroup('echeances')}
              >
                Échéances
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={group === 'clos'}
                className={`g-tab${group === 'clos' ? ' is-active' : ''}`}
                onClick={() => setGroup('clos')}
              >
                Clos
              </button>
            </div>
          </div>

          <div className="g-bars">
            {GROUPS.map((g) => {
              const n = counts[g.id];
              const width = g.stock ? Math.round((n / maxStock) * 100) : 100;
              return (
                <button
                  key={g.id}
                  type="button"
                  className={`g-bar${group === g.id ? ' is-active' : ''}`}
                  onClick={() => setGroup(g.id)}
                  aria-pressed={group === g.id}
                >
                  <span className="g-bar-label">
                    <i style={{ background: GROUP_COLORS[g.id], color: GROUP_COLORS[g.id] }} />
                    {g.label}
                    {g.stock ? '' : ' · vue'}
                  </span>
                  <span className="g-track">
                    <span
                      className="g-fill"
                      style={{ width: `${width}%`, ['--g-bar-c' as string]: GROUP_COLORS[g.id] }}
                    />
                  </span>
                  <span className="g-bar-val">
                    <b className="g-num">{n}</b>
                    dossier{n > 1 ? 's' : ''}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="g-card-foot">
            <span>Total <b className="g-num">{total}</b> dossiers</span>
            <span>Échéances ouvertes <b className="g-num">{dues.length}</b></span>
          </div>
        </article>

        <article className="g-card g-glass g-rise" style={{ ['--d' as string]: '.25s' }}>
          <div className="g-card-head">
            <div>
              <h3 className="g-card-title">Répartition</h3>
              <p className="g-card-sub">État des dossiers ouverts et clos.</p>
            </div>
          </div>
          <div className="g-donut-block">
            <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
              <div
                className="g-donut"
                style={{ ['--g-segments' as string]: `conic-gradient(${gradient})` }}
                role="img"
                aria-label={`Clos ${clos}, dans le délai ${okCount}, en retard ${lateCount}, en attente ${waitCount}`}
              />
              <div className="g-donut-mid">
                <b className="g-num">{total}</b>
                <span>dossiers</span>
              </div>
            </div>
            <div className="g-legend">
              <div className="g-legend-row"><i style={{ background: '#64748b', color: '#64748b' }} /><span>Clos</span><b className="g-num">{clos}</b></div>
              <div className="g-legend-row"><i style={{ background: '#3b82f6', color: '#3b82f6' }} /><span>Dans le délai</span><b className="g-num">{okCount}</b></div>
              <div className="g-legend-row"><i style={{ background: '#e11d48', color: '#e11d48' }} /><span>En retard</span><b className="g-num">{lateCount}</b></div>
              <div className="g-legend-row"><i style={{ background: '#cbd5e1', color: '#cbd5e1' }} /><span>En attente</span><b className="g-num">{waitCount}</b></div>
            </div>
          </div>
          <div className="g-card-foot">
            <span>Source <b>dossiers</b></span>
            <span><b className="g-num">{clos}</b> clos + <b className="g-num">{enCours}</b> en cours</span>
          </div>
        </article>
      </section>

      {/* Échéances + process */}
      <section className="g-grid-2">
        <article className="g-card g-glass g-rise" style={{ ['--d' as string]: '.28s' }}>
          <div className="g-card-head">
            <div>
              <h3 className="g-card-title">Échéances du jour</h3>
              <p className="g-card-sub">
                Aujourd&apos;hui, ou déjà dépassées et encore ouvertes. 8 jours après la réception, 8 jours après la
                convocation, 48 heures après licenciement ou mise à pied.
              </p>
            </div>
            <Link className="g-btn g-btn--ghost g-btn--sm" href="/admin/dossiers">Tout voir</Link>
          </div>
          {dues.length === 0 ? (
            <p className="g-empty">Aucune échéance aujourd&apos;hui, ni dépassée.</p>
          ) : (
            <ul className="g-list">
              {dues.map((r) => (
                <li key={r.c.reference}>
                  <button type="button" className="g-list-item" onClick={() => setRef(r.c.reference)}>
                    <span className="g-list-main">
                      <b>{r.c.reference} · {r.c.affectationFixe.lob || '—'}</b>
                      <span>{kindOf(r.c.etape) || labelOf(r.c.etape)} · étape inchangée : {labelOf(r.c.etape)}</span>
                    </span>
                    <span className="g-list-side">
                      <time>{echeanceText(r.c.echeance, todayIso)}</time>
                      <span className={`g-badge ${r.late ? 'is-bad' : 'is-warn'}`}><i className="g-dot" />{r.late ? 'En retard' : "Aujourd'hui"}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="g-card-foot">
            <span><b className="g-num">{dues.length}</b> échéance{dues.length > 1 ? 's' : ''} ouverte{dues.length > 1 ? 's' : ''}</span>
            <span>Un retard ne change pas l&apos;étape</span>
          </div>
        </article>

        <article className="g-card g-glass g-rise" style={{ ['--d' as string]: '.31s' }}>
          <div className="g-card-head">
            <div>
              <h3 className="g-card-title">Process d&apos;un dossier</h3>
              <p className="g-card-sub">Le chemin de cette référence seulement, et la branche suivante.</p>
            </div>
            {current && <span className="g-badge is-info">{labelOf(current.c.etape)}</span>}
          </div>
          <select
            className="g-chip"
            aria-label="Choisir une référence"
            value={currentRef}
            onChange={(e) => setRef(e.target.value)}
            style={{ width: '100%', height: 36, marginBottom: 12 }}
          >
            {rows.map((r) => (
              <option key={r.c.reference} value={r.c.reference}>{r.c.reference} · {labelOf(r.c.etape)}</option>
            ))}
          </select>
          {current && <Path dossier={current.c} events={snap.events.filter((e) => e.dossier === current.c.reference)} />}
          {current && (
            <div className="g-card-foot">
              <span>Trace des passages conservée</span>
              <Link href={`/admin/dossiers/${current.c.reference}`}>Ouvrir le dossier</Link>
            </div>
          )}
        </article>
      </section>

      {/* Table du groupe sélectionné */}
      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.34s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">{groupLabel} · {shown.length} dossier{shown.length > 1 ? 's' : ''}</h3>
            <p className="g-card-sub">Référence, activité, agent, étape et statut. Ni motif, ni gravité, ni sanction.</p>
          </div>
        </div>
        {shown.length === 0 ? (
          <p className="g-empty">Aucun dossier dans cette vue.</p>
        ) : (
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Activité</th>
                  <th>Agent</th>
                  <th>Étape</th>
                  <th style={{ textAlign: 'right' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.c.reference} onClick={() => setRef(r.c.reference)}>
                    <td><span className="g-ref">{r.c.reference}</span></td>
                    <td>{r.c.affectationFixe.lob || '—'}</td>
                    <td>{r.c.agentId || '—'}</td>
                    <td>{labelOf(r.c.etape)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`g-badge ${r.statut.id === 'ok' ? 'is-ok' : r.statut.id === 'bad' ? 'is-bad' : r.statut.id === 'wait' ? 'is-warn' : 'is-muted'}`}>
                        <i className="g-dot" />
                        {r.statut.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="g-card-foot">
          <span>{shown.length} dossier{shown.length > 1 ? 's' : ''} affiché{shown.length > 1 ? 's' : ''} sur <b className="g-num">{total}</b></span>
          <span>Le clic ouvre la fiche et ses boutons autorisés</span>
        </div>
      </section>

      {/* Présence du bureau */}
      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.37s' }}>
        <div className="g-card-head">
          <div>
            <h3 className="g-card-title">Présence du bureau</h3>
            <p className="g-card-sub">Deux juristes, trois assistants. Pas les agents, pas la production.</p>
          </div>
          <Link className="g-btn g-btn--ghost g-btn--sm" href="/admin/presence">Détail des tags</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
          {people.map((s) => {
            const code = presenceCode(s!.statut);
            const tag = TAGS[code] || TAGS.absent;
            const actif = code !== 'absent' && code !== 'conge';
            return (
              <article key={s!.id} style={{ background: 'var(--g-glass-2)', border: '1px solid var(--g-stroke)', borderRadius: 16, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span className="g-avatar" aria-hidden="true">{initials(s!.utilisateur?.nom || '?')}</span>
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 12.5 }}>{s!.utilisateur?.nom}</b>
                    <span style={{ display: 'block', fontSize: 10.5, color: 'var(--g-muted-2)' }}>{actif ? elapsed(s!.debut) : 'Inactif'}</span>
                  </span>
                </div>
                <span className="g-badge" style={{ marginTop: 9, color: tag.color, background: tag.bg, borderColor: 'transparent' }}>
                  {tag.label}
                </span>
              </article>
            );
          })}
        </div>
        <div className="g-card-foot">
          <span>Le détail des tags est sur la page Présence</span>
          <span>Ici, seulement l&apos;état du moment</span>
        </div>
      </section>

      <footer className="g-foot">
        <span>ACX Flow · Espace Juridique — chiffres lus dans les dossiers.</span>
        <span className="g-tag">Glassy V22</span>
      </footer>
    </>
  );
}

function inGroup(r: { c: Case; due: boolean }, id: string) {
  if (id === 'echeances') return r.due;
  return GROUPS.find((g) => g.id === id)?.codes.includes(r.c.etape) || false;
}

function Path({ dossier, events }: { dossier: Case; events: CaseEvent[] }) {
  const ordered = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const steps: string[] = [];
  for (const ev of ordered) {
    if (ev.etape === dossier.etape) {
      if (!steps.includes(ev.etape)) steps.push(ev.etape);
      break;
    }
    if (!steps.includes(ev.etape)) steps.push(ev.etape);
  }
  if (!steps.includes(dossier.etape)) steps.push(dossier.etape);
  const next = dossier.etape === 'cloture' ? [] : (BRANCHES.find((b) => b.from === dossier.etape)?.steps || []);
  const lob = dossier.affectationFixe.lob || '—';

  return (
    <ol className="g-steps" style={{ marginTop: 4 }}>
      {steps.map((step, i) => {
        const now = step === dossier.etape;
        return (
          <li key={`${step}-${i}`} className={`g-step ${now ? 'is-now' : 'is-done'}`}>
            <span className="g-step-dot">{now ? '●' : '✓'}</span>
            <span className="g-step-body">
              <b>{labelOf(step)}</b>
              <span>
                {now
                  ? `Étape actuelle · ${lob} · ${dossier.agentId || 'agent non précisé'}`
                  : 'Passé'}
              </span>
            </span>
            <span className="g-step-meta">{now ? 'en cours' : 'fait'}</span>
          </li>
        );
      })}
      {next.map((n) => (
        <li key={n.code} className="g-step is-next">
          <span className="g-step-dot">3</span>
          <span className="g-step-body">
            <b>{n.label}</b>
            <span>Sortie possible, non choisie</span>
          </span>
          <span className="g-step-meta">à venir</span>
        </li>
      ))}
      {dossier.etape === 'cloture' && (
        <li className="g-step">
          <span className="g-step-dot">✓</span>
          <span className="g-step-body"><b>Dossier clos</b><span>Aucune branche ouverte</span></span>
          <span className="g-step-meta">fin</span>
        </li>
      )}
    </ol>
  );
}
