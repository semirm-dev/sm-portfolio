<script setup lang="ts">
/**
 * A page with no title is just the wordmark; a page with one composes to
 * "Work history - semir.mahovkic".
 *
 * The wordmark is read from the record rather than written here, which is what
 * stops the browser tab disagreeing with the navbar. Awaiting at the root makes
 * this component async — Nuxt's own root supplies the Suspense boundary that
 * needs, and the prerendered HTML carries the finished `<title>`, so crawlers
 * and tabs both get it without running any JavaScript.
 */
const { profile } = await useCareer()

useHead({
  titleTemplate: title =>
    title ? `${title} - ${profile.value.handle}` : profile.value.handle,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
