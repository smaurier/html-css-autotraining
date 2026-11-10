# Dégraissage des cours existants : relevé et procédure

> Relevé du 09/11/2026. **Rien n'a été modifié dans les neuf cours concernés**, et c'est
> volontaire : chacun est un **sous-module git distinct**, avec son propre dépôt, et le workflow
> de la maison est PR seulement. Toucher neuf dépôts sans go explicite serait une entorse.
>
> Ce fichier rend la passe mécanique quand elle sera lancée.

## La règle, non négociable

**Une ligne n'est retirée d'un cours que si la notion existe dans le cours 25.** Les cours
gardent ce qui est spécifique à leur framework. Les deux couvertures du cours 25
(`couverture-state-of.md`, `couverture-rgaa.md`) servent de preuve qu'une notion y est bien
traitée avant de la retirer ailleurs.

## Le périmètre, mesuré

Fichiers et lignes mentionnant `aria-label`, `contraste`, `texte alternatif`,
`navigation au clavier` ou `focus visible` :

| Cours (sous-module) | Fichiers | Lignes | À garder en propre | À remplacer par un renvoi |
|---|---|---|---|---|
| `04-react` | 33 | 146 | `aria-*` en JSX, refs et focus, tests RTL | nom accessible, contraste, sémantique |
| `02-vue` | 28 | 148 | `v-bind` sur attribut ARIA, teleport et focus | les généralités d'accessibilité |
| `24-design-craft` | 23 | 99 | le contraste en phase de **maquette** | le calcul du ratio et les seuils |
| `21-design-system` | 21 | 118 | tokens, Storybook, a11y des variantes | contraste, focus, sémantique |
| `03-angular` | 11 | 63 | `cdkTrapFocus`, a11y du CDK | les généralités |
| `13-architecture` | 8 | 11 | a11y comme **exigence d'architecture**, OKLCH et pipeline de tokens | rien, renvoi réciproque seulement |
| `06-testing` | 6 | 24 | **comment** tester l'accessibilité | **ce qu'est** l'accessibilité |
| `23-droit-numerique` | 2 | 10 | cadre légal, sanctions, déclaration | les critères techniques |
| `19-react-native` | 0 | 0 | a11y mobile, qui diverge réellement | rien à faire |

Total : **132 fichiers, 619 lignes** à examiner. Le relevé initial parlait de 827 lignes pour
Vue : ce chiffre comptait toutes les occurrences, celui-ci ne compte que les lignes des cinq
notions ciblées.

Deux cours ne doivent **pas** être dégraissés mais mis en **renvoi réciproque** :
`13-architecture`, qui enseigne réellement OKLCH et le pipeline de tokens, et
`24-design-craft`, qui traite le contraste en phase de maquette. Les retirer appauvrirait ces
cours sans rien gagner. Détail dans `audit-existant.md`.

## Procédure, par cours

```bash
A=/c/Users/sylva/Documents/projects/fullstack-autotraining
COURS=02-vue

# 1. Une branche DANS le sous-module. Jamais de commit sur son main.
git -C "$A/$COURS" checkout -b degraissage-a11y

# 2. Repérer les passages
grep -rinE "aria-label|contraste|texte alternatif|navigation au clavier|focus visible" \
  "$A/$COURS" --include="*.md" --exclude-dir=node_modules

# 3. Retirer, et remplacer par un renvoi d'une ligne, de cette forme :
#    > Sémantique, nom accessible et contraste : cours 25, modules 01 et 10.

# 4. Vérifier qu'aucun renvoi ne pointe vers un module inexistant
grep -rhoE "cours 25, modules? [0-9]+" "$A/$COURS" | grep -oE "[0-9]+$" | sort -u
ls "$A/25-html-css/modules/"

# 5. Pousser la branche et ouvrir la PR. C'est Sylvain qui fusionne.
git -C "$A/$COURS" push -u origin degraissage-a11y
```

**Après fusion seulement**, bumper le pointeur du sous-module dans le dépôt racine. Jamais
avant, sinon le pointeur désigne un commit absent du distant.

Et le piège connu, noté dans la mémoire du 04/11 : un sous-module détaché renvoie un code de
sortie 0 sur `git push origin main` **sans rien pousser**. La preuve d'un push est
`git ls-remote`, pas le code de sortie.

## Ce que ce dégraissage n'est pas

Ce n'est pas une suppression de contenu d'accessibilité. C'est un déplacement de la **propriété**
de la notion. Après la passe, le curriculum dira l'accessibilité **une fois**, au bon endroit, et
chaque cours framework dira ce que son framework y ajoute. Aujourd'hui, onze cours en disent un
peu, et personne n'en dit assez.
