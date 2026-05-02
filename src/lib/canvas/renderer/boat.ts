import type { RenderContext, BoatState, ColorValue } from '../types.ts'
import { worldToScreen, normalizeAngle } from './coords.ts'

// Constants

/** Hull length in world units (metres). */
const HULL_LENGTH_M = 10

const PALETTE: Record<string, string> = {
  maize:     '#FFCB05',
  blue:      '#00274C',
  arboretum: '#2f65a7',
  orange:    '#d86018',
  teal:      '#00b2a9',
  red:       '#9a3324',
  white:     '#FFFFFF',
}

// Public API

export function drawBoatWake(rc: RenderContext, boat: BoatState): void {
  if (boat.speed <= 0) return

  const { ctx, canvas, camera, dpr } = rc
  const screen = worldToScreen(boat.position, camera, canvas)
  const L = HULL_LENGTH_M * camera.zoom
  const W = L * 0.28

  // Wake opacity scales with speed, clamped to [0, 1].
  const alpha = Math.min(boat.speed / 8, 1) * 0.6

  ctx.save()
  ctx.translate(screen.x, screen.y)
  ctx.rotate((boat.heading * Math.PI) / 180)

  const wakeLen = L * 1.8

  for (const side of [-1, 1] as const) {
    const grad = ctx.createLinearGradient(0, L / 2, 0, L / 2 + wakeLen)
    grad.addColorStop(0, `rgba(255,255,255,${alpha})`)
    grad.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.beginPath()
    ctx.moveTo(0, L / 2)
    ctx.bezierCurveTo(
      side * W * 0.4, L * 0.8,
      side * W * 1.1, L * 1.2,
      side * W * 1.5, L / 2 + wakeLen,
    )
    ctx.strokeStyle = grad
    ctx.lineWidth   = 1.5 * dpr
    ctx.stroke()
  }

  ctx.restore()
}

export function drawBoat(rc: RenderContext, boat: BoatState): void {
  const { ctx, canvas, camera } = rc
  const screen = worldToScreen(boat.position, camera, canvas)

  ctx.save()
  ctx.translate(screen.x, screen.y)
  ctx.rotate((boat.heading * Math.PI) / 180)

  const L = HULL_LENGTH_M * camera.zoom
  const W = L * 0.28

  if (boat.isPlayer) {
    ctx.shadowBlur  = 12
    ctx.shadowColor = 'rgba(255,203,5,0.5)'
  }

  drawHull(ctx, boat, L, W)
  ctx.shadowBlur  = 0
  ctx.shadowColor = 'transparent'

  drawMast(ctx, L, W)
  drawSail(ctx, rc, boat, L, W)

  ctx.restore()
}

// Private helpers

function resolveColor(value: ColorValue): string {
  return PALETTE[value] ?? value
}

/** Lightens a hex color by mixing toward white at the given ratio. */
function lightenHex(hex: string, ratio: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lr = Math.round(r + (255 - r) * ratio)
  const lg = Math.round(g + (255 - g) * ratio)
  const lb = Math.round(b + (255 - b) * ratio)
  return `rgb(${lr},${lg},${lb})`
}

function drawHull(
  ctx: CanvasRenderingContext2D,
  boat: BoatState,
  L: number,
  W: number,
): void {
  const hullHex = resolveColor(boat.hullColor)

  ctx.beginPath()
  ctx.moveTo(0, -L / 2)                                                    // bow
  ctx.bezierCurveTo( W * 0.55, -L * 0.3,  W * 0.55,  L * 0.2,  W * 0.35,  L / 2)
  ctx.bezierCurveTo( W * 0.1,   L * 0.55, -W * 0.1,  L * 0.55, -W * 0.35, L / 2)
  ctx.bezierCurveTo(-W * 0.55,  L * 0.2, -W * 0.55, -L * 0.3,  0,        -L / 2)
  ctx.closePath()

  ctx.fillStyle   = hullHex
  ctx.fill()
  ctx.strokeStyle = lightenHex(hullHex, 0.3)
  ctx.lineWidth   = 1.5
  ctx.stroke()
}

function drawMast(ctx: CanvasRenderingContext2D, L: number, W: number): void {
  const r = W * 0.18
  const mx = 0
  const my = -L * 0.18

  ctx.beginPath()
  ctx.arc(mx, my, r, 0, Math.PI * 2)
  ctx.fillStyle = '#1a1a2e'
  ctx.fill()

  // Highlight dot
  ctx.beginPath()
  ctx.arc(mx - r * 0.3, my - r * 0.3, r * 0.25, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fill()
}

function drawSail(
  ctx: CanvasRenderingContext2D,
  rc: RenderContext,
  boat: BoatState,
  L: number,
  W: number,
): void {
  // Apparent wind angle relative to boat heading.
  const awa = normalizeAngle(rc.scene.wind.directionDeg - boat.heading)

  // Sail fills on the leeward side (opposite from where wind comes from).
  // If wind comes from starboard (awa 0-180), sail fills to port (negative x).
  const sign = awa >= 0 && awa < 180 ? -1 : 1

  const mastX = 0
  const mastY = -L * 0.18

  ctx.beginPath()
  ctx.moveTo(mastX,            mastY)                 // peak (mast top)
  ctx.lineTo(sign * W * 0.15,  L * 0.22)             // tack (foot at mast)
  ctx.lineTo(sign * W * 1.35, -L * 0.05)             // clew (outboard end)
  ctx.closePath()

  const sailHex = resolveColor(boat.sailColor)
  ctx.fillStyle   = hexWithAlpha(sailHex, 0.82)
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth   = 0.8
  ctx.fill()
  ctx.stroke()
}

/** Converts a hex color + alpha to an rgba() string. */
function hexWithAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
