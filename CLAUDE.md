# CLAUDE.md

Guidance for Claude Code working in this repository.

This is a **personal portfolio**: a small, single-author Nuxt site with two
public pages. Keep it lean — prefer deleting over accumulating, and don't add
infrastructure the site doesn't need.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build
npm run generate     # static output in .output/public
npm run typecheck
npm run lint         # eslint, including formatting
npm run lint:fix
```

The authoritative "is it green" check is:

```bash
npm run typecheck && npm run lint && npm run build
```

There is **no test runner**. Do not add one without asking.

## Architecture

Nuxt 4 (`srcDir` is `app/`), Vue 3, TypeScript, Tailwind 4, prerendered by
`nuxt generate`. `@nuxt/eslint` with `stylistic: true` does both linting and
formatting — there is no Prettier.

**Career data flows through four layers, and the order matters:**

```
server/data/career.json          the record
server/repositories/career.ts    getCareer() — the ONLY seam a database replaces
server/api/career.get.ts         GET /api/career
app/composables/useCareer.ts     useAsyncData over that endpoint
```

`app/utils/career.ts` holds the pure derivations — durations, the technology
recurrence graph, the whole-year count the prose and the manifest both quote.
Data lives in JSON, maths lives in TypeScript, and neither reaches across.

**The record is the whole CV, not just the job history.** It carries `profile`
(contact, location, availability, languages, ownership, and the summary
paragraphs), `skills`, `selectedWork`, `technologyAliases` and `projects`. No
component may state a fact about Semir in its own markup — the pages are
renderers over this record, which is what lets a PDF export be another one.
That includes the navbar wordmark, the footer links and the YAML manifest.

Two things are deliberately *not* in it. The hero headline and the SEO
descriptions are copy about this page rather than facts about him, and any
number derivable from `projects` — the "over N years" figure is computed and
interpolated through a `{years}` token, so it cannot drift from the history
below it.

The summary is stored as **segments**, not as a string containing markup:
`"plain text"` or `{ text, emphasis }`. Rendering markup would need `v-html`,
the one injection sink this site otherwise does not have. Keep it that way.

`server/repositories/career.ts` narrows the record's closed sets
(`availability`, `emphasis`) and throws on anything else. TypeScript widens
JSON strings to `string`, so assignability alone cannot check a union — and a
silent typo in `availability` would mean "not open". A bad value must stay a
failed build.

Under `nuxt generate` the endpoint is genuinely called at build time and the
payload baked into the HTML. What makes the site static is the **deploy
command**: `nuxt generate` applies Nitro's `_static` preset. `npm run build`
already produces a working `node-server` bundle, so moving to server
rendering later is a deploy-command change, not a `routeRules` change; no
component knows the difference. **Do not import `career.json` directly into
a component** — that collapses the seam this structure exists to keep open.

## Pages

`app/pages/index.vue` (hero, skills, selected work) and `app/pages/work.vue`
(head, technology graph, history). Both render inside
`app/layouts/default.vue`, which carries the navbar and footer.

## Design

Light-only, deliberately: there is no appearance switcher, so there is nothing
to switch. Tokens are Tailwind `@theme` variables in `app/assets/css/main.css`.
One accent, indigo `#2d46b9`, measuring 7.9:1 on white — legible as type
anywhere, which is what lets a single value do every job. If you propose a new
accent and it can't clear 4.5:1 on white, it doesn't belong in that variable.
`--color-on-accent` is the paired token for type set on an accent fill (the
hero's "Email me" button, which is now the only one) — currently white, since
white clears 7.9:1 on both accent weights.

Full-bleed sections alternate white and `#f6f9fb`, content sits in a centred
`max-w-6xl` container, section headings are centred.

**Tailwind is the default.** Only `WorkGraph.vue` carries a scoped `<style>`
block, because its values are computed geometry — SVG coordinates, and type
sizes the script also measures the viewBox with. No other component gets one.

Entrance motion above the fold plays on arrival. The two card grids on the
landing page are revealed on scroll instead, staggered, via `useReveal` — the
rule is "no motion the reader misses", not "no motion on scroll", and a
trigger is what satisfies it. Nothing else animates on scroll.

`useReveal` hides cards from script and never from the stylesheet, so a page
whose JavaScript did not run is still fully readable. Keep it that way.
`prefers-reduced-motion: reduce` disables all motion globally in `main.css`,
which is also why `useReveal` declines to hide anything when it is set — the
blanket rule would cancel the reveal and strand the card invisible.

## Copy

The prose is the owner's and is not to be reworded, expanded or "improved"
without being asked. That includes section headings, button labels and the
role descriptions in `career.json`.

`BytOps` and `ByteBuds` are two different employers, not a typo of each other.

## Review after every change

Re-read the diff for correctness, then run the gate above and confirm it
passes before calling anything done.
