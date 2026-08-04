<script setup lang="ts">
import EngineerManifest from '~/components/portfolio/EngineerManifest.vue'
import SectionHead from '~/components/portfolio/SectionHead.vue'
import SkillCard from '~/components/portfolio/SkillCard.vue'
import WorkCard from '~/components/portfolio/WorkCard.vue'

const { profile, skills, selectedWork, projects, years } = await useCareer()

const projectCount = computed(() => projects.value.length)

/*
 * The page's own copy, not the CV's. The headline is a landing-page line and
 * has no place in a document that is meant to export as a CV; the description
 * is metadata about this page rather than a fact about him. Both stay here.
 *
 * The year count does not: it is interpolated so the one figure a reader could
 * check against the work history cannot drift from it.
 */
usePageSeo({
  title: profile.value.title,
  siteName: profile.value.handle,
  description: `Senior software engineer with over ${years.value} years of experience. Golang, Kubernetes and cloud-native technologies — soft real-time systems, asynchronous communications and distributed applications.`,
})

// Both grids sit below the fold, so they are revealed on scroll rather than on
// arrival. The hero above keeps its own hand-set delays: it is already in view
// when the page loads and has nothing to wait for.
const skillsGrid = useReveal()
const workGrid = useReveal()
</script>

<template>
  <div>
    <!--
      The masthead. It runs into the sticky bar above it, which carries the same
      token, so in dark the two read as one surface and the hero needs no top
      edge of its own.

      The bottom edge is a token rather than a fixed `border-rule` because the
      two themes disagree about whether it should exist: light needs a line
      between white and the #f6f9fb band below, and dark has a
      saturated-to-white colour change already doing that job. It stays a border
      that is drawn in `transparent` rather than a border that is removed, so
      the hero's height does not change by a pixel when the theme does.
    -->
    <section class="hero-glow border-b border-hero-edge bg-hero text-hero-ink">
      <!--
        Three cells, not two: the headline spans the full width on its own row,
        so the columns below it are free to size themselves to their content
        rather than to the longest line of type on the page.
        The summary takes the slack (1fr) and the manifest is capped at the
        width its dozen short YAML lines actually need — sized the other way
        round, the card grows into a mostly-empty dark panel.
        The two are centred against each other rather than stretched: the card
        is usually the taller of the pair, and stretching left the summary
        hanging from the top of the row with a gap under its buttons.
      -->
      <div class="mx-auto grid max-w-[110rem] gap-x-10 gap-y-8 px-6 py-16 lg:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)] lg:items-center">
        <div class="lg:col-span-2">
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
        </div>

        <div>
          <div
            class="animate-rise max-w-[54ch] space-y-3 text-[16.5px] leading-[1.72] text-hero-muted lg:max-w-none xl:text-[18px] xl:leading-[1.75] 2xl:text-[19.5px]"
            style="animation-delay: 180ms"
          >
            <!--
              Rendered from segments, not from markup in the record. `v-html`
              would be the shorter route and would give the site its only
              injection sink; this keeps the record saying which phrases are
              emphasised and leaves the page deciding what emphasis looks like.

              Both branches resolve `{years}`. Only the plain one needed it for
              today's copy, but a token that works in one kind of segment and
              silently prints itself in the other is a trap set for whoever
              edits the summary next.
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
            <!--
              Both buttons are the same markup in both themes; only the tokens
              move. Light is the accent fill it always was, and dark inverts it
              to a white fill with a hero-coloured label — an accent fill on a
              ground that close to the accent is a button you have to look for.

              The coloured drop shadow is gone. It was tuned to sit under indigo
              on white and is invisible on a saturated ground, and a shadow that
              only exists in one theme is a second lighting model for the sake
              of one element.
            -->
            <a
              :href="`mailto:${profile.email}`"
              class="rounded-lg bg-hero-btn px-4.5 py-2.5 text-[14px] font-medium text-hero-btn-ink transition-colors hover:bg-hero-btn-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
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
          `min-w-0` is load-bearing, and only below `lg`. The two columns above
          are declared `minmax(0, …)` for this exact reason; the single column
          this collapses to below that breakpoint has no such floor, and a grid
          item's `min-width` is `auto` — which resolves to its min-content size.
          The manifest's min-content is its longest YAML line, which cannot wrap,
          so at 360px the card held the whole page 9px wider than the viewport
          and at 320px 49px wider: every line of the hero ran off the right edge
          and the page scrolled sideways. Zeroing it hands the overflow back to
          the `overflow-x-auto` the `<pre>` already carries, which is where it
          belongs — the YAML scrolls inside its own card and the page does not.
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
      <div class="mx-auto max-w-[110rem] px-6 py-16 lg:px-10">
        <SectionHead id="stack">
          Technical skills
        </SectionHead>

        <div
          ref="skillsGrid"
          class="grid gap-3 md:grid-cols-2"
        >
          <!--
            The separator is joined here, not stored. A record that writes its
            own ` · ` between technologies is a record that has decided how it
            gets printed, and this list has to survive a PDF too.
          -->
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
      <div class="mx-auto max-w-[110rem] px-6 py-16 lg:px-10">
        <SectionHead>
          Selected work
        </SectionHead>

        <div
          ref="workGrid"
          class="grid gap-3 lg:grid-cols-3"
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
