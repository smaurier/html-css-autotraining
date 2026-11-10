// Oracle du lab 14.
//
// Particularité de ce lab : les assertions passent par le VRAI arbre d'accessibilité, pas
// par `getByRole`. `ElementInternals` expose le rôle, le nom et les états à l'arbre de la
// plateforme SANS les écrire dans le DOM, et le moteur de rôles de Playwright lit le DOM.
// Un composant correctement accessible par internals est donc invisible pour `getByRole`,
// alors qu'un lecteur d'écran l'annonce très bien.
//
// C'est précisément ce que dit le module 18 § 6.3 : on inspecte l'arbre aplati, pas le DOM.

import { test, expect, type Page } from "@playwright/test";
import { ouvrirLab, arbreAccessibilite, violationsAxe } from "../../outils/lab";

const LAB = "lab-14-web-component-accessible";

async function source(page: Page, cible: string) {
  return (await (await page.request.get(`/${LAB}/${cible}/index.html`)).text());
}

async function interrupteurs(page: Page) {
  const arbre = await arbreAccessibilite(page);
  return arbre.filter((n) => n.role === "switch");
}

test.describe("Web component accessible", () => {
  test("l'élément personnalisé est bien défini", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const defini = await page.evaluate(() => Boolean(customElements.get("bascule-notifs")));
    expect(defini, "customElements.define doit être appelé").toBe(true);
  });

  test("le shadow DOM est déclaratif, donc présent avant le script", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const html = await source(page, cible);

    expect(
      html,
      "shadowrootmode construit le shadow par l'analyseur HTML : le composant est peint au premier octet et dégrade honnêtement si le script n'arrive pas. Module 18 § 4.",
    ).toMatch(/<template\s+shadowrootmode=["']open["']/);
  });

  test("7.1 (A) : le rôle switch est exposé dans l'arbre d'accessibilité", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const trouves = await interrupteurs(page);
    expect(
      trouves.length,
      "aucun nœud de rôle switch dans l'arbre : sans rôle, le composant est une div pour toute technologie d'assistance",
    ).toBe(2);
  });

  test("7.1 (A) : le nom vient d'un attribut, pas d'une référence qui traverse", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const noms = (await interrupteurs(page)).map((n) => n.nom);
    expect(
      noms,
      `noms trouvés : ${JSON.stringify(noms)}. aria-labelledby ne traverse PAS une frontière de shadow, et rien ne le signale. Le nom doit venir d'un attribut du composant. Module 18 § 6.1.`,
    ).toContain("Notifications par courriel");
    expect(noms).toContain("Résumé hebdomadaire");
  });

  test("7.1 (A) : l'état est exposé dans l'arbre, et il change", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const avant = (await interrupteurs(page)).find((n) => n.nom.startsWith("Notifications"));
    expect(avant?.proprietes.checked, "l'état coché doit être exposé").toBe("false");

    await page.locator("#bascule").click();

    const apres = (await interrupteurs(page)).find((n) => n.nom.startsWith("Notifications"));
    expect(apres?.proprietes.checked, "et il doit changer quand on bascule").toBe("true");
  });

  test("7.3 (A) : le composant est focusable et bascule au clavier", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    await page.locator("#bascule").focus();
    const aLeFocus = await page.evaluate(
      () => document.activeElement?.tagName.toLowerCase() === "bascule-notifs",
    );
    expect(
      aLeFocus,
      "un élément personnalisé n'est pas focusable par défaut : il faut poser tabIndex",
    ).toBe(true);

    await page.keyboard.press(" ");
    const apres = (await interrupteurs(page)).find((n) => n.nom.startsWith("Notifications"));
    expect(apres?.proprietes.checked, "la barre d'espace doit basculer").toBe("true");
  });

  test("l'état est exposé au CSS par :state(), pas par une classe", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.locator("#bascule").click();

    const etatCss = await page.locator("#bascule").evaluate((el) => {
      try {
        return el.matches(":state(actif)");
      } catch {
        return false;
      }
    });

    expect(
      etatCss,
      "ElementInternals.states expose l'état au CSS par :state(). Une classe parallèle peut se désynchroniser de l'arbre.",
    ).toBe(true);
  });

  test("le contenu projeté dans le slot est bien rendu", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const texte = await page.locator("#bascule").evaluate((el) => (el.textContent ?? "").trim());
    expect(
      texte,
      "le contenu de l'hôte doit être projeté dans le slot, et il reste stylé par le document",
    ).toContain("Notifications");
  });

  test("les deux instances restent indépendantes", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    await page.locator("#bascule").click();

    const second = (await interrupteurs(page)).find((n) => n.nom.startsWith("Résumé"));
    expect(second?.proprietes.checked, "chaque instance a son propre état").toBe("false");
  });

  test("axe ne trouve aucune violation", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const violations = await violationsAxe(page);
    expect(violations, JSON.stringify(violations, null, 1)).toEqual([]);
  });
});
