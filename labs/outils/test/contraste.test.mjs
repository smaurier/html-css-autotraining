// Oracle du calcul de contraste. `node --test outils/test/contraste.test.mjs` depuis labs/.
import { test } from "node:test";
import assert from "node:assert/strict";

import { ratioContraste, luminanceRelative, verdictContraste } from "../contraste.mjs";

test("luminanceRelative vaut 0 pour le noir et 1 pour le blanc", () => {
  assert.equal(luminanceRelative("rgb(0, 0, 0)"), 0);
  assert.equal(luminanceRelative("rgb(255, 255, 255)"), 1);
});

test("ratioContraste noir sur blanc vaut 21", () => {
  assert.equal(Math.round(ratioContraste("rgb(0,0,0)", "rgb(255,255,255)") * 10) / 10, 21);
});

test("ratioContraste est symétrique", () => {
  const a = ratioContraste("rgb(10,20,30)", "rgb(200,200,200)");
  const b = ratioContraste("rgb(200,200,200)", "rgb(10,20,30)");
  assert.equal(a, b);
});

test("ratioContraste accepte la notation hexadécimale, longue et courte", () => {
  const reference = ratioContraste("rgb(0,0,0)", "rgb(255,255,255)");
  assert.equal(ratioContraste("#000000", "#ffffff"), reference);
  assert.equal(ratioContraste("#000", "#fff"), reference);
});

test("ratioContraste accepte rgba en ignorant l'alpha, et le dit dans le nom de la fonction", () => {
  // L'alpha est ignoré volontairement : le ratio réel dépend de ce qui est DERRIÈRE,
  // que seule la page connaît. Mieux vaut un chiffre sur les couleurs opaques qu'un
  // chiffre faux sur une transparence supposée.
  assert.equal(ratioContraste("rgba(0,0,0,0.5)", "#fff"), ratioContraste("#000", "#fff"));
});

test("ratioContraste refuse une couleur illisible au lieu de rendre un chiffre faux", () => {
  assert.throws(() => ratioContraste("color-mix(in oklch, red, blue)", "#fff"), /illisible/);
  assert.throws(() => ratioContraste("oklch(70% 0.1 250)", "#fff"), /illisible/);
  assert.throws(() => ratioContraste("", "#fff"), /illisible/);
});

test("le gris moyen sur blanc est sous le seuil de texte normal", () => {
  const r = ratioContraste("#777777", "#ffffff");
  assert.ok(r > 4 && r < 4.5, `attendu entre 4 et 4,5 ; obtenu ${r}`);
});

test("verdictContraste applique les seuils du referentiel", () => {
  assert.deepEqual(verdictContraste(4.6, { agrandi: false }), { conforme: true, seuil: 4.5 });
  assert.deepEqual(verdictContraste(4.4, { agrandi: false }), { conforme: false, seuil: 4.5 });
  assert.deepEqual(verdictContraste(3.1, { agrandi: true }), { conforme: true, seuil: 3 });
  assert.deepEqual(verdictContraste(2.9, { nonTextuel: true }), { conforme: false, seuil: 3 });
});
