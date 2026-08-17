<script setup lang="ts">
import ProjectEntry from '~/components/portfolio/ProjectEntry.vue'
import WorkGraph from '~/components/portfolio/WorkGraph.vue'

const { profile, projectsNewest, total } = await useCareer()

usePageSeo({
  title: 'Work history',
  siteName: profile.value.handle,
  description: 'Full work history of Semir Mahovkic, senior software engineer: Cisco Secure Firewall Cloud Native, Sportradar, MultiFeedCenter, Tradeview Markets, and more.',
})

/*
 * The same split the CV makes, from the same constant — the two pages drawing
 * their line in different places would be worse than neither drawing one.
 *
 * What differs is what the split is *for*. The CV condenses the tail to save a
 * page; here every entry stays exactly as it was, and the heading only marks
 * where the current run of work begins.
 */
const history = computed(() => splitEarlierRoles(projectsNewest.value))
</script>

<template>
  <section>
    <div class="mx-auto max-w-[115rem] px-6 py-12 lg:px-10 xl:px-20">
      <h1 class="animate-rise flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3 text-[12.5px] font-semibold uppercase tracking-[0.13em] text-muted">
        <span class="text-accent">Work history</span>
        <span>{{ projectsNewest.length }} {{ projectsNewest.length === 1 ? 'project' : 'projects' }} · {{ total }}</span>
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
          v-for="project in history.recent"
          :key="projectKey(project)"
          :project="project"
        />
      </ol>

      <!--
        Two lists rather than a divider row inside one: an entry's hover reads
        its next sibling (`has-[+li:hover]`) to drop its own border, and a
        label sitting between two entries as an `li` would be that sibling.

        It borrows the masthead heading's shape above — accent label, muted
        note, rule beneath — because it does the same job one level down.
      -->
      <template v-if="history.earlier.length">
        <h2 class="mt-12 flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3 text-[12.5px] font-semibold uppercase tracking-[0.13em] text-muted">
          <span class="text-accent">Earlier roles</span>
          <span>before {{ formatMonth(EARLIER_ROLES_BEFORE) }}</span>
        </h2>

        <ol class="mt-8">
          <ProjectEntry
            v-for="project in history.earlier"
            :key="projectKey(project)"
            :project="project"
          />
        </ol>
      </template>
    </div>
  </section>
</template>
