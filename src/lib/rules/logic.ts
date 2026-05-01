import type {
  BoatState,
  Mark,
  WindState,
  SceneState,
  Tack,
  RuleViolation,
} from '$lib/canvas/types.ts'
import type { EncodedRuleId } from './types.ts'
import {
  headingToVector,
  deriveTack,
  distance,
  HULL_LENGTH_M,
  ZONE_RADIUS_M,
  normalize360,
} from './generator/utils.ts'

// ─── Geometry predicates ──────────────────────────────────────────────────────

/**
 * Boat A is "clear astern" of B when A's projected position along B's heading
 * is behind B's stern (negative).
 *
 * Simplified for point boats: project (A.pos - B.pos) onto B's heading vector;
 * if scalar projection < -HULL_LENGTH/2, A is clear astern of B.
 */
export function isClearAstern(astern: BoatState, ahead: BoatState): boolean {
  const vAhead = headingToVector(ahead.heading)
  const dx = astern.position.x - ahead.position.x
  const dy = astern.position.y - ahead.position.y
  const proj = dx * vAhead.x + dy * vAhead.y
  return proj < -HULL_LENGTH_M / 2
}

/** Two boats overlap when neither is clear astern of the other. */
export function isOverlapped(a: BoatState, b: BoatState): boolean {
  return !isClearAstern(a, b) && !isClearAstern(b, a)
}

/**
 * Returns true if `boat` is on the windward side of `other` (i.e. closer to
 * the wind source). Wind direction is the bearing wind blows FROM.
 */
export function isWindward(boat: BoatState, other: BoatState, wind: WindState): boolean {
  // Vector pointing toward the wind source (upwind direction)
  const upwind = headingToVector(wind.directionDeg)
  const dx = boat.position.x - other.position.x
  const dy = boat.position.y - other.position.y
  const proj = dx * upwind.x + dy * upwind.y
  return proj > 0
}

/** True if `boat` is within ZONE_RADIUS_M of the mark. */
export function isInZone(boat: BoatState, mark: Mark): boolean {
  return distance(boat.position, mark.position) <= ZONE_RADIUS_M
}

/** True if both boats are on the same tack (computed from heading + wind). */
export function isSameTack(a: BoatState, b: BoatState, wind: WindState): boolean {
  return deriveTack(a.heading, wind.directionDeg) === deriveTack(b.heading, wind.directionDeg)
}

/**
 * True if the boat is "while tacking": heading is within the no-go zone
 * (close-hauled-to-close-hauled across the wind).
 *
 * Approximated as: relative bearing of wind from bow is within ±45°.
 * (Real RRS Rule 13 uses "from head-to-wind until on close-hauled course".)
 */
export function isWhileTacking(boat: BoatState, wind: WindState): boolean {
  const rel = normalize360(wind.directionDeg - boat.heading)
  // "Close-hauled" is roughly ±45° off head-to-wind. While tacking = inside that arc.
  return rel < 45 || rel > 315
}

/**
 * Closest point of approach (CPA): minimum distance between two straight-line
 * trajectories of constant-heading constant-speed boats over a forward window.
 *
 * Returns: { tCpaSec, distanceM } — t may be negative or beyond windowSec
 * (meaning closest point is in the past or further future); the caller decides.
 */
export function closestPointOfApproach(
  a: BoatState,
  b: BoatState,
  speedKnotsA = 6,
  speedKnotsB = 6,
): { tCpaSec: number; distanceM: number } {
  const KNOT_TO_MS = 0.514444
  const va = headingToVector(a.heading)
  const vb = headingToVector(b.heading)
  const ax = va.x * speedKnotsA * KNOT_TO_MS
  const ay = va.y * speedKnotsA * KNOT_TO_MS
  const bx = vb.x * speedKnotsB * KNOT_TO_MS
  const by = vb.y * speedKnotsB * KNOT_TO_MS

  const dx0 = a.position.x - b.position.x
  const dy0 = a.position.y - b.position.y
  const dvx = ax - bx
  const dvy = ay - by

  const denom = dvx * dvx + dvy * dvy
  if (denom < 1e-9) {
    // Parallel courses
    return { tCpaSec: 0, distanceM: Math.hypot(dx0, dy0) }
  }
  const tCpa = -(dx0 * dvx + dy0 * dvy) / denom

  const dxAtT = dx0 + dvx * tCpa
  const dyAtT = dy0 + dvy * tCpa
  return { tCpaSec: tCpa, distanceM: Math.hypot(dxAtT, dyAtT) }
}

// ─── Rule application — pair-wise evaluators ──────────────────────────────────

/**
 * Returns the keep-clear boat id for the given pair under the given rule,
 * or null if the rule does not apply to this pair.
 */
export function applyRule10(a: BoatState, b: BoatState, wind: WindState): string | null {
  const tackA = deriveTack(a.heading, wind.directionDeg)
  const tackB = deriveTack(b.heading, wind.directionDeg)
  if (tackA === tackB) return null
  return tackA === 'port' ? a.id : b.id
}

export function applyRule11(a: BoatState, b: BoatState, wind: WindState): string | null {
  if (!isSameTack(a, b, wind)) return null
  if (!isOverlapped(a, b)) return null
  return isWindward(a, b, wind) ? a.id : b.id
}

export function applyRule12(a: BoatState, b: BoatState, wind: WindState): string | null {
  if (!isSameTack(a, b, wind)) return null
  if (isOverlapped(a, b)) return null
  // The boat clear astern keeps clear of the boat clear ahead.
  return isClearAstern(a, b) ? a.id : b.id
}

export function applyRule13(a: BoatState, b: BoatState, wind: WindState): string | null {
  const aTacking = isWhileTacking(a, wind)
  const bTacking = isWhileTacking(b, wind)
  if (aTacking && !bTacking) return a.id
  if (bTacking && !aTacking) return b.id
  return null
}

export function applyRule18(
  a: BoatState,
  b: BoatState,
  wind: WindState,
  marks: Mark[],
): { keepClearId: string; markId: string } | null {
  // Rule 18 applies when both boats are in the zone of the same mark and on
  // the same tack (simplified MVP — real rule has more nuances).
  for (const mark of marks) {
    if (mark.type !== 'buoy' && mark.type !== 'gate_buoy') continue
    if (!isInZone(a, mark) || !isInZone(b, mark)) continue
    if (!isSameTack(a, b, wind)) continue

    // The "outside" boat must give mark-room to the "inside" boat.
    // Inside boat = the one on the side of the mark closer to the next leg.
    // Approximation: inside = the boat whose perpendicular distance to the mark
    // along the across-track axis (perpendicular to heading) is smaller.
    const v = headingToVector(a.heading)
    // Perpendicular vector (right-hand side of heading)
    const perp = { x: -v.y, y: v.x }
    const aOff = (a.position.x - mark.position.x) * perp.x + (a.position.y - mark.position.y) * perp.y
    const bOff = (b.position.x - mark.position.x) * perp.x + (b.position.y - mark.position.y) * perp.y
    // The "inside" boat is the one closer to the mark on the perpendicular axis
    // (smaller |offset|). The outside boat must keep clear / give room.
    const insideId = Math.abs(aOff) < Math.abs(bOff) ? a.id : b.id
    const outsideId = insideId === a.id ? b.id : a.id
    return { keepClearId: outsideId, markId: mark.id }
  }
  return null
}

// ─── Per-frame evaluator ──────────────────────────────────────────────────────

const PROXIMITY_ADVISORY_M = 40   // rule applies, comfortable separation
const PROXIMITY_WARNING_M = 18    // boats getting close
const PROXIMITY_VIOLATION_M = 8   // collision-imminent

function severityFromDistance(distM: number): RuleViolation['severity'] | null {
  if (distM <= PROXIMITY_VIOLATION_M) return 'violation'
  if (distM <= PROXIMITY_WARNING_M) return 'warning'
  if (distM <= PROXIMITY_ADVISORY_M) return 'advisory'
  return null
}

const RULE_DESCRIPTIONS: Record<EncodedRuleId, string> = {
  rule_10: 'Port-tack boat must keep clear of starboard-tack boat',
  rule_11: 'Windward boat must keep clear of leeward boat (same tack, overlapped)',
  rule_12: 'Boat clear astern must keep clear of boat clear ahead (same tack)',
  rule_13: 'Boat tacking must keep clear of a boat on a tack',
  rule_18: 'Outside boat must give mark-room to inside overlapped boat',
  rule_19: 'Outside boat must give room to pass the obstruction',
}

/**
 * Evaluate the entire scene: returns the strongest applicable rule violation
 * for each pair of boats.
 */
export function evaluateScene(scene: SceneState): RuleViolation[] {
  const violations: RuleViolation[] = []
  const { boats, wind, marks } = scene

  for (let i = 0; i < boats.length; i++) {
    for (let j = i + 1; j < boats.length; j++) {
      const a = boats[i]!
      const b = boats[j]!
      const distM = distance(a.position, b.position)
      const sev = severityFromDistance(distM)
      if (!sev) continue

      // Try rules in priority order. Rule 18 / 13 take precedence over R10–12.
      let ruleId: EncodedRuleId | null = null
      let keepClearId: string | null = null
      let rightOfWayId: string | undefined

      const r18 = applyRule18(a, b, wind, marks)
      if (r18) {
        ruleId = 'rule_18'
        keepClearId = r18.keepClearId
        rightOfWayId = keepClearId === a.id ? b.id : a.id
      }

      if (!ruleId) {
        const r13 = applyRule13(a, b, wind)
        if (r13) {
          ruleId = 'rule_13'
          keepClearId = r13
          rightOfWayId = keepClearId === a.id ? b.id : a.id
        }
      }

      if (!ruleId) {
        const r10 = applyRule10(a, b, wind)
        if (r10) {
          ruleId = 'rule_10'
          keepClearId = r10
          rightOfWayId = keepClearId === a.id ? b.id : a.id
        }
      }

      if (!ruleId) {
        const r11 = applyRule11(a, b, wind)
        if (r11) {
          ruleId = 'rule_11'
          keepClearId = r11
          rightOfWayId = keepClearId === a.id ? b.id : a.id
        }
      }

      if (!ruleId) {
        const r12 = applyRule12(a, b, wind)
        if (r12) {
          ruleId = 'rule_12'
          keepClearId = r12
          rightOfWayId = keepClearId === a.id ? b.id : a.id
        }
      }

      if (!ruleId || !keepClearId) continue

      violations.push({
        ruleId,
        violatorBoatId: keepClearId,
        rightOfWayBoatId: rightOfWayId,
        severity: sev,
        description: RULE_DESCRIPTIONS[ruleId],
      })
    }
  }

  return violations
}

/**
 * Snapshot evaluation: returns the single most-applicable rule for the scene
 * (the strongest-severity violation, or null if none).
 */
export function dominantRule(scene: SceneState): RuleViolation | null {
  const all = evaluateScene(scene)
  if (all.length === 0) return null
  const order = { violation: 3, warning: 2, advisory: 1 } as const
  return all.sort((a, b) => order[b.severity] - order[a.severity])[0]!
}
