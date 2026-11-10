# Lab 10. Mouvement respectueux

> **Outcome :** à la fin, tu sais que réduire une animation n'est pas la raccourcir, et tu connais les
> trois lignes qu'on oublie dans un bloc de préférence réduite.
>
> **Vrai outil :** Chromium via Playwright, avec **émulation de `prefers-reduced-motion`**. L'oracle mesure
> un déplacement réel, en pixels.
>
> **Feedback :** `npm run lab:10` depuis `labs/`. `npm run solution:10` prouve que
> l'oracle est juste, et ne s'ouvre qu'après ton GREEN.

## Lire avant

Module [`12-mouvement`](../../modules/12-mouvement), **une fois** : § 1.1 en entier, § 2.1, § 3
(premier bloc), § 4.2 en entier.

## Énoncé

`src/` contient trois animations : une entrée en cascade des cartes, une barre de progression
liée au défilement, et un défilement animé. Un bloc `prefers-reduced-motion` existe déjà, et il
ne protège de rien : il raccourcit les durées à `0.01ms`.

**Tu modifies `src/style.css`.** Le HTML ne bouge pas.

Exigences, sous préférence réduite :

1. les cartes ne se **déplacent** plus, mais apparaissent toujours en fondu ;
2. l'animation liée au défilement est coupée ;
3. le défilement animé redevient instantané ;
4. les transitions de vue sont neutralisées ;
5. le hack `animation-duration: 0.01ms` disparaît.

## Vérifier

| Ce qui est vérifié | Pourquoi |
|---|---|
| sans préférence, les cartes se déplacent de plus de 5 px | l'animation existe, sinon le lab ne prouve rien |
| sous préférence réduite, le déplacement est inférieur à 1 px | le mouvement est supprimé, pas accéléré |
| aucun `animation-duration: 0.01ms` | le contournement ne protège de rien |
| `animation-timeline` vaut `none` | première ligne oubliée |
| `scroll-behavior` vaut `auto` | deuxième ligne oubliée |
| `::view-transition-*` est neutralisé | troisième ligne oubliée |
| une autre animation est définie dans le bloc | on remplace, on ne raccourcit pas |
| l'opacité finale vaut 1 | on supprime le mouvement, pas le contenu |

## L'ordre qui compte

`animation: none; animation-timeline: none;` fonctionne. L'inverse non : le raccourci `animation`
réinitialise `animation-timeline`, donc l'écrire après annule la ligne précédente.

## Sonde de rougissement

Après ton GREEN, remplace l'animation de remplacement par la même que la normale,
c'est-à-dire `animation: glisser 150ms both;`, puis relance.
**Attendu :** le test de déplacement sous préférence réduite échoue, en donnant le nombre
de pixels parcourus.

Si l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas :
signale-le. Remets ensuite le code en état.
