# Dégraissage des cours existants : fait le 09 et 10/11/2026

> Ce fichier était un plan. C'est maintenant un rapport. Il conserve la méthode, pour qu'un
> futur ajout au curriculum puisse être arbitré de la même façon.

## ⚠️ Correction des chiffres annoncés le 09/11

Le relevé initial annonçait **132 fichiers et 619 lignes**. Ce compte était faux : il incluait
les dossiers `cours/`, `exercices/`, `quizzes/` et `projet-fil-rouge/`, qui sont des **archives
explicitement exclues du build** par le `srcExclude` de chaque cours.

Sur le contenu **vivant** seulement, le relevé réel était de **91 fichiers et 436 lignes**.

Deux conséquences, et la seconde est une correction de verdict :

1. `13-architecture` n'avait **rien** à dégraisser : ses onze lignes étaient toutes dans
   `cours/`, donc dans l'archive. Son dossier `modules/` n'en contient aucune.
2. L'affirmation « OKLCH est réellement enseigné dans `13-architecture` » portait sur
   `cours/05-architecture-frontend/05-design-tokens-systems.md`, un fichier **archivé**. La
   notion n'est donc plus enseignée dans ce cours : elle y est conservée comme source d'audit.
   Le cours 25 module 10 en est le seul propriétaire vivant, et le renvoi réciproque prévu n'a
   plus d'objet.

**La leçon, pour la prochaine fois :** compter des occurrences n'est pas lire. Un `grep` qui
ignore le `srcExclude` d'un site de documentation mesure de l'archive.

## La règle appliquée, sans exception

**Une section n'est vidée que si sa notion existe dans le cours 25.**

Elle a mordu une fois, et c'est la preuve qu'elle sert : les « 4 principes POUR » et les niveaux
A, AA, AAA étaient présents dans trois cours framework et **absents du cours 25**. Ils ont donc
été **ajoutés au module 00** (§ 4 bis, « Le référentiel en bref ») *avant* d'être retirés
ailleurs.

## Ce qui a été fait, cours par cours

| Cours | Avant | Après | PR |
|---|---|---|---|
| `04-react` | module 35 : 452 l · module 36 : 714 l | 353 l · 692 l | [react-autotraining#1](https://github.com/smaurier/react-autotraining/pull/1) |
| `02-vue` | trois modules, 2 560 l | 1 980 l, **580 retirées** | [vue-autotraining#1](https://github.com/smaurier/vue-autotraining/pull/1) |
| `21-design-system` | module 08 : 579 l | 501 l | [design-system-training#1](https://github.com/smaurier/design-system-training/pull/1) |
| `03-angular` | module 22 : 494 l | 487 l | [angular-autotraining#1](https://github.com/smaurier/angular-autotraining/pull/1) |
| `06-testing` | 24 l | renvoi posé, rien retiré | voir PR du dépôt |
| `23-droit-numerique` | 10 l | renvoi posé, rien retiré | voir PR du dépôt |
| `24-design-craft` | 99 l | renvoi posé, rien retiré | dossier du dépôt racine |
| `13-architecture` | 0 l vivant | rien à faire | aucune |
| `19-react-native` | 0 l | rien à faire | aucune |

### Ce que chaque cours garde, et pourquoi

- **`04-react`** garde JSX contre HTML, `htmlFor`, les erreurs de formulaire dans un rendu
  contrôlé, la gestion du focus par refs, et ses deux worked examples TribuZen.
- **`02-vue`** garde la sémantique en template, le piège `@click`, `ref` et `nextTick`,
  `Teleport`, plus `vitest-axe`, Storybook et la CI.
- **`21-design-system`** garde l'angle qui n'existe nulle part ailleurs : **auditer les tokens**
  et non des écrans, puis verrouiller par un test de composant.
- **`03-angular`** garde presque tout : le CDK a11y est du contenu spécifique. Sept lignes
  retirées seulement, et c'était le résultat attendu.
- **`06-testing`** garde l'outillage de test automatisé. Il perd la méthode d'audit.
- **`23-droit-numerique`** garde le **cadre légal**, dont il est le propriétaire.
- **`24-design-craft`** garde le contraste **en phase de maquette**, et renvoie pour le calcul.

## Deux divergences signalées plutôt qu'écrasées

Quand un cours affirmait autre chose que le cours 25, la contradiction a été **écrite** dans le
module, pas effacée.

1. **Le pourcentage de détection automatique.** `02-vue` et `06-testing` citent « 30 à 40 % ». Le
   cours 25 n'en cite aucun, volontairement : ces chiffres varient selon la méthode de comptage
   et ne disent rien d'un site donné. Ce qui est utile est la liste de ce qui n'est **pas**
   automatisable, module 20 § 1.
2. **La modale ARIA maison.** `04-react` module 36 reconstruit une modale avec ARIA. Le cours 25
   module 09 montre que `<dialog>` plus `showModal()` fournit le top layer, l'inertie, le
   confinement du focus et `Échap`. Le pattern reste utile à savoir faire ; une note dit de
   commencer par `<dialog>`.

## La procédure, si un cours s'ajoute un jour

```bash
A=/c/Users/sylva/Documents/projects/fullstack-autotraining
COURS=xx-nom

# 1. Mesurer le contenu VIVANT, pas l'archive. Lire le srcExclude du cours d'abord.
grep -rinE "aria-label|contraste|texte alternatif|navigation au clavier|focus visible" \
  "$A/$COURS" --include="*.md" --exclude-dir=node_modules --exclude-dir=cours \
  --exclude-dir=exercices --exclude-dir=quizzes

# 2. Lire les titres des sections trouvees. Decider section par section, jamais au comptage.
# 3. Verifier que la notion existe dans le cours 25 AVANT de vider.
#    Si elle n'y est pas : l'ajouter au cours 25 d'abord.
# 4. Brancher dans le sous-module, jamais de commit sur son main.
git -C "$A/$COURS" checkout -b degraissage-a11y

# 5. Verifier qu'aucun renvoi ne pointe vers un module inexistant.
grep -rhoE "module[s]? [0-9]{2}" "$A/$COURS/modules" | grep -oE "[0-9]{2}" | sort -u
ls "$A/25-html-css/modules/"

# 6. Pousser et ouvrir la PR. C'est Sylvain qui fusionne.
```

**Après fusion seulement**, bumper le pointeur du sous-module dans le dépôt racine. Et la preuve
d'un push est `git ls-remote`, jamais le code de sortie de `git push` : un sous-module détaché
sort en 0 sans rien pousser.
