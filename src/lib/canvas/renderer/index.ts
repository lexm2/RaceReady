import type { RenderContext } from '../types.ts'
import { drawWater } from './water.ts'
import { drawBoat, drawBoatWake } from './boat.ts'
import { drawMark } from './mark.ts'
import { drawWindIndicator } from './wind.ts'
import { drawLabels, drawGrid, drawSelectionRing } from './ui.ts'
import { worldToScreen } from './coords.ts'

/**
 * Master draw call - clears the canvas then issues all layers in painter's order.
 * Called once per rAF frame from GameCanvas.svelte.
 */
export function renderScene(rc: RenderContext): void {
  const { ctx, canvas } = rc

  // 1. Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 2. Water background + wind streaks (bottom layer)
  drawWater(rc)

  // 3. Optional world-space grid (whiteboard mode)
  if (rc.scene.display.showGrid) {
    drawGrid(rc)
  }

  // 4. Course leg lines (dashed, between marks)
  if (rc.scene.courseLegs?.length) {
    drawCourseLegs(rc)
  }

  // 5. Marks - drawn below boats so boats pass over them visually
  for (const mark of rc.scene.marks) {
    drawMark(rc, mark)
  }

  // 6. Wakes - behind hulls
  if (rc.scene.display.showWake) {
    for (const boat of rc.scene.boats) {
      drawBoatWake(rc, boat)
    }
  }

  // 7. Hulls + sails
  for (const boat of rc.scene.boats) {
    drawBoat(rc, boat)
  }

  // 8. Labels (floating above everything)
  if (rc.scene.display.showLabels) {
    drawLabels(rc)
  }

  // 9. Selection ring + rotation handle (above labels, below HUD)
  if (rc.selectedBoatId) {
    drawSelectionRing(rc)
  }

  // 10. Corner HUD widgets (topmost layer)
  if (rc.scene.display.showWindIndicator) {
    drawWindIndicator(rc)
  }

}

// ─── Course leg lines ─────────────────────────────────────────────────────────

function drawCourseLegs(rc: RenderContext): void {
  const { ctx, canvas, camera, scene, dpr } = rc
  if (!scene.courseLegs) return

  const markById = new Map(scene.marks.map(m => [m.id, m]))

  ctx.save()
  ctx.setLineDash([8 * dpr, 5 * dpr])
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth   = 1 * dpr

  for (const leg of scene.courseLegs) {
    const from = markById.get(leg.from)
    const to   = markById.get(leg.to)
    if (!from || !to) continue

    const a = worldToScreen(from.position, camera, canvas)
    const b = worldToScreen(to.position,   camera, canvas)

    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }

  ctx.setLineDash([])
  ctx.restore()
}
