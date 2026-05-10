import { describe, expect, it } from 'vitest'
import type { BoatState, Mark, WindState } from '../canvas/types.ts'
import { applyRule19 } from '../rules/logic.ts'

const wind: WindState = { directionDeg: 0, speedKnots: 10 }

const obstruction: Mark = {
  id: 'obs',
  position: { x: 150, y: 110 },
  type: 'committee_boat',
  side: 'none',
}

function boat(o: {
  id: string
  position: { x: number; y: number }
  heading?: number
}): BoatState {
  return {
    id: o.id,
    position: o.position,
    heading: o.heading ?? 270,
    speed: 5,
    hullColor: 'maize',
    sailColor: 'blue',
    label: o.id,
    isPlayer: false,
  }
}

describe('applyRule19', () => {
  it('flags the outside boat when overlapped, same tack, within passing range', () => {
    // Heading 270 (west), wind from north → both on starboard tack.
    // Inside boat (A) is 5 m above the obstruction; outside boat (B) is 15 m below.
    const a = boat({ id: 'a', position: { x: 155, y: 105 } })
    const b = boat({ id: 'b', position: { x: 155, y: 125 } })
    expect(applyRule19(a, b, wind, [obstruction])).toEqual({
      keepClearId: 'b',
      obstructionId: 'obs',
    })
  })

  it('returns null when one boat is clear astern (not overlapped)', () => {
    const a = boat({ id: 'a', position: { x: 200, y: 105 } })
    const b = boat({ id: 'b', position: { x: 155, y: 125 } })
    expect(applyRule19(a, b, wind, [obstruction])).toBeNull()
  })

  it('returns null when boats are on opposite tacks', () => {
    const a = boat({ id: 'a', position: { x: 155, y: 105 }, heading: 270 })
    const b = boat({ id: 'b', position: { x: 155, y: 125 }, heading: 90 })
    expect(applyRule19(a, b, wind, [obstruction])).toBeNull()
  })

  it('returns null when no committee_boat mark is present', () => {
    const buoy: Mark = {
      id: 'm', position: { x: 150, y: 110 }, type: 'buoy', side: 'port',
    }
    const a = boat({ id: 'a', position: { x: 155, y: 105 } })
    const b = boat({ id: 'b', position: { x: 155, y: 125 } })
    expect(applyRule19(a, b, wind, [buoy])).toBeNull()
  })

  it('returns null when both boats are beyond the passing distance', () => {
    const a = boat({ id: 'a', position: { x: 100, y: 110 } })
    const b = boat({ id: 'b', position: { x: 100, y: 130 } })
    expect(applyRule19(a, b, wind, [obstruction])).toBeNull()
  })
})
