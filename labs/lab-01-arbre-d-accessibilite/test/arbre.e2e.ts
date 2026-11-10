// Oracle du lab 01. `npm run lab:01` depuis labs/ : RED tant que src/ ne satisfait pas
// l'énoncé. `npm run solution:01` : GREEN, ce qui prouve que l'oracle est juste.
//
// Ce que cet oracle interroge n'est presque jamais le DOM : c'est l'arbre d'accessibilité
// calculé, les noms accessibles et l'ordre de tabulation réel. C'est le sujet du module 01.

import { test, expect } from "@playwright/test";
import { ouvrirLab, ordreDeTabulation, violationsAxe } from "../../outils/lab";

const LAB = "lab-01-arbre-d-accessibilite";

test.describe("Le document et son arbre", () => {
  test("8.3 (A) : la langue principale est déclarée et valide", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang, "l'attribut lang manque sur <html>").toBeTruthy();
    expect(lang, "le code de langue doit être un code ISO 639 valide").toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });

  test("8.5 (A) : le titre de page situe la page et le site", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const titre = await page.title();
    expect(titre, "« Document » ne situe rien").not.toMatch(/^(document|sans titre|untitled)$/i);
    expect(titre.toLowerCase(), "le titre doit nommer la page").toContain("membres");
  });

  test("9.2 (A) et 12.6 (A) : les trois régions uniques existent, et une seule fois", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await expect(page.getByRole("banner"), "il faut exactement un role=banner").toHaveCount(1);
    await expect(page.getByRole("main"), "il faut exactement un role=main").toHaveCount(1);
    await expect(page.getByRole("contentinfo"), "il faut exactement un role=contentinfo").toHaveCount(1);
  });

  test("12.6 (A) : la navigation porte un nom accessible", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const navs = page.getByRole("navigation");
    await expect(navs).toHaveCount(1);
    const nom = await navs.evaluate(
      (el) => el.getAttribute("aria-label") ?? el.getAttribute("title") ?? "",
    );
    expect(nom.trim(), "une région de navigation sans nom ne se distingue pas").not.toBe("");
  });

  test("9.3 (A) : la suite de liens de navigation est une liste", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const liste = page.getByRole("navigation").getByRole("list");
    await expect(liste, "une suite de liens doit être une <ul>, pour être annoncée « 5 éléments »").toHaveCount(1);
    await expect(liste.getByRole("listitem")).toHaveCount(5);
  });

  test("9.1 (A) : la hiérarchie de titres existe et dit la structure", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await expect(page.getByRole("heading", { level: 1 }), "un seul h1").toHaveCount(1);
    await expect(
      page.getByRole("heading", { level: 2 }),
      "les trois sections doivent être des h2, pas des div stylées",
    ).toHaveCount(3);
  });

  test("12.7 (A) : le premier arrêt de tabulation est le lien d'accès rapide", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.keyboard.press("Tab");

    const premier = page.locator(":focus");
    await expect(premier, "le premier focusable doit être un lien").toHaveJSProperty("tagName", "A");

    const href = await premier.getAttribute("href");
    expect(href, "le lien d'accès rapide doit pointer vers une ancre interne").toMatch(/^#/);

    const cible = await page.locator(href!).count();
    expect(cible, `la cible ${href} doit exister dans la page`).toBe(1);

    // Il doit être VISIBLE une fois focusé : hors écran en permanence ne compte pas.
    const boite = await premier.boundingBox();
    expect(boite, "le lien d'accès rapide doit avoir une boîte").not.toBeNull();
    expect(
      boite!.y,
      "le lien doit revenir dans le viewport à la prise de focus, pas rester hors écran",
    ).toBeGreaterThanOrEqual(0);
  });

  test("6.2 (A) : aucun lien n'est vide de nom accessible", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const liensMuets = await page.locator("a[href]").evaluateAll((liens) =>
      liens
        .filter((lien) => {
          const texte = (lien.textContent ?? "").trim();
          const etiquette = lien.getAttribute("aria-label")?.trim() ?? "";
          const titre = lien.getAttribute("title")?.trim() ?? "";
          const altImages = [...lien.querySelectorAll("img")]
            .map((img) => img.getAttribute("alt")?.trim() ?? "")
            .join("");
          return !(texte || etiquette || titre || altImages);
        })
        .map((lien) => lien.getAttribute("href") ?? "?"),
    );

    expect(liensMuets, "ces liens n'ont aucun intitulé : le focus arrive sur un trou").toEqual([]);
  });

  test("6.1 (A) : le lien de recherche et les liens d'aide sont explicites", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    await expect(
      page.getByRole("link", { name: /recherch/i }),
      "le lien icône de recherche doit avoir un intitulé",
    ).toHaveCount(1);

    // Deux « En savoir plus » identiques ne sont pas explicites hors contexte : leurs noms
    // accessibles doivent différer.
    const nomsAide = await page.locator(".liens-aide a").evaluateAll((liens) =>
      liens.map((l) => (l.getAttribute("aria-label") ?? l.textContent ?? "").replace(/\s+/g, " ").trim()),
    );
    expect(nomsAide.length, "les deux liens d'aide doivent être présents").toBe(2);
    expect(
      new Set(nomsAide).size,
      `deux liens au même intitulé « ${nomsAide[0]} » ne sont pas explicites hors contexte`,
    ).toBe(2);
  });

  test("le piège du module 01 : aucun élément focusable n'est aria-hidden", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const pieges = await page.locator('[aria-hidden="true"]').evaluateAll((noeuds) =>
      noeuds
        .filter((n) => n.matches("a[href], button, input, select, textarea, [tabindex]"))
        .map((n) => n.outerHTML.slice(0, 80)),
    );

    expect(
      pieges,
      "un focusable aria-hidden : le clavier y arrive, la voix n'a rien à dire",
    ).toEqual([]);
  });

  test("1.2 (A) : les images décoratives sortent de l'arbre", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const decoratives = await page
      .locator("img")
      .evaluateAll((images) =>
        images
          .map((img) => ({ src: img.getAttribute("src") ?? "", alt: img.getAttribute("alt") }))
          .filter((i) => /separateur|logo|loupe/.test(i.src)),
      );

    for (const image of decoratives) {
      expect(
        image.alt,
        `${image.src} est décorative : son alt doit être vide, et vaut « ${image.alt} »`,
      ).toBe("");
    }
  });

  test("l'ordre de tabulation ne contient aucun arrêt muet", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const arrets = await ordreDeTabulation(page);

    expect(arrets.length, "la page doit avoir des éléments focusables").toBeGreaterThan(5);
    const muets = arrets.filter((a) => a.nom === "");
    expect(muets, `arrêts de tabulation sans nom : ${JSON.stringify(muets)}`).toEqual([]);
  });

  test("axe ne trouve aucune violation (nécessaire, pas suffisant)", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const violations = await violationsAxe(page);
    expect(violations, JSON.stringify(violations, null, 1)).toEqual([]);
  });
});
