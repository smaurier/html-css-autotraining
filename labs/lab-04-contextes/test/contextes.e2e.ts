// Oracle du lab 04. Il mesure de la GÉOMÉTRIE et de l'ORDRE RÉEL : ni l'une ni l'autre ne
// se lit dans le code. Module 04.

import { test, expect } from "@playwright/test";
import { ouvrirLab, ordreDeTabulation } from "../../outils/lab";

const LAB = "lab-04-contextes";

test.describe("Contextes et géométrie", () => {
  test("le badge est positionné dans sa carte, pas dans le viewport", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const carte = (await page.locator("#carte").boundingBox())!;
    const badge = (await page.locator("#badge").boundingBox())!;

    expect(badge.y, "le badge doit être DANS la carte verticalement").toBeGreaterThanOrEqual(carte.y - 1);
    expect(badge.y + badge.height).toBeLessThanOrEqual(carte.y + carte.height + 1);
    expect(badge.x, "et dans la carte horizontalement").toBeGreaterThanOrEqual(carte.x - 1);
    expect(
      badge.x + badge.width,
      "s'il déborde à droite, c'est qu'il se cale sur le viewport : aucun ancêtre n'est positionné",
    ).toBeLessThanOrEqual(carte.x + carte.width + 1);
  });

  test("le panneau passe réellement au-dessus de la carte suivante", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const panneau = (await page.locator("#panneau").boundingBox())!;
    const point = {
      x: panneau.x + panneau.width / 2,
      y: panneau.y + panneau.height - 4,
    };

    const dessus = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.id ?? "",
      point,
    );

    expect(
      dessus,
      "l'élément au point bas du panneau doit être le panneau : un z-index de 9999 ne sert à rien s'il est comparé dans un contexte enfermé",
    ).toBe("panneau");
  });

  test("aucun contexte d'empilement n'est créé par accident", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const opacite = await page.locator("#carte").evaluate((el) => getComputedStyle(el).opacity);
    expect(
      Number(opacite),
      "une opacity inférieure à 1 crée un contexte d'empilement : si elle n'est pas voulue, elle doit partir",
    ).toBe(1);
  });

  test("la marge du premier enfant est contenue sans rien couper", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const bloc = (await page.locator("#bloc").boundingBox())!;
    const interne = (await page.locator(".interne").boundingBox())!;

    expect(
      interne.y,
      "la marge de l'enfant doit rester dans le bloc : le bloc doit créer un contexte de formatage",
    ).toBeGreaterThan(bloc.y);

    const overflow = await page.locator("#bloc").evaluate((el) => getComputedStyle(el).overflow);
    expect(
      overflow,
      "overflow: hidden contiendrait la marge mais couperait les halos de focus (10.7). display: flow-root fait le travail sans couper",
    ).toBe("visible");
  });

  test("12.8 (A) : l'ordre de tabulation suit l'ordre visuel", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const positions = await page.locator("#actions button").evaluateAll((boutons) =>
      boutons.map((b) => ({ id: b.id, x: b.getBoundingClientRect().x })),
    );

    const arrets = await ordreDeTabulation(page);
    const ordreClavier = arrets
      .map((a) => a.nom.toLowerCase())
      .filter((nom) => nom === "valider" || nom === "annuler");

    const ordreVisuel = [...positions].sort((a, b) => a.x - b.x).map((p) => p.id);

    expect(
      ordreClavier,
      `le clavier parcourt ${JSON.stringify(ordreClavier)} alors que l'œil lit ${JSON.stringify(ordreVisuel)}`,
    ).toEqual(ordreVisuel);
  });

  test("la divergence n'a pas été réglée avec un order ou un tabindex positif", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);

    const css = (await (await page.request.get(`/${LAB}/${cible}/style.css`)).text()).replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );
    expect(css, "`order` déplace l'œil sans déplacer le clavier").not.toMatch(/(^|[^-\w])order\s*:/);

    const tabindexPositifs = await page
      .locator("[tabindex]")
      .evaluateAll((els) => els.map((e) => Number(e.getAttribute("tabindex"))).filter((n) => n > 0));
    expect(tabindexPositifs, "un tabindex positif déplace le problème, il ne le règle pas").toEqual([]);
  });
});
