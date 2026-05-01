import type {
  Vec2,
  Tack,
  AnimationKeyframe,
  AnimationClip,
} from '$lib/canvas/types.ts'

/** 1 knot in metres-per-second. */
export const KNOT_TO_MS = 0.514444

/** Boat hull length in metres (matches renderer/boat.ts). */
export const HULL_LENGTH_M = 10

/** Mark zone radius (3 hull lengths per RRS Definitions). */
export const ZONE_RADIUS_M = 30

/**
 * Heading (compass-degrees, 0=N, increases clockwise) → unit direction vector.
 * Y axis is inverted in canvas coords (y increases downward).
 */
export function headingToVector(headingDeg: number): Vec2 {
  const rad = (headingDeg * Math.PI) / 180
  return { x: Math.sin(rad), y: -Math.cos(rad) }
}

/** Move `point` forward along `headingDeg` by `distM` metres. */
export function advancePoint(point: Vec2, headingDeg: number, distM: number): Vec2 {
  const v = headingToVector(headingDeg)
  return { x: point.x + v.x * distM, y: point.y + v.y * distM }
}

/** Move `point` backward along `headingDeg` by `distM` metres. */
export function retreatPoint(point: Vec2, headingDeg: number, distM: number): Vec2 {
  return advancePoint(point, headingDeg, -distM)
}

/**
 * Place a boat such that, sailing forward at `speedKnots` for `seconds`,
 * it arrives at `target`.
 */
export function startPosition(
  target: Vec2,
  headingDeg: number,
  speedKnots: number,
  seconds: number,
): Vec2 {
  const distM = speedKnots * KNOT_TO_MS * seconds
  return retreatPoint(target, headingDeg, distM)
}

/**
 * Derive tack from heading + wind-from direction.
 * Wind on starboard side (relBearing in 0..180) → starboard tack.
 * Wind on port side (relBearing in 180..360) → port tack.
 */
export function deriveTack(headingDeg: number, windFromDeg: number): Tack {
  const rel = ((windFromDeg - headingDeg) % 360 + 360) % 360
  return rel > 0 && rel < 180 ? 'starboard' : 'port'
}

/** Normalize an angle to [0, 360). */
export function normalize360(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/**
 * Build linear keyframes for straight-line motion of N boats.
 * Two keyframes (start + end) is sufficient because GameCanvas interpolates linearly.
 */
export function generateLinearKeyframes(
  boats: Array<{ id: string; startPos: Vec2; headingDeg: number; speedKnots: number }>,
  durationSec: number,
): AnimationKeyframe[] {
  const start: AnimationKeyframe = {
    time: 0,
    boats: boats.map(b => ({
      boatId: b.id,
      position: b.startPos,
      heading: b.headingDeg,
    })),
  }
  const end: AnimationKeyframe = {
    time: durationSec,
    boats: boats.map(b => {
      const distM = b.speedKnots * KNOT_TO_MS * durationSec
      return {
        boatId: b.id,
        position: advancePoint(b.startPos, b.headingDeg, distM),
        heading: b.headingDeg,
      }
    }),
  }
  return [start, end]
}

/**
 * Build keyframes for a tacking maneuver: one boat changes heading from
 * `startHeading` to `endHeading` over `tackDurationSec`, with reduced speed
 * during the turn. Other boats run straight-line.
 */
export function generateTackingKeyframes(opts: {
  durationSec: number
  /** Boat that is tacking. */
  tackingBoat: {
    id: string
    startPos: Vec2
    startHeadingDeg: number
    endHeadingDeg: number
    /** When the tack begins (seconds from t=0). */
    tackStartSec: number
    /** How long the tack takes. */
    tackDurationSec: number
    /** Pre-tack speed in knots. */
    speedKnots: number
    /** Speed-multiplier during the tack itself (typically ~0.3). */
    tackSpeedMul?: number
  }
  /** All other boats — straight line. */
  otherBoats: Array<{
    id: string
    startPos: Vec2
    headingDeg: number
    speedKnots: number
  }>
}): AnimationKeyframe[] {
  const { durationSec, tackingBoat: tb, otherBoats } = opts
  const tackEnd = tb.tackStartSec + tb.tackDurationSec
  const tackSpeedMul = tb.tackSpeedMul ?? 0.3

  // Sample the tacking boat at 0, tackStart, tackEnd, durationSec
  // Position advances at full speed before tack, reduced during tack, full after.
  function tbPosAt(t: number): Vec2 {
    let pos = tb.startPos
    const fullSpeedM = tb.speedKnots * KNOT_TO_MS
    const slowSpeedM = fullSpeedM * tackSpeedMul

    if (t <= tb.tackStartSec) {
      return advancePoint(pos, tb.startHeadingDeg, fullSpeedM * t)
    }
    pos = advancePoint(pos, tb.startHeadingDeg, fullSpeedM * tb.tackStartSec)

    if (t <= tackEnd) {
      // During the tack, treat motion as still along startHeading at slow speed
      // (boats lose VMG through the tack).
      return advancePoint(pos, tb.startHeadingDeg, slowSpeedM * (t - tb.tackStartSec))
    }
    pos = advancePoint(pos, tb.startHeadingDeg, slowSpeedM * tb.tackDurationSec)

    return advancePoint(pos, tb.endHeadingDeg, fullSpeedM * (t - tackEnd))
  }

  function tbHeadingAt(t: number): number {
    if (t <= tb.tackStartSec) return tb.startHeadingDeg
    if (t >= tackEnd) return tb.endHeadingDeg
    // Linear interpolation through the shortest path
    const r = (t - tb.tackStartSec) / tb.tackDurationSec
    let delta = tb.endHeadingDeg - tb.startHeadingDeg
    while (delta > 180) delta -= 360
    while (delta < -180) delta += 360
    return normalize360(tb.startHeadingDeg + delta * r)
  }

  const sampleTimes = [
    0,
    tb.tackStartSec,
    (tb.tackStartSec + tackEnd) / 2,
    tackEnd,
    durationSec,
  ].filter(t => t >= 0 && t <= durationSec)

  return sampleTimes.map(t => ({
    time: t,
    boats: [
      {
        boatId: tb.id,
        position: tbPosAt(t),
        heading: tbHeadingAt(t),
      },
      ...otherBoats.map(b => ({
        boatId: b.id,
        position: advancePoint(b.startPos, b.headingDeg, b.speedKnots * KNOT_TO_MS * t),
        heading: b.headingDeg,
      })),
    ],
  }))
}

/** Default world size for generated scenarios. */
export const DEFAULT_WORLD: Vec2 = { x: 200, y: 150 }

/** Default wind: from north, 12 knots. */
export const DEFAULT_WIND_DIR_DEG = 0
export const DEFAULT_WIND_SPEED_KNOTS = 12

/**
 * Wrap an animation duration in an AnimationClip with sensible defaults.
 */
export function wrapClip(
  keyframes: AnimationKeyframe[],
  durationSec: number,
  loop = true,
): AnimationClip {
  return { keyframes, durationSec, loop }
}

/**
 * Distance between two world points in metres.
 */
export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
