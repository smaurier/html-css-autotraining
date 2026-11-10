# Lab 12. Formulaire natif

> **Outcome :** à la fin, tu sais utiliser l'API de validation de contraintes plutôt que de réécrire une
> validation, et tu connais le motif complet de restitution des erreurs.
>
> **Vrai outil :** Chromium via Playwright, plus `axe-core` avant et après soumission.
>
> **Feedback :** `npm run lab:12` depuis `labs/`. `npm run solution:12` prouve que
> l'oracle est juste, et ne s'ouvre qu'après ton GREEN.

## Lire avant

Module [`14-formulaires-natifs`](../../modules/14-formulaires-natifs), **une fois** : § 1.1 et
§ 1.2, § 2 en entier, § 3, § 4, § 5.

## Énoncé

`src/` contient un formulaire court et non conforme sur sept points : des `placeholder` en guise
d'étiquettes, un style d'erreur appliqué avant toute saisie, aucun `autocomplete`, des boutons
radio sans regroupement, aucune aide reliée, aucun exemple dans les messages, et aucun résumé à
la soumission.

**Tu réécris `src/index.html`, `src/style.css` et `src/script.js`.**

Exigences :

1. une étiquette visible et reliée pour chaque champ, aucun `placeholder` ;
2. `:user-invalid` à la place de `:invalid` ;
3. `autocomplete` sur le courriel et le code postal ;
4. `fieldset` et `legend` pour les boutons radio ;
5. une aide reliée par `aria-describedby`, avec le format attendu ;
6. une mention expliquant l'étoile, **avant** le formulaire ;
7. à la soumission, un résumé qui compte les erreurs, prend le focus, et dont chaque message
   donne un exemple réel.

## Vérifier

| Ce qui est vérifié | Critère |
|---|---|
| chaque champ a un `label` relié | `11.1 (A)` |
| aucun `placeholder` | `11.1 (A)` |
| le CSS utilise `:user-invalid`, pas `:invalid` | pas d'erreur avant interaction |
| `autocomplete="email"` et `autocomplete="postal-code"` | `11.13 (AA)` |
| un groupe nommé contient les radios | `11.5 (A)` |
| `aria-describedby` relie une aide contenant « exemple » | `11.10 (A)` |
| la mention sur l'étoile précède le formulaire | `11.10 (A)` |
| le résumé compte les erreurs, contient un exemple, et prend le focus | `11.11 (AA)`, `7.5 (AA)` |
| `aria-invalid` est posé puis **retiré** | état juste dans les deux sens |
| axe est vert avant et après soumission | nécessaire, pas suffisant |

## Pourquoi le focus va sur le résumé

Parce que la première information utile n'est pas « voici le champ à corriger », c'est « il y a
deux erreurs ». Mettre le focus sur le premier champ en erreur prive la personne de cette
information.

## Sonde de rougissement

Après ton GREEN, remplace `:user-invalid` par `:invalid` dans la feuille, puis
relance. **Attendu :** le test correspondant échoue. Observe aussi la page : tous les
champs obligatoires sont rouges avant la moindre saisie.

Si l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas :
signale-le. Remets ensuite le code en état.
