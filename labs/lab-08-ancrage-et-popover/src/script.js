// STARTER. Ça marche à la souris. Et seulement à la souris.

document.querySelector("#declencheur-menu").addEventListener("click", () => {
  document.querySelector("#menu").classList.toggle("ouvert");
});

document.querySelector("#declencheur-suppression").addEventListener("click", () => {
  document.querySelector("#confirmation").classList.add("ouverte");
});

document.querySelector("#annuler").addEventListener("click", () => {
  document.querySelector("#confirmation").classList.remove("ouverte");
});

document.querySelector("#confirmer").addEventListener("click", () => {
  document.querySelector("#confirmation").classList.remove("ouverte");
});
