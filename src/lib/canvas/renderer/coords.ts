import type { Vec2, Camera } from '../types.ts'

/**
 * Maps a world-space point (metres) to canvas physical pixels.
 *
 * Formula:
 *   screenX = (canvas.width  / 2) + (world.x - camera.center.x) * camera.zoom
 *   screenY = (canvas.height / 2) + (world.y - camera.center.y) * camera.zoom
 *
 * canvas.width/height are already in physical pixels (multiplied by DPR by GameCanvas).
 */
export function worldToScreen(world: Vec2, camera: Camera, canvas: HTMLCanvasElement): Vec2 {
  return {
    x: canvas.width  / 2 + (world.x - camera.center.x) * camera.zoom,
    y: canvas.height / 2 + (world.y - camera.center.y) * camera.zoom,
  }
}

/**
 * Maps a canvas physical-pixel point back to world space (metres).
 * Inverse of worldToScreen.
 */
export function screenToWorld(screen: Vec2, camera: Camera, canvas: HTMLCanvasElement): Vec2 {
  return {
    x: camera.center.x + (screen.x - canvas.width  / 2) / camera.zoom,
    y: camera.center.y + (screen.y - canvas.height / 2) / camera.zoom,
  }
}

/**
 * Normalises an angle to [0, 360).
 */
export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/**
 * Shortest-path linear interpolation between two angles.
 * Handles the 359° → 1° wrap-around correctly.
 */
export function lerpAngle(a: number, b: number, t: number): number {
  const diff = ((b - a + 540) % 360) - 180 // diff ∈ [-180, 180)
  return normalizeAngle(a + diff * t)
}

/**
 * Linear interpolation between two Vec2 points.
 */
export function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  }
}
