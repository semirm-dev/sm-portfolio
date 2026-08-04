<script setup lang="ts">
import ProjectEntry from '~/components/portfolio/ProjectEntry.vue'
import WorkGraph from '~/components/portfolio/WorkGraph.vue'

const { profile, projectsNewest, total } = await useCareer()

usePageSeo({
  title: 'Work history',
  siteName: profile.value.handle,
  description: 'Full work history of Semir Mahovkic, senior software engineer: Cisco Secure Firewall Cloud Native, Sportradar, MultiFeedCenter, TradeView Markets and more.',
})
</script>

<template>
  <section>
    <div class="mx-auto max-w-[115rem] px-6 py-12 lg:px-10 xl:px-20">
      <h1 class="animate-rise flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3 text-[12.5px] font-semibold uppercase tracking-[0.13em] text-muted">
        <span class="text-accent">Work history</span>
        <span>{{ projectsNewest.length }} projects · {{ total }}</span>
      </h1>

      <!--
        Every fact the graph draws is repeated in the history below, so the page
        still reads completely with it hidden, as it is on narrow screens.
      -->
      <div class="mt-8">
        <WorkGraph />
      </div>

      <ol class="mt-10">
        <ProjectEntry
          v-for="project in projectsNewest"
          :key="projectKey(project)"
          :project="project"
        />
      </ol>
    </div>
  </section>
</template>
