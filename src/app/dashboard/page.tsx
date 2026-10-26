"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatCard {
  title: string;
  value: string;
  description: string;
  color: 'navy' | 'cyan' | 'muted';
}

const stats: StatCard[] = [
  { title: 'Dossiers reçus', value: '3', description: '', color: 'navy' },
  { title: 'En cours', value: '5', description: '', color: 'cyan' },
  { title: 'En retard', value: '0', description: '', color: 'muted' },
  { title: 'Places de pointeurs', value: '5', description: '', color: 'navy' },
];

const steps = [
  { label: 'Constatations', count: 3 },
  { label: 'Analyse', count: 2 },
  { label: 'Convocations', count: 2 },
  { label: 'Séances', count: 0 },
];

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="sidebar flow-sidebar bg-sidebar flow-navy text-sidebar-foreground flex-shrink-0 w-64">
        <div className="sidebar-brand p-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-sm font-bold">ACX</div>
            <span className="sidebar-brand-label text-lg font-bold">ACX Flow</span>
          </div>
        </div>

        <nav className="sidebar-nav flex-1 overflow-y-auto px-4">
          <div className="space-y-1">
            {['Tableau de bord', 'Dossiers', 'Constatations', 'Analyse', 'Convocations', 'Séances', 'Décisions', 'Échéances', 'Clos', 'Présence', 'Calendrier', 'Recherche'].map((item, i) => (
              <a key={i} href="#" className={`sidebar-item flow-item block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${i === 0 ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                {item}
              </a>
            ))}
          </div>
        </nav>

        <div className="sidebar-user p-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 mb-4">
            <div className="w-8 h-8 rounded-full bg-flow-cyan text-[#0b1330] flex items-center justify-center text-xs font-bold">U</div>
            <div className="flex-1 min-w-0">
              <div className="sidebar-user-name text-sm font-semibold text-white truncate">Utilisateur</div>
              <div className="sidebar-user-role text-xs text-white/60 uppercase tracking-wider">Démo</div>
            </div>
          </div>
          <div className="sidebar-user-version text-[10px] text-white/40 uppercase tracking-wider text-center">Démo v1.0</div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-flow-background">
        <header className="flow-header border-b flow-border bg-card flow-text px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-flow-navy text-flow-navy-foreground flex items-center justify-center text-xs font-bold">D</div>
            <h2 className="text-xl font-semibold flow-text">Tableau de bord</h2>
          </div>
          <div className="text-right text-sm flow-muted cursor-pointer hover:text-flow-cyan transition-colors">
            Voir tous les dossiers
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-8">
          {stats.map((stat, i) => (
            <Card key={i} className="flow-card flow-border">
              <CardHeader>
                <div className="flex justify-between">
                  <span className="text-sm flow-muted">{stat.title}</span>
                  <Badge variant="outline" className={`text-flow-${stat.color} text-xs border-flow-${stat.color}/30`}>
                    {stat.value}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold flow-text">{stat.value}</div>
                <p className="text-flow-muted text-sm">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid max-w-2xl mx-auto gap-6 p-8">
          <Card className="flow-card flow-border">
            <CardHeader>
              <CardTitle className="flow-text">Répartition par étape</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {steps.map((step) => (
                  <div key={step.label} className="flex-1 min-w-[120px]">
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-flow-background text-flow-text text-sm font-medium border border-flow-border">
                      <span>{step.label}</span>
                      <span>{step.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="flow-card flow-border">
            <CardHeader>
              <CardTitle className="flow-text">Échéances du jour</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-flow-muted text-center text-sm py-8">
                Aucune échéance prévue aujourd'hui.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}