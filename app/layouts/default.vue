<script setup lang="ts">
import ThemeToggle from '~/components/portfolio/ThemeToggle.vue'

const { profile } = await useCareer()

/*
 * One field decides whether the prompt is running anything. The manifest's own
 * availability line reads the same field, so the two halves of the page cannot
 * disagree about whether he is looking.
 */
const isOpenToWork = computed(() => profile.value.availability === 'open')

/** Shell hosts are lowercase; the record spells the place properly. */
const host = computed(() => profile.value.location.toLowerCase())

// The stack section only exists on the landing page, so the nav changes shape
// rather than offering an anchor that goes nowhere.
const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<template>
  <div class="min-h-screen bg-ground font-sans text-ink">
    <!--
      Opaque, and no backdrop-blur: both drop the bar to grayscale antialiasing
      while the rest of the page keeps subpixel, so it reads as blurry next to
      the body copy.
    -->
    <header class="animate-rise sticky top-0 z-10 border-b border-hero-rule bg-hero text-hero-ink">
      <!--
        The page shell, and it appears six times: this bar, the footer, the
        hero, both landing sections and /work. The `max-w` and the gutter have
        to agree across all six or the navbar stops lining up with the page
        underneath it.

        Those two numbers are one decision, not two. `115rem` is `110rem` plus
        the `xl` gutter increase doubled, which keeps every screen past 1840px
        at the 1680px of content it already had. Raise the gutter on its own and
        you narrow every wide screen with it.
      -->
      <div class="mx-auto flex h-14 max-w-[115rem] items-center justify-between gap-4 px-6 lg:px-10 xl:px-20">
        <!--
          The link stops at the prompt: `./open-to-work` sits outside it as
          text, because a "go home" link has no business containing a job-status
          command.
        -->
        <div class="flex items-center gap-1.5 font-mono text-[14px] font-medium">
          <NuxtLink
            to="/"
            :aria-label="`${profile.handle} — home`"
            class="group transition-colors hover:text-hero-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
          >{{ profile.handle }}<span class="hidden text-hero-muted transition-colors group-hover:text-hero-hover sm:inline">@{{ host }}:$</span></NuxtLink>

          <!--
            The status in words, outside the visual prompt because that is
            hidden below sm and `display: none` hides from assistive tech too.
          -->
          <span
            v-if="isOpenToWork"
            class="sr-only"
          >Open to work</span>

          <!-- The cursor is not conditional; only the command comes and goes. -->
          <span
            class="hidden items-center sm:flex"
            aria-hidden="true"
          >
            <span
              v-if="isOpenToWork"
              class="text-hero-accent"
            >./open-to-work</span>
            <i class="animate-cursor ml-[3px] h-[15px] w-[8px] bg-hero-accent" />
          </span>
        </div>

        <div class="flex items-center gap-5">
          <nav
            class="flex items-center gap-6 text-[13px] text-hero-muted"
            aria-label="Sections"
          >
            <template v-if="isHome">
              <NuxtLink
                to="/work"
                class="transition-colors hover:text-hero-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
              >work</NuxtLink>
              <a
                href="#stack"
                class="hidden transition-colors hover:text-hero-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent sm:inline"
              >stack</a>
            </template>
            <NuxtLink
              v-else
              to="/"
              class="transition-colors hover:text-hero-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
            >home</NuxtLink>
            <a
              href="#contact"
              class="transition-colors hover:text-hero-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
            >contact</a>
          </nav>

          <ClientOnly>
            <ThemeToggle />
          </ClientOnly>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer
      id="contact"
      class="scroll-mt-20 border-t border-rule bg-band"
    >
      <!-- `justify-center` and not `text-center`: these are flex children. -->
      <div class="mx-auto flex max-w-[115rem] flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-6 text-[14px] lg:px-10 xl:px-20">
        <!--
          The rule sits on the label, not the anchor: on the anchor it would run
          under the mark too, reading as an underlined logo. `group` is what
          lets the hover still reach a border the anchor no longer owns.
        -->
        <a
          :href="profile.github"
          rel="noopener noreferrer"
          target="_blank"
          class="group inline-flex items-center gap-1.5 text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg
            aria-hidden="true"
            class="size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <span class="border-b border-accent-rule transition-colors group-hover:border-accent">GitHub</span>
        </a>
        <a
          :href="profile.linkedin"
          rel="noopener noreferrer"
          target="_blank"
          class="group inline-flex items-center gap-1.5 text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg
            aria-hidden="true"
            class="size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span class="border-b border-accent-rule transition-colors group-hover:border-accent">LinkedIn</span>
        </a>
      </div>
    </footer>
  </div>
</template>
