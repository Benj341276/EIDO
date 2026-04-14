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
