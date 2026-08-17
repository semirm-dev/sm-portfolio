<script setup lang="ts">
import CvEarlierEntry from '~/components/cv/CvEarlierEntry.vue'
import CvEntry from '~/components/cv/CvEntry.vue'
import CvField from '~/components/cv/CvField.vue'
import CvSectionHead from '~/components/cv/CvSectionHead.vue'

const { record, profile, skills, projectsNewest, years } = await useCareer()

/*
 * `/work` prints every entry in full; this document condenses the pre-2021
 * tail. The split is computed from the record rather than flagged in it — a
 * field saying "print me small" would be the record deciding how it gets
 * printed, which is the one thing it does not do.
 */
const history = computed(() => splitEarlierRoles(projectsNewest.value))

definePageMeta({ layout: 'cv' })

/*
 * The description is copy about this page rather than a fact about him, so it
 * lives here and not in the record — the same split the other two pages make.
 */
usePageSeo({
  title: 'CV',
  siteName: profile.value.handle,
  description: 'The full CV — profile, technical skills, and the complete work history — as an A4 document, downloadable as a PDF.',
})

/*
 * The class goes on `<body>` because a change of named page forces a break:
 * with `page: cv` on the document itself and the default page on its
 * ancestors, Chrome broke into the CV's sheet and back out again, emitting a
 * blank trailing page.
 */
useHead({ bodyAttrs: { class: 'cv-document' } })
</script>

<template>
  <!--
    The named @page rule in main.css is bound from `<body>` (see the note in
    the script block above), not from this element — a change in the used
    named page forces a break, and binding it here would break into this
    subtree and back out again, printing a trailing blank page.

    The padding is screen-only: on paper the same measure comes from the @page
    margin, and keeping both would double it.
  -->
  <article class="mx-auto w-[210mm] bg-ground px-[16mm] py-[16mm] font-document text-[11.5pt] leading-[1.5] text-ink print:w-auto print:p-0">
    <!--
      The header is sized against the page, not the body copy. Page one is the
      profile and the skills and nothing else — see the forced break below —
      so it has room the other pages do not, and the masthead is what should
      take it: the name, the role and the way to reach him are what a reader
      is looking for first.
    -->
    <header class="mb-[13mm] grid grid-cols-[44mm_minmax(0,1fr)] items-center gap-x-[10mm]">
      <img
        :src="profile.photo"
        :alt="profile.name"
        class="block h-[44mm] w-[44mm] rounded-full object-cover"
      >
      <!-- The one accent on the document. -->
      <div class="border-b-[1pt] border-accent pb-[4.5mm]">
        <h1 class="text-[28pt] font-semibold leading-[1.1] tracking-[-0.015em]">
          {{ profile.name }}
        </h1>
        <p class="mt-[2.8mm] text-[13pt] uppercase tracking-[0.18em] text-muted">
          {{ profile.title }}
        </p>
      </div>
    </header>

    <CvSectionHead>Profile</CvSectionHead>
    <!--
      Rendered from segments, as everywhere else — markup in the record would
      need `v-html`. The emphasis is dropped rather than styled: accent and
      bold runs through a paragraph are the colour this document is without.
      `{years}` still resolves, in both branches.
    -->
    <div class="mb-[9mm]">
      <p
        v-for="(paragraph, index) in profile.summary"
        :key="index"
        class="mb-[3mm] text-pretty text-muted last:mb-0"
      >
        <template
          v-for="(segment, part) in paragraph"
          :key="part"
        >
          {{ resolveSummaryText(typeof segment === 'string' ? segment : segment.text, years) }}
        </template>
      </p>
    </div>

    <CvSectionHead>Technical skills</CvSectionHead>
    <div class="mb-[9mm]">
      <!--
        The separator is joined here, not stored: the record should not decide
        how it gets printed.

        The label column is the one place in the document that does not use
        29mm. That width is set by `Website`/`Project`/`Technologies` and by
        the contact block, and these names are three times as long — at 29mm
        `Distributed Systems & Messaging` sets three lines against a value of
        one. Widened here rather than everywhere: no other block has a label
        that needs it.
      -->
      <div
        v-for="group in skills"
        :key="group.name"
        class="grid grid-cols-[46mm_minmax(0,1fr)] items-baseline gap-x-[4mm] border-b border-rule py-[2.6mm] first:pt-0 last:border-b-0 last:pb-0"
      >
        <span class="font-semibold">{{ group.name }}</span>
        <p class="text-muted">
          {{ group.technologies.join(', ') }}
        </p>
      </div>
    </div>

    <CvSectionHead>Contact</CvSectionHead>
    <!--
      A labelled block rather than a row under the name. Page one carries the
      profile and the skills and nothing else, so there is room here that the
      masthead does not need — and with room, the addresses can be printed in
      full instead of hidden behind the words `LinkedIn` and `GitHub`. Someone
      reading this on paper cannot click either.

      `profile.location` stays out. It reads `Remote`, a working arrangement
      rather than an address; it belongs in the landing page's manifest beside
      `availability`, not in the block a recruiter scans for a city. Each entry
      below prints its employer's office, which is a different fact — never
      substitute one for the other.
    -->
    <div class="mb-[9mm] grid break-inside-avoid grid-cols-[29mm_minmax(0,1fr)] items-baseline gap-x-[4mm] gap-y-[3mm]">
      <CvField label="Email">
        {{ profile.email }}
      </CvField>
      <CvField
        v-if="profile.phone"
        label="Phone"
      >
        {{ profile.phone }}
      </CvField>
      <CvField label="LinkedIn">
        <a
          :href="profile.linkedin"
          rel="noopener noreferrer"
          target="_blank"
          class="underline decoration-rule underline-offset-2"
        >{{ shortUrl(profile.linkedin) }}</a>
      </CvField>
      <CvField label="GitHub">
        <a
          :href="profile.github"
          rel="noopener noreferrer"
          target="_blank"
          class="underline decoration-rule underline-offset-2"
        >{{ shortUrl(profile.github) }}</a>
      </CvField>
      <CvField
        v-if="profile.website"
        label="Portfolio"
      >
        <a
          :href="profile.website"
          rel="noopener noreferrer"
          target="_blank"
          class="underline decoration-rule underline-offset-2"
        >{{ shortUrl(profile.website) }}</a>
      </CvField>
    </div>

    <!--
      The one break this document forces. Everywhere else pagination is the
      printer's — entries refuse to split, headings refuse to be orphaned, and
      the sheet count follows from the record. Here the first page is a fixed
      unit: who he is, what he does, what he knows. Left to the printer it
      gains or loses whichever entry happens to fit, and the opening page of
      the CV changes shape every time a job is added.

      Screen is unaffected: fragmentation only applies to paged media, so this
      is inert on `/cv` in a browser and takes effect in the PDF.
    -->
    <CvSectionHead class="break-before-page">
      Work experience
    </CvSectionHead>
    <div :class="history.earlier.length ? 'mb-[9mm]' : ''">
      <!-- The same list, in the same order, as /work renders. -->
      <CvEntry
        v-for="project in history.recent"
        :key="projectKey(project)"
        :project="project"
        :aliases="record.technologyAliases"
      />
    </div>

    <template v-if="history.earlier.length">
      <CvSectionHead>Earlier roles</CvSectionHead>
      <div>
        <CvEarlierEntry
          v-for="project in history.earlier"
          :key="projectKey(project)"
          :project="project"
          :aliases="record.technologyAliases"
        />
      </div>
    </template>
  </article>
</template>
