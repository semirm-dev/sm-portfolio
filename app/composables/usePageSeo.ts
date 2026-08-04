/*
 * The host is a constant here because `robots.txt` and `sitemap.xml` are static
 * files that hardcode the same value and that no composable can reach.
 */
const SITE_URL = 'https://www.semirmahovkic.xyz'

interface PageSeo {
  /** Short page title. The wordmark is appended for the tab and the card. */
  title: string
  description: string
  /**
   * The wordmark, from `profile.handle`. Passed in rather than fetched: awaiting
   * inside a composable loses the Nuxt instance, and every `useRoute`/
   * `useSeoMeta`/`useHead` call after the await then runs without context and
   * the page 500s during prerender.
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
    // `summary` because there is no og:image yet; the large-image card would
    // render an empty banner without one.
    twitterCard: 'summary',
    twitterTitle: shareTitle,
    twitterDescription: description,
  })

  useHead({
    link: [{ rel: 'canonical', href: url }],
  })
}
