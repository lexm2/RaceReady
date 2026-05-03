import type { RenderContext } from '../types.ts'
import { CANVAS_PALETTE, hexWithAlpha } from './colors.ts'

const WIDGET_RADIUS = 28  // CSS px

const BG_FILL          = hexWithAlpha(CANVAS_PALETTE.waterDeep, 0.75)
const BG_STROKE        = hexWithAlpha(CANVAS_PALETTE.maize,     0.5)
const DOT_FILL         = hexWithAlpha(CANVAS_PALETTE.white,     0.45)
const SHAFT_STROKE     = hexWithAlpha(CANVAS_PALETTE.white,     0.8)
const FEATHER_STROKE   = hexWithAlpha(CANVAS_PALETTE.white,     0.5)
const SPEED_LABEL_FILL = hexWithAlpha(CANVAS_PALETTE.white,     0.65)
const WIDGET_LABEL_FILL = hexWithAlpha(CANVAS_PALETTE.white,    0.4)

export function drawWindIndicator(rc: RenderContext): void {
  const { ctx, canvas, scene, dpr } = rc
  const r   = WIDGET_RADIUS * dpr
  const inset = 16 * dpr
  const cx  = inset + r
  const cy  = inset + r

  ctx.save()
  ctx.translate(cx, cy)

  drawWidgetBackground(ctx, r, dpr)
  drawCardinalDots(ctx, r, dpr)
  drawArrow(ctx, scene.wind.directionDeg, r, dpr)

  if (scene.wind.speedKnots !== undefined) {
    drawSpeedLabel(ctx, scene.wind.speedKnots, dpr)
  }

  ctx.restore()

  drawWidgetLabel(ctx, cx, cy + r + 6 * dpr, dpr)
}

// Private helpers

function drawWidgetBackground(
  ctx: CanvasRenderingContext2D,
  r: number,
  dpr: number,
): void {
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle   = BG_FILL
  ctx.fill()
  ctx.strokeStyle = BG_STROKE
  ctx.lineWidth   = 1.5 * dpr
  ctx.stroke()
}

function drawCardinalDots(
  ctx: CanvasRenderingContext2D,
  r: number,
  dpr: number,
): void {
  const dotR    = 1.5 * dpr
  const dotDist = r * 0.78

  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 * Math.PI) / 180
    const x     = Math.sin(angle) * dotDist
    const y     = -Math.cos(angle) * dotDist  // -cos so 0deg is up

    ctx.beginPath()
    // North dot is larger and maize-coloured
    const isNorth = i === 0
    ctx.arc(x, y, isNorth ? dotR * 1.6 : dotR, 0, Math.PI * 2)
    ctx.fillStyle = isNorth ? CANVAS_PALETTE.maize : DOT_FILL
    ctx.fill()
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  directionDeg: number,
  r: number,
  dpr: number,
): void {
  // Arrow points TO the direction the wind is going (downwind).
  // Wind comes FROM directionDeg, so it goes TO directionDeg + 180.
  const toRad = ((directionDeg + 180) * Math.PI) / 180

  ctx.save()
  ctx.rotate(toRad)

  const shaftLen  = r * 0.6
  const headLen   = r * 0.3
  const headWidth = r * 0.22

  // Shaft
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, -shaftLen)
  ctx.strokeStyle = SHAFT_STROKE
  ctx.lineWidth   = 1.5 * dpr
  ctx.stroke()

  // Arrowhead (filled triangle pointing upward in rotated frame)
  ctx.beginPath()
  ctx.moveTo(0, -shaftLen - headLen)
  ctx.lineTo(-headWidth / 2, -shaftLen)
  ctx.lineTo( headWidth / 2, -shaftLen)
  ctx.closePath()
  ctx.fillStyle = CANVAS_PALETTE.maize
  ctx.fill()

  // Tail feather (small horizontal bar at the base)
  const featherW = r * 0.18
  ctx.beginPath()
  ctx.moveTo(-featherW, r * 0.15)
  ctx.lineTo( featherW, r * 0.15)
  ctx.strokeStyle = FEATHER_STROKE
  ctx.lineWidth   = 1.5 * dpr
  ctx.stroke()

  ctx.restore()
}

function drawSpeedLabel(
  ctx: CanvasRenderingContext2D,
  knots: number,
  dpr: number,
): void {
  ctx.font         = `bold ${8 * dpr}px Oswald, sans-serif`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle    = SPEED_LABEL_FILL
  ctx.fillText(`${Math.round(knots)}kn`, 0, WIDGET_RADIUS * dpr * 0.45)
}

function drawWidgetLabel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  labelY: number,
  dpr: number,
): void {
  ctx.font         = `${7 * dpr}px Oswald, sans-serif`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle    = WIDGET_LABEL_FILL
  ctx.fillText('WIND', cx, labelY)
}
