# 07. Propriétés logiques et dimensionnement

> **Outcome :** à la fin, tu raisonnes en axes de bloc et d'inline plutôt qu'en haut, bas, gauche
> et droite, tu sais pourquoi `100vh` est faux sur mobile et par quoi le remplacer, tu sais ce
> que `aspect-ratio` cède face à une taille explicite, et tu connais les quatre critères que le
> dimensionnement met en jeu.

## 1. Le mécanisme : deux axes, et ils ne sont pas horizontaux

Le web n'écrit pas toujours de gauche à droite et de haut en bas. Le modèle logique nomme donc
les axes par leur rôle, pas par leur direction à l'écran :

- **l'axe inline** suit le sens d'écriture du texte ;
- **l'axe de bloc** suit l'empilement des blocs.

En français, inline va de la gauche vers la droite et bloc du haut vers le bas. En arabe, inline
va de droite à gauche. En japonais vertical, inline descend et bloc va de droite à gauche.

```css
html { writing-mode: horizontal-tb; }  /* le défaut */
.vertical { writing-mode: vertical-rl; }
```

### 1.1 La table de correspondance

| Physique | Logique |
|---|---|
| `width` / `height` | `inline-size` / `block-size` |
| `min-width` / `max-width` | `min-inline-size` / `max-inline-size` |
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` |
| `margin-top` / `margin-bottom` | `margin-block-start` / `margin-block-end` |
| `padding-left` et compagnie | `padding-inline-start`, etc. |
| `border-top` | `border-block-start` |
| `top` / `right` / `bottom` / `left` | `inset-block-start` / `inset-inline-end` / … |
| `text-align: left` | `text-align: start` |

Et les raccourcis sur deux côtés, qui sont la raison la plus immédiate de les adopter :

```css
margin-inline: auto;        /* gauche et droite, le centrage horizontal */
padding-block: 1rem 2rem;   /* haut puis bas */
inset: 0;                   /* les quatre côtés */
```

`margin-inline: auto` remplace `margin-left: auto; margin-right: auto`. Même en projet
monolingue, le gain d'écriture suffit à justifier l'habitude.

### 1.2 Pourquoi s'en soucier même sans projet multilingue

Trois raisons concrètes, par ordre de probabilité.

**Un jour, il y a une version arabe.** Avec des propriétés logiques, un `dir="rtl"` sur `<html>`
retourne la mise en page sans surcharge. Avec des propriétés physiques, c'est une refonte.

**Les composants réutilisables se trompent moins.** Une marge `inline-end` sur un élément de
liste reste correcte quel que soit le contexte d'écriture dans lequel on le réemploie.

**Le critère `8.10 (A)` exige que les changements de sens de lecture soient signalés** par
`dir`. Si un bloc de texte arabe est inséré dans une page française avec `dir="rtl"`, une mise en
page en propriétés physiques se désaligne visiblement. Les propriétés logiques suivent.

## 2. `aspect-ratio`

```css
.vignette { aspect-ratio: 16 / 9; }     /* la hauteur découle de la largeur */
.avatar   { aspect-ratio: 1; inline-size: 3rem; }
```

Remplace le contournement historique du `padding-top` en pourcentage, expliqué au module 04 § 2.2.

Deux règles de comportement à connaître, parce qu'elles expliquent les « ça ne marche pas » :

**Une taille explicite dans les deux dimensions gagne.** Si `inline-size` et `block-size` sont
toutes deux définies, le ratio est ignoré : il n'y a plus rien à déduire.

**Le contenu peut dépasser.** `aspect-ratio` fixe la boîte, pas le contenu. Un texte trop long
déborde, parce que `min-block-size: auto` protège le contenu. C'est le même mécanisme de taille
minimale automatique qu'aux modules 05 et 06, et la même parade si on veut vraiment couper :
`min-block-size: 0`, en sachant ce qu'on perd.

Pour les images, le couple à retenir est `aspect-ratio` sur le conteneur et `object-fit` sur
l'image :

```css
.vignette { aspect-ratio: 16 / 9; }
.vignette img { inline-size: 100%; block-size: 100%; object-fit: cover; object-position: center; }
```

## 3. Les unités de viewport, et le mensonge de `100vh`

Sur mobile, la barre d'adresse du navigateur apparaît et disparaît au défilement. La hauteur
visible change donc, mais `vh` ne change pas : il vaut la hauteur du viewport **large**,
c'est-à-dire barre rétractée. D'où la bande coupée en bas, symptôme universel du plein écran
mobile.

| Unité | Signifie |
|---|---|
| `vh` | hauteur du viewport, valeur historique, égale à `lvh` |
| `svh` | **small** : la plus petite hauteur, barres d'interface déployées |
| `lvh` | **large** : la plus grande hauteur, barres rétractées |
| `dvh` | **dynamic** : la hauteur réelle à l'instant, elle change pendant le défilement |
| `vi` / `vb` | les équivalents **logiques**, selon l'axe inline ou de bloc |
| `vmin` / `vmax` | la plus petite, ou la plus grande, des deux dimensions |

La règle de choix :

```css
.plein-ecran { min-block-size: 100svh; }  /* sûr : jamais coupé, parfois un peu court */
.hero        { min-block-size: 100dvh; }  /* colle au réel, mais la page « respire » au scroll */
```

`dvh` donne la hauteur exacte, au prix d'une mise en page qui bouge pendant le défilement, ce qui
peut être désagréable, voire problématique pour les personnes sensibles au mouvement. `svh` est
le choix sûr par défaut : on perd quelques pixels, personne ne se fait couper.

## 4. Les tailles intrinsèques

```css
.etiquette { inline-size: min-content; }   /* aussi étroit que possible sans déborder */
.titre     { inline-size: max-content; }   /* aussi large que le contenu sans retour à la ligne */
.carte     { inline-size: fit-content(30rem); }  /* le contenu, borné à 30rem */
```

Utilisation la plus fréquente : `max-content` sur un bouton pour qu'il épouse son libellé,
`fit-content()` pour une carte qui ne doit pas s'étirer indéfiniment.

Attention à `max-content` sur un texte long : il ne revient jamais à la ligne, donc il déborde.
C'est le comportement demandé, pas un bug.

## 5. L'accessibilité dans ce module

C'est le module le plus directement relié au thème 10 du référentiel, parce que le
dimensionnement est ce que l'utilisateur modifie quand il adapte la page à sa vue.

**`10.4 (AA)` : le texte reste lisible agrandi à 200 %.** Le piège est de dimensionner des
conteneurs en pixels fixes alors que le texte, lui, grandit : le texte sort du cadre ou se
tronque. La parade est de dimensionner en `rem` et de laisser les hauteurs en `min-block-size`
plutôt qu'en `block-size`.

**`10.11 (AA)` : linéarisation à 320 pixels de large**, ce qui équivaut à un zoom de 400 % sur un
écran de 1280. Aucun défilement sur deux axes. Les causes de défilement horizontal sont presque
toujours les mêmes : une largeur fixe supérieure à 320 pixels, une grille à colonnes fixes, un
élément flex qui ne peut pas rétrécir, un `max-content` oublié.

**`10.12 (AA)` : le texte supporte les adaptations de l'utilisateur**, à savoir interligne 1,5
fois la taille de police, espacement des paragraphes 2 fois, espacement des lettres 0,12 fois,
espacement des mots 0,16 fois, sans perte de contenu ni de fonctionnalité.

```css
/* ⛔ Un bouton de hauteur fixe tronque le texte dès que l'interligne augmente */
.bouton { block-size: 2.5rem; }

/* ✅ Il grandit avec son contenu */
.bouton { min-block-size: 2.5rem; padding-block: 0.5rem; }
```

C'est le critère le plus cher à rattraper après coup, parce qu'il touche tous les composants à
hauteur fixe d'un coup. Le réflexe à prendre est simple : **`min-block-size` plutôt que
`block-size`**, partout où du texte est présent.

**`13.9 (AA)` : indépendance de l'orientation.** La page doit fonctionner en portrait comme en
paysage, sans forcer l'un des deux. Le verrouillage par `@media (orientation: portrait)` avec un
message « tournez votre appareil » est la non-conformité type, et elle pénalise d'abord les
personnes dont le fauteuil ou le support fixe l'orientation.

## 6. Ce que l'enquête interroge, et où c'est traité

Items `css2026` rattachés à ce module : `logical_properties`, `aspect_ratio`,
`viewport_percentage_length_units`.

Ces trois-là partagent un trait : ce sont des remplacements de contournements. Les propriétés
logiques remplacent les surcharges `rtl`, `aspect-ratio` remplace le `padding-top` en
pourcentage, et `svh` et `dvh` remplacent les mesures de hauteur en JavaScript. Remplacer un
contournement par du natif supprime du code, et c'est le meilleur retour sur investissement
d'une veille.

## 7. Les pièges

1. **Utiliser `100vh` pour un plein écran mobile.** Coupé en bas. `100svh` ou `100dvh`.
2. **Fixer `block-size` sur un composant contenant du texte.** Casse `10.4` et `10.12` d'un coup.
3. **Attendre que `aspect-ratio` s'applique alors que les deux dimensions sont définies.**
4. **Croire que `aspect-ratio` empêche le contenu de déborder.** Il fixe la boîte, pas le
   contenu.
5. **Mettre `max-content` sur un texte long.** Il ne revient pas à la ligne, c'est le contrat.
6. **Dimensionner en pixels ce qui porte du texte.** Le `rem` suit les préférences de
   l'utilisateur, le pixel non.
7. **Verrouiller l'orientation.** Non conforme `13.9 (AA)`.
8. **Mélanger propriétés physiques et logiques sur le même composant.** Les surcharges deviennent
   imprévisibles, et `margin-left` ne surcharge pas toujours `margin-inline-start` comme on
   l'imagine.

## 8. Auto-test

1. Qu'est-ce que l'axe inline, et dans quel sens va-t-il en japonais vertical ?
2. Donne les équivalents logiques de `width`, `margin-top` et `text-align: left`.
3. Pourquoi `100vh` coupe-t-il le bas de la page sur mobile ? Quelle unité choisir par défaut,
   et pourquoi pas `dvh` ?
4. Dans quel cas `aspect-ratio` est-il purement et simplement ignoré ?
5. Quelle est la différence entre `min-content`, `max-content` et `fit-content(30rem)` ?
6. Quel réflexe d'écriture protège `10.12 (AA)` sur tous les composants à la fois ?
7. À quelle largeur se teste `10.11 (AA)`, et à quel zoom cela correspond-il ?
8. Pourquoi un message « tournez votre appareil » est-il une non-conformité, et qui pénalise-t-il
   en premier ?
