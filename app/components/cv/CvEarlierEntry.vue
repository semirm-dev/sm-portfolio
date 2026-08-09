<script setup lang="ts">
import type { Project } from '~/types/career'

/**
 * A pre-2021 role, condensed to a dated line — the counterpart to `CvEntry`,
 * which prints an entry in full.
 *
 * It drops the responsibility list and nothing else. The dates, the employer,
 * the project and the stack all still print, one project per row, so the
 * document cannot say anything about when he was where that the record does
 * not. See `EARLIER_ROLES_BEFORE` for why the cut falls where it does.
 */
const props = defineProps<{
  project: Project
  /** Collapses the record's spellings, so `gRPC (streams)` reads `gRPC`. */
  aliases: Record<string, string>
}>()

const technologies = computed(() =>
  projectTechnologies(props.aliases, props.project),
)

/*
 * Joined here rather than in the template: three optional fields on one line
 * is a run of inline `v-if`s whose separators are template whitespace, and
 * whitespace the compiler is free to condense is a poor place to keep a
 * separator the reader can see.
 */
const projectLine = computed(() => {
  const { project, client } = props.project

  return client ? `${project} (${client})` : project
})

/*
 * The `summary` if the entry has one, else its opening responsibility. These
 * roles carry a single bullet each, which is the line the CV wants here — and
 * taking it from the record beats a second field written to say the same thing
 * in fewer words.
 */
const description = computed(() =>
  props.project.summary ?? props.project.responsibilities?.[0],
)
</script>

<template>
  <article class="grid break-inside-avoid grid-cols-[29mm_minmax(0,1fr)] gap-x-[4mm] border-b border-rule py-[2.6mm] first:pt-0 last:border-b-0 last:pb-0">
    <p class="tabular-nums text-ink">
      {{ formatMonth(project.start) }} –<br>{{ formatProjectEnd(project) }}
    </p>

    <div>
      <!--
        No rule under this heading, unlike a full entry's. There it caps a
        header block of fields; here the row is three lines and the border
        between rows is already doing that work.
      -->
      <h3 class="font-semibold">
        {{ project.company }}<span class="font-normal text-muted"> — {{ project.location }}</span>
      </h3>

      <p class="text-muted">
        {{ projectLine }}
      </p>

      <p
        v-if="description"
        class="text-pretty text-muted"
      >
        {{ description }}
      </p>

      <p
        v-if="technologies.length"
        class="text-pretty text-muted"
      >
        {{ technologies.join(', ') }}
      </p>
    </div>
  </article>
</template>
