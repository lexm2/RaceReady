import type { SceneState, BoatState, Waypoint } from '$lib/canvas/types.ts'
import type { EncodedRuleId } from '$lib/rules/types.ts'

export interface WhiteboardPreset {
  id: string
  ruleId: EncodedRuleId
  title: string
  summary: string
  hint: string
  scene: SceneState
  /** Auto-start the route animation on load (used for change-based rules 15/16). */
  autoPlay?: boolean
}

const baseScene: Omit<SceneState, 'boats' | 'waypoints'> = {
  worldSize: { x: 300, y: 220 },
  wind: { directionDeg: 0, speedKnots: 10 },
  marks: [
    { id: 'mark-1', position: { x: 150, y: 40  }, type: 'buoy', side: 'port',      label: '1' },
    { id: 'mark-2', position: { x: 150, y: 180 }, type: 'buoy', side: 'starboard', label: '2' },
  ],
  courseLegs: [{ from: 'mark-2', to: 'mark-1' }],
  display: {
    showLabels: true, showWake: true, showWindStreaks: true,
    showWindIndicator: true, showGrid: true,
  },
}

const A = (over: Partial<BoatState> = {}): BoatState => ({
  id: 'boat-a', position: { x: 158, y: 120 }, heading: 315, tack: 'starboard',
  speed: 6, hullColor: 'maize', sailColor: 'blue', label: 'Boat A', isPlayer: true,
  ...over,
})
const B = (over: Partial<BoatState> = {}): BoatState => ({
  id: 'boat-b', position: { x: 142, y: 120 }, heading: 45, tack: 'port',
  speed: 5, hullColor: 'orange', sailColor: 'white', label: 'Boat B', isPlayer: false,
  ...over,
})

const wp = (id: string, boatId: string, x: number, y: number, order: number): Waypoint =>
  ({ id, boatId, position: { x, y }, order })

export const PRESETS: WhiteboardPreset[] = [
  {
    id: 'rule_10', ruleId: 'rule_10',
    title: 'Rule 10 — Port / Starboard',
    summary: 'Two boats converging on opposite tacks.',
    hint: 'Boat B (port tack) must keep clear of Boat A (starboard).',
    scene: { ...baseScene, boats: [A(), B()], waypoints: [] },
  },
  {
    id: 'rule_11', ruleId: 'rule_11',
    title: 'Rule 11 — Same Tack, Windward Keeps Clear',
    summary: 'Two boats on the same tack, overlapped side-by-side.',
    hint: 'The windward boat (more upwind) must keep clear of the leeward boat.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 160, y: 100 }, heading: 315, tack: 'starboard' }),
        B({ position: { x: 155, y: 110 }, heading: 315, tack: 'starboard' }),
      ],
      waypoints: [],
    },
  },
  {
    id: 'rule_12', ruleId: 'rule_12',
    title: 'Rule 12 — Same Tack, Clear Astern',
    summary: 'Trailing boat must keep clear of the boat clear ahead.',
    hint: 'Boat A is clear astern of Boat B and must keep clear.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 160, y: 120 }, heading: 315, tack: 'starboard' }),
        B({ position: { x: 150, y: 110 }, heading: 315, tack: 'starboard' }),
      ],
      waypoints: [],
    },
  },
  {
    id: 'rule_13', ruleId: 'rule_13',
    title: 'Rule 13 — While Tacking',
    summary: 'A boat in the no-go zone must keep clear of a boat on a tack.',
    hint: 'Boat A is head-to-wind (tacking). It must keep clear of Boat B.',
    scene: {
      ...baseScene,
      boats: [A({ heading: 0, tack: 'starboard' }), B()],
      waypoints: [],
    },
  },
  {
    id: 'rule_14', ruleId: 'rule_14',
    title: 'Rule 14 — Avoiding Contact',
    summary: 'Both boats must avoid contact when collision is imminent.',
    hint: 'Boats are within 6 m. Both get a Rule 14 violation, plus the underlying Rule 10.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 153, y: 120 } }),
        B({ position: { x: 148, y: 120 } }),
      ],
      waypoints: [],
    },
  },
  {
    id: 'rule_15', ruleId: 'rule_15',
    title: 'Rule 15 — Acquiring Right of Way',
    summary: 'A boat just gained right of way and must give the other boat room.',
    hint: 'Press play. Boat B starts clear astern on a faster reach and slides into a leeward overlap. Watch the keep-clear flip from B to A — Rule 15 fires on B as it acquires right of way.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 150, y: 120 }, heading: 315, tack: 'starboard' }),
        B({ position: { x: 155, y: 130 }, heading: 270, tack: 'starboard', speed: 7 }),
      ],
      waypoints: [
        wp('wp-r15-a-1', 'boat-a', 130, 100, 0),
        wp('wp-r15-b-1', 'boat-b', 110, 110, 0),
      ],
    },
    autoPlay: true,
  },
  {
    id: 'rule_16', ruleId: 'rule_16',
    title: 'Rule 16 — Changing Course',
    summary: 'Right-of-way boat changing course must give room to keep clear.',
    hint: 'Press play. Boat A (starboard, ROW) sails close-hauled, then sharply heads down at the first waypoint. Rule 16 fires on A while it turns.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 140, y: 130 }, heading: 315, tack: 'starboard' }),
        B({ position: { x: 155, y: 145 }, heading: 315, tack: 'starboard' }),
      ],
      waypoints: [
        wp('wp-r16-a-1', 'boat-a', 130, 120, 0),
        wp('wp-r16-a-2', 'boat-a', 110, 115, 1),
      ],
    },
    autoPlay: true,
  },
  {
    id: 'rule_17', ruleId: 'rule_17',
    title: 'Rule 17 — Proper Course',
    summary: 'Leeward boat sailing above proper course while overlapped.',
    hint: 'Both pinching on starboard, overlapped. Boat B (leeward) is heading above close-hauled — Rule 17 advisory fires on B alongside Rule 11 on A.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 165, y: 95 },  heading: 350, tack: 'starboard' }),
        B({ position: { x: 150, y: 100 }, heading: 350, tack: 'starboard' }),
      ],
      waypoints: [],
    },
  },
  {
    id: 'rule_18', ruleId: 'rule_18',
    title: 'Rule 18 — Mark Room',
    summary: 'Outside boat must give mark-room to the inside overlapped boat.',
    hint: 'Both boats are within mark-1\'s zone. The outside boat (Boat A) must keep clear.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 140, y: 55 }, heading: 0, tack: 'starboard' }),
        B({ position: { x: 155, y: 55 }, heading: 0, tack: 'starboard' }),
      ],
      waypoints: [],
    },
  },
  {
    id: 'rule_22', ruleId: 'rule_22',
    title: 'Rule 22 — Capsized / Anchored / Aground',
    summary: 'A capsized boat has absolute right of way.',
    hint: 'Boat B is capsized. Boat A must keep clear under Rule 22 (overrides Rule 10).',
    scene: {
      ...baseScene,
      boats: [A(), B({ condition: 'capsized' })],
      waypoints: [],
    },
  },
]

export const PRESETS_BY_ID: Record<string, WhiteboardPreset> = Object.fromEntries(
  PRESETS.map(p => [p.id, p]),
)
