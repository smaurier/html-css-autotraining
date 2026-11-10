# 20. Vérifier : audit, lecteurs d'écran, outillage

> **Outcome :** à la fin, tu sais ce qu'un outil automatique peut prouver et ce qu'il ne peut
> pas, tu sais mener le test clavier et le test lecteur d'écran dans un ordre fixe, et tu sais
> pourquoi un rapport ne dit jamais « conforme » sur la foi d'un outil.

> **Ce module ne remplace pas la méthode Access42.** Le protocole de test critère par critère qui
> fait foi est celui du référentiel officiel, et la méthode d'audit apprise en formation prime sur
> tout ce qui est écrit ici. Ce module organise les outils et les gestes ; il ne redéfinit pas la
> méthode.

## 1. Ce que l'automatique peut, et ne peut pas

Un outil automatique teste des propositions décidables : un `alt` est présent ou absent, un
contraste calculé dépasse ou non un seuil, un `id` est unique ou non. Il ne peut pas décider ce
qui demande un jugement.

| Ce qu'un outil décide | Ce qu'il ne peut pas décider |
|---|---|
| `alt` présent ou absent | `alt` **pertinent** (`1.3 (A)`) |
| ratio de contraste calculé | si l'information passe aussi autrement (`3.1`) |
| `lang` présent et valide | si c'est la bonne langue (`8.3 (A)`) |
| hiérarchie de titres présente | si les titres **décrivent** le contenu (`9.1`) |
| un `<label>` associé | si l'étiquette est compréhensible (`11.2`) |
| un `role` connu | si le rôle est le bon |
| un ordre du DOM | si l'ordre de tabulation est **cohérent** (`12.8`) |

La colonne de droite contient l'essentiel du référentiel. D'où la règle, qui n'est pas une
posture mais une conséquence : **un résultat vert d'un outil automatique n'est pas une
conformité, c'est l'absence d'un certain type de signal.**

Aucun pourcentage n'est cité ici volontairement. Les chiffres qui circulent sur « la part des
critères détectables automatiquement » varient selon la méthode de comptage et ne disent rien de
ton site. Ce qui est utile, c'est de connaître la colonne de droite par cœur.

### 1.1 Le piège inverse

Un outil automatique produit aussi des **faux positifs**, et les signaler comme non-conformités
dans un rapport coûte la crédibilité de tout le rapport. Deux classiques : un contraste calculé
sur un texte superposé à une image, où l'outil ne sait pas quel pixel est derrière, et un
« champ sans étiquette » qui en a une par `aria-labelledby` dans un autre arbre.

La règle de méthode est la même dans les deux sens : **l'outil signale, l'auditeur tranche.**

## 2. Les outils, classés par usage

L'enquête en recense seize. Classés par ce à quoi ils servent réellement :

| Usage | Outils |
|---|---|
| Analyse de page, dans le navigateur | `axe`, `wave`, `lighthouse`, `accessibility_insights`, `ibm_accessibility_checker`, `silktide` |
| Inspection de l'arbre d'accessibilité | `browser_devtools`, `firefox_accessibility_inspector`, `chrome_devtools` |
| Vue multi-rendu et simulation | `polypane`, `arc` |
| En chaîne d'intégration | `pa11y`, `axe` en bibliothèque |
| Dans les composants | `storybook` avec son extension d'accessibilité |
| Lecteur d'écran piloté par script | `guidepup`, `voiceover_js`, `assistiv_labs` |
| Suivi à l'échelle d'un site | `siteimprove` |

Le choix minimal et suffisant, pour une personne seule : **axe** dans le navigateur, **l'inspecteur
d'accessibilité** du navigateur, **NVDA**, et les **bookmarklets** de la formation. Le reste est du
confort ou de l'échelle.

### 2.1 Les bookmarklets

La formation Access42 fournit un jeu de bookmarklets organisés **par thématique du
référentiel**, et c'est l'outillage le plus direct pour un audit critère par critère :
contrairement à un analyseur généraliste, ils suivent l'ordre dans lequel on remplit une grille
d'audit, et non une liste de bugs. Ils ne sont pas reproduits ici, c'est de la matière de
formation.

Deux gestes de cette famille sont des techniques universelles, qu'on peut faire avec n'importe
quel outil, et ils servent à tout :

- **désactiver les CSS** est le test de `10.1`, `10.2`, `10.3` et `10.6`, soit quatre critères
  d'un seul geste ;
- **forcer le focus** révèle les éléments focusables invisibles, donc les pièges du module 01
  § 1.4.

## 3. Le protocole clavier

Le test le plus rentable du métier : il prend trois minutes et il trouve des non-conformités que
rien d'automatique ne trouve. Souris débranchée, dans cet ordre fixe.

1. **`Tab` du début à la fin.** Chaque arrêt doit être **visible** (`10.7`), et l'ordre doit
   suivre l'ordre visuel (`12.8`).
2. **Compter les arrêts muets.** Un arrêt sur un élément sans nom accessible est un trou.
3. **Entrer dans chaque composant, et en sortir.** Sans souris. Un composant dont on ne sort pas
   est un piège (`12.9`).
4. **`Entrée` et `Espace` sur chaque contrôle.** Un `<div>` cliquable ne réagit ni à l'un ni à
   l'autre (`7.3`).
5. **Les flèches dans les groupes.** Onglets, listes, curseurs, carrousels : le contrat du module
   17.
6. **`Échap`** sur tout ce qui s'ouvre (`10.13`).
7. **Le lien d'accès rapide en premier `Tab`**, visible au focus (`12.7`).
8. **Vérifier qu'aucune touche imprimable n'est captée globalement** (`12.10`).

Si une seule de ces huit étapes échoue, l'interface n'est pas utilisable au clavier, et aucun
score d'outil ne compense.

## 4. Le protocole lecteur d'écran

### 4.1 Lequel apprendre

| Lecteur | Couple naturel | Usage |
|---|---|---|
| `nvda` | Windows + Firefox ou Chrome | gratuit, le plus répandu en audit |
| `jaws` | Windows | très présent en entreprise, payant |
| `voiceover` | macOS + Safari, iOS | intégré |
| `talkback` | Android | mobile |
| `narrator` | Windows | intégré, moins utilisé en audit |
| `orca` | Linux | de niche |
| `chromevox` | ChromeOS | de niche |

Pour une personne seule, **NVDA avec Firefox** est l'investissement le plus rentable, et
**VoiceOver** sur l'appareil qu'on possède déjà. Tester avec un lecteur sur un navigateur qui
n'est pas son couple naturel produit des faux problèmes.

### 4.2 Les gestes qui suffisent

On n'a pas besoin d'être un utilisateur expert pour auditer. Cinq gestes couvrent l'essentiel :

1. **Parcourir les titres.** La structure du document s'entend-elle ? (`9.1`)
2. **Parcourir les régions.** Les zones sont-elles nommées et distinctes ? (`12.6`)
3. **Parcourir les liens hors contexte.** Chaque intitulé se comprend-il seul ? (`6.1`)
4. **Parcourir les champs de formulaire.** Chacun est-il annoncé avec son étiquette, son état
   obligatoire et son aide ? (`11.1`, `11.2`, `11.10`)
5. **Déclencher les actions et écouter.** Le changement d'état est-il dit ? Le message d'erreur
   est-il annoncé ? (`7.1`, `7.5`)

Le réflexe le plus formateur : **fermer les yeux**. Tant qu'on regarde l'écran, on complète
mentalement ce que la voix ne dit pas, et on manque exactement ce qu'on cherche.

## 5. L'échantillonnage

Un audit ne teste pas tout le site. Il teste un échantillon, et la qualité de l'échantillon fait
la qualité de l'audit. Les pages qui doivent y être :

- la page d'accueil ;
- le plan du site et la page de contact, qui sont des obligations ;
- la déclaration d'accessibilité ;
- les pages d'aide et de mentions légales ;
- un formulaire complet, avec son parcours d'erreur et sa confirmation ;
- un gabarit de chaque type, liste, fiche, article ;
- un tableau de données ;
- une page avec média, s'il en existe ;
- un parcours complet de bout en bout, inscription ou commande ;
- les pages où l'on sait qu'il y a un composant complexe du module 17.

Le dernier point est le plus souvent oublié : un échantillon qui évite les composants difficiles
produit un taux de conformité flatteur et faux.

## 6. Les critères qui ne se testent qu'ici

Trois cas où le test est la seule chose qui compte, parce que le code ne dit rien.

**`12.8 (A)`, ordre de tabulation cohérent.** Rien dans le code ne l'affirme : il faut tabuler.

**`7.1 (A)`, restitution du changement d'état.** On peut lire `aria-pressed` dans le DOM et
constater qu'il ne change pas en situation.

**`7.5 (AA)`, messages de statut.** Une région live mal configurée est silencieuse sans qu'aucune
erreur n'apparaisse. Seule l'écoute le révèle.

## 7. Ce que l'enquête interroge, et où c'est traité

Items `html2026` rattachés à ce module : les seize outils, les dix lecteurs d'écran,
`keyboard_navigation`, `visible_focus`, `pointer_alternative`, et `accessibility_ai_impact`.

Ce dernier est une question d'opinion de l'édition 2026 : quel effet l'IA a-t-elle sur
l'accessibilité du web. Elle n'a pas de réponse technique, mais elle a une conséquence de méthode
qui appartient à ce module : **du balisage généré est du balisage non audité.** Un composant
produit par un assistant peut avoir des `aria-*` plausibles et faux, ce qui est plus difficile à
détecter qu'une absence. Le protocole du § 3 ne change pas, et il devient plus nécessaire, pas
moins.

## 8. Les pièges

1. **Écrire « conforme » sur la foi d'un outil.** Un vert est l'absence d'un signal.
2. **Remonter un faux positif sans l'avoir vérifié.** Coûte la crédibilité du rapport entier.
3. **Tester avec un lecteur d'écran sur un navigateur qui n'est pas son couple naturel.**
4. **Auditer en regardant l'écran** pendant un test au lecteur d'écran.
5. **Échantillonner en évitant les pages difficiles.**
6. **Oublier le parcours d'erreur d'un formulaire.** C'est là que vivent `11.10` et `11.11`.
7. **Ne tester que dans les réglages de sa propre machine.** Il faut émuler
   `prefers-reduced-motion`, `prefers-contrast`, `forced-colors`, le thème sombre.
8. **Croire qu'un composant généré est correct parce que ses attributs ARIA existent.**

## 9. Auto-test

1. Donne trois choses qu'un outil automatique ne peut pas décider, avec leur critère.
2. Pourquoi un résultat vert n'est-il pas une conformité ?
3. Cite deux faux positifs classiques, et la règle de méthode qui les traite.
4. Quel est l'outillage minimal suffisant pour une personne seule ?
5. Quels quatre critères un seul geste de désactivation des CSS permet-il de tester ?
6. Déroule les huit étapes du protocole clavier.
7. Quels cinq gestes suffisent pour un test au lecteur d'écran, et quel réflexe les rend
   efficaces ?
8. Quelle page un échantillon flatteur évite-t-il systématiquement ?
9. Pourquoi du balisage généré est-il plus difficile à auditer qu'un oubli ?
