// Oracle du lab 05. Géométrie réelle, à deux largeurs de viewport. Module 05.

import { test, expect } from "@playwright/test";
import { ouvrirLab } from "../../outils/lab";

const LAB = "lab-05-flex";

test.describe("Flex en vérité", () => {
  test("la barre ne déborde pas de son conteneur", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const debordement = await page.locator("#barre").evaluate((el) => ({
      contenu: el.scrollWidth,
      visible: el.clientWidth,
    }));

    expect(
      debordement.contenu,
      `le contenu mesure ${debordement.contenu} px pour ${debordement.visible} px visibles : un élément refuse de rétrécir`,
    ).toBeLessThanOrEqual(debordement.visible + 1);
  });

  test("le titre est tronqué visuellement, et son texte reste complet dans le DOM", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const titre = page.locator("#titre");
    await expect(titre, "la troncature doit être faite par le CSS").toHaveCSS("text-overflow", "ellipsis");

    const texte = (await titre.textContent())!.trim();
    expect(
      texte,
      "le texte complet doit rester dans le DOM : tronquer la chaîne détruirait l'information",
    ).toContain("Gratte-Ciel");
  });

  test("le halo de focus n'est pas coupé par une rustine d'overflow", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const overflowBarre = await page.locator("#barre").evaluate((el) => getComputedStyle(el).overflow);
    expect(
      overflowBarre,
      "overflow: hidden sur la barre coupe les halos de focus de ses boutons, donc met 10.7 (A) en danger",
    ).toBe("visible");
  });

  test("10.7 (A) : le dernier bouton garde un indicateur de focus visible", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const bouton = page.locator("#fin");
    await bouton.focus();
    const contour = await bouton.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, largeur: Number.parseFloat(s.outlineWidth) || 0 };
    });

    expect(contour.style).not.toBe("none");
    expect(contour.largeur).toBeGreaterThan(0);
  });

  test("10.11 (AA) : à 320 px, aucun défilement horizontal", async ({ page }, infos) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await ouvrirLab(page, infos, LAB);

    const document = await page.evaluate(() => ({
      contenu: document.documentElement.scrollWidth,
      visible: document.documentElement.clientWidth,
    }));

    expect(
      document.contenu,
      `à 320 px, la page défile horizontalement (${document.contenu} px de contenu) : il manque un flex-wrap ou un min-inline-size`,
    ).toBeLessThanOrEqual(document.visible + 1);
  });

  test("les quatre éléments de la barre sont tous visibles à 320 px", async ({ page }, infos) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await ouvrirLab(page, infos, LAB);

    for (const nom of ["Modifier", "Partager", "Quitter"]) {
      await expect(page.getByRole("button", { name: nom }), `${nom} doit rester visible`).toBeVisible();
    }
  });
});
