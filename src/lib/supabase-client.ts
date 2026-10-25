// Supabase client configuration.
// Les clés réelles sont chargées depuis les variables d'environnement (.env.local).
// Ne JAMAIS les afficher ou les commiter.

import { createClient } from '@supabase/supabase-js';

// Les variables sont lues ici. Si .env.local n'existe pas ou les clés sont vides,
// l'application continue en mode démo local sans connexion réelle à Supabase.
// Le pointage est décrit dans le prompt : les écrans sont branchés sur les tables.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// SAFETY: on ne trace ni la valeur, ni le placeholder, ni toute clé.
// Si l'environnement n'est pas configuré, on retourne null pour que les écrans
// gèrent la démo locale (données en mémoire) plutôt que de casser le rendu.

let clientInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (clientInstance) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return clientInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    // Mode démo local : pas de client Supabase actif.
    // Les écrans vides restent vides et étiquetés "Démo".
    return null;
  }

  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      // Éviter les avertissements de headers d'authentification côté client
      headers: {
        'X-Client-Info': 'juridique-demo/1.0.0',
      },
    },
  });

  return clientInstance;
}

// Tronqué par sécurité / clarté : les clés ne doivent jamais être exposées ici.
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

export default getSupabaseClient;