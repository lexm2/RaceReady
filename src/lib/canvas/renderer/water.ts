import type { RenderContext } from '../types.ts'

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
  grad.addColorStop(0.0,  '#001a35')
  grad.addColorStop(0.45, '#002255')
  grad.addColorStop(1.0,  '#003366')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawWindStreaks(rc: RenderContext): void {
  const { ctx, canvas, scene, timestamp, dpr } = rc

  // Wind streaks scroll in the downwind direction (wind blows FROM directionDeg,
  // so streaks move toward directionDeg + 180).
  const downwindRad = ((scene.wind.directionDeg + 180) * Math.PI) / 180

  const cx = canvas.width  / 2
  const cy = canvas.height / 2

  // Number of streaks and their spacing in the rotated frame.
  const COUNT   = 25
  const SPACING = canvas.height / COUNT

  // Scroll offset — moves streaks in the downwind direction over time.
  const offset = (timestamp * 0.025 * dpr) % SPACING

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(downwindRad)

  // Draw in a region large enough to cover the canvas at any rotation.
  const halfDiag = Math.ceil(Math.hypot(canvas.width, canvas.height) / 2) + SPACING

  ctx.strokeStyle = 'rgba(255,255,255,0.055)'
  ctx.lineWidth   = 0.5 * dpr

  // Stable per-line length variation using a simple deterministic seed.
  for (let i = 0; i < COUNT * 2; i++) {
    const y = -halfDiag + i * SPACING + offset
    // Vary length ±20% using a simple hash of line index.
    const lengthFactor = 0.8 + 0.4 * ((Math.sin(i * 127.1 + 311.7) + 1) / 2)
    const halfLen = halfDiag * lengthFactor

    ctx.beginPath()
    ctx.moveTo(-halfLen, y)
    ctx.lineTo( halfLen, y)
    ctx.stroke()
  }

  ctx.restore()
}
