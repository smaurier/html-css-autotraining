# Lab 01. L'arbre d'accessibilité

> **Outcome :** à la fin, tu sais produire un document dont l'arbre d'accessibilité est juste,
> pas seulement dont le rendu est juste. Tu sais nommer une région, transformer une suite de
> liens en liste annonçable, donner un intitulé à un lien icône, et poser un lien d'accès rapide
> qui fonctionne.
>
> **Vrai outil :** un navigateur réel (Chromium via Playwright) plus `axe-core`. L'oracle
> interroge l'**arbre d'accessibilité calculé**, les noms accessibles et l'ordre de tabulation
> réel, pas le balisage écrit. C'est la différence que le module 01 § 1 explique.
>
> **Feedback :** `npm run lab:01` depuis `labs/`. RED tant que `src/` ne satisfait pas l'oracle.
> Au GREEN, le correcteur tranche (GO / FIX / STOP). `npm run solution:01` prouve que l'oracle
> est juste, et tu ne l'ouvres pas avant ton GREEN.

## Lire avant (une lecture bornée, pas le module entier)

Module [`01-document-et-arbre-d-accessibilite`](../../modules/01-document-et-arbre-d-accessibilite), **une fois** :

- § 1.1 ce que porte un nœud de l'arbre
- § 1.3 l'algorithme du nom accessible, en entier
- § 1.4 le tableau des quatre mécanismes de masquage
- § 2.1 les régions
- § 2.3 les listes

⛔ **Ne lis pas § 4 avant ton GREEN** : il contient la décision sur les images, qui est une
partie de ce lab.

Ensuite : page blanche. Le module ne se rouvre qu'en dépannage ciblé, sur la section que le test
qui échoue désigne.

## Énoncé

`src/index.html` contient l'en-tête, le contenu et le pied d'une page « Membres » de TribuZen.
À l'écran, le résultat est presque correct. Dans l'arbre d'accessibilité, il est faux.

**Tu réécris `src/index.html`.** Le contenu textuel est le bon : ne change pas les libellés, ne
retire pas de lien, n'ajoute pas de section. Tout le travail porte sur la structure et sur ce
que l'arbre expose.

Les styles sont déjà fournis par `../commun.css`, et ils contiennent deux classes que tu auras
besoin d'utiliser : `.visuellement-masque` et `.acces-rapide`. Lis-les avant de commencer, elles
sont commentées.

Neuf choses sont fautives. L'oracle te dira lesquelles, une par une. N'essaie pas de les
deviner toutes d'un coup : lance `npm run lab:01`, lis le premier échec, corrige, relance.

## Vérifier

Le contrat exact attendu par l'oracle :

| Ce qui est vérifié | Critère |
|---|---|
| `<html>` porte un `lang` valide | `8.3 (A)` |
| le `<title>` n'est pas générique et nomme la page | `8.5 (A)` |
| exactement un `banner`, un `main`, un `contentinfo` | `9.2 (A)`, `12.6 (A)` |
| une seule région de navigation, et elle est **nommée** | `12.6 (A)` |
| la navigation est une liste de 5 éléments | `9.3 (A)` |
| un `h1` unique, et trois `h2` | `9.1 (A)` |
| le premier `Tab` atteint un lien d'ancre interne, dont la cible existe, et qui devient visible | `12.7 (A)` |
| aucun lien sans intitulé | `6.2 (A)` |
| le lien de recherche a un intitulé, et les deux liens d'aide ont des noms **différents** | `6.1 (A)` |
| aucun élément focusable n'est `aria-hidden` | module 01 § 1.4 |
| les images décoratives ont un `alt` vide | `1.2 (A)` |
| aucun arrêt de tabulation muet | `12.8 (A)` |
| `axe` ne trouve aucune violation | nécessaire, pas suffisant |

## Sonde de rougissement

Un oracle qui ne peut pas rougir ne prouve rien. Une fois au GREEN, applique cette modification
d'une ligne à `src/index.html` :

```diff
- <nav class="nav" aria-label="Navigation principale">
-   <ul>
+ <nav class="nav" aria-label="Navigation principale">
+   <div>
```

Puis relance :

```bash
npm run lab:01
```

**Attendu :** le test `9.3 (A)` échoue, en disant qu'une suite de liens doit être une liste. Si
l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas : signale-le.

Remets le `<ul>` ensuite.

## Ce que ce lab ne demande pas

Il ne demande aucun style. Si tu te retrouves à écrire du CSS, tu es sorti du sujet : ce lab
porte sur ce que le document **dit**, et le module 02 s'occupera de ce qu'il **montre**.
