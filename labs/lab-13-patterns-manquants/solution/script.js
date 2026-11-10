// SOLUTION DE RÉFÉRENCE. À n'ouvrir qu'après ton GREEN.
//
// Le contrat d'un pattern a trois parties indissociables : les rôles, les états, le
// clavier. Les rôles sont dans le HTML, les états et le clavier sont ici.
// Module 17 § 3.

const onglets = [...document.querySelectorAll('[role="tab"]')];

function activer(indice, deplacerLeFocus = true) {
  onglets.forEach((onglet, i) => {
    const actif = i === indice;
    onglet.setAttribute("aria-selected", String(actif));
    // Focus géré : un seul onglet reste dans l'ordre de tabulation.
    onglet.tabIndex = actif ? 0 : -1;
    document.querySelector(`#${onglet.getAttribute("aria-controls")}`).hidden = !actif;
  });
  if (deplacerLeFocus) onglets[indice].focus();
}

onglets.forEach((onglet, i) => {
  onglet.addEventListener("click", () => activer(i));

  onglet.addEventListener("keydown", (evenement) => {
    const dernier = onglets.length - 1;
    let cible = null;

    // Le contrat clavier attendu d'une liste d'onglets, touche par touche.
    if (evenement.key === "ArrowRight") cible = i === dernier ? 0 : i + 1;
    else if (evenement.key === "ArrowLeft") cible = i === 0 ? dernier : i - 1;
    else if (evenement.key === "Home") cible = 0;
    else if (evenement.key === "End") cible = dernier;

    if (cible !== null) {
      evenement.preventDefault();
      activer(cible);
    }
  });
});

const interrupteur = document.querySelector("#interrupteur");

interrupteur.addEventListener("click", () => {
  const actif = interrupteur.getAttribute("aria-checked") !== "true";
  // L'état change. Le libellé, lui, ne change JAMAIS : sinon on ne sait plus s'il décrit
  // l'état courant ou l'action à venir. Module 17 § 3.2.
  interrupteur.setAttribute("aria-checked", String(actif));
});
