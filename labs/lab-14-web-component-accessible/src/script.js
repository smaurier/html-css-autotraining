// STARTER.
// Trois défauts :
//   1. aucun rôle exposé : <bascule-notifs> est une div pour l'arbre d'accessibilité,
//   2. aucun état exposé,
//   3. pas focusable, donc inutilisable au clavier.

class BasculeNotifs extends HTMLElement {
  connectedCallback() {
    const racine = this.attachShadow({ mode: "open" });
    racine.innerHTML = `
      <style>
        :host { display: inline-flex; gap: 0.5rem; align-items: center; }
        .piste { inline-size: 2.4rem; block-size: 1.3rem; border-radius: 1rem;
                 background: #767676; display: inline-flex; align-items: center; padding: 2px; }
        .pouce { inline-size: 1rem; block-size: 1rem; border-radius: 50%; background: #fff; }
        :host(.actif) .piste { background: #1b5e20; }
        :host(.actif) .pouce { translate: 1.1rem 0; }
      </style>
      <span class="piste"><span class="pouce"></span></span>
      <span class="libelle">${this.getAttribute("libelle") ?? ""}</span>
    `;

    this.addEventListener("click", () => this.classList.toggle("actif"));
  }
}

customElements.define("bascule-notifs", BasculeNotifs);
