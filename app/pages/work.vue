<script setup lang="ts">
import ProjectEntry from '~/components/portfolio/ProjectEntry.vue'
import WorkGraph from '~/components/portfolio/WorkGraph.vue'

const { projectsNewest, total } = await useCareer()

usePageSeo({
  title: 'Work history',
  description: 'Full work history of Semir Mahovkic, senior software engineer: Cisco Secure Firewall Cloud Native, Sportradar, MultiFeedCenter, TradeView Markets and more.',
})
</script>

<template>
  <section>
    <div class="mx-auto max-w-[110rem] px-6 py-12 lg:px-10">
      <h1 class="animate-rise flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3 text-[12.5px] font-semibold uppercase tracking-[0.13em] text-muted">
        <span class="text-accent">Work history</span>
        <span>{{ projectsNewest.length }} projects · {{ total }}</span>
      </h1>

      <!--
        The graph shows which technologies came back across projects, which the
        list below cannot — a reader scanning ten stacks in sequence has no way
        to see that Go carried five of them.

        Every fact it draws is repeated in the history below, so it carries no
        information of its own and the page still reads completely with the
        graph hidden, as it is on narrow screens.
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
