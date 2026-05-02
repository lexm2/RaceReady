import { describe, expect, it } from 'vitest'
import { PRESETS, type WhiteboardPreset } from '../whiteboardPresets.ts'
import { evaluateScene } from '../rules/logic.ts'
import {
  buildScenarioPlayback,
  sampleSceneAt,
} from '../canvas/scenarioPlayback.ts'

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
    })
  }
})
