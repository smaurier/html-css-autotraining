# Lab 04. Contextes

> **Outcome :** à la fin, tu diagnostiques un bug de positionnement en une hypothèse au lieu de
> trois, tu sais remonter l'arbre pour trouver le contexte d'empilement coupable, et tu sais
> contenir une marge sans rien couper.
>
> **Vrai outil :** Chromium via Playwright. L'oracle mesure de la **géométrie** et un **ordre de
> tabulation réel** : ni l'un ni l'autre ne se lit dans le code.
>
> **Feedback :** `npm run lab:04` depuis `labs/`. `npm run solution:04` prouve l'oracle, et ne
> s'ouvre qu'après ton GREEN.

## Lire avant

Module [`04-pipeline-et-contextes`](../../modules/04-pipeline-et-contextes), **une fois** : § 2 en
entier, § 4.1 et § 4.2, § 6.

## Énoncé

`src/` contient quatre bugs, tous des bugs de contexte.

1. Le badge « 3 » se place par rapport au viewport au lieu de sa carte.
2. Le panneau jaune passe derrière la carte suivante, malgré un `z-index: 9999`.
3. La marge du paragraphe sort de son bloc gris. La rustine en place coupe les halos de focus.
4. Le bouton « Valider » est à gauche visuellement, et second au clavier.

**Tu modifies `src/style.css`, et pour le bug 4 tu modifies aussi `src/index.html`.** C'est
volontaire : la bonne correction d'un ordre visuel divergent est de remettre le DOM dans l'ordre,
pas d'ajouter du CSS.

## Vérifier

| Ce qui est vérifié | Pourquoi |
|---|---|
| le badge est dans les limites de sa carte | containing block local |
| l'élément au point bas du panneau EST le panneau | plus de contexte enfermant |
| l'opacité de la carte vaut 1 | aucun contexte d'empilement accidentel |
| la marge de l'enfant reste dans le bloc | contexte de formatage |
| `overflow` du bloc vaut `visible` | `flow-root` contient sans couper, `10.7 (A)` |
| l'ordre de tabulation égale l'ordre visuel | `12.8 (A)` |
| aucun `order`, aucun `tabindex` positif | la correction se fait à la source |

## Le réflexe à prendre

Devant un `z-index` qui « ne marche pas », ne jamais augmenter le nombre. Remonter l'arbre et
chercher quel ancêtre crée un contexte d'empilement. La liste est au module 04 § 4.1, et
`opacity` en fait partie, ce qui surprend la première fois.

## Sonde de rougissement

Après ton GREEN, remets `opacity: 0.99;` sur `.carte`, puis relance `npm run lab:04`.
**Attendu :** le test du panneau et celui de l'opacité échouent.

Si l'oracle reste vert après cette modification, il est cassé et ce lab ne compte pas :
signale-le. Remets ensuite le code en état.
