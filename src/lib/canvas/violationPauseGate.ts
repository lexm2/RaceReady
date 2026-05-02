import type { RuleViolation } from './types.ts'

/**
 * Tracks which (ruleId, violatorBoatId) pairs have already been "seen" during
 * a playback so the WhiteboardPage can pause the playback the first time each
 * one appears — and only the first time. Behaviour:
 *
 *   1. The first call after `reset()` is treated as the **initial state** of
 *      the playback. Its keys are recorded but no pause is requested. (Without
 *      this, presets like rule_10 — where R10 is firing statically at t=0 —
 *      would auto-pause before the user saw anything happen.)
 *   2. Subsequent calls request a pause iff the violation set contains at
 *      least one (ruleId, violatorBoatId) pair that hasn't been seen yet.
 *   3. Removing a key (e.g. R15 transient disappearing) never requests a pause.
 *   4. After a pause is requested for a key, that key stays in the seen set so
 *      resuming and re-firing the same violation on the next frame doesn't
 *      immediately re-pause.
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
   * Returns true iff the caller should pause the playback — i.e. at least one
   * (ruleId, violatorBoatId) pair in `violations` is new since the last
   * `reset()` (and we're past the seed call).
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
