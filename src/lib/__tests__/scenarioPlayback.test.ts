import { describe, expect, it } from 'vitest'
import { PRESETS, type WhiteboardPreset } from '../whiteboardPresets.ts'
import { evaluateScene } from '../rules/logic.ts'
import {
  buildScenarioPlayback,
  sampleSceneAt,
} from '../canvas/scenarioPlayback.ts'
import { ViolationPauseGate } from '../canvas/violationPauseGate.ts'

/**
 * Match GameCanvas's RULE_LOOKBACK_SEC: rules 15 and 16 need a prior scene
 * sampled this many seconds in the past to detect ROW transfers / heading
 * changes.
 */
const LOOKBACK_SEC = 1.2

/**
 * Minimum playback duration. Long enough that the lookback window fits inside
 * the [25%, 75%] window so change-based rules can resolve mid-playback.
 */
const MIN_DURATION_SEC = 8

/** Number of samples used to verify continuous motion across the clip. */
const MOTION_SAMPLES = 20

/**
 * Min metres a boat must move between adjacent samples to count as "still
 * moving". Set well below the no-go-zone min speed (0.3 kt × 0.4 s ≈ 0.06 m)
 * so even pinching boats don't fail the check, while still catching boats
 * that have been clamped to the end of their route.
 */
const MIN_MOVEMENT_M = 0.01

/**
 * Run the rule evaluator against a sampled-from-clip scene at time `t`. Pulls
 * a `prevScene` from `lookbackSec` earlier so change-based rules (15, 16) work.
 */
function evaluateAt(
  preset: WhiteboardPreset,
  clip: ReturnType<typeof buildScenarioPlayback>['clip'],
  t: number,
): ReturnType<typeof evaluateScene> {
  const scene = sampleSceneAt(preset.scene, clip, t)
  const lookback = t - LOOKBACK_SEC
  const prevScene = lookback >= 0 ? sampleSceneAt(preset.scene, clip, lookback) : undefined
  return evaluateScene(scene, prevScene)
}

describe('Whiteboard preset playback', () => {
  for (const preset of PRESETS) {
    describe(`${preset.id} — ${preset.title}`, () => {
      const playback = buildScenarioPlayback(preset.scene, {
        minDurationSec: MIN_DURATION_SEC,
      })
      const { clip } = playback
      const duration = clip.durationSec

      it('builds a playback long enough to show buildup and resolution', () => {
        expect(duration).toBeGreaterThanOrEqual(MIN_DURATION_SEC)
        expect(clip.keyframes.length).toBeGreaterThanOrEqual(2)
      })

      it('keeps every boat moving for the full duration (no boat freezes early)', () => {
        const dt = duration / MOTION_SAMPLES
        const stalls: string[] = []

        for (let i = 0; i < MOTION_SAMPLES; i++) {
          const t0 = i * dt
          const t1 = t0 + dt
          const a = sampleSceneAt(preset.scene, clip, t0)
          const b = sampleSceneAt(preset.scene, clip, t1)
          for (const boat of preset.scene.boats) {
            const aBoat = a.boats.find(x => x.id === boat.id)!
            const bBoat = b.boats.find(x => x.id === boat.id)!
            const moved = Math.hypot(
              bBoat.position.x - aBoat.position.x,
              bBoat.position.y - aBoat.position.y,
            )
            if (moved < MIN_MOVEMENT_M) {
              stalls.push(`${boat.id} stalled in [${t0.toFixed(2)}s, ${t1.toFixed(2)}s] (moved ${moved.toFixed(3)}m)`)
            }
          }
        }
        expect(stalls, stalls.join('\n')).toEqual([])
      })

      it(`triggers ${preset.ruleId} during the middle of the playback`, () => {
        // Walk the [25%, 75%] window and look for the preset's rule firing.
        // We need a window (not just the midpoint) because change-based rules
        // (15, 16) only fire at the moment ROW shifts / the ROW boat turns.
        const start = duration * 0.25
        const end = duration * 0.75
        const samples = 25
        const fires: number[] = []

        for (let i = 0; i <= samples; i++) {
          const t = start + ((end - start) * i) / samples
          const violations = evaluateAt(preset, clip, t)
          if (violations.some(v => v.ruleId === preset.ruleId)) {
            fires.push(t)
          }
        }

        expect(
          fires.length,
          `expected ${preset.ruleId} to fire in [${start.toFixed(1)}s, ${end.toFixed(1)}s]; ` +
            `instead saw violations: ${
              JSON.stringify(
                evaluateAt(preset, clip, (start + end) / 2).map(v => v.ruleId),
              )
            }`,
        ).toBeGreaterThan(0)
      })

      it('exposes setup context (samples at midpoint show both boats interacting)', () => {
        const mid = duration * 0.5
        const scene = sampleSceneAt(preset.scene, clip, mid)
        // Both boats should be inside the world bounds — not having sailed off the canvas.
        for (const boat of scene.boats) {
          expect(boat.position.x).toBeGreaterThan(-50)
          expect(boat.position.x).toBeLessThan(preset.scene.worldSize.x + 50)
          expect(boat.position.y).toBeGreaterThan(-50)
          expect(boat.position.y).toBeLessThan(preset.scene.worldSize.y + 50)
        }
      })

      /**
       * End-to-end sim of what the WhiteboardPage actually shows the user.
       * Models the full play-start sequence including:
       *
       *   - GameCanvas's dedup of `onViolationsChanged` (only fires when the
       *     `ruleId|violatorBoatId|severity` set changes), with prevKey state
       *     that persists across the static-scene preview and into playback.
       *   - The "static fire before animation starts" callback that the page
       *     receives but ignores because `currentAnimation` is undefined.
       *   - The page's manual gate-seed at play-start (so the dedup'd first
       *     animation frame doesn't get swallowed and leave the gate empty).
       *   - The gate's pause decision on each subsequent change.
       *
       * Two paths count as "visible to the user":
       *   1. The rule is in the *initial* violation set (static rules like
       *      R10/R11/etc.) — the page's seed picks it up; the card is up from
       *      frame 1 and stays put while the rule keeps firing.
       *   2. The rule fires later and the gate auto-pauses on the same frame
       *      (change-based rules like R15/R16) — the pause holds the card.
       *
       * Failing this means the production wiring would let the named rule
       * appear on screen too briefly (or never) for the user to read.
       */
      it(`shows ${preset.ruleId} to the user (seed or auto-pause)`, () => {
        const gate = new ViolationPauseGate()
        let paused = false
        let prevDedupKey = ''
        let onChangeCalls: RuleViolation[][] = []
        let pauseFiredWithRule = false

        function dedupKey(vs: RuleViolation[]): string {
          return vs
            .map(v => `${v.ruleId}|${v.violatorBoatId}|${v.severity}`)
            .sort()
            .join(',')
        }

        function deliverViolations(vs: RuleViolation[], currentAnimationActive: boolean) {
          const key = dedupKey(vs)
          if (key === prevDedupKey) return
          prevDedupKey = key
          onChangeCalls.push(vs)
          // Mirror WhiteboardPage.onViolationsChanged exactly:
          if (!currentAnimationActive || paused) return
          if (gate.noteViolations(vs)) paused = true
        }

        // Phase 1: static-scene preview — GameCanvas evaluates once before
        // the animation starts. The page's handler returns early because no
        // animation is active. This populates GameCanvas's prevDedupKey but
        // not the gate.
        const staticViolations: RuleViolation[] = []
        // (Use the t=0 sample as a stand-in for the no-animation static eval.)
        for (const v of evaluateAt(preset, clip, 0)) staticViolations.push(v)
        deliverViolations(staticViolations, /* currentAnimationActive */ false)

        // Phase 2: play-start. Mirrors WhiteboardPage.playAllRoutes:
        //   reset gate, then seed it from evaluateScene(scene) so the
        //   dedup-swallowed first animation frame can't leave the gate empty.
        gate.reset()
        gate.noteViolations(staticViolations)
        const seededWithRule = staticViolations.some(v => v.ruleId === preset.ruleId)

        // Phase 3: animation frames at ~30 fps.
        const stepSec = 1 / 30
        const steps = Math.ceil(duration / stepSec) + 1
        for (let i = 0; i <= steps; i++) {
          if (paused) {
            pauseFiredWithRule =
              onChangeCalls.at(-1)?.some(v => v.ruleId === preset.ruleId) ?? false
            break
          }
          const t = Math.min(i * stepSec, duration)
          deliverViolations(evaluateAt(preset, clip, t), true)
        }

        // Static-rule path: rule was in the seed; verify it stays on screen
        // (the card persists only while the rule keeps firing).
        if (seededWithRule) {
          let alwaysVisible = true
          for (let i = 0; i <= 30; i++) {
            const t = (duration * i) / 30
            const vs = evaluateAt(preset, clip, t)
            if (!vs.some(v => v.ruleId === preset.ruleId)) {
              alwaysVisible = false
              break
            }
          }
          expect(
            alwaysVisible,
            `${preset.ruleId} fires at t=0 (in the gate seed) but disappears later — ` +
              `the user would see the card briefly and lose it`,
          ).toBe(true)
          return
        }

        // Change-based-rule path: the gate must auto-pause on a frame that
        // contains the preset's rule, so the card stays on screen.
        expect(
          pauseFiredWithRule,
          `${preset.ruleId} either never fired during the playback, or fired on ` +
            `a frame that did not trigger the auto-pause gate — the user would ` +
            `not have a chance to read its card`,
        ).toBe(true)
      })
    })
  }
})
