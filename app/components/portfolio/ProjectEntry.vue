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
  <!--
    The hover marks where you are reading; it does not lift. A card lift would
    promise the entry is something you can open, and it isn't — only the company
    and project links inside it go anywhere. So: an accent rail down the left
    edge, and a wash of the band colour at 40%, which is `--color-band` reused
    rather than a sixth body colour added for one state.

    At 40% the ground barely moves — `#fbfdfd` against white — and the rail is
    what the eye actually catches. That is the intended balance and not a value
    to nudge on its own: take the wash much further down and the row stops
    reading as a block at all, leaving a bar floating beside unchanged text.

    The bleed is taken on hover alone. `-mx-5` and `px-5` cancel, so the content
    box never moves and the rule keeps the width it has at rest — and Tailwind's
    `transition` covers neither margin nor padding, so the bleed snaps instead
    of animating open. The rules on both sides of the hovered row fade, `has-`
    reaching the one above, so no hairline runs through the wash.

    The rail has to be absolutely positioned, and not only to sit it against the
    edge: this `li` is a grid container, so an in-flow `::before` would become a
    grid item and open a fourth column.

    Which is why the rail is offset twice for one position. An absolutely
    positioned box is placed against its ancestor's *padding* box, and the bleed
    moves that box — so a single `left` would mean two different places, and on
    the way out the worse of the two. The pointer leaves, `left`, margin and
    padding all snap back together while `scale-y` is still 200ms from done, and
    a rail written `left-0` spends that fade sitting on top of the date column.
    `-left-5` at rest and `left-0` under the pointer resolve to the same x in
    both states, so the rail cannot move at all: out, it just shortens. Both
    hold because Tailwind's `transition` covers none of `left`, margin or
    padding — check that list before adding either to it.
  -->
  <li class="relative grid gap-2 rounded-lg border-b border-rule py-7 transition duration-200 before:absolute before:inset-y-2 before:-left-5 before:w-[3px] before:origin-top before:scale-y-0 before:rounded-full before:bg-accent before:transition-transform before:duration-200 last:border-b-0 has-[+li:hover]:border-transparent hover:-mx-5 hover:border-transparent hover:bg-band/40 hover:px-5 hover:before:left-0 hover:before:scale-y-100 md:grid-cols-[150px_1fr] md:gap-x-6 xl:grid-cols-[150px_minmax(0,1fr)_minmax(0,24rem)] xl:gap-x-8">
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
        <!--
          The separator trails the project rather than leading the client, and
          sits inside the project's own flex item. A flex line breaks between
          items, so a `before:` on the client took the `·` with it: on every
          phone width `VCF Aria Automation` and `CSFN` wrapped and the next line
          opened with a bare middot, which in a column that also carries `−`
          bullets reads as one. Trailing, it can only ever end a line. The
          non-breaking space glues it to the last word, so it cannot wrap onto a
          line by itself either, and it stays outside the `<a>` so the link's
          underline, hit area and accessible name are unchanged.
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
