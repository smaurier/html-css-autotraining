// Oracle du lab 07.
//
// L'assertion centrale est faite à VIEWPORT CONSTANT : deux exemplaires du même composant
// doivent se présenter différemment parce que leurs conteneurs diffèrent. Aucune media query
// ne peut satisfaire cela, et c'est exactement ce qui la distingue d'une container query.
// Module 08 § 2.

import { test, expect, type Page } from "@playwright/test";
import { ouvrirLab } from "../../outils/lab";

const LAB = "lab-07-container-queries";

async function feuille(page: Page, cible: string) {
  const reponse = await page.request.get(`/${LAB}/${cible}/style.css`);
  expect(reponse.status(), "style.css doit exister").toBe(200);
  return (await reponse.text()).replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Côte à côte ou empilé, mesuré sur la géométrie réelle plutôt que sur le CSS. */
async function disposition(page: Page, selecteurCarte: string) {
  return page.locator(selecteurCarte).evaluate((carte) => {
    const media = carte.querySelector(".carte-media")!.getBoundingClientRect();
    const texte = carte.querySelector(".carte-texte")!.getBoundingClientRect();
    return media.right <= texte.left + 1 ? "cote-a-cote" : "empile";
  });
}

test.describe("Container queries", () => {
  test("le composant déclare un conteneur de taille et une requête", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = await feuille(page, cible);

    expect(css, "sans container-type, la requête ne s'applique jamais, et en silence").toMatch(
      /container-type\s*:\s*(inline-size|size)/,
    );
    expect(css, "il faut une règle @container").toMatch(/@container/);
  });

  test("à viewport constant, les deux exemplaires se présentent différemment", async ({ page }, infos) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await ouvrirLab(page, infos, LAB);

    const large = await disposition(page, "#carte-large");
    const etroite = await disposition(page, "#carte-etroite");

    expect(large, "dans la zone principale, la carte a la place de se mettre en deux colonnes").toBe(
      "cote-a-cote",
    );
    expect(
      etroite,
      "dans la barre latérale de 14rem, la carte doit s'empiler. Si elle est côte à côte, c'est l'écran qui décide, donc une media query",
    ).toBe("empile");
  });

  test("le composant ne regarde plus la largeur de l'écran", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = await feuille(page, cible);

    const mediaDeLargeur = css.match(/@media[^{]*\b(min-width|max-width|width)\b[^{]*\{/g) ?? [];
    expect(
      mediaDeLargeur,
      `ce lab se résout sans aucune media query de largeur. Trouvées : ${mediaDeLargeur.join(" | ")}`,
    ).toEqual([]);
  });

  test("la typographie est exprimée en unités de conteneur", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = await feuille(page, cible);
    expect(css, "cqi mesure 1 % du conteneur, vw mesure l'écran").toMatch(/\d+(\.\d+)?cq[ibwh]/);
  });

  test("le titre est réellement plus petit dans le conteneur étroit", async ({ page }, infos) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await ouvrirLab(page, infos, LAB);

    const taille = async (selecteur: string) =>
      Number.parseFloat(
        await page.locator(`${selecteur} h2`).evaluate((el) => getComputedStyle(el).fontSize),
      );

    const grand = await taille("#carte-large");
    const petit = await taille("#carte-etroite");

    expect(
      petit,
      `le titre mesure ${petit} px dans la barre étroite contre ${grand} px dans la zone large : avec des unités de conteneur, il doit être plus petit`,
    ).toBeLessThan(grand);
  });

  test("10.11 (AA) : à 320 px, aucun défilement horizontal, et la carte est empilée", async ({ page }, infos) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await ouvrirLab(page, infos, LAB);

    const doc = await page.evaluate(() => ({
      contenu: document.documentElement.scrollWidth,
      visible: document.documentElement.clientWidth,
    }));
    expect(
      doc.contenu,
      `défilement horizontal à 320 px (${doc.contenu} px de contenu) : les pistes de la page doivent pouvoir rétrécir`,
    ).toBeLessThanOrEqual(doc.visible + 1);

    expect(await disposition(page, "#carte-large"), "à 320 px, même la carte principale s'empile").toBe(
      "empile",
    );
  });
});
