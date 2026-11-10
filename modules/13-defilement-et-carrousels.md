# 13. Défilement et carrousels

> **Outcome :** à la fin, tu sais ce qui fait d'un élément un conteneur de défilement et pourquoi
> il n'est pas focusable par défaut, tu sais poser un accrochage sans emprisonner le clavier, tu
> sais pourquoi une barre de défilement provoque un décalage de mise en page et comment
> l'empêcher, et tu sais quels quatre critères un carrousel met en jeu.
>
> **Lab :** [lab-11 : carrousel accessible](../labs/lab-11-carrousel-accessible/README)

## 1. Le mécanisme : scrollport et conteneur de défilement

Un élément devient conteneur de défilement quand son `overflow` vaut `auto`, `scroll`, `hidden` ou
`clip` sur au moins un axe, et que son contenu dépasse. La partie visible s'appelle le
**scrollport** : c'est le référentiel de l'accrochage, des marges d'accrochage et des timelines
de défilement du module 12.

Un détail qui a des conséquences : `overflow: hidden` crée **aussi** un conteneur de défilement,
simplement sans barre. Le contenu est bien défilable par programme, et il peut être défilé par
le focus clavier, ce qui produit l'effet déroutant d'un contenu qui se décale sans barre visible.
`overflow: clip` ne crée pas de conteneur de défilement, et c'est la bonne valeur quand on veut
réellement couper.

### 1.1 Le problème d'accessibilité fondateur

Une zone qui défile doit pouvoir être défilée **au clavier seul**. Or une `<div>` avec
`overflow: auto` n'est pas focusable : sans souris ni molette, son contenu est inatteignable.

Firefox donne le focus aux zones défilantes, les autres moteurs non de façon fiable. La parade
portable :

```html
<div class="tableau-large" tabindex="0" role="region" aria-label="Résultats détaillés">
  <table>…</table>
</div>
```

`tabindex="0"` rend la zone focusable, donc défilable aux flèches. Le `role="region"` plus un nom
accessible évitent d'ajouter un arrêt de tabulation muet, ce qui serait désagréable. C'est le
motif à connaître pour tout tableau large, tout bloc de code et tout conteneur à défilement
horizontal, et il relève de `12.8 (A)` et de `12.11 (A)`.

## 2. L'accrochage

```css
.piste {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 1rem;      /* marge interne du scrollport pour l'accrochage */
}
.piste > * {
  flex: 0 0 min(100%, 22rem);
  scroll-snap-align: start;
  scroll-snap-stop: always;          /* interdit de sauter plusieurs éléments d'un geste */
}
```

| Propriété | Rôle |
|---|---|
| `scroll-snap-type` | axe, et `mandatory` ou `proximity` |
| `scroll-snap-align` | point d'accrochage de l'enfant : `start`, `center`, `end` |
| `scroll-snap-stop: always` | empêche de survoler plusieurs points d'un seul geste |
| `scroll-padding` | sur le conteneur : décale la zone d'accrochage, utile sous un en-tête collant |
| `scroll-margin` | sur l'enfant : son propre décalage |

`scroll-padding` est l'outil qui règle le bug classique de l'ancre cachée sous un en-tête
collant :

```css
html { scroll-padding-block-start: 5rem; }   /* la hauteur de l'en-tête sticky */
```

### 2.1 `mandatory` et le piège

`mandatory` force le défilement à se poser sur un point d'accrochage. Si un élément est plus haut
que le scrollport, son contenu devient inatteignable : le navigateur ramène systématiquement la
position vers le point d'accrochage, donc on ne peut pas s'arrêter au milieu.

La règle : `mandatory` seulement si chaque élément tient entièrement dans le scrollport. Sinon
`proximity`, qui accroche quand on est proche et laisse libre autrement.

## 3. Chaînage et débordement

```css
.panneau { overscroll-behavior: contain; }
```

Par défaut, quand un conteneur atteint sa fin, le défilement se propage au parent. Dans un
panneau latéral ou une modale, c'est désagréable : on fait défiler la page derrière.
`overscroll-behavior: contain` arrête la propagation en gardant le rebond natif ; `none` supprime
aussi le rebond.

C'est la réponse native au `body { overflow: hidden }` posé à l'ouverture d'une modale, avec sa
conséquence connue : la page qui saute en haut parce qu'on a perdu la position de défilement.

## 4. La barre de défilement elle-même

```css
html { scrollbar-gutter: stable; }
.liste { scrollbar-width: thin; scrollbar-color: var(--pouce) transparent; }
```

`scrollbar-gutter: stable` réserve la place de la barre même quand elle n'est pas affichée. Cela
supprime le décalage de mise en page qui se produit quand un contenu devient défilable, par
exemple à l'ouverture d'un accordéon. Ce décalage est à la fois disgracieux et un problème
d'accessibilité : un élément qui se déplace sous le pointeur au moment du clic provoque des
activations non voulues.

`scrollbar-color` demande de la prudence : une barre trop discrète cesse d'indiquer qu'il y a
quelque chose à défiler, et une barre très fine devient difficile à viser pour une personne à
motricité réduite. C'est une décoration dont le coût est fonctionnel, et `3.3 (AA)` s'applique si
la barre devient le seul indice de défilement.

## 5. Défilement animé

```css
html { scroll-behavior: smooth; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }     /* obligatoire, voir module 12 */
}
```

`scroll-behavior: smooth` est un défilement animé, donc du mouvement non demandé. La ligne de
neutralisation n'est pas optionnelle, et c'est l'une des trois oubliées du module 12 § 4.2.

Et le cas à éviter entièrement : le détournement du défilement, à savoir intercepter la molette
pour imposer sa propre progression. Cela casse la vitesse attendue par l'utilisateur, les
technologies d'assistance, la navigation clavier, et c'est l'un des motifs les plus nocifs pour
les troubles vestibulaires.

## 6. Les carrousels CSS

Une proposition récente ajoute des pseudo-éléments pour fabriquer un carrousel sans JavaScript :

```css
.piste {
  scroll-snap-type: x mandatory;
}
.piste::scroll-button(inline-start) { content: "‹"; }
.piste::scroll-button(inline-end) { content: "›"; }
.piste::scroll-marker-group { position-area: block-end; }
.piste > li::scroll-marker { content: ""; }
```

Ce que cela fournit : des boutons de défilement et des marqueurs de position générés par le
navigateur, donc focusables et étiquetés par lui.

Ce que cela ne fournit pas, et c'est le point à retenir : **l'annonce du changement**. Un
carrousel accessible doit dire qu'on est passé du panneau 2 au panneau 3. Cela reste à écrire,
voir § 7.

Statut : proposition, implémentation partielle. La grille de décision du module 21 s'applique,
et pour un composant aussi sensible que le carrousel, le repli doit être une liste défilable
ordinaire, qui est déjà utilisable.

## 7. L'accessibilité dans ce module

Un carrousel est l'un des composants les plus souvent non conformes du web, et il cumule quatre
critères.

**`12.8 (A)` et `12.11 (A)`, ordre de tabulation et contenus atteignables au clavier.** Les
panneaux hors écran doivent soit être retirés de la tabulation, soit atteignables. Le défaut
classique : six panneaux dont cinq sont hors écran mais tous dans l'ordre de tabulation, donc le
focus part sur un contenu invisible.

```html
<!-- Les panneaux non actifs sont retirés de la tabulation ET de l'arbre -->
<li class="panneau" inert>…</li>
```

`inert` est le bon outil : il retire du focus et de l'arbre d'accessibilité en une fois, ce qui
évite la combinaison fautive `aria-hidden` plus focusable décrite au module 01.

**`7.5 (AA)`, messages de statut.** Le changement de panneau doit être restitué sans déplacer le
focus.

```html
<p class="sr-only" role="status">Panneau 3 sur 6 : Ateliers</p>
```

`role="status"` annonce sans voler le focus. L'erreur symétrique est de déplacer le focus sur le
nouveau panneau à chaque changement, ce qui interrompt la lecture.

**`13.8 (A)`, mouvement contrôlable.** Un carrousel qui défile automatiquement doit avoir un
bouton de pause **visible et utilisable au clavier**. Respecter `prefers-reduced-motion` ne
suffit pas, voir module 12 § 4.3. Le plus simple reste de ne pas faire défiler automatiquement.

**`13.10 (A)`, gestes complexes**, et **`13.11 (A)`, annulation de l'action du pointeur.** Un
carrousel pilotable seulement au glissement exige une alternative par simple appui, donc des
boutons précédent et suivant. Et l'action ne doit pas se déclencher à l'enfoncement du pointeur,
pour qu'un geste commencé par erreur puisse être annulé en relâchant ailleurs.

À quoi s'ajoute **`10.11 (AA)`** : à 320 pixels, un carrousel doit rester utilisable, ce qui
plaide pour une liste défilable plutôt que pour un panneau pleine largeur par vue.

## 8. Ce que l'enquête interroge, et où c'est traité

Items `css2026` rattachés à ce module : `scroll_snap`, `overscroll_behavior`, `scroll_behavior`,
`scrollbar_gutter`, `scroll_state`, `css_carousels`.

`scroll_state` est traité au module 12 § 3.1, parce qu'il appartient à la même mécanique que les
animations liées au défilement. Il est rattaché ici dans le mapping de couverture pour une seule
raison : la couverture exige **un** module propriétaire par item, et c'est le défilement qui est
son sujet. Les deux modules se renvoient l'un à l'autre plutôt que de se répéter, exactement ce
que l'audit du 09/11 reprochait aux onze cours qui parlaient d'accessibilité.

## 9. Les pièges

1. **Laisser une zone défilante non focusable.** Inatteignable au clavier, non conforme
   `12.11 (A)`.
2. **Ajouter `tabindex="0"` sans nom accessible.** Un arrêt de tabulation muet.
3. **Utiliser `mandatory` avec des éléments plus hauts que le scrollport.** Contenu
   inatteignable.
4. **Oublier `scroll-padding` sous un en-tête collant.** Les ancres arrivent cachées.
5. **Fermer le défilement du corps avec `overflow: hidden` à l'ouverture d'une modale.** La page
   saute. `overscroll-behavior: contain` fait le travail.
6. **Oublier de neutraliser `scroll-behavior: smooth`** sous préférence réduite.
7. **Détourner la molette.** Nocif, et casse les attentes de tous les modes d'interaction.
8. **Laisser les panneaux hors écran dans la tabulation.** Utiliser `inert`.
9. **Déplacer le focus à chaque changement de panneau** au lieu d'annoncer par `role="status"`.
10. **Faire défiler automatiquement sans bouton de pause.** Non conforme `13.8 (A)`.

## 10. Lire avant le lab

Pour [lab-11](../labs/lab-11-carrousel-accessible/README) : § 1.1, § 2 et 2.1, § 7 en entier. Une
lecture, puis page blanche.

## 11. Auto-test

1. Qu'est-ce qui fait d'un élément un conteneur de défilement, et pourquoi `overflow: clip`
   diffère-t-il de `hidden` ?
2. Pourquoi une `<div>` en `overflow: auto` pose-t-elle un problème de clavier, et quel est le
   motif de correction complet ?
3. Dans quel cas `scroll-snap-type: mandatory` rend-il un contenu inatteignable ?
4. Quel problème `scroll-padding-block-start` résout-il ?
5. Que fait `overscroll-behavior: contain`, et quel contournement remplace-t-il ?
6. Pourquoi `scrollbar-gutter: stable` est-il aussi une question d'accessibilité ?
7. Cite les quatre critères qu'un carrousel met en jeu, et le défaut typique de chacun.
8. Pourquoi annoncer avec `role="status"` plutôt que déplacer le focus sur le nouveau panneau ?
