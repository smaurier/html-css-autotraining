# 10. Couleur, espaces et contraste

> **Outcome :** à la fin, tu sais pourquoi `hsl()` produit des palettes inégales et `oklch()` non,
> tu sais calculer un ratio de contraste à la main, tu sais ce que `contrast-color()` règle et ce
> qu'il ne dispense pas de vérifier, et tu sais quels quatre critères la couleur met en jeu.
>
> **Lab :** [lab-09 : couleur et contraste](../labs/lab-09-couleur-et-contraste/README)

## 1. Le mécanisme : une couleur est une coordonnée dans un espace

`#3b82f6` n'est pas « du bleu », c'est un triplet de coordonnées dans l'espace sRGB. Changer
d'espace change ce que les nombres signifient, et surtout ce que l'arithmétique sur ces nombres
produit.

### 1.1 sRGB n'est pas linéaire

Les valeurs sRGB sont encodées avec une correction de gamma, pour correspondre à la façon dont
l'œil perçoit la luminosité. Conséquence : **`#808080` n'est pas la moitié de `#ffffff` en
luminosité**, il est beaucoup plus clair que la moitié. C'est la raison pour laquelle le calcul
du ratio de contraste commence par linéariser les composantes, voir § 4.1.

### 1.2 Pourquoi `hsl()` déçoit

`hsl()` est intuitif mais pas perceptuel : la même valeur de luminosité produit des couleurs de
clarté très différentes selon la teinte.

```css
.a { background: hsl(60 100% 50%); }   /* jaune : éclatant */
.b { background: hsl(240 100% 50%); }  /* bleu : très sombre */
```

Même `50%` de luminosité, deux couleurs que l'œil ne range pas au même niveau. D'où les palettes
générées en HSL où le « 500 » de chaque teinte n'a pas le même poids visuel, et où le texte blanc
passe sur le bleu mais pas sur le jaune.

### 1.3 OKLCH, et ce qu'il change

```css
.a { background: oklch(70% 0.19 60); }    /* L  C  H : clarté, chroma, teinte */
.b { background: oklch(70% 0.19 260); }   /* même clarté perçue */
```

`oklch()` est perceptuellement uniforme : à `L` égal, deux teintes ont la même clarté perçue.
Trois usages directs.

**Générer une palette cohérente.** On fixe `L` et `C`, on fait varier `H`, et toutes les couleurs
obtenues se comportent pareil en contraste.

**Faire varier une nuance proprement.** Modifier `L` de 10 % donne une variation prévisible, ce
que `lighten()` d'un préprocesseur ne garantissait pas.

**Éviter la zone morte des dégradés.** Un dégradé en sRGB passe par des gris boueux ; en OKLCH il
reste saturé.

```css
.bande {
  /* Précise l'espace d'interpolation, et le chemin de teinte */
  background: linear-gradient(in oklch longer hue, oklch(70% 0.2 20), oklch(70% 0.2 200));
}
```

Note : `13-architecture/cours/05-architecture-frontend/05-design-tokens-systems.md` traite OKLCH
sous l'angle du **pipeline de tokens**, à savoir générer vingt nuances depuis une couleur de
base. Ce module traite la **perception et le contraste**. Les deux se complètent et ne se
répètent pas.

### 1.4 Les gamuts

| Gamut | Étendue |
|---|---|
| sRGB | l'étendue historique du web |
| `display-p3` | plus large, standard des écrans récents |
| `rec2020` | plus large encore |

```css
.accent { background: color(display-p3 0.1 0.6 0.9); }

@media (color-gamut: p3) {
  .accent { background: oklch(65% 0.28 250); }  /* plus saturé que ce que sRGB permet */
}
```

Une couleur hors gamut de l'écran est ramenée dans l'étendue disponible. Le résultat n'est pas
celui qu'on a écrit, et cela peut **modifier un ratio de contraste**. C'est la raison pratique de
vérifier le contraste sur les couleurs effectivement appliquées, pas sur celles du fichier de
design.

## 2. Fabriquer une couleur depuis une autre

### 2.1 `color-mix()`

```css
.survol { background: color-mix(in oklch, var(--accent) 85%, black); }
.desactive { color: color-mix(in oklch, currentColor 40%, transparent); }
```

Un mélange, dans l'espace que l'on choisit. Remplace la génération de variantes au build : plus
besoin de vingt tokens quand l'un se déduit de l'autre.

### 2.2 Les couleurs relatives

```css
.carte {
  --accent: oklch(60% 0.2 250);
  /* on part de --accent et on ne change QUE la clarté */
  border-color: oklch(from var(--accent) calc(l - 0.2) c h);
  background:   oklch(from var(--accent) 95% calc(c / 4) h);
}
```

La syntaxe `from` décompose une couleur en ses canaux, qui deviennent des variables utilisables
dans `calc()`. C'est l'outil qui permet de dériver un thème complet d'une seule couleur, en CSS,
sans préprocesseur et en respectant l'héritage des custom properties.

### 2.3 `accent-color`

```css
:root { accent-color: oklch(60% 0.2 250); }
```

Une ligne qui colore les contrôles natifs : cases à cocher, boutons radio, curseurs, barres de
progression. À connaître avant d'entreprendre de reconstruire une case à cocher, ce qui est le
sujet du module 16 : dans beaucoup de cas, `accent-color` suffit et préserve l'accessibilité
natale.

## 3. Clair, sombre, et le réglage de l'utilisateur

```css
:root { color-scheme: light dark; }

.carte {
  background: light-dark(white, oklch(20% 0 0));
  color: light-dark(oklch(20% 0 0), oklch(95% 0 0));
}
```

`color-scheme` prévient le navigateur, qui adapte ses propres surfaces : barres de défilement,
contrôles de formulaire, fond par défaut. Sans cette ligne, un thème sombre garde des `<select>`
blancs, et c'est le défaut le plus visible d'un thème sombre bâclé.

`light-dark()` évite de dupliquer un bloc entier sous une media query quand seules deux valeurs
changent. Pour un thème complet, les custom properties redéfinies sous
`@media (prefers-color-scheme: dark)` restent plus lisibles. La règle de choix : `light-dark()`
pour quelques valeurs ponctuelles, les tokens pour un thème.

Point de vigilance, qui revient en audit : **un thème sombre n'est pas une inversion.** Inverser
mécaniquement produit des noirs purs fatigants et des contrastes trop forts. La pratique
courante est un fond autour de `oklch(20% 0 0)` plutôt que `#000`, et une réduction de la chroma
des accents, qui paraissent plus saturés sur fond sombre.

## 4. Le contraste

### 4.1 Le calcul, à la main

Deux étapes. D'abord la luminance relative de chaque couleur :

```
pour chaque canal c de {R, G, B} :
    s = c / 255
    lin = s / 12.92                  si s <= 0,03928
    lin = ((s + 0,055) / 1,055)^2,4  sinon

L = 0,2126 * Rlin + 0,7152 * Glin + 0,0722 * Blin
```

Puis le ratio :

```
ratio = (Lclair + 0,05) / (Lsombre + 0,05)
```

Trois choses à retenir de cette formule.

**Les coefficients sont très inégaux.** Le vert compte pour 72 % de la luminance perçue, le bleu
pour 7 %. Deux couleurs de même luminosité nominale mais de teintes différentes n'ont pas du tout
le même contraste avec un fond donné.

**Le `+ 0,05` borne le résultat.** Il évite une division par zéro et plafonne le ratio à 21, la
valeur du noir pur sur blanc pur.

**La linéarisation est l'étape qu'on oublie.** Calculer un ratio sur les valeurs sRGB brutes
donne un résultat faux, et c'est l'erreur classique quand on réimplémente le calcul soi-même.

Le lab 09 implémente exactement cette formule, et son oracle `labs/outils/contraste.mjs` refuse
une couleur qu'il ne sait pas lire plutôt que de rendre un chiffre faux.

### 4.2 Les seuils du référentiel

| Critère | Ce qui est mesuré | Seuil |
|---|---|---|
| `3.2 (AA)` | texte de taille normale | **4,5:1** |
| `3.2 (AA)` | texte agrandi | **3:1** |
| `3.3 (AA)` | élément non textuel porteur d'information | **3:1** |

La définition de « texte agrandi » se juge sur la **taille calculée**, pas sur la taille écrite
dans la maquette : un `font-size: 1.5rem` dans un contexte où la racine a été réduite ne compte
pas comme agrandi. L'ordre de grandeur usuel est d'environ 24 pixels, ou d'environ 18,5 pixels en
gras ; la valeur exacte qui fait foi est dans le référentiel, et c'est là qu'il faut la vérifier
avant de conclure dans un rapport.

`3.3` est le critère le plus oublié : il couvre les bordures de champs de formulaire, les icônes
porteuses de sens, les segments d'un graphique, les poignées de curseur. Un champ dont la bordure
est à 1,8:1 est non conforme même si son texte est parfait.

Et une précision de méthode : **si un mécanisme de réglage du contraste existe sur le site, il
doit être conforme et activé avant d'évaluer `3.2` et `3.3`.**

### 4.3 `contrast-color()`, nouveauté 2026

```css
.badge {
  background: var(--accent);
  color: contrast-color(var(--accent));   /* noir ou blanc, selon ce qui contraste le mieux */
}
```

Ce que ça règle : le choix automatique entre texte clair et texte sombre sur un fond inconnu à
l'écriture, par exemple une couleur choisie par l'utilisateur ou venue d'une base de données.
C'était jusqu'ici un calcul en JavaScript.

Ce que ça **ne** règle pas, et c'est le point à retenir : la fonction choisit la meilleure des
deux options, elle ne garantit pas que le résultat atteigne 4,5:1. Sur un fond de clarté
intermédiaire, le meilleur des deux peut rester insuffisant.

```css
/* ⛔ Faux sentiment de sécurité : aucun seuil n'est garanti */
color: contrast-color(var(--fond-choisi-par-l-utilisateur));
```

La parade est de contraindre le fond, pas de faire confiance au texte : borner la clarté des
couleurs acceptées, par exemple en rejetant la bande médiane, ou vérifier le ratio et refuser la
couleur à la saisie. `contrast-color()` est un confort d'écriture, pas une preuve de conformité.

### 4.4 Ne pas tout dire avec la couleur

**`3.1 (A)` : une information portée par la couleur doit être doublée** par du texte, une forme
ou une icône perceptible par tous.

```html
<!-- ⛔ Seule la couleur distingue l'état -->
<span class="pastille rouge"></span> Serveur A

<!-- ✅ La couleur est redondante, pas porteuse -->
<span class="pastille rouge" aria-hidden="true">●</span> Serveur A <strong>hors service</strong>
```

Et une précision utile : un texte caché en CSS n'est **pas** une solution à `3.1`. Une personne
malvoyante qui n'utilise pas de technologie d'assistance ne le verra pas davantage. Le doublement
doit être visible.

Critère voisin dans le même thème : **`10.6 (A)`, les liens dans du texte doivent être
distinguables autrement que par la couleur**, avec un contraste de 3:1 vis-à-vis du texte
environnant plus une indication au survol et au focus. Si les liens sont soulignés, le critère
est sans objet, ce qui est l'argument le plus simple en faveur du soulignement.

**`10.5 (AA)` : couleur de fond et couleur de texte déclarées ensemble.** Sinon une feuille de
style utilisateur qui change l'une des deux peut produire un texte illisible. Et une image de
fond doit être accompagnée d'une `background-color` de secours.

## 5. Ce que l'enquête interroge, et où c'est traité

Items `css2026` rattachés à ce module : `accent_color`, `color_mix`, `wide_gamut_colors`,
`relative_colors`, `gradient_color_spaces`, `color_scheme`, `light_dark`, `contrast_color`,
`good_color_contrast`, `color_alternative`.

`contrast_color` est l'une des quinze nouveautés de l'édition 2026. C'est aussi un bon exemple
d'une fonctionnalité dont l'arrivée demande une mise en garde plutôt qu'un enthousiasme : elle
automatise un calcul, et elle peut faire croire qu'elle automatise une conformité.

## 6. Les pièges

1. **Générer une palette en HSL.** Le même `L` ne donne pas la même clarté perçue selon la
   teinte.
2. **Calculer un ratio sur les valeurs sRGB brutes.** Il faut linéariser d'abord.
3. **Croire que `contrast-color()` garantit un seuil.** Il choisit la meilleure des deux options,
   rien de plus.
4. **Oublier `color-scheme: light dark`.** Les contrôles natifs restent clairs.
5. **Faire un thème sombre par inversion.** Noirs purs fatigants, accents trop saturés.
6. **Ne vérifier que le texte.** `3.3 (AA)` couvre les bordures de champs, les icônes, les
   segments de graphique, les poignées.
7. **Doubler l'information par un texte masqué en CSS.** Ne répond pas à `3.1 (A)`, le
   doublement doit être visible.
8. **Retirer le soulignement des liens dans un texte** sans assurer 3:1 avec le texte environnant
   plus une indication au survol et au focus. Non conforme `10.6 (A)`.
9. **Vérifier le contraste sur les couleurs de la maquette** plutôt que sur les couleurs
   calculées, alors qu'un gamut, un mélange ou une opacité a pu les déplacer.

## 7. Lire avant le lab

Pour [lab-09](../labs/lab-09-couleur-et-contraste/README) : § 1.2 et 1.3, § 4.1 et 4.2, § 4.4.
Une lecture, puis page blanche.

## 8. Auto-test

1. Pourquoi `#808080` n'est-il pas à mi-chemin entre le noir et le blanc en luminosité ?
2. Pourquoi `hsl(60 100% 50%)` et `hsl(240 100% 50%)` n'ont-ils pas la même clarté perçue ?
3. Donne les deux étapes du calcul d'un ratio de contraste, et dis laquelle on oublie.
4. Quels sont les trois seuils du référentiel, et sur quoi porte `3.3` ?
5. Sur quoi se juge la taille d'un « texte agrandi » ?
6. Que garantit `contrast-color()`, et que ne garantit-il pas ?
7. Un texte masqué en CSS répond-il à `3.1 (A)` ? Justifie.
8. Dans quel cas `10.6 (A)` est-il sans objet ?
