# Guide de l'apprenant

## Le protocole, en six lignes

1. **Lire avant**, une fois : la section « Lire avant » du lab désigne des paragraphes précis
   du module. Pas le module entier.
2. **Page blanche** : tu codes sans rouvrir le module ni la solution.
3. **`npm run lab:NN`** : RED tant que ton code ne satisfait pas l'oracle.
4. **Le test qui échoue te dit quelle section rouvrir.** Rien d'autre.
5. **GREEN**, puis seulement alors : `npm run solution:NN` pour comparer.
6. **Le correcteur tranche** (GO / FIX / STOP). Personne ne valide en session.

La relecture immédiate n'est pas l'amie de l'encodage : elle donne la sensation d'avoir appris
sans l'avoir fait. C'est pour ça que le module se referme avant le lab, et que la solution
reste fermée avant ton GREEN.

## Ce qui est spécifique à ce cours

### L'accessibilité n'est pas une étape finale

Il n'y a pas de module « accessibilité », et c'est un choix structurel. Chaque module porte les
critères RGAA du geste qu'il enseigne, et l'oracle de son lab les vérifie. Conséquence directe :
**tu ne peux pas obtenir un GREEN en reportant l'accessibilité à plus tard.** Un bouton sans nom
accessible fait rougir le test du module sur les formulaires, pas un hypothétique module 22.

La raison est mesurée, pas idéologique. Le 09/11/2026, l'accessibilité était réexpliquée dans
onze cours de ce curriculum sans qu'aucun n'en soit la source : trente-deux fichiers côté React,
vingt côté Vue, quinze côté Design System. Une matière répétée partout et possédée nulle part
finit par n'être apprise nulle part.

### Les critères sont cités, jamais paraphrasés

Un critère RGAA apparaît ici sous la forme `11.1 (A)` avec sa formulation courte. Le texte qui
fait foi est le référentiel officiel, et en cas de doute sur un protocole de test, la source est
la formation Access42, pas ce cours. Si une phrase de ce cours contredit le référentiel, **c'est
le référentiel qui gagne**, et la phrase est un bug à corriger.

### Les oracles rougissent pour de vrai

Un test d'accessibilité qui passe sur une page vide ne prouve rien. Chaque lab de ce cours est
accompagné de sa **sonde de rougissement** : une modification d'une ligne, documentée dans le
README du lab, qui doit faire échouer le test. Si elle ne le fait pas, l'oracle est cassé et le
lab ne compte pas.

Trois familles d'oracles sont utilisées, selon ce qu'il faut prouver :

| Ce qu'on prouve | Outil | Pourquoi pas autrement |
|---|---|---|
| Rôle, nom accessible, état | `@testing-library/dom` + `getByRole` | Teste l'arbre d'accessibilité calculé, pas le markup écrit |
| Violations automatisables | `axe-core` dans Vitest | Couvre une part des critères, jamais tous : un axe vert n'est pas une conformité |
| Style calculé, géométrie, tabulation, contraste | Playwright | jsdom ne fait pas de layout : il ne connaît ni `@container`, ni le focus réel, ni une couleur résolue |

La limite d'`axe` est à connaître par cœur : les outils automatiques détectent une minorité des
non-conformités. Le module 20 chiffre cette limite et donne la méthode manuelle.

## Installer

```bash
cd 25-html-css/labs
npm install
npx playwright install chromium   # une seule fois, pour les labs à layout réel
```

Puis, pour le premier lab :

```bash
npm run lab:01        # RED attendu
npm run solution:01   # GREEN, prouve que l'oracle est juste
```

## Ordre

L'ordre des modules est l'ordre à suivre : chaque module suppose les mécanismes des précédents.
Les modules 01 à 04 sont le socle, et sauter le 02 pour aller faire du Grid se paie au module 16,
quand il faudra styler un `<select>` sans casser sa cascade interne.

Les trois exceptions, utilisables à la demande sans attendre leur tour :

- le module 20 (vérifier) si un audit tombe avant que tu y sois ;
- le module 19 (outillage) si un choix d'outil se pose en mission ;
- le module 21 (APIs de plateforme), qui est une grille de décision plus qu'un cours.
