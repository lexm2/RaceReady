import type { RenderContext } from '../types.ts'
import { CANVAS_PALETTE, hexWithAlpha } from './colors.ts'

const WIND_STREAK_STROKE = hexWithAlpha(CANVAS_PALETTE.white, 0.055)

/**
 * Draws the water background: a deep blue gradient + animated wind streaks.
 */
export function drawWater(rc: RenderContext): void {
  drawGradient(rc)
  if (rc.scene.display.showWindStreaks) {
    drawWindStreaks(rc)
  }
}

function drawGradient(rc: RenderContext): void {
  const { ctx, canvas } = rc
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
  grad.addColorStop(0.0,  CANVAS_PALETTE.waterDeep)
  grad.addColorStop(0.45, CANVAS_PALETTE.waterMid)
  grad.addColorStop(1.0,  CANVAS_PALETTE.waterShallow)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawWindStreaks(rc: RenderContext): void {
  const { ctx, canvas, scene, timestamp, dpr } = rc

  // Wind streaks scroll in the downwind direction. Rotating by directionDeg aligns
  // the canvas +y axis with the downwind direction in screen space.
  const downwindRad = (scene.wind.directionDeg * Math.PI) / 180

  const cx = canvas.width  / 2
  const cy = canvas.height / 2

  const SPACING = canvas.height / 25

  // Scroll offset - moves streaks in the downwind direction over time.
  const offset = (timestamp * 0.025 * dpr) % SPACING

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(downwindRad)

  // halfDiag covers the canvas at any rotation angle.
  // COUNT is derived from it so lines always fill the full rotated extent.
  const halfDiag = Math.ceil(Math.hypot(canvas.width, canvas.height) / 2) + SPACING
  const COUNT    = Math.ceil(2 * halfDiag / SPACING) + 1

  ctx.strokeStyle = WIND_STREAK_STROKE
  ctx.lineWidth   = 0.5 * dpr

  for (let i = 0; i < COUNT; i++) {
    const y = -halfDiag + i * SPACING + offset
    // Vary length above halfDiag (minimum 1.0x) so lines always reach the canvas edge.
    const lengthFactor = 1.0 + 0.4 * ((Math.sin(i * 127.1 + 311.7) + 1) / 2)
    const halfLen = halfDiag * lengthFactor

    ctx.beginPath()
    ctx.moveTo(-halfLen, y)
    ctx.lineTo( halfLen, y)
    ctx.stroke()
  }

  ctx.restore()
}
