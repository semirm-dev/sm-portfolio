<template>
  <!--
    `break-after-avoid` keeps a heading from being the last thing on a page.
    Pagination is the printer's, not ours: entries refuse to split and headings
    refuse to be orphaned, and where the pages fall follows from that.
  -->
  <!--
    The band marks the top of the hierarchy, which is why it is here and not on
    the company headings inside a section — the heaviest device on the page
    belongs to its largest division. The bottom rule stays under the fill so the
    head still has an edge on a hand-print, where background graphics are off
    and the band does not exist.

    Negative margin against equal padding: the fill bleeds past the text block
    while the letters stay on the same left edge as the body copy under them.
  -->
  <h2 class="-mx-[2.5mm] mb-[4mm] break-after-avoid border-b border-rule bg-band px-[2.5mm] pt-[1.4mm] pb-[1.6mm] text-[11.5pt] font-semibold uppercase tracking-[0.14em] text-ink">
    <slot />
  </h2>
</template>
