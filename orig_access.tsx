'use client';

import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function AccessPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--fond-page)' }}>
      {/* En-t├¬te */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px',
        borderBottom: '1px solid var(--filet)', background: 'var(--blanc)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 16 }}>ACX Flow</span>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--texte-secondaire)' }}>
          <a href="https://acx.ma/" style={{ color: 'var(--cyan-fonce)', textDecoration: 'none' }} target="_blank" rel="noopener">
            By ACX Maroc
          </a>
        </div>
      </header>

      {/* Corps */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 10 }}>
        <div style={{ width: 80, height: 36, background: 'var(--blanc)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--navy)', fontSize: 13, letterSpacing: '0.1em' }}>
          ACX Flow
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--encre)' }}>
          Acc├¿s d├®mo
        </h1>
        <p style={{ color: 'var(--texte-secondaire)', maxWidth: 420, margin: '0 auto' }}>
          S├®lectionnez votre r├┤le pour acc├®der ├á la d├®mo. Les donn├®es affich├®es sont fictives et ├®tiquet├®es ┬½ D├®mo ┬╗.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, width: '100%', maxWidth: 480 }}>
          {[
            { role: 'admin' as const, label: 'Admin', desc: 'Responsable du d├®partement. Il voit le flux des dossiers et la pr├®sence de l\'├®quipe.' },
            { role: 'juriste' as const, label: 'Juriste', desc: 'Il traite les dossiers et pointe. Deux places : Juriste 1, Juriste 2.' },
            { role: 'assistant' as const, label: 'Assistant', desc: 'Il r├®ceptionne, note la remise et la r├®ception des documents, et scanne le QR d\'un rendez-vous. Trois places : Assistant 1, Assistant 2, Assistant 3.' },
          ].map((item) => (
            <Link
              key={item.role}
              href={`/${item.role}`}
              className="btn-primary"
              style={{ textDecoration: 'none', width: '100%', justifyContent: 'space-between' }}
            >
              <span>{DemoLabel(item.role)}</span>
              <span style={{ fontSize: 12, color: 'var(--blanc)', fontWeight: 600 }}>D├®mo</span>
            </Link>
          ))}
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--texte-secondaire)' }}>
          Pour le directeur et les tests. Aucun mot de passe.
        </p>
      </div>

      {/* Pied de page */}
      <footer style={{ padding: '16px 24px', fontSize: 12, color: 'var(--texte-secondaire)', borderTop: '1px solid var(--filet)', marginTop: 32 }}>
        ┬® {new Date().getFullYear()} ACX Maroc ┬À <a href="https://acx.ma/" style={{ color: 'var(--cyan-fonce)' }} target="_blank" rel="noopener">acx.ma</a>
      </footer>
    </div>
  );
}

function DemoLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Admin',
    juriste: 'Juriste',
    assistant: 'Assistant',
  };
  return labels[role] || role;
}
