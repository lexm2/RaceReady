/**
 * Single source of truth for canvas hex literals. Canvas can't read CSS
 * variables cheaply, so brand colours are duplicated here. Keep in sync with
 * src/lib/themes/themes.css.
 */

export const CANVAS_PALETTE = {
  maize:         '#FFCB05',
  michiganBlue:  '#00274C',
  arboretumBlue: '#2f65a7',
  rossOrange:    '#d86018',
  tappanRed:     '#9a3324',
  taubmanTeal:   '#00b2a9',
  pumaBlack:     '#131516',
  white:         '#FFFFFF',

  // Depth tints of Michigan Blue used by the water gradient.
  waterDeep:     '#001a35',
  waterMid:      '#002255',
  waterShallow:  '#003366',

  mastBlack:     '#1a1a2e',

  // Sailing convention green; no direct brand equivalent.
  starboardGreen: '#22c55e',
} as const

export type CanvasColorKey = keyof typeof CANVAS_PALETTE

/** Builds an rgba() string from a hex colour and alpha [0..1]. */
export function hexWithAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** Hull / sail colour aliases accepted by `BoatState.hullColor` and `sailColor`. */
export const BOAT_COLOR_ALIASES: Record<string, string> = {
  maize:     CANVAS_PALETTE.maize,
  blue:      CANVAS_PALETTE.michiganBlue,
  arboretum: CANVAS_PALETTE.arboretumBlue,
  orange:    CANVAS_PALETTE.rossOrange,
  teal:      CANVAS_PALETTE.taubmanTeal,
  red:       CANVAS_PALETTE.tappanRed,
  white:     CANVAS_PALETTE.white,
}

/** Resolves a boat colour alias ('maize', 'blue', ...) or returns the input as-is. */
export function resolveBoatColor(value: string): string {
  return BOAT_COLOR_ALIASES[value] ?? value
}

export const MARK_FILL = {
  port:      CANVAS_PALETTE.rossOrange,
  starboard: CANVAS_PALETTE.starboardGreen,
  none:      CANVAS_PALETTE.maize,
}

export const VIOLATION_COLORS = {
  advisory:  {
    stroke: hexWithAlpha(CANVAS_PALETTE.maize,      0.85),
    fill:   hexWithAlpha(CANVAS_PALETTE.maize,      0.10),
  },
  warning:   {
    stroke: hexWithAlpha(CANVAS_PALETTE.rossOrange, 0.95),
    fill:   hexWithAlpha(CANVAS_PALETTE.rossOrange, 0.18),
  },
  violation: {
    stroke: hexWithAlpha(CANVAS_PALETTE.tappanRed,  1.00),
    fill:   hexWithAlpha(CANVAS_PALETTE.tappanRed,  0.25),
  },
} as const

/** Polar-speed leg colour by symmetric true-wind angle. */
export const LEG_SPEED_COLORS = {
  upwind:   hexWithAlpha(CANVAS_PALETTE.rossOrange,    0.95),
  reach:    hexWithAlpha(CANVAS_PALETTE.taubmanTeal,   0.95),
  downwind: hexWithAlpha(CANVAS_PALETTE.arboretumBlue, 0.95),
} as const
