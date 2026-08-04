<script setup lang="ts">
/**
 * The masthead's light/dark switch. Behind `<ClientOnly>` in the layout:
 * without JavaScript it cannot work, and a control that does nothing when
 * pressed is worse than no control.
 */
const { theme, toggle } = useTheme()

const isDark = computed(() => theme.value === 'dark')

/*
 * The label says what pressing does, not what is true — so the label changes
 * and there is no `aria-pressed`. Both together contradict each other.
 */
const label = computed(() =>
  isDark.value ? 'Switch to the light theme' : 'Switch to the dark theme',
)
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    class="-mr-1 flex size-8 items-center justify-center rounded-lg text-hero-muted transition-colors hover:text-hero-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
    @click="toggle"
  >
    <!-- The icon shows the theme you would move to, matching the label.
         `aria-hidden` because the button is already named. -->
    <svg
      v-if="isDark"
      aria-hidden="true"
      class="size-[17px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    >
      <circle
        cx="12"
        cy="12"
        r="4"
      />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
    <svg
      v-else
      aria-hidden="true"
      class="size-[17px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  </button>
</template>
