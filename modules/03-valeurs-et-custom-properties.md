# 03. Valeurs, custom properties et fonctions

> **Outcome :** à la fin, tu sais qu'une custom property est un flux de jetons substitué à
> l'exécution et non une variable, tu sais ce qui se passe exactement quand sa valeur est
> invalide pour la propriété cible, tu sais pourquoi `@property` change la nature de l'objet, et
> tu sais quand le second argument de `var()` sert et quand il ne sert pas.
>
> **Lab :** [lab-03 : tokens typés](../labs/lab-03-tokens-types/README)

## 1. Le mécanisme : ce n'est pas une variable

Une custom property n'est pas une variable de préprocesseur. Trois différences qui expliquent
tous ses comportements surprenants.

**Elle est héritée.** Déclarée sur `:root`, elle descend dans tout l'arbre. Déclarée sur un
composant, elle descend dans ce composant. C'est ce qui en fait un mécanisme de thème, et pas
seulement un dictionnaire.

**Sa valeur n'est pas analysée à la déclaration.** Le navigateur stocke un flux de jetons,
presque n'importe quoi, et ne cherche à le comprendre qu'au moment où un `var()` le substitue
dans une propriété réelle.

```css
:root {
  --ceci-est-accepte: 3px solid; /* valide : personne ne l'a encore lu */
  --et-ceci-aussi: ) 42 "hop";   /* accepté à la déclaration */
}
```

**Elle est substituée à l'exécution, pas à la compilation.** Changer `--espace` sur un ancêtre
recalcule tout ce qui en dépend, sans toucher au CSS. C'est ce qui permet de piloter un thème
depuis un seul attribut, et c'est aussi ce qui coûte quand on en abuse sur des arbres énormes.

### 1.1 Invalide au moment du calcul

C'est le piège central, et il n'est pas intuitif. Quand `var()` substitue une valeur que la
propriété cible ne peut pas accepter, la déclaration **ne revient pas** à la valeur précédente.
Elle devient « invalide au moment du calcul », ce qui signifie :

- la propriété prend la valeur **héritée** si elle est héritable ;
- sinon elle prend sa valeur **initiale**.

```css
.bouton {
  color: rebeccapurple;       /* on pourrait croire que ça sert de repli */
  color: var(--accent);       /* --accent vaut "pas-une-couleur" */
}
```

Résultat : la couleur n'est pas `rebeccapurple`. Elle est la couleur **héritée du parent**, parce
que `color` est héritable. La déclaration précédente est bien écrasée, puis la substitution
échoue, et le repli naturel de la cascade ne joue pas. C'est la différence la plus coûteuse à
découvrir en production.

### 1.2 Le repli de `var()` et ce qu'il ne couvre pas

```css
padding: var(--espace, 1rem);
```

Ce second argument s'applique dans **un seul cas** : `--espace` n'est pas définie du tout, ou
vaut explicitement `initial`. Si `--espace` est définie à `bleu`, le repli ne joue pas : la
valeur est substituée, la propriété la refuse, et on retombe dans le § 1.1.

Autrement dit, `var()` protège contre l'absence, jamais contre l'erreur. La protection contre
l'erreur, c'est `@property`.

## 2. `@property`, ou la custom property devient un vrai type

```css
@property --accent {
  syntax: "<color>";
  inherits: true;
  initial-value: rebeccapurple;
}
```

Trois effets, chacun important.

**Elle est validée.** Une affectation qui ne respecte pas `syntax` est rejetée à l'affectation,
et la propriété garde sa valeur précédente ou son `initial-value`. On passe d'une panne
silencieuse à un comportement prévisible.

**Elle devient animable.** C'est l'effet le plus visible. Sans `@property`, le navigateur ne sait
pas ce qu'il y a dans `--accent`, donc il ne peut pas interpoler : la transition se fait d'un
coup. Avec `syntax: "<color>"`, il sait, et il interpole.

```css
@property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }

.carte {
  background: linear-gradient(var(--angle), #222, #666);
  transition: --angle 400ms;  /* impossible sans @property */
}
.carte:hover { --angle: 180deg; }
```

**On choisit l'héritage.** `inherits: false` donne une propriété locale, qui ne contamine pas les
descendants. Utile pour un token de composant qu'on ne veut pas voir fuir dans les enfants.

### 2.1 Les valeurs de `syntax` utiles

| `syntax` | Accepte |
|---|---|
| `"<color>"` | une couleur |
| `"<length>"` | `10px`, `2rem` |
| `"<length-percentage>"` | plus les pourcentages |
| `"<number>"`, `"<integer>"` | un nombre |
| `"<angle>"`, `"<time>"` | `45deg`, `300ms` |
| `"<custom-ident>"` | un identifiant |
| `"petit \| moyen \| grand"` | une énumération |
| `"<length>+"` | une liste séparée par des espaces |
| `"*"` | n'importe quoi, donc non animable |

## 3. Calculer

### 3.1 `calc()` et ses règles qu'on oublie

```css
width: calc(100% - 2rem);     /* les espaces autour de - et + sont OBLIGATOIRES */
width: calc(100%-2rem);       /* invalide : "100%-2rem" est lu comme un seul jeton */
width: calc(100% / 3);        /* ok */
width: calc(1rem * 2);        /* ok */
```

La règle des espaces n'est pas une coquetterie : sans elle, `-2rem` est un nombre négatif et pas
une soustraction. Elle ne s'applique qu'à `+` et `-`.

Fonctions associées : `min()`, `max()`, `clamp()`, et `round()`, `mod()`, `rem()` pour
l'arithmétique.

### 3.2 `calc-size()`, et l'animation vers `auto`

Animer vers `height: auto` a longtemps été impossible : `auto` n'est pas un nombre, donc rien à
interpoler. D'où une génération de contournements avec `max-height` et des valeurs magiques.

```css
/* Permet au moteur de calculer une taille intrinsèque interpolable */
.panneau { height: calc-size(auto, size); transition: height 300ms; }

/* Ou, au niveau du conteneur, autoriser les mots-clés dans les interpolations */
.panneau { interpolate-size: allow-keywords; }
```

Le mécanisme à retenir : il ne s'agit pas d'une astuce, mais d'une façon de rendre une taille
intrinsèque manipulable comme une longueur.

### 3.3 `attr()` étendu

```css
/* Historiquement limité à content, et toujours typé en chaîne */
.puce::after { content: attr(data-libelle); }

/* Étendu : typé, utilisable dans n'importe quelle propriété, avec repli */
.jauge { inline-size: attr(data-pourcent type(<percentage>), 0%); }
```

C'est le pont manquant entre une donnée portée par le HTML et le style, sans JavaScript. Et c'est
exactement là qu'il faut se méfier côté accessibilité, voir § 5.

### 3.4 `if()`, `sibling-index()`, `sibling-count()`

```css
.badge {
  /* une condition en ligne, sans dupliquer le sélecteur */
  color: if(style(--mode: sombre): #eee; else: #111);
}

li {
  /* la position de l'élément dans sa fratrie, comme nombre utilisable */
  animation-delay: calc(sibling-index() * 60ms);
  opacity: calc(1 - sibling-index() / sibling-count());
}
```

`sibling-index()` remplace une génération de `:nth-child(1)`, `:nth-child(2)`, etc. écrits à la
main ou générés par une boucle Sass. C'est une valeur, pas un sélecteur, donc elle entre dans
`calc()`.

### 3.5 `@function`

```css
@function --espace(--n) {
  result: calc(var(--n) * 0.25rem);
}

.carte { padding: --espace(4); }   /* 1rem */
```

Une fonction CSS personnalisée, avec des arguments et un résultat. Ce qui distingue cet outil de
son équivalent en préprocesseur : il est évalué par le navigateur, donc il voit les custom
properties héritées au point d'appel.

## 4. Choisir entre les trois niveaux

| Besoin | Outil |
|---|---|
| Une valeur partagée, qui change avec le contexte | custom property héritée |
| Une valeur typée, animable, qui ne doit pas casser | `@property` |
| Un calcul réutilisable | `@function` |
| Une valeur venue du HTML | `attr()` typé |
| Une valeur venue de l'application | custom property posée en ligne par le script |

La dernière ligne est la frontière saine entre CSS et JavaScript : le script écrit une custom
property, le CSS décide quoi en faire. Le script n'écrit pas de `style.width`.

## 5. L'accessibilité dans ce module

**`10.2 (A)` : les contenus porteurs d'information insérés en CSS doivent rester disponibles
feuilles de style désactivées.**

C'est précisément le critère que `content` et `attr()` mettent en danger.

```css
/* ⛔ L'information n'existe que dans la feuille de style */
.obligatoire::after { content: " (obligatoire)"; }

/* ⛔ Pire : l'information est dans un attribut non sémantique */
.jauge::after { content: attr(data-pourcent) "%"; }
```

Dans les deux cas, CSS désactivées, l'information disparaît. Et même CSS activées, le contenu
généré n'est pas restitué de façon fiable par toutes les technologies d'assistance.

```html
<!-- ✅ L'information est dans le document, le CSS ne fait que la présenter -->
<label for="courriel">Courriel <span class="mention">(obligatoire)</span></label>
<input id="courriel" type="email" required aria-describedby="aide-courriel">

<!-- ✅ La valeur existe pour tout le monde, le style s'en sert pour dessiner -->
<div class="jauge" style="--pourcent: 72">
  <span class="jauge-valeur">72 %</span>
</div>
```

La règle de décision tient en une question : **si je désactive le CSS, est-ce que l'information
est encore là ?** Si non, elle n'était pas à sa place. Le décor peut vivre en CSS, l'information
non. Le critère voisin `10.1 (A)` dit la symétrique : la présentation, elle, n'a rien à faire
dans le HTML.

## 6. Ce que l'enquête interroge, et où c'est traité

Items `css2026` rattachés à ce module : `at_property`, `at_function`, `advanced_attr_function`,
`if_function`, `sibling_index`, `sibling_count`, `calc_size`.

Quatre de ces sept sont récents et inégalement implémentés. La grille de décision du module 21
s'applique telle quelle : la question n'est pas « est-ce que ça existe » mais « qu'est-ce qui se
passe chez celui qui ne l'a pas ».

## 7. Les pièges

1. **Croire qu'une déclaration précédente sert de repli.** Elle ne sert à rien : une
   substitution invalide donne la valeur héritée ou initiale, jamais la précédente.
2. **Croire que `var(--x, repli)` protège d'une valeur fausse.** Il protège de l'absence, pas de
   l'erreur.
3. **Vouloir animer une custom property sans `@property`.** Sans `syntax`, le moteur ne sait pas
   quoi interpoler : la transition est une bascule.
4. **Oublier les espaces autour de `-` dans `calc()`.** Erreur silencieuse, règle entièrement
   ignorée.
5. **Mettre une information dans `content`.** Non conforme `10.2 (A)`, et invisible pour une
   partie des utilisateurs même CSS activées.
6. **Poser `inherits: true` par réflexe.** Un token de composant qui fuit dans ses descendants
   crée des surprises à distance.
7. **Remplacer la cascade par des custom properties.** Un composant dont tout est piloté par
   trente propriétés devient impossible à surcharger : les couches du module 02 existent pour ça.

## 8. Lire avant le lab

Pour [lab-03](../labs/lab-03-tokens-types/README) : § 1.1 et 1.2, § 2 en entier, § 5. Une
lecture, puis page blanche.

## 9. Auto-test

1. Pourquoi `--x: ) 42 "hop"` est-il accepté à la déclaration ?
2. `color: red; color: var(--c)` avec `--c: pasunecouleur`. Quelle couleur s'applique, et pourquoi
   pas `red` ?
3. Dans quel cas exact le second argument de `var()` s'applique-t-il ?
4. Quels sont les trois effets de `@property`, et lequel est le plus visible à l'écran ?
5. Pourquoi `calc(100%-2rem)` est-il invalide alors que `calc(100%/3)` est valide ?
6. À quel problème historique `calc-size(auto, size)` répond-il ?
7. Pourquoi `content: " (obligatoire)"` est-il une non-conformité, et quelle est la question de
   décision à se poser ?
