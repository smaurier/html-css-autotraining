// Oracle du lab 03. Il vérifie trois choses qu'une custom property non enregistrée ne peut
// pas faire : être validée, être interpolée, et avoir un vrai repli. Module 03 § 2.

import { test, expect } from "@playwright/test";
import { ouvrirLab } from "../../outils/lab";

const LAB = "lab-03-tokens-types";
const PRIMAIRE = "rgb(11, 95, 255)";

/** Les règles @property réellement enregistrées par le navigateur, lues dans le CSSOM. */
async function proprietesEnregistrees(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const trouvees: Array<{ nom: string; syntaxe: string; herite: string; initiale: string }> = [];
    for (const feuille of [...document.styleSheets]) {
      let regles: CSSRuleList;
      try {
        regles = feuille.cssRules;
      } catch {
        continue;
      }
      for (const regle of [...regles]) {
        if (regle.constructor.name === "CSSPropertyRule") {
          const r = regle as CSSRule & {
            name: string;
            syntax: string;
            inherits: boolean;
            initialValue: string | null;
          };
          trouvees.push({
            nom: r.name,
            syntaxe: r.syntax,
            herite: String(r.inherits),
            initiale: r.initialValue ?? "",
          });
        }
      }
    }
    return trouvees;
  });
}

test.describe("Des tokens typés", () => {
  test("--accent et --angle sont enregistrées avec une syntaxe", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const enregistrees = await proprietesEnregistrees(page);
    const noms = enregistrees.map((p) => p.nom);

    expect(noms, "aucune @property déclarée : rien ne sera ni validé ni animable").toContain("--accent");
    expect(noms).toContain("--angle");

    const accent = enregistrees.find((p) => p.nom === "--accent")!;
    expect(accent.syntaxe, "--accent doit être typée en couleur").toMatch(/<color>/);

    const angle = enregistrees.find((p) => p.nom === "--angle")!;
    expect(angle.syntaxe, "--angle doit être typée en angle, sinon pas d'interpolation").toMatch(/<angle>/);
  });

  test("une valeur invalide est REJETÉE au lieu de casser la couleur", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const avant = await page.locator("#badge").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(avant, "le badge doit partir de la couleur primaire").toBe(PRIMAIRE);

    const apres = await page.locator("#badge").evaluate((el) => {
      el.style.setProperty("--accent", "pasunecouleur");
      return getComputedStyle(el).backgroundColor;
    });

    // Sans @property : « invalide au moment du calcul », donc la couleur part à l'héritage.
    // Avec @property : l'affectation est refusée, et la couleur tient. Module 03 § 1.1.
    expect(
      apres,
      "une valeur invalide doit être refusée, pas faire disparaître la couleur",
    ).toBe(PRIMAIRE);
  });

  test("--angle s'interpole réellement pendant la transition", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const carte = page.locator("#carte");
    const depart = await carte.evaluate((el) => getComputedStyle(el).getPropertyValue("--angle").trim());
    expect(depart, "la valeur de départ doit être normalisée par le navigateur").toBe("0deg");

    await page.getByRole("button", { name: /dégradé/i }).click();
    await page.waitForTimeout(200);

    const milieu = await carte.evaluate((el) =>
      Number.parseFloat(getComputedStyle(el).getPropertyValue("--angle")),
    );

    expect(
      milieu,
      `à 200 ms d'une transition de 600 ms, --angle devrait être entre les deux bornes, et vaut ${milieu}`,
    ).toBeGreaterThan(0);
    expect(milieu).toBeLessThan(180);
  });

  test("la transition arrive bien à destination", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.getByRole("button", { name: /dégradé/i }).click();
    await page.waitForTimeout(800);

    const final = await page
      .locator("#carte")
      .evaluate((el) => Number.parseFloat(getComputedStyle(el).getPropertyValue("--angle")));
    expect(final).toBe(180);
  });

  test("10.2 (A) : aucune information n'est insérée par content", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = await (await page.request.get(`/${LAB}/${cible}/style.css`)).text();
    const sansCommentaires = css.replace(/\/\*[\s\S]*?\*\//g, "");

    const contenus = [...sansCommentaires.matchAll(/content\s*:\s*([^;}]+)/g)].map((m) => m[1].trim());
    const porteursDeSens = contenus.filter((c) => !/^(""|''|none|normal)$/.test(c));

    expect(
      porteursDeSens,
      "une information insérée en CSS disparaît feuilles de style désactivées",
    ).toEqual([]);
  });
});
