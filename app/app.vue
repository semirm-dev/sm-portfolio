<script setup lang="ts">
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
