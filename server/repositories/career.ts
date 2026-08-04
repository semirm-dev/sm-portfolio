import type { CareerRecord, Profile, SummarySegment } from '~/types/career'
import rawRecord from '../data/career.json'

/**
 * The closed sets in the record, checked rather than asserted.
 *
 * TypeScript widens every string in an imported JSON module to `string`, so a
 * union like `'open' | 'closed'` is the one field shape the assignability check
 * below cannot make on its own. A typo in `availability` would mean "not open"
 * — the navbar would drop its command and the manifest would print something
 * false, with nothing failing to say so. This runs during prerender, so a bad
 * value is a failed build rather than a wrong page.
 */
function oneOf<T extends string>(
  field: string,
  allowed: readonly T[],
  value: string,
): T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(
      `career.json: ${field} must be one of ${allowed.join(' | ')}, got ${JSON.stringify(value)}`,
    )
  }

  return value as T
}

const AVAILABILITY = ['open', 'closed'] as const
const EMPHASIS = ['accent', 'strong'] as const

function parseSegment(
  segment: string | { text: string, emphasis: string },
): SummarySegment {
  if (typeof segment === 'string') {
    return segment
  }

  return {
    text: segment.text,
    emphasis: oneOf('profile.summary[].emphasis', EMPHASIS, segment.emphasis),
  }
}

function parseProfile(raw: typeof rawRecord.profile): Profile {
  return {
    ...raw,
    availability: oneOf('profile.availability', AVAILABILITY, raw.availability),
    summary: raw.summary.map(paragraph => paragraph.map(parseSegment)),
  }
}

/**
 * The one seam between the site and where its data lives. Swapping the JSON for
 * a database is a change to this file and nothing else.
 *
 * Bound to a `CareerRecord`-typed constant rather than asserted with `as`: that
 * is checked by assignability, so a project missing a required key fails the
 * build instead of silently reconciling to optional-and-undefined.
 */
const record: CareerRecord = {
  ...rawRecord,
  profile: parseProfile(rawRecord.profile),
}

export function getCareer(): Promise<CareerRecord> {
  return Promise.resolve(record)
}
