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

Tokens are Tailwind `@theme` variables in `app/assets/css/main.css`. One accent,
indigo `#2d46b9`, measuring 7.9:1 on white — legible as type anywhere, which is
what lets a single value do every job. If you propose a new accent and it can't
clear 4.5:1 on white, it doesn't belong in that variable. `--color-on-accent` is
the paired token for type set on an accent fill — currently white, since white
clears 7.9:1 on both accent weights. Nothing carries an accent fill outside the
masthead at the moment, so `--color-on-accent` is waiting for the next one
rather than in use.

### The masthead, and the theme

The sticky bar and the landing page's first screen are the site's one saturated
surface, and **the only part of it with two appearances**. Light is the site as
it originally stood; dark fills them with `--color-hero` `#2b3c86`.

**Below the masthead the two themes are identical** — white ground, `#f6f9fb`
band, white cards, and the same `WorkGraph`. That is the constraint that makes a
switcher affordable here rather than a decision to revisit: no component outside
the `--color-hero-*` block knows a theme exists, no card treatment forks, and
there is no second set of contrast numbers for the body of the site. Keep it
that way. A change that gives dark its own card or its own band has quietly
doubled the surface every future change has to be checked against.

The dark weight is chosen against two limits. Darker, and `EngineerManifest`
stops separating from the ground behind it (1.16:1 at `#16204a`, where the card
reads as a rectangle drawn on the hero); lighter, and the accent has nothing
left to pick out up there. `#2b3c86` measures 1.66:1 against the card, 6.05:1
for `--color-hero-accent`, 10:1 for white headlines and 7.4:1 for body copy.

Three pieces, and each has one job:

- **`main.css`** declares the light values in `@theme` and the dark values once
  as `--hero-dark-*` aliases. Both routes into dark — `[data-theme='dark']` and
  `prefers-color-scheme` — map those aliases onto the `--color-hero-*` tokens,
  and both live inside `@media screen`.
- **The inline script in `nuxt.config.ts`** resolves the theme before first
  paint and stamps `data-theme` on `<html>`. Pages are prerendered, so this is
  the only thing that runs early enough to stop a white masthead flashing blue.
- **`useTheme`** adopts whatever that script decided, flips it on request, and
  writes `localStorage` *only* on an explicit press.

Precedence is "stored choice, else the OS", in all three. `useTheme` reads it
off the attribute rather than deriving it again, and the stylesheet's
`:not([data-theme='light'])` is what lets a choice beat a dark OS in both
directions.

**Do not set a colour on the masthead that isn't a `--color-hero-*` token.** The
`@media screen` wrapper means paper gets the light values with no override at
all — which is what stops dark mode printing a blank first page, since browsers
don't print background colours but do print type, and the CV export is this page
printed. A literal in a component escapes that and prints white on white.

Below the masthead, full-bleed sections alternate white and `#f6f9fb`, content
sits in a centred `max-w-6xl` container, section headings are centred.

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
