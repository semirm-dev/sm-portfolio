/**
 * The career record behind both pages.
 *
 * `projects` is the CV's order reversed, and the history page reverses it back.
 * Some spans overlap, so a single sort key cannot express the order — keep it
 * in step with the CV rather than re-sorting by date.
 */
export interface Project {
  company: string
  /** What the graph labels this entry, where `project` is the wrong name to show. */
  label?: string
  location: string
  website?: string
  project: string
  projectUrl?: string
  /** Client the project was delivered for, where it isn't the employer. */
  client?: string
  /** Inclusive start month, `YYYY-MM`. */
  start: string
  /**
   * Inclusive end month, `YYYY-MM`. For an ongoing project this is the month the
   * CV was last updated, so durations stay deterministic rather than drifting
   * with the clock.
   */
  end: string
  /** Ongoing project: the end date reads as `Present` rather than a month. */
  current?: boolean
  technologies: string[]
  summary?: string
  responsibilities?: string[]
}

/**
 * A run of emphasised words inside a summary paragraph.
 *
 * Segments rather than a string with markup in it: markup would have to be
 * rendered with `v-html`, an injection sink the site otherwise does not have.
 */
export interface SummaryEmphasis {
  text: string
  emphasis: 'accent' | 'strong'
}

export type SummarySegment = string | SummaryEmphasis

export interface Profile {
  name: string
  /** The wordmark, and what the tab title is suffixed with. */
  handle: string
  title: string
  location: string
  /**
   * Path to the portrait under `public/`. A photograph of him is a fact about
   * him, so it belongs in the record rather than in a component's markup.
   * Required: a CV that silently renders without a face is worse than a build
   * that stops.
   */
  photo: string
  /** Drives both the navbar prompt and the manifest's availability line. */
  availability: 'open' | 'closed'
  email: string
  /** Rendered in the CV's contact block when present. */
  phone?: string
  /** His own site. Rendered in the CV's contact block when present. */
  website?: string
  github: string
  linkedin: string
  languages: string[]
  ownership: string[]
  /**
   * Plain segments may carry a `{years}` token where the career length belongs.
   * The figure is computed from `projects` at render — see `careerYears`.
   */
  summary: SummarySegment[][]
}

export interface SkillGroup {
  name: string
  technologies: string[]
}

/**
 * A landing-page work card. Deliberately its own list rather than a filter over
 * `projects`: this is edited content about the work, not a view of it.
 */
export interface SelectedWork {
  org: string
  title: string
  summary: string
}

export interface CareerRecord {
  profile: Profile
  skills: SkillGroup[]
  selectedWork: SelectedWork[]
  /**
   * Technology spellings the graph collapses into a single node.
   *
   * `projects` stays faithful to the CV's wording, which writes both `gRPC` and
   * `gRPC (streams)`. Counted literally that splits one recurring technology
   * into two nodes and drops it out of the shared core. Normalise here rather
   * than editing the projects; add future spellings as keys.
   */
  technologyAliases: Record<string, string>
  projects: Project[]
}

export interface SharedTechnology {
  name: string
  /** How many projects used it. The graph encodes this as position and size. */
  projectCount: number
}

export interface TechGraph {
  /** Technologies used by more than one project, most-used first. */
  shared: SharedTechnology[]
  /** Per project, in record order, the shared technologies it used. */
  sharedByProject: string[][]
  /** Per project, in record order, the technologies no other project used. */
  ownByProject: string[][]
}
