// Oracle du lab 02. Il interroge le STYLE CALCULÉ, pas la feuille écrite : c'est la seule
// façon de vérifier qui gagne réellement dans la cascade.

import { test, expect } from "@playwright/test";
import { ouvrirLab } from "../../outils/lab";

const LAB = "lab-02-cascade-domptee";
const PRIMAIRE = "rgb(11, 95, 255)";

async function feuille(page: import("@playwright/test").Page, cible: string) {
  const reponse = await page.request.get(`/${LAB}/${cible}/style.css`);
  expect(reponse.status(), "style.css doit exister").toBe(200);
  return reponse.text();
}

/**
 * Les commentaires sont retirés avant toute recherche dans la feuille.
 *
 * Sans cela, l'oracle compte le mot « !important » écrit dans un commentaire qui explique
 * précisément qu'on n'en a plus besoin, et il échoue sur du code juste. Un oracle doit
 * mesurer ce qu'il prétend mesurer.
 */
function sansCommentaires(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

test.describe("La cascade domptée", () => {
  test("aucun !important ne subsiste", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = sansCommentaires(await feuille(page, cible));
    const occurrences = css.match(/!\s*important/g) ?? [];
    expect(
      occurrences,
      `${occurrences.length} !important restants : la cascade n'est pas domptée, elle est forcée`,
    ).toEqual([]);
  });

  test("l'ordre des couches est déclaré explicitement, en une fois", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = sansCommentaires(await feuille(page, cible));
    expect(css, "une déclaration @layer a, b, c; doit fixer l'ordre").toMatch(
      /@layer\s+[a-z-]+\s*(,\s*[a-z-]+\s*){1,}\s*;/i,
    );
  });

  test("le bouton primaire est primaire, même dans une carte", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const dansLaCarte = page.locator(".carte .actions .bouton-primaire");
    await expect(
      dansLaCarte,
      "un sélecteur très spécifique ne doit plus pouvoir repeindre le bouton primaire",
    ).toHaveCSS("background-color", PRIMAIRE);
    await expect(dansLaCarte).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("le bouton secondaire garde le style de base", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const secondaire = page.locator(".carte .actions .bouton:not(.bouton-primaire)");
    const fond = await secondaire.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(fond, "le secondaire ne doit pas être peint en primaire").not.toBe(PRIMAIRE);
  });

  test("l'utilitaire l'emporte sans !important", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await expect(
      page.locator(".note.cache"),
      "la couche utilitaires est la dernière déclarée, donc la plus forte",
    ).toBeHidden();
  });

  test("le reset est surchargeable : :where() a une spécificité nulle", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = sansCommentaires(await feuille(page, cible));
    expect(
      css,
      "le reset doit utiliser :where() pour rester surchargeable (module 02 § 3.1)",
    ).toMatch(/:where\(/);
  });

  test("10.7 (A) : l'indicateur de focus survit à la réorganisation", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const bouton = page.getByRole("button", { name: "Retirer" });
    await bouton.focus();
    const contour = await bouton.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, largeur: Number.parseFloat(s.outlineWidth) || 0 };
    });
    expect(contour.style, "le focus doit rester visible").not.toBe("none");
    expect(contour.largeur).toBeGreaterThan(0);
  });
});
