// Calcul du ratio de contraste, formule WCAG 2.x. Voir module 10 § 4.1.
//
// Choix assumés, parce qu'un oracle doit être prévisible :
//
// 1. Le seuil de linéarisation est 0,03928, celui qu'utilisent les outils d'audit (axe,
//    Colour Contrast Analyser). Le chiffre du lab est ainsi le même que celui qu'on lira
//    en audit réel, ce qui compte plus qu'une décimale de pureté.
// 2. On ne lit que sRGB, en hexadécimal ou en rgb()/rgba(). Toute autre notation lève une
//    erreur au lieu de rendre un chiffre : un oracle qui se trompe silencieusement fait
//    échouer des labs justes et passer des labs faux.
// 3. L'alpha est ignoré. Le ratio réel d'une couleur translucide dépend de ce qu'il y a
//    derrière, que seule la page connaît. Dans un lab, on compare des couleurs opaques, et
//    `getComputedStyle` les rend en rgb() résolu.

function composantes(couleur) {
  const c = String(couleur ?? "").trim();

  const hexCourt = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(c);
  if (hexCourt) {
    return [1, 2, 3].map((i) => parseInt(hexCourt[i].repeat(2), 16));
  }

  const hexLong = /^#([0-9a-f]{6})$/i.exec(c);
  if (hexLong) {
    const n = parseInt(hexLong[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(c);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];

  throw new Error(
    `couleur illisible : « ${couleur} ». Attendu #rgb, #rrggbb, rgb() ou rgba(). ` +
      `Les notations modernes (oklch, color-mix, lab) doivent être résolues par le navigateur ` +
      `avant de parvenir ici : lis-les avec getComputedStyle, qui rend du rgb().`,
  );
}

export function luminanceRelative(couleur) {
  const [r, g, b] = composantes(couleur).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function ratioContraste(a, b) {
  const la = luminanceRelative(a);
  const lb = luminanceRelative(b);
  const [haut, bas] = la > lb ? [la, lb] : [lb, la];
  return (haut + 0.05) / (bas + 0.05);
}

/**
 * Applique les seuils du référentiel.
 *
 * `3.2 (AA)` : 4,5 pour un texte de taille normale, 3 pour un texte agrandi.
 * `3.3 (AA)` : 3 pour un élément non textuel porteur d'information.
 *
 * La qualification « agrandi » se juge sur la taille CALCULÉE, et la valeur exacte qui fait
 * foi est dans le référentiel. Cette fonction applique un seuil, elle ne décide pas si le
 * texte est agrandi : c'est à l'appelant de le savoir.
 */
export function verdictContraste(ratio, { agrandi = false, nonTextuel = false } = {}) {
  const seuil = agrandi || nonTextuel ? 3 : 4.5;
  return { conforme: ratio >= seuil, seuil };
}
