<script setup lang="ts">
defineProps<{ org: string, title: string }>()
</script>

<template>
  <article class="rounded-xl border border-rule bg-ground p-5 shadow-card transition-transform hover:-translate-y-[3px]">
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
