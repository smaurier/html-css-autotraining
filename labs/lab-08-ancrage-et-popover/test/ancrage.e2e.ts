// Oracle du lab 08.
//
// Tout se joue au clavier. Un menu et une modale « marchent » toujours à la souris : c'est
// la raison pour laquelle leurs défauts d'accessibilité survivent si longtemps en
// production. Module 09.

import { test, expect } from "@playwright/test";
import { ouvrirLab, violationsAxe } from "../../outils/lab";

const LAB = "lab-08-ancrage-et-popover";

test.describe("Top layer, popover et dialog", () => {
  test("le menu est un popover de la plateforme, pas une div à z-index", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const estPopover = await page.locator("#menu").evaluate((el) => el.hasAttribute("popover"));
    expect(estPopover, "le menu doit porter l'attribut popover").toBe(true);

    const cable = await page
      .locator("#declencheur-menu")
      .evaluate((el) => el.getAttribute("popovertarget"));
    expect(cable, "le bouton doit être câblé par popovertarget, sans JavaScript de bascule").toBe("menu");
  });

  test("7.1 (A) : aria-expanded suit réellement l'état du menu", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const bouton = page.getByRole("button", { name: "Mon compte" });
    await expect(bouton, "au repos, le menu est fermé").toHaveAttribute("aria-expanded", "false");

    await bouton.click();
    await expect(page.locator("#menu")).toBeVisible();
    await expect(
      bouton,
      "popover n'apporte aucune sémantique : aria-expanded est à maintenir à la main",
    ).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(page.locator("#menu")).toBeHidden();
    await expect(bouton, "après Échap, l'état annoncé doit redevenir faux").toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  test("le menu se ferme par Échap, sans code", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.getByRole("button", { name: "Mon compte" }).click();
    await expect(page.locator("#menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#menu"), "la fermeture légère est fournie par popover").toBeHidden();
  });

  test("la confirmation est un vrai dialog, ouvert en modal", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const balise = await page.locator("#confirmation").evaluate((el) => el.tagName.toLowerCase());
    expect(balise, "une div ne donne ni top layer, ni inertie, ni confinement du focus").toBe("dialog");

    await page.getByRole("button", { name: /Supprimer ce membre/ }).click();

    const estModal = await page.locator("#confirmation").evaluate((el) => el.matches(":modal"));
    expect(estModal, "showModal() est nécessaire : show() n'est pas modal").toBe(true);
  });

  test("7.1 (A) : la boîte de dialogue a un nom accessible", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.getByRole("button", { name: /Supprimer ce membre/ }).click();

    await expect(
      page.getByRole("dialog", { name: /Supprimer ce membre/ }),
      "le rôle dialog est fourni, le nom non : aria-labelledby ou aria-label",
    ).toHaveCount(1);
  });

  test("le focus initial ne tombe pas sur l'action destructrice", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.getByRole("button", { name: /Supprimer ce membre/ }).click();

    const focusId = await page.evaluate(() => document.activeElement?.id ?? "");
    expect(
      focusId,
      "autofocus sur « Supprimer » rend une suppression possible par simple validation",
    ).not.toBe("confirmer");
  });

  test("12.9 (A) : Échap ferme la boîte, et le focus revient à l'invocateur", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const declencheur = page.getByRole("button", { name: /Supprimer ce membre/ });
    await declencheur.click();
    await expect(page.locator("#confirmation")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator("#confirmation"), "Échap doit fermer une modale").toBeHidden();

    const focusId = await page.evaluate(() => document.activeElement?.id ?? "");
    expect(
      focusId,
      "sans restitution, la personne au clavier repart du début du document",
    ).toBe("declencheur-suppression");
  });

  test("12.9 (A) : le focus reste dans la boîte pendant qu'elle est ouverte", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.getByRole("button", { name: /Supprimer ce membre/ }).click();

    const atteints: string[] = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      atteints.push(await page.evaluate(() => document.activeElement?.id ?? ""));
    }

    const dansLaBoite = await page.evaluate((ids) => {
      const boite = document.querySelector("#confirmation")!;
      return ids
        .filter((id) => id !== "")
        .every((id) => boite.contains(document.querySelector(`#${id}`)));
    }, atteints);

    expect(
      dansLaBoite,
      `la tabulation est sortie de la boîte : ${JSON.stringify(atteints)}. Le confinement est fourni par showModal(), pas par une div.`,
    ).toBe(true);
  });

  test("le reste de la page est inerte pendant que la boîte est ouverte", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.getByRole("button", { name: /Supprimer ce membre/ }).click();

    const lienAccessible = await page.evaluate(() => {
      const lien = document.querySelector('a[href="/apres"]') as HTMLElement;
      lien.focus();
      return document.activeElement === lien;
    });

    expect(
      lienAccessible,
      "un élément hors de la boîte ne doit pas pouvoir prendre le focus : c'est l'inertie fournie par showModal()",
    ).toBe(false);
  });

  test("aucun z-index n'est nécessaire : le top layer s'en charge", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const css = (await (await page.request.get(`/${LAB}/${cible}/style.css`)).text()).replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );

    const zIndex = css.match(/z-index\s*:\s*\d+/g) ?? [];
    expect(
      zIndex,
      `${zIndex.join(", ")} : le top layer rend ces z-index inutiles. Module 09 § 1.`,
    ).toEqual([]);
  });

  test("axe ne trouve aucune violation, menu ouvert", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.getByRole("button", { name: "Mon compte" }).click();
    const violations = await violationsAxe(page);
    expect(violations, JSON.stringify(violations, null, 1)).toEqual([]);
  });
});
