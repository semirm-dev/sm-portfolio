<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <div class="rounded-xl border border-rule bg-ground p-5 shadow-card">
    <h3 class="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.07em] text-accent">
      {{ name }}
    </h3>
    <p class="text-[14.5px] leading-[1.62] text-muted">
      <slot />
    </p>
  </div>
</template>
