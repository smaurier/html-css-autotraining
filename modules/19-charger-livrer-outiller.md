# 19. Charger, livrer, outiller

> **Outcome :** à la fin, tu sais quelles images doivent être chargées tôt et lesquelles tard et
> pourquoi `loading="lazy"` sur l'image principale est un contresens, tu sais écrire un jeu
> d'images responsives correct, et tu as une grille de choix pour l'outillage CSS au lieu d'un
> catalogue.

## 1. Les priorités de chargement

Le navigateur attribue une priorité à chaque ressource. Ton travail consiste moins à « optimiser »
qu'à ne pas lui mentir.

```html
<!-- Image principale, visible d'emblée : priorité haute, PAS de lazy -->
<img src="hero.avif" alt="" width="1200" height="600" fetchpriority="high">

<!-- Images sous la ligne de flottaison -->
<img src="carte-3.avif" alt="" width="400" height="300" loading="lazy" decoding="async">
```

| Attribut | Effet |
|---|---|
| `loading="lazy"` | ne charge que lorsque l'image approche du viewport |
| `fetchpriority="high"` | monte la priorité, pour l'image principale |
| `decoding="async"` | autorise le décodage hors du fil principal |
| `width` et `height` | réservent la place, donc évitent le décalage de mise en page |

**`loading="lazy"` sur l'image principale est un contresens** fréquent : elle est visible
immédiatement, donc le différé retarde l'affichage du contenu le plus important. La règle est
simple : paresseux pour ce qui est hors écran, priorité haute pour l'image principale, rien pour
le reste.

`width` et `height` ne sont pas décoratifs : sans eux, la page saute quand l'image arrive. Ce
décalage est pénible pour tout le monde, et il provoque des clics sur le mauvais élément, ce qui
rejoint `13.11 (A)` du module 13.

### 1.1 Les règles de spéculation

```html
<script type="speculationrules">
{
  "prerender": [{ "where": { "href_matches": "/membres/*" }, "eagerness": "moderate" }],
  "prefetch":  [{ "where": { "href_matches": "/*" }, "eagerness": "conservative" }]
}
</script>
```

Précharger ou prérendre les pages probables, de façon déclarative. `eagerness` règle
l'agressivité : `conservative` au survol prolongé, `moderate` plus tôt, `eager` immédiatement.

Deux précautions. Le prérendu **exécute** la page cible, donc les analytics et les effets de bord
se déclenchent avant toute visite : il faut utiliser l'API de prérendu pour les différer. Et sur
une connexion mesurée, précharger agressivement consomme les données de quelqu'un d'autre.

## 2. Les images responsives

```html
<img
  src="photo-800.avif"
  srcset="photo-400.avif 400w, photo-800.avif 800w, photo-1600.avif 1600w"
  sizes="(width >= 64rem) 33vw, (width >= 48rem) 50vw, 100vw"
  width="800" height="600"
  alt="Atelier cuisine du dimanche, huit personnes autour d'un plan de travail">
```

Les deux attributs répondent à deux questions différentes, et c'est la confusion la plus
fréquente.

- **`srcset`** dit *quelles tailles de fichier existent*.
- **`sizes`** dit *quelle place l'image occupera dans la mise en page*.

Sans `sizes`, le navigateur suppose `100vw` et télécharge trop gros. Et `sizes` doit être
maintenu en cohérence avec le CSS, ce qui est sa faiblesse structurelle : une refonte de grille
rend les `sizes` faux, silencieusement.

D'où l'intérêt de la valeur automatique :

```html
<img srcset="…" sizes="auto" loading="lazy" width="800" height="600" alt="…">
```

`sizes="auto"` demande au navigateur de déduire la taille réelle de la mise en page. Elle
n'est utilisable qu'avec `loading="lazy"`, par construction : il faut que la mise en page existe
déjà pour pouvoir la mesurer. C'est la fin de la désynchronisation entre `sizes` et le CSS, pour
les images différées.

### 2.1 `<picture>`, pour un vrai choix

```html
<picture>
  <source type="image/avif" srcset="photo.avif">
  <source type="image/webp" srcset="photo.webp">
  <img src="photo.jpg" alt="…" width="800" height="600">
</picture>
```

`<picture>` sert quand le choix porte sur le **format** ou sur un **recadrage** différent selon la
taille d'écran. Pour un simple choix de résolution, `srcset` seul suffit, et `<picture>` est du
balisage en trop.

Rappel du module 01, et c'est le critère `1.1 (A)` : `alt` est sur l'`<img>`, jamais sur le
`<source>`, et il décrit l'information portée par l'image, pas le fichier.

### 2.2 Les polices

```css
@font-face {
  font-family: "Inter";
  src: url("/polices/inter-var.woff2") format("woff2-variations");
  font-display: swap;
  font-weight: 100 900;
  size-adjust: 100%;
  unicode-range: U+0000-00FF;
}
```

```html
<link rel="preload" href="/polices/inter-var.woff2" as="font" type="font/woff2" crossorigin>
```

`font-display: swap` affiche le texte immédiatement avec une police de repli, puis échange. Le
texte est lisible tout de suite, au prix d'un saut visuel. `optional` évite le saut mais peut ne
jamais afficher la police voulue.

`size-adjust` permet d'ajuster la police de repli pour que l'échange ne décale pas la mise en
page. C'est le détail qui transforme un `swap` brutal en échange discret, et il est très peu
utilisé.

## 3. L'outillage, en grille de choix

L'enquête recense quatorze frameworks, onze solutions de CSS dans le JavaScript, six processeurs
et dix utilitaires. Un catalogue serait inutile. Trois questions suffisent à trancher.

### 3.1 Les trois questions

**Qui écrit le style : le composant, ou la feuille ?** Si c'est le composant, on va vers du CSS
dans le JavaScript ou des classes utilitaires. Si c'est la feuille, vers du CSS avec `@layer` du
module 02.

**Le style doit-il être extractible à la compilation ?** Les solutions à l'exécution
(`styled-components`, `emotion`) coûtent du JavaScript sur la page. Les solutions à zéro
exécution (`vanilla-extract`, `panda_css`, `linaria`, `pigment_css`, `style_x`) produisent du CSS
statique. En 2026, c'est le critère qui a le plus bougé, et la direction est claire.

**Qui maintient le contrat de style ?** `::part` du module 18, les custom properties du module
03, ou rien. Un composant sans contrat de style explicite sera surchargé au `!important`, et on
revient au module 02.

### 3.2 Les familles

| Famille | Exemples | Quand |
|---|---|---|
| Classes utilitaires | `tailwind_css`, `uno_css`, `acss` | équipe nombreuse, cohérence par contrainte |
| Tokens sans classes | `open_props` | on veut des variables, pas un framework |
| Composants prêts | `bootstrap`, `bulma`, `foundation`, `pico_css`, `materialize_css` | prototype, site de contenu |
| Composants React | `material_ui`, `ant_design`, `mantine`, `shadcn_ui`, `semantic_ui` | application, si l'accessibilité est documentée |
| CSS dans le JS, à l'exécution | `styled_components`, `emotion`, `jss`, `styled_jsx`, `styled_system` | existant, rarement un nouveau choix |
| CSS dans le JS, zéro exécution | `vanilla_extract`, `panda_css`, `linaria`, `pigment_css`, `style_x` | on veut la colocalisation sans le coût |
| Portée native | `css_modules` | simple, durable, sans dépendance de rendu |
| Processeurs | `sass`, `less`, `stylus`, `post_css`, `lightning_css`, `assembler_css` | ce que le CSS natif ne fait pas encore |
| Qualité | `stylelint`, `prettier`, `biome`, `eslint`, `cssnano`, `autoprefixer`, `purge_css`, `project_wallace`, `post_css_preset_env` | tout projet |

### 3.3 Deux positions argumentées

**Sur Sass.** Son intérêt a fondu : variables, imbrication, et bientôt les fonctions sont
natifs, voir modules 02 et 03. Ce qui reste est réel mais étroit : les boucles, les mixins
complexes, et la composition de fichiers. Un projet neuf en 2026 peut légitimement s'en passer.
Un projet existant n'a aucune raison de migrer en urgence.

**Sur les classes utilitaires.** Le vrai argument n'est pas la vitesse d'écriture, c'est la
**contrainte partagée** : personne n'invente une valeur d'espacement. Le vrai coût n'est pas la
lisibilité du balisage, c'est que la cascade n'est plus utilisée, donc que `@layer`, `:has()` et
`@scope` ne servent plus à rien. C'est un échange, pas un progrès, et il faut l'évaluer selon
l'équipe plutôt que selon la mode.

Et un rappel qui relève de ce cours : **aucun outil de cette liste ne rend une interface
accessible.** Une bibliothèque de composants peut aider, à une condition vérifiable : qu'elle
documente les rôles et le clavier de chaque composant, et qu'elle les teste. C'est la seule
question à lui poser.

## 4. L'accessibilité dans ce module

**`1.1 (A)`, alternative aux images.** Tout ce module manipule des images. Le `alt` est sur
l'`<img>`, il décrit l'information, et il est vide pour une décoration. Voir module 01 § 4.

**`10.2 (A)`, contenu inséré en CSS.** Une image de fond CSS porteuse d'information est non
conforme, puisqu'elle disparaît feuilles de style désactivées. Le test de décision du module 03
§ 5 s'applique : si l'information doit survivre, elle est dans le HTML.

Et une remarque sur la performance comme question d'accessibilité, parce qu'elle est rarement
faite : une page lourde est d'abord un problème pour ceux qui ont un appareil ancien, une
connexion lente ou un forfait compté. Ce n'est pas un critère du référentiel, mais c'est le même
public que celui que le référentiel protège.

## 5. Ce que l'enquête interroge, et où c'est traité

Items rattachés à ce module : `lazy_loading`, `respimg_attributes`, `img_sizes_auto`,
`fetchpriority_attribute`, `speculation_rules`, plus les 41 outils des quatre familles.

Deux nouveautés 2026 dans cette liste, `material_ui` et `mantine`, sont des entrées côté outils.
Leur apparition dans l'enquête CSS, alors qu'elles sont des bibliothèques React, dit quelque
chose du métier : la frontière entre écrire du CSS et consommer un système de design s'efface,
et c'est précisément pour cela que le module 02 et le module 18 comptent, à savoir savoir
surcharger proprement et savoir ce qu'un composant expose.

## 6. Les pièges

1. **`loading="lazy"` sur l'image principale.** Retarde le contenu le plus important.
2. **Omettre `width` et `height`.** La page saute, et les clics partent au mauvais endroit.
3. **Écrire `srcset` sans `sizes`.** Le navigateur suppose `100vw` et télécharge trop gros.
4. **Laisser `sizes` se désynchroniser du CSS.** Utiliser `sizes="auto"` quand c'est possible.
5. **Mettre `alt` sur un `<source>`.** Il n'y est pas lu.
6. **Utiliser `<picture>` pour un simple choix de résolution.**
7. **Prérendre agressivement.** Effets de bord déclenchés, données consommées.
8. **Choisir une bibliothèque de composants sans vérifier sa documentation clavier.**
9. **Croire qu'un outil rend accessible.** Aucun de la liste ne le fait.

## 7. Auto-test

1. Pourquoi `loading="lazy"` sur l'image principale est-il un contresens ?
2. À quelles deux questions différentes répondent `srcset` et `sizes` ?
3. Pourquoi `sizes="auto"` exige-t-il `loading="lazy"` ?
4. Quand `<picture>` est-il justifié, et quand est-il du balisage en trop ?
5. Que fait `size-adjust`, et quel désagrément supprime-t-il ?
6. Quelles sont les trois questions de la grille de choix d'outillage ?
7. Quel est le vrai coût des classes utilitaires, au-delà de la lisibilité du balisage ?
8. Quelle est la seule question à poser à une bibliothèque de composants, du point de vue de
   l'accessibilité ?
