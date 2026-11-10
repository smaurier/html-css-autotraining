# 01. Le document et l'arbre d'accessibilité

> **Outcome :** à la fin, tu sais qu'un document produit **deux** arbres et pas un, tu sais
> calculer à la main le nom accessible d'un élément dans le bon ordre de priorité, tu sais
> quels éléments disparaissent de l'arbre d'accessibilité et pourquoi, et tu rattaches chaque
> geste de structuration au critère RGAA qui le juge.
>
> **Lab :** [lab-01 : l'arbre d'accessibilité](../labs/lab-01-arbre-d-accessibilite/README)

## 1. Le mécanisme : deux arbres

Écrire du HTML ne produit pas un arbre, il en produit deux.

```
      source HTML
           │
           ▼
      ┌─────────┐        ┌──────────────────────────┐
      │   DOM   │───────▶│  arbre d'accessibilité   │
      └─────────┘        └──────────────────────────┘
           │                          │
           ▼                          ▼
      rendu visuel            API de la plateforme
      (module 04)         (UIA sous Windows, AX sous macOS,
                           AT-SPI sous Linux) → lecteur d'écran
```

Le premier est celui que tu inspectes tous les jours. Le second est **calculé** à partir du
premier, par le navigateur, et c'est **lui seul** que voit un lecteur d'écran. Il ne contient
pas les mêmes nœuds, il ne porte pas les mêmes informations, et il peut être juste quand le
DOM est laid, ou faux quand le DOM est beau.

Toute l'accessibilité technique tient dans cette phrase : **tu ne codes pas pour le DOM, tu
codes pour l'arbre qu'il produit.** Et comme cet arbre est calculé, il est inspectable et
testable, donc falsifiable. C'est pour ça que les oracles de ce cours interrogent `getByRole`
plutôt que des balises.

### 1.1 Ce que porte un nœud de cet arbre

Quatre choses, et c'est exactement le vocabulaire du critère `7.1` :

| Attribut | Question à laquelle il répond | Exemple |
|---|---|---|
| **rôle** | qu'est-ce que c'est ? | `button`, `link`, `heading`, `list` |
| **nom accessible** | comment ça s'appelle ? | « Ajouter un membre » |
| **état** | dans quel état est-ce ? | pressé, désactivé, étendu, sélectionné |
| **propriétés** | quelles relations, quelles contraintes ? | requis, décrit par, niveau de titre |

Un composant interactif qui n'a pas les trois premiers est une non-conformité `7.1 (A)`, quel
que soit son aspect à l'écran. Le piège classique n'est pas d'oublier le rôle, c'est d'oublier
**le changement d'état** : un bouton Lecture / Pause doit soit changer de nom, soit porter
`aria-pressed`. Un bouton muet qui change seulement d'icône ne restitue rien.

### 1.2 Rôle implicite, rôle explicite

Chaque élément HTML porte un rôle implicite. `<button>` est `button`, `<nav>` est `navigation`,
`<ul>` est `list`, `<h2>` est `heading` de niveau 2. Un `<div>` ne porte **aucun** rôle, et c'est
précisément ce qui le rend invisible dans l'arbre.

```html
<!-- Trois boutons à l'écran. Un seul est un bouton dans l'arbre. -->
<button>Supprimer</button>                            <!-- role=button, focusable, Entrée + Espace -->
<div role="button" tabindex="0">Supprimer</div>        <!-- role=button, focusable, mais le clavier
                                                            est à recoder entièrement à la main -->
<div class="btn">Supprimer</div>                       <!-- rien du tout -->
```

La première règle d'ARIA est en réalité une règle d'économie : **ARIA n'ajoute aucun
comportement.** `role="button"` ne rend rien activable par la touche Espace, ne met rien dans
l'ordre de tabulation, ne déclenche rien. Il ne fait que mentir ou dire vrai à l'arbre. Tout le
comportement reste à ta charge. Un `<button>` native te donne le rôle, le focus, l'activation
clavier, la soumission de formulaire et le style d'état, gratuitement.

C'est le sens du critère `8.9 (A)` : la sémantique du balisage doit être respectée. Un `<div>`
qui joue le paragraphe ou un `<h3>` choisi pour sa taille sont des non-conformités, même si
l'écran est parfait.

### 1.3 L'algorithme du nom accessible

Le nom n'est pas « le texte de l'élément ». C'est le résultat d'un algorithme à priorités, et
le savoir par cœur change la façon de déboguer. Ordre décroissant :

```
1. aria-labelledby      → concatène le texte des éléments cités (et écrase tout le reste)
2. aria-label           → la chaîne donnée
3. le natif de l'élément → <label for>, alt, <caption>, <legend>, <figcaption>, le contenu
4. title                → en dernier recours seulement
```

Deux conséquences que l'on rencontre en audit beaucoup plus souvent qu'on ne l'imagine :

```html
<!-- Le texte visible est « Valider ». Le nom accessible est « Annuler ». -->
<button aria-label="Annuler">Valider</button>
```

C'est une non-conformité double : `11.9 (A)` sur l'intitulé de bouton, et surtout la règle
« **nom visible ⊂ nom accessible** » (`11.2 / 11.3`, et `6.1` pour les liens). Une personne qui
pilote à la voix dit « cliquer sur Valider » et il ne se passe rien. L'`aria-label` bien
intentionné est l'une des premières causes de boutons inatteignables.

```html
<!-- aria-labelledby gagne, même en citant un élément masqué -->
<h2 id="t">Membres de la famille</h2>
<section aria-labelledby="t"> … </section>
```

### 1.4 Qui disparaît de l'arbre

Quatre mécanismes retirent un nœud, et ils ne sont pas interchangeables :

| Mécanisme | Retiré de l'arbre | Visible à l'écran | Focusable |
|---|---|---|---|
| `display: none`, `visibility: hidden` | oui | non | non |
| `hidden` (attribut) | oui | non | non |
| `aria-hidden="true"` | oui | **oui** | **oui, et c'est le piège** |
| classe de masquage visuel (`.visually-hidden`) | non | non | oui |

`aria-hidden="true"` sur un élément focusable crée le pire cas : un élément que le clavier
atteint mais que le lecteur d'écran ne peut pas nommer. Le focus arrive sur un trou.

À l'inverse, la classe de masquage visuel (clip, `1px`, `overflow: hidden`, jamais
`display: none`) est l'outil légitime quand un texte doit exister pour l'arbre sans occuper
l'écran : c'est la mécanique du lien d'accès rapide (`12.7`) et des intitulés de colonnes
masqués.

Le critère `10.8 (A)` juge exactement cette cohérence : les contenus cachés doivent l'être
correctement, pour tout le monde en même temps.

## 2. La structure du document comme contrat

### 2.1 Les régions

```html
<body>
  <header>            <!-- role=banner       : unique -->
    <nav> … </nav>    <!-- role=navigation   -->
  </header>
  <main> … </main>    <!-- role=main         : unique, obligatoire -->
  <aside> … </aside>  <!-- role=complementary -->
  <footer> … </footer><!-- role=contentinfo  : unique -->
</body>
```

Un lecteur d'écran permet de sauter de région en région. Sans régions, la seule navigation
possible est linéaire, du premier au dernier nœud. C'est la différence entre consulter une page
et la subir.

- `9.2 (A)` : la structure du document est respectée (`header`, `nav`, `main`, `footer`).
- `12.6 (A)` : les zones principales sont atteignables et évitables. `banner`, `navigation` et
  `main` sont uniques dans la page.
- `12.7 (A)` : un lien d'accès rapide au contenu, fonctionnel et visible à la prise de focus.

Deux `<nav>` dans une page sont légitimes, à condition de les distinguer : `aria-label`
« Navigation principale » et « Fil d'Ariane ». Deux régions de même rôle sans nom laissent
l'utilisateur deviner.

### 2.2 Les titres

`9.1 (A)` juge trois choses : les titres sont **présents**, **pertinents**, et leur hiérarchie
est **cohérente**. Ce que le critère ne dit pas, et qu'on croit souvent à tort :

- l'absence de `h1` n'est pas en soi une non-conformité ;
- une hiérarchie qui ne démarre pas à `h1` n'est pas en soi une non-conformité ;
- un saut de niveau n'est pas en soi une non-conformité.

Ce qui est jugé, c'est que les titres existent là où il y a des sections de contenu, et que
leur imbrication raconte la vraie structure. Un `<h4>` choisi parce qu'il est plus petit à
l'écran casse ce contrat, et c'est aussi une infraction à `8.9`.

La présentation ne se règle pas avec le niveau de titre. Elle se règle en CSS, et c'est le
critère `10.1 (A)` : la mise en forme est exclusivement en CSS.

### 2.3 Les listes et les citations

`9.3 (A)` est le critère le plus oublié du thème, et sa formulation est stricte : **toute suite
de liens doit être une liste**. Une barre de navigation faite de `<a>` côte à côte dans un
`<div>` est non conforme, même parfaite visuellement. La raison est utilitaire : la liste
annonce « six éléments » avant de les énumérer, ce qui permet de décider de les écouter ou de
passer.

`9.4 (A)` traite les citations : `<q>` en ligne, `<blockquote>` en bloc.

### 2.4 Langue et titre de page

| Critère | Ce qui est jugé |
|---|---|
| `8.3 (A)` et `8.4 (A)` | `lang` présent sur `<html>`, code ISO 639 valide |
| `8.5 (A)` et `8.6 (A)` | `<title>` présent et pertinent, idéalement unique dans le site |
| `8.7 (AA)` et `8.8 (AA)` | chaque changement de langue est signalé par `lang` sur l'élément |
| `8.10 (A)` | les changements de sens de lecture sont signalés par `dir` |

`lang` n'est pas décoratif : il choisit la voix de synthèse. Un texte français lu par une voix
anglaise est inintelligible, pas seulement inélégant. C'est aussi la clé des propriétés
logiques du module 07 et de la césure.

Note : `8.1 (A)` et `8.2 (A)` ne se testent plus et sont toujours conformes. Les citer comme réussite
dans un audit est une erreur de méthode.

### 2.5 `<template>`

`<template>` est le seul élément dont le contenu est **parsé sans être ni rendu ni exposé**.
C'est le point de départ du shadow DOM déclaratif (module 18) et le bon outil quand un fragment
doit exister en HTML sans entrer dans aucun des deux arbres.

```html
<template id="ligne-membre">
  <li class="membre"><span class="nom"></span></li>
</template>
```

Attention à la confusion fréquente : un contenu que tu veux masquer **temporairement** à
l'utilisateur n'est pas un `<template>`, c'est un élément `hidden` ou `hidden-until-found`
(module 15).

## 3. Pour qui, concrètement

L'enquête State of HTML demande aux développeurs pour quels handicaps ils ont déjà travaillé.
La liste mérite d'être lue comme un rappel de ce que les critères protègent, parce qu'un
critère sans visage devient une case à cocher.

| Situation | Ce qui casse en premier | Critères en première ligne |
|---|---|---|
| Vision faible (`low_vision`) | zoom, contraste, texte en image | `10.4`, `3.2`, `1.8` |
| Vision atypique (`atypical_vision`) | information portée par la couleur seule | `3.1`, `3.3` |
| Mobilité réduite (`mobility_impairments`) | cibles petites, gestes complexes, tabulation | `12.8`, `13.10`, `13.11` |
| Troubles vestibulaires (`vestibular_disorders`) | parallaxe, mouvement non contrôlable | `13.8`, `prefers-reduced-motion` |
| Troubles de l'apprentissage (`learning_disabilities`) | libellés implicites, erreurs sans exemple | `11.10`, `11.11` |
| Troubles cognitifs (`cognitive_impairments`) | changements de contexte inattendus, délais | `7.4`, `13.1` |
| Audition (`hearing_impairments`) | média sans sous-titres ni transcription | `4.1 (A)` à `4.4 (A)` |

Les techniques que la même enquête recense (`headings_hierarchy`, `skip_to_content`,
`meaningful_link_text`, `descriptive_alt_text`) sont toutes dans ce module ou le suivant. Ce
n'est pas un hasard : ce sont les gestes de structuration, et ils se jouent dans le document.

## 4. Les liens et les images, puisqu'on y est

Deux familles qui vivent dans la structure du document plutôt que dans le style.

**Liens.** `6.2 (A)` : le lien a un intitulé, donc pas de lien vide (un lien dont le seul
contenu est une icône sans alternative est vide). `6.1 (A)` : le lien est explicite, par son
intitulé seul ou par son contexte. « En savoir plus » répété huit fois est le cas d'école.

**Images.** La première décision oriente tout le reste, et elle n'est pas technique :
l'image **porte-t-elle de l'information** ou est-elle **décorative** ?

```html
<!-- décorative : retirée de l'arbre, et c'est le but -->
<img src="separateur.svg" alt="">

<!-- porteuse : alternative présente (1.1) et pertinente (1.3) -->
<img src="graphique-adhesions.png"
     alt="Adhésions 2026 : 120 en janvier, 340 en juin">

<!-- SVG porteuse : sans role="img", les technologies d'assistance l'ignorent -->
<svg role="img" aria-label="Logo TribuZen"> … </svg>
```

- `1.1 (A)` alternative présente, `1.3 (A)` alternative pertinente, `1.2 (A)` décoration bien
  ignorée.
- `1.8 (AA)` : un texte en image se remplace par du texte stylé, sauf logo et cas non
  reproductible. C'est la rencontre du thème 1 et du module 11.
- `1.9 (A)` : image légendée, `<figure role="group" aria-label="…">` avec `<figcaption>`.

Deux cas particuliers du thème 1, qui n'ont l'air exotiques que jusqu'au premier audit.

**Les images complexes** (`1.6 (A)` et `1.7 (A)`). Quand l'alternative ne tient pas dans une
phrase, un graphique ou un schéma par exemple, elle doit être **structurée** et accessible. Donc
pas dans l'attribut `alt`, qui est du texte brut, mais dans un texte adjacent ou derrière un lien
identifiable.

```html
<figure>
  <img src="evolution-adhesions.svg" role="img"
       alt="Évolution des adhésions 2024-2026, détail sous l'image">
  <figcaption>
    Évolution des adhésions
    <a href="#detail-adhesions">Description détaillée</a>
  </figcaption>
</figure>
<div id="detail-adhesions">
  <h3>Détail des adhésions</h3>
  <table>…</table>   <!-- un tableau de données est souvent la meilleure alternative -->
</div>
```

L'attribut `longdesc` est obsolète : ne pas l'utiliser. Et c'est exactement le motif que le cours
26 reprend pour les graphiques, avec son tableau de données équivalent.

**Les CAPTCHA** (`1.4 (A)` et `1.5 (A)`). Un CAPTCHA image doit avoir une alternative qui en
**identifie la nature**, à savoir dire que c'est un test de sécurité et non décrire l'image, plus
une **alternative non graphique**, sonore ou logique.

```html
<img src="captcha.png" alt="Test de sécurité : recopiez les cinq caractères affichés">
<button type="button">Écouter le test de sécurité</button>
```

Le bon réflexe en conception reste de ne pas en mettre : les solutions sans énigme, par analyse
comportementale ou par jeton, évitent le problème au lieu de le rendre conforme.

## 4 bis. Les cadres et le contenu cryptique

Deux familles courtes, souvent oubliées parce qu'elles ne ressemblent à rien d'autre.

**Les cadres** (`2.1 (A)` et `2.2 (A)`) : chaque `<iframe>` porte un `title` pertinent, qui dit sa
**nature**.

```html
<iframe src="…" title="Vidéo de présentation de TribuZen"></iframe>
<iframe src="…" title="Carte du lieu de rendez-vous"></iframe>
```

Sans `title`, un lecteur d'écran annonce « cadre » et rien d'autre. Le contenu d'un cadre tiers
n'est pas sous ta responsabilité, mais son identification l'est, et l'obligation de
non-interférence reste.

**Le contenu cryptique** (`13.5 (A)` et `13.6 (A)`) : un art ASCII, une émoticône faite de
caractères, une suite d'émojis porteuse de sens doivent avoir une alternative, par un `title` ou
par le contexte.

```html
<p><span title="Je suis content">:-)</span></p>
<p>Taux de remplissage <span role="img" aria-label="quatre étoiles sur cinq">★★★★☆</span></p>
```

C'est le critère qui attrape les « ★★★★☆ » lus caractère par caractère, et les suites d'émojis
annoncées par leur nom Unicode complet, ce qui est long et incompréhensible.

## 5. Ce que l'enquête interroge, et où c'est traité

Items `html2026` rattachés à ce module : `tabindex_attribute`, `focusgroup_attribute`,
`headings_hierarchy`, `skip_to_content`, `meaningful_link_text`, `descriptive_alt_text`,
`template_element`, et les sept situations de handicap listées au § 3.

Deux méritent un mot.

**`tabindex`.** Trois valeurs, trois sens, et un seul usage recommandé :

```
tabindex="0"   → entre dans l'ordre naturel. Le seul à utiliser sur un composant custom.
tabindex="-1"  → focusable par script seulement. Utile pour déplacer le focus après une action.
tabindex="2"   → force un ordre absolu. Casse l'ordre du DOM, ingérable à l'échelle d'une page.
```

Un `tabindex` positif est presque toujours un bug. Le critère `12.8 (A)` demande un ordre de
tabulation **cohérent** : le moyen de l'obtenir est un ordre du DOM qui correspond à l'ordre
visuel, pas une renumérotation. Le module 04 montre comment Flex et Grid peuvent dissocier les
deux, et pourquoi c'est une non-conformité `10.3`.

**`focusgroup`** (nouveauté 2026 de l'enquête) est une proposition qui déclare qu'un groupe
d'éléments se parcourt aux flèches plutôt qu'à la tabulation, c'est-à-dire le comportement que
les patterns ARIA imposent aujourd'hui de coder à la main (module 17). À suivre, pas à déployer :
la grille de décision du module 21 dit quoi en faire.

## 6. Les pièges

1. **Croire que le DOM est l'arbre.** Un markup propre peut produire un arbre faux, par
   exemple avec un `aria-label` sur un conteneur qui écrase le texte de tous ses enfants.
2. **`aria-label` sur un élément sans rôle.** Sur un `<div>` ou un `<span>` nu, il est
   purement et simplement ignoré. Nommer quelque chose qui n'existe pas dans l'arbre ne crée
   rien.
3. **Le nom visible qui n'est pas inclus dans le nom accessible.** Casse le pilotage vocal,
   non conforme `11.2`, `6.1`.
4. **`aria-hidden` sur un focusable.** Le clavier y va, la voix n'a rien à dire.
5. **Une suite de liens dans un `<div>`.** Non conforme `9.3`, et personne ne s'en plaint
   jamais à l'œil.
6. **Le niveau de titre choisi pour sa taille.** `8.9` et `10.1` en même temps.
7. **Deux régions de même rôle sans nom.** Techniquement conforme, inutilisable en pratique.

## 7. Lire avant le lab

Pour [lab-01](../labs/lab-01-arbre-d-accessibilite/README), une seule lecture de : § 1.1, § 1.3
en entier, § 1.4 (le tableau), § 2.1, § 2.3. Puis page blanche.

## 8. Auto-test

Confiance 1, 2 ou 3 avant de vérifier. Les ratés alimentent le question bank.

1. Dans quel ordre le navigateur calcule-t-il un nom accessible ? Cite les quatre niveaux.
2. `<button aria-label="Annuler">Valider</button>` : quel nom accessible, et quel critère est
   en cause ?
3. Quelle différence entre `aria-hidden="true"` et une classe de masquage visuel, et dans quel
   cas chacun est légitime ?
4. Pourquoi `role="button"` sur un `<div>` ne suffit-il pas, même avec `tabindex="0"` ?
5. Un saut de `h2` à `h4` est-il une non-conformité `9.1` ? Justifie.
6. Pourquoi une barre de navigation doit-elle être une liste ?
7. Que fait exactement un `tabindex="3"`, et pourquoi est-ce presque toujours un bug ?
