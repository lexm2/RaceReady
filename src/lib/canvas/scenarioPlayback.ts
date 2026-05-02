import type {
  AnimationClip,
  AnimationKeyframe,
  BoatKeyframeData,
  BoatState,
  SceneState,
  Vec2,
  Waypoint,
} from './types.ts'
import { lerpAngle, lerpVec2 } from './renderer/coords.ts'
import { calcLegSpeed } from './renderer/waypoint.ts'

const KNOT_TO_MS = 0.514444
const TURN_RATE_DEG_PER_S = 60      // degrees per second of heading change
const MIN_LEG_SPEED_KNOTS = 0.3     // floor so no-go-zone legs still progress
const ARC_DEG_PER_STEP = 10         // arc sample density along each rounded corner
const MIN_ARC_RADIUS_M = 0.05       // below this, treat corner as a snap (no arc)
const COLLINEAR_DEG = 1             // deflection below this is treated as straight
const TIGHT_TURN_DEG = 175          // above this, fall back to in-place pivot

interface RouteFrame {
  time: number
  data: BoatKeyframeData
}

export interface BoatRoute {
  boatId: string
  frames: RouteFrame[]
  /** Animation times where this boat hits a waypoint (used for skip-bookmarks). */
  waypointTimes: number[]
  /** Total time of the last keyframe; may be shorter than the clip's overall duration. */
  naturalDurationSec: number
}

export interface ScenarioPlayback {
  clip: AnimationClip
  routes: BoatRoute[]
  /** Sorted, unique time bookmarks (start, each waypoint, end). */
  bookmarks: number[]
}

export interface BuildPlaybackOptions {
  /**
   * Minimum playback duration in seconds. If a boat's natural route is shorter
   * than this floor (or shorter than another boat's route), the boat keeps
   * sailing forward at its last heading until the clip ends. This prevents one
   * boat freezing while another is still moving.
   */
  minDurationSec?: number
  /**
   * If true, the clip loops. Defaults to false (single-shot).
   */
  loop?: boolean
}

function legBearing(from: Vec2, to: Vec2): number {
  return ((Math.atan2(to.x - from.x, -(to.y - from.y)) * 180) / Math.PI + 360) % 360
}

function headingVec(deg: number): Vec2 {
  const r = (deg * Math.PI) / 180
  return { x: Math.sin(r), y: -Math.cos(r) }
}

function legSpeedMs(bearingDeg: number, windDirDeg: number): number {
  const knots = Math.max(calcLegSpeed(bearingDeg, windDirDeg), MIN_LEG_SPEED_KNOTS)
  return knots * KNOT_TO_MS
}

interface CornerInfo {
  /** True when this waypoint is rounded with an arc (interior + non-degenerate). */
  isCorner: boolean
  /** +1 = right turn (CW in y-down screen coords), -1 = left turn. */
  sign: 1 | -1 | 0
  /** Magnitude of heading deflection in degrees, [0, 180]. */
  alphaDeg: number
  /** Arc radius (m), 0 if no arc. */
  R: number
  /** Tangent distance from corner along each adjacent leg (m), 0 if no arc. */
  dTan: number
}

/**
 * Build a continuous-motion route for a single boat. If the boat has waypoints,
 * follow them; if it doesn't, sail straight ahead at its current heading.
 *
 * Corner handling: each interior waypoint is rounded with a circular arc of
 * radius R = v / ω (boat-leg speed over turn rate), tangent to both adjacent
 * legs at distance d = R·tan(α/2) from the corner. The boat begins turning
 * BEFORE the waypoint and exits past it, tracing a curve rather than pivoting
 * in place. Heading sweeps continuously along the arc.
 *
 * `waypointTimes` records the **arc-entry time** ("the moment the boat begins
 * rounding the mark"). For the last waypoint, no arc → entry equals the
 * waypoint itself, so the bookmark is consistent.
 *
 * `naturalDurationSec` is the time of the last emitted frame (0 if no waypoints).
 */
function buildBoatRoute(boat: BoatState, waypoints: Waypoint[], windDirDeg: number): BoatRoute {
  const wps = waypoints
    .filter(w => w.boatId === boat.id)
    .sort((a, b) => a.order - b.order)

  const frames: RouteFrame[] = []
  const waypointTimes: number[] = []
  let t = 0

  function push(heading: number, position: Vec2): void {
    frames.push({ time: t, data: { boatId: boat.id, position, heading } })
  }

  /** Spin in place at `pos` from `fromH` to `toH`. Used for the initial
   *  heading-vs-firstBearing alignment and for tight-U-turn fallbacks. */
  function pivotInPlace(pos: Vec2, fromH: number, toH: number): void {
    const turn = Math.abs(((toH - fromH + 540) % 360) - 180)
    if (turn < COLLINEAR_DEG) return
    const turnDuration = turn / TURN_RATE_DEG_PER_S
    const steps = Math.max(4, Math.ceil(turn / ARC_DEG_PER_STEP))
    const dt = turnDuration / steps
    for (let k = 1; k <= steps; k++) {
      const h = lerpAngle(fromH, toH, k / steps)
      t += dt
      push(h, pos)
    }
  }

  push(boat.heading, boat.position)

  // Immobile boats (capsized / anchored / aground) emit one keyframe and
  // skip waypoint following. The page drops their waypoints on condition
  // change; this guards against any straggler.
  const immobile = (boat.condition ?? 'normal') !== 'normal'
  if (immobile || wps.length === 0) {
    return { boatId: boat.id, frames, waypointTimes, naturalDurationSec: 0 }
  }

  const omega = (TURN_RATE_DEG_PER_S * Math.PI) / 180

  // Pre-compute leg geometry. P[0] = boat position, P[i+1] = wps[i].position.
  const N = wps.length
  const P: Vec2[] = [boat.position, ...wps.map(w => w.position)]
  const bearings: number[] = []
  const lengths: number[] = []
  for (let i = 0; i < N; i++) {
    bearings.push(legBearing(P[i]!, P[i + 1]!))
    lengths.push(Math.hypot(P[i + 1]!.x - P[i]!.x, P[i + 1]!.y - P[i]!.y))
  }

  // corners[i] describes the turn AT wps[i] (uses bearings[i] in, bearings[i+1] out).
  // Last waypoint has no outbound leg, so it's not a corner.
  const corners: CornerInfo[] = []
  for (let i = 0; i < N; i++) {
    if (i === N - 1) {
      corners.push({ isCorner: false, sign: 0, alphaDeg: 0, R: 0, dTan: 0 })
      continue
    }
    const inB = bearings[i]!
    const outB = bearings[i + 1]!
    const defl = ((outB - inB + 540) % 360) - 180
    const alphaDeg = Math.abs(defl)
    if (alphaDeg < COLLINEAR_DEG || alphaDeg > TIGHT_TURN_DEG) {
      corners.push({ isCorner: false, sign: 0, alphaDeg, R: 0, dTan: 0 })
      continue
    }
    const v = legSpeedMs(inB, windDirDeg)
    const Rraw = v / omega
    const halfTan = Math.tan((alphaDeg * Math.PI) / 360)
    let dTan = Rraw * halfTan
    // Per-side cap: don't consume more than half the shorter adjacent leg.
    const halfShort = Math.min(lengths[i]!, lengths[i + 1]!) * 0.5
    if (dTan > halfShort) dTan = halfShort
    corners.push({
      isCorner: true,
      sign: defl > 0 ? 1 : -1,
      alphaDeg,
      R: dTan / halfTan,
      dTan,
    })
  }

  // Second pass: prevent adjacent corners' tangents from overlapping on a
  // shared leg. Leg between wps[i] and wps[i+1] has length lengths[i+1];
  // it absorbs corners[i].dTan from one end and corners[i+1].dTan from the other.
  for (let i = 0; i < N - 2; i++) {
    const a = corners[i]!
    const b = corners[i + 1]!
    if (!a.isCorner && !b.isCorner) continue
    const sumD = a.dTan + b.dTan
    const legLen = lengths[i + 1]!
    if (sumD > legLen) {
      const scale = legLen / sumD
      a.dTan *= scale
      b.dTan *= scale
      if (a.isCorner) a.R = a.dTan / Math.tan((a.alphaDeg * Math.PI) / 360)
      if (b.isCorner) b.R = b.dTan / Math.tan((b.alphaDeg * Math.PI) / 360)
    }
  }

  // Initial in-place pivot to align heading with the first leg. With no
  // inbound leg there's nothing to round into, so we simply spin.
  pivotInPlace(boat.position, boat.heading, bearings[0]!)
  let prevExit: Vec2 = boat.position

  for (let i = 0; i < N; i++) {
    const wp = wps[i]!
    const inB = bearings[i]!
    const c = corners[i]!
    const v = legSpeedMs(inB, windDirDeg)
    const inVec = headingVec(inB)

    // Sail from prevExit toward wp; stop at the entry tangent (or at wp itself
    // if there's no arc).
    const segDist = Math.hypot(wp.position.x - prevExit.x, wp.position.y - prevExit.y)
    const useArc = c.isCorner && c.R > MIN_ARC_RADIUS_M
    const entryDist = Math.max(0, segDist - (useArc ? c.dTan : 0))
    const entry: Vec2 = useArc
      ? {
          x: prevExit.x + inVec.x * entryDist,
          y: prevExit.y + inVec.y * entryDist,
        }
      : wp.position

    if (entryDist > 1e-6) t += entryDist / v
    push(inB, entry)
    waypointTimes.push(t)

    if (useArc) {
      const outB = bearings[i + 1]!
      const sign = c.sign as 1 | -1
      // Perpendicular to inVec pointing toward arc center (right of inVec for
      // a right turn, left for a left turn).
      const perp: Vec2 = { x: -inVec.y * sign, y: inVec.x * sign }
      const center: Vec2 = { x: entry.x + perp.x * c.R, y: entry.y + perp.y * c.R }

      const alphaRad = (c.alphaDeg * Math.PI) / 180
      const arcDur = c.alphaDeg / TURN_RATE_DEG_PER_S
      const steps = Math.max(4, Math.ceil(c.alphaDeg / ARC_DEG_PER_STEP))
      const dx = entry.x - center.x
      const dy = entry.y - center.y
      const dt = arcDur / steps

      for (let k = 1; k <= steps; k++) {
        const frac = k / steps
        const θ = sign * alphaRad * frac
        const cosθ = Math.cos(θ)
        const sinθ = Math.sin(θ)
        const p: Vec2 = {
          x: center.x + dx * cosθ - dy * sinθ,
          y: center.y + dx * sinθ + dy * cosθ,
        }
        const h = lerpAngle(inB, outB, frac)
        t += dt
        push(h, p)
      }

      // Exit tangent: dTan past wp along outBearing.
      const outVec = headingVec(outB)
      prevExit = {
        x: wp.position.x + outVec.x * c.dTan,
        y: wp.position.y + outVec.y * c.dTan,
      }
    } else {
      // No arc: collinear, last waypoint, or tight U-turn fallback. For tight
      // U-turns we still need the heading to rotate, so pivot in place.
      if (i < N - 1 && c.alphaDeg >= COLLINEAR_DEG) {
        pivotInPlace(wp.position, inB, bearings[i + 1]!)
      }
      prevExit = wp.position
    }
  }

  return {
    boatId: boat.id,
    frames,
    waypointTimes,
    naturalDurationSec: frames.at(-1)!.time,
  }
}

/**
 * Append straight-ahead sailing frames so a boat keeps moving until the clip's
 * overall duration. This guarantees no boat freezes mid-playback while another
 * is still under way.
 */
function extendRouteToDuration(route: BoatRoute, scene: SceneState, clipDurationSec: number): void {
  const last = route.frames.at(-1)!
  if (last.time >= clipDurationSec - 1e-6) return

  const boat = scene.boats.find(b => b.id === route.boatId)!
  const heading = last.data.heading

  // Immobile boats (capsized / anchored / aground) hold position for the
  // remainder of the clip instead of drifting forward at the last heading.
  const immobile = (boat.condition ?? 'normal') !== 'normal'
  const speedMs = immobile ? 0 : legSpeedMs(heading, scene.wind.directionDeg)
  const remainingSec = clipDurationSec - last.time
  const v = headingVec(heading)
  const endPos: Vec2 = {
    x: last.data.position.x + v.x * speedMs * remainingSec,
    y: last.data.position.y + v.y * speedMs * remainingSec,
  }
  route.frames.push({
    time: clipDurationSec,
    data: { boatId: route.boatId, position: endPos, heading },
  })
}

function sampleBoatAt(frames: RouteFrame[], t: number): BoatKeyframeData {
  const last = frames.at(-1)!
  const clamped = Math.max(0, Math.min(t, last.time))
  let aIdx = 0
  for (let i = 0; i < frames.length - 1; i++) if (clamped >= frames[i]!.time) aIdx = i
  const a = frames[aIdx]!
  const b = frames[Math.min(aIdx + 1, frames.length - 1)]!
  const seg = b.time - a.time
  const raw = seg === 0 ? 0 : (clamped - a.time) / seg
  return {
    boatId: a.data.boatId,
    position: lerpVec2(a.data.position, b.data.position, raw),
    heading: lerpAngle(a.data.heading, b.data.heading, raw),
  }
}

/**
 * Build a playback clip for the given scene where every boat moves continuously
 * for the entire duration of the clip. Boats with waypoints follow them; boats
 * without waypoints sail straight ahead. Routes shorter than the longest one
 * are extended by continuing forward at the last heading.
 */
export function buildScenarioPlayback(
  scene: SceneState,
  opts: BuildPlaybackOptions = {},
): ScenarioPlayback {
  const minDuration = opts.minDurationSec ?? 0
  const loop = opts.loop ?? false
  const waypoints = scene.waypoints ?? []

  const routes: BoatRoute[] = scene.boats.map(b =>
    buildBoatRoute(b, waypoints, scene.wind.directionDeg),
  )

  const naturalMax = routes.reduce((m, r) => Math.max(m, r.naturalDurationSec), 0)
  const durationSec = Math.max(naturalMax, minDuration)

  for (const route of routes) {
    extendRouteToDuration(route, scene, durationSec)
  }

  // Build keyframes at the union of all per-boat frame times so each keyframe
  // contains every boat. (GameCanvas interpolates per-boat between keyframes.)
  const allTimes = new Set<number>()
  for (const r of routes) for (const f of r.frames) allTimes.add(f.time)
  if (durationSec > 0) allTimes.add(0)
  if (durationSec > 0) allTimes.add(durationSec)
  const sortedTimes = [...allTimes].sort((a, b) => a - b)

  const keyframes: AnimationKeyframe[] = sortedTimes.map(t => ({
    time: t,
    boats: routes.map(r => sampleBoatAt(r.frames, t)),
  }))

  const bookmarkSet = new Set<number>([0, durationSec])
  for (const r of routes) for (const wpt of r.waypointTimes) bookmarkSet.add(wpt)
  const bookmarks = [...bookmarkSet].sort((a, b) => a - b)

  return {
    clip: { keyframes, durationSec, loop },
    routes,
    bookmarks,
  }
}

/**
 * Returns true if going from scene `prev` to scene `next` invalidates a
 * pre-built playback path. Used by the whiteboard to stop active playback
 * the moment any path-affecting field of the scene changes (boat moves,
 * waypoint drag, wind shift, etc.). Display-only changes (label/wake/grid
 * toggles) don't affect the path and return false.
 *
 * Relies on the page's spread-mutation pattern: any path-relevant change
 * produces a new sub-object reference (e.g. `{ ...scene, boats: [...] }`),
 * so reference inequality on the relevant sub-fields is sufficient.
 */
export function isPlaybackPathInvalidated(prev: SceneState, next: SceneState): boolean {
  if (prev === next) return false
  if (prev.boats !== next.boats) return true
  if (prev.marks !== next.marks) return true
  if ((prev.waypoints ?? null) !== (next.waypoints ?? null)) return true
  if (prev.wind !== next.wind) return true
  if (prev.worldSize !== next.worldSize) return true
  return false
}

/**
 * Sample the scene at time `t` on the given clip. Mirrors the per-boat lerp
 * logic in GameCanvas so off-screen rule evaluation matches what the user sees.
 */
export function sampleSceneAt(base: SceneState, clip: AnimationClip, t: number): SceneState {
  const frames = clip.keyframes
  if (frames.length === 0) return base

  const clampedT = Math.max(0, Math.min(t, frames.at(-1)!.time))

  let aIdx = 0
  for (let i = 0; i < frames.length - 1; i++) {
    if (clampedT >= frames[i]!.time) aIdx = i
  }
  const a = frames[aIdx]!
  const b = frames[Math.min(aIdx + 1, frames.length - 1)]!

  const segDur = b.time - a.time
  const raw = segDur === 0 ? 0 : (clampedT - a.time) / segDur
  const eased = clip.easing ? clip.easing(raw) : raw

  const bMap = new Map(b.boats.map(bd => [bd.boatId, bd]))
  const boats = base.boats.map(boat => {
    const aData = a.boats.find(bd => bd.boatId === boat.id)
    const bData = bMap.get(boat.id)
    if (!aData || !bData) return boat
    return {
      ...boat,
      position: lerpVec2(aData.position, bData.position, eased),
      heading: lerpAngle(aData.heading, bData.heading, eased),
    }
  })

  return { ...base, boats }
}
