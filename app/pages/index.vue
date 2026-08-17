<script setup lang="ts">
import EngineerManifest from '~/components/portfolio/EngineerManifest.vue'
import SectionHead from '~/components/portfolio/SectionHead.vue'
import SkillCard from '~/components/portfolio/SkillCard.vue'
import WorkCard from '~/components/portfolio/WorkCard.vue'

const { profile, skills, selectedWork, projects, years } = await useCareer()

const projectCount = computed(() => projects.value.length)

/*
 * The page's own copy, not the CV's — the headline and the description are
 * about this page rather than facts about him, so they stay here. The year
 * count does not: it is interpolated so it cannot drift from the work history.
 */
usePageSeo({
  title: profile.value.title,
  siteName: profile.value.handle,
  description: `Senior software engineer with over ${years.value} years of experience. Go, Kubernetes and cloud-native technologies — soft real-time systems, asynchronous communications, and distributed applications.`,
})

// Both grids sit below the fold, so they are revealed on scroll. The hero keeps
// its own hand-set delays: it is already in view when the page loads.
const skillsGrid = useReveal()
const workGrid = useReveal()
</script>

<template>
  <div>
    <!--
      The bottom edge is a token, not a fixed `border-rule`: light draws the
      line, dark has a colour change already doing that job. It stays a border
      painted `transparent` rather than one that is removed, so the hero's
      height does not shift when the theme does.
    -->
    <section class="hero-glow border-b border-hero-edge bg-hero text-hero-ink">
      <!--
        Two cells: the prose takes the slack (1fr) and the manifest is capped at
        the width its dozen short YAML lines need. The cap is `min(38rem, 40%)`
        rather than a flat 38rem — flat, the card takes most of the row at the
        `lg` breakpoint and stands the headline four lines deep.
      -->
      <div class="mx-auto grid max-w-[115rem] gap-x-10 gap-y-8 px-6 py-16 lg:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,min(38rem,40%))] lg:items-center xl:px-20">
        <div>
          <p
            class="animate-rise text-[12.5px] font-semibold uppercase tracking-[0.14em] text-hero-accent"
            style="animation-delay: 60ms"
          >
            {{ profile.title }}
          </p>
          <h1
            class="animate-rise mt-4 text-[clamp(35px,4.6vw,58px)] font-bold leading-[1.04] tracking-[-0.042em] text-balance"
            style="animation-delay: 120ms"
          >
            I build backends that <em class="not-italic text-hero-accent">hold under load</em>.
          </h1>

          <div
            class="animate-rise mt-8 max-w-[54ch] space-y-3 text-[16.5px] leading-[1.72] text-hero-muted lg:max-w-none xl:text-[18px] xl:leading-[1.75] 2xl:text-[19.5px]"
            style="animation-delay: 180ms"
          >
            <!--
              Rendered from segments, not markup: `v-html` would give the site
              its only injection sink. Both branches resolve `{years}` — a token
              that works in one kind of segment and prints itself in the other
              is a trap for whoever edits the summary next.
            -->
            <p
              v-for="(paragraph, index) in profile.summary"
              :key="index"
            >
              <template
                v-for="(segment, part) in paragraph"
                :key="part"
              >
                <span
                  v-if="typeof segment !== 'string'"
                  :class="segment.emphasis === 'accent' ? 'font-medium text-hero-accent' : 'font-medium text-hero-ink'"
                >{{ resolveSummaryText(segment.text, years) }}</span><template v-else>
                  {{ resolveSummaryText(segment, years) }}
                </template>
              </template>
            </p>
          </div>

          <div
            class="animate-rise mt-6 flex flex-wrap gap-2.5"
            style="animation-delay: 240ms"
          >
            <a
              :href="`mailto:${profile.email}`"
              class="rounded-lg bg-hero-btn px-4.5 py-2.5 text-[14px] font-medium text-hero-btn-ink shadow-hero-btn transition-colors hover:bg-hero-btn-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
            >Email me</a>
            <a
              :href="profile.github"
              rel="noopener noreferrer"
              target="_blank"
              class="rounded-lg border border-hero-ghost-rule bg-hero-ghost-bg px-4.5 py-2.5 text-[14px] font-medium text-hero-ghost transition-colors hover:border-hero-ghost focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
            >GitHub</a>
          </div>
        </div>

        <!--
          `min-w-0` is load-bearing below `lg`. A grid item's `min-width` is
          `auto`, which resolves to min-content — here the longest YAML line,
          which cannot wrap — and that pushed the whole page wider than the
          viewport. Zeroing it hands the overflow to the `overflow-x-auto` the
          `<pre>` already carries, so the YAML scrolls and the page does not.
        -->
        <div
          class="animate-rise min-w-0"
          style="animation-delay: 220ms"
        >
          <EngineerManifest />
        </div>
      </div>
    </section>

    <section class="border-b border-rule bg-band">
      <div class="mx-auto max-w-[115rem] px-6 py-16 lg:px-10 xl:px-20">
        <SectionHead id="stack">
          Technical skills
        </SectionHead>

        <div
          ref="skillsGrid"
          class="grid gap-3 md:grid-cols-2"
        >
          <!-- The separator is joined here, not stored: the record should not
               decide how it gets printed. -->
          <SkillCard
            v-for="group in skills"
            :key="group.name"
            :name="group.name"
          >
            {{ group.technologies.join(' · ') }}
          </SkillCard>
        </div>
      </div>
    </section>

    <section>
      <div class="mx-auto max-w-[115rem] px-6 py-16 lg:px-10 xl:px-20">
        <SectionHead>
          Selected work
        </SectionHead>

        <!--
          Two columns before four: at `lg` a quarter of the container is
          narrower than these summaries read well in, so the row only splits
          into four once `xl` has widened the container enough to carry it.
        -->
        <div
          ref="workGrid"
          class="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          <WorkCard
            v-for="work in selectedWork"
            :key="work.title"
            :org="work.org"
            :title="work.title"
          >
            {{ work.summary }}
          </WorkCard>
        </div>

        <p class="mt-6 text-center">
          <NuxtLink
            to="/work"
            class="text-[14.5px] font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            All {{ projectCount }} projects →
          </NuxtLink>
        </p>
      </div>
    </section>
  </div>
</template>
