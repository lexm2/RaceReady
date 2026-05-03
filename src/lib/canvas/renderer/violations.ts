import type { RenderContext, RuleViolation } from '../types.ts'
import { worldToScreen } from './coords.ts'
import { VIOLATION_COLORS } from './colors.ts'

/** Boat-hull length (matches boat.ts). World metres. */
const HULL_LENGTH_M = 10

/**
 * Draw a colored ring around each boat that is currently a "keep clear" boat
 * under an active rule, with severity-based color.
 */
export function drawViolations(rc: RenderContext): void {
  const { ctx, canvas, camera, scene, dpr, violations, timestamp } = rc
  if (!violations || violations.length === 0) return

  // De-dup: a single boat may have multiple violations; pick the strongest.
  const order = { violation: 3, warning: 2, advisory: 1 } as const
  const strongestByBoat = new Map<string, RuleViolation>()
  for (const v of violations) {
    const cur = strongestByBoat.get(v.violatorBoatId)
    if (!cur || order[v.severity] > order[cur.severity]) {
      strongestByBoat.set(v.violatorBoatId, v)
    }
  }

  // Slow pulse for warning/violation rings.
  const pulse = 0.5 + 0.5 * Math.sin(timestamp / 220)

  ctx.save()
  for (const [boatId, v] of strongestByBoat) {
    const boat = scene.boats.find(b => b.id === boatId)
    if (!boat) continue
    const screen = worldToScreen(boat.position, camera, canvas)
    const rWorld = HULL_LENGTH_M * 0.95   // ring sits just outside the hull
    const rPx = rWorld * camera.zoom

    const c = VIOLATION_COLORS[v.severity]
    const lineW = (v.severity === 'violation' ? 2.5 : v.severity === 'warning' ? 2 : 1.5) * dpr
    const pulseScale = v.severity === 'advisory' ? 1.0 : 1.0 + 0.06 * pulse

    // Filled disc (subtle)
    ctx.beginPath()
    ctx.arc(screen.x, screen.y, rPx * pulseScale, 0, Math.PI * 2)
    ctx.fillStyle = c.fill
    ctx.fill()

    // Ring stroke
    ctx.beginPath()
    ctx.arc(screen.x, screen.y, rPx * pulseScale, 0, Math.PI * 2)
    if (v.severity === 'advisory') ctx.setLineDash([4 * dpr, 3 * dpr])
    ctx.strokeStyle = c.stroke
    ctx.lineWidth   = lineW
    ctx.stroke()
    ctx.setLineDash([])
  }
  ctx.restore()
}
