// Oracle du lab 10.
//
// L'assertion centrale est mesurée sous ÉMULATION de prefers-reduced-motion : l'élément ne
// doit pas se déplacer, pas se déplacer vite. Module 12 § 4.2.

import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { ouvrirLab } from "../../outils/lab";

const LAB = "lab-10-mouvement-respectueux";

async function feuille(page: Page, cible: string) {
  const reponse = await page.request.get(`/${LAB}/${cible}/style.css`);
  expect(reponse.status()).toBe(200);
  return (await reponse.text()).replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Position verticale d'un élément, juste après le chargement puis une fois stabilisée. */
async function deplacementAuChargement(page: Page, infos: TestInfo) {
  await ouvrirLab(page, infos, LAB);
  const tot = (await page.locator("#carte-3").boundingBox())!.y;
  await page.waitForTimeout(1200);
  const tard = (await page.locator("#carte-3").boundingBox())!.y;
  return Math.abs(tard - tot);
}

test.describe("Mouvement respectueux", () => {
  test("sans préférence, l'animation d'entrée déplace bien les cartes", async ({ page }, infos) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const deplacement = await deplacementAuChargement(page, infos);

    expect(
      deplacement,
      "sans préférence, l'animation doit exister : sinon ce lab ne prouve rien",
    ).toBeGreaterThan(5);
  });

  test("sous préférence réduite, les cartes NE SE DÉPLACENT PAS", async ({ page }, infos) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const deplacement = await deplacementAuChargement(page, infos);

    expect(
      deplacement,
      `la carte s'est déplacée de ${deplacement.toFixed(1)} px sous préférence réduite. Réduire la durée ne protège de rien : il faut supprimer le déplacement et garder le fondu.`,
    ).toBeLessThanOrEqual(1);
  });

  test("le hack de durée globale n'est pas utilisé", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = await feuille(page, cible);

    expect(
      css,
      "animation-duration: 0.01ms !important sur * est le contournement qui ne protège de rien",
    ).not.toMatch(/animation-duration\s*:\s*0\.0*1m?s/);
  });

  test("l'animation liée au défilement est coupée sous préférence réduite", async ({ page }, infos) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await ouvrirLab(page, infos, LAB);

    const timeline = await page
      .locator("#progression")
      .evaluate((el) => getComputedStyle(el).animationTimeline);

    expect(
      timeline,
      `animation-timeline vaut « ${timeline} » : une animation pilotée par le défilement doit être coupée, c'est l'une des trois lignes qu'on oublie`,
    ).toBe("none");
  });

  test("le défilement animé est désactivé sous préférence réduite", async ({ page }, infos) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await ouvrirLab(page, infos, LAB);

    const comportement = await page
      .locator("html")
      .evaluate((el) => getComputedStyle(el).scrollBehavior);

    expect(
      comportement,
      "scroll-behavior: smooth est du mouvement non demandé : il faut revenir à auto",
    ).toBe("auto");
  });

  test("les transitions de vue sont neutralisées sous préférence réduite", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = await feuille(page, cible);

    expect(
      css,
      "la troisième ligne oubliée : ::view-transition-* doit être neutralisé dans le bloc de préférence réduite",
    ).toMatch(/::view-transition-(group|old|new)/);
  });

  test("une animation de remplacement, sans déplacement, est définie", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = await feuille(page, cible);

    const blocReduit = css.match(/@media[^{]*prefers-reduced-motion[^{]*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    expect(blocReduit, "il faut un bloc prefers-reduced-motion").not.toBe("");
    expect(
      blocReduit,
      "sous préférence réduite, la carte doit recevoir une AUTRE animation, pas la même raccourcie",
    ).toMatch(/animation\s*:/);
  });

  test("sous préférence réduite, le fondu reste : on garde l'information", async ({ page }, infos) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await ouvrirLab(page, infos, LAB);
    await page.waitForTimeout(600);

    const opacite = await page.locator("#carte-3").evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(
      opacite,
      "après l'animation, la carte doit être pleinement visible : on supprime le mouvement, pas le contenu",
    ).toBeGreaterThan(0.99);
  });
});
