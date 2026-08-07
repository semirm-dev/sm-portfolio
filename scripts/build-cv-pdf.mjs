/**
 * Prints `/cv` to `public/Semir_Mahovkic-CV.pdf`. Run it with `npm run cv`,
 * which builds the site first — this needs a generated `/cv` to print.
 *
 * **Not part of the deploy.** The PDF is committed, and `nuxt generate` copies
 * `public/` into the output like any other static asset, so the host never
 * needs a browser. That is deliberate: Chromium wants a dozen system libraries
 * the build image may or may not carry, and a CV that changes a few times a
 * year does not justify putting that in the path of every deploy.
 *
 * The cost is that the PDF can go stale. **Re-run `npm run cv` after editing
 * `server/data/career.json`** — nothing checks this for you.
 *
 * A static server rather than `file://`: the generated HTML references
 * `/_nuxt/*` by absolute path, which a file URL cannot resolve, so the page
 * would render unstyled.
 */
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
/** Served from, and printed from: the build this script was run after. */
const OUTPUT = join(ROOT, '.output/public')
// Written to `public/`, so it is committed and ships as a static asset. Same
// filename as the `href` in app/layouts/cv.vue's download link — nothing but
// this comment ties the two together, so keep them in sync by hand.
const PDF = join(ROOT, 'public/Semir_Mahovkic-CV.pdf')

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function resolve(url) {
  let path

  // A malformed percent-encoding throws, and this runs in a request callback
  // outside the awaited chain — an uncaught throw here would skip the `finally`
  // that closes the browser, orphaning a Chromium process.
  try {
    path = normalize(decodeURIComponent(new URL(url, 'http://x').pathname))
  }
  catch {
    return null
  }

  // Path traversal cannot reach outside the output directory.
  if (path.includes('..')) {
    return null
  }

  const direct = join(OUTPUT, path)

  if (existsSync(direct) && statSync(direct).isFile()) {
    return direct
  }

  const indexed = join(direct, 'index.html')

  return existsSync(indexed) ? indexed : null
}

const server = createServer((request, response) => {
  const file = resolve(request.url ?? '/')

  if (!file) {
    response.writeHead(404).end('not found')

    return
  }

  response.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
  })
  // Without an error listener, a client aborting mid-download throws inside
  // this request callback — the same uncaught-throw class `resolve` already
  // guards against — and takes the process down instead of just the request.
  createReadStream(file).on('error', () => response.destroy()).pipe(response)
})

/** The foot is the record's, like everything else on the document. */
const { profile } = JSON.parse(
  readFileSync(join(ROOT, 'server/data/career.json'), 'utf8'),
)

const escapeHtml = value =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;')

let browser

try {
  // Without an error listener, a bind failure fires neither callback: the
  // `await` hangs forever instead of rejecting into the `catch` below.
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject)
      resolve()
    })
  })

  const { port } = server.address()

  browser = await puppeteer.launch({
    // The only page loaded is this repo's own prerendered output on loopback.
    // Build images run as root, where Chrome's sandbox refuses to start, and
    // their default 64MB /dev/shm is not enough for a page this size.
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  const page = await browser.newPage()

  // `goto` resolves on a 404 — it only rejects on network failure — so a route
  // that failed to prerender would otherwise render "not found" and still
  // produce a valid, wrong PDF. The whole point of this step is to fail loudly
  // instead of shipping that.
  const response = await page.goto(`http://127.0.0.1:${port}/cv`, { waitUntil: 'networkidle0' })

  if (!response?.ok()) {
    throw new Error(`/cv returned ${response?.status()} — was it prerendered?`)
  }

  await page.evaluate(() => document.fonts.ready)

  // Chrome's `footerTemplate` cannot see the page's stylesheet, so these are
  // read off the live page instead of retyped — that's what stops them
  // drifting from `--color-rule` / `--color-muted` / `--font-sans` in main.css.
  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)

    return {
      rule: root.getPropertyValue('--color-rule').trim(),
      muted: root.getPropertyValue('--color-muted').trim(),
      font: root.getPropertyValue('--font-sans').trim(),
    }
  })

  /*
   * The rules go in a <style> element, not an inline style attribute. Chrome
   * returns `--font-sans` with double quotes around `"Segoe UI"`, and
   * interpolating that into `style="…"` closes the attribute early — silently
   * dropping `font-size` and printing the footer at Chrome's 1px default.
   */
  const footer = `
    <style>
      .cv-foot {
        width: 100%;
        margin: 0 16mm;
        padding-top: 2.4mm;
        border-top: 0.5pt solid ${tokens.rule};
        display: flex;
        justify-content: space-between;
        font-family: ${tokens.font};
        font-size: 8pt;
        color: ${tokens.muted};
      }
    </style>
    <div class="cv-foot">
      <span>${escapeHtml(profile.name)} — ${escapeHtml(profile.title)}</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`

  await page.pdf({
    path: PDF,
    // The document's own `@page cv` decides the sheet, not a paper name here.
    preferCSSPageSize: true,
    // On, for the band behind each company heading. That band is the one fill
    // on the document and it is decoration only — a hand-print of `/cv` with
    // background graphics off loses it and loses nothing else.
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: footer,
  })

  console.log(`wrote ${PDF}`)
}
catch (cause) {
  // A red build beats a download button pointing at a 404.
  console.error('CV PDF generation failed:', cause)
  process.exitCode = 1
}
finally {
  await browser?.close()
  server.close()
}
