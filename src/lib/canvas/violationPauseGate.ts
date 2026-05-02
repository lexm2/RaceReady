import type { RuleViolation } from './types.ts'

/**
 * Tracks (ruleId, violatorBoatId) pairs seen during playback so the page can
 * pause on the first appearance of each. The first call after `reset()` seeds
 * the initial state without pausing; later calls trigger a pause only when
 * a new pair appears.
 */
export class ViolationPauseGate {
  private seen = new Set<string>()
  private initialised = false

  static keyOf(v: RuleViolation): string {
    return `${v.ruleId}|${v.violatorBoatId}`
  }

  /** Drop all state so the next noteViolations() call seeds the initial set. */
  reset(): void {
    this.seen = new Set()
    this.initialised = false
  }

  /**
   * Returns true iff at least one (ruleId, violatorBoatId) pair is new since
   * the last `reset()`, past the seed call.
   */
  noteViolations(violations: RuleViolation[]): boolean {
    if (!this.initialised) {
      for (const v of violations) this.seen.add(ViolationPauseGate.keyOf(v))
      this.initialised = true
      return false
    }
    let hasNew = false
    for (const v of violations) {
      const k = ViolationPauseGate.keyOf(v)
      if (!this.seen.has(k)) {
        this.seen.add(k)
        hasNew = true
      }
    }
    return hasNew
  }

  /** True if at least one (ruleId, violatorBoatId) pair has been recorded. */
  hasSeen(v: RuleViolation): boolean {
    return this.seen.has(ViolationPauseGate.keyOf(v))
  }
}
