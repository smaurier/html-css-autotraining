# Audit de l'existant, avant écriture du cours 25

> Relevé du 09/11/2026 sur les 24 cours du curriculum, hors `node_modules`.
> Commandes de relevé conservées en fin de fichier : tout chiffre ici est rejouable.
>
> **Raison d'être :** trois façons d'oublier quelque chose. Un item d'enquête non couvert
> (traité par `couverture-state-of.md`), un critère RGAA couvert par aucun module (traité par
> `couverture-rgaa.md`), et une notion déjà bien traitée ailleurs qu'on réécrirait pour rien.
> Ce fichier traite la troisième.

## Verdicts

Trois valeurs possibles. `à dégraisser` : la notion est redite dans un cours qui n'en est pas
le propriétaire, et le cours 25 la porte désormais. `à garder` : la mention est spécifique au
cours, elle reste. `à écrire` : personne ne l'enseigne, c'est un trou réel.

| Notion | Où elle est aujourd'hui | Verdict |
|---|---|---|
| `aria-label` et le nom accessible | 32 fichiers `04-react`, 20 `02-vue`, 15 `21-design-system`, 10 `03-angular`, 6 `06-testing` | **à dégraisser** : le 25 module 01 en est la source. Garder en React les `aria-*` en JSX, en Vue le `v-bind` sur attribut ARIA, en Testing comment le tester |
| Contraste | 23 `24-design-craft`, 15 `02-vue`, 10 `21-design-system`, 6 `03-angular` | **à dégraisser** sauf Design Craft, qui le traite en phase de maquette et le garde. Le calcul et les seuils vont au 25 module 10 |
| Texte alternatif | 14 `04-react`, 14 `02-vue`, 5 `13-architecture`, 5 `11-http-caching` | **à dégraisser**. Le 25 module 01 porte la décision décoration contre information |
| Navigation clavier, focus visible | 9 `02-vue`, 4 `04-react`, 4 `03-angular`, 3 `21-design-system`, 2 `23-droit-numerique` | **à dégraisser**. Le 25 modules 01, 09 et 20 portent la matière. Garder l'a11y du CDK en Angular |
| `@layer`, couches de cascade | 4 `21-design-system` seulement | **à écrire**. Quasi absent du curriculum, alors que c'est le mécanisme qui règle les guerres de spécificité |
| `:has()` | 2 `21-design-system` | **à écrire** |
| `@container` | 3 `21-design-system` | **à écrire**. Trois mentions pour un mécanisme central en 2026 |
| `subgrid` | nulle part | **à écrire** |
| Custom properties | 8 `13-architecture`, 6 `21-design-system`, 4 `24-design-craft`, 4 `02-vue` | **à garder** côté architecture (pipeline de tokens) et **à écrire** côté mécanisme : `@property`, cycle de substitution, valeur invalide à l'utilisation, rien de tout ça n'est traité |
| `grid-template` | 7 `02-vue`, 6 `03-angular`, 3 `21-design-system` | **à écrire**. Vérification faite : ce sont des `style=` en ligne dans des exemples de documentation framework, pas un enseignement de Grid. Rien à dégraisser, tout à écrire |
| OKLCH, `color-mix` | 8 `13-architecture`, 3 `21-design-system` | **à garder**. Vérification faite : `13-architecture/cours/05-architecture-frontend/05-design-tokens-systems.md` enseigne réellement OKLCH pour la génération de palettes. Le 25 module 10 traite la perception, les gamuts et le contraste, et renvoie à l'architecture pour le pipeline de tokens. Renvoi réciproque à poser |
| Shadow DOM | 4 `13-architecture` | **à garder** (angle architecture, micro-frontends) et **à écrire** côté pratique : portée du style, slots, `ElementInternals`, effet sur l'arbre d'accessibilité |
| `<dialog>` | Vérification faite : 7 fichiers citent `<dialog>` natif, 9 citent `MatDialog`, `DialogService` ou `useDialog` | **mixte**. Les composants de librairie restent dans leur cours. L'élément natif, le top layer et le piège de focus vont au 25 module 09 |
| `popover` | 2 `25-html-css`, 1 chacun dans `24-design-craft`, `21-design-system`, `13-architecture`, `04-react` | **à écrire** |
| `prefers-reduced-motion` | 7 `24-design-craft`, 7 `21-design-system`, 5 `02-vue`, 2 `13-architecture` | **à dégraisser** partiellement : Design Craft garde l'angle intention de mouvement, le 25 module 12 porte le contrat technique et le critère `13.8 (A)` |

## Ce que cet audit change au plan

1. **Le dédoublonnage est plus petit que prévu sur le CSS, plus gros que prévu sur l'a11y.**
   Les notions CSS modernes ne sont pas dupliquées, elles sont absentes. Il n'y a donc presque
   rien à retirer côté CSS, et beaucoup à écrire.
2. **Deux cours ne doivent pas être dégraissés mais mis en renvoi réciproque** :
   `13-architecture` pour OKLCH et le pipeline de tokens, `24-design-craft` pour le contraste
   en maquette et l'intention de mouvement. Les retirer appauvrirait ces cours sans rien gagner.
3. **`06-testing` garde la manière de tester l'accessibilité**, et perd la définition de ce
   qu'est l'accessibilité. C'est la frontière la plus nette du lot.

## Commandes de relevé

```bash
A=/c/Users/sylva/Documents/projects/fullstack-autotraining
for t in "aria-label" "contraste" "texte alternatif|alt=" "navigation au clavier|focus visible" \
         "cascade layer|@layer" ":has\(" "@container" "custom propert" "grid-template" \
         "shadow dom" "popover" "dialog" "prefers-reduced-motion" "subgrid" "color-mix|oklch"; do
  printf "### %s\n" "$t"
  grep -rilE "$t" "$A"/[0-9]* --include="*.md" --exclude-dir=node_modules 2>/dev/null \
    | sed "s|$A/||" | cut -d/ -f1 | sort | uniq -c | sort -rn | head -5
done
```

Désambiguïsation de `<dialog>` et d'OKLCH :

```bash
grep -rl "<dialog" "$A"/[0-9]* --include="*.md" --exclude-dir=node_modules | wc -l
grep -rlE "MatDialog|DialogService|useDialog" "$A"/[0-9]* --include="*.md" --exclude-dir=node_modules | wc -l
grep -rniE "color-mix|oklch" "$A/13-architecture" --include="*.md"
```

## Lot B (ajouté au périmètre le 09/11/2026)

Relevé à faire en tâche 16.1 avant d'écrire : trouver le cours **propriétaire** des build tools
et des linters, la mention ne valant pas la propriété. Les quinze notions ci-dessus ont montré
deux fois que la différence compte.
