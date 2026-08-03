<script setup lang="ts">
/**
 * Mirrors the old Inertia title callback: a page with no title is just the
 * wordmark, and a page with one composes to "Work history - semir.mahovkic".
 */
useHead({
  titleTemplate: title => (title ? `${title} - semir.mahovkic` : 'semir.mahovkic'),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
