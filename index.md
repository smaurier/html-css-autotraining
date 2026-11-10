---
layout: home

hero:
  name: "HTML & CSS"
  text: "Niveau master, accessibilité comprise"
  tagline: "Le moteur, pas la recette. 21 modules, 14 labs à oracle, et l'accessibilité comme critère de réussite plutôt que comme chapitre final."
  actions:
    - theme: brand
      text: Commencer
      link: /modules/00-prerequis-et-protocole
    - theme: alt
      text: Voir les labs
      link: /labs/lab-01-arbre-d-accessibilite/README
    - theme: alt
      text: Couverture des enquêtes
      link: /couverture-state-of

features:
  - title: Le mécanisme avant la recette
    details: Cascade et origines, containing block, formatting contexts, stacking context, pipeline style-layout-paint-composite, algorithmes de Grid et de Flex, et l'arbre d'accessibilité traité comme une structure de données calculée.
  - title: L'accessibilité non détachable
    details: Aucun module « a11y ». Les critères RGAA sont cités par numéro dans le module où le geste se fait, et un lab n'est GO que si son oracle les vérifie. On ne peut pas finir un module en sautant l'accessibilité.
  - title: 14 labs à oracle exécutable
    details: src RED, solution GREEN, test qui rougit pour de vrai. Nom accessible calculé, ordre de tabulation, style calculé, ratio de contraste, seuils de container queries. Pas de capture d'écran à l'œil.
  - title: À jour, et c'est vérifiable
    details: 215 items réellement interrogés par State of HTML 2026 et State of CSS 2026 sont confrontés au plan du cours par un outil testé. Zéro item sans module. Rejouable chaque mi-novembre.
---

## Pourquoi ce cours existe

Dix ans d'intégration réussie laissent un angle mort particulier : on sait faire, on ne sait
pas toujours **pourquoi ça marche**. Le centrage tombe juste, mais le containing block n'est
pas nommé. La cascade est domptée par l'habitude, pas par le calcul de spécificité. Le focus
se voit, mais `10.7` n'est pas le critère invoqué.

Ce cours vise cet angle mort, et lui seul. Il ne réapprend pas à écrire une div.

Il part aussi d'un constat mesuré sur ce curriculum, le 09/11/2026 : l'accessibilité était
réexpliquée dans **onze cours** (trente-deux fichiers côté React, vingt côté Vue, quinze côté
Design System) sans qu'aucun n'en soit la source. Ce cours est désormais cette source. Les
cours framework gardent leur spécificité et pointent ici pour le reste.

## Structure

| # | Module | Lab | Mécanisme central |
|---|--------|-----|-------------------|
| 00 | [Prérequis et protocole](/modules/00-prerequis-et-protocole) | aucun | Comment on travaille ici |
| 01 | [Le document et l'arbre d'accessibilité](/modules/01-document-et-arbre-d-accessibilite) | [01](/labs/lab-01-arbre-d-accessibilite/README) | Deux arbres, pas un |
| 02 | [Cascade, couches et portée](/modules/02-cascade-couches-et-portee) | [02](/labs/lab-02-cascade-domptee/README) | Origines, `@layer`, spécificité |
| 03 | [Valeurs, custom properties et fonctions](/modules/03-valeurs-et-custom-properties) | [03](/labs/lab-03-tokens-types/README) | Substitution et calcul |
| 04 | [Le pipeline de rendu et les contextes](/modules/04-pipeline-et-contextes) | [04](/labs/lab-04-contextes/README) | Containing block, stacking |
| 05 | [Flexbox en vérité](/modules/05-flexbox-en-verite) | [05](/labs/lab-05-flex/README) | Algorithme de distribution |
| 06 | [Grid et subgrid](/modules/06-grid-et-subgrid) | [06](/labs/lab-06-grid-subgrid/README) | Placement et pistes |
| 07 | [Propriétés logiques et dimensionnement](/modules/07-logiques-et-dimensionnement) | aucun | Axes logiques, reflow |
| 08 | [Adaptatif : container queries et préférences](/modules/08-adaptatif-et-preferences) | [07](/labs/lab-07-container-queries/README) | Confinement |
| 09 | [Positionnement ancré, popover, dialog](/modules/09-ancrage-popover-dialog) | [08](/labs/lab-08-ancrage-et-popover/README) | Top layer |
| 10 | [Couleur, espaces et contraste](/modules/10-couleur-et-contraste) | [09](/labs/lab-09-couleur-et-contraste/README) | Espaces de couleur, ratio |
| 11 | [Formes, texte et décorations](/modules/11-formes-texte-decorations) | aucun | Boîtes de texte et chemins |
| 12 | [Mouvement et préférence de mouvement](/modules/12-mouvement) | [10](/labs/lab-10-mouvement-respectueux/README) | Interpolation, timeline |
| 13 | [Défilement et carrousels](/modules/13-defilement-et-carrousels) | [11](/labs/lab-11-carrousel-accessible/README) | Scrollport, snap |
| 14 | [Formulaires natifs](/modules/14-formulaires-natifs) | [12](/labs/lab-12-formulaire-natif/README) | Contraintes et noms |
| 15 | [Interactivité native](/modules/15-interactivite-native) | aucun | État déclaratif |
| 16 | [Styler les récalcitrants](/modules/16-styler-les-recalcitrants) | aucun | Pseudo-éléments internes |
| 17 | [Ce que la plateforme n'a pas](/modules/17-ce-que-la-plateforme-n-a-pas) | [13](/labs/lab-13-patterns-manquants/README) | Patterns ARIA |
| 18 | [Web components et shadow DOM](/modules/18-web-components-et-shadow-dom) | [14](/labs/lab-14-web-component-accessible/README) | Encapsulation |
| 19 | [Charger, livrer, outiller](/modules/19-charger-livrer-outiller) | aucun | Priorités de chargement |
| 20 | [Vérifier : audit, lecteurs d'écran, outils](/modules/20-verifier) | aucun | Méthode d'audit |
| 21 | [Les APIs de plateforme et la grille de décision](/modules/21-apis-et-grille-de-decision) | aucun | Droit de s'appuyer dessus |

## Ce que ce cours n'est pas

Il ne remplace pas la formation Access42 : le référentiel reste le texte officiel, et ce cours
le cite par numéro sans le paraphraser. Il ne fait pas non plus la veille à ta place : il la
rend vérifiable, par `couverture-state-of.md`.
