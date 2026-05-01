<script lang="ts">
  import type {
    GameCanvasProps,
    RenderContext,
    Camera,
    SceneState,
    AnimationPlayback,
    Vec2,
  } from './types.ts'
  import { renderScene } from './renderer/index.ts'
  import { worldToScreen, screenToWorld, lerpVec2, lerpAngle, normalizeAngle } from './renderer/coords.ts'
  import { getHandleScreenPos } from './renderer/ui.ts'

  // ── Props ────────────────────────────────────────────────────────────────────
  let {
    scene,
    camera: cameraProp,
    animation,
    animationSpeed = 1,
    interactive = false,
    selectedBoatId,
    onBoatClick,
    onMarkClick,
    onBoatDrag,
    onMarkDrag,
    onBoatRotate,
    onWaypointDrag,
    onCanvasContextMenu,
    onBackgroundClick,
    class: className = '',
  }: GameCanvasProps = $props()

  // ── Element refs ─────────────────────────────────────────────────────────────
  let canvasEl  = $state<HTMLCanvasElement | null>(null)
  let wrapperEl = $state<HTMLDivElement | null>(null)

  // ── Internal state ───────────────────────────────────────────────────────────
  let dpr            = $state(window.devicePixelRatio || 1)
  let rafId          = $state(0)
  let playback       = $state<AnimationPlayback | null>(null)
  let canvasSize     = $state({ w: 0, h: 0 })  // CSS px; used by autoFitCamera
  let virtualAnimTime = 0   // accumulated animation time in seconds (speed-scaled)
  let lastRafTs       = 0   // wall timestamp of previous rAF frame

  // ── Derived camera ───────────────────────────────────────────────────────────
  let camera = $derived<Camera>(
    cameraProp ?? autoFitCamera(scene.worldSize, canvasSize.w, canvasSize.h, dpr),
  )

  function autoFitCamera(
    worldSize: Vec2,
    cssW: number,
    cssH: number,
    _dpr: number,
  ): Camera {
    const FILL = 0.88
    if (cssW === 0 || cssH === 0) {
      return { center: { x: worldSize.x / 2, y: worldSize.y / 2 }, zoom: 8 }
    }
    // zoom in physical px/m - canvas dimensions are in physical px
    const physW = cssW  * _dpr
    const physH = cssH  * _dpr
    const zoom  = Math.min(physW / worldSize.x, physH / worldSize.y) * FILL
    return {
      center: { x: worldSize.x / 2, y: worldSize.y / 2 },
      zoom,
    }
  }

  // ── Resize ───────────────────────────────────────────────────────────────────
  $effect(() => {
    if (!wrapperEl || !canvasEl) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      dpr = window.devicePixelRatio || 1
      canvasEl!.width          = Math.floor(width  * dpr)
      canvasEl!.height         = Math.floor(height * dpr)
      canvasEl!.style.width    = `${width}px`
      canvasEl!.style.height   = `${height}px`
      canvasSize = { w: width, h: height }
      // Synchronous repaint on resize so there's no blank frame
      drawFrame(performance.now())
    })

    ro.observe(wrapperEl)
    return () => ro.disconnect()
  })

  // ── Animation setup ──────────────────────────────────────────────────────────
  $effect(() => {
    if (!animation) {
      playback         = null
      virtualAnimTime  = 0
      lastRafTs        = 0
      return
    }
    playback         = { clip: animation, playing: true, currentTime: 0, startWallTime: performance.now() }
    virtualAnimTime  = 0
    lastRafTs        = 0
  })

  // ── rAF loop ─────────────────────────────────────────────────────────────────
  $effect(() => {
    if (!canvasEl) return
    let running = true

    function loop(ts: DOMHighResTimeStamp): void {
      if (!running) return
      drawFrame(ts)
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => {
      running = false
      cancelAnimationFrame(rafId)
    }
  })

  // ── Core draw function ────────────────────────────────────────────────────────
  function drawFrame(timestamp: DOMHighResTimeStamp): void {
    if (!canvasEl) return
    const ctx = canvasEl.getContext('2d')
    if (!ctx) return

    // Advance animation clock via delta-time so speed changes never cause a jump
    let animTime = 0
    if (playback?.playing) {
      const dt = lastRafTs > 0 ? (timestamp - lastRafTs) / 1000 : 0
      virtualAnimTime += dt * animationSpeed

      if (playback.clip.loop) {
        animTime = virtualAnimTime % playback.clip.durationSec
      } else {
        animTime = Math.min(virtualAnimTime, playback.clip.durationSec)
        if (virtualAnimTime >= playback.clip.durationSec) {
          playback = { ...playback, playing: false, currentTime: playback.clip.durationSec }
        }
      }
      if (playback.playing) {
        playback = { ...playback, currentTime: animTime }
      }
    }
    lastRafTs = timestamp

    const resolvedScene: SceneState = playback
      ? applyAnimation(scene, playback, animTime)
      : scene

    const rc: RenderContext = {
      ctx,
      canvas:    canvasEl,
      scene:     resolvedScene,
      camera,
      dpr,
      timestamp,
      animTime,
      selectedBoatId,
    }

    renderScene(rc)
  }

  // ── Animation interpolation ───────────────────────────────────────────────────
  function applyAnimation(
    base: SceneState,
    pb: AnimationPlayback,
    t: number,
  ): SceneState {
    const frames = pb.clip.keyframes
    if (frames.length === 0) return base

    // Clamp t
    const clampedT = Math.max(0, Math.min(t, frames[frames.length - 1]!.time))

    // Find surrounding keyframe pair
    let aIdx = 0
    for (let i = 0; i < frames.length - 1; i++) {
      if (clampedT >= frames[i]!.time) aIdx = i
    }
    const a = frames[aIdx]!
    const b = frames[Math.min(aIdx + 1, frames.length - 1)]!

    const segDur = b.time - a.time
    const raw    = segDur === 0 ? 0 : (clampedT - a.time) / segDur
    const eased  = pb.clip.easing ? pb.clip.easing(raw) : raw

    const bMap = new Map(b.boats.map(bd => [bd.boatId, bd]))

    const animatedBoats = base.boats.map(boat => {
      const aData = a.boats.find(bd => bd.boatId === boat.id)
      const bData = bMap.get(boat.id)
      if (!aData || !bData) return boat
      return {
        ...boat,
        position: lerpVec2(aData.position, bData.position, eased),
        heading:  lerpAngle(aData.heading, bData.heading, eased),
      }
    })

    return { ...base, boats: animatedBoats }
  }

  // ── Hit-testing ───────────────────────────────────────────────────────────────
  const BOAT_HIT_M       = 6    // world-space metres
  const MARK_HIT_M       = 4
  const WAYPOINT_HIT_M   = 5
  const HANDLE_HIT_PX    = 10   // screen-space CSS px

  function eventToScreen(e: MouseEvent): Vec2 | null {
    if (!canvasEl) return null
    const rect = canvasEl.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top)  * dpr,
    }
  }

  function eventToWorld(e: MouseEvent): Vec2 | null {
    const screen = eventToScreen(e)
    if (!screen || !canvasEl) return null
    return screenToWorld(screen, camera, canvasEl)
  }

  function hitHandle(screenPx: Vec2): string | null {
    if (!selectedBoatId || !canvasEl) return null
    const boat = scene.boats.find(b => b.id === selectedBoatId)
    if (!boat) return null
    const handle = getHandleScreenPos(boat, camera, canvasEl, dpr)
    const d = Math.hypot(screenPx.x - handle.x, screenPx.y - handle.y)
    return d < HANDLE_HIT_PX * dpr ? boat.id : null
  }

  function hitBoat(worldPos: Vec2): string | null {
    for (const boat of scene.boats) {
      const d = Math.hypot(boat.position.x - worldPos.x, boat.position.y - worldPos.y)
      if (d < BOAT_HIT_M) return boat.id
    }
    return null
  }

  function hitMark(worldPos: Vec2): string | null {
    for (const mark of scene.marks) {
      const d = Math.hypot(mark.position.x - worldPos.x, mark.position.y - worldPos.y)
      if (d < MARK_HIT_M) return mark.id
    }
    return null
  }

  function hitWaypoint(worldPos: Vec2): string | null {
    for (const wp of (scene.waypoints ?? [])) {
      const d = Math.hypot(wp.position.x - worldPos.x, wp.position.y - worldPos.y)
      if (d < WAYPOINT_HIT_M) return wp.id
    }
    return null
  }

  function headingFromScreenPos(boatId: string, screenPx: Vec2): number | null {
    if (!canvasEl) return null
    const boat = scene.boats.find(b => b.id === boatId)
    if (!boat) return null
    const boatScreen = worldToScreen(boat.position, camera, canvasEl)
    const dx = screenPx.x - boatScreen.x
    const dy = screenPx.y - boatScreen.y
    return normalizeAngle((Math.atan2(dx, -dy) * 180) / Math.PI)
  }

  function handleClick(e: MouseEvent): void {
    if (!interactive) return
    const world = eventToWorld(e)
    if (!world) return

    const boatId = hitBoat(world)
    if (boatId) { onBoatClick?.(boatId); return }

    const markId = hitMark(world)
    if (markId) { onMarkClick?.(markId); return }

    onBackgroundClick?.(world)
  }

  // ── Drag ─────────────────────────────────────────────────────────────────────
  let dragTarget = $state<{ type: 'boat' | 'mark' | 'rotate' | 'waypoint'; id: string } | null>(null)

  function handleMouseDown(e: MouseEvent): void {
    if (!interactive) return
    const screen = eventToScreen(e)
    if (!screen) return

    // Check rotation handle first (screen-space, higher priority)
    const handleBoatId = hitHandle(screen)
    if (handleBoatId) {
      dragTarget = { type: 'rotate', id: handleBoatId }
      return
    }

    const world = screenToWorld(screen, camera, canvasEl!)
    const boatId = hitBoat(world)
    if (boatId) { dragTarget = { type: 'boat', id: boatId }; return }

    const waypointId = hitWaypoint(world)
    if (waypointId) { dragTarget = { type: 'waypoint', id: waypointId }; return }

    const markId = hitMark(world)
    if (markId) { dragTarget = { type: 'mark', id: markId }; return }
  }

  function handleMouseMove(e: MouseEvent): void {
    if (!dragTarget) return

    if (dragTarget.type === 'rotate') {
      const screen = eventToScreen(e)
      if (!screen) return
      const heading = headingFromScreenPos(dragTarget.id, screen)
      if (heading !== null) onBoatRotate?.(dragTarget.id, heading)
      return
    }

    const world = eventToWorld(e)
    if (!world) return
    if (dragTarget.type === 'boat')     onBoatDrag?.(dragTarget.id, world)
    else if (dragTarget.type === 'mark') onMarkDrag?.(dragTarget.id, world)
    else if (dragTarget.type === 'waypoint') onWaypointDrag?.(dragTarget.id, world)
  }

  function handleContextMenu(e: MouseEvent): void {
    e.preventDefault()
    if (!interactive) return
    const world = eventToWorld(e)
    if (!world) return
    onCanvasContextMenu?.(world)
  }

  function handleMouseUp(): void {
    dragTarget = null
  }
</script>

<div
  class="canvas-wrapper{className ? ` ${className}` : ''}"
  class:interactive
  bind:this={wrapperEl}
>
  <canvas
    bind:this={canvasEl}
    onclick={handleClick}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
    oncontextmenu={handleContextMenu}
    role={interactive ? 'application' : 'img'}
    aria-label="Sailing scenario diagram"
  ></canvas>
</div>

<style>
  .canvas-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: var(--radius-md);
    /* Fallback color while first frame renders */
    background: #001a35;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    cursor: default;
  }

  .canvas-wrapper.interactive canvas {
    cursor: crosshair;
  }

  .canvas-wrapper.interactive canvas:active {
    cursor: grabbing;
  }
</style>
