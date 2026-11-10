import { defineConfig } from "vitepress";

export default defineConfig({
  title: "HTML & CSS",
  description:
    "Cours HTML et CSS de niveau master, accessibilité intégrée : mécanismes du moteur de rendu, arbre d'accessibilité, critères RGAA cités dans le module du geste, 14 labs à oracle exécutable.",
  lang: "fr-FR",
  srcDir: ".",

  // Les liens vers les labs et modules en cours d'écriture ne doivent pas casser le build
  // pendant la rédaction. À repasser à false quand les 21 modules et 14 labs existent.
  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: "Modules", link: "/modules/00-prerequis-et-protocole" },
      { text: "Labs", link: "/labs/lab-01-arbre-d-accessibilite/README" },
      { text: "Couverture", link: "/couverture-state-of" },
      { text: "RGAA", link: "/couverture-rgaa" },
      { text: "Glossaire", link: "/glossaire" },
    ],

    sidebar: {
      "/modules/": [
        {
          text: "Socle",
          items: [
            { text: "00. Prérequis et protocole", link: "/modules/00-prerequis-et-protocole" },
            {
              text: "01. Le document et l'arbre d'accessibilité",
              link: "/modules/01-document-et-arbre-d-accessibilite",
            },
            { text: "02. Cascade, couches et portée", link: "/modules/02-cascade-couches-et-portee" },
            {
              text: "03. Valeurs et custom properties",
              link: "/modules/03-valeurs-et-custom-properties",
            },
            { text: "04. Pipeline et contextes", link: "/modules/04-pipeline-et-contextes" },
          ],
        },
        {
          text: "Mettre en page",
          items: [
            { text: "05. Flexbox en vérité", link: "/modules/05-flexbox-en-verite" },
            { text: "06. Grid et subgrid", link: "/modules/06-grid-et-subgrid" },
            {
              text: "07. Logiques et dimensionnement",
              link: "/modules/07-logiques-et-dimensionnement",
            },
            { text: "08. Adaptatif et préférences", link: "/modules/08-adaptatif-et-preferences" },
            { text: "09. Ancrage, popover, dialog", link: "/modules/09-ancrage-popover-dialog" },
          ],
        },
        {
          text: "Peindre",
          items: [
            { text: "10. Couleur et contraste", link: "/modules/10-couleur-et-contraste" },
            { text: "11. Formes, texte, décorations", link: "/modules/11-formes-texte-decorations" },
          ],
        },
        {
          text: "Faire bouger",
          items: [
            { text: "12. Mouvement", link: "/modules/12-mouvement" },
            { text: "13. Défilement et carrousels", link: "/modules/13-defilement-et-carrousels" },
          ],
        },
        {
          text: "Composants de la plateforme",
          items: [
            { text: "14. Formulaires natifs", link: "/modules/14-formulaires-natifs" },
            { text: "15. Interactivité native", link: "/modules/15-interactivite-native" },
            { text: "16. Styler les récalcitrants", link: "/modules/16-styler-les-recalcitrants" },
            {
              text: "17. Ce que la plateforme n'a pas",
              link: "/modules/17-ce-que-la-plateforme-n-a-pas",
            },
            {
              text: "18. Web components et shadow DOM",
              link: "/modules/18-web-components-et-shadow-dom",
            },
          ],
        },
        {
          text: "Livrer et vérifier",
          items: [
            { text: "19. Charger, livrer, outiller", link: "/modules/19-charger-livrer-outiller" },
            { text: "20. Vérifier", link: "/modules/20-verifier" },
            {
              text: "21. APIs et grille de décision",
              link: "/modules/21-apis-et-grille-de-decision",
            },
          ],
        },
      ],

      "/labs/": [
        {
          text: "Labs",
          items: [
            { text: "01. Arbre d'accessibilité", link: "/labs/lab-01-arbre-d-accessibilite/README" },
            { text: "02. Cascade domptée", link: "/labs/lab-02-cascade-domptee/README" },
            { text: "03. Tokens typés", link: "/labs/lab-03-tokens-types/README" },
            { text: "04. Contextes", link: "/labs/lab-04-contextes/README" },
            { text: "05. Flex", link: "/labs/lab-05-flex/README" },
            { text: "06. Grid et subgrid", link: "/labs/lab-06-grid-subgrid/README" },
            { text: "07. Container queries", link: "/labs/lab-07-container-queries/README" },
            { text: "08. Ancrage et popover", link: "/labs/lab-08-ancrage-et-popover/README" },
            { text: "09. Couleur et contraste", link: "/labs/lab-09-couleur-et-contraste/README" },
            {
              text: "10. Mouvement respectueux",
              link: "/labs/lab-10-mouvement-respectueux/README",
            },
            { text: "11. Carrousel accessible", link: "/labs/lab-11-carrousel-accessible/README" },
            { text: "12. Formulaire natif", link: "/labs/lab-12-formulaire-natif/README" },
            { text: "13. Patterns manquants", link: "/labs/lab-13-patterns-manquants/README" },
            {
              text: "14. Web component accessible",
              link: "/labs/lab-14-web-component-accessible/README",
            },
          ],
        },
      ],
    },

    outline: { level: [2, 3], label: "Sur cette page" },
    docFooter: { prev: "Précédent", next: "Suivant" },
  },
});
