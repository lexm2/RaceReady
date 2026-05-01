import type { RuleScenario, Rule18Params } from '../types.ts'
import type { BoatState, SceneState, Mark } from '$lib/canvas/types.ts'
import {
  DEFAULT_WORLD,
  DEFAULT_WIND_DIR_DEG,
  DEFAULT_WIND_SPEED_KNOTS,
  startPosition,
  generateLinearKeyframes,
  wrapClip,
  deriveTack,
  headingToVector,
  normalize360,
} from './utils.ts'

/**
 * Rule 18 — Mark-Room: when boats are overlapped at the zone, the outside
 * boat must give the inside boat room to round the mark.
 *
 * Two boats approach a mark on the same tack, overlapped, with one inside.
 * The mark's zone (3 hull lengths) is rendered automatically by the mark renderer.
 */
export function generateRule18Scenario(params: Rule18Params = {}): RuleScenario {
  const wind = params.windDirDeg ?? DEFAULT_WIND_DIR_DEG
  const world = params.worldSize ?? DEFAULT_WORLD
  const speed = params.speedKnots ?? 5
  const duration = params.durationSec ?? 7
  const insideSide = params.insideSide ?? 'left'
  const sep = params.separationM ?? 14
  const tToM = params.timeToMarkSec ?? 5

  // Mark in the upper portion of the world; boats approach from below.
  const markPos = params.markPos ?? { x: world.x / 2, y: world.y * 0.3 }

  // Approach heading: by default, boats approach from south on starboard tack
  // (close reach toward the mark with N wind = heading ~340-345°).
  const approach = normalize360(params.approachHeadingDeg ?? wind - 20)

  const insideId = params.boatAId ?? 'boat-inside'
  const outsideId = params.boatBId ?? 'boat-outside'

  // The "inside" boat is the one closer to the mark on the across-track axis.
  // Perpendicular vector to the approach heading (left side if insideSide='left').
  const fwd = headingToVector(approach)
  const perpLeft = { x: -fwd.y, y: fwd.x }   // 90° left of heading (in canvas y-down coords)
  const perpRight = { x: fwd.y, y: -fwd.x }  // 90° right of heading
  const insidePerp = insideSide === 'left' ? perpLeft : perpRight
  const outsidePerp = insideSide === 'left' ? perpRight : perpLeft

  // Inside boat passes very close to the mark at tToM (offset by ~5m so it
  // doesn't sit on top of the mark).
  const insideTarget = {
    x: markPos.x + insidePerp.x * 5,
    y: markPos.y + insidePerp.y * 5,
  }
  const outsideTarget = {
    x: insideTarget.x + outsidePerp.x * sep,
    y: insideTarget.y + outsidePerp.y * sep,
  }

  const insideStart = startPosition(insideTarget, approach, speed, tToM)
  const outsideStart = startPosition(outsideTarget, approach, speed, tToM)

  const boats: BoatState[] = [
    {
      id: insideId,
      position: insideStart,
      heading: approach,
      tack: deriveTack(approach, wind),
      speed,
      hullColor: 'maize',
      sailColor: 'blue',
      label: 'Inside',
      isPlayer: false,
    },
    {
      id: outsideId,
      position: outsideStart,
      heading: approach,
      tack: deriveTack(approach, wind),
      speed,
      hullColor: 'orange',
      sailColor: 'white',
      label: 'Outside',
      isPlayer: false,
    },
  ]

  const marks: Mark[] = [
    {
      id: 'mark-1',
      position: markPos,
      type: 'buoy',
      side: 'port',
      label: '1',
    },
  ]

  const scene: SceneState = {
    worldSize: world,
    wind: { directionDeg: wind, speedKnots: DEFAULT_WIND_SPEED_KNOTS },
    marks,
    boats,
    display: {
      showLabels: true,
      showWake: true,
      showWindStreaks: true,
      showWindIndicator: true,
      showGrid: false,
    },
  }

  const keyframes = generateLinearKeyframes(
    [
      { id: insideId, startPos: insideStart, headingDeg: approach, speedKnots: speed },
      { id: outsideId, startPos: outsideStart, headingDeg: approach, speedKnots: speed },
    ],
    duration,
  )

  return {
    id: `r18-w${Math.round(wind)}-${insideSide}`,
    title: 'Mark-Room at the Zone',
    questionText: 'Two boats approach the mark, overlapped at the zone. Click the boat that must keep clear (give mark-room).',
    questionType: 'who_must_keep_clear',
    primaryRuleId: 'rule_18',
    scene,
    animation: wrapClip(keyframes, duration, true),
    answer: {
      boatId: outsideId,
      explanation: 'When boats are overlapped at the zone (3 hull lengths from the mark), the outside boat must give the inside overlapped boat mark-room — room to sail her proper course to and around the mark. The outside boat keeps clear.',
      ruleRef: 'rule_18',
    },
    difficulty: 'intermediate',
    tags: ['mark-rounding', 'zone'],
  }
}
