// STARTER. Un défilement automatique, qu'on ne peut pas arrêter.
let index = 0;
const piste = document.querySelector("#piste");

setInterval(() => {
  index = (index + 1) % 3;
  piste.scrollTo({ left: piste.clientWidth * index, behavior: "smooth" });
}, 3000);
