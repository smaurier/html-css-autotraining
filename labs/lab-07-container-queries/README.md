# Lab 07. Container queries

> **Outcome :** à la fin, tu sais faire un composant qui s'adapte à la place qu'on lui donne et
> non à la taille de l'écran, et tu sais pourquoi cette distinction n'est pas théorique.
>
> **Vrai outil :** Chromium via Playwright. L'assertion centrale est faite **à viewport constant**.
>
> **Feedback :** `npm run lab:07` depuis `labs/`. `npm run solution:07` prouve l'oracle, après
> ton GREEN.

## Lire avant

Module [`08-adaptatif-et-preferences`](../../modules/08-adaptatif-et-preferences), **une fois** :
§ 1 en entier, § 1.2, § 2 et son tableau de décision.

## Énoncé

La même carte est placée deux fois : dans une zone principale large, et dans une barre latérale
de 14 rem. Avec une media query, l'écran étant large, les deux passent en deux colonnes, et celle
de la barre latérale est écrasée.

**Tu modifies `src/style.css`.** Le HTML ne bouge pas.

Trois exigences :

1. la carte décide d'après **son conteneur** ;
2. son titre est proportionnel au composant, pas à l'écran ;
3. **aucune media query de largeur** dans le fichier. Ce lab se résout sans, et c'est le point.

## Vérifier

| Ce qui est vérifié | Pourquoi |
|---|---|
| `container-type` et `@container` présents | sans la promesse, la requête ne s'applique jamais |
| à viewport 1200 px, la carte large est en deux colonnes et l'étroite est empilée | aucune media query ne peut faire cela |
| aucune `@media` de largeur | le composant ne regarde plus l'écran |
| une unité `cq*` est utilisée | typographie proportionnelle au conteneur |
| le titre est plus petit dans le conteneur étroit | la proportion est réelle |
| à 320 px, pas de défilement, carte empilée | `10.11 (AA)` |

## Le piège du premier essai

Une container query s'applique aux **descendants** du conteneur, jamais au conteneur lui-même.
Écrire `@container (inline-size > 20rem) { .carte { … } }` ne fait rien, puisque `.carte` **est**
le conteneur.

## Sonde de rougissement

Après ton GREEN, retire la ligne `container-type: inline-size;`, puis relance.
**Attendu :** le test à viewport constant échoue. Note qu'aucune erreur n'apparaît dans la
console du navigateur : c'est un échec silencieux, et c'est pour cela qu'il faut un oracle.

Si l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas :
signale-le. Remets ensuite le code en état.
