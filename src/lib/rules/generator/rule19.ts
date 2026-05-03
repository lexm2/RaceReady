import type { RuleScenario, Rule19Params } from '../types.ts'
import type { BoatState, SceneState, Mark } from '$lib/canvas/types.ts'
import {
  DEFAULT_WORLD,
  DEFAULT_WIND_DIR_DEG,
  DEFAULT_WIND_SPEED_KNOTS,
  startPosition,
  generateLinearKeyframes,
  wrapClip,
  headingToVector,
  normalize360,
} from './utils.ts'

/**
 * Room to pass an obstruction: when boats are overlapped passing an
 * obstruction, the outside boat gives the inside boat room.
 *
 * Two boats on the same tack, overlapped, approach an obstruction (rendered
 * as a committee-boat-style mark to indicate it's not a racing mark).
 */
export function generateRule19Scenario(params: Rule19Params = {}): RuleScenario {
  const wind = params.windDirDeg ?? DEFAULT_WIND_DIR_DEG
  const world = params.worldSize ?? DEFAULT_WORLD
  const speed = params.speedKnots ?? 5
  const duration = params.durationSec ?? 7
  const insideSide = params.insideSide ?? 'left'
  const sep = params.separationM ?? 14
  const tToO = params.timeToObstructionSec ?? 5

  const obstructionPos = params.obstructionPos ?? { x: world.x / 2, y: world.y * 0.35 }
  const approach = normalize360(params.approachHeadingDeg ?? wind - 90) // beam reach

  const insideId = params.boatAId ?? 'boat-inside'
  const outsideId = params.boatBId ?? 'boat-outside'

  const fwd = headingToVector(approach)
  const perpLeft = { x: -fwd.y, y: fwd.x }
  const perpRight = { x: fwd.y, y: -fwd.x }
  const insidePerp = insideSide === 'left' ? perpLeft : perpRight
  const outsidePerp = insideSide === 'left' ? perpRight : perpLeft

  const insideTarget = {
    x: obstructionPos.x + insidePerp.x * 6,
    y: obstructionPos.y + insidePerp.y * 6,
  }
  const outsideTarget = {
    x: insideTarget.x + outsidePerp.x * sep,
    y: insideTarget.y + outsidePerp.y * sep,
  }

  const insideStart = startPosition(insideTarget, approach, speed, tToO)
  const outsideStart = startPosition(outsideTarget, approach, speed, tToO)

  const boats: BoatState[] = [
    {
      id: insideId,
      position: insideStart,
      heading: approach,
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
      speed,
      hullColor: 'orange',
      sailColor: 'white',
      label: 'Outside',
      isPlayer: false,
    },
  ]

  const marks: Mark[] = [
    {
      id: 'obstruction',
      position: obstructionPos,
      type: 'committee_boat',
      side: 'none',
      label: 'Obstruction',
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
    id: `r19-w${Math.round(wind)}-${insideSide}`,
    title: 'Room at an Obstruction',
    questionText: 'Two boats overlapped pass an obstruction. Click the boat that must keep clear (give room).',
    questionType: 'who_must_keep_clear',
    primaryRuleId: 'rule_19',
    scene,
    animation: wrapClip(keyframes, duration, true),
    answer: {
      boatId: outsideId,
      explanation: 'When boats are overlapped passing an obstruction (here, a moored committee boat), Rule 19 requires the outside boat to give the inside boat room to pass the obstruction safely. The outside boat keeps clear.',
      ruleRef: 'rule_19',
    },
    difficulty: 'intermediate',
    tags: ['obstruction', 'room'],
  }
}
