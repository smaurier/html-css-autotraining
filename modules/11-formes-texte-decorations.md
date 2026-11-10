# 11. Formes, texte et décorations

> **Outcome :** à la fin, tu sais pourquoi un texte n'est jamais exactement là où tu l'as placé et
> comment `text-box-trim` règle ça, tu sais tronquer un texte sans retirer l'information du
> document, tu sais ce que `shape()` apporte à `clip-path`, et tu sais quels critères une forme
> peut mettre en cause.

## 1. Le mécanisme : la boîte de texte n'est pas la boîte du texte

Une ligne de texte occupe une hauteur égale à son `line-height`. La hauteur réelle des glyphes,
elle, est plus petite. La différence est répartie également au-dessus et au-dessous, et c'est ce
qu'on appelle le demi-plomb, par analogie avec les cales de plomb de la typographie au plomb.

```
┌─────────────────────────┐ bord de la boîte de ligne
│   ░░░░ demi-plomb ░░░░  │
│   ╔═══════════════════╗ │ ← sommet des capitales
│   ║   Membres         ║ │
│   ╚═══════════════════╝ │ ← ligne de base
│   ░░░░ demi-plomb ░░░░  │
└─────────────────────────┘
```

Conséquence quotidienne : un bouton avec `padding: 1rem` n'a pas 1 rem d'espace visible au-dessus
de son texte, il en a 1 rem plus le demi-plomb. Et comme le demi-plomb dépend de la police et du
`line-height`, l'espace optique change quand la police change. C'est la raison pour laquelle les
designers demandent des `padding` « bizarres », à savoir `0.8rem` en haut et `0.9rem` en bas :
ils compensent à la main.

### 1.1 `text-box-trim`

```css
.titre {
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;   /* du sommet des capitales à la ligne de base */
}
```

Le navigateur retire le demi-plomb des bords demandés. Le `padding` redevient alors ce qu'il
prétend être : la distance entre le bord de la boîte et le dessin du texte. C'est un gain direct
pour tout système de design, parce qu'il supprime une catégorie de valeurs magiques.

Les arêtes se choisissent selon ce que l'on veut aligner : `cap` pour le sommet des capitales,
`ex` pour la hauteur d'x, `text` pour l'englobant de la police, `alphabetic` pour la ligne de
base.

## 2. Tronquer

### 2.1 Une ligne

```css
.cellule {
  min-inline-size: 0;      /* rappel des modules 05 et 06 : sans ça, pas de troncature */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 2.2 Plusieurs lignes

```css
.resume { line-clamp: 3; }
```

Remplace le triplet historique `display: -webkit-box`, `-webkit-box-orient: vertical`,
`-webkit-line-clamp: 3`, qui était un hack de moteur devenu standard de fait.

**Le point d'accessibilité, et il est important :** `line-clamp` tronque **visuellement**. Le
texte complet reste dans le DOM, donc il reste disponible pour les technologies d'assistance.
C'est le comportement souhaitable, et c'est ce qui distingue cette approche d'une troncature à la
source.

```html
<!-- ✅ Le texte complet existe, le CSS n'en montre que trois lignes -->
<p class="resume">Texte complet de la description…</p>

<!-- ⛔ L'information est détruite pour tout le monde, y compris les moteurs de recherche -->
<p class="resume">{{ description.slice(0, 120) + '…' }}</p>
```

Il reste à vérifier que l'information tronquée est **accessible autrement** : un lien vers la
fiche complète, un dépliement. Un résumé qui cache l'essentiel derrière trois lignes sans moyen
de le lire est un problème de conception, pas de CSS.

## 3. Découper et suivre un chemin

### 3.1 `clip-path` et `shape()`

```css
/* Historique : des coordonnées absolues, pénibles à écrire et à relire */
.fleche { clip-path: polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%); }

/* shape() : une grammaire de dessin, en unités CSS, responsive */
.fleche {
  clip-path: shape(
    from 0% 0%,
    line to 100% 0%,
    line to 100% calc(100% - 2rem),
    curve to 50% 100% with 75% 100%,
    curve to 0% calc(100% - 2rem) with 25% 100%,
    close
  );
}
```

L'apport de `shape()` est double : les unités CSS, donc `rem`, `%` et `calc()` au lieu de
pourcentages uniquement, et des courbes lisibles. `path()` existe aussi, mais il prend une
donnée SVG, donc des coordonnées absolues en pixels, non responsives.

Rappel du module 04 : `clip-path` crée un contexte d'empilement et coupe réellement, y compris
les halos de focus. Un élément interactif découpé doit donc être revérifié pour `10.7 (A)`.

### 3.2 `offset-path`

```css
.petale {
  offset-path: shape(from 0% 50%, curve to 100% 50% with 50% 0%);
  offset-distance: 0%;
  offset-rotate: auto;                   /* l'élément s'oriente le long du chemin */
  animation: parcourir 4s linear infinite;
}
@keyframes parcourir { to { offset-distance: 100%; } }
```

Déplacer un élément le long d'un chemin, sans calculer de positions intermédiaires. À lire avec
le module 12 : toute animation de ce type doit être neutralisée sous `prefers-reduced-motion`.

## 4. Décorer

### 4.1 `corner-shape`, nouveauté 2026

```css
.carte {
  border-radius: 2rem;
  corner-shape: squircle;   /* ou bevel, notch, scoop, round */
}
```

`border-radius` ne proposait qu'un arc de cercle ou d'ellipse. `corner-shape` donne la forme du
coin : le squircle, qui est la courbe des icônes d'iOS, le chanfrein, l'encoche. Cela remplace des
`clip-path` dessinés à la main, donc des formes qui ne suivaient pas la bordure et ne pouvaient
pas porter d'ombre.

### 4.2 Les décorations de gouttière, nouveauté 2026

```css
.grille {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  column-rule: 1px solid var(--trait);   /* un filet DANS les gouttières */
  row-rule: 1px dashed var(--trait);
}
```

Généralise `column-rule`, qui n'existait que pour les colonnes de texte, à toutes les gouttières
de grille et de flex. Ce que ça supprime : les pseudo-éléments séparateurs, les bordures sur un
élément sur deux, et les `:last-child` de rattrapage, c'est-à-dire exactement le genre de code
qu'on écrit une fois et qui casse au premier changement de nombre de colonnes.

## 5. L'accessibilité dans ce module

**`1.8 (AA)` : un texte en image doit être remplacé par du texte stylé**, sauf logo, marque et
cas non reproductible. Ce module est la réponse technique au critère : avec `text-box-trim`,
`corner-shape`, `shape()` et les dégradés en OKLCH du module 10, la justification « ce rendu
n'est faisable qu'en image » tient de moins en moins.

**`10.9 (A)` et `10.10 (A)` : l'information ne doit pas dépendre uniquement de la forme, de la taille
ou de la position.** C'est le critère qui concerne directement ce module.

```html
<!-- ⛔ La forme seule porte le sens -->
<div class="badge triangle"></div>  <!-- « attention », paraît-il -->

<!-- ✅ La forme est redondante -->
<p class="badge triangle"><span class="icone" aria-hidden="true"></span> Attention : quota atteint</p>
```

« Cliquez sur le bouton rond » et « le champ à droite » sont les formulations fautives
équivalentes, côté rédaction.

**`10.12 (AA)` : adaptation des textes.** Un texte dont la boîte est découpée par un `clip-path`
dimensionné en pixels disparaît partiellement dès que l'utilisateur augmente l'interligne ou
l'espacement des lettres. La parade est de dessiner en unités relatives, ce que `shape()` permet
justement et que `polygon()` en pixels ne permettait pas.

**`10.7 (A)` : prise de focus visible.** À revérifier sur tout élément interactif découpé ou à
coins non standards, parce que le halo de focus suit la boîte et non la forme dessinée. C'est le
cas où l'on découvre que `outline` a été coupé.

## 6. Ce que l'enquête interroge, et où c'est traité

Items `css2026` rattachés à ce module : `line_clamp`, `offset_path`, `css_shape_function`,
`text_box_trim`, `css_gap_decorations`, `css_corner_shape`.

Deux de ces six sont des nouveautés 2026, `css_gap_decorations` et `css_corner_shape`, et toutes
les deux suppriment du code existant plutôt que d'ajouter une possibilité. C'est le critère le
plus utile pour trier une veille : une fonctionnalité qui permet d'effacer un contournement vaut
plus qu'une fonctionnalité qui permet un effet de plus.

## 7. Les pièges

1. **Compenser le demi-plomb avec des `padding` magiques** au lieu de `text-box-trim`.
2. **Tronquer la chaîne dans le code plutôt qu'avec `line-clamp`.** L'information disparaît pour
   tout le monde.
3. **Oublier `min-inline-size: 0`** et s'étonner que `text-overflow` ne fasse rien.
4. **Dessiner un `clip-path` en pixels** autour d'un texte, puis casser à l'agrandissement.
5. **Oublier que `clip-path` coupe le halo de focus.** `10.7 (A)`.
6. **Porter le sens par la forme seule.** `10.9 (A)` et `10.10 (A)`.
7. **Animer le long d'un `offset-path` sans respecter `prefers-reduced-motion`.** Voir module 12.
8. **Utiliser une image pour un rendu que le CSS sait faire.** `1.8 (AA)`.

## 8. Auto-test

1. Qu'est-ce que le demi-plomb, et pourquoi un `padding: 1rem` ne donne-t-il pas 1 rem visible
   au-dessus d'un texte ?
2. Que fait `text-box-trim`, et quelle catégorie de valeurs magiques supprime-t-il ?
3. Pourquoi `line-clamp` est-il préférable à une troncature de chaîne dans le code ?
4. Quelles deux choses `shape()` apporte-t-il face à `polygon()` ?
5. Quel effet de bord de `clip-path` peut mettre `10.7 (A)` en danger ?
6. Que remplacent les décorations de gouttière, concrètement ?
7. Donne un exemple de non-conformité `10.9 (A)` ou `10.10`, et sa correction.
8. Quel critère de tri appliquer à une nouveauté CSS pour savoir si elle mérite ton temps ?
