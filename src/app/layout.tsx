import type { Metadata } from 'next';
import '@/styles/globals.css';
import type { ReactNode } from 'react';
import { SessionProvider } from '@/components/providers/session-provider'

export const metadata: Metadata = {
  title: 'ACX Flow',
  description: 'Application Juridique - Activité Xceed',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y=".9em" font-size="28">ACX</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-background text-foreground antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

