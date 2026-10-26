'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCase } from '@/lib/workflow-store';
import { ETAPE_LABELS } from '@/lib/workflow-ui';

interface SaisieDossierFormProps {
  redirectBase?: string;
  defaultCreePar?: string;
}

export default function SaisieDossierForm({ redirectBase, defaultCreePar = 'Assistant 1' }: SaisieDossierFormProps) {
  const router = useRouter();
  const [reference, setReference] = useState('');
  const [agentId, setAgentId] = useState('');
  const [lob, setLob] = useState('VL');
  const [department, setDepartment] = useState('VL');
  const [juristeId, setJuristeId] = useState('');
  const [etape, setEtape] = useState('constatation_recue');
  const [statut, setStatut] = useState('En cours');
  const [reception, setReception] = useState(false);
  const [creePar, setCreePar] = useState(defaultCreePar);
  const [echeance, setEcheance] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const created = createCase({
      reference: reference.trim() || undefined,
      agentId: agentId.trim() || null,
      affectationFixe: { lob, department },
      juristeId: juristeId || null,
      etape,
      statut,
      reception,
      creePar: creePar.trim() || 'Saisie',
      echeance: echeance ? new Date(echeance).toISOString() : undefined,
    });
    setMessage(`Dossier ${created.reference} saisi avec succès.`);
    if (redirectBase) {
      router.push(`${redirectBase}/${created.reference}`);
    } else {
      setReference('');
      setAgentId('');
      setLob('VL');
      setDepartment('VL');
      setJuristeId('');
      setEtape('constatation_recue');
      setStatut('En cours');
      setReception(false);
      setCreePar(defaultCreePar);
      setEcheance('');
    }
  }

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--filet)', borderRadius: 6, fontFamily: 'var(--font-inter)' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
      {message && (
        <div style={{ padding: '10px 12px', background: 'var(--fond)', borderRadius: 6, color: 'var(--encre)', fontSize: 13, fontWeight: 600 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="field">
          <label>Référence (laisser vide pour auto)</label>
          <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="DEMO-2026-0012" style={inputStyle} />
        </div>
        <div className="field">
          <label>Identifiant agent</label>
          <input value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="person-juriste-1" style={inputStyle} />
        </div>
        <div className="field">
          <label>Activité (LOB)</label>
          <input value={lob} onChange={(e) => setLob(e.target.value)} style={inputStyle} />
        </div>
        <div className="field">
          <label>Département</label>
          <input value={department} onChange={(e) => setDepartment(e.target.value)} style={inputStyle} />
        </div>
        <div className="field">
          <label>Juriste assigné</label>
          <select value={juristeId} onChange={(e) => setJuristeId(e.target.value)} style={inputStyle}>
            <option value="">Aucun</option>
            <option value="person-juriste-1">Juriste 1</option>
            <option value="person-juriste-2">Juriste 2</option>
          </select>
        </div>
        <div className="field">
          <label>Étape initiale</label>
          <select value={etape} onChange={(e) => setEtape(e.target.value)} style={inputStyle}>
            {Object.entries(ETAPE_LABELS).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Statut</label>
          <input value={statut} onChange={(e) => setStatut(e.target.value)} style={inputStyle} />
        </div>
        <div className="field">
          <label>Créé par</label>
          <input value={creePar} onChange={(e) => setCreePar(e.target.value)} style={inputStyle} />
        </div>
        <div className="field">
          <label>Échéance</label>
          <input type="date" value={echeance} onChange={(e) => setEcheance(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--encre)' }}>
        <input type="checkbox" checked={reception} onChange={(e) => setReception(e.target.checked)} />
        Réception notée
      </label>

      <div>
        <button type="submit" className="btn-primary">Saisir le dossier</button>
      </div>
    </form>
  );
}