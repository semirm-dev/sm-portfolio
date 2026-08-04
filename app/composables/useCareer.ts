import type { CareerRecord } from '~/types/career'

/**
 * Fails the page rather than rendering it empty.
 *
 * Returning `never` is what lets the computed below drop its non-null
 * assertion: the guarantee is enforced instead of asserted, so a null record
 * cannot reach a component and surface as a TypeError with no page behind it.
 */
function unavailable(cause: unknown): never {
  throw createError({
    statusCode: 503,
    statusMessage: 'Career data is unavailable.',
    cause,
    fatal: true,
  })
}

/**
 * The pages' single door to the career data.
 *
 * Under `nuxt generate` this fetch really happens at build time and the payload
 * is baked into the page; under a Node host it happens per request. Nothing
 * here changes between the two.
 *
 * The failure path only exists for the static deploy, and only off the happy
 * path: the client reads the prerendered `_payload.json`, and `/api/career`
 * itself is not among the generated routes, so should a payload ever go missing
 * the refetch has nothing to hit. Nitro can be asked to prerender the endpoint,
 * but it writes it extension-less and a static host then serves it as
 * `application/octet-stream` — which trades a clean 404 for a response that
 * parses as text and fails further downstream. Better to fail here, loudly and
 * in one place, than to hand every caller a record that might be null.
 */
export async function useCareer() {
  const { data, error } = await useAsyncData<CareerRecord>('career', () =>
    $fetch('/api/career'),
  )

  if (!data.value) {
    unavailable(error.value)
  }

  const record = computed(() => data.value ?? unavailable(error.value))

  return {
    record,
    projects: computed(() => record.value.projects),
    projectsNewest: computed(() => projectsNewestFirst(record.value.projects)),
    total: computed(() => careerDuration(record.value.projects)),
    graph: computed(() => techGraph(record.value)),
  }
}
