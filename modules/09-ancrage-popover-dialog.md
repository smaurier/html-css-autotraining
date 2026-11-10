# 09. Positionnement ancré, popover et dialog

> **Outcome :** à la fin, tu sais ce qu'est le top layer et pourquoi il met fin aux guerres de
> `z-index`, tu sais distinguer un piège de focus légitime d'un piège interdit, tu sais quelles
> obligations d'accessibilité la plateforme prend en charge et lesquelles restent à ta charge, et
> tu sais ancrer un élément sans mesurer quoi que ce soit en JavaScript.
>
> **Lab :** [lab-08 : ancrage et popover](../labs/lab-08-ancrage-et-popover/README)

## 1. Le mécanisme : le top layer

Jusqu'ici, un élément affiché au-dessus de tout devait gagner une bataille de contextes
d'empilement, décrite au module 04 § 4. Le résultat était connu : des `z-index` à cinq chiffres,
et des modales enfermées dans un ancêtre transformé.

Le **top layer** est une couche de rendu qui vit **en dehors** de l'arbre de peinture habituel.
Un élément promu dans le top layer :

- se peint au-dessus de tout le document, quel que soit son `z-index` ou celui de ses ancêtres ;
- n'est plus affecté par les contextes d'empilement de ses ancêtres ;
- n'est plus affecté par un `transform`, un `filter` ou un `contain` sur un ancêtre ;
- n'est plus coupé par un `overflow: hidden` d'un ancêtre.

Deux mécanismes y promeuvent un élément : `dialog.showModal()` et l'attribut `popover`. On n'y
accède pas en CSS. C'est ce qui rend ces deux API intéressantes bien au-delà de leur apparence.

## 2. `<dialog>`

```html
<dialog id="confirmation">
  <h2>Supprimer ce membre ?</h2>
  <p>Cette action est définitive.</p>
  <form method="dialog">
    <button value="annuler">Annuler</button>
    <button value="confirmer" autofocus>Supprimer</button>
  </form>
</dialog>
```

```js
const boite = document.querySelector("#confirmation");
boite.showModal();   // modal : top layer, ::backdrop, reste de la page inerte
boite.show();        // non modal : pas de backdrop, le reste de la page reste utilisable
```

### 2.1 Ce que `showModal()` fait pour toi

C'est la partie qui justifie d'abandonner les modales maison, et elle est substantielle :

| Fourni par la plateforme | Détail |
|---|---|
| Promotion dans le top layer | plus de `z-index` |
| `::backdrop` | un pseudo-élément stylable pour le fond |
| Inertie du reste de la page | équivaut à `inert`, clics et tabulation bloqués dehors |
| Confinement du focus | la tabulation tourne dans la boîte, sans code |
| Fermeture par `Échap` | émet `cancel` puis `close` |
| Rôle `dialog` et état modal | exposés à l'arbre d'accessibilité |
| `method="dialog"` | un bouton de formulaire qui ferme et transmet sa `value` |

### 2.2 Ce qui reste à ta charge

Trois choses, et ce sont elles qui font la différence entre une modale qui passe l'audit et une
qui ne passe pas.

**Le nom accessible de la boîte.** Le rôle `dialog` est fourni, le nom non.

```html
<dialog aria-labelledby="titre-confirmation">
  <h2 id="titre-confirmation">Supprimer ce membre ?</h2>
```

**Le focus initial.** Sans `autofocus`, le focus va sur la boîte elle-même, ce qui est
acceptable, mais rarement optimal. Attention au choix : placer `autofocus` sur une action
destructrice fait courir le risque d'une validation par inadvertance. Sur une confirmation de
suppression, `autofocus` va sur « Annuler ».

**La restitution du focus à la fermeture.** C'est le point le plus oublié. Le navigateur rend en
principe le focus à l'élément qui a ouvert la boîte, mais dès que l'ouverture est pilotée par du
code, que l'invocateur disparaît, ou que la boîte est rendue conditionnellement par un framework,
la chaîne se casse et le focus repart au début du document.

```js
let invocateur = null;
boutonOuvrir.addEventListener("click", () => { invocateur = boutonOuvrir; boite.showModal(); });
boite.addEventListener("close", () => invocateur?.focus());
```

Un focus perdu à la fermeture oblige l'utilisateur au clavier à re-parcourir toute la page.
C'est le symptôme classique, et il tombe sous `12.9 (A)`, voir § 6.

### 2.3 `closedby`

```html
<dialog closedby="any">        <!-- Échap, clic sur le backdrop -->
<dialog closedby="closerequest"><!-- Échap seulement, le défaut pour une modale -->
<dialog closedby="none">        <!-- ni l'un ni l'autre : fermeture par bouton uniquement -->
```

`closedby="none"` est le seul cas où un piège de focus est légitime : une boîte qui exige une
décision, par exemple une confirmation de paiement. La condition d'acceptabilité est qu'une
**sortie existe et soit visible**, à savoir un bouton de fermeture ou d'annulation. Un `none`
sans sortie visible est un piège au clavier, donc non conforme.

## 3. `popover`

```html
<button popovertarget="menu-compte">Mon compte</button>
<div id="menu-compte" popover>
  <a href="/profil">Profil</a>
  <a href="/deconnexion">Déconnexion</a>
</div>
```

Aucun JavaScript. L'attribut `popovertarget` câble le bouton, et la plateforme fournit la bascule,
la promotion dans le top layer, la fermeture au clic extérieur et à `Échap`, et la gestion des
popovers imbriqués.

### 3.1 Les trois types

| Valeur | Fermeture légère | Un seul à la fois | Usage |
|---|---|---|---|
| `popover` ou `popover="auto"` | oui, clic extérieur et `Échap` | oui, ferme les autres | menus, sélecteurs |
| `popover="manual"` | non, fermeture par code seulement | non, ils coexistent | notifications, panneaux persistants |
| `popover="hint"` | oui | ferme les autres `hint`, pas les `auto` | infobulles au survol |

`hint` est la nouveauté qui comble un trou réel : une infobulle ne doit pas fermer le menu
ouvert. Avec deux `auto`, elle le fermait.

### 3.2 La différence avec `dialog`, et pourquoi elle compte

Un popover **n'est pas modal** : il ne rend pas le reste de la page inerte, il ne confine pas le
focus, et il n'a pas de rôle propre. C'est volontaire, et c'est la bonne nouvelle : un menu ne
doit pas confiner le focus.

Conséquence directe : **un popover n'apporte aucune sémantique.** Le rôle, le nom et l'état
restent entièrement à écrire.

```html
<button popovertarget="menu-compte" aria-expanded="false" aria-controls="menu-compte">
  Mon compte
</button>
<div id="menu-compte" popover role="menu" aria-label="Compte">…</div>
```

Et `aria-expanded` doit être maintenu, ce que la plateforme ne fait pas :

```js
menu.addEventListener("toggle", (e) => {
  bouton.setAttribute("aria-expanded", String(e.newState === "open"));
});
```

L'évènement `toggle` porte `oldState` et `newState`, ce qui évite d'interroger l'état.

## 4. Les invocateurs par commande

```html
<button command="show-modal" commandfor="confirmation">Supprimer</button>
<button command="close" commandfor="confirmation">Fermer</button>
<button command="toggle-popover" commandfor="menu-compte">Mon compte</button>
```

Généralise `popovertarget` à d'autres actions, dont `show-modal`, `close`, `request-close`,
`toggle-popover`, `show-picker`. L'intérêt réel n'est pas d'économiser trois lignes de
JavaScript, c'est que la relation entre le bouton et sa cible devient **déclarative**, donc
lisible dans le HTML et non dispersée dans un gestionnaire d'évènements. Des commandes
personnalisées, préfixées par deux tirets, émettent un `CommandEvent` sur la cible.

## 5. Le positionnement ancré

Le problème historique : placer une bulle à côté de son bouton demandait de mesurer le bouton, de
mesurer la bulle, de calculer, d'écouter le défilement et le redimensionnement, donc une
bibliothèque.

```css
.declencheur { anchor-name: --compte; }

.bulle {
  position: fixed;
  position-anchor: --compte;
  position-area: block-end span-inline-start;   /* sous l'ancre, aligné à son début */
  margin-block-start: 0.5rem;

  /* Si ça ne tient pas, essayer autre chose, dans l'ordre */
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
}
```

`position-area` découpe l'espace autour de l'ancre en une grille de neuf cases et permet de
désigner la case voulue, en coordonnées **logiques**. Pour un contrôle fin, `anchor()` donne
directement les arêtes :

```css
.bulle { inset-block-start: anchor(block-end); inset-inline-start: anchor(inline-start); }
```

`position-try-fallbacks` est l'apport décisif : le repli automatique quand la position demandée
sort du viewport, qui était la moitié du code d'une bibliothèque de positionnement.

Deux points d'attention. L'ancre et l'élément ancré doivent partager un **contexte de
positionnement** compatible, ce qui est automatique dans le top layer et plus délicat
autrement. Et un élément ancré hors du top layer reste soumis aux contextes d'empilement et à
l'`overflow` de ses ancêtres, ce qui ramène au module 04. Le couple naturel est donc
`popover` plus ancrage.

## 6. L'accessibilité dans ce module

**`7.1 (A)`, rôle, nom et état.** Pour `dialog`, le rôle est fourni, le nom est à toi. Pour
`popover`, tout est à toi, y compris le maintien de `aria-expanded`.

**`7.3 (A)`, utilisable au clavier.** Fourni par les deux API, à condition de ne pas remplacer
les boutons par des `div`. Un `<div onclick>` avec `popovertarget` n'est pas activable au
clavier, et le module 01 explique pourquoi.

**`12.9 (A)`, pas de piège au clavier.** Le confinement du focus d'une modale est un piège
**légitime**, parce que `Échap` en sort et que la sortie est connue. Il devient interdit dès que
`closedby="none"` est posé sans bouton de fermeture visible, ou que le focus n'est pas restitué à
la fermeture.

**`10.13 (AA)`, contenus additionnels contrôlables.** Un contenu qui apparaît au survol ou au
focus doit être fermable par `Échap`, survolable sans disparaître, et persistant tant que le
pointeur ou le focus reste dessus. C'est le critère qui tue la plupart des infobulles maison :
elles disparaissent dès que la souris quitte le déclencheur, donc on ne peut pas aller
sélectionner leur texte. `popover="hint"` gère `Échap` et la fermeture légère ; la persistance au
survol reste de ta responsabilité.

**`10.14 (AA)`, contenus additionnels au survol disponibles au clavier.** Une infobulle déclenchée
par `mouseenter` seulement n'existe pas pour quelqu'un qui navigue au clavier. Il faut `focus` en
plus, systématiquement.

## 7. Ce que l'enquête interroge, et où c'est traité

Items `html2026` rattachés à ce module : `anchor_positioning`, `popover_api`, `popover_hint`,
`dialog_element`, `dialog_closedby`, `command_invokers`, `element_before`.

Ce groupe est le plus intéressant de l'enquête pour un développeur senior, parce qu'il ne s'agit
pas de nouveautés cosmétiques : chacune supprime une catégorie de code existant. Le top layer
supprime la gestion des `z-index`, `dialog` supprime le confinement de focus maison, `popover`
supprime la fermeture au clic extérieur, l'ancrage supprime une bibliothèque entière. C'est le
cas type où la veille annuelle a un retour sur investissement immédiat, à savoir du code en
moins.

## 8. Les pièges

1. **Croire que `popover` est modal.** Il ne confine pas le focus et ne rend rien inerte.
2. **Croire que `popover` apporte un rôle.** Il n'apporte rien à l'arbre d'accessibilité.
3. **Oublier de maintenir `aria-expanded`.** Le bouton annonce un état faux.
4. **Oublier le nom accessible d'un `<dialog>`.** Le rôle est fourni, le nom non.
5. **Mettre `autofocus` sur l'action destructrice.** Validation par inadvertance.
6. **Ne pas restituer le focus à la fermeture.** L'utilisateur au clavier repart du début.
7. **Poser `closedby="none"` sans sortie visible.** Piège au clavier, non conforme `12.9 (A)`.
8. **Déclencher une infobulle au survol seulement.** Non conforme `10.14 (AA)`, et elle disparaît
   dès qu'on veut la lire, donc aussi `10.13 (AA)`.
9. **Ancrer un élément hors du top layer sans penser à l'`overflow` des ancêtres.**
10. **Poser `display` directement sur `[popover]`.** Celui-ci mérite son propre
    paragraphe, parce qu'il est silencieux et qu'il donne l'impression que l'API est cassée.

```css
/* ⛔ Le popover reste visible en permanence, et la fermeture ne se voit plus */
.menu[popover] { display: grid; }

/* ✅ On style l'état ouvert, et la feuille du navigateur garde la main sur l'état fermé */
.menu[popover] { /* position, bordure, fond… */ }
.menu:popover-open { display: grid; }
```

La feuille de style du navigateur met un popover fermé en `display: none`. L'écraser sur le
sélecteur d'attribut annule ce comportement : le menu s'affiche tout le temps, `Échap` et le
clic extérieur ferment bien le popover côté état, mais rien ne change à l'écran. On conclut
alors, à tort, que la fermeture légère ne fonctionne pas.

Le même raisonnement vaut pour `dialog` : son état fermé est géré par la feuille du
navigateur, et on style `dialog[open]` plutôt que `dialog`.

## 9. Lire avant le lab

Pour [lab-08](../labs/lab-08-ancrage-et-popover/README) : § 1, § 2.1 et 2.2 en entier, § 3.2,
§ 5 (les deux premiers blocs), § 6. Une lecture, puis page blanche.

## 10. Auto-test

1. Qu'est-ce que le top layer, et quelles quatre contraintes du module 04 fait-il disparaître ?
2. Cite quatre choses que `showModal()` fournit gratuitement, et trois qui restent à ta charge.
3. Quelle est la différence entre `show()` et `showModal()` ?
4. Quand un confinement de focus est-il légitime, et à partir de quand est-il une
   non-conformité ?
5. À quoi sert `popover="hint"`, et quel trou comble-t-il par rapport à `auto` ?
6. Pourquoi un popover n'a-t-il pas besoin de confiner le focus, contrairement à une modale ?
7. Que fait `position-try-fallbacks`, et quelle partie d'une bibliothèque remplace-t-il ?
8. Une infobulle qui apparaît au survol et disparaît quand la souris la quitte : quels deux
   critères sont en cause ?
