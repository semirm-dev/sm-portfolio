<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <!--
    The same hover as a WorkCard, down to the distance and the border colour.
    Two cards that share a surface — rounded-xl, border-rule, shadow-card — and
    then behave differently under the pointer read as an oversight rather than
    as a distinction, however the difference was meant. One card treatment, one
    card response.

    This one sits on `bg-band` and WorkCard sits on white, which is the reason
    the hover border is a colour change and not a second edge drawn outside the
    first: a colour swap lands the same on both grounds, where anything with
    width has to be checked twice.
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
