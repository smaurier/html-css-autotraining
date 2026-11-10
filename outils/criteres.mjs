// Audit de couverture RGAA du cours.
//
// Deux questions, deux réponses vérifiables :
//   1. quel critère du référentiel n'est cité par aucun module ? (un trou, ou un hors
//      périmètre assumé, mais jamais un silence)
//   2. un module cite-t-il un numéro qui n'existe pas ? (un critère inventé, donc un bug
//      de contenu, et c'est le genre d'erreur qu'un lecteur ne peut pas détecter seul)
//
//   node outils/criteres.mjs          # régénère couverture-rgaa.md
//   node --test outils/test/criteres.test.mjs
//
// La référence (`criteres-rgaa.json`) ne contient que les NUMÉROS et les treize
// thématiques officielles du RGAA, qui sont publics. Les libellés descriptifs ont été
// volontairement retirés : ils provenaient de l'index d'un support de formation privé, et
// ce dépôt est public. L'outil n'a besoin que des numéros.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, "..");

/**
 * Un critère est cité sous la forme `11.1 (A)` ou `3.2 (AA)`. Le niveau entre parenthèses
 * est ce qui le distingue d'un numéro de version (`TypeScript 5.2`), d'un numéro de section
 * (`§ 2.1`) ou d'une plage écrite en prose (`11.1 à 11.13`). Conséquence voulue : une plage
 * ne crée pas de citation. Pour qu'un critère compte comme couvert, il faut l'avoir nommé.
 */
const CITATION = /\b(\d{1,2}\.\d{1,2})\s*\((A|AA|AAA)\)/g;

export function criteresCites(texte) {
  return [...new Set([...texte.matchAll(CITATION)].map((m) => m[1]))];
}

/**
 * @param {Record<string, object>} reference critère -> {sujet, theme}
 * @param {Record<string, string[]>} parModule module -> critères cités
 */
/**
 * Les clés commençant par un souligné sont des métadonnées du fichier de référence
 * (`_source`, `_note`), pas des critères. Sans ce filtre, elles seraient comptées comme
 * deux critères jamais couverts, et le total passerait de 106 à 108.
 */
function criteresDe(reference) {
  return Object.keys(reference).filter((c) => !c.startsWith("_"));
}

export function matriceCouverture(reference, parModule) {
  const couverts = {};
  const inconnus = new Set();
  const connus = new Set(criteresDe(reference));

  for (const [module, crits] of Object.entries(parModule)) {
    for (const c of crits) {
      if (!connus.has(c)) inconnus.add(c);
      (couverts[c] ??= []).push(String(module));
    }
  }

  // `Object.entries` place les clés qui sont des index entiers canoniques ("16") avant les
  // autres ("09"), donc l'ordre d'énumération d'un mapping de modules n'est pas celui du
  // fichier. Un rapport d'audit doit être déterministe : on trie.
  for (const c of Object.keys(couverts)) couverts[c].sort();

  const nonCouverts = criteresDe(reference).filter((c) => !(c in couverts));
  return { couverts, nonCouverts, inconnus: [...inconnus].sort() };
}

function trier(criteres) {
  return [...criteres].sort((a, b) => {
    const [ta, ca] = a.split(".").map(Number);
    const [tb, cb] = b.split(".").map(Number);
    return ta - tb || ca - cb;
  });
}

/**
 * @param {ReturnType<typeof matriceCouverture>} matrice
 * @param {Record<string, {sujet?: string, theme?: string}>} reference
 * @param {Record<string, string>} [horsPerimetre] critère -> raison assumée
 */
export function rendreMarkdownRgaa(matrice, reference, horsPerimetre = {}) {
  const { couverts, nonCouverts, inconnus } = matrice;
  const total = criteresDe(reference).length;
  const cites = Object.keys(couverts).filter((c) => c in reference && !c.startsWith("_")).length;

  const assumes = nonCouverts.filter((c) => c in horsPerimetre);
  const trous = nonCouverts.filter((c) => !(c in horsPerimetre));

  const lignes = [
    "# Couverture RGAA du cours",
    "",
    "> **Fichier généré.** `node outils/criteres.mjs` depuis `25-html-css/`.",
    "> Référence : les 106 numéros de critères et les treize thématiques du RGAA.",
    "> Le texte qui fait foi est le référentiel officiel :",
    "> <https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/>",
    "",
    `**${cites} / ${total} critères cités** par au moins un module.`,
    "",
  ];

  if (inconnus.length > 0) {
    lignes.push(
      `🔴 **${inconnus.length} critère inventé ou mal numéroté** : ${inconnus
        .map((c) => `\`${c}\``)
        .join(", ")}. Un lecteur ne peut pas détecter ça seul : à corriger avant toute lecture.`,
      "",
    );
  } else {
    lignes.push("✅ Aucun critère inventé : tous les numéros cités existent.", "");
  }

  lignes.push(`## Critères cités par aucun module (${trous.length})`, "");
  lignes.push(
    trous.length > 0
      ? trier(trous)
          .map((c) => `- \`${c}\` (thème ${reference[c]?.theme ?? "?"})`)
          .join("\n")
      : "_Aucun._",
    "",
  );

  if (assumes.length > 0) {
    lignes.push(`## Hors périmètre assumé (${assumes.length})`, "");
    lignes.push(
      "Un cours HTML et CSS ne couvre pas tout le référentiel. Ces critères sont déclarés,",
      "avec leur raison, plutôt que passés sous silence.",
      "",
      trier(assumes)
        .map((c) => `- \`${c}\` (thème ${reference[c]?.theme ?? "?"}) : ${horsPerimetre[c]}`)
        .join("\n"),
      "",
    );
  }

  lignes.push("## Critères couverts, et par quels modules", "", "| Critère | Thème | Modules |", "|---|---|---|");
  for (const c of trier(Object.keys(couverts).filter((x) => x in reference && !x.startsWith("_")))) {
    lignes.push(`| \`${c}\` | ${reference[c]?.theme ?? ""} | ${couverts[c].join(", ")} |`);
  }

  return `${lignes.join("\n")}\n`;
}

function principal() {
  const reference = JSON.parse(readFileSync(join(ICI, "criteres-rgaa.json"), "utf8"));

  const fichierHors = join(ICI, "criteres-hors-perimetre.json");
  const horsPerimetre = existsSync(fichierHors)
    ? JSON.parse(readFileSync(fichierHors, "utf8"))
    : {};

  const dossierModules = join(RACINE, "modules");
  const parModule = {};
  for (const f of readdirSync(dossierModules).filter((f) => f.endsWith(".md"))) {
    const numero = f.slice(0, 2);
    const cites = criteresCites(readFileSync(join(dossierModules, f), "utf8"));
    if (cites.length > 0) parModule[numero] = cites;
  }

  const matrice = matriceCouverture(reference, parModule);
  writeFileSync(
    join(RACINE, "couverture-rgaa.md"),
    rendreMarkdownRgaa(matrice, reference, horsPerimetre),
    "utf8",
  );

  const cites = Object.keys(matrice.couverts).filter((c) => c in reference && !c.startsWith("_")).length;
  const totalReference = Object.keys(reference).filter((c) => !c.startsWith("_")).length;
  console.log(
    `couverture-rgaa.md écrit : ${cites}/${totalReference} critères cités, ` +
      `${matrice.nonCouverts.length} non couverts`,
  );

  if (matrice.inconnus.length > 0) {
    console.error(`critères inventés : ${matrice.inconnus.join(", ")}`);
    process.exitCode = 1;
  }
}

if (process.argv[1]?.endsWith("criteres.mjs")) principal();
