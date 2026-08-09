import type {
  CareerRecord,
  Project,
  SharedTechnology,
  TechGraph,
} from '~/types/career'

interface Month {
  year: number
  month: number
}

function parseMonth(value: string): Month {
  const [year, month] = value.split('-')

  return { year: Number(year), month: Number(month) }
}

/** Decimal year at the first instant of the given month. */
export function monthStart(value: string): number {
  const { year, month } = parseMonth(value)

  return year + (month - 1) / 12
}

/** Decimal year at the last instant of the given month, so `end` reads inclusively. */
export function monthEnd(value: string): number {
  const { year, month } = parseMonth(value)

  return year + month / 12
}

/** Human duration between two decimal years, e.g. `2y 9mo` or `4mo`. */
export function formatDuration(from: number, to: number): string {
  const months = Math.round((to - from) * 12)
  const years = Math.floor(months / 12)
  const remainder = months % 12

  if (years === 0) {
    return `${remainder}mo`
  }

  return remainder === 0 ? `${years}y` : `${years}y ${remainder}mo`
}

/** `MM/YYYY`, matching how the CV writes its dates. */
export function formatMonth(value: string): string {
  const { year, month } = parseMonth(value)

  return `${String(month).padStart(2, '0')}/${year}`
}

/** Takes the two fields it reads rather than a whole `Project`. */
export function formatProjectEnd(project: Pick<Project, 'end' | 'current'>): string {
  return project.current ? 'Present' : formatMonth(project.end)
}

/**
 * What the work graph labels a node with: the project name, not the employer.
 * Employers repeat across the record; project names are unique.
 */
export function projectLabel(project: Project): string {
  return project.label ?? project.project
}

export function projectDuration(project: Project): string {
  return formatDuration(monthStart(project.start), monthEnd(project.end))
}

/**
 * Stable identity for a project, for `:key` and graph lookups. Company alone
 * cannot identify a row — three Endava entries, two Evoila.
 */
export function projectKey(project: Project): string {
  return `${project.company}-${project.project}`
}

/** Projects in CV order, for the work history page. */
export function projectsNewestFirst(projects: Project[]): Project[] {
  return [...projects].reverse()
}

/**
 * Where the CV stops printing a full entry and starts printing a dated line.
 *
 * Not an arbitrary date: `2021-11` is the month the Endava engagements begin,
 * and with them the run of cloud-native infrastructure work the document is
 * about. What comes before it is a different career, and a reader deciding on
 * an interview does not need five bullets of it.
 *
 * The rule this is allowed to bend, and the one it is not: an entry may lose
 * its responsibilities, but no entry may lose its dates. The old Canva CV
 * merged the three Endava engagements into one `11/2021 - 07/2024` row, and
 * the document then disagreed with the record it was generated from. Every
 * project still prints its own start and end below — condensed, not merged.
 */
export const EARLIER_ROLES_BEFORE = '2021-11'

/**
 * Splits the CV's history into the entries printed in full and the condensed
 * tail. Order is preserved, so both halves stay in the record's order rather
 * than being re-sorted by a date that overlapping spans cannot express.
 */
export function splitEarlierRoles(projects: Project[]): {
  recent: Project[]
  earlier: Project[]
} {
  const cutoff = monthStart(EARLIER_ROLES_BEFORE)
  const isEarlier = (project: Project) => monthStart(project.start) < cutoff

  return {
    recent: projects.filter(project => !isEarlier(project)),
    earlier: projects.filter(isEarlier),
  }
}

export function normaliseTechnology(
  aliases: Record<string, string>,
  name: string,
): string {
  return aliases[name] ?? name
}

/** A project's technologies with aliases collapsed and duplicates dropped. */
export function projectTechnologies(
  aliases: Record<string, string>,
  project: Project,
): string[] {
  return [
    ...new Set(
      project.technologies.map(name => normaliseTechnology(aliases, name)),
    ),
  ]
}

/** Recurring technologies and the projects they connect. */
export function techGraph(record: CareerRecord): TechGraph {
  const byProject = record.projects.map(project =>
    projectTechnologies(record.technologyAliases, project),
  )
  const counts = new Map<string, number>()

  byProject.forEach((technologies) => {
    technologies.forEach((name) => {
      counts.set(name, (counts.get(name) ?? 0) + 1)
    })
  })

  const shared: SharedTechnology[] = [...counts.entries()]
    .filter(([, projectCount]) => projectCount > 1)
    .map(([name, projectCount]) => ({ name, projectCount }))
    .sort((a, b) => b.projectCount - a.projectCount)

  const isShared = new Set(shared.map(technology => technology.name))

  return {
    shared,
    sharedByProject: byProject.map(technologies =>
      technologies.filter(name => isShared.has(name)),
    ),
    ownByProject: byProject.map(technologies =>
      technologies.filter(name => !isShared.has(name)),
    ),
  }
}

/** Total span of the career: earliest start to latest end. */
export function careerDuration(projects: Project[]): string {
  const starts = projects.map(project => monthStart(project.start))
  const ends = projects.map(project => monthEnd(project.end))

  return formatDuration(Math.min(...starts), Math.max(...ends))
}

/**
 * Whole years of career, for the prose that says "over N years".
 *
 * Floored rather than rounded: "over 11 years" has to stay true, and rounding
 * 11y 8mo up to 12 would overstate a figure the reader can check against the
 * history below it.
 */
export function careerYears(projects: Project[]): number {
  const starts = projects.map(project => monthStart(project.start))
  const ends = projects.map(project => monthEnd(project.end))

  return Math.floor(Math.max(...ends) - Math.min(...starts))
}

/** Fills the `{years}` token a stored summary paragraph may carry. */
export function resolveSummaryText(text: string, years: number): string {
  return text.replaceAll('{years}', String(years))
}

/**
 * `https://semirmahovkic.xyz/` reads as `semirmahovkic.xyz`. The scheme and the
 * `www.` carry no information a reader needs.
 *
 * The CV's header row names LinkedIn and GitHub rather than printing their
 * addresses — nobody types a LinkedIn slug — but his own domain is short, and
 * it is the one address a reader might copy off a printed sheet.
 */
export function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
}
