'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSyncExternalStore } from 'react';
import { getWorkflowState, subscribeWorkflow } from '@/lib/workflow-store';
import { ETAPE_LABELS, PROCESS_ORDER } from '@/lib/workflow-ui';
import { formatDateFr } from '@/lib/format';

export default function AvancementPage() {
  const snap = useSyncExternalStore(subscribeWorkflow, getWorkflowState, getWorkflowState);
  const [query, setQuery] = useState('');
  const [selectedRef, setSelectedRef] = useState('');
  const [searchError, setSearchError] = useState('');
const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const total = snap.cases.length;
  const clos = snap.cases.filter((c) => c.etape === 'cloture').length;
  const retard = snap.cases.filter((c) => !!c.echeance && new Date(c.echeance) < new Date()).length;
  const dansDelai = total - clos - retard;

  const workflowSteps = PROCESS_ORDER.map((code) => {
    const casesInStep = snap.cases.filter((c) => c.etape === code);
    const overdue = casesInStep.filter((c) => !!c.echeance && new Date(c.echeance) < new Date()).length;
    const dueSoon = casesInStep.filter((c) => !!c.echeance && new Date(c.echeance) >= new Date() && new Date(c.echeance).getTime() - Date.now() <= 2 * 24 * 3600000).length;
    const color = code === 'cloture' ? '#2a8c5a' : overdue > 0 ? '#a00' : dueSoon > 0 ? '#b45309' : 'var(--navy)';
    return { code, label: ETAPE_LABELS[code] || code, count: casesInStep.length, overdue, dueSoon, color };
  });

  const criticalDossiers = snap.cases
    .filter((c) => !!c.echeance && c.etape !== 'cloture')
    .map((c) => ({ ...c, diff: new Date(c.echeance!).getTime() - Date.now() }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 10);

  const foundDossier = selectedRef ? snap.cases.find((c) => c.reference.toLowerCase() === selectedRef.toLowerCase()) : undefined;

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const ref = query.trim();
    if (!ref) {
      setSearchError('Saisissez une reference de dossier.');
      setSelectedRef('');
      return;
    }
    const match = snap.cases.find((c) => c.reference.toLowerCase() === ref.toLowerCase());
    if (!match) {
      setSearchError('Aucun dossier trouve pour cette reference.');
      setSelectedRef('');
      return;
    }
    setSearchError('');
    setSelectedRef(match.reference);
  }

  return (
    <div className="wrap-admin">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '18px 22px', borderRadius: 18, background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 50%,#7c3aed 100%)', color: '#fff', boxShadow: '0 16px 40px rgba(37,99,235,.25)' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-.5px' }}>Avancement</h1>
        </div>
        <Link href="/juriste" className="btn-pill" style={{ background: 'rgba(255,255,255,.18)', color: '#fff', border: '1px solid rgba(255,255,255,.35)' }}>Tableau de bord</Link>
      </header>
      <style>{`
        .wrap-admin { background: linear-gradient(180deg,#f1f5f9 0%,#e2e8f0 100%); min-height: 100vh; }
        .pro-card { background: #fff; border-radius: 18px; box-shadow: 0 12px 32px rgba(15,23,42,.08); border: 1px solid rgba(148,163,184,.18); }
        .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(0,0,0,.18); }
        .wf-node { transition: transform 0.18s ease, filter 0.18s ease; transform-box: fill-box; transform-origin: center; }
        .wf-node:hover { transform: scale(1.06); filter: drop-shadow(0 6px 12px rgba(0,0,0,0.18)); }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginTop: 16 }}>
        {[
          { label: 'Dossiers', value: total, from: '#2563eb', to: '#1d4ed8', icon: '📁' },
          { label: 'Clos', value: clos, from: '#10b981', to: '#059669', icon: '✅' },
          { label: 'En retard', value: retard, from: '#ef4444', to: '#dc2626', icon: '⏰' },
          { label: 'Dans le délai', value: dansDelai, from: '#06b6d4', to: '#0891b2', icon: '📈' },
        ].map((k) => (
          <div key={k.label} className="kpi-card" style={{ background: `linear-gradient(135deg, ${k.from}, ${k.to})`, color: '#fff', borderRadius: 18, padding: '18px 20px', boxShadow: `0 12px 28px ${k.from}44`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'transform .2s ease, box-shadow .2s ease' }}>
            <div>
              <div style={{ fontSize: 11, opacity: .9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6 }}>{k.label}</div>
              <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, marginTop: 4 }}>{k.value}</div>
            </div>
            <div style={{ fontSize: 30, opacity: .95 }}>{k.icon}</div>
          </div>
        ))}
      </div>

      <div className="card pro-card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Schema du workflow et alertes critiques</h2>
        <div style={{ position: 'relative', width: '100%', maxWidth: 900, margin: '0 auto', aspectRatio: '900 / 1180' }}>
          <svg viewBox="0 0 900 1180" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <defs>
              <marker id="arrowv" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
              </marker>
            </defs>
            {[
              ['constatation_recue','analyse_gravite'],
              ['analyse_gravite','sanction_faute_non_grave'],
              ['analyse_gravite','convocation_seance'],
              ['sanction_faute_non_grave','cloture'],
              ['convocation_seance','seance_presente'],
              ['convocation_seance','seance_absente'],
              ['seance_presente','pv_seance'],
              ['seance_absente','depot_inspection_absence'],
              ['pv_seance','decision_licenciement'],
              ['pv_seance','decision_mise_a_pied'],
              ['pv_seance','decision_sanction'],
              ['pv_seance','fin_procedure'],
              ['depot_inspection_absence','investigations'],
              ['investigations','decision_licenciement'],
              ['investigations','decision_mise_a_pied'],
              ['investigations','decision_sanction'],
              ['investigations','fin_procedure'],
              ['decision_licenciement','notification_48h'],
              ['decision_mise_a_pied','notification_48h'],
              ['notification_48h','depot_inspection_decision'],
              ['depot_inspection_decision','cloture'],
              ['decision_sanction','cloture'],
              ['fin_procedure','cloture'],
            ].map(([a,b], idx) => {
              const P = { constatation_recue:[450,60], analyse_gravite:[450,160], sanction_faute_non_grave:[165,280], convocation_seance:[735,280], seance_presente:[285,390], pv_seance:[285,500], seance_absente:[605,390], depot_inspection_absence:[605,500], decision_licenciement:[285,610], decision_mise_a_pied:[285,680], decision_sanction:[285,750], fin_procedure:[285,820], investigations:[605,610], notification_48h:[450,910], depot_inspection_decision:[445,1000], cloture:[445,1090] };
              const pa = (P as any)[a]; const pb = (P as any)[b];
              return <line key={idx} x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrowv)" opacity="0.75" />;
            })}
          </svg>
          {[
            ['constatation_recue',365,30],
            ['analyse_gravite',365,130],
            ['sanction_faute_non_grave',80,250],
            ['convocation_seance',650,250],
            ['seance_presente',200,360],
            ['pv_seance',200,470],
            ['seance_absente',520,360],
            ['depot_inspection_absence',520,470],
            ['decision_licenciement',200,580],
            ['decision_mise_a_pied',200,650],
            ['decision_sanction',200,720],
            ['fin_procedure',200,790],
            ['investigations',520,580],
            ['notification_48h',365,880],
            ['depot_inspection_decision',360,970],
            ['cloture',360,1060],
          ].map(([code,x,y]) => {
            const step = workflowSteps.find((w) => w.code === code)!;
            const isFound = foundDossier?.etape === code;
            const isSelected = selectedStep === code;
            const vivid = step.color === 'var(--navy)' ? '#2563eb' : step.color;
            return (
              <button key={code} type="button" onClick={() => setSelectedStep(isSelected ? null : String(code))} style={{ position: 'absolute', left: `${(Number(x)/900)*100}%`, top: `${(Number(y)/1180)*100}%`, width: `${(170/900)*100}%`, height: `${(60/1180)*100}%`, border: `2px solid ${isSelected ? '#f59e0b' : isFound ? '#f59e0b' : vivid}`, borderRadius: 14, background: isFound ? '#fffbeb' : '#ffffff', color: '#1f2937', boxShadow: isSelected ? '0 0 0 3px rgba(245,158,11,.35), 0 8px 20px rgba(15,23,42,.18)' : '0 6px 16px rgba(15,23,42,.12)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: 0, transition: 'transform .18s ease, box-shadow .18s ease', transform: isSelected ? 'scale(1.06)' : 'scale(1)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.1, textAlign: 'center' }}>{step.label}</span>
                <span style={{ fontSize: 17, fontWeight: 800, color: vivid, lineHeight: 1 }}>{step.count}</span>
                {isFound && <span style={{ position: 'absolute', top: -16, fontSize: 10, fontWeight: 700, color: '#b45309' }}>Dossier ici</span>}
              </button>
            );
          })}
        </div>
        {selectedStep && (
          <div className="wf-bubble" style={{ marginTop: 12, padding: '12px 16px', borderRadius: 14, background: '#ffffff', border: '2px solid #2563eb', boxShadow: '0 10px 28px rgba(37,99,235,0.18)', fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
              {ETAPE_LABELS[selectedStep] || selectedStep} - {snap.cases.filter((c) => c.etape === selectedStep).length} dossier(s)
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {snap.cases.filter((c) => c.etape === selectedStep).map((c) => (
                <Link key={c.reference} href={`/juriste/dossiers/${c.reference}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, textDecoration: 'none', color: 'var(--encre)', padding: '6px 8px', borderRadius: 8, background: '#2563eb0d' }}>
                  <span style={{ fontWeight: 600 }}>{c.reference}</span>
                  <span style={{ fontSize: 12, color: 'var(--texte-secondaire)' }}>{c.juriste?.nom || '-'} - {c.echeance ? new Date(c.echeance).toLocaleDateString('fr-FR') : 'sans echeance'}</span>
                </Link>
              ))}
              {snap.cases.filter((c) => c.etape === selectedStep).length === 0 && (
                <div style={{ color: 'var(--texte-secondaire)' }}>Aucun dossier.</div>
              )}
            </div>
            <button type="button" className="btn-pill" style={{ marginTop: 8 }} onClick={() => setSelectedStep(null)}>Fermer</button>
          </div>
        )}
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--texte-secondaire)', textAlign: 'center' }}>
          Schema vertical du workflow selon les decisions. Couleurs : vert = clos, rouge = retard, orange = echeance proche, bleu = dans le delai. Cliquez sur une carte pour afficher les dossiers de l'etape.
        </div>
      </div>
      <div className="card pro-card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Rechercher un dossier dans le schema</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Reference du dossier (ex. REF-001)"
            style={{ flex: 1, minWidth: 220, padding: '8px 12px', border: '1px solid var(--filet)', borderRadius: 6 }}
          />
          <button type="submit" className="btn-pill">Rechercher</button>
          {selectedRef && (
            <button type="button" className="btn-pill" onClick={() => { setSelectedRef(''); setQuery(''); setSearchError(''); }}>
              Effacer
            </button>
          )}
        </form>
        {searchError && <div style={{ marginTop: 8, color: '#a00', fontSize: 13 }}>{searchError}</div>}
        {foundDossier && (
          <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 8, border: '1px solid var(--filet)', background: 'var(--fond-carte, #f9fafb)' }}>
            <div style={{ fontWeight: 700, color: 'var(--encre)', marginBottom: 6 }}>Apercu du dossier - {foundDossier.reference}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6, fontSize: 13 }}>
              <div><strong>Agent :</strong> {foundDossier.agentId}</div>
              <div><strong>Activite :</strong> {foundDossier.affectationFixe?.lob || '-'} / {foundDossier.affectationFixe?.department || '-'}</div>
              <div><strong>Juriste :</strong> {foundDossier.juriste?.nom || '-'}</div>
              <div><strong>Etape :</strong> {ETAPE_LABELS[foundDossier.etape] || foundDossier.etape}</div>
              <div><strong>Statut :</strong> {foundDossier.statut}</div>
              <div><strong>Reception :</strong> {foundDossier.reception ? 'Oui' : 'Non'}</div>
              <div><strong>Cree par :</strong> {foundDossier.creePar || '-'}</div>
              <div><strong>Echeance :</strong> {foundDossier.echeance ? formatDateFr(foundDossier.echeance) : '-'}</div>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: foundDossier.echeance && new Date(foundDossier.echeance) < new Date() ? '#a00' : 'var(--texte-secondaire)' }}>
              {foundDossier.echeance && new Date(foundDossier.echeance) < new Date() ? 'Dossier en retard.' : foundDossier.etape === 'cloture' ? 'Dossier clos.' : 'Dossier dans le delai.'}
            </div>
            <Link href={`/juriste/dossiers/${foundDossier.reference}`} className="btn-pill" style={{ marginTop: 8, display: 'inline-flex' }}>Ouvrir le dossier</Link>
          </div>
        )}
      </div>

      <div className="card pro-card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre)', marginBottom: 12 }}>Alertes critiques</h2>
        {criticalDossiers.length === 0 ? (
          <div style={{ padding: '20px', color: 'var(--texte-secondaire)', textAlign: 'center' }}>Aucune alerte critique.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {criticalDossiers.map((c: any) => {
              const overdue = c.diff < 0;
              const soon = c.diff >= 0 && c.diff <= 2 * 24 * 3600000;
              const color = overdue ? '#a00' : soon ? '#b45309' : 'var(--navy)';
              return (
                <Link key={c.reference} href={`/juriste/dossiers/${c.reference}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, textDecoration: 'none', color: 'var(--encre)', padding: '8px 10px', borderLeft: `4px solid ${color}` }}>
                  <span style={{ fontWeight: 600 }}>{c.reference}</span>
                  <span style={{ fontSize: 12, color }}>{overdue ? 'En retard' : soon ? 'Echeance proche' : 'Dans le delai'} - {c.echeance ? new Date(c.echeance).toLocaleDateString('fr-FR') : ''}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
