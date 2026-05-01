import type {
  SceneState,
  AnimationClip,
  Vec2,
  Tack,
  BoatState,
  Mark,
} from '$lib/canvas/types.ts'

// ─── Rule ids encoded in code ─────────────────────────────────────────────────

export type EncodedRuleId =
  | 'rule_10'
  | 'rule_11'
  | 'rule_12'
  | 'rule_13'
  | 'rule_18'
  | 'rule_19'

// ─── Scenario shape consumed by games / whiteboard ────────────────────────────

export type QuestionType = 'who_must_keep_clear' | 'who_has_right_of_way'

export interface ScenarioAnswer {
  /** Boat id the user must click. */
  boatId: string
  /** Plain-English explanation shown after answering. */
  explanation: string
  /** Rule id (matches RULES_BY_ID in rulesIndex.ts) for loading the markdown. */
  ruleRef: EncodedRuleId
}

export interface RuleScenario {
  id: string
  title: string
  questionText: string
  questionType: QuestionType
  primaryRuleId: EncodedRuleId
  scene: SceneState
  animation: AnimationClip
  answer: ScenarioAnswer
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
}

// ─── Generator parameters (one interface per rule) ────────────────────────────

export interface CommonParams {
  windDirDeg?: number
  worldSize?: Vec2
  speedKnots?: number
  /** Anchor for the IDs — useful when composing scenarios. */
  boatAId?: string
  boatBId?: string
}

export interface Rule10Params extends CommonParams {
  /** World point where boats meet. Defaults to world center. */
  crossingPoint?: Vec2
  /** Seconds from t=0 until the crossing point is reached. */
  timeToConflictSec?: number
  /** Heading for port-tack boat (defaults to wind+135°, close-hauled port). */
  portHeadingDeg?: number
  /** Heading for starboard-tack boat (defaults to wind-135°, close-hauled stbd). */
  stbdHeadingDeg?: number
  /** Total animation duration. Defaults to timeToConflict + 2s overrun. */
  durationSec?: number
}

export interface Rule11Params extends CommonParams {
  tack?: Tack
  /** Heading for both boats (must be valid for the tack). */
  headingDeg?: number
  /** Lateral metres separating windward and leeward boats. */
  windwardLateralOffsetM?: number
  /** Forward/aft offset of windward boat relative to leeward boat. */
  windwardLongitudinalOffsetM?: number
  durationSec?: number
}

export interface Rule12Params extends CommonParams {
  tack?: Tack
  headingDeg?: number
  /** How far astern the trailing boat starts. */
  asternDistanceM?: number
  /** Speed multiplier of trailing boat (e.g. 1.3 = 30% faster, closing). */
  asternSpeedMul?: number
  durationSec?: number
}

export interface Rule13Params extends CommonParams {
  /** Heading the tacking boat is on at t=0 (close-hauled, pre-tack). */
  startHeadingDeg?: number
  /** Heading the tacking boat ends on (close-hauled, post-tack). */
  endHeadingDeg?: number
  /** Time the tacking boat begins its turn. */
  tackStartSec?: number
  /** Heading of the other (non-tacking) boat. */
  otherHeadingDeg?: number
  /** Crossing point in world coords. */
  crossingPoint?: Vec2
  durationSec?: number
}

export interface Rule18Params extends CommonParams {
  /** Mark position. Defaults to upper-third of world. */
  markPos?: Vec2
  /** Heading both boats are on as they approach the mark. */
  approachHeadingDeg?: number
  /** Lateral separation in metres. */
  separationM?: number
  /** Which side (relative to heading) is the inside boat? */
  insideSide?: 'left' | 'right'
  /** Time at which the inside boat reaches the mark. */
  timeToMarkSec?: number
  durationSec?: number
}

export interface Rule19Params extends CommonParams {
  /** Position of the obstruction (rendered as a buoy with no zone significance). */
  obstructionPos?: Vec2
  approachHeadingDeg?: number
  separationM?: number
  insideSide?: 'left' | 'right'
  timeToObstructionSec?: number
  durationSec?: number
}

// Re-exports for convenience
export type { SceneState, AnimationClip, Vec2, Tack, BoatState, Mark }
