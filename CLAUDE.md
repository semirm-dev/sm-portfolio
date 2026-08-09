# CLAUDE.md

Guidance for Claude Code working in this repository.

This is a **personal portfolio**: a small, single-author Nuxt site with three
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

```bash
npm run cv           # rebuild public/Semir_Mahovkic-CV.pdf
```

**`npm run cv` is not part of the deploy, and that is the point.** The PDF is
committed under `public/`, so `nuxt generate` copies it like any other static
asset and the host never needs a browser. Chromium wants a dozen system
libraries a build image may or may not carry, and a document that changes a few
times a year does not justify putting that in the path of every deploy —
`.puppeteerrc.cjs` skips the browser download entirely when `CI` or `VERCEL` is
set, so `puppeteer` costs a build machine nothing.

The price is that **the PDF can go stale: re-run `npm run cv` after editing
`server/data/career.json`.** Nothing checks this for you.

Locally that needs one library this WSL box does not ship. Both the full
binary and `chrome-headless-shell` fail identically without it — `Code: 127`,
`libasound.so.2: cannot open shared object file`:

```bash
sudo apt-get install -y libasound2t64   # Ubuntu 24.04; libasound2 on older
```

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
paragraphs), `skills`, `selectedWork`, `technologyAliases` and `projects` —
each of which carries the role `title` held on it, where there was one worth
naming. `profile.location` is *his* — `Remote` — and each project's is the
employer's office; nothing may print one in place of the other. No
component may state a fact about Semir in its own markup — the pages are
renderers over this record, which is what lets `app/pages/cv.vue` be a third
one, printed to PDF rather than served as HTML. That includes the navbar
wordmark, the footer links and the YAML manifest.

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
(head, technology graph, history) render inside `app/layouts/default.vue`,
which carries the navbar and footer.

`app/pages/cv.vue` is the third renderer over the same record: an A4 document,
printed to `public/Semir_Mahovkic-CV.pdf` by `scripts/build-cv-pdf.mjs` when
you run `npm run cv`. It has its own layout, `app/layouts/cv.vue` — a back
link and a download button in a `print:hidden` header — so nothing outside the
document's own `<article>` reaches the PDF.

**Its history is one row per project, the same list `/work` renders — and no
row may lose its dates.** An earlier version merged consecutive projects at
one employer, copying the old Canva CV's layout — it printed the three Endava
engagements as a single `11/2021 - 07/2024` row and lost the dates of each.
The document is generated from the record so that the two cannot disagree; a
layout that *merges* rows is that guarantee quietly failing.

Contact details are one row under the name, not a labelled section — they are
the first thing looked for. LinkedIn and GitHub print as link text because
nobody types a LinkedIn slug; his own domain prints in full because someone
holding a printed sheet might.

*Condensing* a row is not merging it. Everything starting before `EARLIER_ROLES_BEFORE`
(`2021-11`, the month the Endava run begins) prints through `CvEarlierEntry`
instead of `CvEntry`: still one row per project, still its own start and end,
but three lines rather than a full block. Only the responsibility list is
dropped, and `/work` still has it. The cut is computed in
`app/utils/career.ts`, not flagged in the record — a `condensed: true` field
would be the record deciding how it gets printed, which is the same mistake as
storing the separator between technologies.

Pagination is the printer's: entries carry `break-inside-avoid`, section heads
`break-after-avoid`, so adding a job reflows the document instead of breaking
a hand-measured page split.

**One break is forced, and only one:** `break-before-page` on the Work
experience head, so page one is always the header, the profile and the skills
and nothing else. That page is a fixed unit rather than a consequence — left
to flow it picks up whichever entry happens to fit, and the first thing a
reader sees changes shape every time a job is added. It is inert on screen:
fragmentation applies to paged media only. Do not add a second one; every
other page boundary must stay a consequence of the content.

The `@page cv` rule in `main.css` is named for the same reason the tokens are
scoped — unnamed, it would resize and re-margin every printed page on the
site, `/` and `/work` included. **It is bound from `<body>`, not from the
document's own root:** `pages/cv.vue` sets a `cv-document` class via
`useHead`'s `bodyAttrs`, and `main.css` matches it with `body.cv-document`.
Binding it to the `<article>` instead leaves the default page on every
ancestor above it, and Chrome breaks into the named page and back out again,
emitting a blank fifth sheet for four pages of content — "simplifying" this
back to a class on the article reintroduces that page.

## Design

Tokens are Tailwind `@theme` variables in `app/assets/css/main.css`. One accent,
indigo `#2d46b9`, measuring 7.9:1 on white — legible as type anywhere, which is
what lets a single value do every job. If you propose a new accent and it can't
clear 4.5:1 on white, it doesn't belong in that variable. `--color-on-accent` is
the paired token for type set on an accent fill — currently white, since white
clears 7.9:1 on both accent weights. The masthead and the CV's Download PDF
button are the only places that set type on an accent fill, and both use
`--color-on-accent`.

The accent's lighter weights do work below the masthead, and neither of them
reaches for that token: `--color-accent-rule` draws link underlines and the
card hover border, `--color-accent-soft` is the work-history hover wash. Both
sit under ordinary ink rather than carrying type of their own.

### The masthead, and the theme

The sticky bar and the landing page's first screen are the only part of the site
with two appearances. **Light is the site exactly as it stood before a dark theme
existed** — white, accent-filled button, the lot. Dark fills them with `#2b3c86`,
and **dark is the default**.

**Below the masthead the two themes are identical** — white ground, `#f6f9fb`
band, white cards, the same `WorkGraph`. That is the constraint that makes a
switcher affordable rather than a decision to revisit: no component outside the
`--color-hero-*` block knows a theme exists, no card treatment forks, and there
is no second set of contrast numbers for the body of the site. A change that
gives dark its own card or its own band quietly doubles the surface every future
change has to be checked against.

`#2b3c86` is bounded on both sides. Darker and `EngineerManifest` stops
separating from the ground behind it (1.16:1 at `#16204a`, where the card reads
as a rectangle drawn on the hero); lighter and the accent has nothing left to
pick out. Here it measures 1.66:1 against the card, 6.05:1 for the accent, 10:1
for white headlines and 7.4:1 for body copy.

Three pieces, each with one job:

- **`main.css`** declares light in `@theme` and dark once as `--hero-dark-*`
  aliases, mapped onto the `--color-hero-*` tokens by a single rule inside
  `@media screen`.
- **The inline script in `nuxt.config.ts`** resolves the theme before first paint
  and stamps `data-theme` on `<html>`. Pages are prerendered, so this is the only
  thing that runs early enough to stop a flash on load.
- **`useTheme`** adopts whatever that script decided, flips it on request, and
  writes `localStorage` *only* on an explicit press.

**Precedence is "stored choice, else dark", in all three.** The operating system
does not get a vote — there is no `prefers-color-scheme` anywhere, deliberately.
`:not([data-theme='light'])` is what makes dark the default: it matches with no
attribute and with `dark`, so one selector covers both and there is no second
copy of the mapping. A reader with no JavaScript gets dark too.

**Do not set a colour on the masthead that isn't a `--color-hero-*` token.** The
`@media screen` wrapper means dark does not exist on paper, so printing falls
back to the light values with no override — which is what stops a page printed
in dark putting white headlines on white paper. Browsers don't print background
colours but do print type, and the CV export is this page printed. A literal in
a component escapes that.

The one place paper is neither theme is the primary button: no fill survives to
paper, so `@media print` gives its label the accent rather than white. Without
it, "Email me" prints as nothing.

Below the masthead, full-bleed sections alternate white and `#f6f9fb`, content
sits in a centred `max-w-[115rem]` container, section headings are centred.

That container and its gutter appear **six times** — navbar, footer, hero, both
landing sections and `/work` — and all six must agree or the navbar stops
lining up with the page under it. The gutter is `px-6`, `lg:px-10`, `xl:px-20`,
and the width and the gutter are **one decision, not two**: `115rem` is
`110rem` plus the `xl` increase doubled, which is what holds every screen past
1840px at the 1680px of content it had before the gutter grew. Between `lg` and
that cap there are no auto margins, so the gutter is the only air the page has
— raise it on its own and every wide screen narrows with it. Written out once,
above the navbar container in `default.vue`.

### Hover

Two surfaces answer the pointer and they say different things. A **landing-page
card** lifts 3px, deepens to `--shadow-card-raised` and warms its hairline to
`--color-accent-rule`. A **work-history row** does not lift: it takes an accent
rail down its left edge and a wash of `--color-accent-soft` at 30%. The
difference is deliberate — a lift promises the thing can be opened, and a row
cannot be. Only the links inside it go anywhere.

**Hover may change paint. It must not change layout.** The row's rail and wash
are both pseudo-elements pinned outside the content box, so no margin, padding
or width moves. An earlier version bled the row outward with `-mx-5`/`px-5` on
hover instead, and since Tailwind's `transition` covers neither margin nor
padding, the geometry snapped back the moment the pointer left while the colour
still had 200ms to fade: the row visibly contracted at full strength, and the
rail — placed against a padding box that had just moved — spent the fade on top
of the date column. Two separate bugs from one mistake. Anything that animates
belongs to paint.

The wash is 30% and the reasons it isn't lower, or a shade of `--color-band`,
are in `ProjectEntry.vue`. The short version is that at this lightness the hue
is settled by two or three points per channel, so read the resolved colour off
the page rather than judging a token by its own hex.

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
