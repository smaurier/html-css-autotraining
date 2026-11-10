import { defineConfig, devices } from "@playwright/test";

// Deux projets, et c'est tout le mécanisme du format oracle de ce cours :
//
//   npm run lab:01      -> projet « lab »      -> ouvre src/      -> RED attendu
//   npm run solution:01 -> projet « solution » -> ouvre solution/ -> GREEN attendu
//
// Le test ne connaît pas le dossier : il appelle `ouvrirLab()`, qui lit le nom du projet.
// Un seul fichier d'oracle sert donc les deux, ce qui garantit qu'on vérifie exactement la
// même chose sur ton code et sur la référence.

export default defineConfig({
  testDir: ".",
  testMatch: "**/test/*.e2e.ts",
  fullyParallel: true,
  reporter: [["list"]],
  // Un lab n'est pas une suite de non-régression : on veut le premier échec, net.
  retries: 0,

  use: {
    baseURL: `http://localhost:${process.env.PORT ?? 4173}`,
    ...devices["Desktop Chrome"],
  },

  projects: [
    { name: "lab", use: {} },
    { name: "solution", use: {} },
  ],

  webServer: {
    command: "node outils/serveur.mjs",
    url: `http://localhost:${process.env.PORT ?? 4173}/index.html`,
    reuseExistingServer: true,
    stdout: "ignore",
  },
});
