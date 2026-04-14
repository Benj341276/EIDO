---
description: Prepare un commit coherent selon Conventional Commits — ne commit jamais automatiquement
---

Analyse les changements en cours et prepare un commit propre pour le projet EIDO Life.

Etapes :

1. Executer `git status` et `git diff --staged` puis `git diff` pour voir tous les changements
2. Verifier que les changements sont thematiquement lies — s'ils ne le sont pas :
   - Lister les groupes logiques distincts
   - Suggerer un decoupage en commits separes avec les fichiers concernes pour chacun
   - Ne pas continuer tant que le decoupage n'est pas resolu
3. Proposer un message de commit conforme a Conventional Commits :
   - Format : `type(scope): description concise`
   - Types : feat, fix, refactor, chore, docs, style, test, build, ci
   - Scope : mobile, api, shared, supabase, monorepo
   - Description en anglais, imperatif, minuscule, sans point final
   - Body optionnel si le changement merite explication
4. Afficher le message propose et attendre validation

Regles :
- Ne JAMAIS executer `git commit` — proposer uniquement
- Ne JAMAIS melanger des changements sans lien dans un seul commit
- Rappeler les conventions du CLAUDE.md si un ecart est detecte
