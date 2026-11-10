# Lab 02. La cascade domptée

> **Outcome :** à la fin, tu sais remettre d'aplomb une feuille qui ne « marchait » qu'à force de
> surenchère, en fixant l'ordre une fois avec `@layer` au lieu de monter la spécificité. Tu sais
> aussi pourquoi un reset doit s'écrire avec `:where()`.
>
> **Vrai outil :** Chromium via Playwright. L'oracle interroge le **style calculé**, pas la
> feuille écrite : c'est la seule façon de savoir qui gagne réellement.
>
> **Feedback :** `npm run lab:02` depuis `labs/`. RED tant que `src/` ne satisfait pas l'oracle.
> `npm run solution:02` prouve que l'oracle est juste, et ne s'ouvre qu'après ton GREEN.

## Lire avant

Module [`02-cascade-couches-et-portee`](../../modules/02-cascade-couches-et-portee), **une fois** :

- § 1 les huit paliers, en entier
- § 2.1 à 2.3 déclarer l'ordre, le hors-couche, l'inversion par `!important`
- § 3.1 les pseudo-classes fonctionnelles

⛔ Pas § 5 avant ton GREEN : la spécificité cachée de l'imbrication n'est pas le sujet de ce lab.

## Énoncé

`src/style.css` produit un résultat **faux** : le bouton primaire placé dans une carte est gris
alors qu'il devrait être primaire. La cause est au milieu du fichier, et elle est double, un
sélecteur très spécifique plus un `!important`.

**Tu réécris `src/style.css`.** Le HTML ne bouge pas, pas une classe, pas un attribut.

Contraintes :

1. zéro `!important` ;
2. l'ordre des couches est déclaré **une seule fois**, en tête de fichier ;
3. le reset n'impose rien : il doit rester surchargeable par un simple sélecteur d'élément ;
4. l'utilitaire `.cache` doit gagner contre n'importe quel composant, sans surenchère.

Les couleurs attendues sont déjà dans le fichier : `rgb(11, 95, 255)` pour le fond primaire,
blanc pour son texte. Ne les change pas, l'oracle les vérifie.

## Vérifier

| Ce qui est vérifié | Pourquoi |
|---|---|
| aucun `!important` hors commentaire | la cascade doit être domptée, pas forcée |
| une déclaration `@layer a, b, c;` existe | l'ordre se fixe une fois |
| le primaire dans une carte est `rgb(11, 95, 255)` | la couche bat la spécificité |
| le secondaire n'est pas peint en primaire | aucune règle n'a débordé |
| `.cache` masque réellement | la couche utilitaires est la dernière |
| le reset utilise `:where()` | spécificité nulle, donc surchargeable |
| le focus reste visible, `10.7 (A)` | une réorganisation ne doit rien casser |

## Sonde de rougissement

Après ton GREEN, déplace la déclaration de `.cache` de la couche `utilitaires` vers la couche
`base` :

```bash
npm run lab:02
```

**Attendu :** le test « l'utilitaire l'emporte sans `!important` » échoue, parce que `base` est
déclarée avant `composants`, donc plus faible. Si l'oracle reste vert, il est cassé : signale-le.

Remets la déclaration dans `utilitaires` ensuite.

## Le piège dans lequel presque tout le monde tombe

Mettre **une partie** du code dans des couches et laisser le reste dehors. Le hors-couche bat
toutes les couches de la même origine, donc un système à moitié organisé est moins prévisible
qu'un système sans couches du tout. Si tu adoptes `@layer`, tout y passe.
