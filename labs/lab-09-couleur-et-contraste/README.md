# Lab 09. Couleur et contraste

> **Outcome :** à la fin, tu sais calculer un ratio, tu connais les trois seuils du référentiel, et tu
> sais qu'une palette doit tenir dans les deux thèmes, pas seulement dans celui de ta
> machine.
>
> **Vrai outil :** Chromium via Playwright, avec **émulation du thème clair puis sombre**. Les ratios sont
> calculés sur les couleurs réellement appliquées, pas sur celles de la maquette.
>
> **Feedback :** `npm run lab:09` depuis `labs/`. `npm run solution:09` prouve que
> l'oracle est juste, et ne s'ouvre qu'après ton GREEN.

## Lire avant

Module [`10-couleur-et-contraste`](../../modules/10-couleur-et-contraste), **une fois** : § 1.2 et
§ 1.3, § 4.1 et § 4.2, § 4.4.

## Énoncé

La page de `src/` est jolie et non conforme sur quatre points :

1. le texte secondaire est trop clair ;
2. la bordure du champ de recherche est quasi invisible ;
3. l'état des ateliers n'est porté que par la couleur des pastilles ;
4. aucun `color-scheme`, donc les contrôles natifs resteront clairs en thème sombre.

**Tu modifies `src/style.css` et `src/index.html`.** Le quatrième point demande du HTML : une
information portée par la couleur doit être doublée par du texte **visible**.

## Vérifier

| Ce qui est vérifié | Critère |
|---|---|
| texte principal, secondaire, avertissement et bouton tiennent 4,5:1, en clair ET en sombre | `3.2 (AA)` |
| la bordure du champ tient 3:1, en clair ET en sombre | `3.3 (AA)` |
| chaque ligne contient « en service » ou « hors service » | `3.1 (A)` |
| les pastilles sont `aria-hidden` | elles sont devenues décoratives |
| `color-scheme` est déclaré avec `dark` | les contrôles natifs suivent |
| le fond sombre n'est pas un noir pur | confort de lecture |

## Ce qui surprend

Le texte « discret » à `#9a9a9a` sur blanc donne environ 2,8:1. C'est le défaut le plus fréquent
des interfaces soignées, et il ne se voit pas à l'œil d'une personne qui a une bonne vue.

## Sonde de rougissement

Après ton GREEN, éclaircis le texte secondaire d'un cran, par exemple de `#6b6b6b`
à `#8a8a8a`, puis relance. **Attendu :** le test du texte secondaire échoue, en donnant le
ratio obtenu et le seuil attendu.

Si l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas :
signale-le. Remets ensuite le code en état.
