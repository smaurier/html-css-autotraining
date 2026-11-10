# 14. Formulaires natifs

> **Outcome :** à la fin, tu sais utiliser l'API de validation de contraintes au lieu de
> réécrire une validation, tu sais pourquoi `:invalid` est presque toujours le mauvais sélecteur,
> tu sais pourquoi un `placeholder` ne nomme rien, et tu connais les treize critères du thème 11
> et ce que chacun exige.
>
> **Lab :** [lab-12 : formulaire natif](../labs/lab-12-formulaire-natif/README)

## 1. Le mécanisme : la validation de contraintes

Le navigateur embarque un moteur de validation. Il connaît l'état de validité de chaque champ, il
sait pourquoi un champ est invalide, et il expose tout cela.

```html
<input id="courriel" type="email" name="courriel" required
       autocomplete="email" aria-describedby="aide-courriel">
<p id="aide-courriel">Format attendu : prenom.nom@exemple.fr</p>
```

```js
const champ = document.querySelector("#courriel");

champ.validity;          // ValidityState : valueMissing, typeMismatch, patternMismatch…
champ.validity.valid;    // booléen
champ.validationMessage; // le message du navigateur, dans la langue de l'utilisateur
champ.checkValidity();   // teste, émet « invalid », n'affiche RIEN
champ.reportValidity();  // teste ET affiche la bulle native
champ.setCustomValidity("Ce courriel est déjà utilisé.");  // message métier
champ.setCustomValidity("");                               // le lever, sinon le champ reste invalide
```

L'oubli classique est la dernière ligne : un `setCustomValidity` non réinitialisé laisse le champ
invalide pour toujours, et le formulaire ne se soumet plus sans raison visible.

### 1.1 Les drapeaux de `ValidityState`

| Drapeau | Cause |
|---|---|
| `valueMissing` | `required` et champ vide |
| `typeMismatch` | ne correspond pas au `type`, par exemple `email` ou `url` |
| `patternMismatch` | ne correspond pas à `pattern` |
| `tooLong`, `tooShort` | `maxlength`, `minlength` |
| `rangeUnderflow`, `rangeOverflow` | `min`, `max` |
| `stepMismatch` | ne tombe pas sur un pas de `step` |
| `badInput` | saisie que le navigateur ne peut pas interpréter |
| `customError` | un `setCustomValidity` est actif |

Savoir **lequel** est levé permet d'écrire un message utile, par exemple distinguer « ce champ est
obligatoire » de « ce format n'est pas reconnu », ce qui est exactement ce que `11.11` demande.

### 1.2 `:invalid` contre `:user-invalid`

```css
/* ⛔ Tous les champs obligatoires sont rouges AVANT que l'utilisateur n'ait rien saisi */
input:invalid { border-color: red; }

/* ✅ Rouge seulement après interaction */
input:user-invalid { border-color: var(--erreur); }
input:user-valid { border-color: var(--succes); }
```

`:invalid` est vrai dès le chargement : un champ `required` vide est invalide, c'est logique mais
inutilisable. `:user-invalid` ne devient vrai qu'après que l'utilisateur a interagi avec le champ
et l'a quitté, ou après une tentative de soumission. C'est le sélecteur qui correspond à ce qu'on
voulait dire.

Signaler une erreur avant toute saisie n'est pas seulement inélégant : pour une personne qui
navigue au lecteur d'écran, un formulaire annoncé comme invalide dès l'arrivée est une
information fausse.

### 1.3 Valider soi-même sans perdre le natif

```html
<form novalidate>
```

`novalidate` désactive l'affichage des bulles natives mais **conserve** l'API. C'est le bon
réglage quand on veut ses propres messages, placés dans la page, ce que la plupart des maquettes
demandent : on garde `validity`, on perd seulement la bulle, dont l'apparence n'est pas stylable
et dont la position est imposée.

## 2. Nommer un champ

C'est le sujet le plus important du module, et le plus simple à rater.

```html
<!-- ✅ La forme canonique -->
<label for="ville">Ville</label>
<input id="ville" name="ville">

<!-- ✅ Acceptable : l'étiquette englobe le champ -->
<label>Ville <input name="ville"></label>

<!-- ⛔ Le placeholder n'est pas une étiquette -->
<input name="ville" placeholder="Ville">
```

Le `placeholder` échoue pour trois raisons cumulées : il disparaît à la saisie, donc on ne peut
plus vérifier ce qu'on remplit ; son contraste est faible par construction ; et il n'est pas un
nom accessible fiable. Le critère est explicite, **`11.1 (A)` : `placeholder` seul est une
non-conformité.**

### 2.1 Les critères de nommage

| Critère | Exigence |
|---|---|
| `11.1 (A)` | chaque champ a une **étiquette visible** et pertinente |
| `11.2 (A)` | l'étiquette, donc le nom accessible, est **pertinente** |
| `11.3 (AA)` | le nom accessible est pertinent dans tous les contextes similaires |
| `11.4 (A)` | l'étiquette est **accolée** au champ, visuellement proche |
| `11.9 (A)` | les **intitulés de boutons** sont pertinents |

Et la règle transversale du module 01, qui s'applique ici en priorité : **le nom visible doit être
contenu dans le nom accessible.**

```html
<!-- ⛔ Le pilotage vocal dit « cliquer sur Envoyer » : rien ne se passe -->
<button aria-label="Soumettre le formulaire d'inscription">Envoyer</button>

<!-- ✅ Le nom visible est inclus -->
<button aria-label="Envoyer le formulaire d'inscription">Envoyer</button>
```

### 2.2 Regrouper

```html
<fieldset>
  <legend>Mode de contact préféré</legend>
  <label><input type="radio" name="contact" value="courriel"> Courriel</label>
  <label><input type="radio" name="contact" value="tel"> Téléphone</label>
</fieldset>

<select name="pays">
  <optgroup label="Europe">
    <option>France</option>
    <option>Belgique</option>
  </optgroup>
</select>
```

- `11.5 (A)`, `11.6 (A)` et `11.7 (A)` : les champs de même nature sont regroupés, par `<fieldset>` et
  `<legend>` ou par `role="group"` avec un nom accessible. Sans cela, un lecteur d'écran annonce
  « Courriel, bouton radio » sans dire de quoi il s'agit : la question est perdue.
- `11.8 (A)` : les listes de choix sont regroupées par `<optgroup>` quand c'est pertinent.

## 3. Obligatoire, format, aide

```html
<label for="tel">Téléphone <span aria-hidden="true">*</span></label>
<input id="tel" name="tel" type="tel" required autocomplete="tel"
       aria-describedby="format-tel" aria-required="true">
<p id="format-tel">Dix chiffres, sans espaces. Exemple : 0612345678</p>
<p class="mention-obligatoire">Les champs marqués d'une étoile sont obligatoires.</p>
```

**`11.10 (A)`** exige trois choses d'un seul coup, et c'est le critère le plus souvent
partiellement respecté :

1. les champs obligatoires sont **identifiés visiblement**, et la signification du marqueur est
   expliquée quelque part ;
2. le **format attendu** est indiqué quand il est contraint ;
3. les messages d'aide sont **reliés au champ**, par `aria-describedby`.

Note sur l'astérisque : `aria-hidden="true"` dessus évite que le lecteur d'écran annonce
« étoile », puisque `required` porte déjà l'information. Et la mention qui explique l'étoile doit
être **avant** le formulaire, pas après : la lire après l'avoir rempli ne sert à rien.

## 4. Les erreurs

```html
<div class="champ">
  <label for="cp">Code postal</label>
  <input id="cp" name="cp" inputmode="numeric" autocomplete="postal-code"
         aria-describedby="err-cp" aria-invalid="true">
  <p id="err-cp" class="erreur">
    Le code postal doit contenir cinq chiffres. Exemple : 69100
  </p>
</div>
```

**`11.11 (AA)` : le message d'erreur donne un exemple réel de saisie attendue.** « Format
invalide » ne suffit pas. « Cinq chiffres, par exemple 69100 » suffit.

**`7.5 (AA)` : les messages de statut sont restitués sans déplacer le focus.**

```html
<!-- Un résumé des erreurs, annoncé à la soumission -->
<div role="alert" id="resume-erreurs">
  <h2>2 erreurs à corriger</h2>
  <ul>
    <li><a href="#cp">Code postal : cinq chiffres attendus</a></li>
    <li><a href="#courriel">Courriel : format non reconnu</a></li>
  </ul>
</div>
```

Le motif complet, qui est celui des formulaires administratifs bien faits : un résumé en tête,
annoncé par `role="alert"`, avec des liens vers chaque champ en erreur, plus le message au niveau
de chaque champ relié par `aria-describedby`. Le focus va sur le résumé, pas sur le premier champ,
pour que la personne sache **combien** d'erreurs il y a avant de commencer à corriger.

Trois pièges autour de `aria-invalid` : il faut le poser **et** le retirer, il ne remplace pas le
message, et il ne doit pas être posé avant interaction, pour la raison du § 1.2.

## 5. `autocomplete`, et pourquoi c'est un critère

**`11.13 (AA)` : les champs de données personnelles portent un `autocomplete` pertinent.**

Ce n'est pas qu'un confort. Pour une personne à motricité réduite ou avec des troubles cognitifs,
le remplissage automatique est la différence entre un formulaire faisable et un formulaire
abandonné. Les valeurs sont normalisées : `name`, `given-name`, `family-name`, `email`, `tel`,
`street-address`, `postal-code`, `country-name`, `bday`, `cc-number`, `one-time-code`.

```html
<input name="prenom" autocomplete="given-name">
<input name="code" autocomplete="one-time-code" inputmode="numeric">
```

`autocomplete="off"` sur un champ de données personnelles est donc une non-conformité, sauf
justification réelle. Et `inputmode` est un complément utile, sans être un critère : il choisit le
clavier virtuel.

## 6. Les champs modernes

### 6.1 `datalist`

```html
<label for="ville">Ville</label>
<input id="ville" name="ville" list="villes" autocomplete="address-level2">
<datalist id="villes">
  <option value="Lyon"></option>
  <option value="Villeurbanne"></option>
</datalist>
```

Suggestions natives sur un champ qui reste libre. C'est un vrai champ texte, donc son
accessibilité est celle d'un champ texte, ce qui est précisément son avantage sur un combobox
maison. Limite à connaître : la liste n'est pas stylable, et le comportement varie d'un navigateur
à l'autre. Pour un combobox exigeant, voir module 17.

### 6.2 `showPicker()`

```js
champDate.showPicker();   // ouvre le sélecteur natif, sur un geste utilisateur
```

Permet d'ouvrir le sélecteur natif depuis un bouton, sans réimplémenter un calendrier. Ne
fonctionne que sur une action de l'utilisateur, ce qui est une protection anti-abus.

L'intérêt pour l'accessibilité est direct : `7.2 (A)` prévoit qu'un composant non accessibilisable
doit avoir une alternative accessible, et l'exemple canonique du référentiel est le sélecteur de
date. Un `<input type="date">` reste saisissable au clavier même si son calendrier est imparfait,
là où un calendrier maison ne l'est presque jamais.

### 6.3 Le `<select>` personnalisable

```css
select, ::picker(select) { appearance: base-select; }
::picker(select) { border-radius: 0.5rem; padding: 0.25rem; }
option::checkmark { color: var(--accent); }
select::picker-icon { rotate: 0deg; transition: rotate 200ms; }
select:open::picker-icon { rotate: 180deg; }
```

C'est la réponse de la plateforme au composant le plus reconstruit du web. Avec
`appearance: base-select`, la liste devient stylable, y compris du contenu riche dans les
`<option>`, tout en gardant le clavier, le rôle et le comportement natifs.

C'est aussi, pour ce cours, le point le plus important du module 16 : la raison numéro un de
reconstruire un `<select>` était son apparence, et c'était toujours une perte nette en
accessibilité.

## 7. `11.12`, les données sensibles

**`11.12 (AA)` : pour toute action à conséquence financière, juridique ou sur des données
personnelles, l'utilisateur peut modifier, annuler ou confirmer.** Concrètement : un récapitulatif
avant validation, un moyen de revenir en arrière, ou une confirmation explicite. Cela concerne
un paiement, une suppression de compte, une signature.

## 8. Ce que l'enquête interroge, et où c'est traité

Items `html2026` rattachés à ce module : `datalist_element`, `showpicker`,
`customizable_select`, `input_type_color`, `fieldset_and_legend`, `form_control_label`,
`validation_errors`.

Lecture intéressante de l'enquête : `fieldset_and_legend`, `select_element` et `validation_errors`
figurent à la fois dans la liste des techniques d'accessibilité et dans celle des éléments les
plus durs à styler. Ce sont exactement les éléments que l'on reconstruit, et donc ceux où
l'accessibilité se perd. Le lien entre « difficile à styler » et « non conforme » n'est pas une
coïncidence, c'est une chaîne de cause à effet, et c'est l'argument central du module 16.

## 9. Les pièges

1. **Styler avec `:invalid`.** Tout est rouge avant la première saisie. `:user-invalid`.
2. **Oublier de lever `setCustomValidity("")`.** Le formulaire ne se soumet plus.
3. **Utiliser `placeholder` comme étiquette.** Non conforme `11.1 (A)`.
4. **Écraser le nom visible avec un `aria-label` différent.** Casse le pilotage vocal,
   non conforme `11.2`.
5. **Des boutons radio sans `fieldset` et `legend`.** La question est perdue, `11.5 (A)` à `11.7`.
6. **Un message d'erreur sans exemple.** Non conforme `11.11 (AA)`.
7. **Expliquer l'astérisque après le formulaire.** Information inutile là où elle est.
8. **Ne pas relier l'aide par `aria-describedby`.** Non conforme `11.10 (A)`.
9. **`autocomplete="off"` sur des données personnelles.** Non conforme `11.13 (AA)`.
10. **Mettre le focus sur le premier champ en erreur** au lieu d'annoncer le nombre d'erreurs.
11. **Poser `aria-invalid` sans jamais le retirer.**

## 10. Lire avant le lab

Pour [lab-12](../labs/lab-12-formulaire-natif/README) : § 1.1 et 1.2, § 2 en entier, § 3, § 4,
§ 5. Une lecture, puis page blanche.

## 11. Auto-test

1. Quelle est la différence entre `checkValidity()` et `reportValidity()` ?
2. Que fait `novalidate`, et que conserve-t-il ?
3. Pourquoi `:invalid` est-il presque toujours le mauvais sélecteur ?
4. Donne les trois raisons pour lesquelles un `placeholder` ne peut pas servir d'étiquette.
5. Quelles trois exigences `11.10 (A)` cumule-t-il ?
6. Qu'exige `11.11 (AA)` de plus qu'un message d'erreur correct ?
7. Décris le motif complet de restitution des erreurs d'un formulaire, et dis où va le focus.
8. Pourquoi `autocomplete` est-il un critère d'accessibilité et pas un confort ?
9. Pourquoi `appearance: base-select` est-il un gain d'accessibilité et pas seulement de style ?
