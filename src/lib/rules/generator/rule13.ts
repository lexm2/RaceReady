import type { RuleScenario, Rule13Params } from '../types.ts'
import type { BoatState, SceneState } from '$lib/canvas/types.ts'
import {
  DEFAULT_WORLD,
  DEFAULT_WIND_DIR_DEG,
  DEFAULT_WIND_SPEED_KNOTS,
  startPosition,
  generateTackingKeyframes,
  wrapClip,
  normalize360,
} from './utils.ts'

/**
 * While tacking: a boat that is tacking (between head-to-wind and
 * close-hauled) keeps clear of a boat on a tack.
 *
 * One boat begins on starboard tack close-hauled, then tacks to port; another
 * boat is approaching on port tack. The tacking boat passes through head-to-wind
 * and is the keep-clear boat during the tack.
 */
export function generateRule13Scenario(params: Rule13Params = {}): RuleScenario {
  const wind = params.windDirDeg ?? DEFAULT_WIND_DIR_DEG
  const world = params.worldSize ?? DEFAULT_WORLD
  const speed = params.speedKnots ?? 5
  const duration = params.durationSec ?? 8
  const cross = params.crossingPoint ?? { x: world.x / 2, y: world.y * 0.45 }

  // Tacking boat: starboard close-hauled (NW with N wind) → port close-hauled (NE).
  const startHeading = normalize360(params.startHeadingDeg ?? wind - 45)
  const endHeading = normalize360(params.endHeadingDeg ?? wind + 45)
  const tackStartSec = params.tackStartSec ?? 3
  const tackDurationSec = 2

  // Other boat: also approaching close-hauled but on port tack from the SE.
  const otherHeading = normalize360(params.otherHeadingDeg ?? wind + 45)

  const tackingId = params.boatAId ?? 'boat-tacking'
  const otherId = params.boatBId ?? 'boat-other'

  // Tacking boat position so it reaches the crossing area at tackStartSec on starboard.
  const tackingStart = startPosition(cross, startHeading, speed, tackStartSec)
  // Other boat: place it so it arrives near the crossing at the time the tack ends.
  const tackEnd = tackStartSec + tackDurationSec
  const otherStart = startPosition(cross, otherHeading, speed, tackEnd + 0.5)

  const boats: BoatState[] = [
    {
      id: tackingId,
      position: tackingStart,
      heading: startHeading,
      speed,
      hullColor: 'maize',
      sailColor: 'blue',
      label: 'Tacking',
      isPlayer: false,
    },
    {
      id: otherId,
      position: otherStart,
      heading: otherHeading,
      speed,
      hullColor: 'arboretum',
      sailColor: 'white',
      label: 'On a Tack',
      isPlayer: false,
    },
  ]

  const scene: SceneState = {
    worldSize: world,
    wind: { directionDeg: wind, speedKnots: DEFAULT_WIND_SPEED_KNOTS },
    marks: [],
    boats,
    display: {
      showLabels: true,
      showWake: true,
      showWindStreaks: true,
      showWindIndicator: true,
      showGrid: false,
    },
  }

  const keyframes = generateTackingKeyframes({
    durationSec: duration,
    tackingBoat: {
      id: tackingId,
      startPos: tackingStart,
      startHeadingDeg: startHeading,
      endHeadingDeg: endHeading,
      tackStartSec,
      tackDurationSec,
      speedKnots: speed,
      tackSpeedMul: 0.25,
    },
    otherBoats: [
      { id: otherId, startPos: otherStart, headingDeg: otherHeading, speedKnots: speed },
    ],
  })

  return {
    id: `r13-w${Math.round(wind)}`,
    title: 'Tacking Near Another Boat',
    questionText: 'One boat is tacking through head-to-wind. Click the boat that must keep clear.',
    questionType: 'who_must_keep_clear',
    primaryRuleId: 'rule_13',
    scene,
    animation: wrapClip(keyframes, duration, true),
    answer: {
      boatId: tackingId,
      explanation: 'A boat that is tacking (from when she passes head-to-wind until she is on a close-hauled course) must keep clear of a boat on a tack. The tacking boat is on the while-tacking rule throughout that window, even if she would otherwise have right of way.',
      ruleRef: 'rule_13',
    },
    difficulty: 'intermediate',
    tags: ['tacking', 'upwind'],
  }
}
