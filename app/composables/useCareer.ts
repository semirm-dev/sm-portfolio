import type { CareerRecord } from '~/types/career'

/**
 * Fails the page rather than rendering it empty. Returning `never` is what lets
 * the computed below drop its non-null assertion.
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
 * The pages' single door to the career data. Under `nuxt generate` this fetch
 * happens at build time and the payload is baked into the page; under a Node
 * host it happens per request.
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
    profile: computed(() => record.value.profile),
    skills: computed(() => record.value.skills),
    selectedWork: computed(() => record.value.selectedWork),
    projects: computed(() => record.value.projects),
    projectsNewest: computed(() => projectsNewestFirst(record.value.projects)),
    total: computed(() => careerDuration(record.value.projects)),
    /** Whole years, for the prose and the manifest. `total` is the exact span. */
    years: computed(() => careerYears(record.value.projects)),
    graph: computed(() => techGraph(record.value)),
  }
}
