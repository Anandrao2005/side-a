# Side A

A full-stack independent music player with an ivory, olive, and terracotta visual identity. Rebuilt after inspecting [JL978/spotify-clone-client](https://github.com/JL978/spotify-clone-client) at commit `4c8919225101a64dfd933817eeef966dba77d7b8`. The old React 16 frontend is preserved under `upstream/src` for reference with its MIT license. The running application is a new React 19/Vinext implementation, not an in-place CSS patch or a Spotify-connected deployment.

## What works

- Responsive discovery page, curated mixes, album and artist views.
- Debounced server-side catalog search and genre filters.
- Actual audio playback, seek, volume/mute, previous/next, shuffle, repeat and editable queue.
- Personal playlist creation, editing, deletion, add/remove tracks and duplicate prevention.
- Server-persisted favourites and recently played history.
- Hosted ChatGPT authentication, user-scoped D1 storage and authorization on every mutation.
- Keyboard focus styling, modal focus trap, Escape to close, `/` to focus search.
- Hash-based view navigation supports browser back/forward and view reloads.
- No Spotify credentials are needed to use the demo catalog.

## Music and scope

The catalog contains **12 original synthesized 48-second instrumental demos** and fictional artist names. Compositions are generated deterministically by the audio API. Album artwork is original CSS artwork, without external image dependencies. This is not a commercial music library, an upload/artist-distribution service, or an active Spotify integration. The original Spotify backend/OAuth flow has not been retained in the running app. Integrating commercial music requires an authorized provider and its applicable licensing/API setup; no API keys or provider accounts have been fabricated.

The player queue and volume are session-local. Playlists, likes, and history are durable and scoped to the authenticated account. The deployment is owner-private. There is no payment/subscription/admin system because this is a personal listening app.

## Stack

- React 19, TypeScript, Vinext/Vite
- Cloudflare Worker API handlers
- Cloudflare D1 (SQLite), Drizzle schema + SQL migration
- Zod request validation, Lucide icons
- Platform-owned ChatGPT authentication

## Run locally

Use Node 22.13+ (Node 24 recommended; tests use `node:sqlite`) and pnpm.

```sh
pnpm install --frozen-lockfile
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_glorious_landau.sql
pnpm dev
```

Apply the initial migration once to a new local database. The dev URL is printed by the server. The starter's portable dev mode provides its local ChatGPT sign-in emulation. Hosted authentication is supplied by Sites; do not expose this Worker directly to the public Internet while trusting client-supplied identity headers. Managed previews do not emulate sign-in, so protected writes are intentionally unavailable there.

The hosting manifest binds `DB`. Publishing through Sites provisions the production D1 database and applies migrations. Production data is separate from local preview data. No application secrets are required for this catalog.

## Checks

```sh
pnpm typecheck
pnpm test
pnpm build
```

`tests/backend.mjs` bundles the actual API handlers with a test-only identity adapter and real in-memory SQLite. It checks anonymous access, cross-user isolation, cross-origin rejection, schema validation, ordered playlist CRUD, duplicate prevention, likes/history persistence, catalog search, and WAV byte-range accuracy. The production code never imports these adapters.

Browser QA covers the discovery layout, actual play/pause, search results, navigation and queue controls. Mobile layouts are implemented with CSS breakpoints; viewport emulation is not available in this browser environment.

## API

| Method | Route | Behavior |
| --- | --- | --- |
| GET | `/api/catalog?q=` | Catalog search plus curated mixes |
| GET | `/api/audio/:id` | Original PCM WAV audio; supports `Range`/206 and invalid-range 416 |
| GET | `/api/library` | Authenticated profile, playlists, likes and recent history |
| POST | `/api/library` | Authenticated validated mutation, JSON body |

Mutation actions:

- `create`: `name`, optional `description`
- `rename`: playlist `id`, `name`, optional `description`
- `delete`: playlist `id`
- `add` / `remove`: playlist `id`, `trackId`
- `like`: `trackId`, boolean `liked`
- `history`: `trackId`

All playlist operations verify owner identity server-side. Unknown tracks are rejected. Writes with a different Origin are rejected. Payloads are schema-validated. Missing authentication returns 401; non-owned playlists return 404. IDs are UUIDs, and SQL parameters are bound rather than concatenated.

## Project layout

```
app/page.tsx                 Application and player UI
app/globals.css              Responsive visual system and original cover art
app/catalog.ts               Original demo catalog and curated mixes
app/api/catalog/route.ts     Search API
app/api/audio/[id]/route.ts  Range-capable original demo audio endpoint
app/api/library/route.ts     User library API and validation
app/chatgpt-auth.ts          Platform identity helpers
 db/schema.ts                Durable data schema
 drizzle/                    Versioned SQL migrations
 tests/backend.mjs           API and database regression checks
 upstream/                   Original code and attribution
```

## Operational notes

This deployment has functional frontend and persistent backend flows. It has not undergone a production load test or an independent security audit. Audio synthesis is intentionally bounded to 48 seconds at 16 kHz mono and cached with HTTP headers; a large commercial catalog should use licensed media in object storage/CDN instead. Fonts use Google Fonts with local system fallbacks. Do not describe the original demo tracks as recordings by real artists.
