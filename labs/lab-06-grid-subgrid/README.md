# Lab 06. Grid et subgrid

> **Outcome :** à la fin, tu sais aligner des éléments entre plusieurs cartes sans hauteur fixe ni
> calcul, et tu n'écriras plus `1fr` sans y penser.
>
> **Vrai outil :** Chromium via Playwright. L'oracle compare les positions verticales réelles des
> boutons entre les trois cartes.
>
> **Feedback :** `npm run lab:06` depuis `labs/`. `npm run solution:06` prouve l'oracle, après
> ton GREEN.

## Lire avant

Module [`06-grid-et-subgrid`](../../modules/06-grid-et-subgrid), **une fois** : § 1.1, § 1.3, § 3
en entier, § 5.

## Énoncé

Trois cartes de hauteurs de texte différentes. Deux défauts :

1. les boutons d'inscription ne sont pas alignés entre les cartes ;
2. un mot long fait déborder la grille hors de la page.

**Tu modifies `src/style.css`.** Le HTML ne bouge pas.

L'alignement doit venir de `subgrid`, pas d'une hauteur fixe ni d'un `min-height` deviné. Et à
320 pixels, les cartes doivent s'empiler.

## Vérifier

| Ce qui est vérifié | Pourquoi |
|---|---|
| les trois boutons sont à moins de 2 px d'écart vertical | l'alignement est réel |
| aucun débordement horizontal à 1200 px | `minmax(0, 1fr)` |
| le CSS contient `minmax(0, 1fr)` | l'écriture sûre |
| le CSS contient `grid-template-rows: subgrid` et un `grid-row: span` | la sous-grille a de quoi hériter |
| à 320 px, cartes empilées et pas de défilement | `10.11 (AA)` |

## Le détail qui coûte cher en production

`1fr` vaut `minmax(auto, 1fr)`. Le minimum `auto` est la taille minimale du contenu, donc la
piste refuse de descendre sous le mot le plus long. Le bug n'apparaît qu'avec un certain contenu,
donc rarement en maquette et souvent en production.

## Sonde de rougissement

Après ton GREEN, remplace `grid-template-rows: subgrid;` par
`grid-template-rows: auto 1fr auto;` dans `.carte`, puis relance.
**Attendu :** le test d'alignement échoue, chaque carte retrouvant une grille indépendante.

Si l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas :
signale-le. Remets ensuite le code en état.
