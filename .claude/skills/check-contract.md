---
description: Verifie la coherence des contrats front/back (routes, types, payloads, reponses)
---

Inspecte la coherence entre le frontend et le backend du projet EIDO Life.

Etapes :

1. Lister tous les endpoints backend reellement definis dans `apps/api/src/routes/` (route, methode HTTP, schema du body, format de reponse)
2. Lister tous les appels API cote frontend dans `apps/mobile/src/lib/` et `apps/mobile/src/stores/` (URL, methode, payload envoye, type attendu en retour)
3. Comparer les types partages dans `packages/shared/src/` avec leur utilisation reelle cote front et back
4. Identifier les ecarts :
   - Routes manquantes ou mal nommees
   - Methodes HTTP incorrectes
   - Champs manquants, renommes ou de type different
   - Formats de reponse divergents (enveloppe, pagination, erreurs)
5. Proposer le plus petit plan correctif possible — ne pas sur-corriger
6. Resumer clairement : tableau des ecarts trouves + corrections proposees

Ne modifie aucun fichier. Rapport uniquement.
