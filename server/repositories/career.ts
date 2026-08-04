import type { CareerRecord, Profile, SummarySegment } from '~/types/career'
import rawRecord from '../data/career.json'

/**
 * The closed sets in the record, checked rather than asserted.
 *
 * TypeScript widens every string in an imported JSON module to `string`, so a
 * union like `'open' | 'closed'` is the one field shape the assignability check
 * below cannot make on its own. That leaves two options: widen the types until
 * they accept anything, or narrow the values here.
 *
 * Widening loses the thing worth having. A typo in `availability` — `opne` —
 * would mean "not open": the navbar would quietly drop its command and the
 * manifest would quietly print something false, with nothing failing anywhere
 * to say so.
 *
 * So it throws instead. This runs while the pages are prerendered, which turns
 * a bad value into a failed build rather than a wrong page — and it is the same
 * check a database would need on the same columns, sitting where that check
 * will go when the JSON is replaced.
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
 * The one seam between the site and where its data lives.
 *
 * Today that is a JSON file imported as a module. Binding it to a
 * `CareerRecord`-typed constant below (rather than asserting the whole thing
 * with `as`) is checked by assignability, not comparability: a project missing
 * a required key — even just one, among nine others that have it — fails the
 * build, because that key does not silently reconcile to
 * optional-and-undefined the way it would under `as`. Swapping the JSON for a
 * database is a change to this file and nothing else: the endpoint, the
 * composable and every component above them only know they receive a
 * `CareerRecord`.
 */
const record: CareerRecord = {
  ...rawRecord,
  profile: parseProfile(rawRecord.profile),
}

export function getCareer(): Promise<CareerRecord> {
  return Promise.resolve(record)
}
