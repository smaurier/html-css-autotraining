# 05. Flexbox en vérité

> **Outcome :** à la fin, tu sais dérouler l'algorithme de distribution dans l'ordre, tu sais
> pourquoi `flex-shrink` ne se comporte pas symétriquement à `flex-grow`, tu sais diagnostiquer
> un débordement en une seule hypothèse au lieu de trois, et tu sais ce que `flex: 1` écrit
> réellement.
>
> **Lab :** [lab-05 : flex](../labs/lab-05-flex/README)

## 1. Le mécanisme : l'algorithme de distribution

Flexbox n'est pas une collection de propriétés, c'est un algorithme. Le dérouler dans l'ordre
rend presque tous ses comportements prévisibles.

```
1. taille de base         base size  = flex-basis, sinon width/height, sinon le contenu
2. taille hypothétique    base size bornée par min-width/max-width (et leurs équivalents)
3. espace libre           taille du conteneur moins la somme des tailles hypothétiques
4. distribution           espace libre positif → flex-grow
                          espace libre négatif → flex-shrink
5. bornage final          chaque élément est re-borné par ses min et max
6. alignement             justify-content, align-items, align-content
```

L'étape 5 est celle qu'on oublie, et c'est elle qui explique pourquoi un `flex-shrink: 1` ne
rétrécit parfois pas du tout : le bornage a le dernier mot sur la distribution.

### 1.1 `grow` et `shrink` ne sont pas symétriques

`flex-grow` distribue l'espace libre **au prorata des facteurs**. Trois éléments en
`flex-grow: 1` se partagent l'espace restant en trois parts égales, quelle que soit leur taille.

`flex-shrink` retire l'espace manquant **au prorata du facteur multiplié par la taille de base**.
Un élément large rétrécit davantage qu'un élément étroit à facteur égal.

```css
.a { flex: 0 1 400px; }   /* rétrécit 4 fois plus que .b */
.b { flex: 0 1 100px; }
```

C'est délibéré, et c'est ce qu'on veut : rétrécir un élément de 100 pixels autant qu'un de 400
le ferait disparaître d'abord. Mais ça rend tout calcul mental de `shrink` faux si on raisonne
comme pour `grow`.

### 1.2 La taille minimale automatique, cause numéro un des débordements

Un élément flex a `min-width: auto` par défaut, et `auto` ne vaut pas `0` : il vaut la taille
minimale du contenu. Un élément ne peut donc pas rétrécir sous la largeur de son mot le plus
long, ni sous la largeur intrinsèque d'un enfant, **même avec `flex-shrink: 1`**.

```css
/* Déborde : l'élément refuse de passer sous min-content */
.barre { display: flex; }
.barre .titre { flex: 1; }                      /* un long titre sort du cadre */

/* Corrigé : on autorise explicitement le rétrécissement */
.barre .titre { flex: 1; min-width: 0; }
```

Le même raisonnement vaut pour un conteneur de défilement imbriqué, où `min-height: 0` est la
condition pour que la zone scrollable prenne la hauteur disponible au lieu de pousser son parent.

**La bonne réaction devant un débordement en flex** n'est donc pas `overflow: hidden`, qui cache
le symptôme et coupe les halos de focus, mettant `10.7 (A)` en danger. C'est `min-width: 0` sur
l'élément qui refuse de rétrécir. Une hypothèse, pas trois.

Et pour un texte, il faut en plus dire ce qu'il advient du contenu :

```css
.titre { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

Attention : couper un texte visuellement avec `text-overflow` laisse le texte complet dans le
DOM, donc disponible pour les technologies d'assistance. Couper l'information en la supprimant du
DOM, à l'inverse, la retire pour tout le monde.

## 2. `flex-basis` contre `width`

`flex-basis` sert de taille de base et bat `width` quand les deux sont posés. `flex-basis: auto`
renvoie à `width`, et `flex-basis: content` à la taille du contenu.

Le raccourci, qu'il faut savoir déplier :

| Écriture | Équivalent | Comportement |
|---|---|---|
| `flex: 1` | `1 1 0%` | part de zéro, se partage tout l'espace à parts égales |
| `flex: auto` | `1 1 auto` | part du contenu, puis se partage le reste |
| `flex: none` | `0 0 auto` | taille du contenu, ni croissance ni rétrécissement |
| `flex: 0 1 auto` | la valeur par défaut | ne grandit pas, rétrécit si besoin |

La différence entre `flex: 1` et `flex: auto` est la plus utile à connaître : avec `flex: 1`,
trois éléments de contenus très inégaux font trois colonnes égales, parce qu'ils partent de zéro.
Avec `flex: auto`, ils gardent la proportion de leur contenu. Choisir l'un ou l'autre par réflexe
produit des mises en page qu'on « corrige » ensuite à coups de `width` inutiles.

## 3. Aligner

| Propriété | Axe | Portée |
|---|---|---|
| `justify-content` | principal | répartit les éléments et l'espace libre |
| `align-items` / `align-self` | croisé | aligne chaque élément dans sa ligne |
| `align-content` | croisé | répartit les **lignes**, donc sans effet sans `flex-wrap: wrap` |
| `gap` | les deux | espace entre éléments, sans marge négative |

`align-content` sans `wrap` qui ne fait rien est une perte de temps classique : avec une seule
ligne, il n'y a rien à répartir.

### 3.1 `margin: auto`, plus fort que `justify-content`

```css
/* Pousse ce bouton et tous les suivants vers la fin de l'axe */
.actions .deconnexion { margin-inline-start: auto; }
```

Les marges automatiques absorbent l'espace libre **avant** que `justify-content` n'entre en jeu.
C'est la façon propre de séparer un groupe d'un autre dans une barre, sans élément vide ni
`flex: 1` sur un séparateur fantôme.

### 3.2 L'alignement sur la ligne de base

```css
.carte { display: flex; align-items: baseline; }
```

Aligne les premières lignes de texte des éléments entre elles, et non leurs boîtes. C'est ce qu'on
veut pour un prix à côté de son libellé, ou une étiquette à côté d'un champ. `align-items:
center` fait visuellement « presque juste » et c'est pourquoi l'erreur reste : les deux textes ne
reposent pas sur la même ligne.

## 4. Flex ou Grid

La frontière utile n'est pas « une dimension contre deux dimensions », qui est vraie mais peu
opérante. Elle est :

- **Flex** quand la taille des éléments doit décider de la mise en page. Une barre d'outils dont
  les boutons ont la largeur de leur libellé, une liste d'étiquettes qui passe à la ligne.
- **Grid** quand la mise en page doit décider de la taille des éléments. Une grille de cartes où
  toutes les colonnes sont égales, un gabarit de page.

Un symptôme fiable : si tu écris des `width` en pourcentage sur des éléments flex, c'est
généralement que tu voulais une grille.

## 5. L'accessibilité dans ce module

Trois critères, dont deux déjà rencontrés au module 04.

**`12.8 (A)`, ordre de tabulation cohérent.** `order`, `row-reverse` et `column-reverse`
réordonnent visuellement sans toucher au DOM. Le clavier et le lecteur d'écran continuent de
suivre le DOM. Un `flex-direction: row-reverse` sur une barre d'actions est donc exactement le
même problème qu'un `order: -1`, et il est plus discret.

**`10.3 (A)`, ordre du contenu compréhensible CSS désactivées.** Même cause, autre test.

**`10.11 (AA)`, linéarisation.** À 320 pixels de large, soit un zoom de 400 % sur un écran de
1280, le contenu doit rester lisible sans défilement sur deux axes. En flex, cela signifie
pratiquement toujours `flex-wrap: wrap` et `min-width: 0`, parce qu'une ligne qui ne peut ni
rétrécir ni passer à la ligne produit un défilement horizontal.

## 6. Ce que l'enquête interroge, et où c'est traité

Aucun item `css2026` n'est rattaché à ce module, et c'est une information en soi : Flexbox n'est
plus interrogé parce qu'il n'est plus discuté. Il a disparu des enquêtes comme le modèle de boîte
en a disparu.

Conséquence pour la veille : les mécanismes qui ne figurent dans aucune enquête ne sont pas pour
autant maîtrisés. L'algorithme de distribution et la taille minimale automatique restent, après
dix ans de pratique, parmi les causes les plus fréquentes de bugs de mise en page. Un radar
d'actualité ne les montrera jamais.

## 7. Les pièges

1. **Raisonner sur `shrink` comme sur `grow`.** Le rétrécissement est pondéré par la taille de
   base.
2. **Oublier `min-width: auto`.** Un élément flex ne descend pas sous `min-content` sans
   autorisation explicite.
3. **Répondre à un débordement par `overflow: hidden`.** Cache la cause et coupe le halo de
   focus, donc met `10.7 (A)` en danger.
4. **Confondre `flex: 1` et `flex: auto`.** Colonnes égales contre colonnes proportionnelles au
   contenu.
5. **Attendre quelque chose de `align-content` sans `wrap`.**
6. **Utiliser `align-items: center` là où il faut `baseline`.**
7. **Ajouter un élément vide ou un `flex: 1` fantôme pour pousser un bouton**, au lieu d'une
   marge automatique.
8. **Réordonner avec `row-reverse`** et croire que le clavier suit. Non conforme `12.8 (A)`.

## 8. Lire avant le lab

Pour [lab-05](../labs/lab-05-flex/README) : § 1 en entier, § 2 (le tableau), § 3.1, § 5. Une
lecture, puis page blanche.

## 9. Auto-test

1. Déroule les six étapes de l'algorithme de distribution.
2. Deux éléments en `flex: 0 1 400px` et `flex: 0 1 100px`, conteneur trop petit de 100 pixels.
   Lequel rétrécit le plus, et de combien ?
3. Pourquoi un élément flex déborde-t-il malgré `flex-shrink: 1` ?
4. Déplie `flex: 1`, `flex: auto` et `flex: none`.
5. Pourquoi `align-content: center` ne fait-il rien dans un flex d'une seule ligne ?
6. Comment pousser le dernier bouton d'une barre vers la droite sans élément vide ?
7. En quoi `flex-direction: row-reverse` pose-t-il le même problème qu'un `tabindex` positif ?
8. Que faut-il presque toujours poser pour satisfaire `10.11 (AA)` en flex ?
