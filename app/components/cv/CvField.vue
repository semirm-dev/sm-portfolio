<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <!--
    Two cells of a grid the parent owns, not a grid of its own: the label
    column has to line up across the skills block, the contact block and every
    entry, and a nested grid would only line up with itself.
  -->
  <!--
    The value is ink and the label is muted, and that split is the whole point.
    Both grey read as one undifferentiated block: nothing anchors the eye, and
    the thing you actually want — the project, the stack — recedes to the same
    weight as the word naming it.
  -->
  <!--
    Sentence case, not uppercase. These labels repeat on every entry, and
    uppercase with letterspacing is an attention device — spent on the least
    informative text on the page it inverts the hierarchy, and it makes the
    section heads, which are uppercase for a reason, stop reading as breaks.
  -->
  <span class="font-semibold text-muted">{{ label }}</span>
  <span class="text-ink"><slot /></span>
</template>
