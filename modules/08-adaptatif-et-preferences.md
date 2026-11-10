# 08. Adaptatif : container queries et préférences

> **Outcome :** à la fin, tu sais pourquoi une container query exige une promesse de confinement
> et ce que cette promesse coûte, tu sais quand une requête de conteneur est la bonne réponse et
> quand la media query reste la bonne, et tu traites les préférences utilisateur comme un contrat
> plutôt que comme une option.
>
> **Lab :** [lab-07 : container queries](../labs/lab-07-container-queries/README)

## 1. Le mécanisme : pourquoi il faut promettre quelque chose

Une media query interroge le viewport, qui est connu avant toute mise en page. Une container
query interroge la taille d'un élément, qui est le **résultat** de la mise en page. Il y a donc un
risque de boucle : si le style d'un enfant dépend de la taille du parent, et que la taille du
parent dépend de ses enfants, le calcul ne converge pas.

La solution de la spécification est une promesse explicite :

```css
.carte {
  container-type: inline-size;   /* « ma largeur ne dépend pas de mes descendants »  */
  container-name: carte;         /* optionnel, mais recommandé */
}

@container carte (inline-size > 30rem) {
  .carte-corps { display: grid; grid-template-columns: 8rem 1fr; }
}
```

### 1.1 Les trois valeurs, et ce qu'elles coûtent

| `container-type` | Confine | Effet de bord |
|---|---|---|
| `normal` | rien | le défaut, pas un conteneur de taille |
| `inline-size` | l'axe inline | l'élément ne se dimensionne plus sur le contenu en largeur |
| `size` | les deux axes | il faut aussi une hauteur explicite, sinon l'élément s'effondre |

`inline-size` est le choix courant et presque toujours le bon. `size` est rarement voulu : un
élément dont la hauteur ne peut plus dépendre du contenu s'écrase à zéro si on ne lui donne pas
de hauteur, ce qui produit le bug classique du conteneur invisible.

Autre effet de bord à connaître, parce qu'il relie au module 04 : déclarer un `container-type`
crée un containing block de transformation. Un `position: fixed` à l'intérieur cesse d'être
relatif au viewport.

### 1.2 Les unités de conteneur

```css
.titre { font-size: clamp(1rem, 5cqi, 2rem); }
```

| Unité | Base |
|---|---|
| `cqi` | 1 % de l'inline-size du conteneur de requête |
| `cqb` | 1 % de son block-size |
| `cqw`, `cqh` | les équivalents physiques |
| `cqmin`, `cqmax` | la plus petite, la plus grande des deux |

`cqi` est l'unité réellement utile : elle permet à un composant d'avoir une typographie
proportionnelle à **lui-même** et non à l'écran, ce qui est la définition d'un composant
réutilisable.

### 1.3 Requêtes de style

```css
.carte { container-name: carte; }

@container carte style(--variante: vedette) {
  .carte-titre { font-size: 1.5rem; }
}
```

La requête de style interroge la valeur d'une custom property du conteneur, et non sa taille.
Elle ne demande aucun confinement, puisqu'elle ne crée pas de boucle de mise en page.

Son intérêt réel : porter une variante par une seule custom property héritée, au lieu de propager
une classe sur chaque descendant. L'alternative `if()` du module 03 § 3.4 fait un travail voisin
sur une seule déclaration ; la requête de style ouvre un bloc entier.

## 2. Container query ou media query

La question n'est pas de remplacer l'une par l'autre, elles répondent à des besoins différents.

| Besoin | Outil |
|---|---|
| Un composant s'adapte à la place qu'on lui donne | container query |
| Le gabarit de la page change | media query |
| La typographie de base change selon l'appareil | media query |
| Une carte réutilisée en pleine largeur et en colonne latérale | container query |
| Les préférences de l'utilisateur | media query, toujours |

Le test de décision : **est-ce que ce composant pourrait être placé ailleurs dans la page ?** Si
oui, container query. Sinon, media query suffit. Une carte qui vit à la fois dans une grille à
trois colonnes et dans une barre latérale étroite est l'exemple canonique : avec des media
queries, aucune largeur d'écran ne permet de décider, parce que l'écran n'est pas le bon
référentiel.

### 2.1 La syntaxe d'intervalle des media queries

```css
/* Avant */
@media (min-width: 48rem) and (max-width: 63.999rem) { }

/* Maintenant */
@media (48rem <= width < 64rem) { }
```

Fin des valeurs en `.999` destinées à éviter les chevauchements d'un pixel, et une lecture qui
dit enfin ce qu'elle veut dire. Même grammaire dans `@container`.

## 3. Les préférences utilisateur

Ce sont des **réglages système** que la personne a posés, souvent parce qu'elle en a besoin. Les
traiter comme des suggestions est la différence entre un site qui s'adapte et un site qui
contredit le système d'exploitation.

| Requête | Ce que la personne a demandé |
|---|---|
| `prefers-color-scheme` | un thème clair ou sombre |
| `prefers-contrast: more` | plus de contraste |
| `prefers-reduced-motion: reduce` | moins d'animation (module 12) |
| `prefers-reduced-transparency` | moins de transparence |
| `prefers-reduced-data` | moins de données |
| `forced-colors: active` | une palette imposée par le système |

### 3.1 `prefers-color-scheme`, et la façon courte

```css
:root { color-scheme: light dark; }   /* le navigateur adapte aussi ses propres contrôles */

.carte {
  background: light-dark(white, #1b1b1b);
  color: light-dark(#111, #eee);
}
```

`color-scheme` est la ligne qu'on oublie, et elle fait plus que la media query : elle informe le
navigateur, qui adapte alors les barres de défilement, les contrôles de formulaire natifs et la
couleur de fond par défaut. Sans elle, un thème sombre laisse des `<select>` blancs.

`light-dark()` évite de dupliquer un bloc entier pour deux valeurs. Détail au module 10.

### 3.2 `forced-colors`, le mode que l'on découvre trop tard

Sous Windows, le mode de contraste élevé remplace **toutes** les couleurs par une palette
système. Tes couleurs sont ignorées, y compris les fonds et les bordures. C'est une bonne chose,
et cela casse en général trois types de composants : ceux qui portent l'information par la
couleur de fond, ceux qui dessinent une bordure avec un fond, et ceux qui reposent sur une image
de fond.

```css
@media (forced-colors: active) {
  /* Utiliser les couleurs système, pas les siennes */
  .bouton { border: 1px solid ButtonBorder; color: ButtonText; }

  /* Pour que les icônes SVG suivent la couleur du texte */
  .icone { forced-color-adjust: auto; fill: currentColor; }
}
```

Le lien avec le référentiel est direct : `3.1 (A)` interdit de porter une information par la
seule couleur. Un composant conforme à `3.1` survit presque toujours au mode forcé, parce qu'il
ne dépendait pas de la couleur pour dire ce qu'il disait. L'inverse est vrai aussi : le mode
forcé est un révélateur rapide de non-conformité `3.1`.

## 4. L'accessibilité dans ce module

**`10.11 (AA)`, linéarisation.** Les container queries sont le bon outil pour la respecter sans
multiplier les media queries : un composant qui sait se replier dans un conteneur étroit se
replie aussi à 320 pixels, sans règle supplémentaire.

**`13.9 (AA)`, indépendance de l'orientation.** À traiter avec `width` et des container queries
plutôt qu'avec `orientation`, précisément pour ne pas verrouiller.

**`3.1 (A)` et `3.2 (AA)`** entrent par `prefers-contrast` et `forced-colors`, et sont traités au
module 10.

Un point de méthode, parce qu'il revient en audit : **émuler ces préférences fait partie du
protocole de test.** Les outils de développement permettent de forcer `prefers-color-scheme`,
`prefers-contrast`, `prefers-reduced-motion` et `forced-colors`. Un site testé uniquement dans
les réglages de la machine du développeur n'a jamais été testé dans les cinq autres situations.
Le module 20 donne le protocole, et les oracles des labs 07 et 10 utilisent exactement cette
émulation.

## 5. Ce que l'enquête interroge, et où c'est traité

Items `css2026` rattachés à ce module : `at_container_size`, `at_container_style`,
`media_queries_range_contexts`, `prefers_color_scheme`, `prefers_contrast`.

L'audit du curriculum du 09/11/2026 a montré que `@container` n'apparaissait que dans trois
fichiers sur les 2 418 du corpus, tous dans le cours Design System. Pour un mécanisme qui change
la façon d'écrire un composant réutilisable, c'était le trou le plus net de l'inventaire.

## 6. Les pièges

1. **Oublier `container-type`.** La requête ne s'applique jamais, sans message d'erreur.
2. **Choisir `container-type: size` sans hauteur explicite.** L'élément s'effondre.
3. **Ignorer que `container-type` casse un `position: fixed` descendant.**
4. **Interroger le conteneur depuis l'élément qui le déclare.** Une container query s'applique
   aux **descendants** du conteneur, jamais au conteneur lui-même. C'est l'erreur la plus
   fréquente au premier essai.
5. **Utiliser des media queries pour un composant réutilisable.** L'écran n'est pas son
   référentiel.
6. **Oublier `color-scheme: light dark`.** Les contrôles natifs restent clairs dans un thème
   sombre.
7. **Ne jamais tester `forced-colors`.** Le composant qui porte son sens par la couleur de fond
   disparaît, et c'était déjà une non-conformité `3.1 (A)`.
8. **Verrouiller par `orientation`.** Non conforme `13.9 (AA)`.

## 7. Lire avant le lab

Pour [lab-07](../labs/lab-07-container-queries/README) : § 1 en entier, § 2 (le tableau de
décision), § 4 (le paragraphe sur l'émulation). Une lecture, puis page blanche.

## 8. Auto-test

1. Pourquoi une container query exige-t-elle une promesse, alors qu'une media query non ?
2. Que confine exactement `container-type: inline-size`, et quel effet de bord cela a-t-il sur un
   `position: fixed` descendant ?
3. Pourquoi `container-type: size` fait-il souvent disparaître l'élément ?
4. À quoi s'applique une container query : au conteneur, ou à ses descendants ?
5. Que mesure `5cqi`, et en quoi diffère-t-il de `5vw` ?
6. Donne le test de décision entre container query et media query, en une question.
7. Que fait `color-scheme: light dark` que la media query `prefers-color-scheme` ne fait pas ?
8. Pourquoi un composant conforme à `3.1 (A)` survit-il généralement au mode `forced-colors` ?
