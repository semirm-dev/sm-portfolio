const { join } = require('node:path')

/*
 * Puppeteer exists for `npm run cv` and nothing else — the CV PDF is committed
 * and the deploy just serves it. So a build machine has no use for a 150MB
 * browser, and downloading one on every cold install is pure cost: Chromium
 * also wants a dozen system libraries the host image may not carry, which is
 * exactly the fragility keeping it out of the deploy is meant to avoid.
 *
 * Locally the browser lands under `node_modules`, so `rm -rf node_modules`
 * takes it with them rather than leaving 150MB behind in a stray cache.
 */
module.exports = {
  skipDownload: Boolean(process.env.CI || process.env.VERCEL),
  cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
}
