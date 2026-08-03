<script setup lang="ts">
/**
 * The work page's headline graphic: the career as a radial network.
 *
 * Reading order is centre-out. The middle holds the technologies that came
 * back — the toolkit — sized and placed by how many projects used them. The ring
 * holds the ten projects in chronological order, clockwise from the top, each
 * spoking inward to the parts of the toolkit it used. So the shape of the
 * middle is the answer to "what does he actually keep doing", and the spokes
 * are the evidence.
 *
 * Outside the ring, each project fans out the technologies only it ever used. The
 * two populations are drawn differently on purpose — filled for recurring,
 * outlined for used-once — so the centre-out reading also runs from "the
 * toolkit" to "the one-offs" without needing a legend to say so.
 *
 * Everything here is derived from `career.json`, reached through `useCareer()`.
 * This file owns layout and rendering only; recurrence counting and name
 * normalisation live with the data, so the graph cannot disagree with the work
 * history below it on the page.
 *
 * This is deliberately the *only* view of this data in the component: no
 * legend, no detail rail, no fallback list. The work history immediately below
 * already spells out every employer, date, project and full stack, so a second
 * text path here would be duplication, and a legend would explain a picture
 * that the page then explains again in words.
 */
import type { Project } from '~/types/career'

const { record, projects, graph } = await useCareer()

/*
 * ---------------------------------------------------------------------------
 * Geometry. All in viewBox units, centred on (CX, CY).
 *
 * Positions are computed on a circle and then stretched into an ellipse on the
 * way out of `polar()`. That indirection is the whole reason the graphic can
 * span the page: a true circle wide enough to fill the shell would also stand
 * as tall as the shell is wide, burying the work history below the fold. An
 * ellipse spends the width it has and keeps the height of a headline band.
 *
 * Stretching at the projection means every derived position — discs, labels,
 * spoke bundles, the satellite rim — moves together and stays on the same
 * figure. The alternative, scaling the rendered SVG non-uniformly, would
 * squash the type and the discs along with it.
 * ---------------------------------------------------------------------------
 */
const CX = 500
const CY = 500

/**
 * Ellipse ratios applied to every polar position.
 *
 * Flatness is the height dial. Because the graphic takes the page's full width,
 * label sizes are fixed by that width alone — so flattening buys vertical space
 * without shrinking any type, which capping the rendered height cannot do.
 *
 * What it costs is clearance: the tier rings compress in y while the label
 * offsets stay in absolute units. Sweeping flatness against the core tuning,
 * gaps fall away steadily below this figure — see CORE_PHASE for the clearance
 * the shipped tuning reaches, and a step flatter there is no configuration left
 * that holds it. Flatter still forces the core hollow, which would cost the
 * reading that the most-used technologies sit dead centre. This is the flattest
 * setting that keeps both the dense middle and a safe gap.
 */
const ASPECT_X = 2.4
const ASPECT_Y = 0.7

/** Innermost and outermost orbit for the shared-technology core. */
const CORE_ORBIT_MIN = 68
const CORE_ORBIT_MAX = 300

/** Disc radius for the least- and most-used technology. */
const CORE_DISC_MIN = 15
const CORE_DISC_MAX = 27

/**
 * The core is rotated off the vertical so no orbit lines up with the first
 * project's ray, where that project's spoke bundle passes through.
 *
 * This, the orbits above, both ASPECT ratios, the satellite constants and every
 * label size are one joint solution, swept together and scored on the smallest
 * gap between any two painted boxes. They clear by ~9 viewBox units.
 *
 * Three things the score has to include, each of which was missing from an
 * earlier version of it and each of which produced a bug that only showed on
 * the rendered page:
 *
 *   Labels are painted stroke-first in the page ground, so each carries a
 *   3-unit halo that erases whatever it overlaps. Two labels can clear on
 *   glyphs and still rub each other out — which is what hid ArgoCD behind the
 *   project label beside it.
 *
 *   Label widths are measured per glyph, not estimated from a flat advance —
 *   see `labelWidth`. A proportional face makes the two differ by enough to
 *   matter.
 *
 *   Label size is in viewBox units while the figure is scaled to a fixed
 *   column, so a wider box means smaller type on screen. Clearance and
 *   legibility pull in opposite directions and only move together by removing
 *   labels — which is why the dates came off the ring and why the current
 *   project is labelled `VMware` rather than by its full project name.
 *
 * Re-swept when Claude Code joined the four-project tier: that made the five-project
 * tier one node and the four-project tier four, and a one-node ring half-stepped
 * against a four-node ring puts Postgres and Redis on the same ray — close
 * enough that Postgres' label sat on Redis' disc. The clearing window runs
 * 57–61.5 and this sits mid-window; across all of it the binding pair is TVM
 * against its own Aeron satellite, which no core phase can move.
 */
const CORE_PHASE = 59

const PROJECT_ORBIT = 400
const PROJECT_DISC = 34

/**
 * Where each project's spokes are pinched together, on the project's own ray just
 * outside the core. Fanning at the rim, through one throat, then splaying to
 * targets is what stops forty-odd straight chords turning the middle into a
 * knot:
 * spokes that share an origin also share a direction for most of their length,
 * so the eye can follow a bundle even when it cannot follow a single line.
 */
const BUNDLE_ORBIT = 260

/**
 * Project labels sit inside the ring, in the corridor between the core's labels
 * and the project discs. Inside rather than outside because the rim beyond the
 * ring belongs to the satellites, and a label there would be read as one.
 *
 * Measured from the edge of the project's own disc, not along an orbit of its own.
 * An orbit looks equivalent and is not: the projection stretches x by ASPECT_X
 * and squashes y by ASPECT_Y, so a fixed orbit gap of 105 units resolves to
 * 25 units of clearance for a project at the top of the ring and 153 for one at
 * the side. Sportradar and TVM sit near the horizontal, and at 153 their names
 * were nearer to unrelated satellites than to the disc they belong to — close
 * enough to read as labelling the wrong node. Offsetting from the disc keeps
 * every project's name the same distance from its own circle whatever the angle.
 */
const PROJECT_LABEL_GAP = 14

/**
 * Half the height of the project's name, used to push it clear of the disc it
 * belongs to once it has been centred on the anchor point.
 */
const PROJECT_LABEL_HALF = 16

/*
 * ---------------------------------------------------------------------------
 * SATELLITES — the outer rim.
 *
 * A technology used by exactly one project has nowhere to sit in the core, which
 * is built entirely out of recurrence. Folding the one-offs in anyway was
 * tried and it does not survive: it takes the middle from 16 nodes to 33 and
 * drives the label clearance the sweep above protects straight past zero.
 *
 * So they hang off their own project instead, fanned symmetrically about its ray
 * on the rim beyond the ring. That placement is also the truer statement — a
 * one-off belongs to one project, not to the toolkit — and it lets a project with no
 * satellites at all say something real: everything it used recurs elsewhere.
 *
 * These figures were swept the same way as the core's, against the longest
 * satellite label the data holds.
 * ---------------------------------------------------------------------------
 */
/**
 * How far a satellite sits beyond the edge of its own project's disc.
 *
 * Measured from the disc, not along a shared orbit. An orbit is not a constant
 * distance once the projection squashes y: at the top of the ring an orbit gap
 * resolves to a fraction of what it gives at the sides, so one-offs looked
 * welded to their project in some places and adrift from it in others. This is
 * the same correction the project labels already carry.
 */
const SAT_GAP = 24

/** Spacing between a project's satellites, perpendicular to its outward normal. */
const SAT_SPACING = 84

/** How far outside its disc a satellite's label sits. */
const SAT_LABEL_GAP = 16

/**
 * Alternate satellites are pushed a row further out. Four labels at one
 * distance is what collides — Imel carries AngularJS, Linux, Android and
 * SQLite, and staggering them is cheaper than widening the whole figure to
 * fit one project.
 */
const SAT_STAGGER = 38

const SAT_DISC = 8

/**
 * Hit radius for a satellite — the same target the core's smallest discs get
 * from their own `Math.max(radius, SAT_HIT - 8) + 8`, so no node is harder to
 * hit or to tab to than another just because it is drawn smaller.
 */
const SAT_HIT = 30

interface Point {
  x: number
  y: number
}

function polar(angle: number, radius: number): Point {
  const radians = (angle * Math.PI) / 180

  return {
    x: CX + radius * Math.sin(radians) * ASPECT_X,
    y: CY - radius * Math.cos(radians) * ASPECT_Y,
  }
}

/** Trim path coordinates: a tenth of a viewBox unit is well under a pixel. */
function round(value: number): number {
  return Math.round(value * 10) / 10
}

interface CoreNode {
  name: string
  projectCount: number
  x: number
  y: number
  radius: number
  labelX: number
  labelY: number
}

interface SatelliteNode {
  key: string
  name: string
  /** Names the technology and the one project that used it. */
  ariaLabel: string
  x: number
  y: number
  labelX: number
  labelY: number
  anchor: 'start' | 'middle' | 'end'
}

interface ProjectNode {
  key: string
  label: string
  ariaLabel: string
  isCurrent: boolean
  /** Degrees clockwise from the top; the ray the spokes bundle along. */
  angle: number
  x: number
  y: number
  labelX: number
  labelY: number
  anchor: 'start' | 'middle' | 'end'
  /** Shared technologies, in the core. */
  technologies: readonly string[]
  /** Single-use technologies, on the rim. */
  satellites: SatelliteNode[]
}

interface EdgeNode {
  key: string
  projectKey: string
  /** The technology at the far end, core or satellite. */
  tech: string
  d: string
  /** Negative offsets, so the traffic is already mid-flight on first paint. */
  delay: string
  duration: string
}

/**
 * The core: recurring technologies, most-used dead centre.
 *
 * Orbit is assigned by tier rather than by a continuous scale so equally-used
 * technologies form visible rings — "these four are the ones he never puts
 * down" is a stronger read than sixteen slightly different radii. Alternate
 * tiers are rotated by half a step so no two rings align radially, which is
 * what keeps the labels off each other.
 */
const coreNodes = computed<CoreNode[]>(() => {
  const tiers = [...new Set(graph.value.shared.map(tech => tech.projectCount))]
  const most = tiers[0]!
  const least = tiers[tiers.length - 1]!
  const spread = most - least

  return tiers.flatMap((count, tier) => {
    const members = graph.value.shared.filter(tech => tech.projectCount === count)
    const step = 360 / members.length
    const phase = CORE_PHASE + (tier % 2 === 0 ? 0 : step / 2)
    const orbit
      = tiers.length === 1
        ? CORE_ORBIT_MIN
        : CORE_ORBIT_MIN
          + (tier * (CORE_ORBIT_MAX - CORE_ORBIT_MIN))
          / (tiers.length - 1)
    const radius
      = spread === 0
        ? CORE_DISC_MAX
        : CORE_DISC_MIN
          + ((count - least) / spread) * (CORE_DISC_MAX - CORE_DISC_MIN)

    return members.map((tech, index) => {
      const { x, y } = polar(index * step + phase, orbit)

      return {
        name: tech.name,
        projectCount: tech.projectCount,
        x,
        y,
        radius,
        labelX: x,
        // Labels lean away from the centre, into the emptier side.
        labelY: y <= CY ? y - radius - 13 : y + radius + 19,
      }
    })
  })
})

const projectNodes = computed<ProjectNode[]>(() =>
  projects.value.map((project, index) => {
    const angle = (index * 360) / projects.value.length
    const { x, y } = polar(angle, PROJECT_ORBIT)
    const label = projectLabel(project)
    const technologies = graph.value.sharedByProject[index] ?? []
    const own = graph.value.ownByProject[index] ?? []
    /*
         * Satellites hang off the disc itself rather than off a shared orbit,
         * so every project's one-offs sit the same distance from it whatever
         * angle the project occupies on the ellipse.
         */
    const outward = outwardNormal(angle)
    const satellites = own.map((name, position) =>
      buildSatellite(
        project,
        name,
        label,
        { x, y },
        outward,
        position,
        own.length,
      ),
    )
    const stack = projectTechnologies(record.value.technologyAliases, project).join(', ')

    return {
      key: projectKey(project),
      label,
      ariaLabel:
                `${label}, ${project.project}, `
                + `${project.start.slice(0, 4)} to ${formatProjectEnd(project)}`
                + `${project.current ? ', current project' : ''}. `
                + `Technologies: ${stack}.`,
      isCurrent: project.current === true,
      angle,
      x,
      y,
      ...projectLabelAnchor(angle, x, y),
      technologies,
      satellites,
    }
  }),
)

/** Every satellite in one list, for rendering and for measuring the box. */
const satelliteNodes = computed<SatelliteNode[]>(() =>
  projectNodes.value.flatMap(project => project.satellites),
)

/**
 * Unit vector pointing away from the centre at a given ring angle.
 *
 * The projection stretches x and squashes y, so the outward direction at an
 * angle is not that angle's direction on a circle. Both the project labels and the
 * satellites hang off this, in opposite directions.
 */
function outwardNormal(angle: number): Point {
  const radians = (angle * Math.PI) / 180
  const x = Math.sin(radians) * ASPECT_X
  const y = -Math.cos(radians) * ASPECT_Y
  const length = Math.hypot(x, y) || 1

  return { x: x / length, y: y / length }
}

/**
 * Places a project's two-line label just inside its disc, along the line back to
 * the centre.
 *
 * The direction is taken in screen space rather than in ring degrees, so the
 * projection's stretch is already in it and the clearance comes out the same
 * all the way round. Everything else mirrors `buildSatellite`, reversed: a
 * satellite's label hangs outward off the figure, a project's hangs inward, so a
 * project on the right of the ring ends its text at the anchor where a satellite
 * there would start it.
 */
function projectLabelAnchor(
  angle: number,
  x: number,
  y: number,
): Pick<ProjectNode, 'labelX' | 'labelY' | 'anchor'> {
  const outward = outwardNormal(angle)
  const inX = -outward.x
  const inY = -outward.y

  const distance = PROJECT_DISC + PROJECT_LABEL_GAP
  const anchorX = x + inX * distance
  const anchorY = y + inY * distance

  /*
     * Centre the block on the anchor, then push it along the inward vertical so
     * it clears the disc: a project at the top of the ring gets its whole block
     * below the disc, one at the bottom gets it above, and one at the side —
     * where inY is ~0 — keeps it level with the disc's middle.
     */
  const labelY = anchorY - 6 + inY * PROJECT_LABEL_HALF

  /*
     * Beside the disc the text has to grow away from it; a centred anchor would
     * run the longer names straight back over the circle. Near the top and
     * bottom there is no away side, so it stays centred.
     */
  let anchor: ProjectNode['anchor'] = 'middle'

  if (Math.abs(inX) >= 0.25) {
    anchor = inX > 0 ? 'start' : 'end'
  }

  return { labelX: anchorX, labelY, anchor }
}

function buildSatellite(
  project: Project,
  name: string,
  projectLabel: string,
  origin: Point,
  outward: Point,
  position: number,
  count: number,
): SatelliteNode {
  // Perpendicular to the outward normal: the axis satellites spread along.
  const acrossX = -outward.y
  const acrossY = outward.x

  const out = PROJECT_DISC + SAT_GAP + (position % 2) * SAT_STAGGER
  const across = (position - (count - 1) / 2) * SAT_SPACING

  const x = origin.x + outward.x * out + acrossX * across
  const y = origin.y + outward.y * out + acrossY * across

  /*
     * The label continues outward from the disc, so it reads away from the
     * figure rather than back across it. Where the normal is near vertical
     * there is no outward side to hang from, so it sits above or below instead.
     */
  let anchor: SatelliteNode['anchor'] = 'middle'
  let labelY = y + outward.y * SAT_LABEL_GAP + 4.5

  if (Math.abs(outward.x) >= 0.25) {
    anchor = outward.x > 0 ? 'start' : 'end'
  }
  else {
    labelY = y + (outward.y < 0 ? -SAT_LABEL_GAP : SAT_LABEL_GAP + 12)
  }

  return {
    key: `${projectKey(project)}-${name}`,
    name,
    ariaLabel: `${name}, used only in ${projectLabel}.`,
    x,
    y,
    labelX: x + outward.x * SAT_LABEL_GAP,
    labelY,
    anchor,
  }
}

const coreByName = computed(
  () => new Map(coreNodes.value.map(node => [node.name, node])),
)

/**
 * Spokes. Core spokes are quadratic through the project's bundle neck; satellite
 * spokes are short straight radials, so the rim stays legibly separate from
 * the weave in the middle.
 */
const edges = computed<EdgeNode[]>(() => {
  const built: Omit<EdgeNode, 'delay' | 'duration'>[] = []

  projectNodes.value.forEach((project) => {
    const neck = polar(project.angle, BUNDLE_ORBIT)

    project.technologies.forEach((name) => {
      const target = coreByName.value.get(name)

      if (!target) {
        return
      }

      built.push({
        key: `${project.key}-${name}`,
        projectKey: project.key,
        tech: name,
        d:
                    `M${round(project.x)},${round(project.y)} `
                    + `Q${round(neck.x)},${round(neck.y)} `
                    + `${round(target.x)},${round(target.y)}`,
      })
    })

    project.satellites.forEach((satellite) => {
      built.push({
        key: satellite.key,
        projectKey: project.key,
        tech: satellite.name,
        d:
                    `M${round(project.x)},${round(project.y)} `
                    + `L${round(satellite.x)},${round(satellite.y)}`,
      })
    })
  })

  // Stagger and de-synchronise the traffic. Equal durations make the pulses
  // march in lockstep, which reads as a loading state rather than as flow.
  return built.map((edge, index) => ({
    ...edge,
    delay: `${(-index * 0.79).toFixed(2)}s`,
    duration: `${(9 + (index % 5) * 0.9).toFixed(1)}s`,
  }))
})

/**
 * The viewBox, measured from what is actually drawn rather than fixed.
 *
 * A hardcoded box has to be sized for the worst case the data could reach, and
 * leaves the difference as dead space — which is exactly the emptiness that
 * made the first version read as a small graphic adrift in a large box. The
 * rim is the part that moves: how far a project's satellites fan out, and how wide
 * their labels run, both follow the CV. Measuring means the figure meets its
 * own edges whatever the data does.
 *
 * PAD only has to clear ink the bounds cannot see: a label's ascender and the
 * focus ring drawn outside a project disc. It is not breathing room — the page's
 * own margins supply that.
 */
const PAD = 26

/*
 * Label widths, for sizing the viewBox around what is actually painted.
 *
 * Under-measuring clips a label at the edge of the box — the failure this
 * exists to prevent, and what once put "FIX" on the edge as "IX" — while
 * over-measuring only pads.
 *
 * This was a single flat advance while the labels were monospace, where one
 * figure per character is the whole truth. Moving them to the system sans stack
 * broke that silently: a proportional face sets AWS at 0.89em per character and
 * Notifications at 0.71em, so no single number holds, and the one left behind
 * under-measured 34 of the figure's 43 labels. The widest of them ran 17 units
 * past what it claimed, against a PAD of 26.
 *
 * So the width is measured per glyph rather than estimated. The table is
 * Helvetica/Arial bold advances: Arial is in --font-sans's fallback chain,
 * Liberation Sans is metric-compatible with it, and Segoe UI, SF Pro and Roboto
 * all set their semibold uppercase at or inside these widths — so measuring
 * against Arial pads slightly on the other stacks and clips on none of them.
 */
const GLYPH_EM: Record<string, number> = {
  'A': 0.722, 'B': 0.722, 'C': 0.722, 'D': 0.722, 'E': 0.667, 'F': 0.611, 'G': 0.778,
  'H': 0.722, 'I': 0.278, 'J': 0.556, 'K': 0.722, 'L': 0.611, 'M': 0.833, 'N': 0.722,
  'O': 0.778, 'P': 0.667, 'Q': 0.778, 'R': 0.722, 'S': 0.667, 'T': 0.611, 'U': 0.722,
  'V': 0.667, 'W': 0.944, 'X': 0.667, 'Y': 0.667, 'Z': 0.611,
  '0': 0.556, '1': 0.556, '2': 0.556, '3': 0.556, '4': 0.556,
  '5': 0.556, '6': 0.556, '7': 0.556, '8': 0.556, '9': 0.556,
  ' ': 0.278, '.': 0.278, '-': 0.333, '+': 0.584, '/': 0.278,
}

/**
 * What an unmapped character measures as: the widest glyph in the face, not an
 * average. A name carrying something this table has never seen should push the
 * box out, not off the edge of it.
 */
const WIDEST_GLYPH_EM = 0.944

/**
 * Tracking on every label, bound into the CSS below through a custom property
 * rather than written out twice. The number the box is measured with and the
 * number the browser renders with cannot drift apart that way — which is
 * exactly how the flat advance above went stale, when a commit moved the labels
 * off monospace and took the tracking from 0.14em to 0.11em without the
 * measurement noticing either change.
 */
const LABEL_TRACKING = 0.11

/**
 * Type sizes in viewBox units, bound into the CSS below for the same reason.
 * They render at roughly half their value at the figure's capped width, which
 * puts these labels on the same footing as the rest of the site's small type
 * rather than letting the graphic shout.
 */
const CORE_LABEL_SIZE = 23
const ROLE_LABEL_SIZE = 27
const SAT_LABEL_SIZE = 18

/** Painted width of a label, in viewBox units. The CSS uppercases them. */
function labelWidth(text: string, fontSize: number): number {
  const glyphs = [...text.toUpperCase()].reduce(
    (total, character) => total + (GLYPH_EM[character] ?? WIDEST_GLYPH_EM),
    0,
  )

  return (glyphs + text.length * LABEL_TRACKING) * fontSize
}

const viewBox = computed(() => {
  const xs: number[] = []
  const ys: number[] = []

  const span = (x: number, y: number, radius: number): void => {
    xs.push(x - radius, x + radius)
    ys.push(y - radius, y + radius)
  }

  coreNodes.value.forEach((node) => {
    span(node.x, node.y, node.radius)
    // Centred on its anchor, so half the width reaches each way.
    span(
      node.labelX,
      node.labelY,
      labelWidth(node.name, CORE_LABEL_SIZE) / 2,
    )
  })

  projectNodes.value.forEach((node) => {
    span(node.x, node.y, PROJECT_DISC + 6)

    /*
         * Anchored the same way a satellite's is, and measured the same way for
         * the same reason: a `start` label extends only right of its anchor and
         * an `end` label only left, so treating either as centred pads one side
         * and clips the other. These labels point inward, so they rarely set an
         * edge — but the widest name on a near-horizontal project is the one case
         * that can, and it is the case this figure already has.
         */
    const width = labelWidth(node.label, ROLE_LABEL_SIZE)
    const left
      = node.anchor === 'start'
        ? 0
        : node.anchor === 'end'
          ? width
          : width / 2

    xs.push(node.labelX - left, node.labelX - left + width)
    ys.push(node.labelY - 24, node.labelY + 10)
  })

  satelliteNodes.value.forEach((node) => {
    span(node.x, node.y, SAT_DISC)

    /*
         * Unlike every other label here, a satellite's is not centred on its
         * anchor point: a `start` label extends only to the right of it and an
         * `end` label only to the left. Measuring all three as if centred would
         * over-pad one side and clip the other.
         */
    const width = labelWidth(node.name, SAT_LABEL_SIZE)
    const left
      = node.anchor === 'start'
        ? 0
        : node.anchor === 'end'
          ? width
          : width / 2

    xs.push(node.labelX - left, node.labelX - left + width)
    ys.push(node.labelY - 13, node.labelY + 5)
  })

  const minX = Math.min(...xs) - PAD
  const minY = Math.min(...ys) - PAD

  return [
    round(minX),
    round(minY),
    round(Math.max(...xs) + PAD - minX),
    round(Math.max(...ys) + PAD - minY),
  ].join(' ')
})

/*
 * Both kinds of node are interactive, and they answer opposite questions:
 * picking a project lights what it was built with, picking a technology lights
 * everywhere it was used. The second is the one the ring cannot show on its
 * own — "which of these ten actually shared a stack" is only legible by
 * selecting the shared thing.
 *
 * Technologies are focusable as well as hoverable. Hover-only would put the
 * more interesting of the two readings out of reach of anyone not using a
 * mouse, which is a worse cost than the extra tab stops.
 *
 * Satellites need no third selection kind. Every technology name is unique
 * across the figure — that is what put the one-offs on the rim in the first
 * place — so `tech` already identifies one unambiguously, and the difference
 * between a core node and a satellite is drawing, not selection.
 */
type Selection
  = { kind: 'project', id: string } | { kind: 'tech', id: string } | null

/** Every technology one project touched, core and rim alike. */
function projectStack(node: ProjectNode): string[] {
  return [
    ...node.technologies,
    ...node.satellites.map(satellite => satellite.name),
  ]
}

const hovered = ref<Selection>(null)
const pinned = ref<Selection>(null)
const active = computed<Selection>(() => pinned.value ?? hovered.value)

/** Technologies to light: a project's whole stack, or the single chosen one. */
const activeTechnologies = computed<ReadonlySet<string>>(() => {
  const selection = active.value

  if (selection === null) {
    return new Set<string>()
  }

  if (selection.kind === 'tech') {
    return new Set([selection.id])
  }

  const project = projectNodes.value.find(node => node.key === selection.id)

  return new Set(project === undefined ? [] : projectStack(project))
})

/** Projects to light: the chosen one, or every project that used the chosen tech. */
const activeProjects = computed<ReadonlySet<string>>(() => {
  const selection = active.value

  if (selection === null) {
    return new Set<string>()
  }

  if (selection.kind === 'project') {
    return new Set([selection.id])
  }

  return new Set(
    projectNodes.value
      .filter(node => projectStack(node).includes(selection.id))
      .map(node => node.key),
  )
})

/** Whether an edge belongs to the current selection. */
function isEdgeActive(edge: EdgeNode): boolean {
  const selection = active.value

  if (selection === null) {
    return false
  }

  return selection.kind === 'project'
    ? edge.projectKey === selection.id
    : edge.tech === selection.id
}

function same(a: Selection, b: Selection): boolean {
  return a !== null && b !== null && a.kind === b.kind && a.id === b.id
}

function toggle(selection: Selection): void {
  pinned.value = same(pinned.value, selection) ? null : selection
}

function clear(): void {
  pinned.value = null
  hovered.value = null
}

/**
 * How many projects a technology appears in, for its accessible name — the disc
 * encodes this as size, which is not available to a screen reader.
 */
function techLabel(name: string, projectCount: number): string {
  const users = projectNodes.value
    .filter(node => node.technologies.includes(name))
    .map(node => node.label)
    .join(', ')

  return `${name}, used in ${projectCount} projects: ${users}.`
}

const summary
  = `Radial network graph of ${projects.value.length} projects arranged in a ring in `
    + `chronological order, each linked inward to the ${graph.value.shared.length} `
    + `technologies used in more than one of them, and outward to the `
    + `technologies only that project used.`
</script>

<template>
  <figure
    class="stage rounded-xl border border-rule bg-ground p-4 shadow-card"
    :class="{ 'is-active': active !== null }"
    :aria-label="summary"
    role="group"
    @mouseleave="hovered = null"
    @keydown.esc="clear"
  >
    <!--
      Tracking and type sizes come from the script rather than being written out
      again in the CSS: the viewBox is measured with these numbers, so rendering
      with a different set is how a label ends up clipped at the edge of the box.
    -->
    <svg
      class="graph"
      :viewBox="viewBox"
      :style="{
        '--label-tracking': `${LABEL_TRACKING}em`,
        '--core-label-size': `${CORE_LABEL_SIZE}px`,
        '--role-label-size': `${ROLE_LABEL_SIZE}px`,
        '--sat-label-size': `${SAT_LABEL_SIZE}px`,
      }"
    >
      <title>{{ summary }}</title>

      <g aria-hidden="true">
        <path
          v-for="edge in edges"
          :key="edge.key"
          class="edge"
          :class="{ 'is-on': isEdgeActive(edge) }"
          :d="edge.d"
        />
      </g>

      <g aria-hidden="true">
        <path
          v-for="edge in edges"
          :key="edge.key"
          class="pulse"
          :class="{ 'is-on': isEdgeActive(edge) }"
          :d="edge.d"
          pathLength="100"
          :style="{
            animationDelay: edge.delay,
            animationDuration: edge.duration,
          }"
        />
      </g>

      <g>
        <g
          v-for="node in coreNodes"
          :key="node.name"
          class="node hit"
          :class="{ 'is-on': activeTechnologies.has(node.name) }"
          role="button"
          tabindex="0"
          :aria-label="techLabel(node.name, node.projectCount)"
          :aria-pressed="
            pinned?.kind === 'tech' && pinned.id === node.name
          "
          @mouseenter="hovered = { kind: 'tech', id: node.name }"
          @focus="hovered = { kind: 'tech', id: node.name }"
          @blur="hovered = null"
          @click="toggle({ kind: 'tech', id: node.name })"
          @keydown.enter.prevent="
            toggle({ kind: 'tech', id: node.name })
          "
          @keydown.space.prevent="
            toggle({ kind: 'tech', id: node.name })
          "
        >
          <!--
                        A disc can be as small as 15 units, which is a hard
                        target to hit and a smaller one to tab to. The invisible
                        circle behind it gives every technology the same
                        comfortable hit area regardless of how often it recurs.
                    -->
          <circle
            class="hit-area"
            :cx="round(node.x)"
            :cy="round(node.y)"
            :r="round(Math.max(node.radius, SAT_HIT - 8) + 8)"
          />
          <circle
            class="core-disc"
            :cx="round(node.x)"
            :cy="round(node.y)"
            :r="round(node.radius)"
          />
          <text
            class="core-name"
            :x="round(node.labelX)"
            :y="round(node.labelY)"
            text-anchor="middle"
          >
            {{ node.name }}
          </text>
        </g>
      </g>

      <g>
        <g
          v-for="node in satelliteNodes"
          :key="node.key"
          class="node hit"
          :class="{ 'is-on': activeTechnologies.has(node.name) }"
          role="button"
          tabindex="0"
          :aria-label="node.ariaLabel"
          :aria-pressed="
            pinned?.kind === 'tech' && pinned.id === node.name
          "
          @mouseenter="hovered = { kind: 'tech', id: node.name }"
          @focus="hovered = { kind: 'tech', id: node.name }"
          @blur="hovered = null"
          @click="toggle({ kind: 'tech', id: node.name })"
          @keydown.enter.prevent="
            toggle({ kind: 'tech', id: node.name })
          "
          @keydown.space.prevent="
            toggle({ kind: 'tech', id: node.name })
          "
        >
          <!--
                        Satellites are the smallest discs in the figure, so they
                        need the invisible target more than anything else here:
                        an 8-unit disc is neither clickable nor tabbable.
                    -->
          <circle
            class="hit-area"
            :cx="round(node.x)"
            :cy="round(node.y)"
            :r="SAT_HIT"
          />
          <circle
            class="sat-disc"
            :cx="round(node.x)"
            :cy="round(node.y)"
            :r="SAT_DISC"
          />
          <text
            class="sat-name"
            :x="round(node.labelX)"
            :y="round(node.labelY)"
            :text-anchor="node.anchor"
          >
            {{ node.name }}
          </text>
        </g>
      </g>

      <g
        v-for="project in projectNodes"
        :key="project.key"
        class="node hit"
        :class="{ 'is-on': activeProjects.has(project.key) }"
        role="button"
        tabindex="0"
        :aria-label="project.ariaLabel"
        :aria-pressed="
          pinned?.kind === 'project' && pinned.id === project.key
        "
        @mouseenter="hovered = { kind: 'project', id: project.key }"
        @focus="hovered = { kind: 'project', id: project.key }"
        @blur="hovered = null"
        @click="toggle({ kind: 'project', id: project.key })"
        @keydown.enter.prevent="toggle({ kind: 'project', id: project.key })"
        @keydown.space.prevent="toggle({ kind: 'project', id: project.key })"
      >
        <circle
          class="project-disc"
          :cx="round(project.x)"
          :cy="round(project.y)"
          :r="PROJECT_DISC"
        />
        <template v-if="project.isCurrent">
          <!--
                        Drawn before the ring so it travels out from behind it
                        rather than across it.
                    -->
          <circle
            class="live-ping"
            :cx="round(project.x)"
            :cy="round(project.y)"
            :r="PROJECT_DISC + 12"
          />
          <circle
            class="live-ring"
            :cx="round(project.x)"
            :cy="round(project.y)"
            :r="PROJECT_DISC + 12"
          />
          <circle
            class="live-dot"
            :cx="round(project.x)"
            :cy="round(project.y)"
            r="10"
          />
        </template>
        <text
          class="project-name"
          :x="round(project.labelX)"
          :y="round(project.labelY)"
          :text-anchor="project.anchor"
        >
          {{ project.label }}
        </text>
      </g>
    </svg>
  </figure>
</template>

<style scoped>
/*
 * The figure stays inside the page's content column, aligned with the history
 * below it. It is a headline for that content, not a separate banner, and the
 * shared left edge is what says so.
 *
 * A full-bleed version was tried and reverted. Beyond looking detached from the
 * text it introduces, `width: 100vw` counts the scrollbar as viewport, so the
 * element ends up wider than the visible area and the whole page gains a
 * horizontal scroll — which crops the outermost discs and labels, the exact
 * things this layout spends its width on.
 *
 * No height cap here on purpose: capping height would scale the figure down,
 * labels included, and letterbox it. Height belongs to ASPECT_Y.
 */
/*
 * The stage gets the same card treatment as SkillCard and
 * WorkCard: bg-ground, border-rule and shadow-card, applied as Tailwind
 * utilities directly on the element rather than through a shared class.
 * That bg-ground is also what the node labels' halo keys off (see the labels
 * section below): because the stage paints a surface of its own, every label
 * sits over --color-ground whatever band the page puts behind the figure, so
 * the halo can never show as a visible ring.
 */
.stage {
    /* It has a surface of its own now, so it needs air under the page head. */
    margin: 18px 0 0;
}

.graph {
    display: block;
    width: 100%;
    animation: graph-in 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) backwards;
}

@keyframes graph-in {
    from {
        opacity: 0;
        transform: scale(0.97);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

/* ---------- spokes ---------- */
.edge {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 1.6;
    /*
     * Resting opacity is low by design: at rest the bundles are texture, and
     * only the hovered project's spokes are meant to be traceable line by line.
     */
    stroke-opacity: 0.17;
    stroke-linecap: round;
    transition:
        stroke-opacity 0.18s ease,
        stroke-width 0.18s ease;
}

.stage.is-active .edge {
    stroke-opacity: 0.05;
}

.stage.is-active .edge.is-on {
    stroke-width: 2.8;
    stroke-opacity: 0.9;
}

/* ---------- ambient traffic ---------- */
/*
 * A one-percent dash chased along a `pathLength="100"` copy of each spoke:
 * one animated property, no per-frame JS, and the dot inherits the exact
 * curve of the edge it travels.
 */
.pulse {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 3.6;
    stroke-opacity: 0.85;
    stroke-linecap: round;
    stroke-dasharray: 1.2 98.8;
    animation-name: flow;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
}

@keyframes flow {
    from {
        stroke-dashoffset: 100;
    }

    to {
        stroke-dashoffset: 0;
    }
}

.stage.is-active .pulse {
    opacity: 0;
}

.stage.is-active .pulse.is-on {
    opacity: 1;
}

/* ---------- nodes ---------- */
.node {
    transition: opacity 0.18s ease;
}

.stage.is-active .node {
    opacity: 0.15;
}

.stage.is-active .node.is-on {
    opacity: 1;
}

.hit {
    cursor: pointer;
}

/*
 * The hit target is invisible but must still take pointer events, so it is
 * transparent-filled rather than `fill: none` — the latter is not hit-tested.
 */
.hit-area {
    fill: transparent;
}

.hit:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
}

/*
 * Slate rather than ink. At this disc size the near-black read as ten heavy
 * spots that out-weighed the technologies they connect to, which inverts the
 * point of the figure — the core is the subject, the ring is the evidence.
 * This is the same grey-blue the page sets body copy in.
 */
.project-disc {
    fill: var(--color-muted);
    /* A hairline in the page surface, so touching discs still read apart. */
    stroke: var(--color-ground);
    stroke-width: 3;
}

.core-disc {
    fill: var(--color-accent);
    stroke: var(--color-ground);
    stroke-width: 2.5;
}

/*
 * Outlined, where the core is filled. That is the whole encoding: a filled disc
 * is a technology that came back, a hollow one is a technology used once. Same
 * accent, so the rim still reads as part of the same figure; less ink, so it
 * never competes with the middle for attention.
 */
.sat-disc {
    fill: var(--color-ground);
    stroke: var(--color-accent);
    stroke-width: 2;
}

/*
 * The live marker borrows the layout's status dot exactly — neon fill plus a
 * small bloom, never type. The bloom only works because the dot is a small
 * bright shape on a pale ground.
 */
.live-ring {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 4;
    animation: live-ring 3.2s ease-in-out infinite;
}

/*
 * The dot breathes rather than blinks. Blinking reads as a warning — the site
 * already spends that vocabulary on the `open to work` status dot in the header
 * — and this marker is not raising an alarm, it is saying the work is ongoing.
 * So the bloom swells and settles instead, on a slow cycle offset from the ring
 * behind it so the two never peak together and the glow never pulses flatly.
 */
.live-dot {
    fill: var(--color-accent);
    animation: live-dot 3.2s ease-in-out infinite;
}

/*
 * A single ping travelling outward, once per cycle.
 *
 * `transform-box: fill-box` makes the origin the circle's own bounding box
 * rather than the SVG's, so one rule scales every instance about its own centre
 * — without it the ping would fly toward the top-left corner of the figure.
 *
 * Scale and opacity only: both are compositor properties, so the loop costs
 * nothing per frame. Animating `r` would relayout the shape on every tick.
 */
.live-ping {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 3;
    transform-box: fill-box;
    transform-origin: center;
    animation: live-ping 3.2s cubic-bezier(0.2, 0.8, 0.3, 1) infinite;
}

@keyframes live-ping {
    0% {
        opacity: 0.5;
        transform: scale(1);
    }

    70%,
    100% {
        opacity: 0;
        transform: scale(1.75);
    }
}

@keyframes live-ring {
    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.55;
    }
}

@keyframes live-dot {
    0%,
    100% {
        filter: drop-shadow(0 0 4px var(--color-accent));
    }

    50% {
        filter: drop-shadow(0 0 13px var(--color-accent));
    }
}

/*
 * The current project takes the same slate disc as every other node. It used to
 * keep the darker ink so the neon dot had somewhere dark to bloom against, but
 * that made one node out of ten read as a different kind of thing. The live
 * ring, dot and ping already say `ongoing` on their own, so the marker carries
 * the state and the disc stays part of the ring.
 */

/* ---------- labels ---------- */
/*
 * Every label is painted stroke-first in the colour of what it sits on, so a
 * label that crosses a spoke knocks a channel through it instead of tangling
 * with it. That colour is --color-ground, which is safe to hard-code here
 * only because the stage paints its own bg-ground surface: the label is
 * always over that, never over the page behind it, so the stroke cannot show
 * as a visible ring. --color-ground is not the page's only background —
 * --color-band backs the alternating sections — which is precisely why the
 * halo keys off the stage's surface rather than the page's.
 *
 * Tracking and the three type sizes are not written here. They arrive as custom
 * properties from the script, which measures the viewBox with the same figures
 * — see LABEL_TRACKING. Changing the family below still needs GLYPH_EM changed
 * with it, since a table of advances can only describe one face.
 */
.graph text {
    font-family: var(--font-sans);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--label-tracking);
    stroke: var(--color-ground);
    stroke-width: 6px;
    stroke-linejoin: round;
    paint-order: stroke fill;
}

.project-name {
    font-size: var(--role-label-size);
    font-weight: 600;
    fill: var(--color-ink);
}

/*
 * Technology names are muted, not accent. --color-accent is legible as type
 * everywhere now (7.9:1 on white), so this is not a contrast workaround — it
 * is hierarchy: the discs already carry the colour and encode recurrence by
 * size, so the labels stay grey rather than compete with them for attention.
 */
.core-name {
    font-size: var(--core-label-size);
    fill: var(--color-muted);
}

/* Smaller than a core name, for the same reason the disc is hollower. */
.sat-name {
    font-size: var(--sat-label-size);
    fill: var(--color-muted);
}

/*
 * Below this width the ring stops being readable, and the work history under it
 * already carries every fact in it — so the graphic is dropped rather than
 * reflowed into something half-legible.
 *
 * The threshold is derived, not chosen by feel: core labels are 23 viewBox
 * units and satellite labels 18, on a box getting on for two and a half
 * thousand units wide, so both fall below about 9px once the band is narrower
 * than this, and the ring is dense enough that shrinking type fails first.
 * Phones were never going to hold a 43-node figure;
 * the point of the cutoff is that small laptops and tablets get a clean page
 * instead of a smeared one.
 */
@media (max-width: 860px) {
    .stage {
        display: none;
    }
}

@media (prefers-reduced-motion: reduce) {
    .pulse,
    .live-ping {
        display: none;
    }

    /* The marker keeps its bloom, it just stops moving. */
    .live-ring,
    .live-dot {
        animation: none;
    }

    .live-dot {
        filter: drop-shadow(0 0 5px var(--color-accent));
    }

    .graph {
        animation: none;
    }

    .edge,
    .node {
        transition: none;
    }
}
</style>
