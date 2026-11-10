// SOLUTION DE RÉFÉRENCE. À n'ouvrir qu'après ton GREEN.
//
// Aucun défilement automatique : il n'y a donc rien à mettre en pause, et 13.8 (A) est
// satisfait par construction plutôt que par un bouton de rattrapage.

const piste = document.querySelector("#piste");
const annonce = document.querySelector("#annonce");
const panneaux = [...piste.querySelectorAll(".panneau")];

let index = 0;

function aller(nouvelIndex) {
  index = Math.max(0, Math.min(panneaux.length - 1, nouvelIndex));

  piste.scrollTo({
    left: piste.clientWidth * index,
    // On respecte la préférence système jusque dans le défilement programmé.
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });

  // 7.5 (AA) : on ANNONCE, on ne déplace pas le focus. Déplacer le focus sur le panneau
  // interromprait la lecture en cours.
  const titre = panneaux[index].querySelector("h2").textContent.trim();
  annonce.textContent = `Photo ${index + 1} sur ${panneaux.length} : ${titre}`;
}

document.querySelector("#precedent").addEventListener("click", () => aller(index - 1));
document.querySelector("#suivant").addEventListener("click", () => aller(index + 1));
