import { describe, expect, it } from 'vitest'
import type { BoatState, Mark, SceneState, Waypoint } from '../canvas/types.ts'
import { isPlaybackPathInvalidated } from '../canvas/scenarioPlayback.ts'

function makeScene(): SceneState {
  const boats: BoatState[] = [{
    id: 'boat-a',
    position: { x: 100, y: 100 },
    heading: 0,
    tack: 'starboard',
    speed: 5,
    hullColor: 'maize',
    sailColor: 'blue',
    label: 'Boat A',
    isPlayer: true,
  }]
  const marks: Mark[] = [
    { id: 'mark-1', position: { x: 150, y: 50 }, type: 'buoy', side: 'port' },
  ]
  const waypoints: Waypoint[] = [
    { id: 'wp-1', boatId: 'boat-a', order: 0, position: { x: 150, y: 80 } },
  ]
  return {
    worldSize: { x: 300, y: 220 },
    wind: { directionDeg: 0, speedKnots: 10 },
    boats,
    marks,
    waypoints,
    display: {
      showLabels: true,
      showWake: true,
      showWindStreaks: true,
      showWindIndicator: true,
      showGrid: true,
    },
  }
}

describe('isPlaybackPathInvalidated', () => {
  it('returns false when the scene reference is unchanged', () => {
    const a = makeScene()
    expect(isPlaybackPathInvalidated(a, a)).toBe(false)
  })

  it('returns true when a boat position changes', () => {
    const a = makeScene()
    const b: SceneState = {
      ...a,
      boats: a.boats.map(boat =>
        boat.id === 'boat-a' ? { ...boat, position: { x: 110, y: 100 } } : boat
      ),
    }
    expect(isPlaybackPathInvalidated(a, b)).toBe(true)
  })

  it('returns true when a boat heading changes', () => {
    const a = makeScene()
    const b: SceneState = {
      ...a,
      boats: a.boats.map(boat =>
        boat.id === 'boat-a' ? { ...boat, heading: 45 } : boat
      ),
    }
    expect(isPlaybackPathInvalidated(a, b)).toBe(true)
  })

  it('returns true when a boat is added', () => {
    const a = makeScene()
    const b: SceneState = {
      ...a,
      boats: [...a.boats, {
        id: 'boat-b',
        position: { x: 50, y: 50 },
        heading: 90,
        tack: 'port',
        speed: 4,
        hullColor: 'orange',
        sailColor: 'white',
        label: 'Boat B',
        isPlayer: false,
      }],
    }
    expect(isPlaybackPathInvalidated(a, b)).toBe(true)
  })

  it('returns true when a waypoint is moved', () => {
    const a = makeScene()
    const b: SceneState = {
      ...a,
      waypoints: (a.waypoints ?? []).map(w =>
        w.id === 'wp-1' ? { ...w, position: { x: 200, y: 80 } } : w
      ),
    }
    expect(isPlaybackPathInvalidated(a, b)).toBe(true)
  })

  it('returns true when a waypoint is added', () => {
    const a = makeScene()
    const b: SceneState = {
      ...a,
      waypoints: [...(a.waypoints ?? []), {
        id: 'wp-2', boatId: 'boat-a', order: 1, position: { x: 100, y: 50 },
      }],
    }
    expect(isPlaybackPathInvalidated(a, b)).toBe(true)
  })

  it('returns true when a waypoint is removed', () => {
    const a = makeScene()
    const b: SceneState = { ...a, waypoints: [] }
    expect(isPlaybackPathInvalidated(a, b)).toBe(true)
  })

  it('returns true when wind direction changes', () => {
    const a = makeScene()
    const b: SceneState = { ...a, wind: { ...a.wind, directionDeg: 45 } }
    expect(isPlaybackPathInvalidated(a, b)).toBe(true)
  })

  it('returns true when wind speed changes', () => {
    const a = makeScene()
    const b: SceneState = { ...a, wind: { ...a.wind, speedKnots: 15 } }
    expect(isPlaybackPathInvalidated(a, b)).toBe(true)
  })

  it('returns true when a mark is added (rules depend on marks)', () => {
    const a = makeScene()
    const b: SceneState = {
      ...a,
      marks: [...a.marks, { id: 'mark-2', position: { x: 50, y: 200 }, type: 'buoy', side: 'starboard' }],
    }
    expect(isPlaybackPathInvalidated(a, b)).toBe(true)
  })

  it('returns true when a mark is moved', () => {
    const a = makeScene()
    const b: SceneState = {
      ...a,
      marks: a.marks.map(m =>
        m.id === 'mark-1' ? { ...m, position: { x: 200, y: 50 } } : m
      ),
    }
    expect(isPlaybackPathInvalidated(a, b)).toBe(true)
  })

  it('returns false when only a display toggle changes', () => {
    const a = makeScene()
    const b: SceneState = {
      ...a,
      display: { ...a.display, showWake: !a.display.showWake },
    }
    expect(isPlaybackPathInvalidated(a, b)).toBe(false)
  })

  it('returns false when ALL display toggles change', () => {
    const a = makeScene()
    const b: SceneState = {
      ...a,
      display: {
        showLabels: false,
        showWake: false,
        showWindStreaks: false,
        showWindIndicator: false,
        showGrid: false,
      },
    }
    expect(isPlaybackPathInvalidated(a, b)).toBe(false)
  })

  it('returns true when the entire scene is replaced (e.g. preset load)', () => {
    const a = makeScene()
    const b = makeScene()  // structurally identical but every reference is new
    expect(isPlaybackPathInvalidated(a, b)).toBe(true)
  })
})
