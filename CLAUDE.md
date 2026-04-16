# EIDO Life — Optimisateur de vie

Application mobile AI "life planner" (iOS + Android) — React Native Expo + Node.js Fastify + Supabase.

## Identite

- **Nom** : EIDO Life
- **Tagline** : Optimisateur de vie
- **Logo** : `logo/generated-image.png` — cercle blanc + point bleu electrique sur fond noir
- **Palette** : noir profond `#0A0A0A`, blanc pur, accent bleu electrique `#2D7FF9`

## Stack

- **Frontend** : React Native 0.81 + Expo SDK 54, Expo Router v6, Reanimated v4, Zustand v5
- **Backend** : Node.js 22 + TypeScript + Fastify 5 (monolithe unique)
- **Base de données** : PostgreSQL via Supabase (Auth, RLS, Storage)
- **IA** : Claude API (Anthropic) — Sonnet 4.6, tool calling, prompt caching
- **Monorepo** : Turborepo + pnpm workspaces
- **APIs externes** : Google Places API v1, Eventbrite (+ Ticketmaster fallback)

## Structure monorepo

```
apps/mobile/     → React Native (Expo)
apps/api/        → Node.js Fastify backend
packages/shared/ → Types TypeScript + schemas Zod partagés
supabase/        → Migrations SQL, seeds, config
```

## Principes generaux d'implementation

- Preferer la clarte a la sophistication
- Garder une architecture legere
- Eviter la sur-ingenierie
- Preferer les petites unites comptables a de gros fichiers melangeant plusieurs responsabilites
- Respecter les patterns existants avant d'introduire de nouvelles abstractions
- Faire le plus petit changement coherent qui resout le probleme
- Avant un changement large ou multiple fichiers, explorer d'abord puis proposer un plan
- Avant de conclure, toujours executer des verifications pertinentes

## Conventions techniques

### SSE (Server-Sent Events)
- Pas de plugin `@fastify/sse`. Utiliser `reply.raw.write()` avec headers manuels (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`).

### Cache
- Cache in-memory (`Map`) pour le MVP. Pas de Redis.

### Base de donnees
- RLS active sur toutes les tables
- Jamais de service role key cote client
- Migrations numerotees dans `supabase/migrations/`

### Validation
- Zod pour la validation des inputs (API) et des schemas partages
- Schemas dans `packages/shared/src/schemas/`

### Mobile
- Permissions `expo-location` : configurer `NSLocationWhenInUseUsageDescription` (iOS) et `ACCESS_FINE_LOCATION` + `ACCESS_COARSE_LOCATION` (Android) dans `app.config.ts`
- `.npmrc` : `node-linker=hoisted` et `shamefully-hoist=true` (requis pour Metro + pnpm)

### i18n
- Detection automatique de la langue du telephone via `expo-localization`
- Langues supportees : FR (defaut), EN, ES, DE
- Traductions dans `apps/mobile/i18n/` (fichier plat par langue)
- Hook `useTranslation()` retourne `t(key)` + `language`
- Categories stockees en cles anglaises en DB, affichees traduites via `labelFn`
- Changeable par l'utilisateur dans Profil

## Business model (prevu pour phases 7+)

4 sources de revenus a implementer apres le core product :
1. **Freemium** : 3 generations de plan gratuites/mois, paywall ensuite
2. **Abonnement Premium** : 2-3 euros/mois via In-App Purchase, nombre de CTA illimite (ou X/mois configurable depuis l'admin)
3. **Affiliation** : commission sur clics/reservations via l'app (partenaires marchands)
4. **Publicite** : ads natives ou contenus sponsorises

Hooks a prevoir dans l'architecture :
- Compteur de plans generes par mois (user)
- Flag `is_premium` + `premium_expires_at` sur le profil
- Limite CTA configurable : free=3/mois, premium=illimite (ou X/mois via admin)
- Tracking clics sur les items (external_url)
- Flag `is_partner` + `affiliate_url` sur les items

Admin dashboard prevu en Phase 10 (app web separee, meme Supabase) :
- Metriques utilisateurs (nombre, sessions, clics)
- Gestion partenaires (activer/desactiver liens d'affiliation)
- Analytics revenus

## Commandes

```bash
pnpm install                          # Install deps
pnpm dev --filter @eido-life/mobile   # Start Expo dev server
pnpm dev --filter @eido-life/api      # Start Fastify API (port 3001)
pnpm typecheck                        # Typecheck all workspaces
pnpm build                            # Build all
supabase db push                      # Push migrations
supabase start                        # Local Supabase (requires Docker)
```
