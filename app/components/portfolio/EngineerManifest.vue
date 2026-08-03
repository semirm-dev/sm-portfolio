<script setup lang="ts">
/**
 * The profile as a Kubernetes-style manifest — the landing page's one joke,
 * aimed at the platform engineers who'll recognise it. It is also the only dark
 * object on a white page, which is what the reference layout used an
 * illustration for.
 */
</script>

<template>
  <section
    class="flex h-full flex-col rounded-xl border border-yaml-rule bg-yaml-bg p-4 shadow-yaml xl:p-6"
    aria-label="Profile as a Kubernetes manifest"
  >
    <header class="mb-3 flex justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-yaml-key xl:text-[11.5px]">
      <span>engineer.yaml</span>
      <span class="text-yaml-value">applied</span>
    </header>

    <!--
      Centred vertically in whatever height the card is given, which matters
      only if the summary beside it ever runs taller. Horizontally it stays
      left-aligned: it is YAML, and centred code reads as a mistake.
    -->
    <pre class="my-auto overflow-x-auto font-mono text-[12px] leading-[1.85] text-yaml-ink xl:text-[14px] xl:leading-[2]"><span class="text-yaml-key">apiVersion:</span> people/v1
<span class="text-yaml-key">kind:</span> SeniorEngineer
<span class="text-yaml-key">metadata:</span>
  <span class="text-yaml-key">name:</span> <span class="text-yaml-value">semir-mahovkic</span>
  <span class="text-yaml-key">location:</span> remote
<span class="text-yaml-key">spec:</span>
  <span class="text-yaml-key">experience:</span> <span class="text-yaml-value">11y</span>
  <span class="text-yaml-key">languages:</span>
    - go
    - php
    - csharp
    - typescript
  <span class="text-yaml-key">ownership:</span> [code, build, deploy, monitor]
  <span class="text-yaml-key">availability:</span> <span class="text-yaml-value">open</span></pre>
  </section>
</template>
