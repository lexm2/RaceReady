import { describe, expect, it } from 'vitest'
import type { RuleViolation } from '../canvas/types.ts'
import { ViolationPauseGate } from '../canvas/violationPauseGate.ts'

function v(ruleId: string, violatorBoatId: string): RuleViolation {
  return {
    ruleId,
    violatorBoatId,
    severity: 'warning',
    description: '',
  }
}

describe('ViolationPauseGate', () => {
  it('seeds initial state without requesting a pause', () => {
    const gate = new ViolationPauseGate()
    expect(gate.noteViolations([v('rule_10', 'boat-b')])).toBe(false)
    // The seeded key must now count as already seen.
    expect(gate.hasSeen(v('rule_10', 'boat-b'))).toBe(true)
  })

  it('does not pause when the violation set is unchanged', () => {
    const gate = new ViolationPauseGate()
    gate.noteViolations([v('rule_12', 'boat-b')])
    expect(gate.noteViolations([v('rule_12', 'boat-b')])).toBe(false)
  })

  it('pauses on a new (ruleId, violatorBoatId) pair', () => {
    const gate = new ViolationPauseGate()
    gate.noteViolations([v('rule_12', 'boat-b')])
    expect(gate.noteViolations([v('rule_12', 'boat-b'), v('rule_15', 'boat-b')])).toBe(true)
  })

  it('treats the same rule on a different boat as a new pair', () => {
    const gate = new ViolationPauseGate()
    gate.noteViolations([v('rule_14', 'boat-a')])
    expect(gate.noteViolations([v('rule_14', 'boat-a'), v('rule_14', 'boat-b')])).toBe(true)
  })

  it('does not pause when an existing key disappears', () => {
    const gate = new ViolationPauseGate()
    gate.noteViolations([v('rule_12', 'boat-b'), v('rule_15', 'boat-b')])
    expect(gate.noteViolations([v('rule_12', 'boat-b')])).toBe(false)
  })

  it('does not re-pause when a removed key reappears (resume-from-pause case)', () => {
    const gate = new ViolationPauseGate()
    // initial seed
    gate.noteViolations([v('rule_12', 'boat-b')])
    // R15 fires for the first time — pause expected
    expect(gate.noteViolations([v('rule_12', 'boat-b'), v('rule_15', 'boat-b')])).toBe(true)
    // pause causes prevScene to drop briefly → R15 disappears for one frame
    expect(gate.noteViolations([v('rule_12', 'boat-b')])).toBe(false)
    // user resumes; R15 fires again — must NOT re-pause
    expect(gate.noteViolations([v('rule_12', 'boat-b'), v('rule_15', 'boat-b')])).toBe(false)
  })

  it('reset() lets the same violation pause again on the next play-through', () => {
    const gate = new ViolationPauseGate()
    gate.noteViolations([v('rule_12', 'boat-b')])
    gate.noteViolations([v('rule_12', 'boat-b'), v('rule_15', 'boat-b')]) // first pause
    gate.reset()
    expect(gate.noteViolations([v('rule_12', 'boat-b')])).toBe(false) // re-seed
    expect(gate.noteViolations([v('rule_12', 'boat-b'), v('rule_15', 'boat-b')])).toBe(true)
  })
})
