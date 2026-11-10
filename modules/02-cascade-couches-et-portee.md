# 02. Cascade, couches et portée

> **Outcome :** à la fin, tu sais réciter les huit paliers de la cascade dans l'ordre, tu sais
> pourquoi une couche bat la spécificité, tu calcules un triplet de spécificité sans hésiter, tu
> sais ce que `!important` inverse, et tu sais pourquoi l'imbrication CSS peut faire grimper une
> spécificité que tu croyais faible.
>
> **Lab :** [lab-02 : la cascade domptée](../labs/lab-02-cascade-domptee/README)

## 1. Le mécanisme : huit paliers, et la spécificité arrive tard

La question « quelle déclaration gagne » n'est pas réglée par la spécificité. Elle est réglée par
une suite de critères, et la spécificité n'intervient qu'au cinquième. C'est la raison pour
laquelle une guerre de spécificité est presque toujours le symptôme d'un palier mal compris.

Du plus fort au plus faible :

```
1. déclarations de transition en cours
2. !important du navigateur        (user agent)
3. !important de l'utilisateur
4. !important de l'auteur          ← ton !important est ici, pas en haut
5. déclarations d'animation en cours
6. normal de l'auteur              ← ton CSS ordinaire est ici
7. normal de l'utilisateur
8. normal du navigateur
```

Deux conséquences qu'on ne devine pas.

**L'ordre des origines s'inverse pour `!important`.** En régime normal, l'auteur bat
l'utilisateur qui bat le navigateur. Avec `!important`, c'est l'inverse exact. C'est
volontaire et c'est un dispositif d'accessibilité : une feuille de style utilisateur qui force un
contraste ou une taille de police doit pouvoir gagner contre toi. Si une personne malvoyante a
imposé ses couleurs, ton `!important` ne doit pas la contredire, et il ne le peut pas.

**Une animation en cours bat ton CSS normal mais perd contre `!important`.** D'où le classique :
une animation qui semble ignorée parce qu'une déclaration `!important` traîne sur la même
propriété.

### 1.1 À l'intérieur d'un palier

Quand deux déclarations sont au même palier, l'arbitrage continue, dans cet ordre :

```
a. couche de cascade  (@layer)       ← AVANT la spécificité
b. proximité de portée (@scope)
c. spécificité
d. ordre d'apparition dans la source  (la dernière gagne)
```

Le point qui change la vie : **la couche est évaluée avant la spécificité**. Un
`#form input.champ[type="text"]` placé dans une couche basse perd contre un `input` placé dans
une couche haute. La spécificité n'est plus un budget à surenchérir, elle redevient un détail
local.

## 2. `@layer`, ou comment arrêter de surenchérir

### 2.1 Déclarer l'ordre une fois

```css
/* Une seule ligne, en tête de projet : elle fixe l'ordre, définitivement. */
@layer reset, base, composants, utilitaires;

@layer base {
  /* spécificité 0,0,1 */
  input { border: 1px solid; }
}

@layer composants {
  /* plus faible en spécificité, et pourtant il gagne : couche plus haute */
  .champ { border: 2px solid rebeccapurple; }
}
```

L'ordre de la déclaration `@layer a, b, c;` fait foi, quel que soit l'ordre d'écriture des blocs
ensuite. C'est ce qui permet de placer la couche `reset` en premier même si le fichier de reset
est importé en dernier.

### 2.2 Ce qui n'est dans aucune couche gagne

Une déclaration écrite hors de toute couche est **plus forte que toutes les couches** de la même
origine. C'est contre-intuitif la première fois, et c'est cohérent : les couches sont une zone
que tu organises, le hors-couche est le dernier mot.

```css
@layer utilitaires {
  .cache { display: none; }
}

/* Hors couche : gagne contre toutes les couches, sans !important */
.cache { display: block; }
```

Conséquence pratique : si tu adoptes `@layer`, mets **tout** dans une couche, sinon le
hors-couche redevient le fourre-tout qu'on voulait supprimer.

### 2.3 `!important` inverse aussi l'ordre des couches

```css
@layer base, surcharges;   /* surcharges est plus fort en régime normal */

@layer base      { a { color: red !important; } }   /* gagne */
@layer surcharges { a { color: blue !important; } }  /* perd */
```

L'ordre des couches est inversé pour les déclarations importantes, exactement comme celui des
origines. Retenir la règle générale plutôt que les deux cas : **`!important` retourne la
hiérarchie, à tous les niveaux où elle existe.**

### 2.4 Couches imbriquées et anonymes

```css
@layer framework {
  @layer reset, composants;        /* framework.reset, framework.composants */
}

@layer { /* anonyme : sa place est fixée ici, et rien ne pourra plus y ajouter */ }

@import url("bibliotheque.css") layer(framework);   /* importer dans une couche */
```

L'import dans une couche est le vrai cas d'usage de `@layer` : il permet de ranger une
bibliothèque tierce sous ton propre code sans toucher à son contenu, et sans écrire un seul
`!important`.

## 3. La spécificité, calculée pour de bon

Un triplet, jamais un nombre unique :

| Position | Ce qui compte | Exemples |
|---|---|---|
| **A** | identifiants | `#entete` |
| **B** | classes, attributs, pseudo-classes | `.carte`, `[type="text"]`, `:hover`, `:nth-child()` |
| **C** | éléments, pseudo-éléments | `div`, `a`, `::before` |

```css
#entete .nav a:hover   /* 1, 2, 1 */
nav ul li a            /* 0, 0, 4 */
[data-etat="ouvert"]   /* 0, 1, 0 */
a::before              /* 0, 0, 2 */
```

Le triplet se compare position par position, de gauche à droite. `1,0,0` bat `0,99,99` : il n'y
a pas de report de dix en dix, contrairement à ce que laisse croire la notation en nombre.

### 3.1 Les pseudo-classes fonctionnelles

C'est là que les erreurs se logent.

```css
:where(.a, #b, .c) { }   /* 0, 0, 0  toujours. Son argument ne compte jamais. */
:is(.a, #b, .c)    { }   /* 1, 0, 0  la spécificité de son argument le PLUS spécifique */
:not(.a, #b)       { }   /* 1, 0, 0  idem */
:has(.a, #b)       { }   /* 1, 0, 0  idem */
```

`:where()` à spécificité nulle est l'outil de base d'une feuille de style surchargeable : tout ce
qu'on écrit avec est surchargeable par un simple sélecteur d'élément. C'est ce qui rend un reset
inoffensif.

Et le piège symétrique : `:is()` et `:has()` prennent la spécificité de leur argument le plus
spécifique, **même si c'est une autre branche de la liste qui a matché**. Un seul `#id` oublié
dans une liste de dix sélecteurs rend les dix très spécifiques.

### 3.2 Les mots-clés de valeur

| Mot-clé | Effet |
|---|---|
| `inherit` | prend la valeur calculée du parent, même pour une propriété non héritée |
| `initial` | la valeur initiale de la spécification, pas celle du navigateur |
| `unset` | `inherit` si la propriété est héritable, `initial` sinon |
| `revert` | revient à la valeur de l'**origine précédente**, donc souvent au style du navigateur |
| `revert-layer` | revient à la valeur de la **couche précédente** |

`revert` et `initial` sont régulièrement confondus, et la différence est visible : `display:
initial` sur un `<div>` donne `inline`, parce que la valeur initiale de `display` est `inline`.
`display: revert` redonne `block`, parce que c'est ce que dit la feuille du navigateur. Pour
remettre un élément dans son état natif, c'est `revert`, jamais `initial`.

`all: revert` est la façon honnête de neutraliser un héritage de style dont on ne connaît pas
l'étendue.

## 4. `@scope`, et le trou du beignet

```css
@scope (.carte) to (.contenu-utilisateur) {
  /* s'applique dans .carte, mais s'arrête avant d'entrer dans .contenu-utilisateur */
  a { color: rebeccapurple; }
}
```

Deux apports distincts, qu'il faut séparer.

**La borne basse**, le « beignet » : le style s'arrête à une frontière. C'est la réponse native
au problème du contenu non maîtrisé, par exemple du HTML rendu depuis du Markdown écrit par un
utilisateur, que ton style de carte ne doit pas repeindre.

**La proximité de portée** : à spécificité égale, la règle dont la racine de portée est la plus
proche de l'élément gagne. C'est un critère de cascade qui n'existait pas avant, et qui résout le
cas du composant imbriqué dans un composant de même nature, un thème dans un thème.

```css
@scope (.theme-clair) { p { color: #111; } }
@scope (.theme-sombre) { p { color: #eee; } }
/* Dans .theme-clair > .theme-sombre > p : c'est le sombre qui gagne, car plus proche.
   Avec deux sélecteurs classiques de même spécificité, c'est le dernier écrit qui aurait
   gagné, indépendamment de l'imbrication réelle. */
```

## 5. L'imbrication, et sa spécificité cachée

```css
.carte {
  & .titre { }       /* équivaut à :is(.carte) .titre  →  0,2,0 */
}

.carte, #special {
  & .titre { }       /* équivaut à :is(.carte, #special) .titre  →  1,1,0  (!) */
}
```

Le sélecteur imbriqué est enveloppé dans un `:is()` implicite. Donc dès que la liste parente
contient un identifiant, **toutes** les règles imbriquées héritent de cette spécificité. C'est le
piège de l'imbrication, et il est silencieux : rien dans le code imbriqué ne le laisse voir.

La parade est la même qu'au § 3.1 : si une liste de sélecteurs sert de parent d'imbrication,
l'écrire `:where(.carte, #special)` neutralise la contamination.

## 6. `@supports`, et la bonne façon de douter

```css
@supports (anchor-name: --a) and (position-area: top) {
  /* le mécanisme du module 09, seulement s'il existe */
}

@supports selector(:has(*)) { }        /* tester un sélecteur */
@supports not (container-type: size) { /* le repli, pas l'inverse */ }
```

La règle de méthode : écrire d'abord ce qui fonctionne partout, puis **ajouter** l'amélioration
sous `@supports`. L'écriture inverse, la version moderne par défaut et le repli dans un
`@supports not`, laisse les navigateurs inconnus sans rien, parce qu'un navigateur qui ne connaît
pas la requête ne la vérifie pas non plus.

## 7. L'accessibilité dans ce module

Un seul critère, mais structurant : **`10.1 (A)`, la mise en forme est exclusivement réalisée en
CSS.** Pas d'attribut de présentation, pas de balise de présentation, pas d'espaces insécables
pour aligner, pas de retours à la ligne pour espacer.

Ce module est l'endroit où ce critère devient facile à respecter plutôt qu'une contrainte : avec
des couches, le style du document n'a plus besoin de s'inviter dans le markup pour gagner. Quand
on voit un `style=` en ligne ou un `<br>` d'espacement, la cause est presque toujours une cascade
qu'on n'arrivait plus à surcharger.

Note de méthode pour l'audit : `10.1` se teste CSS désactivées, et c'est aussi comme ça que se
testent `10.2`, `10.3` et `10.6`. Le protocole est au module 20.

## 8. Ce que l'enquête interroge, et où c'est traité

Items `css2026` rattachés à ce module : `cascade_layers`, `at_scope`, `where_selector`,
`has_selector`, `css_nesting`, `feature_support_queries`.

Un mot sur `:has()`, parce que sa réputation de lenteur mérite d'être précisée. Le coût n'est pas
dans `:has()` lui-même mais dans ce qu'il implique : un style qui dépend des descendants oblige
le moteur à réévaluer un parent quand un enfant change. C'est donc un coût de **mise à jour**,
pas de première peinture, et il se paie sur les arbres très dynamiques. Un `:has()` sur un
formulaire statique ne coûte rien de mesurable.

## 9. Les pièges

1. **Croire que la spécificité arbitre en premier.** Elle est au cinquième palier, après
   l'origine, l'importance et les couches.
2. **Oublier que le hors-couche bat toutes les couches.** Adopter `@layer` à moitié produit un
   système moins prévisible qu'avant.
3. **Ne pas savoir que `!important` inverse l'ordre des couches** autant que celui des origines.
4. **Mettre un `#id` dans une liste `:is()` ou dans un parent d'imbrication**, et contaminer
   tout ce qui suit.
5. **Confondre `initial` et `revert`.** `display: initial` vaut `inline`, pas `block`.
6. **Écrire le moderne par défaut et le repli dans `@supports not`.** Un navigateur qui ne
   connaît pas la requête ne connaît pas davantage sa négation.
7. **Utiliser `!important` pour battre une bibliothèque tierce**, alors que
   `@import url(...) layer(vendor)` règle le problème à la racine et sans dette.

## 10. Lire avant le lab

Pour [lab-02](../labs/lab-02-cascade-domptee/README) : § 1 en entier, § 2.1 à 2.3, § 3.1, § 5.
Une seule lecture, puis page blanche.

## 11. Auto-test

Confiance 1, 2 ou 3 avant de vérifier.

1. Récite les huit paliers de la cascade, du plus fort au plus faible.
2. Pourquoi l'ordre des origines s'inverse-t-il pour `!important` ? Quel usage cela protège-t-il ?
3. Un sélecteur `#a .b .c` dans la couche `base`, un sélecteur `p` dans la couche `theme`,
   déclarées `@layer base, theme;`. Lequel gagne, et pourquoi ?
4. Quelle est la spécificité de `:where(#a, .b)` ? Et de `:is(#a, .b)` ?
5. `display: initial` sur une `<div>` : quel résultat, et pourquoi n'est-ce pas `block` ?
6. À quoi sert la borne basse de `@scope`, et quel problème concret résout-elle ?
7. Qu'est-ce que la proximité de portée ajoute à la cascade, qui n'existait pas avant ?
8. Pourquoi `.carte, #special { & .titre {} }` est-il un piège ?
