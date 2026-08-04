<script setup lang="ts">
defineProps<{ org: string, title: string }>()
</script>

<template>
  <!--
    SkillCard carries this same surface and hover, and WorkGraph's stage spells
    the surface out in utilities too, rather than through a shared class. Change
    one of the three and change all three.
  -->
  <article class="rounded-xl border border-rule bg-ground p-5 shadow-card transition duration-200 hover:-translate-y-[3px] hover:border-accent-rule hover:shadow-card-raised">
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
