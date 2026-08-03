# semir.mahovkic

Personal portfolio — a two-page Nuxt site: a landing page and a work history.

Live design tokens, career data and copy all live in this repo; there is no CMS
and no database.

The code is [MIT](LICENSE); the career record, page copy and branding are not.
The machinery is reusable, the CV is not.

## Development

Requires Node 20+ (developed on 24).

```bash
npm install
npm run dev          # http://localhost:3000
```

## Checks

```bash
npm run typecheck    # nuxt typecheck (vue-tsc)
npm run lint         # eslint, including formatting (ESLint Stylistic)
npm run lint:fix     # fix and format
npm run build
```

The gate before pushing is `npm run typecheck && npm run lint && npm run build`.

## Deploying

```bash
npm run generate     # static output in .output/public
```

Any static host serves it. Every route is prerendered, including the career
endpoint's payload.

Response headers live in `vercel.json`, because `nuxt generate` emits files and
not responses — there is nowhere else in the repo for them to come from. They
are set there rather than in `routeRules` on purpose: route rules are compiled
by the server preset, and the static preset has no server to compile them into,
so they would silently do nothing on this deploy. Moving off Vercel means
porting that file, not rewriting the site.

The CSP is written against what the build actually emits. Nuxt inlines an
importmap and a bootstrap script into every page, and the entrance animations
carry their delays as style attributes, so both `'unsafe-inline'` allowances are
load-bearing and a prerendered site has no per-request nonce to replace them
with. What the policy still buys is real: the site references no third-party
origin at all, and nothing external can be loaded, injected or framed.
