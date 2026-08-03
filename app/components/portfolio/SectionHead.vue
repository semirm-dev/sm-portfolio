<script setup lang="ts">
defineProps<{ id?: string }>()
</script>

<template>
  <h2
    :id="id"
    class="mb-8 scroll-mt-20 text-center text-[27px] font-semibold tracking-[-0.03em]"
  >
    <slot />
  </h2>
</template>
