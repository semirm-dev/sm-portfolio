<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <!--
    The same hover as a WorkCard, down to the distance. Two cards that share a
    surface — rounded-xl, border-rule, shadow-card — and then behave differently
    under the pointer read as an oversight rather than as a distinction, however
    the difference was meant. One card treatment, one card response.
  -->
  <div class="rounded-xl border border-rule bg-ground p-5 shadow-card transition duration-200 hover:-translate-y-[3px] hover:shadow-card-raised">
    <h3 class="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.07em] text-accent">
      {{ name }}
    </h3>
    <p class="text-[14.5px] leading-[1.62] text-muted">
      <slot />
    </p>
  </div>
</template>
