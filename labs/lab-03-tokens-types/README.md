# Lab 03. Des tokens typés

> **Outcome :** à la fin, tu sais pourquoi une custom property non enregistrée ne peut être ni
> validée ni interpolée, et tu sais ce que `@property` change exactement. Tu auras vu de tes yeux
> une valeur invalide détruire une couleur, puis la même valeur être refusée proprement.
>
> **Vrai outil :** Chromium via Playwright. L'oracle lit les règles `@property` dans le **CSSOM**,
> échantillonne la valeur calculée **pendant** la transition, et force une valeur invalide pour
> observer ce qui se passe.
>
> **Feedback :** `npm run lab:03`. `npm run solution:03` prouve l'oracle, après ton GREEN.

## Lire avant

Module [`03-valeurs-et-custom-properties`](../../modules/03-valeurs-et-custom-properties), **une fois** :

- § 1 en entier, et surtout § 1.1 « invalide au moment du calcul »
- § 1.2 ce que le repli de `var()` ne couvre pas
- § 2 et § 2.1 les trois effets de `@property`, et les valeurs de `syntax`
- § 5 l'accessibilité, pour la dernière assertion

## Énoncé

`src/` contient une carte avec un badge et un bouton qui doit faire tourner le dégradé de la
carte. Deux choses ne fonctionnent pas, et elles ont la même cause.

1. Le dégradé **saute** au lieu de tourner, malgré `transition: --angle 600ms linear`.
2. Si une valeur invalide arrive dans `--accent`, le badge **perd sa couleur** au lieu de
   l'ignorer.

**Tu modifies `src/style.css`.** Le HTML et le script ne bougent pas.

Les valeurs attendues sont déjà là : `rgb(11, 95, 255)` pour l'accent, `0deg` puis `180deg` pour
l'angle. Ne les change pas.

## Vérifier

| Ce qui est vérifié | Pourquoi |
|---|---|
| `--accent` et `--angle` apparaissent comme règles `@property` dans le CSSOM | sans enregistrement, rien n'est possible |
| `--accent` est typée `<color>`, `--angle` est typée `<angle>` | c'est la syntaxe qui autorise l'interpolation |
| après `setProperty('--accent', 'pasunecouleur')`, le badge garde sa couleur | la valeur est refusée, pas « calculée invalide » |
| `--angle` vaut `0deg` normalisé au départ | signe que le navigateur la comprend |
| à 200 ms d'une transition de 600 ms, `--angle` est strictement entre 0 et 180 | elle s'interpole vraiment |
| à 800 ms, `--angle` vaut exactement 180 | la transition arrive à destination |
| aucun `content` porteur d'information, `10.2 (A)` | une information en CSS disparaît CSS désactivées |

## Sonde de rougissement

Après ton GREEN, retire **la seule ligne** `syntax: "<angle>";` de la règle `@property --angle` :

```bash
npm run lab:03
```

**Attendu :** le test d'interpolation échoue, parce qu'une propriété sans syntaxe n'est pas
interpolable, et le test d'enregistrement échoue aussi. Si l'oracle reste vert, il est cassé :
signale-le.

## Ce qui surprend tout le monde une fois

L'assertion sur la valeur invalide. On croit que `color: red; color: var(--c)` garde `red` si
`--c` est mauvaise. Non : la déclaration précédente est écrasée, la substitution échoue, et la
propriété part à l'héritage. Le repli n'existe pas dans la cascade, il existe dans `@property`.
