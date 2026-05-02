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
const TURN_SPEED_MUL = 0.4          // boats slow to ~40% of leg speed during a turn
const MIN_LEG_SPEED_KNOTS = 0.3     // floor so no-go-zone legs still progress
const MIN_TURN_SPEED_MS = 0.2

interface RouteFrame {
  time: number
  data: BoatKeyframeData
}

export interface BoatRoute {
  boatId: string
  frames: RouteFrame[]
  /** Animation times where this boat hits a waypoint (used for skip-bookmarks). */
  waypointTimes: number[]
  /** Total time of the last keyframe — may be shorter than the clip's overall duration. */
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

/**
 * Build a continuous-motion route for a single boat. If the boat has waypoints,
 * follow them; if it doesn't, sail straight ahead at its current heading. The
 * returned `naturalDurationSec` is the time of the boat's last waypoint (or 0
 * if there are no waypoints).
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

  /**
   * Curve through a heading change instead of pivoting in place. Samples the
   * turn in small angular steps; at each step, the boat advances forward
   * along the mid-step heading at a reduced speed.
   */
  function rotate(pos: Vec2, fromH: number, toH: number): Vec2 {
    const turn = Math.abs(((toH - fromH + 540) % 360) - 180)
    if (turn < 1) return pos

    const turnDuration = turn / TURN_RATE_DEG_PER_S
    const turnSpeedMs = Math.max(boat.speed * KNOT_TO_MS * TURN_SPEED_MUL, MIN_TURN_SPEED_MS)
    const steps = Math.max(4, Math.ceil(turn / 10))
    const dt = turnDuration / steps
    const dDist = turnSpeedMs * dt

    let curPos = pos
    let curH = fromH
    for (let k = 1; k <= steps; k++) {
      const nextH = lerpAngle(fromH, toH, k / steps)
      const midH = lerpAngle(curH, nextH, 0.5)
      const v = headingVec(midH)
      curPos = { x: curPos.x + v.x * dDist, y: curPos.y + v.y * dDist }
      t += dt
      push(nextH, curPos)
      curH = nextH
    }
    return curPos
  }

  push(boat.heading, boat.position)

  if (wps.length === 0) {
    return { boatId: boat.id, frames, waypointTimes, naturalDurationSec: 0 }
  }

  const firstBearing = legBearing(boat.position, wps[0]!.position)
  let prevPos = rotate(boat.position, boat.heading, firstBearing)

  for (let i = 0; i < wps.length; i++) {
    const wp = wps[i]!
    const bearing = legBearing(prevPos, wp.position)
    const distM = Math.hypot(wp.position.x - prevPos.x, wp.position.y - prevPos.y)
    t += distM / legSpeedMs(bearing, windDirDeg)
    push(bearing, wp.position)
    waypointTimes.push(t)

    if (i < wps.length - 1) {
      const nextBearing = legBearing(wp.position, wps[i + 1]!.position)
      prevPos = rotate(wp.position, bearing, nextBearing)
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
  const speedMs = legSpeedMs(heading, scene.wind.directionDeg)
  const remainingSec = clipDurationSec - last.time
  const v = headingVec(heading)
  const endPos: Vec2 = {
    x: last.data.position.x + v.x * speedMs * remainingSec,
    y: last.data.position.y + v.y * speedMs * remainingSec,
  }
  // Suppress unused warning for boat — we only needed it to assert it exists.
  void boat
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
