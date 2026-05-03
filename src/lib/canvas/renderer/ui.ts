import type { RenderContext, BoatState } from '../types.ts'
import { worldToScreen } from './coords.ts'
import { CANVAS_PALETTE, hexWithAlpha } from './colors.ts'

// Constants shared with GameCanvas for hit-testing
/** Hull length in world units - must match boat.ts. */
export const HULL_LENGTH_M = 10

const SELECTION_RING_STROKE = hexWithAlpha(CANVAS_PALETTE.maize, 0.65)
const SELECTION_STEM_STROKE = hexWithAlpha(CANVAS_PALETTE.maize, 0.45)
const LABEL_BACKING_FILL    = hexWithAlpha(CANVAS_PALETTE.waterDeep, 0.78)
const LABEL_BORDER_PLAYER   = hexWithAlpha(CANVAS_PALETTE.maize, 0.6)
const LABEL_BORDER_OTHER    = hexWithAlpha(CANVAS_PALETTE.maize, 0.3)
const GRID_MAJOR_STROKE     = hexWithAlpha(CANVAS_PALETTE.white, 0.13)
const GRID_MINOR_STROKE     = hexWithAlpha(CANVAS_PALETTE.white, 0.07)
/** Returns the screen-space position of the rotation handle for a given boat. */
export function getHandleScreenPos(
  boat: BoatState,
  camera: { center: { x: number; y: number }; zoom: number },
  canvas: HTMLCanvasElement,
  dpr: number,
): { x: number; y: number } {
  const screen = worldToScreen(boat.position, camera, canvas)
  const L      = HULL_LENGTH_M * camera.zoom
  const ringR  = Math.max(L * 0.65, 30 * dpr)
  const dist   = ringR + 25 * dpr
  const rad    = (boat.heading * Math.PI) / 180
  return {
    x: screen.x + Math.sin(rad) * dist,
    y: screen.y - Math.cos(rad) * dist,
  }
}

// Selection ring

export function drawSelectionRing(rc: RenderContext): void {
  if (!rc.selectedBoatId) return
  const boat = rc.scene.boats.find(b => b.id === rc.selectedBoatId)
  if (!boat) return

  const { ctx, canvas, camera, dpr } = rc
  const screen  = worldToScreen(boat.position, camera, canvas)
  const L       = HULL_LENGTH_M * camera.zoom
  const ringR   = Math.max(L * 0.65, 30 * dpr)
  const handle  = getHandleScreenPos(boat, camera, canvas, dpr)
  const headRad = (boat.heading * Math.PI) / 180

  ctx.save()

  // Dashed ring around the boat
  ctx.beginPath()
  ctx.arc(screen.x, screen.y, ringR, 0, Math.PI * 2)
  ctx.setLineDash([5 * dpr, 4 * dpr])
  ctx.strokeStyle = SELECTION_RING_STROKE
  ctx.lineWidth   = 1.5 * dpr
  ctx.stroke()
  ctx.setLineDash([])

  // Stem line from ring edge to handle
  const stemStartX = screen.x + Math.sin(headRad) * ringR
  const stemStartY = screen.y - Math.cos(headRad) * ringR
  ctx.beginPath()
  ctx.moveTo(stemStartX, stemStartY)
  ctx.lineTo(handle.x, handle.y)
  ctx.strokeStyle = SELECTION_STEM_STROKE
  ctx.lineWidth   = 1 * dpr
  ctx.stroke()

  // Handle dot
  const hr = 6 * dpr
  ctx.beginPath()
  ctx.arc(handle.x, handle.y, hr, 0, Math.PI * 2)
  ctx.fillStyle   = CANVAS_PALETTE.maize
  ctx.fill()
  ctx.strokeStyle = CANVAS_PALETTE.michiganBlue
  ctx.lineWidth   = 1.5 * dpr
  ctx.stroke()

  // Small arrow inside the handle to hint "rotate"
  ctx.save()
  ctx.translate(handle.x, handle.y)
  ctx.rotate(headRad)
  ctx.beginPath()
  ctx.arc(0, 0, hr * 0.45, -Math.PI * 0.75, Math.PI * 0.25)
  ctx.strokeStyle = CANVAS_PALETTE.michiganBlue
  ctx.lineWidth   = 1 * dpr
  ctx.stroke()
  ctx.restore()

  ctx.restore()
}

// Labels

export function drawLabels(rc: RenderContext): void {
  for (const boat of rc.scene.boats) {
    const { ctx, canvas, camera, dpr } = rc
    const screen = worldToScreen(boat.position, camera, canvas)

    const label      = boat.label
    const fontSize   = 10 * dpr
    const labelOffY  = 26 * dpr   // fixed screen-space offset above boat centre

    ctx.font         = `${fontSize}px Montserrat, sans-serif`
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'bottom'

    const metrics = ctx.measureText(label)
    const tw = metrics.width
    const th = fontSize
    const px = 4 * dpr
    const py = 2 * dpr

    const bx = screen.x - tw / 2 - px
    const by = screen.y - labelOffY - th - py
    const bw = tw + px * 2
    const bh = th + py * 2

    // Backing rect
    ctx.fillStyle = LABEL_BACKING_FILL
    ctx.beginPath()
    ctx.roundRect(bx, by, bw, bh, 4 * dpr)
    ctx.fill()

    // Border - thicker/brighter for player
    ctx.strokeStyle = boat.isPlayer ? LABEL_BORDER_PLAYER : LABEL_BORDER_OTHER
    ctx.lineWidth = 1 * dpr
    ctx.stroke()

    // Text
    ctx.fillStyle = boat.isPlayer ? CANVAS_PALETTE.maize : CANVAS_PALETTE.white
    ctx.fillText(label, screen.x, screen.y - labelOffY)
  }
}

// Grid (Whiteboard mode)

export function drawGrid(rc: RenderContext): void {
  const { ctx, canvas, camera, scene, dpr } = rc

  // World extents visible on screen
  const halfW = (canvas.width  / 2) / camera.zoom
  const halfH = (canvas.height / 2) / camera.zoom
  const worldLeft   = camera.center.x - halfW
  const worldRight  = camera.center.x + halfW
  const worldTop    = camera.center.y - halfH
  const worldBottom = camera.center.y + halfH

  const MINOR = 10   // metres between minor grid lines
  const MAJOR = 50   // metres between major grid lines

  ctx.save()

  function gridLines(
    from: number,
    to: number,
    step: number,
    isHoriz: boolean,
    worldExtentFrom: number,
    worldExtentTo: number,
  ): void {
    const start = Math.floor(from / step) * step
    for (let w = start; w <= to; w += step) {
      const isMajor = w % MAJOR === 0
      const screen  = worldToScreen(
        isHoriz ? { x: 0, y: w } : { x: w, y: 0 },
        camera,
        canvas,
      )

      const ext1 = worldToScreen(
        isHoriz ? { x: worldExtentFrom, y: w } : { x: w, y: worldExtentFrom },
        camera,
        canvas,
      )
      const ext2 = worldToScreen(
        isHoriz ? { x: worldExtentTo,   y: w } : { x: w, y: worldExtentTo   },
        camera,
        canvas,
      )

      ctx.beginPath()
      if (isHoriz) {
        ctx.moveTo(ext1.x, screen.y)
        ctx.lineTo(ext2.x, screen.y)
      } else {
        ctx.moveTo(screen.x, ext1.y)
        ctx.lineTo(screen.x, ext2.y)
      }
      ctx.strokeStyle = isMajor ? GRID_MAJOR_STROKE : GRID_MINOR_STROKE
      ctx.lineWidth = (isMajor ? 0.75 : 0.5) * dpr
      ctx.stroke()
    }
  }

  // Horizontal lines (constant y in world)
  gridLines(worldTop, worldBottom, MINOR, true,  worldLeft, worldRight)
  // Vertical lines (constant x in world)
  gridLines(worldLeft, worldRight, MINOR, false, worldTop, worldBottom)

  ctx.restore()
}
