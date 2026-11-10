# Lab 05. Flex

> **Outcome :** à la fin, tu sais pourquoi un élément flex refuse de rétrécir, et tu sais le
> corriger sans cacher le symptôme.
>
> **Vrai outil :** Chromium via Playwright, à deux largeurs de viewport.
>
> **Feedback :** `npm run lab:05` depuis `labs/`. `npm run solution:05` prouve l'oracle, après
> ton GREEN.

## Lire avant

Module [`05-flexbox-en-verite`](../../modules/05-flexbox-en-verite), **une fois** : § 1 en entier,
§ 2 et son tableau, § 3.1, § 5.

## Énoncé

La barre d'outils de `src/` déborde dès que le titre est long. La rustine en place,
`overflow: hidden` sur la barre, cache le débordement **et** coupe les halos de focus des
boutons.

**Tu modifies `src/style.css`.** Le HTML ne bouge pas.

Trois exigences :

1. le titre se tronque avec des points de suspension, **sans** que le texte quitte le DOM ;
2. plus aucun `overflow: hidden` sur la barre ;
3. à 320 pixels, aucun défilement horizontal, et les trois boutons restent visibles.

## Vérifier

| Ce qui est vérifié | Critère |
|---|---|
| le `scrollWidth` de la barre ne dépasse pas son `clientWidth` | le débordement est réglé, pas caché |
| `text-overflow` vaut `ellipsis` | troncature visuelle |
| le texte complet est encore dans le DOM | l'information est préservée |
| `overflow` de la barre vaut `visible` | `10.7 (A)` |
| le dernier bouton garde un contour au focus | `10.7 (A)` |
| à 320 px, pas de défilement horizontal | `10.11 (AA)` |
| à 320 px, les trois boutons sont visibles | `10.11 (AA)` |

## Ce que ce lab apprend en une ligne

`min-width: auto` est la valeur par défaut d'un élément flex, et `auto` ne vaut pas zéro. Tant
qu'on ne le sait pas, on répond aux débordements par `overflow: hidden`, ce qui règle l'apparence
et casse l'accessibilité.

## Sonde de rougissement

Après ton GREEN, retire la ligne `min-inline-size: 0;` du titre, puis relance.
**Attendu :** le test de débordement et celui de la troncature échouent.

Si l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas :
signale-le. Remets ensuite le code en état.
