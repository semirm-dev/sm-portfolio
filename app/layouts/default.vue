<script setup lang="ts">
const EMAIL = 'smahovkic89@gmail.com'
const GITHUB = 'https://github.com/semirm-dev'
const LINKEDIN = 'https://www.linkedin.com/in/semir-mahovkic-a42ba7135'

// The stack section only exists on the landing page, so the nav changes shape
// rather than offering an anchor that goes nowhere.
const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<template>
  <div class="min-h-screen bg-ground font-sans text-ink">
    <!--
      Opaque, and no backdrop-blur. Both were costing text quality: a
      backdrop-filter promotes the header into its own composited layer, and a
      non-opaque background stops the text being painted onto solid white —
      either one drops it to grayscale antialiasing while the rest of the page
      keeps subpixel, so the bar read as blurry next to the body copy.

      That reasoning holds where subpixel is what the rest of the page gets:
      Windows and Linux, where `-webkit-font-smoothing` is not implemented.
      main.css sets `antialiased` on `html`, so WebKit and Blink on macOS are
      already grayscale everywhere and the header matched its surroundings
      there either way. Dropping that one line would extend this fix to macOS
      too; it is left in place because it is also what keeps the site's type
      from rendering heavier on macOS than it was designed against.

      The blur was buying nothing anyway: everything that scrolls under it is
      white or #f6f9fb, and the one dark element (EngineerManifest) looked
      better behind a clean edge than smeared through 10% of a white bar.
    -->
    <header class="animate-rise sticky top-0 z-10 border-b border-rule bg-ground">
      <div class="mx-auto flex h-14 max-w-[110rem] items-center justify-between gap-4 px-6 lg:px-10">
        <!--
          The wordmark as a shell prompt. `@remote` is the one token here that
          states a fact — the footer says Remote and the work is — so the rest
          stays minimal: no `~`, because there is no filesystem to be in.

          The link stops at the prompt. A "go home" link has no business
          containing a job-status command, so `./open-to-work` sits outside it
          as text. They read as one line because they are adjacent, not because
          they are one element.

          The accent moved rather than multiplied. It used to sit on the dot in
          `semir.mahovkic`; putting it on the command instead keeps one accent
          moment in the corner and keeps the thing worth reading — that he is
          looking — as loud as the pill it replaces.
        -->
        <div class="flex items-center gap-1.5 font-mono text-[14px] font-medium">
          <NuxtLink
            to="/"
            aria-label="semir.mahovkic — home"
            class="group transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >semir.mahovkic<span class="hidden text-muted transition-colors group-hover:text-accent sm:inline">@remote:$</span></NuxtLink>

          <!--
            The status in words, always, for screen readers. The visual prompt
            is hidden below sm and would take the announcement down with it —
            `display: none` hides from assistive tech too — so the readable
            form lives outside that wrapper rather than inside it.
          -->
          <span class="sr-only">Open to work</span>

          <span
            class="hidden items-center sm:flex"
            aria-hidden="true"
          >
            <span class="text-accent">./open-to-work</span>
            <i class="animate-cursor ml-[3px] h-[15px] w-[8px] bg-accent" />
          </span>
        </div>

        <nav
          class="flex items-center gap-6 text-[13px] text-muted"
          aria-label="Sections"
        >
          <template v-if="isHome">
            <NuxtLink
              to="/work"
              class="transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >work</NuxtLink>
            <a
              href="#stack"
              class="hidden transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:inline"
            >stack</a>
          </template>
          <NuxtLink
            v-else
            to="/"
            class="transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >home</NuxtLink>
          <a
            href="#contact"
            class="transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >contact</a>
        </nav>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer
      id="contact"
      class="scroll-mt-20 border-t border-rule bg-band"
    >
      <div class="mx-auto flex max-w-[110rem] flex-wrap items-center justify-between gap-3 px-6 py-6 lg:px-10">
        <div class="flex flex-wrap gap-4 text-[14px]">
          <a
            :href="`mailto:${EMAIL}`"
            class="border-b border-accent-rule text-accent transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >{{ EMAIL }}</a>
          <a
            :href="GITHUB"
            rel="noopener noreferrer"
            target="_blank"
            class="border-b border-accent-rule text-accent transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >GitHub</a>
          <a
            :href="LINKEDIN"
            rel="noopener noreferrer"
            target="_blank"
            class="border-b border-accent-rule text-accent transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >LinkedIn</a>
        </div>
        <p class="text-[13px] text-muted">
          Remote
        </p>
      </div>
    </footer>
  </div>
</template>
