<script setup lang="ts">
defineProps<{ org: string, title: string }>()
</script>

<template>
  <!--
    The shadow rises with the card. Transitioning `transform` alone, as this
    did, moves a card whose contact shadow stays welded to the page — which
    reads as sliding upward rather than lifting off it.

    SkillCard carries this same line. The repetition is deliberate and matches
    how the surface itself is already handled: WorkGraph's stage spells the
    card treatment out in utilities too, rather than reaching for a shared
    class. Change one of the three and change all three.
  -->
  <article class="rounded-xl border border-rule bg-ground p-5 shadow-card transition duration-200 hover:-translate-y-[3px] hover:shadow-card-raised">
    <p class="text-[12.5px] font-semibold tracking-[0.03em] text-accent">
      {{ org }}
    </p>
    <h3 class="mt-2 text-[17.5px] font-semibold tracking-[-0.015em]">
      {{ title }}
    </h3>
    <p class="mt-2 text-[14.5px] leading-[1.6] text-muted">
      <slot />
    </p>
  </article>
</template>
