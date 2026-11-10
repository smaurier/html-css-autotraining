# 15. Interactivité native

> **Outcome :** à la fin, tu sais faire un accordéon exclusif sans JavaScript, tu sais animer
> l'ouverture d'un `<details>`, tu sais ce que `hidden-until-found` change pour la recherche dans
> la page, et tu sais quand l'API de navigation remplace un routeur et quand elle ne le remplace
> pas.

## 1. Le mécanisme : l'état dans le DOM plutôt que dans le script

Un composant dépliable a un état : ouvert ou fermé. Trois endroits possibles pour le stocker.

| Où vit l'état | Conséquence |
|---|---|
| Dans une variable JavaScript | il faut la synchroniser avec le DOM et avec l'arbre d'accessibilité |
| Dans une classe CSS | l'apparence est juste, l'arbre d'accessibilité ne sait rien |
| **Dans un attribut HTML natif** | l'apparence, le clavier et l'arbre sont corrects d'office |

La troisième ligne est tout l'intérêt de ce module. `<details open>` porte son état dans le DOM,
et le navigateur en déduit le rôle, l'état `expanded`, le comportement clavier et le rendu. Rien
à synchroniser, donc rien à désynchroniser.

## 2. `<details>` et `<summary>`

```html
<details name="faq">
  <summary>Comment modifier mon mot de passe ?</summary>
  <p>Depuis la page Profil, section Sécurité.</p>
</details>
<details name="faq">
  <summary>Comment supprimer mon compte ?</summary>
  <p>Écris-nous, nous traitons la demande sous 48 heures.</p>
</details>
```

L'attribut `name` partagé crée un **accordéon exclusif** : ouvrir l'un ferme l'autre. C'est le
composant que l'on écrivait en JavaScript, réduit à un attribut.

Trois points à connaître.

**`<summary>` est le bouton.** Il est focusable, activable à `Entrée` et à `Espace`, et porte le
rôle attendu. Ne jamais mettre un `<button>` dedans : on obtient un contrôle imbriqué dans un
contrôle, ce qui est invalide et produit un comportement imprévisible.

**L'évènement est `toggle`.** Il porte le nouvel état, consultable par `details.open`.

**Le contenu fermé n'est pas dans l'arbre d'accessibilité**, ce qui est correct et conforme à
`10.8 (A)`. Il n'est pas non plus trouvable par la recherche du navigateur, ce qui amène au § 4.

### 2.1 Animer l'ouverture

Longtemps impossible, parce qu'il fallait animer vers une hauteur `auto`. Avec les mécanismes des
modules 03 et 12 :

```css
details::details-content {
  block-size: 0;
  overflow: hidden;
  transition: block-size 300ms, content-visibility 300ms allow-discrete;
}
details[open]::details-content {
  block-size: auto;              /* interpolable grâce à la ligne suivante */
}
details { interpolate-size: allow-keywords; }

@media (prefers-reduced-motion: reduce) {
  details::details-content { transition: none; }
}
```

`::details-content` est le pseudo-élément qui enveloppe le contenu, et il n'existe que pour ça :
sans lui, il n'y avait aucune boîte à animer. Associé à `interpolate-size: allow-keywords` du
module 03 § 3.2 et à `allow-discrete` du module 12 § 1.1, l'accordéon animé devient du CSS.

### 2.2 L'élément d'accordéon

Une proposition est à l'étude pour un élément d'accordéon de premier niveau, qui porterait le
groupe lui-même plutôt que de le déduire d'un attribut `name` partagé. C'est une des nouveautés
de l'enquête 2026. Statut : proposition. La grille du module 21 s'applique, et le repli existe
déjà et fonctionne, à savoir `<details name>`.

## 3. `hidden` et ses degrés

```html
<div hidden>Retiré du rendu et de l'arbre.</div>
<div hidden="until-found">Retiré du rendu, mais trouvable par la recherche du navigateur.</div>
```

`hidden="until-found"` est la réponse à un problème réel : la recherche dans la page, avec
`Ctrl+F`, ne trouve pas ce qui est replié. Sur une page de documentation ou une FAQ, c'est une
perte sèche, et elle touche tout le monde.

Avec `until-found`, le navigateur trouve le texte, **déplie automatiquement** la section et émet
un évènement `beforematch` pour permettre de réagir.

```js
section.addEventListener("beforematch", () => {
  section.closest("details")?.setAttribute("open", "");
});
```

Le lien avec `10.8 (A)` est subtil et mérite d'être compris : le critère demande que les contenus
cachés soient **correctement** masqués ou affichés aux technologies d'assistance. `until-found`
reste un contenu caché tant qu'il n'est pas trouvé, donc il est légitimement absent de l'arbre.
Ce qui serait fautif, c'est un contenu visible à l'écran mais absent de l'arbre, ou l'inverse.

## 4. L'API de navigation

```js
navigation.addEventListener("navigate", (e) => {
  if (!e.canIntercept || e.hashChange) return;
  e.intercept({
    async handler() {
      const vue = await chargerVue(e.destination.url);
      document.startViewTransition(() => rendre(vue));   /* module 12 */
    },
  });
});
```

Remplace `history.pushState` et `popstate`, avec trois apports concrets : un évènement unique pour
toutes les navigations, y compris le bouton Retour ; la connaissance de la destination avant la
mutation ; et une intégration directe avec les transitions de vue.

C'est l'une des nouveautés 2026 de l'enquête, et le point à retenir est de méthode : elle
remplace la **plomberie** d'un routeur, pas un routeur. Si le projet utilise déjà le routeur d'un
framework, cette API est en dessous, pas à côté.

### 4.1 Ce que la navigation doit à l'accessibilité

Une navigation interceptée ne recharge pas la page. Donc, contrairement à une navigation
classique, rien ne se produit automatiquement : le titre ne change pas, le focus ne revient pas
en haut, et aucun lecteur d'écran n'annonce quoi que ce soit. Trois gestes sont à faire à la
main.

```js
document.title = "Membres | TribuZen";        // 8.5 (A) : titre de page pertinent
document.querySelector("main h1")?.focus();    // avec tabindex="-1" sur le h1
annonceur.textContent = "Page Membres chargée"; // une région role="status"
```

Le critère `8.5 (A)` est souvent oublié dans une application monopage, parce que personne ne
pense à vérifier le `<title>` après une navigation qui n'a pas rechargé la page. Et sans
déplacement de focus, la personne au clavier continue de naviguer dans l'ancienne page du point
de vue du focus.

## 5. L'accessibilité dans ce module

**`7.1 (A)`, rôle, nom et état.** Fourni par `<details>`, à écrire entièrement pour un dépliant
maison. C'est l'argument qui tranche entre les deux.

**`7.3 (A)`, utilisable au clavier.** Fourni, à condition de ne pas remplacer `<summary>` par une
`<div>` cliquable.

**`10.8 (A)`, contenus cachés.** Voir § 3 : la cohérence entre ce qui est visible et ce qui est
dans l'arbre.

**`13.2 (A)`, pas de nouvelle fenêtre sans action de l'utilisateur.** Et quand une nouvelle
fenêtre est ouverte volontairement, elle doit être annoncée dans l'intitulé du lien, sinon la
personne perd son contexte sans comprendre pourquoi.

```html
<a href="/rapport.pdf" target="_blank" rel="noopener">
  Rapport annuel <span class="indication">(PDF, nouvelle fenêtre)</span>
</a>
```

**`8.5 (A)`, titre de page**, qui devient un sujet actif dès qu'on intercepte la navigation.

## 6. Ce que l'enquête interroge, et où c'est traité

Items `html2026` rattachés à ce module : `details_element`, `accordion_element`,
`hidden_until_found`, `navigation_api`.

`navigation_api` est une nouveauté 2026, et `accordion_element` aussi. Les deux relèvent de la
même tendance que les modules 09 et 12 : ce qui demandait du JavaScript devient déclaratif. La
conséquence pour un développeur senior est moins le gain de lignes que le gain de **correction
par défaut** : un état porté par le DOM ne peut pas se désynchroniser de l'arbre d'accessibilité,
alors qu'un état porté par une variable le peut, et le fait.

## 7. Les pièges

1. **Mettre un `<button>` dans un `<summary>`.** Contrôle imbriqué, comportement imprévisible.
2. **Remplacer `<summary>` par une `<div>` cliquable.** Plus de rôle, plus de clavier, `7.1` et
   `7.3`.
3. **Oublier `prefers-reduced-motion` sur l'animation de `::details-content`.**
4. **Replier du contenu cherchable sans `hidden="until-found"`.** `Ctrl+F` ne le trouve plus.
5. **Intercepter la navigation sans mettre à jour le `<title>`.** Non conforme `8.5 (A)`.
6. **Intercepter la navigation sans déplacer le focus.** La personne au clavier reste dans
   l'ancienne page.
7. **Ouvrir une nouvelle fenêtre sans l'annoncer.** `13.2 (A)`.
8. **Porter l'état d'un dépliant dans une classe CSS.** L'écran est juste, l'arbre est muet.

## 8. Auto-test

1. Quels sont les trois endroits possibles pour l'état d'un dépliable, et lequel ne peut pas se
   désynchroniser ?
2. Comment fait-on un accordéon exclusif sans JavaScript ?
3. Pourquoi ne faut-il jamais mettre un `<button>` dans un `<summary>` ?
4. Quels trois mécanismes permettent d'animer l'ouverture d'un `<details>` ?
5. Que résout `hidden="until-found"`, et quel évènement permet d'y réagir ?
6. Pourquoi `until-found` n'est-il pas une infraction à `10.8 (A)` ?
7. Cite les trois gestes à faire à la main après une navigation interceptée, et le critère associé
   au premier.
8. Que remplace l'API de navigation, exactement ?
