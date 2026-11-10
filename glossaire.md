# Glossaire

> Une entrée par terme que le cours utilise comme s'il allait de soi. Si un terme du cours
> n'est pas ici et qu'il n'est pas défini dans son module, c'est un manque à signaler.
>
> Convention : le module indiqué est celui qui **possède** la notion, pas ceux qui la citent.

## A

**Arbre d'accessibilité** (module 01). Structure calculée par le navigateur à partir du DOM, et
seule structure que voit une technologie d'assistance. Chaque nœud y porte un rôle, un nom
accessible, un état et des propriétés. Il ne contient pas les mêmes nœuds que le DOM : il peut
être juste quand le markup est laid, et faux quand le markup est beau.

**Appearance** (module 16). Propriété CSS qui retire ou restaure l'apparence natale d'un contrôle
de formulaire. `appearance: none` supprime le dessin du système, mais ne supprime ni le
comportement ni la sémantique, et c'est précisément ce qui la rend utile.

## C

**Cascade layer** (module 02). Couche déclarée par `@layer`, qui s'intercale dans la cascade
**avant** le calcul de spécificité. Conséquence contre-intuitive mais centrale : un sélecteur
très spécifique dans une couche basse perd contre un sélecteur faible d'une couche haute.

**Confinement** (module 08). Promesse faite au navigateur, via `container-type`, qu'un élément
ne dépend pas de la taille de ses descendants. Sans elle, les container queries seraient un
cycle de calcul infini. C'est le prix à payer, et il a des effets de bord sur le dimensionnement.

**Containing block** (module 04). Boîte de référence par rapport à laquelle les pourcentages et
le positionnement d'un élément sont résolus. Elle n'est pas toujours le parent, et c'est l'une
des trois causes les plus fréquentes de « ça ne se positionne pas où je veux ».

## E

**ElementInternals** (module 18). Interface qui permet à un élément personnalisé d'exposer son
rôle, son nom accessible et ses états à l'arbre d'accessibilité, sans les écrire comme attributs
dans le DOM de la page.

**Espace de couleur** (module 10). Système de coordonnées pour désigner une couleur. sRGB est
historique et limité, OKLCH est perceptuellement uniforme, ce qui change la façon dont les
dégradés et les variations de luminosité se comportent.

## F

**Formatting context** (module 04). Zone de mise en page dont les règles sont autonomes. En
créer un isole, ce qui explique autant la fin des marges fusionnées que le confinement des
flottants.

## G

**Gamut** (module 10). Étendue des couleurs qu'un espace ou un écran peut représenter. Une
couleur hors gamut est ramenée dans l'étendue disponible, et le résultat n'est pas toujours
celui qu'on a écrit.

## I

**Interpolation discrète** (module 12). Mode d'animation des propriétés qui n'ont pas de valeurs
intermédiaires, comme `display`. Sans traitement particulier, la bascule a lieu d'un coup, au
mauvais moment.

## N

**Nom accessible** (module 01). Chaîne qui désigne un élément dans l'arbre d'accessibilité,
calculée par un algorithme à priorités : `aria-labelledby`, puis `aria-label`, puis le mécanisme
natif de l'élément, puis `title`. Règle associée : le nom visible doit être inclus dans le nom
accessible, sans quoi le pilotage à la voix échoue.

## O

**Origine de cascade** (module 02). Provenance d'une déclaration : navigateur, utilisateur ou
auteur. L'ordre de priorité entre origines s'inverse pour les déclarations `!important`, ce qui
est la raison pour laquelle une feuille de style utilisateur peut gagner.

## P

**Pattern ARIA** (module 17). Description normalisée des rôles, états et interactions clavier
d'un composant que la plateforme ne fournit pas. Ce n'est pas une suggestion : les touches
attendues font partie du contrat.

**Pseudo-élément interne** (module 16). Partie interne d'un contrôle natif, exposée au style par
le navigateur. Leur nommage n'est pas uniforme entre moteurs, et c'est la raison principale pour
laquelle styler un `<select>` reste pénible.

## R

**Ratio de contraste** (module 10). Rapport entre les luminances relatives de deux couleurs,
compris entre 1 et 21. Seuils du référentiel : 4,5 pour un texte normal, 3 pour un texte agrandi
et pour les éléments non textuels porteurs d'information.

**Reflow** (module 07). Capacité d'une page à se réorganiser sans défilement sur deux axes quand
l'espace se réduit. Mesuré à 320 pixels de large, ce qui équivaut à un zoom de 400 % sur un
écran de 1280.

**Rôle implicite** (module 01). Rôle qu'un élément HTML porte sans qu'on l'écrive. `<button>` est
`button`, `<nav>` est `navigation`. Un `<div>` n'en a aucun, et c'est ce qui le rend transparent
pour l'arbre d'accessibilité.

## S

**Scrollport** (module 13). Zone visible d'un conteneur de défilement. C'est par rapport à elle
que se calculent l'accrochage, les marges d'accrochage et les timelines de défilement.

**Shadow DOM** (module 18). Arbre attaché à un élément, dont le style est encapsulé et dont le
contenu est projeté par des emplacements. Il protège le style, mais il ne coupe pas l'arbre
d'accessibilité, ce qui est une bonne nouvelle et une source de confusion.

**Slot** (module 18). Point d'insertion dans un shadow DOM où le contenu fourni par la page est
projeté. Le contenu projeté reste stylé par la page, pas par le composant, ce qui surprend la
première fois.

**Snap** (module 13). Accrochage du défilement à des positions définies. Confortable à la
souris, souvent hostile au clavier si rien n'est prévu, d'où son traitement avec les critères de
navigation.

**Spécificité** (module 02). Triplet comptant identifiants, classes et éléments, utilisé pour
trancher entre déclarations de même origine et de même couche. `:where()` a une spécificité
nulle, ce qui en fait l'outil de base d'une feuille de style qu'on peut surcharger.

**Stacking context** (module 04). Contexte d'empilement dans lequel `z-index` a un sens. Le
créer involontairement, par une transformation, une opacité ou un filtre, est la cause la plus
fréquente des `z-index` qui « ne marchent pas ».

## T

**Timeline de défilement** (module 12). Progression d'une animation liée à la position de
défilement plutôt qu'au temps. Change la nature du mouvement : il devient la conséquence d'une
action de l'utilisateur.

**Top layer** (module 09). Couche de rendu au-dessus de tout le document, où vivent les boîtes
de dialogue modales et les popovers. C'est elle qui met fin aux surenchères de `z-index`.

## Z

**Zone (landmark)** (module 01). Région identifiée du document, comme `banner`, `navigation`,
`main` ou `contentinfo`, qui permet de sauter directement à une partie de la page au lieu de la
parcourir linéairement.
