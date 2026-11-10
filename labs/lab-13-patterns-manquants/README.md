# Lab 13. Patterns manquants

> **Outcome :** à la fin, tu sais écrire de mémoire le contrat complet d'une liste d'onglets et d'un
> interrupteur : rôles, états, et clavier touche par touche.
>
> **Vrai outil :** Chromium via Playwright. Le clavier est la moitié du contrat, et celle qui manque presque
> toujours.
>
> **Feedback :** `npm run lab:13` depuis `labs/`. `npm run solution:13` prouve que
> l'oracle est juste, et ne s'ouvre qu'après ton GREEN.

## Lire avant

Module [`17-ce-que-la-plateforme-n-a-pas`](../../modules/17-ce-que-la-plateforme-n-a-pas), **une
fois** : § 2, § 3.1 et § 3.2 en entier, § 4.

## Énoncé

`src/` contient des onglets et un interrupteur faits avec des `div` et des classes. À la souris,
impeccable. Au clavier et à l'oreille, inexistants.

**Tu réécris `src/index.html`, `src/style.css` et `src/script.js`.**

Exigences :

1. les rôles `tablist`, `tab` et `tabpanel`, avec `aria-selected` et `aria-controls` ;
2. le focus géré : un seul onglet dans l'ordre de tabulation ;
3. le contrat clavier complet : flèches en boucle, `Début`, `Fin` ;
4. l'interrupteur porte `role="switch"` et `aria-checked` ;
5. son libellé ne change **jamais** ;
6. des `button` natifs, pas des `div` avec `role`.

## Vérifier

| Ce qui est vérifié | Critère |
|---|---|
| `tablist`, trois `tab`, un `tabpanel` visible | `7.1 (A)` |
| un seul onglet avec `aria-selected="true"` | `7.1 (A)` |
| un seul `tabindex="0"`, deux à `-1` | focus géré |
| flèche droite et gauche, en boucle | `7.3 (A)` |
| `Début` et `Fin` | `7.3 (A)` |
| le panneau affiché correspond, et est nommé par son onglet | `7.1 (A)` |
| `role="switch"` avec `aria-checked` | `7.1 (A)` |
| la barre d'espace bascule | `7.3 (A)` |
| le libellé est identique avant et après | lisibilité de l'état |
| axe est vert sur les deux panneaux | nécessaire, pas suffisant |

## La règle qui rend ce lab facile

ARIA n'ajoute aucun comportement. Partir de `<button>` donne le rôle, le focus et l'activation au
clavier gratuitement ; il ne reste qu'à écrire les états et la navigation aux flèches.

## Sonde de rougissement

Après ton GREEN, retire la mise à jour de `tabIndex` dans la fonction d'activation,
puis relance. **Attendu :** le test du focus géré échoue, en affichant les `tabindex`
trouvés. Vérifie aussi au clavier : `Tab` s'arrête désormais sur chaque onglet.

Si l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas :
signale-le. Remets ensuite le code en état.
