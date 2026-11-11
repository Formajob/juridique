# Kit « Glassy V22 » pour Juridique

Habillage repris de la maquette AMC, adapté au projet Juridique. **Tout est local. Rien n’est poussé, rien n’est déployé.**

## Les fichiers

| Fichier | Rôle |
| --- | --- |
| `glass.css` | La feuille de style complète, autonome, préfixée `g-`. À copier dans `src/styles/` du dépôt Juridique. |
| `apercu-juridique.html` | La page de référence, tableau de bord admin, avec les données de démonstration. Sert de modèle visuel à Cline. |
| `PROMPT-cline-juridique-glassy-v22.md` | Le message à coller dans Cline, avec le mode opératoire et les contrôles. |
| `apercu-full.png` | Capture du rendu clair, page entière. |
| `apercu-sombre.png` | Capture du rendu sombre. |
| `apercu-mobile.png` | Capture téléphone. |

## Voir le rendu

Double-clic sur `apercu-juridique.html`. Bouton en haut à droite pour passer du clair au sombre.

## Ce que la feuille apporte

- verre : fond translucide, flou d’arrière-plan, liseré clair, ombre douce ;
- accents bleu et cyan lumineux sur les boutons, les barres, l’anneau et l’entrée active du menu ;
- fond animé discret : dégradé, deux halos, grille ;
- cartes, indicateurs, tableaux, étiquettes, onglets, listes, étapes de process, formulaires ;
- compteurs animés, barres qui se remplissent, apparition en cascade ;
- thème **clair par défaut**, thème sombre disponible avec `data-theme="dark"` ;
- responsive : ordinateur, tablette, téléphone, avec menu en panneau ;
- impression en noir sur blanc, sans menu ni fond, pour les rapports.

## Ce que la feuille ne fait pas

Elle ne contient ni logique métier, ni route, ni requête, ni texte juridique. Elle ne remplace aucun composant. C’est une couche de présentation : si l’import est retiré, l’application retrouve exactement son apparence d’avant.

## Réglages

| Envie | Où, dans `glass.css` |
| --- | --- |
| Moins de flou, plus de vitesse | `--g-blur: 22px` → `14px` |
| Bleu plus discret | `--g-blue`, `--g-blue-2`, `--g-cyan` |
| Cartes plus opaques en clair | `--g-glass`, `--g-glass-2` |
| Arrondis | `--g-radius`, `--g-radius-sm` |
| Ombre | `--g-shadow` |
| Désactiver le fond animé | retirer le `<div class="g-aurora">` du layout |

## Ordre conseillé

1. Copier `glass.css` et `apercu-juridique.html` dans `design/glass-v22/` du dépôt.
2. Coller le prompt dans Cline.
3. Vérifier avec `npm run dev`, puis les contrôles de l’étape 8.
4. Si le rendu convient, on étend l’habillage aux pages restantes dans un second passage.
5. Le déploiement reste une décision séparée, et n’est pas demandé ici.

## Rappel

Le projet Juridique garde son schéma de constatations, ses trois profils, ses huit tags de présence et ses règles de délai. Le style ne touche à rien de tout cela.
