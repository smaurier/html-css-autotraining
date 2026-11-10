// STARTER. Des écouteurs de clic, et rien d'autre.

document.querySelectorAll(".onglet").forEach((onglet) => {
  onglet.addEventListener("click", () => {
    document.querySelectorAll(".onglet").forEach((o) => o.classList.remove("actif"));
    document.querySelectorAll(".panneau").forEach((p) => p.classList.add("cache"));
    onglet.classList.add("actif");
    document.querySelector(`#${onglet.dataset.cible}`).classList.remove("cache");
  });
});

const interrupteur = document.querySelector("#interrupteur");
interrupteur.addEventListener("click", () => {
  const actif = interrupteur.classList.toggle("actif");
  // Le libellé change au lieu de l'état : on ne sait plus s'il décrit l'état ou l'action.
  document.querySelector("#libelle-interrupteur").textContent = actif ? "Désactiver" : "Activer";
});
