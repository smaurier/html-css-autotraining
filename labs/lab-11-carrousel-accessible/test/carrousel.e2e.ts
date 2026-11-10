// Oracle du lab 11. Un carrousel cumule quatre critères, et ils se testent tous au
// clavier ou à l'écoute. Module 13 § 7.

import { test, expect, type Page } from "@playwright/test";
import { ouvrirLab, violationsAxe } from "../../outils/lab";

const LAB = "lab-11-carrousel-accessible";

async function script(page: Page, cible: string) {
  const reponse = await page.request.get(`/${LAB}/${cible}/script.js`);
  expect(reponse.status()).toBe(200);
  return (await reponse.text()).replace(/\/\/[^\n]*/g, "");
}

test.describe("Carrousel accessible", () => {
  test("13.8 (A) : aucun défilement automatique", async ({ page }, infos) => {
    const cible = await ouvrirLab(page, infos, LAB);
    const js = await script(page, cible);

    expect(
      js,
      "un carrousel qui défile seul doit avoir un bouton de pause. Le plus simple reste de ne pas défiler seul.",
    ).not.toMatch(/setInterval|setTimeout\s*\(\s*[^,]*,\s*\d{3,}/);
  });

  test("13.10 (A) : des commandes par simple appui existent", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    await expect(
      page.getByRole("button", { name: /précédent/i }),
      "le glissement doit avoir une alternative par bouton",
    ).toHaveCount(1);
    await expect(page.getByRole("button", { name: /suivant/i })).toHaveCount(1);
  });

  test("12.11 (A) : la zone défilante est atteignable au clavier", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const focusable = await page.locator("#piste").evaluate((el) => {
      el.focus();
      return document.activeElement === el;
    });

    expect(
      focusable,
      "une div en overflow auto n'est pas focusable par défaut : son contenu est inatteignable sans souris",
    ).toBe(true);
  });

  test("la zone focusable porte un rôle et un nom, pour ne pas être un arrêt muet", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const infosZone = await page.locator("#piste").evaluate((el) => ({
      role: el.getAttribute("role") ?? "",
      nom: el.getAttribute("aria-label") ?? "",
    }));

    expect(infosZone.role, "un tabindex sans rôle crée un arrêt de tabulation sans identité").not.toBe("");
    expect(infosZone.nom, "ni sans nom").not.toBe("");
  });

  test("7.5 (AA) : une région de statut annonce le changement", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const statut = page.locator('[role="status"], [aria-live]');
    await expect(statut, "sans région live, le changement de panneau est muet").toHaveCount(1);

    const avant = (await statut.textContent())!.trim();
    await page.getByRole("button", { name: /suivant/i }).click();
    await page.waitForTimeout(300);
    const apres = (await statut.textContent())!.trim();

    expect(apres, `l'annonce n'a pas changé (« ${avant} »)`).not.toBe(avant);
    expect(apres, "l'annonce doit situer la position, par exemple « 2 sur 3 »").toMatch(/\d+\s*(sur|\/)\s*\d+/i);
  });

  test("le focus NE SE DÉPLACE PAS sur le panneau au changement", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const bouton = page.getByRole("button", { name: /suivant/i });
    await bouton.click();
    await page.waitForTimeout(200);

    const focusId = await page.evaluate(() => document.activeElement?.id ?? "");
    expect(
      focusId,
      "déplacer le focus sur le nouveau panneau interrompt la lecture : on annonce, on ne déplace pas",
    ).toBe("suivant");
  });

  test("le défilement s'accroche, et ne se propage pas à la page", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const styles = await page.locator("#piste").evaluate((el) => {
      const s = getComputedStyle(el);
      return { snap: s.scrollSnapType, overscroll: s.overscrollBehaviorInline };
    });

    expect(styles.snap, "un carrousel sans accrochage s'arrête entre deux panneaux").not.toBe("none");
    expect(
      styles.overscroll,
      "sans contain, arriver au bout du carrousel fait défiler la page derrière",
    ).toBe("contain");
  });

  test("les boutons font réellement défiler la piste", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);

    const depart = await page.locator("#piste").evaluate((el) => el.scrollLeft);
    await page.getByRole("button", { name: /suivant/i }).click();
    await page.waitForTimeout(600);
    const apres = await page.locator("#piste").evaluate((el) => el.scrollLeft);

    expect(apres, "le bouton Suivant doit faire défiler").toBeGreaterThan(depart);
  });

  test("axe ne trouve aucune violation", async ({ page }, infos) => {
    await ouvrirLab(page, infos, LAB);
    const violations = await violationsAxe(page);
    expect(violations, JSON.stringify(violations, null, 1)).toEqual([]);
  });
});
