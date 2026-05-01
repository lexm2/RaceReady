// ─── Primitives ───────────────────────────────────────────────────────────────

/** 2-D vector in world-space (metres) or screen-space (px). */
export interface Vec2 {
  x: number
  y: number
}

// ─── Domain ───────────────────────────────────────────────────────────────────

export type Tack = 'port' | 'starboard'

/**
 * Accepts U-M palette aliases ('maize', 'blue', …) or any raw CSS hex string.
 * Resolved to hex by resolveColor() in boat.ts.
 */
export type ColorValue =
  | 'maize'
  | 'blue'
  | 'arboretum'
  | 'orange'
  | 'teal'
  | 'red'
  | 'white'
  | string

export interface BoatState {
  id: string
  position: Vec2
  /** Degrees, 0 = pointing up (north), increases clockwise. */
  heading: number
  tack: Tack
  /** Knots - used only to scale wake intensity. */
  speed: number
  hullColor: ColorValue
  sailColor: ColorValue
  label: string
  isPlayer: boolean
}

export type MarkType = 'buoy' | 'committee_boat' | 'pin_end' | 'gate_buoy'
export type MarkSide = 'port' | 'starboard' | 'none'

export interface Mark {
  id: string
  position: Vec2
  type: MarkType
  side: MarkSide
  label?: string
  /** Links two gate_buoy marks so a line is drawn between them. */
  gateId?: string
}

export interface WindState {
  /** Compass bearing the wind blows FROM. 0 = north, increases clockwise. */
  directionDeg: number
  speedKnots?: number
}

export interface DisplayToggles {
  showLabels: boolean
  showWake: boolean
  showWindStreaks: boolean
  showWindIndicator: boolean
  /** Whiteboard mode - draws a world-space grid. */
  showGrid: boolean
  /** Optional compass rose overlay (currently no-op renderer; kept for forward-compat). */
  showCompassRose?: boolean
}

// ─── Rule evaluation ──────────────────────────────────────────────────────────

export type RuleSeverity = 'advisory' | 'warning' | 'violation'

export interface RuleViolation {
  /** Encoded rule id, e.g. 'rule_10'. */
  ruleId: string
  /** Boat that must keep clear (the one drawn with a warning ring). */
  violatorBoatId: string
  /** Boat that has right of way, if applicable. */
  rightOfWayBoatId?: string
  /**
   * Severity: 'advisory' = rule applies, ample room.
   *           'warning' = boats getting close.
   *           'violation' = collision-imminent / contact.
   */
  severity: RuleSeverity
  description: string
}

/** Pure function: scene → list of currently-active rule situations. */
export type RuleEvaluator = (scene: SceneState) => RuleViolation[]

export interface Waypoint {
  id: string
  position: Vec2
  /** Which boat this waypoint belongs to. */
  boatId: string
  /** Sequence index within this boat's route (0 = first). */
  order: number
}

export interface SceneState {
  boats: BoatState[]
  marks: Mark[]
  wind: WindState
  /** Total world extent in metres; origin is top-left. */
  worldSize: Vec2
  display: DisplayToggles
  /** Mark IDs defining course legs; renderer draws dashed lines between them. */
  courseLegs?: Array<{ from: string; to: string }>
  /** Ordered waypoints for boat route planning. */
  waypoints?: Waypoint[]
}

// ─── Camera ───────────────────────────────────────────────────────────────────

export interface Camera {
  /** World-space point displayed at the centre of the canvas. */
  center: Vec2
  /** Physical pixels per metre. Default 8. */
  zoom: number
}

// ─── Animation ────────────────────────────────────────────────────────────────

export interface BoatKeyframeData {
  boatId: string
  position: Vec2
  heading: number
}

export interface AnimationKeyframe {
  /** Seconds from animation start. */
  time: number
  boats: BoatKeyframeData[]
}

/** t ∈ [0, 1] → eased t ∈ [0, 1] */
export type EasingFn = (t: number) => number

export interface AnimationClip {
  keyframes: AnimationKeyframe[]
  durationSec: number
  loop: boolean
  /** Applied per segment. Defaults to linear if omitted. */
  easing?: EasingFn
}

/** Internal playback state - owned by GameCanvas, not exposed to callers. */
export interface AnimationPlayback {
  clip: AnimationClip
  playing: boolean
  currentTime: number
  startWallTime: number
}

// ─── Render context ───────────────────────────────────────────────────────────

/**
 * Passed by value to every draw function.
 * Renderer modules must NOT mutate scene or camera.
 */
export interface RenderContext {
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  scene: SceneState
  camera: Camera
  dpr: number
  /** DOMHighResTimeStamp from requestAnimationFrame. */
  timestamp: number
  /** Seconds into the current animation clip (0 when no clip is active). */
  animTime: number
  /** ID of the currently selected boat - renderer draws selection ring + handle. */
  selectedBoatId?: string
  /** Active rule violations / advisories - renderer draws warning rings. */
  violations?: RuleViolation[]
}

// ─── Component props ──────────────────────────────────────────────────────────

export interface GameCanvasProps {
  scene: SceneState
  /** If omitted, camera auto-fits to worldSize with 88% fill. */
  camera?: Camera
  animation?: AnimationClip
  /** Playback speed multiplier for animation (default 1, max 10). */
  animationSpeed?: number
  /** Pauses animation advancement without clearing the clip. */
  animationPaused?: boolean
  /** Enables drag and click interaction (used by Whiteboard). */
  interactive?: boolean
  onBoatClick?: (boatId: string) => void
  onMarkClick?: (markId: string) => void
  /** Fires on every mousemove while dragging a boat. Parent updates scene state. */
  onBoatDrag?: (boatId: string, pos: Vec2) => void
  /** Fires on every mousemove while dragging a mark. Parent updates scene state. */
  onMarkDrag?: (markId: string, pos: Vec2) => void
  onBackgroundClick?: (worldPos: Vec2) => void
  /** ID of the boat currently selected (shows rotation ring + handle). */
  selectedBoatId?: string
  /** Fired when the user drags the rotation handle. New heading in degrees [0, 360). */
  onBoatRotate?: (boatId: string, heading: number) => void
  onWaypointDrag?: (waypointId: string, pos: Vec2) => void
  onCanvasContextMenu?: (worldPos: Vec2) => void
  /** Optional rule evaluator run on each interpolated frame. */
  ruleEvaluator?: RuleEvaluator
  /** Fires when the violation list changes (added/removed/severity). */
  onViolationsChanged?: (violations: RuleViolation[]) => void
  /** Fires every frame with the interpolated scene + animation time. */
  onFrameUpdate?: (scene: SceneState, animTime: number) => void
  /**
   * Bindable: current playback time in seconds (0..durationSec).
   * Canvas writes the advancing time each frame; parent may write to seek.
   */
  animationTime?: number
  class?: string
}
