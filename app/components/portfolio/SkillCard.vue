<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <!--
    The same surface and hover as a WorkCard. This one sits on `bg-band` and
    WorkCard sits on white, which is why the hover border is a colour change
    rather than a second edge drawn outside the first: a colour swap lands the
    same on both grounds.
  -->
  <div class="rounded-xl border border-rule bg-ground p-5 shadow-card transition duration-200 hover:-translate-y-[3px] hover:border-accent-rule hover:shadow-card-raised">
    <h3 class="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.07em] text-accent">
      {{ name }}
    </h3>
    <p class="text-[14.5px] leading-[1.62] text-muted">
      <slot />
    </p>
  </div>
</template>
