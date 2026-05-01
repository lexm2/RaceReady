import type { RuleScenario, Rule12Params } from '../types.ts'
import type { BoatState, SceneState, AnimationKeyframe } from '$lib/canvas/types.ts'
import {
  DEFAULT_WORLD,
  DEFAULT_WIND_DIR_DEG,
  DEFAULT_WIND_SPEED_KNOTS,
  wrapClip,
  deriveTack,
  headingToVector,
  normalize360,
  KNOT_TO_MS,
  advancePoint,
} from './utils.ts'

/**
 * Rule 12 — Same Tack, Not Overlapped: boat clear astern keeps clear of
 * boat clear ahead. The trailing boat is overtaking faster, closing the gap.
 */
export function generateRule12Scenario(params: Rule12Params = {}): RuleScenario {
  const wind = params.windDirDeg ?? DEFAULT_WIND_DIR_DEG
  const world = params.worldSize ?? DEFAULT_WORLD
  const baseSpeed = params.speedKnots ?? 5
  const tack = params.tack ?? 'starboard'
  const duration = params.durationSec ?? 7
  const asternDist = params.asternDistanceM ?? 30
  const speedMul = params.asternSpeedMul ?? 1.4

  // Beam reach by default (more visually distinct than close-hauled chase).
  const heading = normalize360(
    params.headingDeg ?? (tack === 'starboard' ? wind - 90 : wind + 90),
  )

  const boatAId = params.boatAId ?? 'boat-ahead'
  const boatBId = params.boatBId ?? 'boat-astern'

  // Ahead boat near center of world; astern boat behind it along the heading.
  const aheadStart = { x: world.x / 2, y: world.y / 2 }
  const fwd = headingToVector(heading)
  const asternStart = {
    x: aheadStart.x - fwd.x * asternDist,
    y: aheadStart.y - fwd.y * asternDist,
  }

  const aheadSpeed = baseSpeed
  const asternSpeed = baseSpeed * speedMul

  const boats: BoatState[] = [
    {
      id: boatAId,
      position: aheadStart,
      heading,
      tack: deriveTack(heading, wind),
      speed: aheadSpeed,
      hullColor: 'blue',
      sailColor: 'white',
      label: 'Ahead',
      isPlayer: false,
    },
    {
      id: boatBId,
      position: asternStart,
      heading,
      tack: deriveTack(heading, wind),
      speed: asternSpeed,
      hullColor: 'red',
      sailColor: 'maize',
      label: 'Astern',
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

  const keyframes: AnimationKeyframe[] = [
    {
      time: 0,
      boats: [
        { boatId: boatAId, position: aheadStart, heading },
        { boatId: boatBId, position: asternStart, heading },
      ],
    },
    {
      time: duration,
      boats: [
        {
          boatId: boatAId,
          position: advancePoint(aheadStart, heading, aheadSpeed * KNOT_TO_MS * duration),
          heading,
        },
        {
          boatId: boatBId,
          position: advancePoint(asternStart, heading, asternSpeed * KNOT_TO_MS * duration),
          heading,
        },
      ],
    },
  ]

  return {
    id: `r12-${tack}-w${Math.round(wind)}`,
    title: 'Overtaking on the Same Tack',
    questionText: 'A trailing boat is overtaking. Click the boat that must keep clear.',
    questionType: 'who_must_keep_clear',
    primaryRuleId: 'rule_12',
    scene,
    animation: wrapClip(keyframes, duration, true),
    answer: {
      boatId: boatBId,
      explanation: 'The boats are on the same tack but not overlapped. Under Rule 12, a boat clear astern keeps clear of a boat clear ahead. The trailing boat must keep clear until she establishes an overlap (then Rule 11 takes over, with Rule 17 limits if she overlaps from clear astern within two hull lengths).',
      ruleRef: 'rule_12',
    },
    difficulty: 'beginner',
    tags: ['same-tack', 'overtaking'],
  }
}
