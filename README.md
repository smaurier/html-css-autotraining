# 25. HTML & CSS, niveau master

Cours du curriculum `fullstack-autotraining`. Il traite les mécanismes du moteur de rendu et de
l'arbre d'accessibilité, pas les recettes, et il intègre l'accessibilité comme critère de
réussite des labs plutôt que comme chapitre final.

- **21 modules** dans `modules/`, ordre à suivre, socle en 01 à 04.
- **14 labs** dans `labs/`, format oracle : `src/` RED, `solution/` GREEN, sonde de rougissement
  obligatoire.
- **Protocole de travail** dans [`GUIDE-APPRENANT.md`](./GUIDE-APPRENANT.md).

## Lire le cours

```bash
npm install          # à la racine du cours, pour VitePress
npx vitepress dev .
```

## Faire les labs

```bash
cd labs
npm install
npx playwright install chromium   # une fois, pour les labs à layout réel
npm run lab:01                    # RED attendu
npm run solution:01               # GREEN, prouve que l'oracle est juste
```

## Les deux audits de couverture

Le cours ne se contente pas d'affirmer qu'il est complet et à jour, il le vérifie.

```bash
node outils/couverture.mjs --telecharger   # rafraîchit les données des enquêtes
node outils/couverture.mjs                 # régénère couverture-state-of.md
node outils/criteres.mjs                   # régénère couverture-rgaa.md
node --test outils/test/couverture.test.mjs
node --test outils/test/criteres.test.mjs
```

| Fichier généré | Question à laquelle il répond |
|---|---|
| `couverture-state-of.md` | Un sujet réellement interrogé par State of HTML ou State of CSS est-il absent du cours ? |
| `couverture-rgaa.md` | Un critère RGAA n'est-il cité par aucun module ? Un module cite-t-il un numéro qui n'existe pas ? |
| `audit-existant.md` | Une notion est-elle déjà enseignée ailleurs dans le curriculum ? |

`couverture-state-of.md` et `couverture-rgaa.md` sont **générés**. Pour les changer, éditer
`outils/mapping.json` ou les modules, puis régénérer.

## Entretien annuel

Un rappel existe dans l'agenda, les 15 et 16 novembre de chaque année. À cette date, toutes les
enquêtes Devographics de l'année ont ouvert, donc tous leurs `questions.yml` existent.

Le geste tient en trois commandes, et dure dix minutes :

```bash
node outils/couverture.mjs --telecharger
node outils/couverture.mjs          # sort en erreur s'il reste un item sans module
node outils/criteres.mjs
```

Ce qui compte n'est pas la liste complète mais le **diff** : chaque item porte un `yearAdded`,
et la section « Nouveautés » de `couverture-state-of.md` isole ce que les éditeurs de
navigateurs et la communauté ont jugé assez mûr pour mériter une question cette année.

Un item sans module n'est pas forcément à traiter. C'est une décision à prendre, et la prendre
explicitement est tout l'objet du rendez-vous.

## Sources

- Référentiel RGAA, qui fait foi : <https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/>
- Les 106 critères, extraits de `rgaa-formation/index-criteres-slides.md`, dans
  `outils/criteres-rgaa.json`
- Outlines des enquêtes : <https://github.com/devographics/surveys>
