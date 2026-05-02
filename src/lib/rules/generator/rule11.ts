import type { RuleScenario, Rule11Params } from '../types.ts'
import type { BoatState, SceneState } from '$lib/canvas/types.ts'
import {
  DEFAULT_WORLD,
  DEFAULT_WIND_DIR_DEG,
  DEFAULT_WIND_SPEED_KNOTS,
  generateLinearKeyframes,
  wrapClip,
  deriveTack,
  headingToVector,
  normalize360,
} from './utils.ts'

/**
 * Same tack, overlapped: windward boat keeps clear of leeward boat.
 *
 * Both boats sail the same heading, separated laterally so one is clearly
 * windward of the other.
 */
export function generateRule11Scenario(params: Rule11Params = {}): RuleScenario {
  const wind = params.windDirDeg ?? DEFAULT_WIND_DIR_DEG
  const world = params.worldSize ?? DEFAULT_WORLD
  const speed = params.speedKnots ?? 5.5
  const tack = params.tack ?? 'starboard'
  const duration = params.durationSec ?? 7
  const lateralOff = params.windwardLateralOffsetM ?? 16
  const longOff = params.windwardLongitudinalOffsetM ?? 4

  // Default close-hauled heading for the chosen tack.
  // Wind from N (0°): stbd close-hauled = 315° (NW); port close-hauled = 45° (NE).
  const heading = normalize360(
    params.headingDeg ?? (tack === 'starboard' ? wind - 45 : wind + 45),
  )

  const boatAId = params.boatAId ?? 'boat-leeward'
  const boatBId = params.boatBId ?? 'boat-windward'

  // Leeward boat anchor in the middle of the world.
  const leewardStart = { x: world.x / 2, y: world.y * 0.65 }

  // Upwind direction = unit vector toward the wind source.
  const upwind = headingToVector(wind)
  // Forward direction = the boat's heading vector (for fore/aft offset).
  const fwd = headingToVector(heading)

  const windwardStart = {
    x: leewardStart.x + upwind.x * lateralOff + fwd.x * longOff,
    y: leewardStart.y + upwind.y * lateralOff + fwd.y * longOff,
  }

  const boats: BoatState[] = [
    {
      id: boatAId,
      position: leewardStart,
      heading,
      tack: deriveTack(heading, wind),
      speed,
      hullColor: 'arboretum',
      sailColor: 'white',
      label: 'Leeward',
      isPlayer: false,
    },
    {
      id: boatBId,
      position: windwardStart,
      heading,
      tack: deriveTack(heading, wind),
      speed,
      hullColor: 'orange',
      sailColor: 'maize',
      label: 'Windward',
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

  const keyframes = generateLinearKeyframes(
    [
      { id: boatAId, startPos: leewardStart, headingDeg: heading, speedKnots: speed },
      { id: boatBId, startPos: windwardStart, headingDeg: heading, speedKnots: speed },
    ],
    duration,
  )

  return {
    id: `r11-${tack}-w${Math.round(wind)}`,
    title: 'Windward / Leeward Same Tack',
    questionText: 'Both boats are on the same tack and overlapped. Click the boat that must keep clear.',
    questionType: 'who_must_keep_clear',
    primaryRuleId: 'rule_11',
    scene,
    animation: wrapClip(keyframes, duration, true),
    answer: {
      boatId: boatBId,
      explanation: 'Both boats are on the same tack and overlapped. Under Rule 11, the windward boat must keep clear of the leeward boat. The leeward boat may sail her course (and even luff up to head-to-wind, subject to Rule 17).',
      ruleRef: 'rule_11',
    },
    difficulty: 'beginner',
    tags: [tack === 'starboard' ? 'upwind-stbd' : 'upwind-port', 'same-tack'],
  }
}
