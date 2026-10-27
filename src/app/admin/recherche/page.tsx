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

  return (
    <div className="jx-sea">
      <style>{CSS}</style>
      <div className="kicker">Xceed · Juridique</div>
      <h1>Recherche</h1>
      <p className="sub">Référence, agent, étape, activité, objet, fait saisi, événement, rendez-vous, place du bureau. Deux lettres minimum.</p>
      <form className="search" onSubmit={(e) => e.preventDefault()}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex. DEMO-2026, AGT, convocation, salle, Juriste" aria-label="Recherche générale" />
      </form>
      {!query && <p className="note">La recherche lit le workflow ouvert dans ce navigateur, pas une autre base.</p>}
      {query.length === 1 && <p className="note">Encore une lettre.</p>}
      {empty && <p className="note">Aucun résultat pour « {query} ».</p>}
      {result && <Groups base={base} result={result} />}
    </div>
  );
}

function Groups({ base, result }: { base: string; result: { dossiers: Case[]; events: CaseEvent[]; rdvs: Appointment[]; bureau: typeof PEOPLE; tags: typeof TAGS } }) {
  return (
    <div className="groups">
      <Group title="Dossiers" n={result.dossiers.length}>
        {result.dossiers.map((c) => (
          <Link key={c.id} href={`${base}/dossiers/${c.reference}`} className="hit">
            <b>{c.reference}</b>
            <span>{ETAPE_LABELS[c.etape] || c.etape} · {c.affectationFixe?.lob || '—'} · {c.agentId || 'agent non précisé'}{extra(c, 'objet') ? ` · ${extra(c, 'objet')}` : ''}</span>
          </Link>
        ))}
      </Group>
      <Group title="Événements" n={result.events.length}>
        {result.events.slice(0, 30).map((e) => (
          <Link key={e.id} href={`${base}/dossiers/${e.dossier}`} className="hit">
            <b>{e.dossier}</b>
            <span>{e.action} · {new Date(e.date).toLocaleString('fr-FR')}</span>
          </Link>
        ))}
      </Group>
      <Group title="Rendez-vous" n={result.rdvs.length}>
        {result.rdvs.map((a) => (
          <Link key={a.id} href={`${base}/calendrier`} className="hit">
            <b>{a.dossier}</b>
            <span>{new Date(a.debut).toLocaleString('fr-FR')} · {a.lieu} · {a.statut}</span>
          </Link>
        ))}
      </Group>
      <Group title="Bureau" n={result.bureau.length + result.tags.length}>
        {result.bureau.map((p) => <div key={p.id} className="hit"><b>{p.nom}</b><span>{p.role === 'juriste' ? 'Juriste' : 'Assistant'} · présence</span></div>)}
        {result.tags.map((t) => <div key={t.id} className="hit"><b>{t.label}</b><span>Tag de présence · {tagOf(t.id).color}</span></div>)}
      </Group>
    </div>
  );
}

function Group({ title, n, children }: { title: string; n: number; children: ReactNode }) {
  if (!n) return null;
  return (
    <section className="card">
      <h2>{title} · {n}</h2>
      {children}
    </section>
  );
}

const CSS = `
.jx-sea { color: #18213b; font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
.jx-sea * { box-sizing: border-box; }
.jx-sea h1 { margin: 4px 0 0; font-size: 28px; letter-spacing: -.03em; color: #0b1330; }
.jx-sea h2 { margin: 0 0 8px; font-size: 14px; color: #0b1330; }
.jx-sea .kicker { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #0aa8bd; font-weight: 800; }
.jx-sea .sub, .jx-sea .note { color: #62708a; font-size: 13px; line-height: 1.45; }
.jx-sea .search { margin: 14px 0; }
.jx-sea input { width: min(640px, 100%); border: 1px solid #e4e8f1; border-radius: 12px; padding: 12px 14px; font: inherit; color: #18213b; }
.jx-sea .groups { display: grid; gap: 10px; }
.jx-sea .card { background: #fff; border: 1px solid #e4e8f1; border-radius: 18px; padding: 14px; }
.jx-sea .hit { display: block; padding: 8px 0; border-top: 1px solid #e4e8f1; color: inherit; text-decoration: none; }
.jx-sea .hit b { display: block; color: #0b1330; }
.jx-sea .hit span { display: block; margin-top: 2px; color: #62708a; font-size: 12.5px; }
`;
