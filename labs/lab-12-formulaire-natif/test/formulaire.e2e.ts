// Oracle du lab 12. Le thème 11 au complet, plus 7.5. Module 14.

import { test, expect, type Page } from "@playwright/test";
import { ouvrirLab, violationsAxe } from "../../outils/lab";

const LAB = "lab-12-formulaire-natif";

async function feuille(page: Page, cible: string) {
  return (await (await page.request.get(`/${LAB}/${cible}/style.css`)).text()).replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
}

test.describe("Formulaire natif", () => {
  test("11.1 (A) : chaque champ a une étiquette visible et reliée", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const sansEtiquette = await page.locator("input[type=email], input[type=text]").evaluateAll((champs) =>
      champs
        .filter((champ) => {
          const parId = champ.id ? document.querySelector(`label[for="${champ.id}"]`) : null;
          const englobante = champ.closest("label");
          return !parId && !englobante;
        })
        .map((champ) => champ.id || champ.getAttribute("name") || "?"),
    );

    expect(
      sansEtiquette,
      `champs sans étiquette : ${sansEtiquette.join(", ")}. Un placeholder ne nomme rien.`,
    ).toEqual([]);
  });

  test("11.1 (A) : aucun placeholder ne remplace une étiquette", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const avecPlaceholder = await page
      .locator("input[placeholder]")
      .evaluateAll((champs) => champs.map((c) => c.getAttribute("placeholder") ?? ""));

    expect(
      avecPlaceholder,
      "le placeholder disparaît à la saisie et son contraste est faible : il n'est pas une étiquette",
    ).toEqual([]);
  });

  test("le style d'erreur n'apparaît qu'après interaction", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = await feuille(page, cible);

    expect(
      css,
      ":invalid est vrai dès le chargement : tous les champs obligatoires seraient rouges avant toute saisie",
    ).not.toMatch(/input:invalid|:invalid\s*\{/);
    expect(css, ":user-invalid ne devient vrai qu'après interaction").toMatch(/:user-invalid/);
  });

  test("11.13 (AA) : les champs de données personnelles portent un autocomplete", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const courriel = await page.locator("#courriel").getAttribute("autocomplete");
    const cp = await page.locator("#cp").getAttribute("autocomplete");

    expect(courriel, "autocomplete=email attendu").toBe("email");
    expect(cp, "autocomplete=postal-code attendu").toBe("postal-code");
  });

  test("11.5 (A) : les boutons radio sont regroupés avec une légende", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const groupe = page.getByRole("group", { name: /mode de contact/i });
    await expect(
      groupe,
      "sans fieldset et legend, le lecteur annonce « Courriel, bouton radio » sans dire de quoi il s'agit",
    ).toHaveCount(1);
  });

  test("11.10 (A) : l'aide est reliée au champ, et le format est indiqué", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    for (const id of ["courriel", "cp"]) {
      const decritPar = await page.locator(`#${id}`).getAttribute("aria-describedby");
      expect(decritPar, `#${id} doit être relié à son aide par aria-describedby`).toBeTruthy();

      const texteAide = await page
        .locator(`#${decritPar!.split(" ")[0]}`)
        .textContent();
      expect(texteAide?.toLowerCase(), "l'aide doit indiquer le format attendu").toContain("exemple");
    }
  });

  test("11.10 (A) : la signification de l'étoile est expliquée avant le formulaire", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const positions = await page.evaluate(() => {
      const mention = [...document.querySelectorAll("p")].find((p) =>
        /obligatoire/i.test(p.textContent ?? ""),
      );
      const formulaire = document.querySelector("#formulaire")!;
      if (!mention) return null;
      return {
        avant: mention.compareDocumentPosition(formulaire) & Node.DOCUMENT_POSITION_FOLLOWING ? true : false,
      };
    });

    expect(positions, "une mention expliquant le marqueur obligatoire doit exister").not.toBeNull();
    expect(
      positions!.avant,
      "la mention doit être AVANT le formulaire : la lire après l'avoir rempli ne sert à rien",
    ).toBe(true);
  });

  test("11.11 (AA) et 7.5 (AA) : à la soumission, un résumé compte les erreurs et prend le focus", async ({
    page,
  }, infos) => {
    await ouvrirLab(page, infos, LAB);

    await page.getByRole("button", { name: "Envoyer" }).click();
    await page.waitForTimeout(200);

    const resume = page.locator('[role="alert"]');
    await expect(resume, "il faut une région qui annonce les erreurs").toHaveCount(1);
    await expect(resume).toBeVisible();

    const texte = (await resume.textContent())!;
    expect(texte, "le résumé doit dire COMBIEN d'erreurs il y a").toMatch(/\d+\s*erreur/i);
    expect(texte.toLowerCase(), "chaque message doit donner un exemple réel de saisie").toContain("exemple");

    const focusId = await page.evaluate(() => document.activeElement?.id ?? "");
    expect(
      focusId,
      "le focus va sur le résumé, pas sur le premier champ : il faut d'abord savoir combien d'erreurs corriger",
    ).toBe("resume-erreurs");
  });

  test("le message est relié au champ, et aria-invalid est posé puis retiré", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    await page.getByRole("button", { name: "Envoyer" }).click();
    await page.waitForTimeout(200);

    await expect(page.locator("#courriel"), "aria-invalid doit être posé").toHaveAttribute(
      "aria-invalid",
      "true",
    );

    const decritPar = (await page.locator("#courriel").getAttribute("aria-describedby")) ?? "";
    expect(decritPar, "le message d'erreur doit être relié au champ").toContain("err-courriel");

    await page.locator("#courriel").fill("alondra@exemple.fr");
    await page.locator("#cp").fill("69100");
    await page.getByRole("radio", { name: "Courriel" }).check();
    await page.getByRole("button", { name: "Envoyer" }).click();
    await page.waitForTimeout(200);

    const encoreInvalide = await page.locator("#courriel").getAttribute("aria-invalid");
    expect(
      encoreInvalide,
      "aria-invalid doit être RETIRÉ quand le champ redevient valide, pas seulement posé une fois",
    ).toBeNull();
  });

  test("axe ne trouve aucune violation, avant et après soumission", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    let violations = await violationsAxe(page);
    expect(violations, JSON.stringify(violations, null, 1)).toEqual([]);

    await page.getByRole("button", { name: "Envoyer" }).click();
    await page.waitForTimeout(200);
    violations = await violationsAxe(page);
    expect(violations, JSON.stringify(violations, null, 1)).toEqual([]);
  });
});
