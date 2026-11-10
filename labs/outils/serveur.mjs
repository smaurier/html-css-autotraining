// Serveur statique de la racine `labs/`, zéro dépendance.
//
// Pourquoi un serveur plutôt que des URL file:// : les modules ES, les requêtes `fetch`
// et plusieurs restrictions d'origine ne fonctionnent pas depuis le système de fichiers.
// Un lab qui marche en file:// et pas en http donnerait une fausse confiance.
//
//   node outils/serveur.mjs          # port 4173 par défaut
//   PORT=5000 node outils/serveur.mjs

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const RACINE = resolve(import.meta.dirname, "..");
const PORT = Number(process.env.PORT ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
};

const serveur = createServer(async (requete, reponse) => {
  try {
    const chemin = decodeURIComponent(new URL(requete.url, "http://localhost").pathname);

    // Empêche de sortir de la racine par ../
    const cible = join(RACINE, normalize(chemin).replace(/^(\.\.[/\\])+/, ""));
    if (!cible.startsWith(RACINE)) {
      reponse.writeHead(403).end("Interdit");
      return;
    }

    const infos = await stat(cible);
    const fichier = infos.isDirectory() ? join(cible, "index.html") : cible;
    const contenu = await readFile(fichier);

    reponse.writeHead(200, {
      "content-type": TYPES[extname(fichier)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    reponse.end(contenu);
  } catch {
    reponse.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    reponse.end("Introuvable");
  }
});

serveur.listen(PORT, () => {
  console.log(`labs servis sur http://localhost:${PORT}`);
});
