# 06. Grid et subgrid

> **Outcome :** à la fin, tu sais ce que `1fr` signifie exactement et pourquoi il déborde, tu
> sais choisir entre `auto-fit` et `auto-fill` en sachant ce que tu perds, tu sais ce que
> `subgrid` hérite et ce qu'il n'hérite pas, et tu sais obtenir un ordre visuel différent de
> l'ordre du DOM sans casser la tabulation.
>
> **Lab :** [lab-06 : grid et subgrid](../labs/lab-06-grid-subgrid/README)

## 1. Le mécanisme : des pistes, puis un placement

Une grille se construit en deux temps, et les confondre produit des grilles « qui ont une ligne
en trop ».

**Les pistes explicites**, celles que tu déclares avec `grid-template-columns` et
`grid-template-rows`.

**Les pistes implicites**, celles que le navigateur crée parce qu'un élément a été placé en
dehors des pistes explicites, ou parce que le placement automatique a débordé. Leur taille est
donnée par `grid-auto-rows` et `grid-auto-columns`, qui valent `auto` par défaut.

```css
.grille {
  display: grid;
  grid-template-columns: 200px 1fr;   /* 2 colonnes explicites */
  grid-auto-rows: minmax(8rem, auto); /* les lignes implicites, celles que je n'ai pas déclarées */
}
```

Oublier `grid-auto-rows` est la cause des lignes qui s'écrasent au contenu alors que les
premières respectent une hauteur.

### 1.1 `1fr` n'est pas « une part »

`1fr` signifie `minmax(auto, 1fr)`. Le minimum `auto` vaut la taille minimale du contenu. Donc
une piste en `1fr` **refuse de descendre sous son contenu**, exactement comme l'élément flex du
module 05.

```css
/* Déborde dès qu'un enfant a un contenu large : un mot long, un <pre>, une image */
.grille { grid-template-columns: 1fr 1fr; }

/* Ne déborde pas : le minimum est explicitement zéro */
.grille { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
```

C'est le piège le plus coûteux de Grid, parce qu'il n'apparaît qu'avec un certain contenu, donc
souvent en production et pas en maquette. `minmax(0, 1fr)` est à `1fr` ce que `min-width: 0` est
à `flex: 1`.

### 1.2 Les fonctions de dimensionnement

| Écriture | Sens |
|---|---|
| `min-content` | la plus petite largeur sans débordement, donc le mot le plus long |
| `max-content` | la largeur du contenu sans retour à la ligne |
| `fit-content(20rem)` | `max-content` borné à 20rem |
| `minmax(a, b)` | entre a et b |
| `auto` | comme `minmax(min-content, max-content)`, et étirable par `align-content` |
| `1fr` | `minmax(auto, 1fr)`, se partage l'espace restant |

### 1.3 `repeat()`, `auto-fit` et `auto-fill`

```css
/* La grille responsive sans aucune media query */
.cartes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  gap: 1rem;
}
```

Le `min(100%, 18rem)` mérite d'être compris : sans lui, une grille dont le conteneur est plus
étroit que `18rem` déborde, parce que la piste exige un minimum impossible. Avec lui, le minimum
s'abaisse à la largeur disponible. C'est la version correcte du motif, et la version courte qu'on
copie habituellement est bancale sur petit écran.

La différence entre les deux mots-clés :

- **`auto-fill`** crée autant de pistes que l'espace le permet, **même vides**.
- **`auto-fit`** crée les mêmes pistes, puis **replie** celles qui sont vides, et l'espace est
  redistribué aux pistes occupées.

Conséquence concrète : avec trois cartes dans un espace qui en tiendrait six, `auto-fill` donne
trois cartes de taille normale alignées à gauche, `auto-fit` donne trois cartes étirées sur toute
la largeur. Le choix n'est donc pas une préférence, il dépend de ce que tu veux qu'il arrive à une
grille à moitié vide.

## 2. Placer

### 2.1 Lignes nommées et zones

```css
.page {
  display: grid;
  grid-template-areas:
    "entete entete"
    "aside  main"
    "pied   pied";
  grid-template-columns: 16rem 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
}
.page > header { grid-area: entete; }
.page > main   { grid-area: main; }
```

Les zones nommées sont l'outil qui permet de **découpler l'ordre visuel de l'ordre du DOM sans
réordonner les enfants**. C'est le point d'accessibilité central du module, détaillé au § 5 : on
écrit le DOM dans l'ordre logique, et la grille place chaque élément où il doit apparaître.

### 2.2 Le placement automatique, et `dense`

Les éléments non placés remplissent les cases libres dans l'ordre du DOM, ligne par ligne par
défaut. `grid-auto-flow: dense` autorise le moteur à revenir en arrière pour combler un trou
laissé par un élément large.

```css
.galerie { grid-auto-flow: dense; }
.galerie .panoramique { grid-column: span 2; }
```

`dense` produit une grille plus compacte, et **déplace visuellement des éléments par rapport à
l'ordre du DOM**. Même critère que `order` en flex, même conséquence : à utiliser quand l'ordre
n'est pas porteur de sens, jamais sur une suite d'étapes ou un classement.

## 3. `subgrid`

Le problème que ça résout : trois cartes côte à côte, chacune avec un titre, un texte de longueur
variable et un bouton. On veut que les boutons soient alignés entre les cartes. Sans `subgrid`,
chaque carte a sa grille interne, indépendante, et les boutons flottent à des hauteurs
différentes.

```css
.cartes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }

.carte {
  grid-row: span 3;                  /* la carte occupe 3 lignes de la grille parente */
  display: grid;
  grid-template-rows: subgrid;       /* ses lignes SONT celles du parent */
}
```

Ce que `subgrid` hérite : **les pistes** de la grille parente, dans la dimension où il est
déclaré, et leur dimensionnement. Les lignes de la carte deviennent littéralement les lignes du
parent, donc toutes les cartes partagent les mêmes hauteurs de ligne.

Ce que `subgrid` n'hérite pas : le `gap`, qui est redéclarable, et la dimension non déclarée.
`grid-template-rows: subgrid` ne fait rien aux colonnes.

Le prérequis qu'on oublie : la sous-grille doit **occuper plusieurs pistes** du parent, par
`grid-row: span 3`. Sans cela, elle n'a qu'une piste à hériter et le résultat est indiscernable
d'une grille ordinaire.

## 4. `grid-lanes`, nouveauté 2026

Les couloirs de grille répondent à un besoin que ni `auto-fill` ni `dense` ne couvrent : garder
des éléments dans une même piste logique tout en laissant le moteur gérer leur répartition, par
exemple des colonnes de type tableau de bord où chaque couloir accumule des cartes de hauteurs
différentes, comme une maçonnerie.

C'est une nouveauté de l'édition 2026 de l'enquête, donc rien n'est à déployer sans passer par la
grille de décision du module 21. Le réflexe à avoir ici : ce qui remplace un contournement
JavaScript par du CSS natif mérite une veille active, parce que le contournement, lui, coûte déjà
cher.

## 5. L'accessibilité dans ce module

**`12.8 (A)` et `10.3 (A)`** : même problème qu'au module 05, et Grid offre la bonne solution.

```html
<!-- DOM dans l'ordre logique : titre, contenu, navigation secondaire -->
<main class="page">
  <h1>Membres</h1>
  <section class="contenu">...</section>
  <nav class="filtres" aria-label="Filtres">...</nav>
</main>
```

```css
/* Les filtres apparaissent à gauche sans être avant dans le DOM */
.page {
  display: grid;
  grid-template-areas: "titre titre" "filtres contenu";
  grid-template-columns: 14rem 1fr;
}
.page h1 { grid-area: titre; }
.page .filtres { grid-area: filtres; }
.page .contenu { grid-area: contenu; }
```

Rien n'a été réordonné : chaque élément est placé. La tabulation suit le DOM, qui est l'ordre
logique, et l'œil voit la disposition voulue. C'est la différence entre **placer** et
**réordonner**, et c'est pour cette raison que `grid-template-areas` est préférable à `order`
chaque fois que les deux sont possibles.

**`10.11 (AA)`, linéarisation à 320 pixels.** Une grille à colonnes fixes ne linéarise pas. Les
deux réponses correctes sont le motif `auto-fill` du § 1.3, ou une redéclaration des zones sous
container query (module 08). Le symptôme à l'audit est immédiat : défilement horizontal.

**Remarque sur `display: contents`**, souvent utilisé pour « aplatir » un wrapper dans une
grille : voir module 04 § 5, parce que la boîte disparaît et que la sémantique de certains
éléments l'a longtemps suivie.

## 6. Ce que l'enquête interroge, et où c'est traité

Items `css2026` rattachés à ce module : `subgrid`, `css_grid_lanes`.

`subgrid` est passé en quelques années du statut de proposition à celui de solution disponible
partout, et il remplace une catégorie entière de contournements, les hauteurs fixes et les
calculs JavaScript d'alignement. C'est l'exemple type de ce que la veille annuelle doit attraper :
pas une nouveauté séduisante, mais une fonctionnalité qui permet de supprimer du code existant.

## 7. Les pièges

1. **Écrire `1fr` en croyant à « une part ».** C'est `minmax(auto, 1fr)`, donc un débordement dès
   qu'un contenu est large. `minmax(0, 1fr)` est l'écriture sûre.
2. **Oublier `min()` dans le motif `auto-fill`.** La grille déborde sur les conteneurs plus
   étroits que le minimum de piste.
3. **Choisir `auto-fit` par habitude.** Trois cartes étirées sur toute la largeur n'est pas
   toujours l'effet voulu.
4. **Oublier `grid-auto-rows`.** Les lignes implicites s'écrasent au contenu.
5. **Déclarer `subgrid` sans `span`.** Sans plusieurs pistes à hériter, l'effet est nul.
6. **Attendre que `subgrid` hérite du `gap`.** Il ne l'hérite pas.
7. **Utiliser `dense` sur une liste ordonnée.** L'ordre visuel cesse de correspondre à l'ordre
   réel, et l'ordre portait du sens.
8. **Réordonner avec `order` alors que `grid-area` permet de placer.** Non conforme `12.8 (A)`
   pour rien, puisque la solution conforme était disponible.

## 8. Lire avant le lab

Pour [lab-06](../labs/lab-06-grid-subgrid/README) : § 1.1, § 1.3, § 3 en entier, § 5. Une
lecture, puis page blanche.

## 9. Auto-test

1. Quelle est la valeur complète derrière `1fr`, et quelle conséquence pratique ?
2. Pourquoi `repeat(auto-fill, minmax(18rem, 1fr))` déborde-t-il dans un conteneur de 300
   pixels, et comment le corriger ?
3. Trois cartes dans un espace qui en tiendrait six : que donne `auto-fill`, et `auto-fit` ?
4. Qu'est-ce qu'une piste implicite, et quelle propriété la dimensionne ?
5. Que `subgrid` hérite-t-il exactement, et que n'hérite-t-il pas ?
6. Quel prérequis structurel une sous-grille doit-elle remplir pour servir à quelque chose ?
7. Quelle est la différence, en termes d'accessibilité, entre placer avec `grid-area` et
   réordonner avec `order` ?
8. Pourquoi `grid-auto-flow: dense` est-il inadapté à une liste d'étapes numérotées ?
