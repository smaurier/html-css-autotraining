# Lab 11. Carrousel accessible

> **Outcome :** à la fin, tu sais pourquoi un carrousel est l'un des composants les plus souvent non
> conformes du web, et tu sais en livrer un qui tient ses quatre critères.
>
> **Vrai outil :** Chromium via Playwright. Clavier, annonce et géométrie de défilement.
>
> **Feedback :** `npm run lab:11` depuis `labs/`. `npm run solution:11` prouve que
> l'oracle est juste, et ne s'ouvre qu'après ton GREEN.

## Lire avant

Module [`13-defilement-et-carrousels`](../../modules/13-defilement-et-carrousels), **une fois** :
§ 1.1, § 2 et § 2.1, § 7 en entier.

## Énoncé

`src/` contient un carrousel qui défile **tout seul** toutes les trois secondes, sans aucun
moyen de l'arrêter, sans commande, sans annonce, et dont la zone défilante n'est pas focusable.

**Tu réécris `src/index.html`, `src/style.css` et `src/script.js`.**

Exigences :

1. plus aucun défilement automatique ;
2. des boutons précédent et suivant, avec des intitulés explicites ;
3. la zone défilante est focusable, avec un rôle et un nom ;
4. le changement de panneau est annoncé **sans** déplacer le focus ;
5. l'accrochage fonctionne, et le défilement ne se propage pas à la page.

## Vérifier

| Ce qui est vérifié | Critère |
|---|---|
| aucun `setInterval` ni `setTimeout` long | `13.8 (A)` |
| des boutons précédent et suivant existent | `13.10 (A)` |
| la piste prend le focus | `12.11 (A)` |
| elle porte un rôle et un nom | pas d'arrêt de tabulation muet |
| une région `status` existe et son texte change | `7.5 (AA)` |
| l'annonce situe la position, par exemple « 2 sur 3 » | `7.5 (AA)` |
| le focus reste sur le bouton après le changement | on annonce, on ne déplace pas |
| `scroll-snap-type` et `overscroll-behavior: contain` | confort et non-propagation |
| le bouton fait réellement défiler | le composant fonctionne |
| axe ne trouve rien | nécessaire, pas suffisant |

## Le choix de conception qui règle le plus de problèmes

Ne pas faire défiler automatiquement. `13.8 (A)` exige alors un bouton de pause visible et
utilisable au clavier ; sans défilement automatique, la question ne se pose plus.

## Sonde de rougissement

Après ton GREEN, retire la mise à jour du texte de la région `status` dans le
script, puis relance. **Attendu :** le test `7.5 (AA)` échoue en disant que l'annonce n'a
pas changé.

Si l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas :
signale-le. Remets ensuite le code en état.
