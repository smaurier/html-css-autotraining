// STARTER. À la soumission, la bulle native du navigateur, et rien d'autre.
// Aucun message relié au champ, aucun résumé, aucun compte d'erreurs.
document.querySelector("#formulaire").addEventListener("submit", (evenement) => {
  evenement.preventDefault();
  evenement.currentTarget.reportValidity();
});
