// Oracle du lab 09.
//
// Les ratios sont calculés sur les couleurs CALCULÉES par le navigateur, et vérifiés dans
// les DEUX thèmes. Un site testé uniquement dans les réglages de la machine du développeur
// n'a jamais été testé dans l'autre. Module 10 § 4, module 08 § 4.

import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { ouvrirLab, ratioAvecFond, verdictContraste, ratioContraste } from "../../outils/lab";

const LAB = "lab-09-couleur-et-contraste";

async function dansLesDeuxThemes(
  page: Page,
  infos: TestInfo,
  verifier: (theme: "light" | "dark") => Promise<void>,
) {
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await ouvrirLab(page, infos, LAB);
    await verifier(theme);
  }
}

test.describe("Couleur et contraste", () => {
  test("3.2 (AA) : le texte principal tient 4,5:1 dans les deux thèmes", async ({ page }, infos) => {
    await dansLesDeuxThemes(page, infos, async (theme) => {
      const { ratio, texte, fond } = await ratioAvecFond(page.locator("#nom-ok"));
      const { conforme, seuil } = verdictContraste(ratio);
      expect(
        conforme,
        `thème ${theme} : ${texte} sur ${fond} donne ${ratio.toFixed(2)}:1, seuil ${seuil}`,
      ).toBe(true);
    });
  });

  test("3.2 (AA) : le texte secondaire tient 4,5:1 dans les deux thèmes", async ({ page }, infos) => {
    await dansLesDeuxThemes(page, infos, async (theme) => {
      const { ratio, texte, fond } = await ratioAvecFond(page.locator("#secondaire"));
      expect(
        verdictContraste(ratio).conforme,
        `thème ${theme} : ${texte} sur ${fond} donne ${ratio.toFixed(2)}:1. Un gris « discret » est le piège le plus fréquent.`,
      ).toBe(true);
    });
  });

  test("3.2 (AA) : l'avertissement tient 4,5:1 dans les deux thèmes", async ({ page }, infos) => {
    await dansLesDeuxThemes(page, infos, async (theme) => {
      const { ratio, texte, fond } = await ratioAvecFond(page.locator("#avertissement"));
      expect(
        verdictContraste(ratio).conforme,
        `thème ${theme} : ${texte} sur ${fond} donne ${ratio.toFixed(2)}:1`,
      ).toBe(true);
    });
  });

  test("3.2 (AA) : le texte du bouton tient sur son propre fond", async ({ page }, infos) => {
    await dansLesDeuxThemes(page, infos, async (theme) => {
      const { ratio, texte, fond } = await ratioAvecFond(page.locator("#bouton"));
      expect(
        verdictContraste(ratio).conforme,
        `thème ${theme} : ${texte} sur ${fond} donne ${ratio.toFixed(2)}:1`,
      ).toBe(true);
    });
  });

  test("3.3 (AA) : la bordure du champ tient 3:1, dans les deux thèmes", async ({ page }, infos) => {
    await dansLesDeuxThemes(page, infos, async (theme) => {
      const couleurs = await page.locator("#recherche").evaluate((el) => {
        const s = getComputedStyle(el);
        let parent: Element | null = el.parentElement;
        let fond = s.backgroundColor;
        while (parent && /^rgba\(.*,\s*0\)$/.test(fond)) {
          fond = getComputedStyle(parent).backgroundColor;
          parent = parent.parentElement;
        }
        return { bordure: s.borderTopColor, fond };
      });

      const ratio = ratioContraste(couleurs.bordure, couleurs.fond);
      const { conforme, seuil } = verdictContraste(ratio, { nonTextuel: true });
      expect(
        conforme,
        `thème ${theme} : bordure ${couleurs.bordure} sur ${couleurs.fond} donne ${ratio.toFixed(2)}:1, seuil ${seuil}. Une bordure de champ est un élément non textuel porteur d'information.`,
      ).toBe(true);
    });
  });

  test("3.1 (A) : l'état n'est pas porté par la seule couleur", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const lignes = await page.locator(".ligne").evaluateAll((els) =>
      els.map((el) => {
        const texte = (el.textContent ?? "").replace(/\s+/g, " ").trim();
        const pastille = el.querySelector(".pastille");
        return {
          texte,
          pastilleCachee: pastille?.getAttribute("aria-hidden") === "true",
        };
      }),
    );

    expect(lignes.length, "les deux ateliers doivent être présents").toBe(2);

    for (const ligne of lignes) {
      expect(
        ligne.texte,
        `« ${ligne.texte} » : l'état doit être écrit, pas seulement coloré. Un texte masqué en CSS ne répond pas au critère, le doublement doit être visible.`,
      ).toMatch(/en service|hors service/i);
      expect(
        ligne.pastilleCachee,
        "la pastille devient décorative dès que le texte porte l'information",
      ).toBe(true);
    }
  });

  test("color-scheme est déclaré, pour que les contrôles natifs suivent", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = (await (await page.request.get(`/${LAB}/${cible}/style.css`)).text()).replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );
    expect(
      css,
      "sans color-scheme, un thème sombre laisse des champs et des listes déroulantes clairs",
    ).toMatch(/color-scheme\s*:\s*[^;]*dark/);
  });

  test("le thème sombre n'est pas une inversion brutale", async ({ page }, infos) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await ouvrirLab(page, infos, LAB);

    const fond = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    const luminance = await page.evaluate((f) => {
      const [r, g, b] = f.match(/\d+/g)!.map(Number);
      return (r + g + b) / 3;
    }, fond);

    expect(
      luminance,
      `le fond sombre vaut ${fond} : un noir pur est fatigant, un gris très sombre est préférable. Module 10 § 3.`,
    ).toBeGreaterThan(8);
  });
});
