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



  return (
    <form onSubmit={handleSubmit} className="g-form">
      {message && (
        <div className="g-note is-ok">
          {message}
        </div>
      )}

      <div className="g-form-grid">
        <div className="g-field">
          <label>Référence (laisser vide pour auto)</label>
          <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="DEMO-2026-0012" />
        </div>
        <div className="g-field">
          <label>Identifiant agent</label>
          <input value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="person-juriste-1" />
        </div>
        <div className="g-field">
          <label>Activité (LOB)</label>
          <input value={lob} onChange={(e) => setLob(e.target.value)} />
        </div>
        <div className="g-field">
          <label>Département</label>
          <input value={department} onChange={(e) => setDepartment(e.target.value)} />
        </div>
        <div className="g-field">
          <label>Juriste assigné</label>
          <select value={juristeId} onChange={(e) => setJuristeId(e.target.value)}>
            <option value="">Aucun</option>
            <option value="person-juriste-1">Juriste 1</option>
            <option value="person-juriste-2">Juriste 2</option>
          </select>
        </div>
        <div className="g-field">
          <label>Étape initiale</label>
          <select value={etape} onChange={(e) => setEtape(e.target.value)}>
            {Object.entries(ETAPE_LABELS).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>
        <div className="g-field">
          <label>Statut</label>
          <input value={statut} onChange={(e) => setStatut(e.target.value)} />
        </div>
        <div className="g-field">
          <label>Créé par</label>
          <input value={creePar} onChange={(e) => setCreePar(e.target.value)} />
        </div>
        <div className="g-field">
          <label>Échéance</label>
          <input type="date" value={echeance} onChange={(e) => setEcheance(e.target.value)} />
        </div>
      </div>

      <label className="g-check">
        <input type="checkbox" checked={reception} onChange={(e) => setReception(e.target.checked)} />
        Réception notée
      </label>

      <div>
        <button type="submit" className="g-btn">Saisir le dossier</button>
      </div>
    </form>
  );
}