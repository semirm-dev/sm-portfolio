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
 */

const SITE_URL = 'https://www.semirmahovkic.xyz'
const SITE_NAME = 'semir.mahovkic'

interface PageSeo {
  /** Short page title. The wordmark is appended for the tab and the card. */
  title: string
  description: string
}

export function usePageSeo({ title, description }: PageSeo) {
  const route = useRoute()
  const url = computed(() => new URL(route.path, SITE_URL).href)
  const shareTitle = `${title} - ${SITE_NAME}`

  useSeoMeta({
    title,
    description,
    ogTitle: shareTitle,
    ogDescription: description,
    ogUrl: url,
    ogType: 'website',
    ogSiteName: SITE_NAME,
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
