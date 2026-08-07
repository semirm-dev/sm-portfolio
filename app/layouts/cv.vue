<script setup lang="ts">
const { profile } = await useCareer()
</script>

<template>
  <div class="min-h-screen bg-band font-sans text-ink">
    <!--
      Screen furniture, and only that: it is the reason the document below can
      be exactly what goes on paper. Nothing here prints.
    -->
    <header class="sticky top-0 z-10 border-b border-rule bg-ground print:hidden">
      <div class="mx-auto flex h-14 max-w-[210mm] items-center justify-between gap-4 px-6">
        <NuxtLink
          to="/"
          class="font-mono text-[14px] font-medium transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >← {{ profile.handle }}</NuxtLink>
        <!--
          A committed file under `public/`, so this works in dev and on the
          deploy alike. Same filename as `PDF` in scripts/build-cv-pdf.mjs —
          nothing but these two comments ties them together.
        -->
        <a
          href="/Semir_Mahovkic-CV.pdf"
          download
          class="rounded-lg bg-accent px-4.5 py-2 text-[14px] font-medium text-on-accent transition-colors hover:bg-accent-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >Download PDF</a>
      </div>
    </header>

    <!--
      The document is a fixed 210mm. Scrolling it inside this wrapper rather
      than letting the page scroll keeps the toolbar above it full-width — a
      page-level scroll takes the back link and the download button off-screen
      with it. `overflow-visible` in print, or the sheet would be clipped.
    -->
    <div class="overflow-x-auto py-10 print:overflow-visible print:py-0">
      <slot />
    </div>
  </div>
</template>
