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
    edge, and a wash at 30% of `--color-accent-soft`, which was declared and
    unused rather than a sixth body colour added for one state.

    It has to be that token and not `--color-band`. Both are near-white and the
    band is the obvious reach, but washing `#f6f9fb` this far down puts green
    and blue on the same value and the row reads faintly cyan. `#eef1fd` keeps
    blue nearly white while red and green fall away, which is the whole reason
    the tint reads blue-grey. At this lightness the hue is settled by two or
    three points per channel, so read the resolved colour off the page rather
    than judging the token by its own hex: 30% renders `#fafbfe`, four points
    of blue over red.

    And 30% is near the floor, in both directions at once. By 25% red and green
    have collapsed onto each other and the tint is four points off white, so it
    stops being blue-*grey* and becomes a flat lightening; much below that the
    row stops reading as a block at all and leaves the rail hanging beside
    unchanged text. The rail is meant to carry the highlight, not to be it.

    Nothing about the layout changes on hover. The wash and the rail are both
    pseudo-elements pinned 20px outside the content box, and hovering only
    paints them: no margin, no padding, no width. Keeping those apart is the
    whole design here rather than tidiness.

    An earlier version bled the row outward with `-mx-5`/`px-5` on hover, and
    Tailwind's `transition` covers neither margin nor padding — so the geometry
    snapped back the moment the pointer left while the colour still had 200ms
    to fade. The row contracted by 40px at full strength and then faded at the
    wrong width, and the rail, placed against a padding box that had just
    moved, spent that fade sitting on top of the date column. Paint transitions
    and layout does not, so anything that has to animate belongs to paint.

    Both pseudo-elements have to be absolutely positioned, and not only to place
    them: this `li` is a grid container, so in flow they would become grid items
    and open two more columns.

    `isolate` is what makes `-z-10` safe on the wash. A negative z-index child
    paints behind the in-flow content of its stacking context, and with no
    context of its own that context is the page — the wash would slide behind
    an ancestor's background and simply not be there. Making the row its own
    context bounds it: behind this row's text, in front of everything else.

    The rules on both sides of the hovered row fade, `has-` reaching the one
    above, so no hairline runs through the wash.
  -->
  <li class="relative isolate grid gap-2 border-b border-rule py-7 transition duration-200 before:absolute before:inset-y-0 before:-inset-x-5 before:-z-10 before:rounded-lg before:transition-colors before:duration-200 after:absolute after:inset-y-2 after:-left-5 after:w-[3px] after:origin-top after:scale-y-0 after:rounded-full after:bg-accent after:transition-transform after:duration-200 last:border-b-0 has-[+li:hover]:border-transparent hover:border-transparent hover:before:bg-accent-soft/30 hover:after:scale-y-100 md:grid-cols-[150px_1fr] md:gap-x-6 xl:grid-cols-[150px_minmax(0,1fr)_minmax(0,24rem)] xl:gap-x-8">
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

      The chip is the accent at three strengths and nothing else: type in
      `--color-accent`, outline in `--color-accent-rule`, fill in
      `--color-accent-soft` at 60%. One colour walked down twice, rather than a
      sixth added for one element. The stack is the scannable part of a row, so
      letting it carry the colour is the point and not a side effect.

      The fill is that and not `--color-band`, which is the obvious grey to
      reach for and the wrong one. This row's own hover wash is `#fafbfe`, and
      the band resolves within four points of it at the widest channel, so a
      band-filled chip all but dissolves the moment its row is hovered and only
      the outline still holds the shape. At 60% the fill resolves to `#f5f7fe`:
      seven points clear of the wash where the band managed four, and ten clear
      of the resting row where it managed nine.

      60% is the bottom of the useful range, not a midpoint on the way to
      lighter. 40% is *worse* than the band at rest despite being the bluer
      colour, because it is lighter in red and green — the tint stops being a
      tint before it stops being blue. Judge a candidate fill on a hovered row
      rather than a resting one; the resting row is the easy case and hides the
      whole problem.

      It keeps a border for a reason that outlives the fill: backgrounds do not
      print, and the CV export is this page printed, so a chip carried by its
      fill alone stops existing on paper. `--color-accent-rule` is a stronger
      hairline there than the `--color-rule` it replaced, so the printed chip
      is better off.
    -->
    <ul class="mt-3.5 flex flex-wrap gap-1.5 md:col-start-2 xl:col-start-3 xl:row-start-1 xl:mt-1 xl:content-start xl:border-l xl:border-rule xl:pl-8">
      <li
        v-for="tech in project.technologies"
        :key="tech"
        class="rounded-[3px] border border-accent-rule bg-accent-soft/60 px-2 py-0.5 text-[11.5px] text-accent"
      >
        {{ tech }}
      </li>
    </ul>
  </li>
</template>
