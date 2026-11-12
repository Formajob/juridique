import { redirect } from 'next/navigation'

/**
 * La racine redirige vers la page de connexion unique.
 *
 * Avant, `/` rendait `AccessPage` : une SECONDE page de connexion, ancienne,
 * avec sa propre carte crème et son bouton navy pleine largeur. C'est elle qui
 * s'affichait quand on ouvrait http://localhost:3000 — d'où l'impression que
 * les correctifs sur /login ne changeaient rien.
 */
export default function HomePage() {
  redirect('/login')
}
