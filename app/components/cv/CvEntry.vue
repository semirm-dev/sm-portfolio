<script setup lang="ts">
import type { Project } from '~/types/career'
import CvField from '~/components/cv/CvField.vue'

/**
 * One project, one entry — the same unit `/work` renders. An earlier version
 * merged consecutive projects at the same employer into a single block, which
 * is how his old CV was laid out; it collapsed the three Endava engagements
 * into one `11/2021 – 07/2024` row and lost the dates of each. That made the
 * document disagree with the record it is generated from, which is the one
 * thing this whole seam exists to prevent.
 */
const props = defineProps<{
  project: Project
  /** Collapses the record's spellings, so `gRPC (streams)` reads `gRPC`. */
  aliases: Record<string, string>
}>()

const technologies = computed(() =>
  projectTechnologies(props.aliases, props.project),
)
</script>

<template>
  <!--
    `break-inside-avoid` is the whole pagination strategy: an entry is atomic,
    so the printer fits whole entries onto a page and the sheet count follows
    from the record. A fixed split would have to be re-measured every time a
    job is added.
  -->
  <article class="grid break-inside-avoid grid-cols-[29mm_minmax(0,1fr)] gap-x-[4mm] border-b border-rule pt-[3mm] pb-[3.4mm] first:pt-0 last:border-b-0">
    <p class="tabular-nums text-ink">
      {{ formatMonth(project.start) }} –<br>{{ formatProjectEnd(project) }}
    </p>

    <div>
      <!--
        A rule, not a fill. The band belongs to the section heads above these,
        and giving an entry the same device would flatten the two levels into
        one; a rule caps the header without competing. It also survives a
        hand-print, where background graphics are off and no fill exists.
      -->
      <h3 class="-mt-[1mm] border-b border-rule pb-[1.4mm] text-[13.5pt] font-semibold leading-[1.3] tracking-[-0.01em]">
        {{ project.company }}<span class="text-[11.5pt] font-normal tracking-normal text-muted"> — {{ project.location }}</span>
      </h3>

      <!--
        The role, not the employer's name again. It sits outside the field grid
        below because it is the second half of the heading, not a labelled
        value — a `Title` label would be the only one whose label says nothing
        the value doesn't.
      -->
      <p
        v-if="project.title"
        class="mt-[1.6mm] mb-[2mm] font-semibold"
      >
        {{ project.title }}
      </p>
      <div
        v-else
        class="mb-[2mm]"
      />

      <div class="grid grid-cols-[29mm_minmax(0,1fr)] items-baseline gap-x-[4mm] gap-y-[0.8mm]">
        <!--
          The name carries the link and the URL is not printed, unlike the
          Website row above. Those are bare domains; these are deep links — the
          VCF Aria one is 180 characters — and a row that wraps three times to
          show an address nobody types is worse than an underline. Clickable in
          the PDF, which is how this is read.
        -->
        <CvField label="Project">
          <a
            v-if="project.projectUrl"
            :href="project.projectUrl"
            rel="noopener noreferrer"
            target="_blank"
            class="underline decoration-rule underline-offset-2"
          >{{ project.project }}</a><template v-else>
            {{ project.project }}
          </template>{{ project.client ? ` (${project.client})` : '' }}
        </CvField>

        <CvField
          v-if="technologies.length"
          label="Technologies"
        >
          {{ technologies.join(', ') }}
        </CvField>
      </div>

      <p
        v-if="project.summary"
        class="mt-[3mm] text-muted"
      >
        {{ project.summary }}
      </p>

      <template v-if="project.responsibilities?.length">
        <p class="mt-[3mm] mb-[1.8mm] font-semibold text-muted">
          Responsibilities
        </p>
        <ul>
          <li
            v-for="duty in project.responsibilities"
            :key="duty"
            class="relative mb-[1mm] text-pretty pl-[4.5mm] text-muted before:absolute before:left-[0.6mm] before:top-0 before:content-['•'] last:mb-0"
          >
            {{ duty }}
          </li>
        </ul>
      </template>
    </div>
  </article>
</template>
