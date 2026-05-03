import type { RenderContext, Mark } from '../types.ts'
import { worldToScreen } from './coords.ts'

const BUOY_RADIUS  = 6    // screen px (constant regardless of zoom - always legible)
/** Zone radius per RRS: 3 boat lengths. Boat length = 10 m → 30 m. */
const ZONE_RADIUS_M = 30

export function drawMark(rc: RenderContext, mark: Mark): void {
  const { ctx, canvas, camera, dpr } = rc
  const screen = worldToScreen(mark.position, camera, canvas)
  const r = BUOY_RADIUS * dpr

  // Zone ring drawn first (in world space) so the buoy sits on top
  if (mark.type === 'buoy' || mark.type === 'gate_buoy') {
    drawZoneRing(ctx, screen, mark, camera.zoom, dpr)
  }

  ctx.save()
  ctx.translate(screen.x, screen.y)

  switch (mark.type) {
    case 'buoy':
    case 'gate_buoy':
      drawBuoy(ctx, mark, r, dpr)
      break
    case 'committee_boat':
      drawCommitteeBoat(ctx, r, dpr)
      break
    case 'pin_end':
      drawPinEnd(ctx, r, dpr)
      break
  }

  if (mark.label) {
    drawMarkLabel(ctx, mark.label, r, dpr)
  }

  ctx.restore()

  // Gate line between paired gate buoys
  if (mark.type === 'gate_buoy' && mark.gateId) {
    drawGateLine(rc, mark)
  }
}

// Private helpers

function drawZoneRing(
  ctx: CanvasRenderingContext2D,
  screen: { x: number; y: number },
  mark: Mark,
  zoom: number,
  dpr: number,
): void {
  const zoneR = ZONE_RADIUS_M * zoom   // world metres → physical px

  // Tinted fill - very subtle so it doesn't obscure boats
  const fillColor = mark.side === 'port'      ? 'rgba(216,96,24,0.06)'
                  : mark.side === 'starboard' ? 'rgba(34,197,94,0.06)'
                  :                             'rgba(255,203,5,0.06)'

  // Dashed stroke - same hue as the buoy, more visible
  const strokeColor = mark.side === 'port'      ? 'rgba(216,96,24,0.45)'
                    : mark.side === 'starboard' ? 'rgba(34,197,94,0.45)'
                    :                             'rgba(255,203,5,0.45)'

  ctx.save()

  // Fill
  ctx.beginPath()
  ctx.arc(screen.x, screen.y, zoneR, 0, Math.PI * 2)
  ctx.fillStyle = fillColor
  ctx.fill()

  // Dashed border
  ctx.beginPath()
  ctx.arc(screen.x, screen.y, zoneR, 0, Math.PI * 2)
  ctx.setLineDash([6 * dpr, 5 * dpr])
  ctx.strokeStyle = strokeColor
  ctx.lineWidth   = 1 * dpr
  ctx.stroke()
  ctx.setLineDash([])

  ctx.restore()
}

function drawBuoy(
  ctx: CanvasRenderingContext2D,
  mark: Mark,
  r: number,
  dpr: number,
): void {
  const fill = mark.side === 'port'       ? '#d86018'
             : mark.side === 'starboard'  ? '#22c55e'
             :                              '#FFCB05'

  const stroke = mark.side === 'none' ? '#00274C' : 'rgba(255,255,255,0.9)'

  // Main circle
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle   = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth   = 1.5 * dpr
  ctx.stroke()

  // Inner highlight
  ctx.beginPath()
  ctx.arc(-r * 0.3, -r * 0.3, r * 0.25, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fill()
}

function drawCommitteeBoat(ctx: CanvasRenderingContext2D, r: number, dpr: number): void {
  const w = 24 * dpr
  const h = 10 * dpr
  const cr = 2 * dpr

  // Rounded rectangle hull
  ctx.beginPath()
  ctx.roundRect(-w / 2, -h / 2, w, h, cr)
  ctx.fillStyle   = '#002255'
  ctx.fill()
  ctx.strokeStyle = '#FFCB05'
  ctx.lineWidth   = 1.5 * dpr
  ctx.stroke()

  // Mast line
  ctx.beginPath()
  ctx.moveTo(0, -h / 2)
  ctx.lineTo(0, -h / 2 - 8 * dpr)
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth   = 1 * dpr
  ctx.stroke()
}

function drawPinEnd(ctx: CanvasRenderingContext2D, r: number, dpr: number): void {
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
  ctx.fillStyle   = '#FFFFFF'
  ctx.fill()
  ctx.strokeStyle = '#00274C'
  ctx.lineWidth   = 1.5 * dpr
  ctx.stroke()

  // X mark
  const s = r * 0.35
  ctx.beginPath()
  ctx.moveTo(-s, -s); ctx.lineTo(s, s)
  ctx.moveTo( s, -s); ctx.lineTo(-s, s)
  ctx.strokeStyle = '#00274C'
  ctx.lineWidth   = 1 * dpr
  ctx.stroke()
}

function drawMarkLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  r: number,
  dpr: number,
): void {
  ctx.font = `${10 * dpr}px Montserrat, sans-serif`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'bottom'

  const metrics = ctx.measureText(label)
  const tw = metrics.width
  const th = 10 * dpr
  const px = 4 * dpr
  const py = 2 * dpr
  const labelY = -(r + 4 * dpr)

  // Backing rect
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath()
  ctx.roundRect(
    -tw / 2 - px,
    labelY - th - py,
    tw + px * 2,
    th + py * 2,
    2 * dpr,
  )
  ctx.fill()

  // Text
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(label, 0, labelY)
}

function drawGateLine(rc: RenderContext, mark: Mark): void {
  // Find the paired gate buoy with the same gateId
  const partner = rc.scene.marks.find(
    m => m.id !== mark.id && m.gateId === mark.gateId,
  )
  if (!partner) return

  const { ctx, canvas, camera, dpr } = rc
  const a = worldToScreen(mark.position,    camera, canvas)
  const b = worldToScreen(partner.position, camera, canvas)

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.setLineDash([6 * dpr, 4 * dpr])
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth   = 1 * dpr
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}
