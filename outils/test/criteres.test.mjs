// Oracle de l'audit de couverture RGAA.
// `node --test outils/test/criteres.test.mjs` depuis 25-html-css.
import { test } from "node:test";
import assert from "node:assert/strict";

import { criteresCites, matriceCouverture, rendreMarkdownRgaa } from "../criteres.mjs";

test("criteresCites capte un critère cité avec son niveau", () => {
  const texte = "le critère `11.1 (A)` exige une étiquette, et `3.2 (AA)` le contraste";
  assert.deepEqual(criteresCites(texte).sort(), ["11.1", "3.2"]);
});

test("criteresCites ne confond pas un numéro de version avec un critère", () => {
  assert.deepEqual(criteresCites("TypeScript 5.2 et Node 24.1 sont installés"), []);
});

test("criteresCites ne capte pas un numéro de section du cours", () => {
  assert.deepEqual(criteresCites("voir § 2.1 et le module 10.2 du plan"), []);
});

test("criteresCites dédoublonne", () => {
  assert.deepEqual(criteresCites("`9.1 (A)` puis encore `9.1 (A)`"), ["9.1"]);
});

test("criteresCites accepte une plage écrite en clair", () => {
  // « tout le thème 11, soit 11.1 à 11.13 » ne doit pas inventer les intermédiaires :
  // seules les citations explicitement niveautées comptent.
  assert.deepEqual(criteresCites("tout le thème 11, soit 11.1 à 11.13"), []);
});

test("matriceCouverture liste les critères qu'aucun module ne cite", () => {
  const reference = { "1.1": {}, "9.1": {}, "4.3": {} };
  const parModule = { "01": ["1.1", "9.1"] };
  const m = matriceCouverture(reference, parModule);
  assert.deepEqual(m.nonCouverts, ["4.3"]);
  assert.deepEqual(m.couverts["1.1"], ["01"]);
});

test("matriceCouverture signale un critère cité mais absent de la référence", () => {
  const m = matriceCouverture({ "1.1": {} }, { "01": ["1.1", "99.9"] });
  assert.deepEqual(m.inconnus, ["99.9"]);
});

test("matriceCouverture rend la liste des modules quand plusieurs citent le même critère", () => {
  const m = matriceCouverture({ "10.7": {} }, { "09": ["10.7"], 16: ["10.7"] });
  assert.deepEqual(m.couverts["10.7"], ["09", "16"]);
});

test("rendreMarkdownRgaa compte, et n'escamote pas les non couverts", () => {
  const reference = {
    "1.1": { sujet: "Alternative", theme: "Images" },
    "4.3": { sujet: "Sous-titres", theme: "Multimédia" },
  };
  const md = rendreMarkdownRgaa(matriceCouverture(reference, { "01": ["1.1"] }), reference);
  assert.match(md, /1 \/ 2 critères cités/);
  assert.match(md, /## Critères cités par aucun module \(1\)/);
  assert.match(md, /`4\.3`/);
});

test("rendreMarkdownRgaa alerte en tête quand un critère inconnu est cité", () => {
  const md = rendreMarkdownRgaa(
    matriceCouverture({ "1.1": {} }, { "01": ["1.1", "42.7"] }),
    { "1.1": { sujet: "Alternative", theme: "Images" } },
  );
  assert.match(md, /critère inventé/i);
  assert.match(md, /`42\.7`/);
});

test("les cles de metadonnees du fichier de reference ne sont pas des criteres", () => {
  const reference = { _source: "url", _note: "texte", "1.1": {}, "9.1": {} };
  const m = matriceCouverture(reference, { "01": ["1.1"] });

  assert.deepEqual(m.nonCouverts, ["9.1"], "_source et _note ne doivent pas compter");

  const md = rendreMarkdownRgaa(m, reference);
  assert.match(md, /1 \/ 2 critères cités/);
  assert.doesNotMatch(md, /_source|_note/);
});
