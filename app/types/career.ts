/**
 * The career record behind both pages: the trace and the work graph read the
 * dates, the history page reads everything.
 *
 * Projects are stored as `YYYY-MM` months so they stay readable against the CV.
 *
 * Projects are chronological, but some run in parallel, so a single sort key
 * cannot express the order: where spans overlap, the still-active project reads
 * first. `projects` is therefore the CV's order reversed, and the history page
 * reverses it back. Keep it in step with the CV rather than re-sorting by date.
 */
export interface Project {
  company: string
  /**
   * What the graph calls this entry, for the cases where the `project` field
   * below is the wrong name to show. Two reasons it can be wrong: the work was
   * not a single project (Imel was a dozen small builds, so it reads as the
   * company), or the project's own name is not the one people know it by (VCF
   * Aria Automation is VMware to everyone outside it, and Aria is a term
   * internal to the product).
   *
   * @see projectLabel
   */
  label?: string
  location: string
  /** Company site. Omitted where there isn't a working one. */
  website?: string
  project: string
  /** The project itself. Omitted where it has no public presence. */
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
  /** Prose summary, for projects the CV describes rather than lists. */
  summary?: string
  responsibilities?: string[]
}

/**
 * A run of emphasised words inside a summary paragraph.
 *
 * The summary is stored as segments rather than as a string with markup in it.
 * Markup would have to be rendered with `v-html`, which is an injection sink
 * the site otherwise does not have anywhere, and it would put presentation
 * decisions — which words are accent, which are ink — inside the record. This
 * keeps the record declarative: it says *that* a phrase is emphasised and how
 * strongly, and the component decides what that looks like.
 */
export interface SummaryEmphasis {
  text: string
  /**
   * `accent` for the two technologies the summary leads on, `strong` for the
   * named projects and tools. Two levels because the prose already had two.
   */
  emphasis: 'accent' | 'strong'
}

/** Plain text, or a run of it that carries emphasis. */
export type SummarySegment = string | SummaryEmphasis

/**
 * Who the CV is about — everything the pages state about the person rather
 * than about the work.
 */
export interface Profile {
  name: string
  /** The wordmark, and what the tab title is suffixed with. */
  handle: string
  title: string
  location: string
  /**
   * Drives both the navbar prompt and the manifest's availability line, so the
   * two cannot disagree about whether he is looking.
   */
  availability: 'open' | 'closed'
  email: string
  github: string
  linkedin: string
  /** Manifest: the languages line and the lifecycle-ownership line. */
  languages: string[]
  ownership: string[]
  /**
   * The CV's summary, as paragraphs of segments.
   *
   * Plain segments may carry a `{years}` token where the career length belongs.
   * The figure is computed from `projects` at render — see `careerYears` — so
   * the sentence cannot go stale the way a written number does.
   */
  summary: SummarySegment[][]
}

/** One card in the technical-skills grid. */
export interface SkillGroup {
  name: string
  technologies: string[]
}

/**
 * A landing-page work card.
 *
 * Deliberately its own list rather than a filter over `projects`. The cards
 * carry a condensed summary that appears nowhere in the record, and their
 * `org`/`title` split does not follow from a project's fields — the Cisco card
 * shows `Endava · Cisco` where the project's client reads
 * `Cisco Secure Firewall Cloud Native`. This is edited content about the work,
 * not a view of it.
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
   * `projects` stays faithful to the CV's wording, and the CV writes both `gRPC`
   * and `gRPC (streams)` because the projects emphasised different things. Counted
   * literally, that splits one three-project technology into a two-project and a
   * one-project node, and the recurring one drops out of the shared core entirely.
   *
   * Normalise here rather than editing the projects — the project lists should keep
   * matching the document they came from. Add future spellings as keys.
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
  /**
   * Technologies used by more than one project, most-used first. Ties keep CV
   * order, since `Array.prototype.sort` is stable.
   */
  shared: SharedTechnology[]
  /**
   * Per project, in record order, the shared technologies that project used — i.e.
   * the edges into the core. Single-use technologies are excluded here because
   * the core is the recurrence view; they come back in `ownByProject`.
   */
  sharedByProject: string[][]
  /**
   * Per project, in record order, the technologies no other project used.
   *
   * The exact complement of `sharedByProject`, split out rather than folded in: a
   * technology used once says something about a single project, not about the
   * toolkit, so the graph hangs these off the project itself instead of letting
   * them dilute the shared middle. A project with an empty entry is a real
   * reading — everything it used recurs elsewhere.
   */
  ownByProject: string[][]
}
