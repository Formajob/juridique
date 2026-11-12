import { redirect } from 'next/navigation';

/**
 * Ancienne route de démonstration : elle recopiait son propre menu.
 * Le tableau de bord vit désormais dans /admin, avec la coquille et le menu uniques.
 */
export default function LegacyDashboardPage() {
  redirect('/admin');
}
