// Oracle de l'outil de couverture. `node --test outils/` depuis 25-html-css.
// RED tant que outils/couverture.mjs ne satisfait pas ces contrats.
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  parserOutline,
  SECTIONS_META,
  construireCouverture,
  rendreMarkdown,
} from "../couverture.mjs";

const OUTLINE_EXEMPLE = `
######################################################
#########              LAYOUT                #########
######################################################

# Un commentaire de section, à ignorer.

- id: layout
  template: feature
  questions:
    - id: subgrid
      yearAdded: 2021
    - id: css_grid_lanes
      yearAdded: 2026
    # - id: feature_retiree
    - id: layout_pain_points
      template: text

- id: other_tools
  questions:
    - id: css_frameworks
      template: multiple
      options:
        - id: tailwind_css
        - id: open_props
          yearAdded: 2026
        - id: na

- id: user_info
  questions:
    - id: age
`;

test("parserOutline rend les sections dans l'ordre du fichier", () => {
  const sections = parserOutline(OUTLINE_EXEMPLE);
  assert.deepEqual(
    sections.map((s) => s.id),
    ["layout", "other_tools", "user_info"],
  );
});

test("parserOutline rattache les questions à leur section", () => {
  const [layout] = parserOutline(OUTLINE_EXEMPLE);
  assert.deepEqual(
    layout.questions.map((q) => q.id),
    ["subgrid", "css_grid_lanes", "layout_pain_points"],
  );
});

test("parserOutline ignore les lignes commentées", () => {
  const sections = parserOutline(OUTLINE_EXEMPLE);
  const ids = sections.flatMap((s) => s.questions.map((q) => q.id));
  assert.ok(!ids.includes("feature_retiree"), "une option commentée ne doit pas être comptée");
});

test("parserOutline capte yearAdded sur une question et sur une option", () => {
  const sections = parserOutline(OUTLINE_EXEMPLE);
  const lanes = sections[0].questions.find((q) => q.id === "css_grid_lanes");
  assert.equal(lanes.yearAdded, 2026);

  const frameworks = sections[1].questions.find((q) => q.id === "css_frameworks");
  const openProps = frameworks.options.find((o) => o.id === "open_props");
  assert.equal(openProps.yearAdded, 2026);
});

test("parserOutline écarte les options de remplissage na et other", () => {
  const sections = parserOutline(OUTLINE_EXEMPLE);
  const frameworks = sections[1].questions.find((q) => q.id === "css_frameworks");
  assert.deepEqual(
    frameworks.options.map((o) => o.id),
    ["tailwind_css", "open_props"],
  );
});

test("SECTIONS_META déclare les sections non techniques", () => {
  assert.ok(SECTIONS_META.includes("user_info"));
  assert.ok(SECTIONS_META.includes("resources"));
});

test("construireCouverture signale un item technique sans module", () => {
  const sections = parserOutline(OUTLINE_EXEMPLE);
  const { lignes, orphelins } = construireCouverture(
    { css2026: sections },
    { subgrid: "06", css_grid_lanes: "06", tailwind_css: "19", open_props: "19" },
  );

  assert.deepEqual(orphelins, [], "tout est mappé dans ce cas");
  assert.equal(lignes.length, 4, "les pain_points et user_info ne comptent pas");
});

test("construireCouverture liste en orphelin ce que le mapping oublie", () => {
  const sections = parserOutline(OUTLINE_EXEMPLE);
  const { orphelins } = construireCouverture({ css2026: sections }, { subgrid: "06" });
  assert.deepEqual(orphelins.sort(), ["css_grid_lanes", "open_props", "tailwind_css"]);
});

test("construireCouverture marque les nouveautés de l'année demandée", () => {
  const sections = parserOutline(OUTLINE_EXEMPLE);
  const { lignes } = construireCouverture(
    { css2026: sections },
    { subgrid: "06", css_grid_lanes: "06", tailwind_css: "19", open_props: "19" },
    { anneeNouveaute: 2026 },
  );
  const nouveaux = lignes.filter((l) => l.nouveau).map((l) => l.item);
  assert.deepEqual(nouveaux.sort(), ["css_grid_lanes", "open_props"]);
});

test("rendreMarkdown produit un tableau et compte les items", () => {
  const sections = parserOutline(OUTLINE_EXEMPLE);
  const couverture = construireCouverture(
    { css2026: sections },
    { subgrid: "06", css_grid_lanes: "06", tailwind_css: "19", open_props: "19" },
    { anneeNouveaute: 2026 },
  );
  const md = rendreMarkdown(couverture, { anneeNouveaute: 2026 });

  assert.match(md, /\| `subgrid` \| layout \| 06 \|/);
  assert.match(md, /4 items techniques/);
  assert.match(md, /css_grid_lanes/);
});

test("rendreMarkdown annonce les orphelins au lieu de les taire", () => {
  const sections = parserOutline(OUTLINE_EXEMPLE);
  const couverture = construireCouverture({ css2026: sections }, { subgrid: "06" });
  const md = rendreMarkdown(couverture, { anneeNouveaute: 2026 });
  assert.match(md, /3 items sans module/);
});

test("parserOutline écarte les échelles numériques, qui sont des réponses et non des sujets", () => {
  const sections = parserOutline(`
- id: accessibility
  questions:
    - id: accessibility_ai_impact
      options:
        - id: 0
        - id: 1
        - id: 4
    - id: tabindex_attribute
`);
  const echelle = sections[0].questions.find((q) => q.id === "accessibility_ai_impact");
  assert.deepEqual(echelle.options, [], "une échelle de Likert ne porte aucun sujet");

  const { lignes } = construireCouverture({ html2026: sections }, { tabindex_attribute: "01" });
  assert.deepEqual(
    lignes.map((l) => l.item),
    ["accessibility_ai_impact", "tabindex_attribute"],
    "la question reste un item, ses graduations non",
  );
});

test("inverserMapping rend un index item -> module depuis un plan lisible par module", async () => {
  const { inverserMapping } = await import("../couverture.mjs");
  const plan = { "06": ["subgrid", "css_grid_lanes"], 19: ["tailwind_css"] };
  assert.deepEqual(inverserMapping(plan), {
    subgrid: "06",
    css_grid_lanes: "06",
    tailwind_css: "19",
  });
});

test("inverserMapping refuse qu'un item soit revendiqué par deux modules", async () => {
  const { inverserMapping } = await import("../couverture.mjs");
  assert.throws(
    () => inverserMapping({ "06": ["subgrid"], "07": ["subgrid"] }),
    /subgrid.*06.*07/s,
    "un item a un seul module de référence, sinon la duplication revient par la fenêtre",
  );
});
