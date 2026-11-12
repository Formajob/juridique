'use client';

/**
 * Même fichier pour :
 * src/app/admin/recherche/page.tsx
 * src/app/juriste/recherche/page.tsx
 * Recherche dans les dossiers, événements, rendez-vous et la présence du bureau.
 */

import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { PEOPLE, TAGS, getPresence, subscribePresence, tagOf } from '@/lib/presence-demo';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';
import { ETAPE_LABELS } from '@/lib/workflow-ui';
import type { Appointment, Case, CaseEvent } from '@/types/database';

function norm(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function has(q: string, ...parts: Array<string | null | undefined>) {
  const n = norm(q.trim());
  if (!n) return false;
  return parts.some((p) => norm(String(p || '')).includes(n));
}
function extra(c: Case, key: string) {
  const v = c.affectationFixe?.[key];
  return typeof v === 'string' ? v : '';
}

export default function RecherchePage() {
  const path = usePathname() || '';
  const base = path.startsWith('/juriste') ? '/juriste' : '/admin';
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const presence = useSyncExternalStore(subscribePresence, getPresence, getPresence);
  const [q, setQ] = useState('');
  const query = q.trim();

  const result = useMemo(() => {
    if (query.length < 2) return null;
    const dossiers = snap.cases.filter((c) => has(
      query,
      c.reference,
      c.agentId,
      c.etape,
      ETAPE_LABELS[c.etape],
      c.statut,
      c.juristeId,
      c.echeance,
      c.affectationFixe?.lob,
      c.affectationFixe?.department,
      extra(c, 'objet'),
      extra(c, 'faits'),
      extra(c, 'details'),
      extra(c, 'commentaire'),
      extra(c, 'rapport'),
      extra(c, 'source'),
    ));
    const events = snap.events.filter((e) => has(query, e.dossier, e.etape, ETAPE_LABELS[e.etape], e.action, e.auteur, e.date));
    const rdvs = snap.appointments.filter((a) => has(query, a.dossier, a.lieu, a.statut, a.debut, a.fin));
    const bureau = PEOPLE.filter((p) => has(query, p.nom, p.role));
    const tags = TAGS.filter((t) => has(query, t.label, t.id));
    return { dossiers, events, rdvs, bureau, tags };
  }, [query, snap, presence]);

  const empty = result && !result.dossiers.length && !result.events.length && !result.rdvs.length && !result.bureau.length && !result.tags.length;
  const total = result ? result.dossiers.length + result.events.length + result.rdvs.length + result.bureau.length + result.tags.length : 0;

  return (
    <>
      <header className="g-page-head g-rise" style={{ ['--d' as string]: '.02s' }}>
        <div>
          <div className="g-kicker"><i /> {path.startsWith('/juriste') ? 'Espace Juriste' : 'Espace Juridique'} · Recherche</div>
          <h1>Recherche</h1>
          <p>
            Référence, agent, étape, activité, objet, fait saisi, événement, rendez-vous, place du bureau.
            Deux lettres minimum.
          </p>
        </div>
        {result && <span className="g-chip">{total} résultat{total > 1 ? 's' : ''}</span>}
      </header>

      <section className="g-card g-glass g-rise" style={{ ['--d' as string]: '.05s', maxWidth: 880 }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <label className="g-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex. DEMO-2026, AGT, convocation, salle, Juriste"
              aria-label="Recherche générale"
            />
            {q && (
              <button type="button" className="g-search-clear" onClick={() => setQ('')} aria-label="Effacer">
                ×
              </button>
            )}
          </label>
        </form>

        {!query && <p className="g-card-sub" style={{ marginTop: 10 }}>La recherche lit le workflow ouvert dans ce navigateur, pas une autre base.</p>}
        {query.length === 1 && <p className="g-card-sub" style={{ marginTop: 10 }}>Encore une lettre.</p>}
        {empty && <p className="g-empty">Aucun résultat pour « {query} ».</p>}
      </section>

      {result && <Groups base={base} result={result} />}

      <footer className="g-foot">
        <span>ACX Flow · Recherche</span>
        <span className="g-tag">Glassy V22</span>
      </footer>
    </>
  );
}

function Groups({ base, result }: { base: string; result: { dossiers: Case[]; events: CaseEvent[]; rdvs: Appointment[]; bureau: typeof PEOPLE; tags: typeof TAGS } }) {
  return (
    <>
      <Group title="Dossiers" n={result.dossiers.length}>
        {result.dossiers.map((c) => (
          <li key={c.id}>
            <Link href={`${base}/dossiers/${c.reference}`} className="g-list-item">
              <span className="g-list-main">
                <b>{c.reference}</b>
                <span>
                  {ETAPE_LABELS[c.etape] || c.etape} · {c.affectationFixe?.lob || '—'} · {c.agentId || 'agent non précisé'}
                  {extra(c, 'objet') ? ` · ${extra(c, 'objet')}` : ''}
                </span>
              </span>
              <span className="g-list-side">→</span>
            </Link>
          </li>
        ))}
      </Group>
      <Group title="Événements" n={result.events.length}>
        {result.events.slice(0, 30).map((e) => (
          <li key={e.id}>
            <Link href={`${base}/dossiers/${e.dossier}`} className="g-list-item">
              <span className="g-list-main">
                <b>{e.dossier}</b>
                <span>{e.action} · {new Date(e.date).toLocaleString('fr-FR')}</span>
              </span>
              <span className="g-list-side">→</span>
            </Link>
          </li>
        ))}
      </Group>
      <Group title="Rendez-vous" n={result.rdvs.length}>
        {result.rdvs.map((a) => (
          <li key={a.id}>
            <Link href={`${base}/calendrier`} className="g-list-item">
              <span className="g-list-main">
                <b>{a.dossier}</b>
                <span>{new Date(a.debut).toLocaleString('fr-FR')} · {a.lieu} · {a.statut}</span>
              </span>
              <span className="g-list-side">→</span>
            </Link>
          </li>
        ))}
      </Group>
      <Group title="Bureau" n={result.bureau.length + result.tags.length}>
        {result.bureau.map((p) => (
          <li key={p.id}>
            <div className="g-list-item" style={{ cursor: 'default' }}>
              <span className="g-list-main">
                <b>{p.nom}</b>
                <span>{p.role === 'juriste' ? 'Juriste' : 'Assistant'} · présence</span>
              </span>
              <span className="g-list-side"><span className="g-badge is-info"><i className="g-dot" />Place</span></span>
            </div>
          </li>
        ))}
        {result.tags.map((t) => (
          <li key={t.id}>
            <div className="g-list-item" style={{ cursor: 'default' }}>
              <span className="g-list-main">
                <b>{t.label}</b>
                <span>Tag de présence</span>
              </span>
              <span className="g-list-side"><i className="g-dot" style={{ background: tagOf(t.id).color }} /></span>
            </div>
          </li>
        ))}
      </Group>
    </>
  );
}

function Group({ title, n, children }: { title: string; n: number; children: ReactNode }) {
  if (!n) return null;
  return (
    <section className="g-card g-glass">
      <div className="g-card-head">
        <div>
          <h3 className="g-card-title">{title}</h3>
          <p className="g-card-sub">{n} correspondance{n > 1 ? 's' : ''}</p>
        </div>
        <span className="g-tag">{n}</span>
      </div>
      <ul className="g-list">{children}</ul>
    </section>
  );
}
