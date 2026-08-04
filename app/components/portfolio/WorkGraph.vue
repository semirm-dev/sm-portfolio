<script setup lang="ts">
/**
 * The work page's headline graphic: the career as a radial network.
 *
 * Reading order is centre-out. The middle holds the recurring technologies,
 * sized and placed by how many projects used them; the ring holds the projects
 * in chronological order, clockwise from the top, each spoking inward to what
 * it used and outward to the technologies only it ever used. Filled discs
 * recur, hollow ones were used once — which is what replaces a legend.
 *
 * This file owns layout and rendering only. Recurrence counting and name
 * normalisation live with the data, so the graph cannot disagree with the work
 * history below it.
 */
import type { Project } from '~/types/career'

const { record, projects, graph } = await useCareer()

/*
 * Geometry. All in viewBox units, centred on (CX, CY). Positions are computed
 * on a circle and stretched into an ellipse on the way out of `polar()`, so
 * every derived position — discs, labels, spoke bundles, the satellite rim —
 * moves together and stays on the same figure. Scaling the rendered SVG
 * non-uniformly instead would squash the type and the discs with it.
 */
const CX = 500
const CY = 500

/**
 * Ellipse ratios applied to every polar position. Flatness is the height dial:
 * it buys vertical space without shrinking type, which capping the rendered
 * height cannot do. It costs clearance — the tier rings compress in y while
 * label offsets stay absolute — and this is the flattest setting that keeps
 * both the dense middle and a safe gap.
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
 * gap between any two painted boxes; they clear by ~9 viewBox units. Change one
 * and the sweep has to be redone. Three things the score has to include:
 * labels carry a 3-unit halo that erases what it overlaps, so two labels can
 * clear on glyphs and still rub each other out; label widths must be measured
 * per glyph rather than from a flat advance (see `labelWidth`); and label size
 * is in viewBox units against a fixed column, so a wider box means smaller type
 * on screen.
 *
 * The clearing window runs 57–61.5 and this sits mid-window.
 */
const CORE_PHASE = 59

const PROJECT_ORBIT = 400
const PROJECT_DISC = 34

/**
 * Where each project's spokes are pinched together, on the project's own ray
 * just outside the core. Bundling is what stops forty-odd straight chords
 * turning the middle into a knot.
 */
const BUNDLE_ORBIT = 260

/**
 * Project labels sit inside the ring, between the core's labels and the project
 * discs — the rim beyond the ring belongs to the satellites, and a label there
 * would be read as one.
 *
 * Measured from the edge of the project's own disc, not along an orbit. The
 * projection stretches x and squashes y, so a fixed orbit gap resolves to wildly
 * different clearances at the top of the ring and at its sides.
 */
const PROJECT_LABEL_GAP = 14

/**
 * Half the height of the project's name, used to push it clear of the disc it
 * belongs to once it has been centred on the anchor point.
 */
const PROJECT_LABEL_HALF = 16

/*
 * SATELLITES — the outer rim. A technology used by exactly one project has
 * nowhere to sit in a core built out of recurrence, so it hangs off its own
 * project instead, fanned about its ray. Folding the one-offs into the core
 * takes the middle from 16 nodes to 33 and drives the label clearance the sweep
 * above protects past zero. These figures were swept the same way.
 */

/**
 * How far a satellite sits beyond the edge of its own project's disc. Measured
 * from the disc rather than along a shared orbit, for the same reason the
 * project labels are.
 */
const SAT_GAP = 24

/** Spacing between a project's satellites, perpendicular to its outward normal. */
const SAT_SPACING = 84

/** How far outside its disc a satellite's label sits. */
const SAT_LABEL_GAP = 16

/**
 * Alternate satellites are pushed a row further out: four labels at one
 * distance collide, and staggering is cheaper than widening the whole figure to
 * fit one project.
 */
const SAT_STAGGER = 38

const SAT_DISC = 8

/**
 * Hit radius for a satellite — the same target the core's smallest discs get,
 * so no node is harder to hit or tab to just because it is drawn smaller.
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
 * Orbit is assigned by tier rather than by a continuous scale, so equally-used
 * technologies form visible rings. Alternate tiers are rotated by half a step
 * so no two rings align radially, which is what keeps the labels off each other.
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
 * Unit vector pointing away from the centre at a given ring angle. The
 * projection stretches x and squashes y, so this is not the angle's direction
 * on a circle. Project labels and satellites hang off it in opposite directions.
 */
function outwardNormal(angle: number): Point {
  const radians = (angle * Math.PI) / 180
  const x = Math.sin(radians) * ASPECT_X
  const y = -Math.cos(radians) * ASPECT_Y
  const length = Math.hypot(x, y) || 1

  return { x: x / length, y: y / length }
}

/**
 * Places a project's label just inside its disc, along the line back to the
 * centre. Mirrors `buildSatellite`, reversed: a satellite's label hangs outward
 * off the figure, a project's hangs inward.
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

  // Centred on the anchor, then pushed along the inward vertical to clear the
  // disc. At the side, where inY is ~0, it stays level with the disc's middle.
  const labelY = anchorY - 6 + inY * PROJECT_LABEL_HALF

  // Beside the disc the text has to grow away from it; a centred anchor would
  // run the longer names back over the circle. Near the top and bottom there is
  // no away side, so it stays centred.
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

  // The label continues outward from the disc. Where the normal is near
  // vertical there is no outward side, so it sits above or below instead.
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
 * Spokes. Core spokes are quadratic through the project's bundle neck;
 * satellite spokes are short straight radials.
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

  // Equal durations make the pulses march in lockstep, which reads as a loading
  // state rather than as flow.
  return built.map((edge, index) => ({
    ...edge,
    delay: `${(-index * 0.79).toFixed(2)}s`,
    duration: `${(9 + (index % 5) * 0.9).toFixed(1)}s`,
  }))
})

/**
 * The viewBox is measured from what is actually drawn, so the figure meets its
 * own edges whatever the data does. PAD only has to clear ink the bounds cannot
 * see: a label's ascender and the focus ring outside a project disc.
 */
const PAD = 26

/*
 * Label widths, for sizing the viewBox around what is actually painted.
 * Under-measuring clips a label at the edge of the box; over-measuring only
 * pads. A proportional face sets AWS at 0.89em per character and Notifications
 * at 0.71em, so no flat advance holds and the width is measured per glyph.
 *
 * The table is Helvetica/Arial bold advances: Arial is in --font-sans's
 * fallback chain, Liberation Sans is metric-compatible with it, and Segoe UI,
 * SF Pro and Roboto all set their semibold uppercase at or inside these widths.
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
 * average, so an unseen name pushes the box out rather than off the edge of it.
 */
const WIDEST_GLYPH_EM = 0.944

/**
 * Tracking on every label, bound into the CSS below through a custom property
 * rather than written out twice, so the number the box is measured with and the
 * number the browser renders with cannot drift apart.
 */
const LABEL_TRACKING = 0.11

/** Type sizes in viewBox units, bound into the CSS below for the same reason. */
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

    // A `start` label extends only right of its anchor and an `end` label only
    // left, so measuring either as centred pads one side and clips the other.
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
 * Both kinds of node are interactive and answer opposite questions: picking a
 * project lights what it was built with, picking a technology lights everywhere
 * it was used.
 *
 * Satellites need no third kind. Every technology name is unique across the
 * figure, so `tech` identifies one unambiguously and the difference between a
 * core node and a satellite is drawing, not selection.
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
 * The accessible name for a technology. The disc encodes its recurrence as
 * size, which is not available to a screen reader.
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
      with a different set clips a label at the edge of the box.
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
            A disc can be as small as 15 units. The invisible circle behind it
            gives every technology the same hit area regardless of how often it
            recurs.
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
          <!-- An 8-unit disc is neither clickable nor tabbable on its own. -->
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
          <!-- Drawn before the ring so it travels out from behind it. -->
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
 * The figure stays inside the page's content column. A full-bleed version was
 * tried and reverted: `width: 100vw` counts the scrollbar as viewport, so the
 * page gains a horizontal scroll and the outermost discs and labels crop.
 *
 * No height cap on purpose — capping height would scale the figure down, labels
 * included, and letterbox it. Height belongs to ASPECT_Y.
 *
 * The stage takes the same card treatment as SkillCard and WorkCard, as
 * utilities rather than a shared class. Its bg-ground is also what the label
 * halo keys off (see the labels section), so a label always sits over
 * --color-ground whatever band the page puts behind the figure.
 */
.stage {
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
    /* At rest the bundles are texture; only the hovered project's spokes are
       meant to be traceable line by line. */
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
/* A one-percent dash chased along a `pathLength="100"` copy of each spoke: one
   animated property, no per-frame JS, and the dot inherits the edge's curve. */
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

/* Transparent-filled rather than `fill: none`: the latter is not hit-tested. */
.hit-area {
    fill: transparent;
}

.hit:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
}

/* Slate rather than ink: at this disc size the near-black out-weighed the
   technologies the ring connects to, inverting the point of the figure. */
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

/* Outlined where the core is filled. That is the whole encoding: a filled disc
   is a technology that came back, a hollow one was used once. */
.sat-disc {
    fill: var(--color-ground);
    stroke: var(--color-accent);
    stroke-width: 2;
}

.live-ring {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 4;
    animation: live-ring 3.2s ease-in-out infinite;
}

/* The dot breathes rather than blinks: blinking reads as a warning, and this
   marker only says the work is ongoing. */
.live-dot {
    fill: var(--color-accent);
    animation: live-dot 3.2s ease-in-out infinite;
}

/*
 * `transform-box: fill-box` makes the origin the circle's own bounding box
 * rather than the SVG's; without it the ping flies toward the top-left corner
 * of the figure. Scale and opacity only — animating `r` would relayout the
 * shape on every tick.
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

/* ---------- labels ---------- */
/*
 * Every label is painted stroke-first in --color-ground, so a label crossing a
 * spoke knocks a channel through it instead of tangling with it. Hard-coding
 * that colour is safe only because the stage paints its own bg-ground surface;
 * the page's other background, --color-band, never sits behind a label.
 *
 * Tracking and the three type sizes arrive as custom properties from the
 * script, which measures the viewBox with the same figures — see
 * LABEL_TRACKING. Changing the family below needs GLYPH_EM changed with it,
 * since a table of advances can only describe one face.
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

/* Muted, not accent: the discs already carry the colour, so the labels stay
   grey rather than compete with them. Not a contrast workaround. */
.core-name {
    font-size: var(--core-label-size);
    fill: var(--color-muted);
}

.sat-name {
    font-size: var(--sat-label-size);
    fill: var(--color-muted);
}

/*
 * Below this width the labels fall under about 9px and the ring stops being
 * readable, so the graphic is dropped rather than reflowed into something
 * half-legible. The work history under it already carries every fact in it.
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
