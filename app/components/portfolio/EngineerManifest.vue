<script setup lang="ts">
/**
 * The profile as a Kubernetes-style manifest — the landing page's one joke,
 * aimed at the platform engineers who'll recognise it. It is also the only dark
 * object on a white page, which is what the reference layout used an
 * illustration for.
 *
 * Every value is read from the record. The YAML casing is not: `semir-mahovkic`
 * and `remote` are this component lowercasing what the record spells properly,
 * because manifests are written that way and a CV is not. That transform is
 * presentation and belongs here; the facts are not and do not.
 */
const { profile, years } = await useCareer()

/** Manifest convention, applied to whatever name the record holds. */
const manifestName = computed(() =>
  profile.value.name.toLowerCase().replaceAll(' ', '-'),
)
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

      Built from `<template>` fragments rather than interpolated into one
      string, because the indentation *is* the meaning here — a list item that
      loses its two spaces stops being a list item.
    -->
    <pre class="my-auto overflow-x-auto font-mono text-[12px] leading-[1.85] text-yaml-ink xl:text-[14px] xl:leading-[2]"><span class="text-yaml-key">apiVersion:</span> people/v1
<span class="text-yaml-key">kind:</span> SeniorEngineer
<span class="text-yaml-key">metadata:</span>
  <span class="text-yaml-key">name:</span> <span class="text-yaml-value">{{ manifestName }}</span>
  <span class="text-yaml-key">location:</span> {{ profile.location.toLowerCase() }}
<span class="text-yaml-key">spec:</span>
  <span class="text-yaml-key">experience:</span> <span class="text-yaml-value">{{ years }}y</span>
  <span class="text-yaml-key">languages:</span><template
v-for="language in profile.languages"
:key="language"
>
    - {{ language }}</template>
  <span class="text-yaml-key">ownership:</span> [{{ profile.ownership.join(', ') }}]
  <span class="text-yaml-key">availability:</span> <span class="text-yaml-value">{{ profile.availability }}</span></pre>
  </section>
</template>
