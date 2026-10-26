'use client';

export default function GlobalErrorPage() {
  return <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
    <div className="bg-card p-8 rounded-2xl text-center">
      <h1 className="text-3xl font-bold text-navy mb-4">Erreur 404</h1>
      <p className="text-muted-foreground mb-6">La page demandée n'existe pas.</p>
      <a href="/" className="text-cyan-600 hover text-cyan-700 transition-colors">
        Retour à l'accueil
      </a>
    </div>
  </div>;
}