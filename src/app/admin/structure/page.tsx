'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FlowBanner, FlowName } from '@/components/brand/FlowBrand';
import { DEMO_LOBS } from '@/lib/demo-people';

type Affectation = {
  id: string;
  mois: string;
  lob: string;
  department: string;
  tl: string | null;
  sspv: string | null;
  agent?: string;
};

const MOIS_DEF = new Date().toISOString().slice(0, 7);

const AFFECTATIONS_INIT: Affectation[] = [
  { id: 'aff-1', mois: MOIS_DEF, lob: 'VL', department: 'VL', tl: null, sspv: null, agent: undefined },
  { id: 'aff-2', mois: MOIS_DEF, lob: 'GV', department: 'SAC', tl: null, sspv: null, agent: undefined },
  { id: 'aff-3', mois: MOIS_DEF, lob: 'VL', department: 'RET', tl: null, sspv: null, agent: undefined },
];

export default function StructurePage() {
  const [affectations, setAffectations] = useState<Affectation[]>([...AFFECTATIONS_INIT]);
  const [importMois, setImportMois] = useState(MOIS_DEF);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'bad' | null>(null);
  const [filterLob, setFilterLob] = useState<string>('tous');
  const [searchAgent, setSearchAgent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ department: string; tl: string; sspv: string; agent: string }>({
    department: '', tl: '', sspv: '', agent: '',
  });

  const filtered = useMemo(() => {
    return affectations.filter((a) => {
      if (filterLob !== 'tous' && a.lob !== filterLob) return false;
      if (searchAgent && !(a.agent || '').toLowerCase().includes(searchAgent.toLowerCase())) return false;
      return true;
    });
  }, [affectations, filterLob, searchAgent]);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportFile(e.target.files?.[0] || null);
    setImportStatus(null);
  };

  const handleImport = () => {
    if (!importFile) { setImportStatus('bad'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lignes = text.split('\n').filter(l => l.trim());
      setAffectations((prev) => [
        ...prev.filter((a) => a.mois !== importMois),
        ...lignes.map((l, i) => {
          const [lob, department, tl, sspv, agent] = l.split(';').map(s => s.trim());
          return {
            id: 'aff-import-' + importMois + '-' + i,
            mois: importMois,
            lob: lob || 'VL',
            department: department || '',
            tl: tl || null,
            sspv: sspv || null,
            agent: agent || undefined,
          };
        }),
      ]);
      setImportStatus('ok');
      setImportFile(null);
    };
    reader.readAsText(importFile);
  };

  const startEdit = (a: Affectation) => {
    setEditingId(a.id);
    setEditValues({
      department: a.department,
      tl: a.tl || '',
      sspv: a.sspv || '',
      agent: a.agent || '',
    });
  };

  const saveEdit = () => {
    setAffectations((prev) => prev.map((a) => {
      if (a.id !== editingId) return a;
      return {
        ...a,
        department: editValues.department,
        tl: editValues.tl || null,
        sspv: editValues.sspv || null,
        agent: editValues.agent || undefined,
      };
    }));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif', color: '#18213b', minHeight: '100vh', background: '#f6f7fb' }}>
      <FlowBanner
        title={<FlowName />}
        chip="Structure"
        subtitle="Gestion des structures LOB / départements / TL / SPV par mois. Import de fichier et modifications manuelles."
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-.03em', color: '#0b1330' }}>Structure des équipes</h1>
            <p style={{ fontSize: 13, color: '#62708a', margin: '4px 0 0' }}>
              Chaque mois, un nouveau fichier met à jour les structures. On peut aussi rechercher un agent et modifier une entrée manuellement.
            </p>
          </div>
          <Link href="/admin" style={{ background: '#0b1330', color: '#fff', borderRadius: 999, padding: '8px 14px', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            Retour tableau de bord
          </Link>
        </header>
      </FlowBanner>

      <div style={{ background: '#fff', border: '1px solid #e4e8f1', borderRadius: 18, padding: 16, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0b1330', margin: '0 0 12px' }}>Import de structure mensuelle</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12, alignItems: 'end' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: '#62708a', textTransform: 'uppercase', letterSpacing: '.08em' }}>Mois (AAAA-MM)</label>
            <input
              type="month"
              value={importMois}
              onChange={(e) => setImportMois(e.target.value)}
              style={{ width: 140, padding: '9px 12px', border: '1px solid #e4e8f1', borderRadius: 10, background: '#fff', color: '#18213b', font: 'inherit' }}
            />
            <label style={{ fontSize: 12, fontWeight: 800, color: '#62708a', textTransform: 'uppercase', letterSpacing: '.08em', marginLeft: 12 }}>Fichier</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleImportFile}
              style={{ padding: '8px 10px', border: '1px solid #e4e8f1', borderRadius: 10, background: '#fff', color: '#18213b', font: 'inherit' }}
            />
            {importFile && <span style={{ fontSize: 12, color: '#0aa8bd', fontWeight: 700 }}>{importFile.name}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleImport}
              disabled={!importFile}
              style={{
                background: importFile ? '#0b1330' : '#c5cee2',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: 13,
                cursor: importFile ? 'pointer' : 'not-allowed',
                opacity: importFile ? 1 : 0.5,
              }}
            >
              Importer le fichier
            </button>
            {importStatus === 'ok' && <span style={{ color: '#1f8a56', fontSize: 12, fontWeight: 700, marginLeft: 8 }}>Importé pour {importMois}</span>}
            {importStatus === 'bad' && <span style={{ color: '#b42318', fontSize: 12, fontWeight: 700, marginLeft: 8 }}>Fichier requis</span>}
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#62708a', marginTop: 8 }}>
          Format attendu par ligne : LOB ; Département ; TL ; SPV ; Agent (séparés par des points-virgules). Aucun fichier n'est stocké sur le serveur.
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e4e8f1', borderRadius: 18, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0b1330', margin: 0 }}>Affectations par LOB</h2>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#62708a', textTransform: 'uppercase', letterSpacing: '.08em' }}>Filtrer par LOB</span>
          <select
            value={filterLob}
            onChange={(e) => setFilterLob(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e4e8f1', borderRadius: 10, background: '#fff', color: '#18213b', font: 'inherit', fontSize: 13 }}
          >
            <option value="tous">Tous les LOB</option>
            {DEMO_LOBS.map((l) => (
              <option key={String(l)} value={String(l)}>{String(l)}</option>
            ))}
          </select>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#62708a', textTransform: 'uppercase', letterSpacing: '.08em', marginLeft: 12 }}>Rechercher un agent</span>
          <input
            type="text"
            value={searchAgent}
            onChange={(e) => setSearchAgent(e.target.value)}
            placeholder="Identifiant ou nom de l'agent…"
            style={{ width: 220, padding: '8px 12px', border: '1px solid #e4e8f1', borderRadius: 10, background: '#fff', color: '#18213b', font: 'inherit', fontSize: 13 }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#62708a', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid #e4e8f1', color: '#0b1330' }}>Mois</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid #e4e8f1', color: '#0b1330' }}>LOB</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid #e4e8f1', color: '#0b1330' }}>Département</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid #e4e8f1', color: '#0b1330' }}>TL</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid #e4e8f1', color: '#0b1330' }}>SPV</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid #e4e8f1', color: '#0b1330' }}>Agent</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid #e4e8f1', color: '#0b1330', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#62708a' }}>
                    Aucune affectation trouvée pour ces filtres.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #e4e8f1' }}>
                    <td style={{ padding: '10px 8px', color: '#18213b', fontWeight: 600 }}>{a.mois}</td>
                    <td style={{ padding: '10px 8px', color: '#18213b' }}>
                      <span style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{a.lob}</span>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#18213b' }}>
                      {editingId === a.id ? (
                        <input
                          value={editValues.department}
                          onChange={(e) => setEditValues({ ...editValues, department: e.target.value })}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #e4e8f1', borderRadius: 6, font: 'inherit', fontSize: 12 }}
                        />
                      ) : (a.department || '—')}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#18213b' }}>
                      {editingId === a.id ? (
                        <input
                          value={editValues.tl}
                          onChange={(e) => setEditValues({ ...editValues, tl: e.target.value })}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #e4e8f1', borderRadius: 6, font: 'inherit', fontSize: 12 }}
                        />
                      ) : (a.tl || '—')}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#18213b' }}>
                      {editingId === a.id ? (
                        <input
                          value={editValues.sspv}
                          onChange={(e) => setEditValues({ ...editValues, sspv: e.target.value })}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #e4e8f1', borderRadius: 6, font: 'inherit', fontSize: 12 }}
                        />
                      ) : (a.sspv || '—')}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#18213b' }}>
                      {editingId === a.id ? (
                        <input
                          value={editValues.agent}
                          onChange={(e) => setEditValues({ ...editValues, agent: e.target.value })}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #e4e8f1', borderRadius: 6, font: 'inherit', fontSize: 12 }}
                        />
                      ) : (a.agent || '—')}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      {editingId === a.id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            style={{ background: '#0b1330', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', fontWeight: 700, fontSize: 12, marginRight: 4, cursor: 'pointer' }}
                          >
                            Enregistrer
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{ background: '#fff', color: '#0b1330', border: '1px solid #e4e8f1', borderRadius: 6, padding: '6px 10px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                          >
                            Annuler
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(a)}
                          style={{ background: '#0b1330', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                        >
                          Modifier l'entrée
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize: 11, color: '#62708a', marginTop: 16, textAlign: 'center' }}>
        Les agents, TL et SPV ne sont pas des comptes. Leurs adresses seront ajoutées plus tard, automatiquement. Aucun champ d'adresse n'est saisi ici.
      </p>
    </div>
  );
}