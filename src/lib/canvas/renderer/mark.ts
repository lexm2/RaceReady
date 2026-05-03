import type { RenderContext, Mark } from '../types.ts'
import { worldToScreen } from './coords.ts'
import { CANVAS_PALETTE, MARK_FILL, hexWithAlpha } from './colors.ts'

const BUOY_RADIUS  = 6    // screen px (constant regardless of zoom - always legible)
/** Zone radius per RRS: 3 boat lengths. Boat length = 10 m -> 30 m. */
const ZONE_RADIUS_M = 30

const BUOY_STROKE_DEFAULT  = hexWithAlpha(CANVAS_PALETTE.white, 0.9)
const BUOY_HIGHLIGHT_FILL  = hexWithAlpha(CANVAS_PALETTE.white, 0.45)
const COMMITTEE_MAST       = hexWithAlpha(CANVAS_PALETTE.white, 0.7)
const LABEL_BACKING        = 'rgba(0,0,0,0.5)'
const GATE_LINE_STROKE     = hexWithAlpha(CANVAS_PALETTE.white, 0.3)

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
  const zoneR = ZONE_RADIUS_M * zoom

  const sideHex     = MARK_FILL[mark.side]
  const fillColor   = hexWithAlpha(sideHex, 0.06)
  const strokeColor = hexWithAlpha(sideHex, 0.45)

  ctx.save()

  ctx.beginPath()
  ctx.arc(screen.x, screen.y, zoneR, 0, Math.PI * 2)
  ctx.fillStyle = fillColor
  ctx.fill()

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
  const fill   = MARK_FILL[mark.side]
  const stroke = mark.side === 'none' ? CANVAS_PALETTE.michiganBlue : BUOY_STROKE_DEFAULT

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
  ctx.fillStyle = BUOY_HIGHLIGHT_FILL
  ctx.fill()
}

function drawCommitteeBoat(ctx: CanvasRenderingContext2D, r: number, dpr: number): void {
  const w = 24 * dpr
  const h = 10 * dpr
  const cr = 2 * dpr

  // Rounded rectangle hull
  ctx.beginPath()
  ctx.roundRect(-w / 2, -h / 2, w, h, cr)
  ctx.fillStyle   = CANVAS_PALETTE.waterMid
  ctx.fill()
  ctx.strokeStyle = CANVAS_PALETTE.maize
  ctx.lineWidth   = 1.5 * dpr
  ctx.stroke()

  // Mast line
  ctx.beginPath()
  ctx.moveTo(0, -h / 2)
  ctx.lineTo(0, -h / 2 - 8 * dpr)
  ctx.strokeStyle = COMMITTEE_MAST
  ctx.lineWidth   = 1 * dpr
  ctx.stroke()
}

function drawPinEnd(ctx: CanvasRenderingContext2D, r: number, dpr: number): void {
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
  ctx.fillStyle   = CANVAS_PALETTE.white
  ctx.fill()
  ctx.strokeStyle = CANVAS_PALETTE.michiganBlue
  ctx.lineWidth   = 1.5 * dpr
  ctx.stroke()

  // X mark
  const s = r * 0.35
  ctx.beginPath()
  ctx.moveTo(-s, -s); ctx.lineTo(s, s)
  ctx.moveTo( s, -s); ctx.lineTo(-s, s)
  ctx.strokeStyle = CANVAS_PALETTE.michiganBlue
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
  ctx.fillStyle = LABEL_BACKING
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
  ctx.fillStyle = CANVAS_PALETTE.white
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
  ctx.strokeStyle = GATE_LINE_STROKE
  ctx.lineWidth   = 1 * dpr
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}
