// Outil de couverture du cours 25.
//
// Pourquoi il existe : « le cours est à jour » est une promesse invérifiable. Ici, la
// promesse devient un fichier. Chaque item réellement interrogé par les enquêtes
// Devographics (State of HTML, State of CSS) est confronté au plan du cours. Un item sans
// module est un trou, et il est affiché comme tel au lieu d'être tu.
//
// Rejouable chaque mi-novembre (rappel annuel au calendrier) : à cette date, toutes les
// enquêtes de l'année ont ouvert, donc tous les questions.yml de l'année existent.
//
//   node outils/couverture.mjs --telecharger   # rafraîchit outils/donnees/*.yml
//   node outils/couverture.mjs                 # régénère couverture-state-of.md
//   node --test outils/                        # l'oracle de l'outil lui-même
//
// Aucune dépendance npm : parseur dédié à la forme très régulière de ces fichiers.
// La contrepartie est assumée : ce n'est pas un parseur YAML général, et son oracle
// (outils/test/couverture.test.mjs) est ce qui le rend fiable sur ce format précis.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, "..");
const DOSSIER_DONNEES = join(ICI, "donnees");

/** Enquêtes suivies, et l'édition de référence du cours. */
export const ENQUETES = {
  html2026: "state_of_html/html2026",
  css2026: "state_of_css/css2026",
};

const BASE_BRUTE = "https://raw.githubusercontent.com/devographics/surveys/main";

/**
 * Sections qui n'interrogent aucune compétence : profil du répondant, ressources suivies,
 * ressenti. Elles sortent de la couverture. `usage` en fait partie, mais deux de ses
 * questions sont au contraire de la matière de premier plan, d'où la réintégration
 * explicite ci-dessous.
 */
export const SECTIONS_META = ["usage", "resources", "user_info"];

/** Questions techniques vivant dans une section méta, réintégrées nommément. */
export const QUESTIONS_RATTRAPEES = ["html_missing_elements", "html_styling_issues"];

/** Questions d'opinion présentes dans les sections techniques. */
const SUFFIXES_OPINION = /_pain_points$|_happiness$|_others$/;

/** Questions techniquement hors périmètre d'un cours HTML/CSS. */
const QUESTIONS_HORS_PERIMETRE = ["browsers", "form_factors"];

/** Options de remplissage des questionnaires. */
const OPTIONS_REMPLISSAGE = new Set(["na", "other"]);

/**
 * Une option purement numérique est une graduation d'échelle (« de 0 à 4 »), pas un sujet.
 * La question reste un item, ses graduations non.
 */
function estGraduation(id) {
  return /^\d+$/.test(id);
}

/**
 * Parse un `questions.yml` de Devographics.
 *
 * La forme est stable : section à l'indentation 0, question à 4, option à 8, et les
 * attributs deux crans à droite de leur porteur. On s'appuie sur cette régularité, pas
 * sur un parseur général.
 *
 * @param {string} texte contenu brut du fichier
 * @returns {Array<{id: string, questions: Array<{id: string, yearAdded?: number, options: Array<{id: string, yearAdded?: number}>}>}>}
 */
export function parserOutline(texte) {
  const sections = [];
  let section = null;
  let question = null;
  let option = null;

  for (const ligne of texte.split(/\r?\n/)) {
    if (/^\s*#/.test(ligne) || ligne.trim() === "") continue;

    const nouvelleSection = /^- id:\s*(\S+)/.exec(ligne);
    if (nouvelleSection) {
      section = { id: nouvelleSection[1], questions: [] };
      sections.push(section);
      question = null;
      option = null;
      continue;
    }

    const nouvelleQuestion = /^ {4}- id:\s*(\S+)/.exec(ligne);
    if (nouvelleQuestion && section) {
      question = { id: nouvelleQuestion[1], options: [] };
      section.questions.push(question);
      option = null;
      continue;
    }

    const nouvelleOption = /^ {8}- id:\s*(\S+)/.exec(ligne);
    if (nouvelleOption && question) {
      const id = nouvelleOption[1];
      if (OPTIONS_REMPLISSAGE.has(id) || estGraduation(id)) {
        option = null;
        continue;
      }
      option = { id };
      question.options.push(option);
      continue;
    }

    const anneeOption = /^ {10}yearAdded:\s*(\d{4})/.exec(ligne);
    if (anneeOption && option) {
      option.yearAdded = Number(anneeOption[1]);
      continue;
    }

    const anneeQuestion = /^ {6}yearAdded:\s*(\d{4})/.exec(ligne);
    if (anneeQuestion && question) {
      question.yearAdded = Number(anneeQuestion[1]);
      continue;
    }
  }

  return sections;
}

function estSectionRetenue(sectionId) {
  return !SECTIONS_META.includes(sectionId);
}

function estQuestionRetenue(sectionId, questionId) {
  if (QUESTIONS_RATTRAPEES.includes(questionId)) return true;
  if (!estSectionRetenue(sectionId)) return false;
  if (SUFFIXES_OPINION.test(questionId)) return false;
  if (QUESTIONS_HORS_PERIMETRE.includes(questionId)) return false;
  return true;
}

/**
 * `mapping.json` est écrit par module (lisible : « voici ce que porte le module 10 »).
 * La couverture travaille dans l'autre sens. Un item revendiqué par deux modules est une
 * erreur dure : c'est exactement la duplication que ce cours existe pour supprimer.
 *
 * @param {Record<string, string[]>} parModule
 * @returns {Record<string, string>} item -> module
 */
export function inverserMapping(parModule) {
  const index = {};
  for (const [module, items] of Object.entries(parModule)) {
    for (const item of items) {
      if (index[item]) {
        throw new Error(
          `l'item ${item} est revendiqué par le module ${index[item]} et par le module ${module} : tranche lequel est sa référence`,
        );
      }
      index[item] = String(module);
    }
  }
  return index;
}

/**
 * Confronte les items interrogés au plan du cours.
 *
 * Un item est l'unité la plus fine disponible : les options d'une question quand elle en
 * a (les quatorze frameworks CSS, par exemple), la question elle-même sinon (`subgrid`).
 *
 * @param {Record<string, ReturnType<typeof parserOutline>>} outlines par enquête
 * @param {Record<string, string>} mapping item -> numéro de module
 * @param {{anneeNouveaute?: number}} [options]
 */
export function construireCouverture(outlines, mapping, options = {}) {
  const lignes = [];
  const orphelins = [];

  for (const [enquete, sections] of Object.entries(outlines)) {
    for (const section of sections) {
      for (const question of section.questions) {
        if (!estQuestionRetenue(section.id, question.id)) continue;

        const items =
          question.options.length > 0
            ? question.options
            : [{ id: question.id, yearAdded: question.yearAdded }];

        for (const item of items) {
          const module = mapping[item.id];
          if (!module) orphelins.push(item.id);

          lignes.push({
            item: item.id,
            section: section.id,
            enquete,
            module: module ?? null,
            nouveau: options.anneeNouveaute != null && item.yearAdded === options.anneeNouveaute,
          });
        }
      }
    }
  }

  return { lignes, orphelins };
}

/** @param {{lignes: Array<object>, orphelins: string[]}} couverture */
export function rendreMarkdown(couverture, options = {}) {
  const { lignes, orphelins } = couverture;
  const annee = options.anneeNouveaute ?? new Date().getFullYear();
  const nouveaux = lignes.filter((l) => l.nouveau);

  const entete = [
    "# Couverture des enquêtes State of",
    "",
    "> **Fichier généré.** `node outils/couverture.mjs` depuis `25-html-css/`.",
    "> Ne pas éditer à la main : éditer `outils/mapping.json`, puis régénérer.",
    "",
    "« Le cours est à jour » est une promesse invérifiable, donc elle est remplacée ici par",
    "un tableau. Chaque item réellement interrogé par State of HTML et State of CSS est",
    "confronté au plan du cours. Un item sans module est un trou, et il s'affiche comme tel.",
    "",
    `**${lignes.length} items techniques** recensés.`,
    orphelins.length > 0
      ? `⚠️ **${orphelins.length} items sans module** : ${[...new Set(orphelins)].sort().join(", ")}.`
      : "✅ **Aucun item sans module.**",
    "",
    `## Nouveautés ${annee} (${nouveaux.length})`,
    "",
    "Ce que les éditeurs de navigateurs et la communauté ont jugé assez mûr pour mériter une",
    "question cette année. C'est le vrai signal de veille, bien plus que les résultats.",
    "",
    nouveaux.length > 0
      ? nouveaux.map((l) => `- \`${l.item}\` → module ${l.module ?? "**à placer**"}`).join("\n")
      : "_Aucune nouveauté sur l'édition chargée._",
    "",
    "## Tableau complet",
    "",
    "| Item | Section | Module |",
    "|---|---|---|",
  ].join("\n");

  const corps = lignes
    .map((l) => `| \`${l.item}\` | ${l.section} | ${l.module ?? "**à placer**"} |`)
    .join("\n");

  return `${entete}\n${corps}\n`;
}

async function telecharger() {
  mkdirSync(DOSSIER_DONNEES, { recursive: true });
  for (const [nom, chemin] of Object.entries(ENQUETES)) {
    const url = `${BASE_BRUTE}/${chemin}/questions.yml`;
    const reponse = await fetch(url);
    if (!reponse.ok) throw new Error(`${url} a répondu ${reponse.status}`);
    writeFileSync(join(DOSSIER_DONNEES, `${nom}.yml`), await reponse.text(), "utf8");
    console.log(`téléchargé : ${nom}.yml`);
  }
}

function principal() {
  if (process.argv.includes("--telecharger")) return telecharger();

  const outlines = {};
  for (const nom of Object.keys(ENQUETES)) {
    const fichier = join(DOSSIER_DONNEES, `${nom}.yml`);
    if (!existsSync(fichier)) {
      console.error(`manque ${fichier} : lance d'abord : node outils/couverture.mjs --telecharger`);
      process.exitCode = 1;
      return;
    }
    outlines[nom] = parserOutline(readFileSync(fichier, "utf8"));
  }

  const mapping = inverserMapping(JSON.parse(readFileSync(join(ICI, "mapping.json"), "utf8")));
  const anneeNouveaute = Number(process.env.ANNEE_NOUVEAUTE ?? 2026);
  const couverture = construireCouverture(outlines, mapping, { anneeNouveaute });

  writeFileSync(
    join(RACINE, "couverture-state-of.md"),
    rendreMarkdown(couverture, { anneeNouveaute }),
    "utf8",
  );

  console.log(`couverture-state-of.md écrit : ${couverture.lignes.length} items`);
  if (couverture.orphelins.length > 0) {
    console.log(`items sans module (${couverture.orphelins.length}) :`);
    for (const id of [...new Set(couverture.orphelins)].sort()) console.log(`  - ${id}`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("couverture.mjs")) {
  await principal();
}
