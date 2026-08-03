<script setup lang="ts">
import type { Project } from '~/types/career'

defineProps<{ project: Project }>()
</script>

<template>
  <li class="grid gap-2 border-b border-rule py-7 last:border-b-0 md:grid-cols-[150px_1fr] md:gap-x-6">
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

      <ul class="mt-3.5 flex flex-wrap gap-1.5">
        <li
          v-for="tech in project.technologies"
          :key="tech"
          class="rounded-[3px] border border-rule px-2 py-0.5 text-[11.5px] text-muted"
        >
          {{ tech }}
        </li>
      </ul>
    </div>
  </li>
</template>
