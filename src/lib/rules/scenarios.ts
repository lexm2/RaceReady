import type { RuleScenario, EncodedRuleId } from './types.ts'
import {
  generateRule10Scenario,
  generateRule11Scenario,
  generateRule12Scenario,
  generateRule13Scenario,
  generateRule18Scenario,
  generateRule19Scenario,
} from './generator/index.ts'

/**
 * Canonical scenarios — each entry calls a generator with a specific param set.
 * Adding new variations is one line each.
 */
export const ALL_SCENARIOS: RuleScenario[] = [
  // Rule 10 — Port-Starboard
  generateRule10Scenario({ windDirDeg: 0, timeToConflictSec: 6 }),
  generateRule10Scenario({ windDirDeg: 0, timeToConflictSec: 7, stbdHeadingDeg: 305, portHeadingDeg: 55 }),
  generateRule10Scenario({ windDirDeg: 90, timeToConflictSec: 6 }),
  generateRule10Scenario({ windDirDeg: 270, timeToConflictSec: 7 }),

  // Rule 11 — Same tack, overlapped
  generateRule11Scenario({ windDirDeg: 0, tack: 'starboard', windwardLateralOffsetM: 16 }),
  generateRule11Scenario({ windDirDeg: 0, tack: 'port', windwardLateralOffsetM: 14 }),
  generateRule11Scenario({ windDirDeg: 90, tack: 'starboard', windwardLateralOffsetM: 18, windwardLongitudinalOffsetM: 6 }),

  // Rule 12 — Same tack, not overlapped (overtaking)
  generateRule12Scenario({ windDirDeg: 0, tack: 'starboard', asternDistanceM: 28 }),
  generateRule12Scenario({ windDirDeg: 0, tack: 'port', asternDistanceM: 32 }),

  // Rule 13 — While tacking
  generateRule13Scenario({ windDirDeg: 0 }),
  generateRule13Scenario({ windDirDeg: 90, tackStartSec: 3.5 }),

  // Rule 18 — Mark room
  generateRule18Scenario({ windDirDeg: 0, insideSide: 'left' }),
  generateRule18Scenario({ windDirDeg: 0, insideSide: 'right', separationM: 18 }),

  // Rule 19 — Obstruction
  generateRule19Scenario({ windDirDeg: 0, insideSide: 'left' }),
]

export function getScenariosByRule(ruleId: EncodedRuleId): RuleScenario[] {
  return ALL_SCENARIOS.filter(s => s.primaryRuleId === ruleId)
}

export function getScenarioById(id: string): RuleScenario | undefined {
  return ALL_SCENARIOS.find(s => s.id === id)
}

/** Returns a shuffled copy of ALL_SCENARIOS using Fisher-Yates. */
export function shuffleScenarios(input: RuleScenario[] = ALL_SCENARIOS): RuleScenario[] {
  const out = [...input]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}
