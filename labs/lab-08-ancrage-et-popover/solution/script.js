// SOLUTION DE RÉFÉRENCE. À n'ouvrir qu'après ton GREEN.
//
// Il reste très peu de JavaScript, et c'est le but : la plateforme fait la bascule, le
// top layer, le confinement du focus et la fermeture par Échap. Ce qui reste est
// exactement ce qu'elle ne fait pas.

const declencheurMenu = document.querySelector("#declencheur-menu");
const menu = document.querySelector("#menu");

// 7.1 (A) : l'état doit être restitué. popover ne touche pas à aria-expanded.
// L'évènement toggle porte le nouvel état, donc rien à interroger.
menu.addEventListener("toggle", (evenement) => {
  declencheurMenu.setAttribute("aria-expanded", String(evenement.newState === "open"));
});

const declencheurSuppression = document.querySelector("#declencheur-suppression");
const confirmation = document.querySelector("#confirmation");

// On retient QUI a ouvert, pour lui rendre le focus. Sans ça, la personne au clavier
// repart du début du document. Module 09 § 2.2.
let invocateur = null;

declencheurSuppression.addEventListener("click", () => {
  invocateur = declencheurSuppression;
  confirmation.showModal();
});

confirmation.addEventListener("close", () => {
  invocateur?.focus();
  invocateur = null;
});
