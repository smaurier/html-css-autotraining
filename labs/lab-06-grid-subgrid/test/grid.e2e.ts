// Oracle du lab 06. Il mesure l'alignement RÉEL entre cartes et le débordement. Module 06.

import { test, expect } from "@playwright/test";
import { ouvrirLab } from "../../outils/lab";

const LAB = "lab-06-grid-subgrid";

test.describe("Grid et subgrid", () => {
  test("les boutons des trois cartes sont alignés entre eux", async ({ page }, infos) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await ouvrirLab(page, infos, LAB);

    const y = await page.locator(".carte-action").evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().top)),
    );

    expect(y.length, "les trois cartes doivent être présentes").toBe(3);
    const ecart = Math.max(...y) - Math.min(...y);
    expect(
      ecart,
      `les boutons sont décalés de ${ecart} px : chaque carte a sa grille interne au lieu d'hériter des lignes du parent`,
    ).toBeLessThanOrEqual(2);
  });

  test("aucun débordement horizontal, malgré un mot plus long que la colonne", async ({ page }, infos) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await ouvrirLab(page, infos, LAB);

    const doc = await page.evaluate(() => ({
      contenu: document.documentElement.scrollWidth,
      visible: document.documentElement.clientWidth,
    }));

    expect(
      doc.contenu,
      `la page déborde (${doc.contenu} px) : « 1fr » vaut minmax(auto, 1fr), donc la piste refuse de rétrécir`,
    ).toBeLessThanOrEqual(doc.visible + 1);
  });

  test("les colonnes sont déclarées en minmax(0, 1fr)", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = (await (await page.request.get(`/${LAB}/${cible}/style.css`)).text()).replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );

    expect(
      css,
      "l'écriture sûre est minmax(0, 1fr) : « 1fr » nu laisse le contenu imposer un minimum",
    ).toMatch(/minmax\(\s*0\s*,\s*1fr\s*\)/);
  });

  test("l'alignement entre cartes passe par subgrid, pas par une hauteur fixe", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = (await (await page.request.get(`/${LAB}/${cible}/style.css`)).text()).replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );

    expect(css, "les lignes de la carte doivent être celles du parent").toMatch(/grid-template-rows\s*:\s*subgrid/);
    expect(
      css,
      "une sous-grille doit occuper plusieurs pistes du parent, sinon elle n'a rien à hériter",
    ).toMatch(/grid-row\s*:\s*span\s*\d/);
  });

  test("10.11 (AA) : à 320 px, une seule colonne et aucun défilement horizontal", async ({ page }, infos) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await ouvrirLab(page, infos, LAB);

    const doc = await page.evaluate(() => ({
      contenu: document.documentElement.scrollWidth,
      visible: document.documentElement.clientWidth,
    }));
    expect(doc.contenu, "défilement horizontal à 320 px").toBeLessThanOrEqual(doc.visible + 1);

    const x = await page.locator(".carte").evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().left)),
    );
    expect(new Set(x).size, "à 320 px, les cartes doivent être empilées, donc toutes au même x").toBe(1);
  });
});
