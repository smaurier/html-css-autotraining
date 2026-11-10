# Lab 08. Ancrage et popover

> **Outcome :** à la fin, tu sais ce que la plateforme fait pour toi et ce qui reste à ta charge, et tu
> sais qu'un menu et une modale « qui marchent » peuvent être inutilisables au clavier.
>
> **Vrai outil :** Chromium via Playwright. **Tout se joue au clavier** : c'est la raison pour laquelle ces
> défauts survivent si longtemps en production.
>
> **Feedback :** `npm run lab:08` depuis `labs/`. `npm run solution:08` prouve que
> l'oracle est juste, et ne s'ouvre qu'après ton GREEN.

## Lire avant

Module [`09-ancrage-popover-dialog`](../../modules/09-ancrage-popover-dialog), **une fois** : § 1,
§ 2.1 et § 2.2 en entier, § 3.2, § 5 (les deux premiers blocs), § 6.

## Énoncé

`src/` contient un menu déroulant et une confirmation de suppression, faits à la main avec des
`div`, des classes et des `z-index`. À la souris, tout fonctionne.

**Tu réécris `src/index.html`, `src/style.css` et `src/script.js`.** Le contenu textuel ne change
pas.

Exigences :

1. le menu utilise `popover` et `popovertarget`, et `aria-expanded` suit son état ;
2. la confirmation est un vrai `<dialog>`, ouvert par `showModal()` ;
3. la boîte a un nom accessible, le focus initial ne tombe pas sur l'action destructrice, et le
   focus revient à l'invocateur à la fermeture ;
4. plus un seul `z-index` dans la feuille.

## Vérifier

| Ce qui est vérifié | Critère |
|---|---|
| le menu porte `popover`, le bouton porte `popovertarget` | plus de bascule en JavaScript |
| `aria-expanded` passe à `true` puis revient à `false` | `7.1 (A)` |
| `Échap` ferme le menu | fermeture légère fournie |
| la confirmation est un `<dialog>` et vérifie `:modal` | top layer, inertie, confinement |
| la boîte a un nom accessible | `7.1 (A)` |
| le focus initial n'est pas sur « Supprimer » | sécurité d'usage |
| `Échap` ferme, et le focus revient au déclencheur | `12.9 (A)` |
| six `Tab` restent dans la boîte | `12.9 (A)` |
| un lien hors de la boîte ne peut pas prendre le focus | inertie |
| aucun `z-index` | le top layer s'en charge |

## Le piège qui fait perdre un quart d'heure

Ne pose jamais `display` sur `[popover]`. La feuille du navigateur met un popover fermé en
`display: none` ; l'écraser le rend visible en permanence, et on croit alors que la fermeture
légère ne fonctionne pas. On style `:popover-open`.

## Sonde de rougissement

Après ton GREEN, retire l'écouteur qui restitue le focus à la fermeture, puis
relance. **Attendu :** le test `12.9 (A)` échoue en disant que le focus n'est pas revenu
au déclencheur.

Si l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas :
signale-le. Remets ensuite le code en état.
