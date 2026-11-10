# 21. Les APIs de plateforme et la grille de décision

> **Outcome :** à la fin, tu as une grille à cinq questions pour décider si une API de plateforme
> est utilisable dans un projet donné, tu l'as appliquée aux quatorze APIs de l'enquête, et tu
> sais que la bonne réponse est parfois « non, et voici le repli ».

## 1. Pourquoi une grille

« Est-ce que c'est supporté ? » est la mauvaise question. Elle a une réponse binaire alors que la
décision ne l'est pas. Les bonnes questions portent sur ce qui arrive **quand ce n'est pas là**,
et sur ce que ça coûte de s'en passer.

### La grille

**1. Qu'est-ce qui se passe chez celui qui ne l'a pas ?**
Trois réponses possibles, et une seule est acceptable sans travail supplémentaire :

- l'amélioration est absente, le reste fonctionne, c'est le bon cas ;
- la fonctionnalité est absente, et il faut un chemin alternatif ;
- la page est cassée, ce qui est rédhibitoire.

**2. Est-ce que le repli est plus cher que le gain ?**
Une API qui demande d'écrire et de maintenir l'ancienne implémentation **en plus** n'apporte rien
tant que l'ancienne est nécessaire. Elle coûte deux chemins au lieu d'un.

**3. Est-ce que ça remplace du code existant, ou ça en ajoute ?**
Remplacer un contournement supprime de la dette. Ajouter une possibilité en crée. À bénéfice égal,
la première l'emporte toujours.

**4. Est-ce que ça demande une permission, et que fait-on du refus ?**
Toute API qui demande une permission a un taux de refus. Le parcours de refus fait partie de la
fonctionnalité, pas des cas limites.

**5. Est-ce que ça change l'accessibilité ou la vie privée ?**
Une API qui déplace le focus, ouvre une fenêtre, lit un capteur ou accède à des fichiers touche
l'une des deux. Et dans ce cas, la réponse par défaut est non jusqu'à preuve du contraire.

## 2. Les quatorze APIs de l'enquête, passées à la grille

### 2.1 Les sûres : amélioration progressive propre

| API | Verdict |
|---|---|
| `urlpattern` | **oui.** Un analyseur d'URL normalisé, qui remplace des expressions régulières écrites à la main. Repli trivial, remplace du code existant. |
| `intl_segmenter` | **oui.** Découpage en graphèmes, mots et phrases selon la locale. Remplace un `split(" ")` qui est faux dans la moitié des langues, et faux sur les émojis. |
| `intl_locale` | **oui.** Manipulation structurée des locales. |
| `import_attributes` | **oui.** `import donnees from "./x.json" with { type: "json" }`. Question d'outillage plus que de navigateur. |
| `sanitizer_api` | **oui, et important.** Assainissement natif du HTML, qui remplace une bibliothèque dont la correction est critique pour la sécurité. Un assainisseur maison est presque toujours faux. |

### 2.2 Les conditionnelles : utilisables avec un vrai repli

| API | Verdict |
|---|---|
| `web_share_api` | **oui, avec repli.** Le partage natif est une amélioration réelle sur mobile. Repli : des liens de partage classiques, ou copier dans le presse-papiers. Ne demande pas de permission. |
| `filesystem_access` | **conditionnel.** Puissant pour un éditeur, et il faut garder le couple `<input type="file">` plus téléchargement. Demande une permission, et la réponse au refus doit être le parcours normal. |
| `payment_request_api` | **conditionnel.** Gain réel sur la conversion, mais le formulaire classique reste obligatoire, et `11.12 (AA)` du module 14 s'applique intégralement : modification, annulation, confirmation. |
| `web_transport_api` | **conditionnel.** Pour du temps réel à faible latence. Repli WebSocket à maintenir, donc deux chemins : la question 2 de la grille se pose sérieusement. |
| `geolocation_element` | **à suivre.** Un élément déclaratif pour la géolocalisation, nouveauté 2026. Intérêt : rendre visible dans le balisage une demande de permission qui était invisible. Statut de proposition. |

### 2.3 Les réservées : besoin très spécifique

| API | Verdict |
|---|---|
| `web_bluetooth_api` | **non, sauf projet dédié.** Permission, support partiel, et de fortes implications de vie privée. |
| `web_usb_api` | **non, sauf projet dédié.** Même raisonnement. |
| `speech_recognition_api` | **prudence.** Ce n'est **pas** une fonctionnalité d'accessibilité : les personnes qui pilotent à la voix utilisent leur propre logiciel, qui fonctionne sur tout le système. Une reconnaissance vocale intégrée au site entre en conflit avec lui plutôt que de l'aider. Les données audio sont parfois traitées côté serveur, donc question 5. |
| `web_mcp` | **à suivre.** Nouveauté 2026 : exposer les capacités d'une page à un agent. Beaucoup trop jeune pour un projet, et la question 5 est entière : ce qu'un agent peut faire à la place de l'utilisateur est un sujet de sécurité et de consentement avant d'être un sujet technique. |

## 3. Les deux erreurs symétriques

**Adopter trop tôt.** Deux chemins à maintenir, dont l'un sert à une minorité, et une
fonctionnalité dont on ne peut pas se débarrasser du jour où on l'a livrée.

**Adopter trop tard.** Maintenir une bibliothèque de positionnement alors que le module 09 est
disponible, maintenir un confinement de focus maison alors que `<dialog>` existe, maintenir un
calcul de hauteur en JavaScript alors que `dvh` existe. Cette erreur-là est plus coûteuse, et
beaucoup moins visible, parce qu'elle ne produit aucun incident : elle produit seulement du code
qu'on continue de payer.

La veille annuelle de mi-novembre, décrite dans le `README.md`, sert d'abord à attraper la
seconde. Le filtre à appliquer est la question 3 : **qu'est-ce qui me permet de supprimer du
code ?**

## 4. L'accessibilité dans ce module

Trois critères que les APIs mettent en jeu, et qu'on oublie parce qu'ils ne concernent pas du
balisage.

**`7.4 (A)` : pas de changement de contexte à la prise ou à la perte de focus, ni en cours de
saisie.** Une API qui déplace l'utilisateur, ouvre une fenêtre ou recharge une vue au mauvais
moment viole ce critère. Le cas classique : la soumission automatique d'un formulaire au
changement d'un `<select>`.

**`13.1 (A)` : rafraîchissement, redirection et limite de session.** Un délai doit être supérieur
à vingt heures, ou contrôlable par l'utilisateur, c'est-à-dire qu'il peut l'arrêter, le prolonger
d'au moins dix fois, ou être averti. Concerne les sessions expirantes, les sondages
automatiques, les redirections. Et une redirection par `<meta refresh>` doit être immédiate.

**`13.12 (A)` : activation par le mouvement.** Toute fonctionnalité déclenchée en secouant ou en
inclinant l'appareil doit avoir une alternative par un composant d'interface, et doit pouvoir
être désactivée. Cela concerne directement les APIs de capteurs.

À quoi s'ajoute le rappel du module 15 : **`13.2 (A)`**, pas de nouvelle fenêtre sans action de
l'utilisateur.

## 5. Ce que l'enquête interroge, et où c'est traité

Items `html2026` rattachés à ce module : `sanitizer_api`, `intl_segmenter`, `intl_locale`,
`import_attributes`, `urlpattern`, `web_mcp`, `geolocation_element`, `filesystem_access`,
`web_share_api`, `web_bluetooth_api`, `web_usb_api`, `speech_recognition_api`,
`payment_request_api`, `web_transport_api`.

Cinq de ces quatorze sont des nouveautés 2026, à savoir `import_attributes`, `urlpattern`,
`web_mcp`, `geolocation_element` et `web_transport_api`. L'exercice d'application de la grille se
refait chaque année sur la nouvelle liste, et c'est précisément le geste du rendez-vous de
mi-novembre : pas « qu'est-ce qui est nouveau », mais « qu'est-ce qui change ma réponse de l'an
dernier ».

## 6. Les pièges

1. **Poser la question du support au lieu de celle du repli.**
2. **Maintenir deux chemins durablement.** La question 2 de la grille existe pour ça.
3. **Traiter le refus de permission comme un cas limite.** C'est un parcours à part entière.
4. **Confondre reconnaissance vocale et accessibilité.** Les outils de l'utilisateur sont
   meilleurs que le tien, et le tien les gêne.
5. **Soumettre un formulaire au changement d'un `<select>`.** Non conforme `7.4 (A)`.
6. **Laisser une session expirer sans avertissement ni prolongation.** Non conforme `13.1 (A)`.
7. **Faire d'un geste de secousse le seul moyen d'agir.** Non conforme `13.12 (A)`.
8. **Oublier que l'adoption tardive coûte, elle aussi.** Elle ne produit pas d'incident, elle
   produit de la dette silencieuse.

## 7. Auto-test

1. Énonce les cinq questions de la grille.
2. Quelle est la seule réponse acceptable à la question 1 sans travail supplémentaire ?
3. Pourquoi l'API d'assainissement est-elle un cas particulièrement favorable ?
4. Pourquoi la reconnaissance vocale intégrée au site n'est-elle pas une fonctionnalité
   d'accessibilité ?
5. Quelle est l'erreur d'adoption la plus coûteuse, et pourquoi est-elle la moins visible ?
6. Quel filtre appliquer à une nouveauté pour savoir si elle vaut ton temps ?
7. Donne le cas classique de violation de `7.4 (A)`.
8. Que doit permettre un site dont la session expire, selon `13.1 (A)` ?
