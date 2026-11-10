// SOLUTION DE RÉFÉRENCE. À n'ouvrir qu'après ton GREEN.
//
// Le shadow DOM est déjà là, construit par l'analyseur HTML. Le script ne fait que ce que
// le balisage ne peut pas faire : exposer le rôle, le nom, l'état, et gérer le clavier.

class BasculeNotifs extends HTMLElement {
  #internals = this.attachInternals();

  connectedCallback() {
    // Le rôle et le nom vivent dans l'élément, pas dans le DOM : un parent ne peut pas
    // les écraser, et le balisage reste propre. Module 18 § 5.
    this.#internals.role = "switch";
    this.#internals.ariaChecked = "false";

    // Le nom accessible vient d'un attribut de l'hôte. On ne compte PAS sur un
    // aria-labelledby qui traverserait la frontière : il serait ignoré en silence.
    const libelle = this.getAttribute("libelle");
    if (libelle) this.#internals.ariaLabel = libelle;

    // 7.3 (A) : un élément personnalisé n'est pas focusable. Il faut le dire.
    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;

    this.addEventListener("click", () => this.#basculer());
    this.addEventListener("keydown", (evenement) => {
      if (evenement.key === " " || evenement.key === "Enter") {
        evenement.preventDefault();
        this.#basculer();
      }
    });
  }

  #basculer() {
    const actif = this.#internals.ariaChecked !== "true";
    this.#internals.ariaChecked = String(actif);

    // Les états personnalisés, exposés au CSS par :state(). Fini les classes
    // `is-active` à synchroniser à la main.
    this.#internals.states[actif ? "add" : "delete"]("actif");

    this.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

customElements.define("bascule-notifs", BasculeNotifs);
