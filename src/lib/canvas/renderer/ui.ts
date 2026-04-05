import type { RenderContext } from '../types.ts'
import { worldToScreen } from './coords.ts'

// ─── Labels ───────────────────────────────────────────────────────────────────

export function drawLabels(rc: RenderContext): void {
  for (const boat of rc.scene.boats) {
    const { ctx, canvas, camera, dpr } = rc
    const screen = worldToScreen(boat.position, camera, canvas)

    const label      = boat.label
    const fontSize   = 10 * dpr
    const labelOffY  = 26 * dpr   // fixed screen-space offset above boat centre

    ctx.font         = `${fontSize}px Oswald, sans-serif`
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
    ctx.fillStyle = 'rgba(0,26,53,0.78)'
    ctx.beginPath()
    ctx.roundRect(bx, by, bw, bh, 4 * dpr)
    ctx.fill()

    // Border — thicker/brighter for player
    ctx.strokeStyle = boat.isPlayer
      ? 'rgba(255,203,5,0.6)'
      : 'rgba(255,203,5,0.3)'
    ctx.lineWidth = 1 * dpr
    ctx.stroke()

    // Text
    ctx.fillStyle = boat.isPlayer ? '#FFCB05' : '#FFFFFF'
    ctx.fillText(label, screen.x, screen.y - labelOffY)
  }
}

// ─── Compass Rose ─────────────────────────────────────────────────────────────

export function drawCompassRose(rc: RenderContext): void {
  const { ctx, canvas, dpr } = rc
  const r      = 28 * dpr
  const inset  = 60 * dpr
  const cx     = canvas.width  - inset
  const cy     = canvas.height - inset

  ctx.save()
  ctx.translate(cx, cy)

  // Background circle
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle   = 'rgba(0,26,53,0.6)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,203,5,0.3)'
  ctx.lineWidth   = 1 * dpr
  ctx.stroke()

  // Tick marks at 8 cardinal/intercardinal directions
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const
  for (let i = 0; i < 8; i++) {
    const angle   = (i * 45 * Math.PI) / 180
    const isCard  = i % 2 === 0   // N, E, S, W
    const isNorth = i === 0
    const inner   = isNorth ? r * 0.45 : isCard ? r * 0.55 : r * 0.65
    const outer   = r * 0.85

    const sin = Math.sin(angle)
    const cos = Math.cos(angle)    // -cos so 0° is up
    const neg = -Math.cos(angle)

    ctx.beginPath()
    ctx.moveTo(sin * inner, neg * inner)
    ctx.lineTo(sin * outer, neg * outer)
    ctx.strokeStyle = isNorth ? '#FFCB05' : isCard ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)'
    ctx.lineWidth   = (isNorth ? 2 : 1) * dpr
    ctx.stroke()
  }

  // Cardinal labels
  const labelDist = r * 0.55
  ctx.font         = `${7 * dpr}px Oswald, sans-serif`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'

  for (const [i, letter] of (['N', 'E', 'S', 'W'] as const).entries()) {
    const angle = (i * 90 * Math.PI) / 180
    const lx    =  Math.sin(angle) * labelDist
    const ly    = -Math.cos(angle) * labelDist
    ctx.fillStyle = letter === 'N' ? '#FFCB05' : 'rgba(255,255,255,0.55)'
    ctx.fillText(letter, lx, ly)
  }

  ctx.restore()
}

// ─── Grid (Whiteboard mode) ───────────────────────────────────────────────────

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
      ctx.strokeStyle = isMajor
        ? 'rgba(255,255,255,0.13)'
        : 'rgba(255,255,255,0.07)'
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
