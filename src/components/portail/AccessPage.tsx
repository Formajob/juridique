'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Logo from '@/components/ui/Logo';

export default function AccessPage() {
  return (
    <div className="min-h-screen flex overflow-hidden bg-background text-foreground">
      <div className="w-1/2 bg-navy relative h-screen flex flex-col">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2 bottom-1/2 right-1/2" />
        <div className="flex justify-center pt-12">
          <Logo className="w-20 h-auto text-white opacity-90" />
        </div>
        <div className="flex flex-col items-center text-xs text-muted gap-2 pt-8">
          <span className="uppercase tracking-wider">By ACX Maroc</span>
          <div className="flex items-center justify-center gap-2 pt-4">
            <span className="bg-cyan-500/20 text-cyan-500 border-cyan-500/50 px-3 py-1 text-xs font-medium">Espace Juridique</span>
            <div className="w-2 h-1 bg-cyan-500 rounded-full opacity-50"></div>
          </div>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white text-center">Votre équipe.</h1>
        <p className="mt-2 text-lg bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">au même rythme.</p>
        <p className="mt-6 text-sm text-muted-foreground text-center">Équipe juridique ACX Flow — Plateforme de gestion documentaire.</p>
        <div className="mt-8 grid grid-cols-3 gap-4 justify-center">
          <div className="bg-card text-white p-6 rounded-2xl border border-border hover:border-cyan-500">
            <div className="text-cyan-600 text-3xl">📁</div>
            <h3 className="mt-2 text-lg font-semibold uppercase tracking-wider">DOSSIERS</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">Gestion et suivi des dossiers clients</p>
          </div>
          <div className="bg-card text-white p-6 rounded-2xl border border-border hover:border-cyan-500">
            <div className="text-cyan-600 text-3xl">⏱️</div>
            <h3 className="mt-2 text-lg font-semibold uppercase tracking-wider">PRÉSENCE</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">Pointage et suivi du temps</p>
          </div>
          <div className="bg-card text-white p-6 rounded-2xl border border-border hover:border-cyan-500">
            <div className="text-cyan-600 text-3xl">📊</div>
            <h3 className="mt-2 text-lg font-semibold uppercase tracking-wider">SUIVI</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">Statistiques et rapports</p>
          </div>
        </div>
        <p className="mt-8 text-sm text-cyan-500 text-center">© 2026 ACX Maroc — Plateforme interne. Tous droits réservés.</p>
      </div>
      <div className="w-1/2 bg-white min-w-0 flex flex-col overflow-hidden">
        <div className="border-y border-border">
          <div className="px-6 py-4 text-muted-foreground">
            <h2 className="text-xl font-bold text-navy">Bienvenue</h2>
            <p className="mb-4">Connectez-vous à la plateforme ACX Flow.</p>
          </div>
        </div>
        <div className="px-6 py-8 flex-1">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
              <input type="email" placeholder="votre@email.com" className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Mot de passe</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" autoComplete="password" />
            </div>
            <div>
              <button type="submit" className="w-full flex items-center justify-center py-3 rounded-full bg-navy text-white font-semibold text-sm hover:bg-navy/90 transition-all">
                <span>Se connecter</span>
              </button>
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-border text-muted-foreground text-xs">
          <span>Pas de compte ? Contactez l'administrateur</span>
          <a href="/" className="text-purple-600 hover text-purple-700 transition-colors">Se connecter</a>
        </div>
        <div className="px-6 py-4 border-t border-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Accès démo</p>
          <div className="space-y-1 text-muted-foreground">
            <span className="text-cyan-600 font-medium">Admin</span> — Accès complet
            <span className="text-cyan-600 font-medium">Juriste</span> — Notes & dossiers
            <span className="text-cyan-600 font-medium">Assistant</span> — Suivi docs
          </div>
        </div>
      </div>
    </div>
  );
}