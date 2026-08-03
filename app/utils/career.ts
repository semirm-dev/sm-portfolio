import type { CareerRecord, Project, SharedTechnology, TechGraph } from '~/types/career'

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

/** End of a project as it reads on the page: a month, or `Present` while ongoing. */
export function formatProjectEnd(project: Project): string {
  return project.current ? 'Present' : formatMonth(project.end)
}

/**
 * What the work graph labels a node with: the project name, not the employer.
 * Employers repeat (three Endava entries, two Evoila ones), so a figure labelled
 * by company shows near-identical nodes and the reader has to fall back on dates
 * to tell them apart. Project names are unique across the record, and they are
 * what the graph is about: CSFN and Sportradar used different stacks despite
 * sharing an employer.
 *
 * `label` overrides this where the project's own name is not the recognisable
 * one — see the field's own note.
 */
export function projectLabel(project: Project): string {
  return project.label ?? project.project
}

export function projectDuration(project: Project): string {
  return formatDuration(monthStart(project.start), monthEnd(project.end))
}

/**
 * Stable identity for a project, for `:key` and graph lookups.
 *
 * Keyed on the project rather than on its start month. Employers repeat — three
 * Endava entries, two Evoila — so the company alone cannot identify a row, and
 * pairing it with the month only holds while no employer ever starts two
 * projects in the same one. Two of them already start in the same month as it
 * is, just at different companies. Project names are unique across the record
 * and are what the graph is keyed by anyway, so the pair is unique for the same
 * reason the graph's labels are.
 */
export function projectKey(project: Project): string {
  return `${project.company}-${project.project}`
}

/** Projects in CV order, for the work history page. */
export function projectsNewestFirst(projects: Project[]): Project[] {
  return [...projects].reverse()
}

/** Canonical name for a technology, as the graph counts it. */
export function normaliseTechnology(aliases: Record<string, string>, name: string): string {
  return aliases[name] ?? name
}

/** A project's technologies with aliases collapsed and duplicates dropped. */
export function projectTechnologies(aliases: Record<string, string>, project: Project): string[] {
  return [...new Set(project.technologies.map(name => normaliseTechnology(aliases, name)))]
}

/**
 * Recurring technologies and the projects they connect.
 *
 * The trace answers "when"; this answers "what came back". Both read the same
 * record, so neither can drift from the CV.
 */
export function techGraph(record: CareerRecord): TechGraph {
  const byProject = record.projects.map(project => projectTechnologies(record.technologyAliases, project))
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
    sharedByProject: byProject.map(technologies => technologies.filter(name => isShared.has(name))),
    ownByProject: byProject.map(technologies => technologies.filter(name => !isShared.has(name))),
  }
}

/** Total span of the career: earliest start to latest end. */
export function careerDuration(projects: Project[]): string {
  const starts = projects.map(project => monthStart(project.start))
  const ends = projects.map(project => monthEnd(project.end))

  return formatDuration(Math.min(...starts), Math.max(...ends))
}
