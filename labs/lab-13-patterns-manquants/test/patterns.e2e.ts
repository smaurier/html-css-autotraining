// Oracle du lab 13. Les rôles se voient dans l'inspecteur, le clavier non : c'est pour
// cela que la moitié clavier est celle qui manque en production. Module 17 § 3.

import { test, expect } from "@playwright/test";
import { ouvrirLab, violationsAxe } from "../../outils/lab";

const LAB = "lab-13-patterns-manquants";

test.describe("Onglets et interrupteur", () => {
  test("7.1 (A) : les rôles du pattern d'onglets sont présents", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    await expect(page.getByRole("tablist"), "une liste d'onglets").toHaveCount(1);
    await expect(page.getByRole("tab"), "trois onglets").toHaveCount(3);
    await expect(page.getByRole("tabpanel"), "un seul panneau visible à la fois").toHaveCount(1);
  });

  test("7.1 (A) : l'onglet actif porte aria-selected, et lui seul", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const selectionnes = await page
      .getByRole("tab")
      .evaluateAll((onglets) => onglets.filter((o) => o.getAttribute("aria-selected") === "true").length);

    expect(selectionnes, "exactement un onglet sélectionné").toBe(1);
  });

  test("le focus est géré : un seul onglet dans l'ordre de tabulation", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const tabindex = await page
      .getByRole("tab")
      .evaluateAll((onglets) => onglets.map((o) => o.tabIndex));

    expect(
      tabindex.filter((t) => t === 0).length,
      `tabindex des onglets : ${JSON.stringify(tabindex)}. Un seul doit valoir 0, les autres -1, sinon Tab s'arrête sur chaque onglet.`,
    ).toBe(1);
    expect(tabindex.filter((t) => t === -1).length).toBe(2);
  });

  test("les flèches changent d'onglet, en boucle", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    await page.getByRole("tab", { name: "Profil" }).focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Activité" })).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Réglages" })).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("tab", { name: "Profil" }),
      "après le dernier onglet, la flèche droite revient au premier",
    ).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowLeft");
    await expect(
      page.getByRole("tab", { name: "Réglages" }),
      "et la flèche gauche depuis le premier va au dernier",
    ).toHaveAttribute("aria-selected", "true");
  });

  test("Début et Fin atteignent le premier et le dernier onglet", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    await page.getByRole("tab", { name: "Activité" }).focus();
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: "Réglages" })).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: "Profil" })).toHaveAttribute("aria-selected", "true");
  });

  test("le panneau affiché correspond à l'onglet actif", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    await page.getByRole("tab", { name: "Activité" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("Douze ateliers");

    const relie = await page.getByRole("tabpanel").getAttribute("aria-labelledby");
    expect(relie, "le panneau doit être nommé par son onglet").toBe("onglet-activite");
  });

  test("7.1 (A) : l'interrupteur a le rôle switch et un état", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.getByRole("tab", { name: "Réglages" }).click();

    const interrupteur = page.getByRole("switch");
    await expect(interrupteur, "role=switch attendu").toHaveCount(1);
    await expect(interrupteur).toHaveAttribute("aria-checked", "false");
  });

  test("7.3 (A) : l'interrupteur bascule à la barre d'espace", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.getByRole("tab", { name: "Réglages" }).click();

    const interrupteur = page.getByRole("switch");
    await interrupteur.focus();
    await page.keyboard.press(" ");

    await expect(
      interrupteur,
      "une div cliquable ne réagit ni à Espace ni à Entrée : c'est ce que le rôle ne donne pas",
    ).toHaveAttribute("aria-checked", "true");
  });

  test("le libellé de l'interrupteur ne change pas quand l'état change", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.getByRole("tab", { name: "Réglages" }).click();

    const libelle = page.locator("#libelle-interrupteur");
    const avant = (await libelle.textContent())!.trim();

    await page.getByRole("switch").click();
    const apres = (await libelle.textContent())!.trim();

    expect(
      apres,
      `le libellé est passé de « ${avant} » à « ${apres} » : on ne sait plus s'il décrit l'état courant ou l'action à venir. C'est aria-checked qui porte l'état.`,
    ).toBe(avant);
  });

  test("axe ne trouve aucune violation sur les deux panneaux", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    let violations = await violationsAxe(page);
    expect(violations, JSON.stringify(violations, null, 1)).toEqual([]);

    await page.getByRole("tab", { name: "Réglages" }).click();
    violations = await violationsAxe(page);
    expect(violations, JSON.stringify(violations, null, 1)).toEqual([]);
  });
});
