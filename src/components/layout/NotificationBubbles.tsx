'use client';

/**
 * Bulles de notification pour les sous-onglets de Dossiers.
 * Une bulle s'affiche quand il y a un nouveau dossier assigné à une étape spécifique.
 * La notification disparaît après avoir été "lue" (clic sur l'icône).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NotificationBubbleProps {
  stepId: string;
  label: string;
  echeance: string;
}

export function NotificationBubble({ stepId, label, echeance }: NotificationBubbleProps) {
  const [count, setCount] = useState(0);
  const [read, setRead] = useState(false);
  const stepKey = `${stepId}-${label}`;

  // Charger le nombre de dossiers pour cette étape depuis le workflow-store
  // Dans un cas réel, ce serait une API ou un useSyncExternalStore sur snap.cases
  useEffect(() => {
    // Simuler un chargement des notifications (à remplacer par l'API réelle)
    const unsubscribe = setTimeout(() => {
      setCount(1); // Nombre de nouveaux dossiers pour cette étape
    }, 0);

    return () => clearTimeout(unsubscribe);
  }, [stepId]);

  const handleRead = () => {
    if (count > 0) {
      setCount(0); // Mark as read
      window.location.reload(); // Recharger la page pour mettre à jour le compteur
    }
  };

  if (count === 0 || read) {
    return null;
  }

  return (
    <div className="notification-bubble" data-step-id={stepId}>
      <Link href={`/admin/dossiers?etape=${stepId}`} aria-label={`Dossiers pour ${label}`}>
        <span className="bubble-icon" onClick={handleRead} title="Aperçu de la notification">
          📬
        </span>
        <span className="bubble-count">{count}</span>
      </Link>
    </div>
  );
}
