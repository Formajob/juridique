# Prompt Cline — appliquer le style « Glassy V22 » à Juridique

À coller comme message dans Cline (ou Copilot Agent), **dans le dépôt `Formajob/juridique`**. Il suppose que le contexte du projet est déjà posé (sinon, coller d’abord `PROMPT-continuer-juridique.md`, puis ce bloc).

Les fichiers `glass.css` et `apercu-juridique.html` doivent être copiés dans le dépôt **avant** de lancer Cline, comme indiqué plus bas.

---

```text
TÂCHE : appliquer un nouvel habillage visuel « Glassy V22 » aux pages de Juridique. C’est une tâche de style uniquement. Aucune règle métier, aucune route, aucun store, aucune requête, aucun texte juridique ne change.

## Fichiers fournis

Deux fichiers sont déjà dans le dépôt, à la racine, dans un dossier `design/glass-v22/` :

- `glass.css` : la feuille de style complète, autonome, préfixée `g-`.
- `apercu-juridique.html` : la page de référence du tableau de bord, avec le rendu attendu. Elle n’est pas à importer dans l’application, c’est un modèle visuel.

Si ces fichiers sont absents, arrête-toi et demande-les. Ne réinvente pas la feuille de style.

## Où va la feuille

1. Copie `design/glass-v22/glass.css` vers `src/styles/glass.css`.
2. Dans `src/app/layout.tsx`, ajoute l’import après celui des styles globaux :
   `import "@/styles/glass.css";`
   Ne remplace pas `globals.css`. Tailwind, s’il est présent, reste en place.
3. Ajoute `className="g-body"` sur la balise `<body>` du layout. Si `body` a déjà une classe, garde-la et ajoute `g-body` à côté.
4. Juste après l’ouverture de `<body>`, ajoute le fond décoratif :
   `<div className="g-aurora" aria-hidden="true"><span className="g-orb g-orb--1" /><span className="g-orb g-orb--2" /><div className="g-grid" /></div>`
5. Le thème clair est celui par défaut. Ne mets pas `data-theme="dark"` sur `<html>`. Le sombre reste disponible plus tard en changeant cet attribut, sans autre modification.
6. N’ajoute aucune dépendance npm. N’ajoute aucune police depuis un CDN : la feuille utilise Inter si elle est déjà chargée, sinon la police système.

## Principe

Lis le fichier avant de le modifier. Ne renomme pas les composants, ne déplace pas les routes, ne touche pas aux types. Tu ne changes que des classes, des balises de conteneur et, au besoin, l’ordre visuel d’éléments déjà présents.

On ne réécrit pas les pages. On ajoute l’habillage, et là où c’est nécessaire, on remplace les classes d’habillage existantes par celles de `glass.css`.

## Étape 1 — Inventaire, avant toute modification

1. Liste les fichiers sous `src/app` et `src/components`.
2. Pour chacun, relève les noms de classes utilisés (className) et la feuille qui les définit (`globals.css`, CSS local, Tailwind).
3. Écris cette liste dans ta réponse, courte, sous forme de tableau : fichier, classes, où elles sont définies.
4. Vérifie si une bibliothèque d’icônes est déjà installée (lucide-react, heroicons…). Si oui, tu la réutilises. Sinon, tu reprends les SVG en ligne de `apercu-juridique.html`. Tu n’installes rien.

Ne passe pas à l’étape 2 avant d’avoir fait cet inventaire.

## Étape 2 — Correspondance des classes

Ajoute à la fin de `src/styles/glass.css` une section « Compatibilité » qui fait le pont entre les classes existantes et l’habillage, sans toucher aux fichiers concernés. Exemple de forme, à adapter à ce que tu as réellement trouvé :

```css
/* Compatibilité avec les classes existantes */
.jx-side { /* reprendre ici les règles de .g-side */ }
.card    { /* reprendre .g-glass + .g-card */ }
.kpi     { /* reprendre .g-kpi */ }
```

Règles :
- La section Compatibilité ne contient que des règles de présentation : couleurs, fond, bordure, rayon, ombre, espacement, typographie.
- Elle ne contient aucune règle de positionnement qui casserait une grille existante, aucun `display:none`, aucun changement de largeur de colonne.
- Si une classe existante porte déjà une mise en page utile, ne la surcharge pas : ajoute seulement le verre, le rayon et l’ombre.
- Une classe que tu n’as pas vue dans l’inventaire n’entre pas dans cette section.

## Étape 3 — Barre latérale

Fichier : `src/components/layout/Sidebar.tsx`. C’est le seul endroit du menu. Ne le recopie pas dans les pages.

- Garde `getMenu(role)`, les libellés, les `href`, l’ordre, les groupes et les sous-groupes. Le menu reste exactement celui validé : Admin, Juriste, Assistant.
- Remplace les classes d’habillage de la colonne par celles de `glass.css` : `g-side`, `g-glass`, `g-brand`, `g-by`, `g-space`, `g-nav`, `g-nav-item`, `g-nav-group`, `g-nav-sub`, `g-nav-count`, `g-chev`, `g-who`, `g-session`, `g-avatar`, `g-session-meta`, `g-icon-btn`, `g-side-foot`.
- L’entrée active porte `is-active`. Le groupe ouvert porte `is-open` sur `g-nav-group`.
- Le logo reste le composant `FlowLogo` existant, avec sa variante claire. Ne remplace pas le logo par du texte. Si `FlowLogo` n’existe pas et que le logo est une image, garde l’image et mets la classe `g-brand` sur son conteneur.
- Le tag « By ACX Maroc » reste un lien vers https://acx.ma/.
- Sur mobile, ajoute le bouton `g-nav-toggle` et le comportement ouvert / fermé comme dans le script de `apercu-juridique.html` : clic ouvre, Échap ferme, clic à l’extérieur ferme, la navigation ferme le menu. Le JavaScript du menu ne doit rien faire d’autre.
- Le bouton Quitter et la déconnexion existants sont conservés à l’identique. Tu ne changes ni la route, ni le comportement.

## Étape 4 — Tableau de bord

Fichier : `src/app/admin/dashboard/page.tsx`. Le modèle visuel est `design/glass-v22/apercu-juridique.html`.

Reprends la structure visuelle, pas les chiffres :

- En-tête : `g-top`, `g-kicker`, `h1`, `g-lead`, `g-tools`, `g-search`, `g-date`, `g-icon-btn`.
- Bandeau de la prochaine échéance : `g-hero`, avec `g-hero-actions` et `g-hero-side`. Les valeurs viennent du dossier le plus proche, pas d’une constante.
- Indicateurs : `g-kpis` et `g-kpi`, avec `g-kpi-top`, `g-kpi-ico`, `g-delta` (plus `is-ok`, `is-warn`, `is-bad`), `g-value`, `g-label`. Les chiffres restent ceux que la page calcule déjà : total, clos, en cours, en retard.
- Avancement par étape : `g-card`, `g-card-head`, `g-card-title`, `g-card-sub`, `g-bars`, `g-bar`, `g-bar-label`, `g-track`, `g-fill`, `g-bar-val`, `g-card-foot`. La largeur de la barre est passée par `data-w` puis appliquée en JavaScript, ou directement par `style={{ width }}` — au choix, mais une seule méthode.
- Répartition : `g-donut` avec la variable `--g-segments` contenant le `conic-gradient`, `g-donut-mid`, `g-legend`, `g-legend-row`. Les couleurs de parts sont prises dans la palette de la feuille : clos `#64748b`, dans le délai `#3b82f6`, en retard `#e11d48`, en attente `#cbd5e1`.
- Échéances : `g-list`, `g-list-item`, `g-list-main`, `g-list-side`, `g-badge`.
- Process du dossier : `g-steps`, `g-step`, `g-step-dot`, `g-step-body`, `g-step-meta`, avec `is-done`, `is-now`, `is-next`. Uniquement les étapes réelles du dossier ouvert. Pas le schéma entier.
- Tableau : `g-table-wrap`, `g-table`, `g-ref`, `g-sub-line`, `g-badge`.
- Pied de page : `g-foot`, `g-tag`.

Interdits sur cette page :
- Ne montre pas le motif, la gravité ou la sanction dans les listes.
- Ne crée pas d’étape qui n’existe pas dans le workflow.
- Ne transforme pas l’avancement en classement des personnes.
- Ne mets pas de chiffre écrit à la main : s’il n’y a pas de donnée, affiche zéro ou un état vide, jamais une valeur inventée.

Si `src/app/admin/page.tsx` existe aussi comme tableau de bord, ne le laisse pas en conflit avec cette page. Signale-le au lieu de le supprimer sans le dire.

## Étape 5 — Autres pages

Pour chaque page, applique seulement l’habillage, en te servant de la section Compatibilité de l’étape 2. L’objectif est que toutes les pages aient le même verre, le même rayon, la même ombre, la même typographie, sans réécrire leur contenu.

- Aucune page ne change de logique, de formulaire, de bouton ou de texte.
- Ne touche pas aux pages de dossiers au-delà des conteneurs : la fiche, les boutons de branche et le verrouillage d’un dossier clos restent identiques.
- La recherche ne montre ni motif, ni gravité, ni sanction. Tu ne changes pas son filtre.
- L’assistant ne voit pas les graphiques d’avancement. Tu ne changes pas les droits d’affichage.

## Étape 6 — Présence

Fichier : `src/app/admin/presence/page.tsx` et le composant `PresenceVdm`.

- Même disposition qu’aujourd’hui, même logique de tags, mêmes couleurs de tags VDM, mêmes minuteries, mêmes règles de dépassement, même départ de journée.
- Seul le cadre change : `g-card`, `g-glass`, `g-card-head`, `g-table`, `g-badge`, `g-bars` si des barres existent déjà.
- Ne touche pas aux durées, aux limites, aux calculs, aux noms des huit tags.
- Pas de paie, pas de salaire, pas de relevé. Cette étape ne crée aucun champ.

## Étape 7 — Impression

Les rapports doivent rester lisibles en noir sur blanc. La feuille contient déjà un bloc `@media print`. Vérifie sur le rapport de présence et sur le rapport de classement ou de préparation, s’ils existent :

- la colonne de menu et le fond décoratif disparaissent ;
- les cartes deviennent blanches avec un filet gris ;
- les tableaux restent lisibles ;
- aucune barre ni pastille ne devient blanche sur blanc.

Si un écran lance déjà une impression avec une classe sur `body`, garde cette classe : le bloc d’impression de la feuille ne dépend pas d’elle.

## Étape 8 — Contrôles avant de t’arrêter

1. `npx tsc --noEmit` : aucune erreur.
2. `npm run build` : le build passe.
3. Ouvre le tableau de bord, la présence, une page de dossier, la recherche : aucune erreur dans la console, aucun écran blanc.
4. Vérifie au clavier : le menu s’ouvre et se ferme, Échap ferme, le focus reste visible.
5. Vérifie à 390 px de large : la colonne devient une barre, le menu s’ouvre en panneau, aucune page ne déborde horizontalement.
6. Vérifie le thème clair dans les deux sens : si tu ajoutes `data-theme="dark"` sur `<html>`, tout reste lisible ; sans cet attribut, on revient au clair.
7. Fais trois captures : tableau de bord, présence, une page de dossier. Nomme-les et dis où elles sont.
8. Liste les fichiers modifiés, un par ligne, et pour chacun en une phrase ce qui a changé.

## Interdits

- Ne déploie pas. Ne pousse pas. Ne commit pas, sauf si le message de tâche le demande explicitement.
- Ne touche ni à `flow.acx.ma`, ni au dépôt VD, ni à la base VD.
- N’affiche aucune clé, aucun mot de passe, aucun contenu de `.env`.
- N’ajoute aucun nom réel, aucune adresse e-mail, aucune donnée pour remplir un écran.
- Ne change aucun libellé juridique, aucun texte d’étape, aucun texte de bouton métier.
- Ne modifie pas `src/lib/menu.ts`, le store de workflow, les types de la base, les routes API.
- Ne supprime aucun fichier. Si un fichier semble en double, signale-le.
- Ne remplace pas le logo par du texte, ne retire pas « By ACX Maroc ».
- Pas de nouvelle dépendance, pas de police distante, pas d’animation qui bloque le clic.

## Quand tu as fini

Réponds en cinq points courts :
1. Ce qui a changé, page par page.
2. Les fichiers modifiés.
3. Les contrôles passés, avec le résultat.
4. Ce que tu n’as pas pu faire, et pourquoi.
5. La marche à suivre exacte pour revenir à l’ancien habillage, qui doit tenir en une seule ligne : retirer l’import de `src/styles/glass.css`.
```

---

## Avant de lancer Cline — dans le dépôt

```powershell
# 1. se placer dans le dépôt
cd C:\chemin\vers\juridique

# 2. créer le dossier et y copier les deux fichiers fournis
mkdir design\glass-v22 -Force
Copy-Item C:\chemin\vers\juridique-glass\glass.css        design\glass-v22\glass.css
Copy-Item C:\chemin\vers\juridique-glass\apercu-juridique.html design\glass-v22\apercu-juridique.html

# 3. vérifier
Get-ChildItem design\glass-v22

# 4. lancer Cline avec le bloc ci-dessus
```

## Après Cline — vérification en 2 minutes

```powershell
npm run dev
```

- Ouvre le tableau de bord : les cartes sont en verre, l’anneau de répartition est dessiné, le bandeau d’échéance est en haut.
- Ouvre Présence : les huit tags et les couleurs sont ceux d’avant, seul le cadre change.
- Réduis la fenêtre à la largeur d’un téléphone : barre en haut, menu en panneau.
- `Ctrl+P` sur un rapport : fond blanc, texte noir, pas de menu.
- Ouvre la console : aucune erreur.

Si quelque chose cloche, dis-moi la page et la capture. On corrige la feuille, pas la logique.

## Rappel

Le style est **clair par défaut** pour Juridique, contrairement à la maquette AMC. Le sombre existe déjà dans la feuille : il s’active plus tard avec `data-theme="dark"` sur `<html>`, sans rien réécrire. Ne l’active pas sans demande.
