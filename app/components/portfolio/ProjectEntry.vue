<script setup lang="ts">
import type { Project } from '~/types/career'

defineProps<{ project: Project }>()
</script>

<template>
  <!--
    Three columns once there is width for them: dates, the narrative, and the
    stack. Below xl the stack drops back under the narrative, which is the only
    place it fits.

    The split is what the entry already is rather than a device to fill space —
    dates and technologies are both metadata about the work, and the prose in
    between is the account of it. Stacking the stack under the prose put a
    reading measure capped at 74ch inside a column of nearly twice that, so the
    right of every entry went empty while the tags queued up under text they are
    not part of.
  -->
  <li class="grid gap-2 border-b border-rule py-7 last:border-b-0 md:grid-cols-[150px_1fr] md:gap-x-6 xl:grid-cols-[150px_minmax(0,1fr)_minmax(0,24rem)] xl:gap-x-8">
    <div class="flex flex-wrap items-baseline gap-2 md:block">
      <!--
        tabular-nums survives the move off monospace: the system sans stacks
        all carry tabular figures, so the date column still aligns digit for
        digit down the history without needing a second typeface to do it.
      -->
      <p class="text-[13.5px] tabular-nums whitespace-nowrap">
        {{ formatMonth(project.start) }} — {{ formatProjectEnd(project) }}
      </p>
      <p class="text-[12px] font-medium tabular-nums tracking-[0.02em] text-accent md:mt-1">
        {{ projectDuration(project) }}
      </p>
    </div>

    <div>
      <h2 class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[19.5px] font-semibold tracking-[-0.02em]">
        <a
          v-if="project.website"
          :href="project.website"
          rel="noopener noreferrer"
          target="_blank"
          class="border-b border-accent-rule transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >{{ project.company }}</a>
        <span v-else>{{ project.company }}</span>
        <span class="text-[13px] font-normal tracking-[0.01em] text-muted">{{ project.location }}</span>
      </h2>

      <p class="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span class="text-[11px] font-semibold uppercase tracking-[0.11em] text-muted">Project</span>
        <a
          v-if="project.projectUrl"
          :href="project.projectUrl"
          rel="noopener noreferrer"
          target="_blank"
          class="border-b border-accent-rule text-[14.5px] font-medium text-accent transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >{{ project.project }}</a>
        <span
          v-else
          class="text-[14.5px] font-medium text-accent"
        >{{ project.project }}</span>
        <span
          v-if="project.client"
          class="text-[14px] text-muted before:mr-2 before:content-['·']"
        >{{ project.client }}</span>
      </p>

      <p
        v-if="project.summary"
        class="mt-2.5 max-w-[68ch] text-[15.5px] leading-[1.65] text-muted"
      >
        {{ project.summary }}
      </p>

      <ul
        v-if="project.responsibilities"
        class="mt-3 max-w-[74ch]"
      >
        <li
          v-for="duty in project.responsibilities"
          :key="duty"
          class="relative mb-1.5 pl-4 text-[15.5px] leading-[1.6] text-muted before:absolute before:left-0 before:text-accent before:content-['−']"
        >
          {{ duty }}
        </li>
      </ul>
    </div>

    <!--
      Placed rather than flowed. At md it belongs under the narrative, which
      auto-placement would put in the date column instead; at xl it moves beside
      it. `content-start` keeps the tags at the top of a cell that stretches to
      the full height of the entry, so the rule runs the whole way down while
      the chips stay level with the company name.
    -->
    <ul class="mt-3.5 flex flex-wrap gap-1.5 md:col-start-2 xl:col-start-3 xl:row-start-1 xl:mt-1 xl:content-start xl:border-l xl:border-rule xl:pl-8">
      <li
        v-for="tech in project.technologies"
        :key="tech"
        class="rounded-[3px] border border-rule px-2 py-0.5 text-[11.5px] text-muted"
      >
        {{ tech }}
      </li>
    </ul>
  </li>
</template>
