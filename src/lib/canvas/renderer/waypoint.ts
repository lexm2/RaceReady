import type { RenderContext, Waypoint } from '../types.ts'
import { worldToScreen } from './coords.ts'

// Polar speed model

/** Returns approximate boat speed (knots) for a given leg bearing and wind direction. */
export function calcLegSpeed(legBearingDeg: number, windFromDeg: number): number {
  const twa = ((legBearingDeg - windFromDeg + 360) % 360)
  const sym = twa > 180 ? 360 - twa : twa   // symmetric 0..180, 0=head-to-wind 180=downwind
  if (sym < 30) return 0                     // no-go zone (head to wind)
  const t = sym / 180
  // Peaks ~120° TWA (broad reach), tapers at 0° and 180°
  return Math.round(8 * Math.sin(Math.PI * t) * (1 - 0.2 * Math.cos(Math.PI * t)) * 10) / 10
}

function speedColor(legBearingDeg: number, windFromDeg: number): string {
  const twa = ((legBearingDeg - windFromDeg + 360) % 360)
  const sym = twa > 180 ? 360 - twa : twa
  if (sym < 60)  return 'rgba(255,150,0,0.95)'   // upwind: orange
  if (sym < 120) return 'rgba(80,220,100,0.95)'  // reach: green
  return 'rgba(80,160,255,0.95)'                  // downwind: blue
}

// Color resolution

const PALETTE: Record<string, string> = {
  maize: '#FFCB05', blue: '#00274C', arboretum: '#2f65a7',
  orange: '#d86018', teal: '#00b2a9', red: '#9a3324', white: '#FFFFFF',
}

function resolveColor(c: string): string {
  return PALETTE[c] ?? c
}

// Arrowhead helper

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  size: number,
): void {
  const angle = Math.atan2(toY - fromY, toX - fromX)
  const tip = { x: toX, y: toY }
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(
    tip.x - size * Math.cos(angle - Math.PI / 6),
    tip.y - size * Math.sin(angle - Math.PI / 6),
  )
  ctx.lineTo(
    tip.x - size * Math.cos(angle + Math.PI / 6),
    tip.y - size * Math.sin(angle + Math.PI / 6),
  )
  ctx.closePath()
  ctx.fill()
}

// Leg drawing helper

function drawLeg(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  camera: RenderContext['camera'],
  scene: RenderContext['scene'],
  dpr: number,
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  color: string,
  markerR: number,
): void {
  const sa = worldToScreen(fromPos, camera, canvas)
  const sb = worldToScreen(toPos,   camera, canvas)

  const dx = toPos.x - fromPos.x
  const dy = toPos.y - fromPos.y
  const legBearingDeg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360

  const spd      = calcLegSpeed(legBearingDeg, scene.wind.directionDeg)
  const spdColor = speedColor(legBearingDeg, scene.wind.directionDeg)

  // Speed label at midpoint
  const midX     = (sa.x + sb.x) / 2
  const midY     = (sa.y + sb.y) / 2
  const label    = spd === 0 ? 'no-go' : `${spd} kt`
  const fontSize = 9 * dpr

  ctx.font         = `bold ${fontSize}px Oswald, sans-serif`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'

  const tw = ctx.measureText(label).width
  const px = 3 * dpr
  const py = 2 * dpr

  ctx.fillStyle = 'rgba(0,20,40,0.75)'
  ctx.beginPath()
  ctx.roundRect(midX - tw / 2 - px, midY - fontSize / 2 - py, tw + px * 2, fontSize + py * 2, 3 * dpr)
  ctx.fill()

  ctx.fillStyle = spdColor
  ctx.fillText(label, midX, midY)

  // Arrow pointing toward "to", placed at "from" edge
  const distPx = Math.hypot(sb.x - sa.x, sb.y - sa.y)
  if (distPx > 0) {
    const nx   = (sb.x - sa.x) / distPx
    const ny   = (sb.y - sa.y) / distPx
    const tipX = sa.x + nx * (markerR + 2 * dpr)
    const tipY = sa.y + ny * (markerR + 2 * dpr)

    ctx.fillStyle = color
    drawArrow(ctx, sa.x, sa.y, tipX, tipY, 8 * dpr)
  }
}

// Main draw function

export function drawWaypoints(rc: RenderContext): void {
  const { ctx, canvas, camera, scene, dpr } = rc
  if (!scene.waypoints?.length) return

  const MARKER_R_M = 3   // world-space metres
  const markerR    = MARKER_R_M * camera.zoom

  // Group waypoints by boatId, sorted by order
  const byBoat = new Map<string, Waypoint[]>()
  for (const wp of scene.waypoints) {
    const list = byBoat.get(wp.boatId) ?? []
    list.push(wp)
    byBoat.set(wp.boatId, list)
  }
  for (const list of byBoat.values()) {
    list.sort((a, b) => a.order - b.order)
  }

  const boatMap      = new Map(scene.boats.map(b => [b.id, b]))
  const boatColorMap = new Map(scene.boats.map(b => [b.id, resolveColor(b.hullColor)]))

  ctx.save()

  for (const [boatId, wps] of byBoat) {
    const color = boatColorMap.get(boatId) ?? '#FFCB05'
    const boat  = boatMap.get(boatId)
    if (!boat) continue

    // Dashed path: boat to wp0 to wp1 ...
    ctx.setLineDash([6 * dpr, 4 * dpr])
    ctx.strokeStyle = color + 'aa'
    ctx.lineWidth   = 1.5 * dpr

    ctx.beginPath()
    const boatScreen = worldToScreen(boat.position, camera, canvas)
    ctx.moveTo(boatScreen.x, boatScreen.y)
    for (const wp of wps) {
      const s = worldToScreen(wp.position, camera, canvas)
      ctx.lineTo(s.x, s.y)
    }
    ctx.stroke()
    ctx.setLineDash([])

    // Speed labels and arrows

    // First leg: boat → waypoint 0
    drawLeg(ctx, canvas, camera, scene, dpr, boat.position, wps[0]!.position, color, markerR)

    // Subsequent legs: waypoint i → waypoint i+1
    for (let i = 0; i < wps.length - 1; i++) {
      drawLeg(ctx, canvas, camera, scene, dpr, wps[i]!.position, wps[i + 1]!.position, color, markerR)
    }

    // Waypoint markers
    for (let i = 0; i < wps.length; i++) {
      const wp = wps[i]!
      const s  = worldToScreen(wp.position, camera, canvas)

      ctx.beginPath()
      ctx.arc(s.x, s.y, markerR, 0, Math.PI * 2)
      ctx.fillStyle   = color + '33'
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth   = 1.5 * dpr
      ctx.stroke()

      const numSize = 7 * dpr
      ctx.font         = `bold ${numSize}px Oswald, sans-serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle    = color
      ctx.fillText(String(i + 1), s.x, s.y)
    }
  }

  ctx.restore()
}
