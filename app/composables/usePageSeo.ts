/**
 * Per-page metadata, in one place so the two pages cannot drift apart.
 *
 * `title` is the short form and goes through the global template in `app.vue`,
 * which appends the wordmark. Open Graph does not get that template — social
 * cards read `og:title` literally — so the composed string is built here rather
 * than repeated at each call site.
 *
 * Canonical and `og:url` are absolute because both must be, and they resolve
 * against the www host: the apex 308-redirects to www, so www is the address
 * these pages actually live at and the one to point crawlers and share cards at.
 *
 * The host stays a constant here while the wordmark comes from the record. They
 * look alike and are not: `robots.txt` and `sitemap.xml` are static files that
 * hardcode the same host and that no composable can reach, so a runtime value
 * would put the site's address in two kinds of place at once. The wordmark has
 * no such second home — it is a fact about him, and the navbar already reads it
 * from the record.
 */

const SITE_URL = 'https://www.semirmahovkic.xyz'

interface PageSeo {
  /** Short page title. The wordmark is appended for the tab and the card. */
  title: string
  description: string
  /**
   * The wordmark, from `profile.handle`.
   *
   * Passed in rather than fetched here, and the reason is a hard constraint
   * rather than a preference: awaiting inside a composable loses the Nuxt
   * instance, so every `useRoute`/`useSeoMeta`/`useHead` call after the await
   * runs without context and the page 500s during prerender. Both callers hold
   * the record already, so handing the value over costs a line and keeps this
   * function synchronous, which is what those composables require.
   */
  siteName: string
}

export function usePageSeo({ title, description, siteName }: PageSeo) {
  const route = useRoute()
  const url = computed(() => new URL(route.path, SITE_URL).href)
  const shareTitle = `${title} - ${siteName}`

  useSeoMeta({
    title,
    description,
    ogTitle: shareTitle,
    ogDescription: description,
    ogUrl: url,
    ogType: 'website',
    ogSiteName: siteName,
    /*
     * `summary`, not `summary_large_image`: there is no og:image yet, and
     * asking for the large-image card without one renders an empty banner.
     * Add a 1200x630 PNG to `public/`, set `ogImage` to its absolute URL, and
     * this can move up to `summary_large_image`.
     */
    twitterCard: 'summary',
    twitterTitle: shareTitle,
    twitterDescription: description,
  })

  useHead({
    link: [{ rel: 'canonical', href: url }],
  })
}
