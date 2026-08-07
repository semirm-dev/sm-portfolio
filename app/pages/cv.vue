<script setup lang="ts">
import CvEntry from '~/components/cv/CvEntry.vue'
import CvField from '~/components/cv/CvField.vue'
import CvSectionHead from '~/components/cv/CvSectionHead.vue'

const { record, profile, skills, projectsNewest, years } = await useCareer()

definePageMeta({ layout: 'cv' })

/*
 * The description is copy about this page rather than a fact about him, so it
 * lives here and not in the record — the same split the other two pages make.
 */
usePageSeo({
  title: 'CV',
  siteName: profile.value.handle,
  description: 'The full CV — profile, technical skills and the complete work history — as an A4 document, downloadable as a PDF.',
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
  <article class="mx-auto w-[210mm] bg-ground px-[16mm] py-[16mm] font-document text-[10.5pt] leading-[1.5] text-ink print:w-auto print:p-0">
    <header class="mb-[12mm] grid grid-cols-[34mm_minmax(0,1fr)] items-center gap-x-[9mm]">
      <img
        :src="profile.photo"
        :alt="profile.name"
        class="block h-[34mm] w-[34mm] rounded-full object-cover"
      >
      <!-- The one accent on the document. -->
      <div class="border-b-[1pt] border-accent pb-[4mm]">
        <h1 class="text-[21pt] font-semibold leading-[1.1] tracking-[-0.015em]">
          {{ profile.name }}
        </h1>
        <p class="mt-[2.4mm] text-[10.5pt] uppercase tracking-[0.18em] text-muted">
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
    <div class="mb-[11mm]">
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
    <div class="mb-[11mm]">
      <!-- The separator is joined here, not stored: the record should not
           decide how it gets printed. -->
      <div
        v-for="group in skills"
        :key="group.name"
        class="grid grid-cols-[26mm_minmax(0,1fr)] items-baseline gap-x-[4mm] border-b border-rule py-[2.6mm] first:pt-0 last:border-b-0 last:pb-0"
      >
        <span class="font-semibold">{{ group.name }}</span>
        <p class="text-muted">
          {{ group.technologies.join(', ') }}
        </p>
      </div>
    </div>

    <CvSectionHead>Contact</CvSectionHead>
    <div class="mb-[11mm] grid grid-cols-[26mm_minmax(0,1fr)] items-baseline gap-x-[4mm] gap-y-[3mm]">
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

    <CvSectionHead>Work experience</CvSectionHead>
    <div>
      <!-- The same list, in the same order, as /work renders. -->
      <CvEntry
        v-for="project in projectsNewest"
        :key="projectKey(project)"
        :project="project"
        :aliases="record.technologyAliases"
      />
    </div>
  </article>
</template>
