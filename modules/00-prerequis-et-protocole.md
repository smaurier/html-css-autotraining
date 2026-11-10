# 00. Prérequis et protocole

> **Outcome :** à la fin de ce module, tu sais ce que ce cours suppose acquis, ce qu'il refuse
> de réenseigner, comment ses oracles fonctionnent, et pourquoi l'accessibilité n'y est pas un
> chapitre.

## 1. Ce que le cours suppose

| Acquis supposé | Comment le vérifier en deux minutes |
|---|---|
| Écrire du HTML et du CSS au quotidien | Tu n'as pas besoin de chercher comment centrer un bloc |
| Les sélecteurs de base, les pseudo-classes courantes | `:hover`, `:nth-child()`, combinateurs `>` et `+` |
| Le modèle de boîte | Tu sais ce que change `box-sizing: border-box` |
| Un terminal, npm, git | Tu lances un script npm sans y penser |
| Les bases de JavaScript | Les labs écrivent peu de JS, mais ils en écrivent |

Ce cours ne réenseigne aucune de ces lignes. S'il manque la dernière, le cours `01-js-runtime`
passe avant.

## 2. Ce que le cours refuse de faire

**Il ne donne pas de recettes.** « Comment faire un sticky footer » n'est pas une question de ce
cours ; « quel est le containing block de cet élément et pourquoi » l'est. La recette se périme,
le mécanisme non. C'est toute la différence entre savoir faire et savoir pourquoi ça marche, et
c'est l'angle mort typique de dix ans d'intégration réussie.

**Il ne remplace pas le référentiel.** Les critères RGAA sont cités par numéro, avec leur
formulation courte. Le texte qui fait foi reste le référentiel officiel, et la source de
méthode reste la formation Access42. Si une phrase de ce cours contredit le référentiel, c'est
la phrase qui est fausse.

**Il ne fait pas la veille à ta place.** Il la rend vérifiable : `couverture-state-of.md`
confronte les 215 items réellement interrogés par State of HTML 2026 et State of CSS 2026 au
plan du cours. Le fichier est généré, pas déclaré.

## 3. Le protocole de travail

Détail complet dans [`GUIDE-APPRENANT.md`](../GUIDE-APPRENANT). En bref :

```
lire la section « Lire avant » du lab, une fois
        ↓
fermer le module
        ↓
page blanche → npm run lab:NN → RED
        ↓
le test qui échoue désigne la section à rouvrir, et elle seule
        ↓
GREEN → npm run solution:NN (comparer) → correcteur (GO / FIX / STOP)
```

## 4. Pourquoi l'accessibilité n'est pas un module

Parce que ce curriculum a déjà essayé l'autre option, et qu'on peut le mesurer. Relevé du
09/11/2026 sur les 24 cours :

| Cours | Fichiers mentionnant `aria-label` |
|---|---|
| `04-react` | 32 |
| `02-vue` | 20 |
| `21-design-system` | 15 |
| `03-angular` | 10 |
| `06-testing` | 6 |

Onze cours parlaient d'accessibilité. Aucun n'en était la source. Une matière répétée partout et
possédée nulle part se dilue : chaque cours en dit un peu, personne n'en dit assez, et le lecteur
suppose que le sérieux est ailleurs.

Donc ici : pas de chapitre final, pas d'encadré « pensez aussi à l'accessibilité ». Les critères
vivent dans le module du geste, et l'oracle du lab les vérifie. **Un lab ne passe pas au vert si
son accessibilité est reportée à plus tard.**

## 4 bis. Le référentiel en bref

Ce cours cite des critères par leur numéro dès le module 01. Trois choses à savoir avant, et
elles tiennent en une page.

### Qui dit quoi

**WCAG** est le socle technique international. **RGAA** en est l'application française :
même socle, traduit, avec une méthodologie de test critère par critère et une portée
opposable. L'**European Accessibility Act** rend l'accessibilité obligatoire pour des services
numériques privés depuis juin 2025.

La cible légale est le niveau **AA**. Ce cours ne traite pas le droit : il est dans le cours 23
`23-droit-numerique`. Ici, on code.

### Les quatre principes, et pourquoi ils servent

Tout critère appartient à l'un des quatre, et l'acronyme fonctionne en français comme en
anglais : **POUR**.

| Principe | Ce qu'il exige | Où ça se joue dans ce cours |
|---|---|---|
| **P**erceptible | l'information atteint tous les sens | alternatives (module 01), contraste et couleur (module 10) |
| **O**pérable, ou **U**tilisable | tout est actionnable, notamment au clavier | focus et clavier (modules 09, 16, 17), mouvement (module 12) |
| **U**nderstandable, ou **C**ompréhensible | contenu et interface prévisibles | structure et langue (module 01), formulaires (module 14) |
| **R**obuste | compatible avec les technologies d'assistance | sémantique (module 01), web components (module 18) |

L'utilité pratique du classement : devant un bug d'accessibilité, il dit **quel genre** de
problème on a. Un contraste insuffisant est un problème de perception, donc aucun `aria-*` ne
le réglera. Un composant inatteignable au clavier est un problème d'opérabilité, donc ajouter
un rôle ne suffira pas. C'est la même logique que la règle du module 01 : ARIA n'ajoute aucun
comportement.

### Les trois niveaux

| Niveau | Portée |
|---|---|
| **A** | le minimum vital |
| **AA** | la cible légale, et donc la cible de ce cours |
| **AAA** | l'excellence, pas exigée globalement |

Chaque critère cité dans ce cours porte son niveau, `(A)` ou `(AA)`, et la citation sans niveau
est considérée comme un défaut de rédaction : l'outil `outils/criteres.mjs` ne compte que les
citations niveautées, précisément pour que l'oubli se voie.

## 5. Les trois familles d'oracles

| Ce qu'on prouve | Outil | Limite assumée |
|---|---|---|
| Rôle, nom accessible, état | `@testing-library/dom`, `getByRole` | Ne voit pas le rendu visuel |
| Violations automatisables | `axe-core` | Ne couvre qu'une part des critères |
| Géométrie, style calculé, tabulation, contraste | Playwright | Plus lent, demande un navigateur installé |

La limite d'`axe` mérite d'être sue avant d'y croire : les outils automatiques détectent une
**minorité** des non-conformités réelles. Un `axe` vert n'est pas une conformité, c'est l'absence
d'un certain type de signal. Le module 20 détaille ce que l'automatique attrape, ce qu'il manque,
et la méthode manuelle qui comble l'écart.

Chaque lab porte en plus sa **sonde de rougissement** : une modification d'une ligne qui doit
faire échouer l'oracle. Si l'oracle reste vert après la sonde, il est cassé et le lab ne compte
pas. Un test qui ne peut pas rougir ne prouve rien.

## 6. Ordre de lecture

Les modules 01 à 04 sont le socle : deux arbres, la cascade, les valeurs, le pipeline. Tout le
reste s'appuie dessus. Sauter le 02 pour attaquer Grid se paie au module 16, quand il faut styler
un `<select>` sans casser la cascade de ses parties internes.

Trois modules se consultent hors de leur tour, parce qu'ils répondent à un besoin daté plutôt
qu'à une progression : le 19 (outillage), le 20 (audit) et le 21 (grille de décision sur les APIs).

## 7. Auto-test

Réponds avant de lire la suite du cours. Confiance 1, 2 ou 3 avant de vérifier.

1. Pourquoi un `axe-core` vert ne permet pas d'écrire « conforme » dans un rapport ?
2. Qu'est-ce qu'une sonde de rougissement, et que prouve son absence ?
3. Dans ce cours, où vivent les critères RGAA, et pourquoi pas dans un module dédié ?
4. Quelle est la seule source qui gagne contre une phrase de ce cours ?
