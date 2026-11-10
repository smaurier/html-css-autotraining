# 18. Web components et shadow DOM

> **Outcome :** à la fin, tu sais ce que le shadow DOM encapsule et ce qu'il n'encapsule pas, tu
> sais pourquoi une référence `aria-labelledby` ne traverse pas une frontière de shadow et ce
> qu'il faut faire à la place, tu sais exposer un rôle et un état par `ElementInternals`, et tu
> sais rendre un composant au premier octet avec le shadow DOM déclaratif.
>
> **Lab :** [lab-14 : web component accessible](../labs/lab-14-web-component-accessible/README)

## 1. Le mécanisme : trois technologies distinctes

On dit « web components » pour trois choses indépendantes, utilisables séparément.

| Technologie | Rôle |
|---|---|
| Éléments personnalisés | associer un nom de balise à une classe |
| Shadow DOM | un arbre encapsulé, avec son style |
| `<template>` et `<slot>` | du balisage inerte, et des points d'insertion |

Les utiliser séparément est souvent le bon choix : un élément personnalisé **sans** shadow DOM est
un excellent moyen d'enrichir du HTML existant, et c'est le motif le plus durable, parce qu'il ne
coupe aucun des deux arbres.

## 2. L'élément personnalisé

```js
class CompteurMembres extends HTMLElement {
  static observedAttributes = ["total"];

  connectedCallback() { this.#rendre(); }
  disconnectedCallback() { this.#controleur?.abort(); }
  attributeChangedCallback(nom, avant, apres) { if (avant !== apres) this.#rendre(); }

  #rendre() { … }
  #controleur = new AbortController();
}

customElements.define("compteur-membres", CompteurMembres);
```

Quatre règles qui ne se devinent pas.

**Le nom doit contenir un tiret.** C'est ce qui garantit qu'aucun élément standard futur ne
portera le même nom.

**`connectedCallback` peut être appelé plusieurs fois.** Déplacer un élément dans le DOM
déclenche une déconnexion puis une reconnexion. Tout ce qui s'abonne doit se désabonner dans
`disconnectedCallback`, et un `AbortController` est la façon propre de le faire en une ligne.

**Ne rien faire dans le constructeur.** Pas d'attribut, pas d'enfant : l'élément peut être
construit avant d'être dans le document. Le travail va dans `connectedCallback`.

**Les attributs sont des chaînes.** `observedAttributes` est la liste de ceux qu'on surveille, et
la conversion est à ta charge.

## 3. Le shadow DOM

```js
this.attachShadow({ mode: "open" });
this.shadowRoot.innerHTML = `
  <style>
    :host { display: block; }
    :host([compact]) { font-size: 0.875rem; }
    .valeur { color: var(--compteur-couleur, currentColor); }
  </style>
  <p class="valeur"><slot></slot></p>
`;
```

### 3.1 Ce qui est encapsulé, et ce qui ne l'est pas

| Encapsulé | Non encapsulé |
|---|---|
| les sélecteurs : une règle du document ne vise pas l'intérieur | les **propriétés héritées** : `color`, `font`, `line-height` traversent |
| les identifiants : deux shadow roots peuvent avoir le même `id` | les **custom properties** : elles traversent, et c'est l'API de thème |
| les requêtes `querySelector` du document | l'**arbre d'accessibilité** : il est reconstruit à plat |

La deuxième colonne est la plus importante. Le shadow DOM n'isole pas du tout ce qu'on croit : la
typographie et la couleur entrent, et les custom properties aussi. C'est voulu, et c'est ce qui
rend un composant thémable :

```css
/* Depuis le document, sans connaître l'intérieur du composant */
compteur-membres { --compteur-couleur: var(--accent); }
```

### 3.2 Les sélecteurs de frontière

```css
:host { … }                        /* l'élément hôte lui-même */
:host([compact]) { … }             /* l'hôte selon un de ses attributs */
:host(.sombre) .valeur { … }       /* selon une classe posée par le document */
::slotted(p) { … }                 /* le contenu projeté, depuis l'intérieur */
:host-context(.theme-sombre) { … } /* selon un ancêtre, support inégal */
```

Et depuis l'extérieur, uniquement ce que le composant autorise :

```css
compteur-membres::part(etiquette) { font-weight: 600; }
```

```html
<span part="etiquette">Membres</span>
```

`::part` est l'API de style publique du composant : ce qui n'est pas marqué `part` n'est pas
stylable de l'extérieur. C'est un contrat, et il doit être documenté comme tel. `exportparts`
permet de republier les parts d'un composant imbriqué.

Note : le contenu projeté dans un `<slot>` reste stylé par le **document**, pas par le composant.
C'est la surprise la plus fréquente du débutant en shadow DOM.

## 4. Le shadow DOM déclaratif

```html
<carte-membre>
  <template shadowrootmode="open">
    <style>:host { display: grid; gap: 0.5rem; }</style>
    <h3><slot name="nom"></slot></h3>
    <slot></slot>
  </template>
  <span slot="nom">Alondra</span>
  <p>Inscrite en mars 2026.</p>
</carte-membre>
```

Le shadow DOM est construit par l'analyseur HTML, **sans JavaScript**. Trois conséquences.

**Rendu côté serveur possible.** Un composant arrive peint au premier octet, ce qui était le
principal reproche fait aux web components.

**Pas de contenu non stylé transitoire.** Le style du shadow arrive avec le balisage.

**Dégradation honnête.** Si le script ne charge jamais, le contenu est là et stylé, seuls les
comportements manquent. C'est exactement l'amélioration progressive, et c'est ce que la question
`progressive_enhancement_priority` de l'enquête 2026 cherche à mesurer.

## 5. `ElementInternals`, le rôle et l'état

C'est le point qui transforme un composant joli en composant accessible.

```js
class InterrupteurNotifs extends HTMLElement {
  #internals = this.attachInternals();

  connectedCallback() {
    this.#internals.role = "switch";                 // rôle, sans attribut dans le DOM
    this.#internals.ariaChecked = "false";
    this.tabIndex = 0;
    this.addEventListener("click", () => this.#basculer());
    this.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); this.#basculer(); }
    });
  }

  #basculer() {
    const actif = this.#internals.ariaChecked !== "true";
    this.#internals.ariaChecked = String(actif);
    this.#internals.states.add("actif");             // exposé au CSS par :state(actif)
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }
}
```

```css
interrupteur-notifs:state(actif) .piste { background: var(--accent); }
```

Trois apports.

**Le rôle et les propriétés ARIA sans attributs.** Ils vivent dans l'élément, pas dans le DOM, ce
qui évite qu'un parent les écrase et garde le balisage propre. Le document peut toujours les
surcharger, ce qui est volontaire.

**Les états personnalisés**, exposés au CSS par `:state()`. Fini les classes `is-active`
synchronisées à la main.

**Les éléments associés aux formulaires.** Avec `static formAssociated = true`, un composant peut
participer à un formulaire : `setFormValue()`, `setValidity()`, et il entre dans la validation de
contraintes du module 14.

## 6. L'accessibilité dans ce module

### 6.1 L'arbre traverse le shadow, les références non

Le shadow DOM **n'interrompt pas** l'arbre d'accessibilité : il est aplati, et un lecteur d'écran
lit à travers. Bonne nouvelle.

Mais les références par identifiant, elles, **ne traversent pas les frontières de shadow**. C'est
le piège majeur du module, et il est silencieux.

```html
<!-- ⛔ Ne fonctionne pas : le label est dans le document, le champ dans le shadow -->
<label id="etq-ville">Ville</label>
<champ-texte aria-labelledby="etq-ville"></champ-texte>
```

`aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-activedescendant` et l'association
`<label for>` ne peuvent pas désigner un élément situé dans un autre arbre. Rien n'est signalé :
la relation est simplement ignorée.

Trois parades, par ordre de solidité :

1. **Garder la relation d'un seul côté de la frontière.** Le label et le champ sont tous les deux
   dans le shadow, et le composant reçoit son libellé par un attribut ou un slot.
2. **Exposer le nom par `ElementInternals`**, avec `this.#internals.ariaLabel`, en le dérivant
   d'un attribut de l'hôte.
3. **Ne pas utiliser de shadow DOM** pour ce composant. C'est une option valable, et souvent la
   bonne quand le composant est surtout un champ de formulaire.

### 6.2 Les critères

**`8.9 (A)`, respect de la sémantique.** `<mon-composant>` n'a aucun rôle implicite, exactement
comme une `<div>`. S'il est interactif, le rôle est à fournir par `ElementInternals`, et s'il
structure du contenu, il doit contenir du balisage sémantique réel plutôt que des `<div>`.

**`7.1 (A)`, rôle, nom et état**, intégralement à ta charge, comme au module 17. Le shadow DOM
n'ajoute rien, et il complique la vérification puisqu'il faut inspecter l'arbre aplati.

**`10.8 (A)`, contenus cachés.** Un `<slot>` sans contenu projeté ne doit pas laisser de boîte
vide annoncée. `slot:not(:has(*))` et l'évènement `slotchange` permettent de traiter le cas.

**`7.3 (A)`, clavier.** Un élément personnalisé n'est pas focusable : il faut `tabIndex`, et
gérer les touches, comme au module 17.

### 6.3 Comment vérifier

Le réflexe à prendre : dans l'inspecteur d'accessibilité, regarder l'arbre **aplati**, pas le
DOM. Et au moindre doute sur une relation ARIA entre un composant et le document, la tester avec
un lecteur d'écran, parce que c'est le seul endroit où l'échec silencieux du § 6.1 devient
visible.

## 7. Ce que l'enquête interroge, et où c'est traité

Items `html2026` rattachés à ce module : `custom_elements_using`, `custom_elements_defining`,
`declarative_custom_elements`, `scoped_element_registries`, `shadow_dom`,
`declarative_shadow_dom`, `element_internals`, `html_modules`.

Deux items méritent un mot.

**Les registres à portée** permettent de définir un élément dans une portée donnée plutôt que
globalement, ce qui règle le conflit de deux versions d'un même composant dans une page. C'est un
problème réel des grandes applications composites, et c'est le genre de besoin qu'on ne rencontre
qu'à l'échelle.

**Les modules HTML** visent à importer du balisage comme on importe un module JavaScript. Statut
de proposition, et c'est l'élément qui compléterait vraiment le shadow DOM déclaratif.

Une remarque d'audit, pour finir, qui vient du relevé du 09/11/2026 : « shadow dom » apparaissait
dans quatre fichiers du curriculum, tous dans le cours Architecture, sous l'angle des
micro-frontends. La pratique, à savoir la portée du style, les slots, `ElementInternals` et le
piège des références ARIA, n'était traitée nulle part. C'est l'écart typique entre connaître un
concept et savoir le livrer.

## 8. Les pièges

1. **Travailler dans le constructeur.** L'élément peut ne pas être dans le document.
2. **Oublier de se désabonner dans `disconnectedCallback`.** Un déplacement dans le DOM
   rebranche tout.
3. **Croire que le shadow DOM isole la typographie.** Les propriétés héritées traversent.
4. **Croire qu'il isole les custom properties.** Elles traversent, et c'est l'API de thème.
5. **Référencer un `id` du document depuis le shadow, ou l'inverse.** Ignoré silencieusement.
6. **Styler le contenu projeté depuis le composant.** Il appartient au document.
7. **Oublier `part` et découvrir qu'aucun style externe n'est possible.**
8. **Ne pas poser de rôle sur un composant interactif.** `<mon-composant>` est une `<div>` pour
   l'arbre.
9. **Oublier `tabIndex` et la gestion des touches.** Non conforme `7.3 (A)`.
10. **Mettre du shadow DOM là où un élément personnalisé nu suffisait.**

## 9. Lire avant le lab

Pour [lab-14](../labs/lab-14-web-component-accessible/README) : § 3.1, § 4, § 5 en entier, § 6.1.
Une lecture, puis page blanche.

## 10. Auto-test

1. Quelles sont les trois technologies qu'on appelle « web components », et pourquoi les utiliser
   séparément ?
2. Pourquoi ne faut-il rien faire dans le constructeur d'un élément personnalisé ?
3. Qu'est-ce que le shadow DOM encapsule, et quelles deux catégories de choses traversent ?
4. Que fait `::part`, et pourquoi est-ce un contrat ?
5. Qui style le contenu projeté dans un `<slot>` ?
6. Cite trois apports du shadow DOM déclaratif.
7. Pourquoi `aria-labelledby` ne fonctionne-t-il pas à travers une frontière de shadow, et quelles
   sont les trois parades ?
8. Comment expose-t-on un rôle et un état sans attribut dans le DOM ?
9. Quel arbre faut-il regarder dans l'inspecteur pour vérifier un composant à shadow DOM ?
