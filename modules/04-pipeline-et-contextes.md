# 04. Le pipeline de rendu et les contextes

> **Outcome :** à la fin, tu sais nommer les quatre étapes du rendu et dire laquelle une
> propriété déclenche, tu sais résoudre un containing block sans deviner, tu sais ce qui crée un
> contexte de formatage et un contexte d'empilement, et tu sais pourquoi un ordre visuel qui
> diverge de l'ordre du DOM est une non-conformité et pas un détail.
>
> **Lab :** [lab-04 : contextes](../labs/lab-04-contextes/README)

## 1. Le mécanisme : quatre étapes

```
    DOM + CSSOM
         │
    ┌────▼────┐
    │  style  │  quelles déclarations s'appliquent à quel élément, valeurs calculées
    └────┬────┘
    ┌────▼────┐
    │ layout  │  géométrie : taille et position de chaque boîte   (« reflow »)
    └────┬────┘
    ┌────▼────┐
    │  paint  │  remplissage des pixels dans des calques           (« repaint »)
    └────┬────┘
    ┌────▼────┐
    │composite│  assemblage des calques, souvent sur le GPU
    └─────────┘
```

Chaque étape dépend de la précédente. Déclencher `layout` oblige donc à refaire `paint` et
`composite`. C'est pourquoi toutes les propriétés ne coûtent pas la même chose.

| Ce que tu changes | Étape la plus haute déclenchée | Coût |
|---|---|---|
| `width`, `height`, `margin`, `padding`, `font-size`, `top` | layout | élevé, propagé aux voisins |
| `color`, `background-color`, `box-shadow`, `border-radius`, `visibility` | paint | moyen, local |
| `transform`, `opacity`, `filter` | composite | faible, souvent hors du fil principal |

D'où la règle d'animation, qui n'est pas une superstition : **animer `transform` et `opacity`,
jamais `width`, `height` ou `top`.** Déplacer un élément avec `left` refait la mise en page à
chaque image ; le déplacer avec `translate` ne fait que recomposer.

### 1.1 Promettre, et contenir

Deux outils pour parler au moteur, souvent confondus.

```css
.carte { will-change: transform; }   /* promesse : "ça va bouger, prépare un calque" */
.carte { contain: layout paint; }    /* garantie : "ce qui est dedans ne sort pas" */
```

`will-change` est une promesse coûteuse, à poser juste avant l'animation et à retirer après. Le
poser sur cent éléments en permanence consomme de la mémoire GPU pour rien et peut dégrader le
rendu.

`contain` est l'inverse : une garantie que **tu** donnes au moteur, et qui lui permet de ne pas
recalculer le reste de la page. `contain: layout` isole la géométrie, `contain: paint` promet
qu'aucun descendant ne dépasse, `contain: size` promet que la taille ne dépend pas du contenu.
`content-visibility: auto` va plus loin : il autorise le moteur à sauter entièrement le rendu de
ce qui est hors écran.

Important pour la suite du cours : `contain: size` est exactement la promesse que les container
queries exigent, et c'est pour ça que le module 08 parle de confinement avant de parler de
requêtes.

## 2. Le containing block

Presque tous les « ça ne se positionne pas où je veux » viennent d'un containing block mal
supposé. Les règles, dans l'ordre où le moteur les applique :

| Positionnement de l'élément | Son containing block |
|---|---|
| `static` ou `relative` | la zone de contenu du plus proche ancêtre de type bloc |
| `absolute` | la zone de **padding** du plus proche ancêtre **positionné** |
| `fixed` | le viewport, sauf exception du § 2.1 |
| `sticky` | comme `relative`, mais contraint par son conteneur de défilement |

Deux détails qui font la différence : `absolute` se cale sur la boîte de **padding** et non de
contenu, alors que `static` se cale sur le contenu. Et « ancêtre positionné » signifie un ancêtre
dont `position` n'est pas `static`, ce qui est la raison du réflexe `position: relative` sur le
parent.

### 2.1 Quand `fixed` n'est plus fixe

Un `position: fixed` peut cesser d'être relatif au viewport. Il suffit qu'un ancêtre crée ce
qu'on appelle un containing block de transformation, ce que font notamment :

- `transform` autre que `none`, `translate`, `rotate`, `scale`, `perspective` ;
- `filter`, `backdrop-filter` ;
- `will-change` mentionnant l'une de ces propriétés ;
- `contain: layout`, `contain: paint`, ou `content-visibility` ;
- `container-type: size` ou `inline-size`.

C'est le bug classique de la modale : une bannière parente avec un `transform` suffit à river la
modale dans la bannière. Le module 09 montre la vraie réponse, à savoir le top layer, qui échappe
entièrement à cette mécanique.

### 2.2 Les pourcentages ne parlent pas tous de la même chose

```css
.boite {
  width: 50%;        /* de la largeur du containing block */
  padding-top: 50%;  /* de la LARGEUR du containing block, pas de sa hauteur */
  height: 50%;       /* de la hauteur du containing block, qui doit être définie */
  transform: translateY(50%);  /* de la hauteur de l'ÉLÉMENT lui-même */
}
```

`padding-top` en pourcentage se réfère à la largeur : c'est le mécanisme qui a servi pendant
quinze ans à simuler un ratio, et que `aspect-ratio` remplace au module 07. `translateY` en
pourcentage se réfère à l'élément : c'est le mécanisme du centrage absolu classique.

## 3. Les contextes de formatage

Un contexte de formatage est une zone dont les règles de mise en page sont autonomes. En créer
un **isole**.

### 3.1 Ce qui crée un contexte de formatage de bloc

- `overflow` différent de `visible` ;
- `display: flow-root`, qui ne sert qu'à ça et sans effet de bord ;
- un élément flex ou grid enfant ;
- `float` différent de `none` ;
- `position: absolute` ou `fixed` ;
- `contain: layout`, `paint` ou `content` ;
- `display: inline-block`, `table-cell`, `flex`, `grid`.

### 3.2 Les deux problèmes que ça règle

**Les marges fusionnées.** Deux marges verticales adjacentes n'additionnent pas, elles fusionnent
et la plus grande gagne. Et la marge d'un premier enfant traverse son parent si rien ne l'arrête.

```css
/* La marge de l'enfant sortait du parent et poussait le parent lui-même */
.parent { display: flow-root; }   /* un contexte, la marge reste dedans */
```

`overflow: hidden` a le même effet, mais avec un effet de bord : il coupe ce qui dépasse, donc
une infobulle ou un halo de focus. `display: flow-root` fait le travail sans couper, et c'est la
seule raison de son existence.

**Les flottants.** Un parent ne grandit pas pour contenir ses enfants flottants, sauf s'il crée
un contexte. C'est tout le `clearfix` historique, devenu une ligne.

À noter : dans un conteneur flex ou grid, les marges ne fusionnent jamais. Beaucoup de surprises
de marges disparaissent simplement parce qu'on est passé en flex, sans que la cause soit comprise.

## 4. Les contextes d'empilement

`z-index` n'est pas global. Il n'a de sens qu'à l'intérieur d'un contexte d'empilement, et les
contextes s'empilent entre eux comme des blocs opaques.

### 4.1 Ce qui crée un contexte d'empilement

- l'élément racine ;
- `position` relative, absolute ou sticky avec un `z-index` différent de `auto` ;
- `position: fixed` ou `sticky`, **toujours**, même sans `z-index` ;
- `opacity` inférieure à 1 ;
- `transform`, `filter`, `perspective`, `clip-path`, `mask`, `mix-blend-mode` ;
- `isolation: isolate`, qui sert uniquement à ça ;
- `contain: paint` ;
- un enfant flex ou grid avec `z-index` différent de `auto` ;
- un élément du top layer.

### 4.2 Pourquoi `z-index: 99999` ne marche pas

```html
<div style="position: relative; z-index: 1">      <!-- contexte A -->
  <div style="position: relative; z-index: 99999">Je veux passer au-dessus</div>
</div>
<div style="position: relative; z-index: 2">Et pourtant je passe devant</div>
```

Le `99999` est comparé **à l'intérieur** du contexte A, pas avec le monde extérieur. A vaut 1,
le voisin vaut 2, donc tout le contenu de A passe derrière, quelle que soit la surenchère.

Le diagnostic correct ne consiste donc jamais à augmenter le nombre, mais à remonter l'arbre pour
trouver quel ancêtre crée un contexte. Et le piège silencieux est le § 4.1 : une simple `opacity:
0.99` posée pour un fondu crée un contexte d'empilement, donc enferme tous ses descendants.

`isolation: isolate` est l'outil pour créer un contexte **volontairement**, sans rien changer
d'autre à l'apparence.

## 5. `display: contents`

```css
.liste { display: contents; }
```

L'élément perd sa propre boîte, ses enfants remontent comme s'ils étaient enfants directs du
grand-parent. Utile pour qu'un wrapper intermédiaire ne gêne pas une grille.

Deux précautions, et la seconde est de l'accessibilité.

**La boîte disparaît vraiment.** Donc plus de fond, plus de bordure, plus de padding, plus de
transformation sur cet élément. Ce ne sont pas des règles ignorées « parfois » : il n'y a plus de
boîte à peindre.

**Le rôle implicite a longtemps disparu avec la boîte.** Sur des éléments dont la sémantique
dépend de leur structure, un `<ul>` ou un `<table>`, plusieurs moteurs retiraient le rôle de
l'arbre d'accessibilité. Le bug a été corrigé dans les moteurs principaux, mais c'est le cas
d'école de divergence entre les deux arbres du module 01 : un changement purement visuel qui
modifie ce que la personne entend. Avant de s'appuyer dessus sur un élément porteur de
sémantique, la vérification se fait dans l'inspecteur d'accessibilité, sur la cible réelle, et
pas dans la documentation.

## 6. Quand l'ordre visuel quitte l'ordre du DOM

Flex et Grid permettent de réordonner visuellement :

```css
.actions { display: flex; }
.actions .valider { order: -1; }   /* visuellement premier */
```

Le DOM reste inchangé. Donc :

- le **clavier** suit l'ordre du DOM, pas l'ordre visuel ;
- le **lecteur d'écran** lit l'ordre du DOM ;
- l'œil suit l'ordre visuel.

Deux critères sanctionnent cette divergence, et il faut les connaître séparément :

**`10.3 (A)` : l'ordre du contenu reste compréhensible feuilles de style désactivées.** C'est le
test du bandeau de cookies qui doit être en tête du DOM, et pas placé à la fin puis remonté
visuellement.

**`12.8 (A)` : l'ordre de tabulation est cohérent.** Si la tabulation va de « Annuler » à
« Valider » alors que l'écran montre « Valider » puis « Annuler », l'ordre n'est pas cohérent.

La réponse n'est jamais un `tabindex` positif, qui déplace le problème en le rendant ingérable,
voir module 01. La réponse est de **remettre le DOM dans l'ordre logique** et d'obtenir l'ordre
visuel par la grille, par `grid-area` par exemple, sans réordonner les enfants.

Même logique pour `direction: rtl` : il change l'axe inline, et le module 07 montre pourquoi les
propriétés logiques sont la bonne réponse plutôt que des surcharges de `left` et `right`.

## 7. Ce que l'enquête interroge, et où c'est traité

Item `css2026` rattaché à ce module : `display_contents`.

Un seul item pour un module entier, et c'est normal : une enquête interroge ce qui est nouveau ou
discutable, pas les mécanismes fondateurs. Le containing block et les contextes d'empilement
n'ont pas de ligne dans State of CSS parce que personne ne les « adopte », ils sont là. C'est
précisément pour cette raison qu'ils ne s'apprennent jamais par la veille, et qu'ils constituent
le vrai écart entre savoir faire et savoir pourquoi.

## 8. Les pièges

1. **Animer `top`, `left`, `width` ou `height`.** Mise en page refaite à chaque image.
2. **Laisser `will-change` en permanence.** Mémoire GPU consommée pour rien.
3. **Supposer que `absolute` se place par rapport au parent.** C'est par rapport au plus proche
   ancêtre positionné, et sur sa boîte de padding.
4. **Oublier qu'un `transform` sur un ancêtre casse un `position: fixed`.**
5. **Utiliser `overflow: hidden` pour contenir une marge.** Il coupe aussi les halos de focus, ce
   qui met `10.7 (A)` en danger. `display: flow-root` fait le même travail sans couper.
6. **Surenchérir sur `z-index`.** Le nombre est local à son contexte.
7. **Créer un contexte d'empilement sans le savoir**, par une `opacity` de fondu ou un
   `transform`.
8. **Réordonner avec `order` et croire que le clavier suit.** Non conforme `12.8 (A)`, invisible
   à l'œil, immédiat au test clavier.

## 9. Lire avant le lab

Pour [lab-04](../labs/lab-04-contextes/README) : § 2 en entier, § 4.1 et 4.2, § 6. Une lecture,
puis page blanche.

## 10. Auto-test

1. Nomme les quatre étapes du rendu, et dis laquelle `box-shadow` déclenche.
2. Pourquoi animer `transform` coûte-t-il moins qu'animer `left` ?
3. Quel est le containing block d'un `position: absolute`, et sur quelle boîte se cale-t-il ?
4. Cite trois propriétés qui empêchent un `position: fixed` d'être relatif au viewport.
5. `padding-top: 50%` se réfère à quoi ? Et `translateY(50%)` ?
6. Donne deux façons de contenir la marge d'un premier enfant, et dis laquelle a un effet de bord.
7. Pourquoi un `z-index: 99999` peut-il passer derrière un `z-index: 2` ?
8. Un bouton « Valider » remonté visuellement en premier par `order: -1` : quels critères sont en
   cause, et quelle est la bonne correction ?
