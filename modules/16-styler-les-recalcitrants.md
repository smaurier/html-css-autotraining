# 16. Styler les récalcitrants

> **Outcome :** à la fin, tu sais ce que `appearance: none` retire et ce qu'il ne retire pas, tu
> connais la voie de style de chacun des dix contrôles que l'enquête désigne comme les plus durs,
> et tu as une règle de décision pour trancher entre styler le natif et reconstruire, en sachant
> ce que la reconstruction coûte.

## 1. Le mécanisme : un contrôle natif est une boîte noire partiellement ouverte

Un `<input type="range">` n'est pas un élément simple. C'est un élément dont le navigateur
construit l'intérieur : une piste, un curseur, parfois des graduations. Cet intérieur n'est pas
dans le DOM, et il n'est accessible au style que par les pseudo-éléments que le moteur accepte
d'exposer. Leur nommage n'est pas harmonisé entre moteurs, ce qui est la cause première de la
pénibilité.

```css
input[type="range"] { appearance: none; }            /* retire le dessin du système */
input[type="range"]::-webkit-slider-thumb { … }       /* Chromium, Safari */
input[type="range"]::-moz-range-thumb { … }           /* Firefox */
```

### 1.1 Ce que `appearance: none` fait, et ne fait pas

| Supprimé | Conservé |
|---|---|
| le dessin fourni par le système | le rôle dans l'arbre d'accessibilité |
| les dimensions par défaut | le comportement clavier |
| parfois la couleur de fond et la bordure | l'état (coché, désactivé, invalide) |
| | la participation au formulaire |

C'est la bonne nouvelle du module : **`appearance: none` ne retire aucune accessibilité.** Il
retire une apparence. Un `<input type="checkbox">` repeint de fond en comble reste une case à
cocher pour un lecteur d'écran, reste cochable à la barre d'espace, et reste associé à son
`<label>`.

Ce qu'il retire en revanche, et qu'il faut remettre, c'est **l'indication visuelle de l'état et
du focus**. C'est là que les critères entrent.

### 1.2 La règle d'ordre : essayer dans cet ordre

1. **Ne rien faire.** `accent-color` du module 10 § 2.3 colore cases, radios, curseurs et
   progression en une ligne. Pour beaucoup de maquettes, c'est suffisant.
2. **Styler le natif** avec `appearance: none` et les pseudo-éléments.
3. **Reconstruire**, et seulement si les deux premières voies sont réellement impossibles, en
   acceptant le coût du module 17.

L'erreur la plus courante du métier est de passer directement à l'étape 3, en général parce que
l'étape 2 a été essayée une fois, il y a cinq ans, avant les mécanismes de ce module.

## 2. Les dix récalcitrants

### 2.1 Case à cocher et bouton radio

```css
input[type="checkbox"] {
  appearance: none;
  inline-size: 1.25rem;
  aspect-ratio: 1;
  border: 2px solid var(--trait);
  border-radius: 0.25rem;
  display: grid;
  place-content: center;
}
input[type="checkbox"]::before {
  content: "";
  inline-size: 0.7rem;
  aspect-ratio: 1;
  scale: 0;
  transition: scale 120ms;
  background: var(--accent);
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0, 43% 62%);
}
input[type="checkbox"]:checked::before { scale: 1; }
input[type="checkbox"]:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
input[type="checkbox"]:indeterminate::before { … }
```

Les états à traiter, et il y en a quatre à ne pas oublier : `:checked`, `:indeterminate`,
`:disabled`, `:focus-visible`. Un style qui ne couvre que `:checked` laisse l'état intermédiaire
invisible, ce qui est fréquent dans les arbres de cases à cocher.

Attention au mode `forced-colors` du module 08 § 3.2 : un `::before` coloré par un fond disparaît.
D'où l'intérêt de dessiner la coche avec `clip-path` plutôt qu'avec une image de fond, et de
tester le mode.

### 2.2 Curseur de plage

```css
input[type="range"] { appearance: none; background: transparent; }
input[type="range"]::-webkit-slider-runnable-track {
  block-size: 0.35rem; border-radius: 1rem; background: var(--piste);
}
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  inline-size: 1.25rem; aspect-ratio: 1; border-radius: 50%;
  background: var(--accent);
  margin-block-start: -0.45rem;   /* recentrer sur la piste */
}
input[type="range"]::-moz-range-track { … }
input[type="range"]::-moz-range-thumb { … }
```

Deux arborescences à écrire, et elles ne se regroupent pas dans une même règle : un sélecteur
inconnu invalide toute la règle qui le contient. C'est la raison technique pour laquelle on ne
peut pas écrire `::-webkit-slider-thumb, ::-moz-range-thumb { … }`.

Point d'accessibilité spécifique : la zone de préhension du curseur doit rester assez grande pour
être visée. Un curseur de 8 pixels est joli et difficilement utilisable pour une personne à
motricité réduite.

### 2.3 Les champs de date et d'heure

```css
input[type="date"]::-webkit-calendar-picker-indicator { … }
input[type="date"]::-webkit-datetime-edit-fields-wrapper { … }
```

Les plus hétérogènes du lot, et ceux où il faut le plus résister à la tentation de reconstruire.
Le raisonnement est au module 14 § 6.2 : un `<input type="date">` imparfait reste saisissable au
clavier, alors qu'un calendrier maison n'est presque jamais conforme. `7.2 (A)` prévoit
explicitement ce cas de figure.

Le compromis raisonnable : styler ce qui se laisse styler, utiliser `showPicker()` pour l'ouverture
depuis un bouton dessiné, et ne pas remplacer le champ.

### 2.4 Nombre, et la question des flèches

```css
input[type="number"] { appearance: textfield; }   /* retire les flèches */
input[type="number"]::-webkit-inner-spin-button { appearance: none; }
```

Avant de retirer les flèches, savoir qu'elles sont le moyen de modifier la valeur sans clavier
précis. Les retirer est légitime pour un code postal ou un numéro de carte, où elles n'ont pas de
sens, et discutable pour une quantité. Dans ce dernier cas, le bon réflexe est de les remplacer
par deux boutons visibles plutôt que de les supprimer.

Et `inputmode="numeric"` avec `type="text"` est souvent préférable pour un identifiant numérique,
parce que `type="number"` autorise les notations exponentielles et perd les zéros de tête.

### 2.5 `<select>` et `<select multiple>`

Le plus reconstruit du web, et désormais le mieux servi, voir module 14 § 6.3 :

```css
select, ::picker(select) { appearance: base-select; }
::picker(select) { border: 1px solid var(--trait); border-radius: 0.5rem; }
option:checked::checkmark { color: var(--accent); }
select::picker-icon { transition: rotate 200ms; }
select:open::picker-icon { rotate: 180deg; }
```

C'est la fonctionnalité qui supprime la raison numéro un de reconstruire un composant, et donc la
cause numéro un de non-conformité des listes déroulantes. À connaître absolument avant d'ouvrir
le module 17.

`<select multiple>` reste le plus pénible, et c'est aussi le contrôle dont l'ergonomie natale est
la plus douteuse : la sélection multiple par `Ctrl` n'est devinable par personne. C'est l'un des
rares cas où un groupe de cases à cocher est une meilleure réponse que le contrôle natif, et il
reste entièrement natif.

### 2.6 `<progress>`

```css
progress { appearance: none; block-size: 0.5rem; }
progress::-webkit-progress-bar { background: var(--piste); border-radius: 1rem; }
progress::-webkit-progress-value { background: var(--accent); border-radius: 1rem; }
progress::-moz-progress-bar { background: var(--accent); }
```

Rappel : `<progress>` sans valeur est indéterminé, et son animation native est du mouvement. Sous
`prefers-reduced-motion`, il faut y penser.

### 2.7 `<input type="color">` et `<input type="file">`

Le sélecteur de couleur ouvre une interface système, non stylable, et c'est normal. Le champ de
fichier est le cas où le motif du bouton déguisé est légitime :

```html
<label class="bouton" for="piece">Choisir un fichier</label>
<input id="piece" type="file" class="visuellement-masque">
<output id="nom-fichier"></output>
```

Avec une classe de masquage visuel, **jamais** `display: none`, qui retirerait le champ de
l'arbre et du focus. La différence est au module 01 § 1.4, et c'est exactement l'erreur que ce
motif provoque quand il est copié sans comprendre.

### 2.8 `<svg>`

```css
.icone { fill: currentColor; inline-size: 1em; block-size: 1em; }

@media (forced-colors: active) {
  .icone { forced-color-adjust: auto; fill: CanvasText; }
}
```

`fill: currentColor` est la ligne qui fait qu'une icône suit la couleur de son texte, y compris
au survol et au focus, et y compris en mode contraste forcé. Une icône avec une couleur codée en
dur devient invisible dans la moitié des thèmes.

Et le rappel du module 01 : une icône **porteuse d'information** a besoin de `role="img"` et d'une
alternative ; une icône décorative a besoin de `aria-hidden="true"`. Il n'y a pas de troisième
cas.

## 3. La règle de décision

Avant de reconstruire un contrôle, trois questions, dans cet ordre :

1. **`accent-color` suffit-il ?** Si oui, c'est fini.
2. **Le natif est-il stylable à l'endroit qui bloque ?** Avec `appearance` et
   `appearance: base-select`, la réponse est oui beaucoup plus souvent qu'avant.
3. **Si je reconstruis, suis-je prêt à écrire le pattern ARIA complet** du module 17, à savoir
   rôle, états, et le clavier touche par touche, et à le maintenir ?

Si la réponse à la troisième question est non, reconstruire n'est pas un choix de style, c'est le
choix de livrer un composant non conforme. La formulation à retenir, parce qu'elle est vérifiable
et pas idéologique : **un contrôle reconstruit sans son pattern ARIA complet est une régression
fonctionnelle, pas une amélioration visuelle.**

## 4. L'accessibilité dans ce module

**`10.7 (A)`, prise de focus visible.** C'est le critère numéro un du module, parce que
`appearance: none` emporte souvent l'indicateur natif.

```css
/* ⛔ L'erreur la plus répandue du web */
*:focus { outline: none; }

/* ✅ Un focus visible, qui ne s'affiche pas au clic de souris */
:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
```

`:focus-visible` est la bonne pseudo-classe : le navigateur décide si l'indicateur est pertinent,
donc il apparaît au clavier et pas au clic. Et `outline-offset` est préférable à une bordure,
parce que `outline` ne participe pas à la mise en page, donc n'en décale rien.

Point souvent manqué : `outline` suit la forme de la boîte, pas celle dessinée par `clip-path` ou
`corner-shape`, voir module 11 § 5. Sur un contrôle à forme personnalisée, il faut vérifier le
rendu réel du focus, pas supposer.

**`3.3 (AA)`, contraste des éléments non textuels.** Les bordures de champ, la piste d'un
curseur, la coche d'une case, l'indicateur de focus lui-même doivent atteindre 3:1. Un champ à la
bordure gris clair sur fond blanc est non conforme, et c'est une des non-conformités les plus
fréquentes des interfaces soignées.

**`10.1 (A)`, présentation en CSS.** Ce module en est l'illustration : tout ce qui est fait ici se
fait en CSS, sans un attribut de présentation.

**`7.1 (A)`** reste satisfait tant qu'on style le natif. Il bascule entièrement à ta charge dès
qu'on reconstruit.

## 5. Ce que l'enquête interroge, et où c'est traité

Items `html2026` rattachés à ce module : `input_type_checkbox`, `input_type_date`,
`input_type_time`, `input_type_number`, `input_type_radio`, `input_type_range`, `select_element`,
`select_multiple_element`, `svg_element`, `progress_element`.

Ces dix viennent de la question `html_styling_issues`, à savoir les éléments que les développeurs
désignent comme les plus difficiles à styler. Le croisement intéressant est celui du module 14
§ 8 : plusieurs figurent **aussi** dans la liste des techniques d'accessibilité, parce que ce sont
les éléments qu'on reconstruit, et donc ceux où l'accessibilité se perd. La difficulté de style
est la cause, la non-conformité est la conséquence.

C'est ce qui rend `appearance: base-select` plus important qu'il n'y paraît : ce n'est pas une
fonctionnalité de confort, c'est le retrait d'une cause de non-conformité systémique.

## 6. Les pièges

1. **Croire que `appearance: none` retire l'accessibilité.** Il retire une apparence.
2. **Regrouper les pseudo-éléments de deux moteurs dans une même règle.** Un sélecteur inconnu
   invalide toute la règle.
3. **Oublier `:indeterminate`, `:disabled` ou `:focus-visible`.**
4. **Écrire `*:focus { outline: none }`.** Non conforme `10.7 (A)`, et c'est l'erreur la plus
   répandue du métier.
5. **Masquer un `<input type="file">` avec `display: none`.** Il sort de l'arbre et du focus.
6. **Reconstruire un `<select>` sans connaître `appearance: base-select`.**
7. **Supprimer les flèches d'un `type="number"` sans alternative** quand la valeur est
   réellement incrémentale.
8. **Coder une couleur en dur dans une icône SVG** au lieu de `currentColor`.
9. **Oublier `3.3 (AA)` sur les bordures de champs.** Non conformité fréquente des interfaces
   élégantes.
10. **Ne pas tester en `forced-colors`.** Les coches dessinées par un fond disparaissent.

## 7. Auto-test

1. Que supprime `appearance: none`, et que conserve-t-il ?
2. Quelle est la règle d'ordre en trois étapes avant de reconstruire un contrôle ?
3. Pourquoi ne peut-on pas regrouper `::-webkit-slider-thumb` et `::-moz-range-thumb` ?
4. Quels quatre états faut-il traiter sur une case à cocher restylée ?
5. Pourquoi `:focus-visible` est-il préférable à `:focus` ?
6. Pourquoi `outline` est-il préférable à une bordure pour l'indicateur de focus ?
7. Pourquoi ne faut-il pas masquer un champ de fichier avec `display: none` ?
8. Formule la règle de décision sur la reconstruction d'un contrôle, de façon vérifiable.
9. Quel lien de cause à effet relie « difficile à styler » et « non conforme » ?
