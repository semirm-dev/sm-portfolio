<script setup lang="ts">
import type { Project } from '~/types/career'

defineProps<{ project: Project }>()
</script>

<template>
  <!--
    The hover marks where you are reading; it does not lift. A lift would
    promise the entry can be opened, and it can't — only the links inside it go
    anywhere. So: an accent rail down the left edge, and a wash at 30% of
    `--color-accent-soft`.

    That token and not `--color-band`: washing `#f6f9fb` this far down puts
    green and blue on the same value and the row reads faintly cyan. At this
    lightness the hue is settled by two or three points per channel, so read the
    resolved colour off the page rather than judging the token by its own hex —
    30% renders `#fafbfe`, four points of blue over red. 30% is near the floor:
    by 25% the tint stops being blue-grey and becomes a flat lightening.

    Nothing about the layout changes on hover. The wash and the rail are both
    pseudo-elements pinned 20px outside the content box, so hovering only
    paints. Tailwind's `transition` covers neither margin nor padding, so a
    version that bled the row outward with `-mx-5`/`px-5` snapped its geometry
    back the moment the pointer left while the colour still had 200ms to fade.
    Anything that has to animate belongs to paint.

    Both pseudo-elements have to be absolutely positioned: this `li` is a grid
    container, so in flow they would become grid items and open two more
    columns. `isolate` is what makes `-z-10` safe on the wash — without a
    stacking context of its own the wash would slide behind an ancestor's
    background and simply not be there.
  -->
  <li class="relative isolate grid gap-2 border-b border-rule py-7 transition duration-200 before:absolute before:inset-y-0 before:-inset-x-5 before:-z-10 before:rounded-lg before:transition-colors before:duration-200 after:absolute after:inset-y-2 after:-left-5 after:w-[3px] after:origin-top after:scale-y-0 after:rounded-full after:bg-accent after:transition-transform after:duration-200 last:border-b-0 has-[+li:hover]:border-transparent hover:border-transparent hover:before:bg-accent-soft/30 hover:after:scale-y-100 md:grid-cols-[150px_1fr] md:gap-x-6 xl:grid-cols-[150px_minmax(0,1fr)_minmax(0,24rem)] xl:gap-x-8">
    <div class="flex flex-wrap items-baseline gap-2 md:block">
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
        <!--
          The separator trails the project rather than leading the client, and
          sits inside the project's own flex item. A flex line breaks between
          items, so a `before:` on the client wrapped the `·` onto the next line
          where it read as a bullet. Trailing, it can only ever end a line; the
          non-breaking space stops it wrapping alone; it stays outside the `<a>`
          so the link's underline, hit area and accessible name are unchanged.
        -->
        <span class="text-[14.5px] font-medium text-accent"><a
          v-if="project.projectUrl"
          :href="project.projectUrl"
          rel="noopener noreferrer"
          target="_blank"
          class="border-b border-accent-rule transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >{{ project.project }}</a><template v-else>{{ project.project }}</template><span
          v-if="project.client"
          aria-hidden="true"
          class="font-normal text-muted"
        >&nbsp;·</span></span>
        <span
          v-if="project.client"
          class="text-[14px] text-muted"
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
      Placed rather than flowed: at md auto-placement would put it in the date
      column. `content-start` keeps the tags at the top of a cell that stretches
      to the full height of the entry, so the rule runs the whole way down.

      The chip is the accent at three strengths and nothing else — type in
      `--color-accent`, outline in `--color-accent-rule`, fill in
      `--color-accent-soft`. Judge a candidate fill on a *hovered* row: the
      resting row is the easy case and hides the problem. `--color-band`
      resolves within four points of the hover wash, so a band-filled chip all
      but dissolves the moment its row is hovered.

      It keeps a border for a reason that outlives the fill: backgrounds do not
      print, and the CV export is this page printed, so a chip carried by its
      fill alone stops existing on paper.
    -->
    <ul class="mt-3.5 flex flex-wrap gap-1.5 md:col-start-2 xl:col-start-3 xl:row-start-1 xl:mt-1 xl:content-start xl:border-l xl:border-rule xl:pl-8">
      <li
        v-for="tech in project.technologies"
        :key="tech"
        class="rounded-[3px] border border-accent-rule bg-accent-soft/20 px-2 py-0.5 text-[11.5px] text-accent"
      >
        {{ tech }}
      </li>
    </ul>
  </li>
</template>
