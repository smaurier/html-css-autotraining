// Outillage partagé des oracles de labs.
//
// Le principe : un seul fichier d'oracle sert ton code et la solution. `ouvrirLab()` lit le
// nom du projet Playwright pour choisir le dossier, donc le test ne sait pas lequel il
// vérifie. C'est ce qui garantit qu'on mesure exactement la même chose des deux côtés.

import { expect, type Page, type TestInfo, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ratioContraste, verdictContraste } from "./contraste.mjs";

export { ratioContraste, verdictContraste };

/**
 * Ouvre le lab dans le dossier correspondant au projet courant (`src` ou `solution`).
 *
 * Vérifie aussi qu'aucune ressource de la page ne manque. Sans ce contrôle, un lab dont la
 * feuille de style ne se charge pas peut passer des assertions qui ne dépendent pas d'elle,
 * et donner une fausse confiance. C'est arrivé pendant l'écriture de ce cours, sur un chemin
 * relatif qui remontait d'un niveau au lieu de deux.
 */
export async function ouvrirLab(page: Page, infos: TestInfo, dossierDuLab: string) {
  const cible = infos.project.name === "solution" ? "solution" : "src";

  const manquantes: string[] = [];
  page.on("response", (reponse) => {
    if (reponse.status() >= 400) manquantes.push(`${reponse.status()} ${new URL(reponse.url()).pathname}`);
  });

  const reponse = await page.goto(`/${dossierDuLab}/${cible}/index.html`);

  // Un 404 doit échouer en disant pourquoi, pas produire vingt assertions incompréhensibles.
  expect(
    reponse?.status(),
    `${dossierDuLab}/${cible}/index.html est introuvable. Crée le fichier avant de lancer l'oracle.`,
  ).toBe(200);

  await page.waitForLoadState("load");
  expect(
    manquantes,
    `des ressources de la page sont introuvables : ${manquantes.join(", ")}. Vérifie les chemins relatifs.`,
  ).toEqual([]);

  return cible;
}

/**
 * L'ordre de tabulation réel, obtenu en tabulant pour de vrai.
 *
 * Rien dans le DOM ne permet de le déduire : c'est pour cela que `12.8 (A)` ne se teste
 * qu'ainsi. Chaque entrée porte le rôle, le nom accessible et la balise de l'élément
 * atteint, donc un arrêt « muet » se repère immédiatement à son nom vide.
 */
export async function ordreDeTabulation(page: Page, maxArrets = 40) {
  const arrets: Array<{ balise: string; nom: string; role: string }> = [];

  for (let i = 0; i < maxArrets; i++) {
    await page.keyboard.press("Tab");

    const actuel = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      return {
        balise: el.tagName.toLowerCase(),
        nom: (
          el.getAttribute("aria-label") ??
          el.textContent ??
          el.getAttribute("title") ??
          el.getAttribute("alt") ??
          ""
        )
          .trim()
          .replace(/\s+/g, " "),
        role: el.getAttribute("role") ?? "",
      };
    });

    if (!actuel) break;
    arrets.push(actuel);
  }

  return arrets;
}

/** Le texte qu'un élément focusé laisse voir, pour vérifier `10.7 (A)`. */
export async function indicateurDeFocusVisible(locator: Locator) {
  return locator.evaluate((el) => {
    const s = getComputedStyle(el);
    const largeurContour = Number.parseFloat(s.outlineWidth) || 0;
    const styleContour = s.outlineStyle;
    return {
      outline: styleContour !== "none" && largeurContour > 0,
      largeurContour,
      ombre: s.boxShadow !== "none",
      bordure: s.borderStyle,
    };
  });
}

/**
 * Remonte les ancêtres jusqu'au premier fond non transparent, puis calcule le ratio.
 *
 * Un `background-color` de `rgba(0, 0, 0, 0)` ne dit pas « noir transparent », il dit
 * « je n'ai pas de fond, regarde derrière ». Calculer le contraste sans remonter donne un
 * ratio contre du noir, donc un chiffre faux et flatteur.
 */
export async function ratioAvecFond(locator: Locator) {
  const couleurs = await locator.evaluate((el) => {
    const avant = getComputedStyle(el).color;

    let courant: Element | null = el;
    let fond = "rgba(0, 0, 0, 0)";
    while (courant) {
      const c = getComputedStyle(courant).backgroundColor;
      if (c && !/^rgba\(.*,\s*0\)$/.test(c) && c !== "transparent") {
        fond = c;
        break;
      }
      courant = courant.parentElement;
    }
    if (/^rgba\(.*,\s*0\)$/.test(fond)) fond = "rgb(255, 255, 255)";

    return { texte: avant, fond };
  });

  return { ...couleurs, ratio: ratioContraste(couleurs.texte, couleurs.fond) };
}

/**
 * Le VRAI arbre d'accessibilité, tel que le navigateur le calcule.
 *
 * À utiliser quand `getByRole` ne suffit pas, et il y a un cas précis où il ne suffit
 * pas : `ElementInternals` expose le rôle, le nom et les états à l'arbre de la
 * plateforme **sans les écrire dans le DOM**. Le moteur de rôles de Playwright, lui, lit
 * le DOM. Un composant parfaitement accessible via internals est donc invisible pour
 * `getByRole`, alors qu'un lecteur d'écran l'annonce correctement.
 *
 * C'est exactement la raison pour laquelle le module 18 § 6.3 dit d'inspecter l'arbre
 * aplati plutôt que le DOM.
 */
export async function arbreAccessibilite(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send("Accessibility.enable");
  const { nodes } = (await client.send("Accessibility.getFullAXTree")) as {
    nodes: Array<{
      role?: { value?: string };
      name?: { value?: string };
      properties?: Array<{ name: string; value: { value?: unknown } }>;
      ignored?: boolean;
    }>;
  };
  await client.detach();

  return nodes
    .filter((n) => !n.ignored)
    .map((n) => ({
      role: String(n.role?.value ?? ""),
      nom: String(n.name?.value ?? ""),
      proprietes: Object.fromEntries(
        (n.properties ?? []).map((p) => [p.name, p.value?.value as unknown]),
      ),
    }));
}

/**
 * Les violations trouvées par axe.
 *
 * Rappel du module 20 : un résultat vide n'est pas une conformité, c'est l'absence d'un
 * certain type de signal. Les oracles de ce cours utilisent donc axe EN PLUS d'assertions
 * explicites, jamais à leur place.
 */
export async function violationsAxe(page: Page, selecteur?: string) {
  const constructeur = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
  ]);
  if (selecteur) constructeur.include(selecteur);

  const resultat = await constructeur.analyze();
  return resultat.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    aide: v.help,
    cibles: v.nodes.map((n) => n.target.join(" ")),
  }));
}
