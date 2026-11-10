// SOLUTION DE RÉFÉRENCE. À n'ouvrir qu'après ton GREEN.
//
// On garde l'API de validation de contraintes et on perd seulement la bulle native, dont
// l'apparence n'est pas stylable. C'est tout l'intérêt de `novalidate`. Module 14 § 1.3.

const formulaire = document.querySelector("#formulaire");
const resume = document.querySelector("#resume-erreurs");

// 11.11 (AA) : chaque message donne un EXEMPLE réel de saisie attendue.
const MESSAGES = {
  courriel: {
    valueMissing: "Le courriel est obligatoire. Exemple : prenom.nom@exemple.fr",
    typeMismatch: "Ce courriel n'est pas reconnu. Exemple : prenom.nom@exemple.fr",
  },
  cp: {
    valueMissing: "Le code postal est obligatoire. Exemple : 69100",
    patternMismatch: "Le code postal doit contenir cinq chiffres. Exemple : 69100",
  },
  contact: {
    valueMissing: "Choisis un mode de contact : courriel ou téléphone.",
  },
};

function messagePour(champ) {
  const parNom = MESSAGES[champ.name] ?? {};
  // Savoir QUEL drapeau est levé permet d'écrire un message utile. Module 14 § 1.1.
  for (const drapeau of ["valueMissing", "typeMismatch", "patternMismatch"]) {
    if (champ.validity[drapeau] && parNom[drapeau]) return parNom[drapeau];
  }
  return champ.validationMessage;
}

function afficherErreur(champ, message) {
  const zone = document.querySelector(`#err-${champ.name}`);
  if (!zone) return;
  zone.textContent = message;
  zone.hidden = false;
  champ.setAttribute("aria-invalid", "true");
  const decrit = (champ.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
  if (!decrit.includes(zone.id)) {
    champ.setAttribute("aria-describedby", [...decrit, zone.id].join(" "));
  }
}

function effacerErreur(champ) {
  const zone = document.querySelector(`#err-${champ.name}`);
  if (!zone) return;
  zone.hidden = true;
  zone.textContent = "";
  // aria-invalid doit être RETIRÉ, pas seulement posé une fois.
  champ.removeAttribute("aria-invalid");
}

formulaire.addEventListener("submit", (evenement) => {
  evenement.preventDefault();

  const champs = [...formulaire.elements].filter((el) => el.willValidate);
  const enErreur = [];

  for (const champ of champs) {
    if (champ.checkValidity()) {
      effacerErreur(champ);
    } else if (!enErreur.some((e) => e.name === champ.name)) {
      const message = messagePour(champ);
      afficherErreur(champ, message);
      enErreur.push({ name: champ.name, id: champ.id, message });
    }
  }

  if (enErreur.length === 0) {
    resume.hidden = true;
    resume.textContent = "";
    return;
  }

  // Un résumé en tête, avec le NOMBRE d'erreurs et un lien vers chaque champ.
  resume.innerHTML = `
    <h2>${enErreur.length} erreur${enErreur.length > 1 ? "s" : ""} à corriger</h2>
    <ul>${enErreur.map((e) => `<li><a href="#${e.id}">${e.message}</a></li>`).join("")}</ul>
  `;
  resume.hidden = false;

  // Le focus va sur le RÉSUMÉ, pas sur le premier champ : la personne doit d'abord
  // savoir combien d'erreurs il y a. Module 14 § 4.
  resume.focus();
});
