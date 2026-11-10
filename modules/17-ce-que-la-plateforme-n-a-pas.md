# 17. Ce que la plateforme n'a pas

> **Outcome :** à la fin, tu connais les dix-huit composants que les développeurs réclament à la
> plateforme, tu sais composer à partir du natif avant d'inventer, et tu sais écrire de mémoire le
> contrat complet des quatre patterns les plus fréquents : rôles, états, et clavier touche par
> touche.
>
> **Lab :** [lab-13 : patterns manquants](../labs/lab-13-patterns-manquants/README)

## 1. Ce que l'enquête réclame

State of HTML demande chaque année quels éléments manquent à la plateforme. Les dix-huit réponses
de l'édition 2026 :

| Groupe | Composants |
|---|---|
| Navigation et actions | `tabs`, `dropdown_menu`, `context_menu`, `segmented_button`, `offcanvas` |
| Saisie | `combobox_autocomplete`, `switch`, `rich_text_editor`, `sortable_list` |
| Données | `datatable`, `charts`, `maps` |
| Contenu | `footnotes`, `callout`, `rich_code_block`, `html_include` |
| États | `skeleton_loading_placeholder`, `scroll_area` |

Trois remarques avant d'entrer dans le détail.

**Certains sont déjà partiellement couverts.** `scroll_area` est le module 13, `offcanvas` se fait
avec `dialog` non modal du module 09, `callout` est une question de sémantique et de style.
Réclamer un élément ne veut pas dire qu'il n'existe aucune solution.

**Certains n'arriveront probablement jamais**, et c'est défendable : `charts` et `maps` sont des
domaines entiers, avec des exigences contradictoires. Le cours 26 traite les graphiques, et leur
accessibilité, comme un sujet en soi.

**Deux sont en train d'arriver** : `tabs` et `switch` font l'objet de propositions. Ce qui est
écrit ci-dessous reste donc valable : le pattern ARIA est ce qu'il faut écrire aujourd'hui, et ce
que l'élément natif fournira demain.

## 2. La règle d'ordre, encore

Comme au module 16, l'erreur est de sauter des étapes.

1. **Composer avec du natif.** Un menu déroulant est un `<button>` plus un `popover` du module
   09. Un panneau latéral est un `<dialog>` non modal. Un bloc dépliable est un `<details>` du
   module 15.
2. **Un pattern ARIA complet**, si le natif ne suffit vraiment pas.
3. **Une bibliothèque sérieuse**, et sérieuse veut dire précisément une chose : qu'elle documente
   son clavier et ses rôles, et qu'elle les teste.

### 2.1 Pourquoi l'étape 1 est si souvent sautée

Parce qu'on cherche un composant par son nom. On cherche « tabs », on ne trouve pas, on installe
une bibliothèque. Alors que la question utile est : **de quoi ce composant est-il fait ?** Des
boutons, une zone de contenu, un état. Tout cela existe.

Le symptôme : une bibliothèque de 40 kilo-octets pour un menu déroulant, qui ajoute en plus un
piège de focus que `popover` gérait tout seul.

## 3. Les quatre patterns à connaître par cœur

Pour chacun, le contrat est en trois parties indissociables : les **rôles**, les **états**, le
**clavier**. Un composant qui a les rôles mais pas le clavier n'est pas accessible, et c'est le
cas le plus fréquent, parce que les rôles se voient dans l'inspecteur et le clavier non.

### 3.1 Les onglets

```html
<div class="onglets">
  <div role="tablist" aria-label="Informations du membre">
    <button role="tab" id="t1" aria-selected="true"  aria-controls="p1">Profil</button>
    <button role="tab" id="t2" aria-selected="false" aria-controls="p2" tabindex="-1">Activité</button>
  </div>
  <div role="tabpanel" id="p1" aria-labelledby="t1" tabindex="0">…</div>
  <div role="tabpanel" id="p2" aria-labelledby="t2" tabindex="0" hidden>…</div>
</div>
```

| Clavier | Attendu |
|---|---|
| `Tab` | entre dans la liste d'onglets, **un seul arrêt** pour tout le groupe |
| `Flèche droite` et `gauche` | onglet suivant, précédent, en boucle |
| `Début`, `Fin` | premier, dernier onglet |
| `Tab` depuis l'onglet actif | va au panneau, pas à l'onglet suivant |

Le mécanisme clé est le **focus géré** : un seul onglet porte `tabindex="0"`, tous les autres
`tabindex="-1"`, et le script déplace le focus aux flèches en mettant à jour les `tabindex`. C'est
ce qui fait que `Tab` traverse le groupe d'un coup au lieu de s'arrêter sur chaque onglet.

C'est exactement le comportement que l'attribut `focusgroup` du module 01 § 5 vise à rendre
déclaratif.

### 3.2 L'interrupteur

```html
<button role="switch" aria-checked="false" id="notifs">
  Notifications par courriel
</button>
```

| Clavier | Attendu |
|---|---|
| `Espace` | bascule |
| `Entrée` | bascule aussi, puisque c'est un `<button>` |

Deux erreurs très répandues.

**Confondre interrupteur et case à cocher.** Un interrupteur applique l'état **immédiatement** ;
une case à cocher exprime une intention qui sera validée par une soumission. Si l'état n'est
appliqué qu'après un bouton « Enregistrer », c'est une case à cocher, pas un interrupteur.

**Changer le libellé au lieu de l'état.** Un interrupteur dont le texte passe de « Activer » à
« Désactiver » est ambigu : la personne ne sait pas si le texte décrit l'état courant ou l'action
à venir. Le libellé reste stable, et `aria-checked` porte l'état.

### 3.3 Le combobox avec autocomplétion

C'est le plus difficile des quatre, et c'est pour cela que `<datalist>` du module 14 § 6.1 mérite
d'être essayé d'abord.

```html
<label for="ville">Ville</label>
<input id="ville" role="combobox" aria-expanded="false"
       aria-controls="liste-villes" aria-autocomplete="list"
       aria-activedescendant="" autocomplete="off">
<ul id="liste-villes" role="listbox" hidden>
  <li role="option" id="v1">Lyon</li>
  <li role="option" id="v2">Villeurbanne</li>
</ul>
```

| Clavier | Attendu |
|---|---|
| `Flèche bas` | ouvre la liste, ou va à l'option suivante |
| `Flèche haut` | option précédente |
| `Entrée` | sélectionne l'option active |
| `Échap` | ferme la liste, **sans** vider le champ |
| `Tab` | ferme et passe au champ suivant |
| frappe | filtre, et la liste reste ouverte |

Le point technique qui distingue un combobox correct : **le focus ne quitte jamais le champ de
saisie**. L'option « active » est désignée par `aria-activedescendant`, et visuellement par une
classe. Déplacer réellement le focus dans la liste casse la saisie, puisqu'on ne peut plus taper.

C'est le pattern le plus souvent raté, et le plus coûteux à corriger après coup.

### 3.4 Le tableau de données

```html
<table>
  <caption>Membres actifs, 2026</caption>
  <thead>
    <tr>
      <th scope="col">
        <button type="button" aria-describedby="tri-aide">Nom</button>
      </th>
      <th scope="col" aria-sort="ascending">
        <button type="button">Date d'inscription</button>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">Alondra</th><td>12/03/2026</td></tr>
  </tbody>
</table>
```

Ce que beaucoup de tableaux maison perdent en passant à des `<div role="grid">` : la navigation
par cellule des lecteurs d'écran, qui annoncent « colonne Nom, ligne 3 » parce que la sémantique
du tableau le permet.

Les points du référentiel, thème 5 :

- `5.4 (A)` et `5.5 (A)` : un tableau de données a un **titre** (`<caption>`), et ce titre est pertinent ;
- `5.6 (A)` et `5.7 (A)` : les en-têtes sont des `<th>` avec une **portée** (`scope`), ou reliés par
  `headers` et `id` quand la structure est complexe ;
- `5.8 (A)` : un tableau de **mise en forme** ne doit avoir ni `<th>`, ni `<caption>`, ni `scope`,
  c'est-à-dire aucune sémantique de données. Et il ne devrait plus exister, puisque Grid existe.

Pour le tri, `aria-sort` sur le `<th>` et un `<button>` dans l'en-tête, parce que l'élément qui
déclenche une action doit être un contrôle.

#### Les tableaux complexes

Un tableau est **complexe** quand une cellule dépend de plus d'un en-tête, par exemple avec des
en-têtes sur deux niveaux ou des cellules fusionnées. `scope` ne suffit plus, parce qu'il ne sait
désigner qu'une ligne ou une colonne entière.

```html
<table>
  <caption>Créneaux par atelier et par semaine</caption>
  <tr>
    <td></td>
    <th id="s1" colspan="2">Semaine 1</th>
  </tr>
  <tr>
    <td></td>
    <th id="s1-mat" headers="s1">Matin</th>
    <th id="s1-apm" headers="s1">Après-midi</th>
  </tr>
  <tr>
    <th id="cuisine">Cuisine</th>
    <td headers="cuisine s1 s1-mat">4 places</td>
    <td headers="cuisine s1 s1-apm">complet</td>
  </tr>
</table>
```

- `5.1 (A)` : le tableau complexe a un **résumé** quand il en a besoin, c'est-à-dire une aide à
  la compréhension de son organisation ;
- `5.2 (A)` : ce résumé est pertinent ;
- `5.3 (A)` : un tableau de mise en forme reste **compréhensible linéarisé**, ce qui se vérifie
  CSS désactivées.

Le mécanisme de `headers` et `id` est verbeux, et c'est le signe qu'il faut se poser la question
avant : un tableau complexe est souvent deux tableaux simples qu'on a fusionnés pour gagner de la
place à l'écran. Les séparer coûte moins cher que les annoter, et se lit mieux pour tout le monde.

## 4. L'accessibilité dans ce module

C'est le module où `7.1 (A)` cesse d'être un conseil pour devenir le travail lui-même.

**`7.1 (A)` : rôle, nom, état, et restitution du changement d'état.** Les trois premiers sont
visibles dans l'inspecteur, le quatrième se teste. Un interrupteur dont `aria-checked` ne change
pas est non conforme même s'il a l'air juste.

**`7.3 (A)` : utilisable au clavier.** C'est la moitié du travail d'un pattern, et la moitié qui
se voit le moins.

**`7.2 (A)` : si le composant n'est pas accessibilisable, une alternative accessible existe.**
C'est la porte de sortie honnête. L'exemple du référentiel est le sélecteur de date : si le
calendrier n'est pas utilisable, le champ texte saisissable au clavier est l'alternative. Ce
critère n'est pas une permission d'abandonner, c'est l'obligation de fournir un autre chemin.

**`12.9 (A)` : pas de piège au clavier.** Tout composant qui gère le focus peut en créer un. Le
test est simple et doit être systématique : entrer au clavier, tout parcourir, sortir. Sans
souris.

**`12.10 (A)` : les raccourcis clavier à caractère imprimable** doivent être désactivables,
configurables, ou limités au focus d'un composant. Une interface qui capte la touche `s` pour
« sauvegarder » empêche d'écrire « s » à la voix ou dans un champ.

## 5. Ce que l'enquête interroge, et où c'est traité

Les dix-huit items de `html_missing_elements` sont rattachés à ce module.

Leur lecture la plus utile n'est pas « ce qui manque » mais **ce que le métier reconstruit en
permanence**, donc là où la dette d'accessibilité se concentre. Un développeur qui écrit un
système de design passera l'essentiel de son temps d'accessibilité sur cette liste, et presque
rien sur le reste du cours.

C'est aussi pour cette raison que `tabs` et `switch` arrivent en premier dans les propositions :
ce sont les deux plus réclamés et les deux plus souvent mal faits.

## 6. Les pièges

1. **Chercher un composant par son nom** au lieu de demander de quoi il est fait.
2. **Installer une bibliothèque pour un menu** que `popover` plus `<button>` règle.
3. **Écrire les rôles sans le clavier.** La moitié visible, la moitié qui compte oubliée.
4. **Laisser tous les onglets dans l'ordre de tabulation.** Le focus géré est le pattern.
5. **Appeler interrupteur ce qui est une case à cocher.** L'état immédiat est le critère.
6. **Changer le libellé d'un interrupteur au lieu de son état.**
7. **Déplacer le focus dans la liste d'un combobox.** La saisie devient impossible.
8. **Vider le champ sur `Échap`** dans un combobox.
9. **Remplacer un `<table>` par des `<div role="grid">`** sans mesurer ce qu'on perd.
10. **Capter une touche imprimable comme raccourci global.** Non conforme `12.10 (A)`.

## 7. Lire avant le lab

Pour [lab-13](../labs/lab-13-patterns-manquants/README) : § 2, § 3.1 et § 3.2 en entier, § 4. Une
lecture, puis page blanche. Le lab porte sur les onglets et l'interrupteur.

## 8. Auto-test

1. Cite cinq des composants réclamés à la plateforme, et dis pour deux d'entre eux ce qui existe
   déjà.
2. Quelle est la question utile à se poser devant un composant à faire, et pourquoi la recherche
   par nom échoue-t-elle ?
3. Donne le contrat clavier complet d'une liste d'onglets.
4. Qu'est-ce que le focus géré, et quel problème résout-il ?
5. Quel critère distingue un interrupteur d'une case à cocher ?
6. Dans un combobox, où est le focus quand on parcourt la liste, et pourquoi ?
7. Que doit faire `Échap` dans un combobox, et surtout que ne doit-il pas faire ?
8. Qu'exige `5.8 (A)` d'un tableau de mise en forme, et pourquoi ce cas ne devrait-il plus exister ?
9. Que dit `7.2 (A)`, et pourquoi n'est-ce pas une permission d'abandonner ?
