# 12. Mouvement et préférence de mouvement

> **Outcome :** à la fin, tu sais animer une propriété discrète comme `display` sans astuce, tu
> sais ce qu'une transition de vue fait à l'arbre, tu sais lier une animation au défilement
> plutôt qu'au temps, et tu sais dégrader une chorégraphie sous `prefers-reduced-motion` au lieu
> de simplement la raccourcir.
>
> **Lab :** [lab-10 : mouvement respectueux](../labs/lab-10-mouvement-respectueux/README)

## 1. Le mécanisme : interpoler, et ce qui ne s'interpole pas

Une transition calcule des valeurs intermédiaires entre un état de départ et un état d'arrivée.
Cela suppose que la propriété ait des valeurs intermédiaires : une longueur, une couleur, une
transformation. Certaines propriétés n'en ont pas, et sont dites **discrètes** : `display`,
`visibility` sous conditions, `overlay`.

Historiquement, cela rendait impossible deux choses très demandées : animer l'apparition d'un
élément absent du rendu, et animer sa disparition. D'où une génération de contournements à base
de `max-height` et de `visibility` décalée dans le temps.

### 1.1 Les trois pièces du puzzle

```css
.panneau {
  display: none;
  opacity: 0;
  transition: opacity 250ms, display 250ms allow-discrete;
}

/* L'état d'arrivée */
.panneau.ouvert { display: block; opacity: 1; }

/* L'état de DÉPART, sinon il n'y a rien à interpoler depuis display: none */
@starting-style {
  .panneau.ouvert { opacity: 0; }
}
```

Trois mécanismes distincts, et il faut les trois :

**`allow-discrete`** autorise une propriété discrète à être « animée » : elle bascule à un moment
choisi de la transition, à la fin pour une disparition, au début pour une apparition. Ce n'est pas
une interpolation, c'est un report de bascule, et c'est exactement ce qu'il fallait.

**`@starting-style`** donne la valeur de départ d'un élément qui vient d'entrer dans le rendu. Sans
lui, l'élément apparaît directement à sa valeur finale : il n'existait pas avant, donc il n'y a
aucun « avant » à interpoler.

**`overlay`**, pour un élément du top layer, permet de le maintenir dans cette couche pendant
l'animation de sortie, au lieu de le voir retomber brutalement dans le flux.

```css
dialog {
  transition: opacity 200ms, overlay 200ms allow-discrete, display 200ms allow-discrete;
}
```

C'est la combinaison qui permet enfin de fermer une modale en fondu sans JavaScript de
temporisation.

## 2. Les transitions de vue

### 2.1 Dans un même document

```css
.carte-image { view-transition-name: image-produit; }
```

```js
document.startViewTransition(() => {
  /* on met le DOM dans son nouvel état, le navigateur s'occupe du reste */
  appliquerNouvelEtat();
});
```

Le navigateur prend une image de l'ancien état, applique la mutation, prend une image du nouveau,
puis anime la différence. Deux éléments qui portent le **même** `view-transition-name` avant et
après sont reliés, et l'un se transforme en l'autre.

Les pseudo-éléments `::view-transition-old()` et `::view-transition-new()` permettent de piloter
l'animation. Point d'attention : un `view-transition-name` doit être **unique** dans la page à un
instant donné. Deux éléments avec le même nom simultanément annulent la transition, ce qui est le
bug le plus fréquent quand on anime une liste.

### 2.2 Entre documents

```css
@view-transition { navigation: auto; }
```

Une ligne, dans les deux pages concernées, et une navigation classique devient animée. C'est le
mécanisme qui réduit l'un des arguments en faveur d'une application monopage.

### 2.3 Le point d'accessibilité

Pendant la transition, les images animées sont des **instantanés**. Elles ne sont pas dans
l'arbre d'accessibilité, et le DOM réel, lui, a déjà changé. Deux conséquences :

- une transition longue crée un décalage entre ce que la personne voyante voit et ce qu'un
  lecteur d'écran annonce déjà ;
- le focus suit le DOM réel, pas l'image. Un focus posé sur un élément en cours d'animation peut
  donner l'impression d'un halo au mauvais endroit.

La règle pratique : des transitions **courtes**, et une neutralisation sous
`prefers-reduced-motion`, voir § 4.

## 3. Lier le mouvement au défilement

```css
/* Barre de progression de lecture, sans un seul écouteur d'évènement */
.progression {
  animation: remplir linear;
  animation-timeline: scroll(root block);
}
@keyframes remplir { from { scale: 0 1; } to { scale: 1 1; } }

/* Apparition d'un élément quand il entre dans la vue */
.carte {
  animation: entrer linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}
```

Deux fonctions de timeline. `scroll()` suit la progression d'un conteneur de défilement.
`view()` suit la progression de **l'élément lui-même** dans le scrollport, ce qui remplace
l'usage le plus courant d'`IntersectionObserver` pour les effets d'apparition.

`animation-range` borne la portion de timeline utilisée, avec des mots-clés comme `entry`,
`exit`, `cover`, `contain`.

L'intérêt technique, au-delà du confort d'écriture : ces animations tournent hors du fil
principal, donc elles ne saccadent pas quand le JavaScript travaille. C'est la différence
observable avec un écouteur de défilement.

### 3.1 `scroll-state`

```css
.entete { container-type: scroll-state; position: sticky; top: 0; }

@container scroll-state(stuck: top) {
  .entete-ombre { opacity: 1; }
}
```

Une requête de conteneur qui interroge l'état de défilement : `stuck` quand un élément collant est
effectivement collé, `snapped` quand un élément est accroché, `scrollable` quand il reste quelque
chose à défiler. Cela supprime le motif de l'`IntersectionObserver` sur une sentinelle invisible,
qui était le seul moyen de styler un en-tête collé.

## 4. `prefers-reduced-motion`, un contrat

Ce n'est pas une préférence esthétique. Les troubles vestibulaires provoquent, face à un mouvement
non voulu, des vertiges, des nausées, des migraines. La personne qui a coché ce réglage dans son
système l'a fait pour une raison.

### 4.1 Ce qui déclenche, par ordre de nocivité

| Motif | Risque |
|---|---|
| Parallaxe, plans qui défilent à vitesses différentes | élevé |
| Zoom ou translation sur une grande surface | élevé |
| Défilement détourné, « scroll hijacking » | élevé |
| Carrousel qui tourne tout seul | élevé |
| Apparitions en cascade sur une longue page | moyen |
| Fondu d'opacité, changement de couleur | faible |

### 4.2 Réduire n'est pas raccourcir

L'erreur la plus répandue :

```css
/* ⛔ Insuffisant : le mouvement a toujours lieu, juste plus vite.
   Pour un trouble vestibulaire, une translation de 400 pixels en 10 ms reste une
   translation de 400 pixels. */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

Ce qu'il faut faire : **supprimer le déplacement, garder l'information**. Un élément qui entrait
en glissant depuis le bas entre en fondu, sans se déplacer. L'utilisateur garde l'indication
qu'un changement a eu lieu, sans subir le mouvement.

```css
.carte { animation: glisser-et-apparaitre 300ms both; }

@media (prefers-reduced-motion: reduce) {
  .carte { animation: apparaitre 150ms both; }   /* une autre animation, pas la même raccourcie */
  .progression { animation-timeline: none; }     /* l'animation au défilement est coupée */
  html { scroll-behavior: auto; }                /* plus de défilement animé */
}

@keyframes glisser-et-apparaitre { from { opacity: 0; translate: 0 2rem; } }
@keyframes apparaitre { from { opacity: 0; } }
```

Trois lignes sont souvent oubliées dans ce bloc : couper `animation-timeline`, remettre
`scroll-behavior: auto`, et neutraliser les transitions de vue.

Et un piège d'ordre, qui fait perdre un quart d'heure la première fois :

```css
/* ⛔ animation-timeline revient à `auto` : le raccourci `animation` le réinitialise */
.progression { animation-timeline: none; animation: none; }

/* ✅ le raccourci d'abord, les propriétés précises ensuite */
.progression { animation: none; animation-timeline: none; }
```

`animation` est un raccourci, et comme tout raccourci il remet à leur valeur initiale les
propriétés qu'il englobe, `animation-timeline` comprise. L'écrire après annule donc
silencieusement la ligne précédente. La règle générale vaut pour tous les raccourcis :
**le raccourci avant les propriétés précises, jamais l'inverse.**

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
    animation: none !important;
  }
}
```

### 4.3 Les critères

**`13.8 (A)` : pour chaque contenu en mouvement ou clignotant, il existe un moyen de l'arrêter**,
sauf si le mouvement dure moins de 5 secondes. Le point important : la condition est **un moyen
de l'arrêter**, à savoir un vrai contrôle, visible et utilisable au clavier. Respecter
`prefers-reduced-motion` est nécessaire mais ne remplace pas le contrôle : la personne qui n'a pas
activé le réglage système doit aussi pouvoir arrêter un carrousel automatique.

**`13.7 (A)` : pas d'effet de flash** supérieur à trois fois par seconde, sauf si la surface
reste sous le seuil prévu par le référentiel. Concerne les vidéos, les animations stroboscopiques
et certains effets de transition brutaux. L'outil de mesure est PEAT, voir module 20.

**`10.13 (AA)`** s'applique aussi, voir module 09 : un contenu additionnel animé doit rester
contrôlable.

## 5. Ce que l'enquête interroge, et où c'est traité

Items `css2026` rattachés à ce module : `view_transitions`, `scroll_driven_animations`,
`discrete_properties_animations`, `prefers_reduced_motion`.

Ces quatre items racontent la même histoire : le mouvement quitte le JavaScript. Les transitions
de vue remplacent des bibliothèques d'animation de page, les animations au défilement remplacent
`IntersectionObserver` et les écouteurs de défilement, les propriétés discrètes remplacent les
temporisations manuelles. Et `prefers_reduced_motion` est dans la même liste, ce qui est
cohérent : plus le mouvement devient facile, plus la préférence devient le garde-fou qui compte.

## 6. Les pièges

1. **Animer `display` sans `allow-discrete`.** La bascule a lieu immédiatement, le fondu ne se
   voit pas.
2. **Oublier `@starting-style`.** L'élément apparaît directement à sa valeur finale.
3. **Oublier `overlay` sur un élément du top layer.** Il retombe dans le flux pendant la sortie.
4. **Réutiliser un `view-transition-name` sur deux éléments simultanément.** La transition est
   annulée.
5. **Réduire la durée au lieu de supprimer le déplacement.** Ne protège de rien.
6. **Oublier `animation-timeline: none` et `scroll-behavior: auto`** dans le bloc de préférence
   réduite.
7. **Croire que respecter `prefers-reduced-motion` suffit pour `13.8 (A)`.** Le critère demande
   un moyen d'arrêter, donc un contrôle.
8. **Animer `width`, `height` ou `top`.** Voir module 04 : mise en page refaite à chaque image.

## 7. Lire avant le lab

Pour [lab-10](../labs/lab-10-mouvement-respectueux/README) : § 1.1 en entier, § 2.1, § 3 (le
premier bloc), § 4.2 en entier. Une lecture, puis page blanche.

## 8. Auto-test

1. Qu'est-ce qu'une propriété discrète, et cite-en une.
2. Quels sont les trois mécanismes nécessaires pour faire disparaître un élément en fondu puis le
   retirer du rendu ?
3. À quoi sert `@starting-style`, et pourquoi n'est-il pas remplaçable par une classe initiale ?
4. Que se passe-t-il si deux éléments portent le même `view-transition-name` au même moment ?
5. Quelle est la différence entre `scroll()` et `view()` comme timeline ?
6. Pourquoi `animation-duration: 0.01ms` n'est-il pas une réponse acceptable à
   `prefers-reduced-motion` ?
7. Cite les trois lignes souvent oubliées dans un bloc de préférence réduite.
8. Respecter `prefers-reduced-motion` suffit-il à satisfaire `13.8 (A)` ? Justifie.
