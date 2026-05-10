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
  id: 'boat-a', position: { x: 158, y: 120 }, heading: 315,
  speed: 6, hullColor: 'maize', sailColor: 'blue', label: 'Boat A', isPlayer: true,
  ...over,
})
const B = (over: Partial<BoatState> = {}): BoatState => ({
  id: 'boat-b', position: { x: 142, y: 120 }, heading: 45,
  speed: 5, hullColor: 'orange', sailColor: 'white', label: 'Boat B', isPlayer: false,
  ...over,
})

const wp = (id: string, boatId: string, x: number, y: number, order: number): Waypoint =>
  ({ id, boatId, position: { x, y }, order })

export const PRESETS: WhiteboardPreset[] = [
  {
    id: 'rule_10', ruleId: 'rule_10',
    title: 'Port / Starboard',
    summary: 'Two boats converge on opposite tacks toward the windward mark.',
    hint: 'Press play. Boat A (starboard) and Boat B (port) close-haul toward the windward mark from opposite sides. As they cross within 40 m, the port-starboard rule fires on Boat B — port-tack must keep clear.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 220, y: 180 }, heading: 315 }),
        B({ position: {  x: 80, y: 200 }, heading:  45 }),
      ],
      waypoints: [
        wp('wp-r10-a-1', 'boat-a', 140, 100, 0),
        wp('wp-r10-b-1', 'boat-b', 160, 120, 0),
      ],
    },
    autoPlay: true,
  },
  {
    id: 'rule_11', ruleId: 'rule_11',
    title: 'Same Tack, Windward Keeps Clear',
    summary: 'Faster boat closes onto the leeward overlap of a slower boat ahead.',
    hint: 'Press play. Boat B (beam reach) closes on Boat A from astern and slides into a leeward overlap. Once they overlap within 40 m, the windward-keeps-clear rule fires on Boat A.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 170, y:  80 }, heading: 315 }),
        B({ position: { x: 152, y:  97 }, heading: 315 }),
      ],
      waypoints: [
        wp('wp-r11-a-1', 'boat-a', 130, 40, 0),
        wp('wp-r11-b-1', 'boat-b', 112, 57, 0),
      ],
    },
    autoPlay: true,
  },
  {
    id: 'rule_12', ruleId: 'rule_12',
    title: 'Same Tack, Clear Astern',
    summary: 'Trailing boat catches up on a slower boat ahead, both same tack.',
    hint: 'Press play. Boat A (beam reach) closes on Boat B (close-hauled) from astern. As A pulls within 40 m while still clear astern, the clear-astern rule fires on A.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x:  60, y:  80 }, heading: 45 }),
        B({ position: { x:  80, y:  60 }, heading: 45 }),
      ],
      waypoints: [
        wp('wp-r12-a-1', 'boat-a', 120, 20, 0),
        wp('wp-r12-b-1', 'boat-b', 140,  0, 0),
      ],
    },
    autoPlay: true,
  },
  {
    id: 'rule_13', ruleId: 'rule_13',
    title: 'While Tacking',
    summary: 'Boat tacks across head-to-wind while another approaches on a tack.',
    hint: 'Press play. Boat A is on starboard close-hauled, then tacks to port at the first waypoint. While A is mid-tack in the no-go zone, Boat B is on a tack within 40 m — the while-tacking rule fires on A.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 160, y: 110 }, heading: 315 }),
        B({ position: {  x: 90, y: 100 }, heading:  76 }),
      ],
      waypoints: [
        wp('wp-r13-a-1', 'boat-a', 155, 105, 0),
        wp('wp-r13-a-2', 'boat-a', 175,  80, 1),
        wp('wp-r13-a-3', 'boat-a', 215,  60, 2),
        wp('wp-r13-b-1', 'boat-b', 170,  80, 0),
      ],
    },
    autoPlay: true,
  },
  {
    id: 'rule_14', ruleId: 'rule_14',
    title: 'Avoiding Contact',
    summary: 'Two boats on a converging course must avoid contact.',
    hint: 'Press play. Both boats close-haul on opposite tacks toward the same point. As they close within 6 m, the avoiding-contact rule fires on both - neither may rely on right of way to allow contact.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 168, y: 130 }, heading: 310 }),
        B({ position: { x: 132, y: 130 }, heading:  50 }),
      ],
      waypoints: [
        wp('wp-r14-a-1', 'boat-a',  91,  77, 0),
        wp('wp-r14-b-1', 'boat-b', 209,  77, 0),
      ],
    },
    autoPlay: true,
  },
  {
    id: 'rule_15', ruleId: 'rule_15',
    title: 'Acquiring Right of Way',
    summary: 'A boat just gained right of way and must give the other boat room.',
    hint: 'Press play. Boat B starts clear astern on a faster reach and slides into a leeward overlap. Watch the keep-clear flip from B to A as B acquires right of way.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 150, y: 120 }, heading: 315 }),
        B({ position: { x: 155, y: 130 }, heading: 270, speed: 7 }),
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
    title: 'Changing Course',
    summary: 'Right-of-way boat changing course must give room to keep clear.',
    hint: 'Press play. Boat A (starboard, ROW) sails close-hauled, then sharply heads down at the first waypoint. The right-of-way boat must give Boat B room while changing course.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 140, y: 130 }, heading: 315 }),
        B({ position: { x: 155, y: 145 }, heading: 315 }),
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
    title: 'Proper Course',
    summary: 'Leeward boat luffs above proper course while overlapped.',
    hint: 'Press play. Both boats pinch above close-hauled on starboard. Boat B (leeward) closes laterally onto Boat A; once they overlap within two hull-lengths, the proper-course rule fires on B.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 170, y:  80 }, heading: 320 }),
        B({ position: { x: 163, y:  87 }, heading: 320 }),
      ],
      waypoints: [
        wp('wp-r17-a-1', 'boat-a', 130,  32, 0),
        wp('wp-r17-b-1', 'boat-b', 123,  39, 0),
      ],
    },
    autoPlay: true,
  },
  {
    id: 'rule_18', ruleId: 'rule_18',
    title: 'Mark Room',
    summary: 'Two boats round the windward mark; outside must give room.',
    hint: 'Press play. Both boats sail toward mark-1 on the same tack. Once both enter the 30 m zone overlapped, the mark-room rule fires on the outside boat — give the inside boat room.',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 210, y: 110 }, heading: 315 }),
        B({ position: { x: 180, y:  90 }, heading: 315 }),
      ],
      waypoints: [
        wp('wp-r18-a-1', 'boat-a', 130,  30, 0),
        wp('wp-r18-b-1', 'boat-b', 110,  20, 0),
      ],
    },
    autoPlay: true,
  },
  {
    id: 'rule_19', ruleId: 'rule_19',
    title: 'Room at an Obstruction',
    summary: 'Two boats overlapped beam-reach past an anchored committee boat.',
    hint: 'Press play. Both boats sail west on starboard tack, overlapped, toward an anchored committee boat. Once both pass within 20 m of the obstruction, the room-at-an-obstruction rule fires on the outside boat - it must give the inside boat room to pass safely.',
    scene: {
      ...baseScene,
      marks: [
        ...baseScene.marks,
        { id: 'obstruction', position: { x: 150, y: 110 }, type: 'committee_boat', side: 'none', label: 'Obstruction' },
      ],
      boats: [
        A({ position: { x: 230, y: 105 }, heading: 270 }),
        B({ position: { x: 230, y: 125 }, heading: 270 }),
      ],
      waypoints: [
        wp('wp-r19-a-1', 'boat-a', 70, 105, 0),
        wp('wp-r19-b-1', 'boat-b', 70, 125, 0),
      ],
    },
    autoPlay: true,
  },
  {
    id: 'rule_22', ruleId: 'rule_22',
    title: 'Capsized / Anchored / Aground',
    summary: 'A boat sails toward a capsized boat that has absolute right of way.',
    hint: 'Press play. Boat A close-hauls toward Boat B, which has capsized in the middle of the course. Once A pulls within 40 m, the capsized-boat rule fires on A (overrides all other rules).',
    scene: {
      ...baseScene,
      boats: [
        A({ position: { x: 220, y: 170 }, heading: 315 }),
        B({ position: { x: 130, y:  80 }, heading:   0, condition: 'capsized' }),
      ],
      waypoints: [
        wp('wp-r22-a-1', 'boat-a', 130, 80, 0),
      ],
    },
    autoPlay: true,
  },
]

export const PRESETS_BY_ID: Record<string, WhiteboardPreset> = Object.fromEntries(
  PRESETS.map(p => [p.id, p]),
)
