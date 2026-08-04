<script setup lang="ts">
import ThemeToggle from '~/components/portfolio/ThemeToggle.vue'

/*
 * The layout reads the record too. Awaiting here makes this an async component,
 * which needs a Suspense boundary above it — Nuxt's app root supplies one, and
 * the prerendered HTML carries the resolved values, so the footer is baked into
 * the static output rather than filled in on hydration.
 */
const { profile } = await useCareer()

/*
 * One field decides whether the prompt is running anything. Setting
 * `availability` to `closed` in the record drops the command and the words
 * behind it in the same move — and the manifest's own availability line reads
 * the same field, so the two halves of the page cannot disagree about whether
 * he is looking.
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

      The bar carries --color-hero, so on the landing page it and the hero read
      as one filled masthead with no seam between them. It keeps that fill once
      you scroll past the hero onto white, and on /work, which has no hero at
      all — deliberately. A bar that changed colour on scroll would be the one
      piece of chrome on the site that animates while you read, and the rule
      here is that nothing does.
    -->
    <header class="animate-rise sticky top-0 z-10 border-b border-hero-rule bg-hero text-hero-ink">
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
            :aria-label="`${profile.handle} — home`"
            class="group transition-colors hover:text-hero-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
          >{{ profile.handle }}<span class="hidden text-hero-muted transition-colors group-hover:text-hero-accent sm:inline">@{{ host }}:$</span></NuxtLink>

          <!--
            The status in words, always, for screen readers. The visual prompt
            is hidden below sm and would take the announcement down with it —
            `display: none` hides from assistive tech too — so the readable
            form lives outside that wrapper rather than inside it.
          -->
          <span
            v-if="isOpenToWork"
            class="sr-only"
          >Open to work</span>

          <!--
            The cursor is not conditional: a prompt has one whether or not
            something is being run at it. Only the command comes and goes.
          -->
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

        <!--
          The switch sits beside the section links rather than inside them: it
          goes nowhere, and a `<nav>` labelled "Sections" is a promise about
          what its contents do.
        -->
        <div class="flex items-center gap-5">
          <nav
            class="flex items-center gap-6 text-[13px] text-hero-muted"
            aria-label="Sections"
          >
            <template v-if="isHome">
              <NuxtLink
                to="/work"
                class="transition-colors hover:text-hero-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
              >work</NuxtLink>
              <a
                href="#stack"
                class="hidden transition-colors hover:text-hero-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent sm:inline"
              >stack</a>
            </template>
            <NuxtLink
              v-else
              to="/"
              class="transition-colors hover:text-hero-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
            >home</NuxtLink>
            <a
              href="#contact"
              class="transition-colors hover:text-hero-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
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
      <!--
        One centred row, which is why the inner wrapper the links used to sit in
        is gone: with nothing opposite them there is no second group to hold
        apart, and a lone flex child inside a `justify-center` parent centres
        the group either way. Two elements were doing one element's job.

        The location line went with it. It is not lost — the navbar prompt reads
        `@remote` from the same field, and the manifest states it outright — so
        the record still reaches the reader in both of the places that were
        already saying it.

        The email address went too, and that one does leave a gap worth knowing
        about: this footer carries `id="contact"`, and on /work it was the only
        email on the page. The landing page still has the "Email me" button in
        the hero; /work now sends anyone following the `contact` link to two
        profile links and no address. `profile.email` is untouched in the record
        and the button still reads it, so putting it back here is one element.

        `justify-center` and not `text-center`: these are flex children, so the
        text property would not move them.
      -->
      <div class="mx-auto flex max-w-[110rem] flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-6 text-[14px] lg:px-10">
        <!--
          The rule moved off the anchor and onto the label. Left where it was it
          would run under the mark as well, which reads as an underlined logo
          rather than as a link with an icon beside it — so the anchor became the
          flex row and the `<span>` kept the border it always had. `group` is
          what lets the hover still change a border the anchor no longer owns.

          Both marks are `aria-hidden`: the anchor is already named by its label,
          and without it a screen reader announces each link twice.
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
