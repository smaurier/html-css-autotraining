# Lab 14. Web component accessible

> **Outcome :** à la fin, tu sais exposer un rôle, un nom et un état depuis un composant à shadow DOM, et
> tu sais pourquoi une référence ARIA ne traverse pas une frontière.
>
> **Vrai outil :** Chromium via Playwright, et pour ce lab l'oracle lit le **vrai arbre d'accessibilité** via
> le protocole de débogage, parce que `getByRole` ne voit pas ce qu'expose
> `ElementInternals`.
>
> **Feedback :** `npm run lab:14` depuis `labs/`. `npm run solution:14` prouve que
> l'oracle est juste, et ne s'ouvre qu'après ton GREEN.

## Lire avant

Module [`18-web-components-et-shadow-dom`](../../modules/18-web-components-et-shadow-dom), **une
fois** : § 3.1, § 4, § 5 en entier, § 6.1.

## Énoncé

`src/` contient un composant `<bascule-notifs>` qui s'affiche correctement et qui n'existe pas
dans l'arbre d'accessibilité. Son libellé est censé venir du document par `aria-labelledby` : il
ne traverse pas la frontière du shadow, et rien ne le signale.

**Tu réécris `src/index.html` et `src/script.js`.**

Exigences :

1. le shadow DOM est **déclaratif**, par `<template shadowrootmode="open">` ;
2. le rôle `switch` et l'état sont exposés par `ElementInternals` ;
3. le nom accessible vient d'un **attribut du composant**, pas d'une référence qui traverse ;
4. le composant est focusable et bascule à la barre d'espace ;
5. l'état est exposé au CSS par `:state()`, pas par une classe ;
6. le contenu de l'hôte est projeté dans un `<slot>`.

## Vérifier

| Ce qui est vérifié | Critère |
|---|---|
| l'élément est défini | le composant existe |
| le HTML contient `<template shadowrootmode="open">` | rendu au premier octet |
| deux nœuds de rôle `switch` dans l'arbre | `7.1 (A)` |
| leurs noms sont ceux des attributs | `7.1 (A)` |
| la propriété `checked` de l'arbre change au clic | `7.1 (A)` |
| le composant prend le focus et bascule à l'espace | `7.3 (A)` |
| `:state(actif)` correspond | état exposé au CSS |
| le contenu projeté est rendu | les slots fonctionnent |
| les deux instances sont indépendantes | pas d'état partagé |

## Pourquoi cet oracle est différent des treize autres

`ElementInternals` expose le rôle, le nom et les états à l'arbre de la plateforme **sans les
écrire dans le DOM**. Le moteur de rôles de Playwright, lui, lit le DOM. Un composant
parfaitement accessible par internals est donc invisible pour `getByRole`, alors qu'un lecteur
d'écran l'annonce très bien. C'est exactement ce que dit le module 18 § 6.3 : on inspecte l'arbre
aplati, pas le DOM.

## Sonde de rougissement

Après ton GREEN, commente la ligne qui pose `this.#internals.role = "switch"`,
puis relance. **Attendu :** le test du rôle échoue en disant qu'aucun nœud `switch` n'a été
trouvé dans l'arbre. Le composant, lui, continue de s'afficher et de fonctionner à la
souris : c'est tout le problème.

Si l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas :
signale-le. Remets ensuite le code en état.
