<script lang="ts">
  import { onMount } from 'svelte'
  import GameCanvas from '$lib/canvas/GameCanvas.svelte'
  import type { SceneState, BoatState, Mark, Vec2, Waypoint, AnimationClip, AnimationKeyframe, BoatKeyframeData, RuleViolation } from '$lib/canvas/types.ts'
  import { calcLegSpeed } from '$lib/canvas/renderer/waypoint.ts'
  import { lerpAngle } from '$lib/canvas/renderer/coords.ts'
  import { evaluateScene } from '$lib/rules/logic.ts'
  import { RULES_BY_ID } from '$lib/data/rulesIndex.ts'
  import { PRESETS_BY_ID } from '$lib/whiteboardPresets.ts'
  import { base } from '$app/paths'
  import { Play, Square, Pause } from 'lucide-svelte'

  // ── Default scene ──────────────────────────────────────────────────
  let scene = $state<SceneState>({
    worldSize: { x: 300, y: 220 },
    wind: { directionDeg: 0, speedKnots: 10 },
    marks: [
      { id: 'mark-1', position: { x: 150, y: 40  }, type: 'buoy', side: 'port',      label: '1' },
      { id: 'mark-2', position: { x: 150, y: 180 }, type: 'buoy', side: 'starboard', label: '2' },
    ],
    courseLegs: [
      { from: 'mark-2', to: 'mark-1' },
    ],
    boats: [
      // Default scene is a Rule 10 (port-starboard) crossing — boats on
      // opposite tacks, ~16 m apart, on a converging upwind course. The
      // rule evaluator should ring Boat B (port tack) as the keep-clear boat.
      {
        id: 'boat-a',
        position:   { x: 158, y: 120 },
        heading:    315,           // NW, close-hauled starboard with wind from N
        tack:       'starboard',
        speed:      6,
        hullColor:  'maize',
        sailColor:  'blue',
        label:      'Boat A',
        isPlayer:   true,
      },
      {
        id: 'boat-b',
        position:   { x: 142, y: 120 },
        heading:    45,            // NE, close-hauled port with wind from N
        tack:       'port',
        speed:      5,
        hullColor:  'orange',
        sailColor:  'white',
        label:      'Boat B',
        isPlayer:   false,
      },
    ],
    display: {
      showLabels:        true,
      showWake:          true,
      showWindStreaks:    true,
      showWindIndicator: true,
      showGrid:          true,
    },
    waypoints: [],
  })

  // ── Drag handlers - parent owns scene state ────────────────────────
  function onBoatDrag(boatId: string, pos: Vec2): void {
    scene = {
      ...scene,
      boats: scene.boats.map(b =>
        b.id === boatId ? { ...b, position: pos } : b
      ),
    }
  }

  function onMarkDrag(markId: string, pos: Vec2): void {
    scene = {
      ...scene,
      marks: scene.marks.map(m =>
        m.id === markId ? { ...m, position: pos } : m
      ),
    }
  }

  // ── Selection & rotation ───────────────────────────────────────────
  let selectedBoatId = $state<string | undefined>(undefined)

  function onBoatClick(boatId: string): void {
    selectedBoatId = selectedBoatId === boatId ? undefined : boatId
  }

  function onBackgroundClick(): void {
    selectedBoatId = undefined
  }

  function onBoatRotate(boatId: string, heading: number): void {
    scene = {
      ...scene,
      boats: scene.boats.map(b => {
        if (b.id !== boatId) return b
        // Auto-derive tack from new heading relative to wind
        const awa  = ((scene.wind.directionDeg - heading) % 360 + 360) % 360
        const tack = awa < 180 ? 'starboard' : 'port'
        return { ...b, heading, tack }
      }),
    }
  }


  // ── Display toggles ────────────────────────────────────────────────
  function toggle(key: keyof typeof scene.display): void {
    scene = {
      ...scene,
      display: { ...scene.display, [key]: !scene.display[key] },
    }
  }

  // ── Boats ──────────────────────────────────────────────────────────
  const COLOR_HEX: Record<string, string> = {
    maize: '#FFCB05', blue: '#00274C', arboretum: '#2f65a7',
    orange: '#d86018', teal: '#00b2a9', red: '#9a3324', white: '#FFFFFF',
  }
  function hullHex(c: string): string { return COLOR_HEX[c] ?? c }

  const NEW_BOAT_COLORS = [
    { hull: 'teal',      sail: 'white' },
    { hull: 'arboretum', sail: 'maize' },
    { hull: 'red',       sail: 'white' },
    { hull: 'blue',      sail: 'maize' },
  ]

  function addBoat(): void {
    const n = scene.boats.length
    const colors = NEW_BOAT_COLORS[n % NEW_BOAT_COLORS.length]
    scene.boats = [...scene.boats, {
      id:        `boat-${Date.now()}`,
      position:  { x: scene.worldSize.x / 2, y: scene.worldSize.y / 2 },
      heading:   0,
      tack:      'starboard',
      speed:     5,
      hullColor: colors.hull,
      sailColor: colors.sail,
      label:     `Boat ${n + 1}`,
      isPlayer:  false,
    }]
  }

  function removeBoat(id: string): void {
    scene.boats = scene.boats.filter(b => b.id !== id)
    if (selectedBoatId === id) selectedBoatId = undefined
  }

  function setBoatColor(id: string, hex: string): void {
    scene.boats = scene.boats.map(b => b.id === id ? { ...b, hullColor: hex } : b)
  }

  /** Cycle through boat conditions for Rule 22. */
  const CONDITION_CYCLE = ['normal', 'capsized', 'anchored', 'aground'] as const
  type Condition = (typeof CONDITION_CYCLE)[number]
  const CONDITION_LABEL: Record<Condition, string> = {
    normal: 'Normal', capsized: 'Capsized', anchored: 'Anchored', aground: 'Aground',
  }
  const CONDITION_ICON: Record<Condition, string> = {
    normal: '○', capsized: 'C', anchored: 'A', aground: 'G',
  }
  function cycleBoatCondition(id: string): void {
    scene.boats = scene.boats.map(b => {
      if (b.id !== id) return b
      const cur = (b.condition ?? 'normal') as Condition
      const next = CONDITION_CYCLE[(CONDITION_CYCLE.indexOf(cur) + 1) % CONDITION_CYCLE.length]!
      return { ...b, condition: next }
    })
  }

  // ── Waypoints ──────────────────────────────────────────────────────
  function onWaypointDrag(waypointId: string, pos: Vec2): void {
    scene = {
      ...scene,
      waypoints: (scene.waypoints ?? []).map(w =>
        w.id === waypointId ? { ...w, position: pos } : w
      ),
    }
  }

  function onCanvasContextMenu(worldPos: Vec2): void {
    if (!selectedBoatId) return
    const boatWps = (scene.waypoints ?? []).filter(w => w.boatId === selectedBoatId)
    scene = {
      ...scene,
      waypoints: [
        ...(scene.waypoints ?? []),
        {
          id:       `wp-${Date.now()}`,
          position: worldPos,
          boatId:   selectedBoatId,
          order:    boatWps.length,
        } satisfies Waypoint,
      ],
    }
  }

  function clearWaypoints(boatId?: string): void {
    scene = {
      ...scene,
      waypoints: boatId
        ? (scene.waypoints ?? []).filter(w => w.boatId !== boatId)
        : [],
    }
  }

  // ── Route animation ────────────────────────────────────────────────
  let currentAnimation = $state<AnimationClip | undefined>(undefined)
  let sailingBoatId    = $state<string | undefined>(undefined)
  let playingAll       = $state(false)
  let paused           = $state(false)
  let timeScale        = $state(7)
  let playbackTime     = $state(0)

  const TURN_RATE     = 60     // degrees per second of heading change
  const TURN_SPEED_MUL = 0.4   // boats slow to ~40% of leg speed during a turn

  function legBearing(from: Vec2, to: Vec2): number {
    return ((Math.atan2(to.x - from.x, -(to.y - from.y)) * 180) / Math.PI + 360) % 360
  }

  function headingVec(deg: number): Vec2 {
    const r = (deg * Math.PI) / 180
    return { x: Math.sin(r), y: -Math.cos(r) }
  }

  interface RouteFrame { time: number; data: BoatKeyframeData }

  function buildBoatRoute(boatId: string): RouteFrame[] | null {
    const boat = scene.boats.find(b => b.id === boatId)
    if (!boat) return null
    const wps = (scene.waypoints ?? [])
      .filter(w => w.boatId === boatId)
      .sort((a, b) => a.order - b.order)
    if (wps.length === 0) return null

    const frames: RouteFrame[] = []
    let t = 0

    function push(heading: number, position: Vec2) {
      frames.push({ time: t, data: { boatId, position, heading } })
    }

    /**
     * Curve through a heading change instead of pivoting in place. Samples the
     * turn in small angular steps; at each step, the boat advances forward
     * along the mid-step heading at a reduced speed. Returns the final
     * position (offset from the pivot, so the next leg starts from there).
     */
    function rotate(pos: Vec2, fromH: number, toH: number): Vec2 {
      const turn = Math.abs(((toH - fromH + 540) % 360) - 180)
      if (turn < 1) return pos

      const turnDuration = turn / TURN_RATE
      const turnSpeedMs = Math.max(boat!.speed * 0.514444 * TURN_SPEED_MUL, 0.2)
      // ~10° per sample, but at least 4 samples for short turns.
      const steps = Math.max(4, Math.ceil(turn / 10))
      const dt    = turnDuration / steps
      const dDist = turnSpeedMs * dt

      let curPos = pos
      let curH   = fromH
      for (let k = 1; k <= steps; k++) {
        const nextH = lerpAngle(fromH, toH, k / steps)
        const midH  = lerpAngle(curH, nextH, 0.5)
        const v     = headingVec(midH)
        curPos = { x: curPos.x + v.x * dDist, y: curPos.y + v.y * dDist }
        t += dt
        push(nextH, curPos)
        curH = nextH
      }
      return curPos
    }

    const firstBearing = legBearing(boat.position, wps[0]!.position)
    push(boat.heading, boat.position)
    let prevPos = rotate(boat.position, boat.heading, firstBearing)

    for (let i = 0; i < wps.length; i++) {
      const wp      = wps[i]!
      const bearing = legBearing(prevPos, wp.position)
      const distM   = Math.hypot(wp.position.x - prevPos.x, wp.position.y - prevPos.y)
      const speedMs = Math.max(calcLegSpeed(bearing, scene.wind.directionDeg) * 0.514444, 0.3)
      t += distM / speedMs
      push(bearing, wp.position)

      const nextPos     = i < wps.length - 1 ? wps[i + 1]!.position : boat.position
      const nextBearing = legBearing(wp.position, nextPos)
      prevPos = rotate(wp.position, bearing, nextBearing)
    }

    return frames
  }

  function sampleBoatAt(frames: RouteFrame[], t: number): BoatKeyframeData {
    const clamped = Math.max(0, Math.min(t, frames.at(-1)!.time))
    let ai = 0
    for (let i = 0; i < frames.length - 1; i++) if (clamped >= frames[i]!.time) ai = i
    const a = frames[ai]!
    const b = frames[Math.min(ai + 1, frames.length - 1)]!
    const seg = b.time - a.time
    const raw = seg === 0 ? 0 : (clamped - a.time) / seg
    return {
      boatId: a.data.boatId,
      position: {
        x: a.data.position.x + (b.data.position.x - a.data.position.x) * raw,
        y: a.data.position.y + (b.data.position.y - a.data.position.y) * raw,
      },
      heading: lerpAngle(a.data.heading, b.data.heading, raw),
    }
  }

  function buildClip(routeMap: Map<string, RouteFrame[]>): AnimationClip {
    const allTimes = new Set<number>()
    let maxDuration = 0
    for (const frames of routeMap.values()) {
      frames.forEach(f => allTimes.add(f.time))
      maxDuration = Math.max(maxDuration, frames.at(-1)!.time)
    }
    const sortedTimes = [...allTimes].sort((a, b) => a - b)
    const keyframes: AnimationKeyframe[] = sortedTimes.map(t => ({
      time: t,
      boats: [...routeMap.entries()].map(([, frames]) => sampleBoatAt(frames, t)),
    }))
    return { keyframes, durationSec: maxDuration, loop: true }
  }

  function playRoute(boatId: string): void {
    const frames = buildBoatRoute(boatId)
    if (!frames) return
    currentAnimation = buildClip(new Map([[boatId, frames]]))
    sailingBoatId    = boatId
    playingAll       = false
  }

  function playAllRoutes(): void {
    const routeMap = new Map<string, RouteFrame[]>()
    for (const boat of scene.boats) {
      const frames = buildBoatRoute(boat.id)
      if (frames) routeMap.set(boat.id, frames)
    }
    if (routeMap.size === 0) return
    currentAnimation = buildClip(routeMap)
    sailingBoatId    = undefined
    playingAll       = true
  }

  function stopRoute(): void {
    currentAnimation = undefined
    sailingBoatId    = undefined
    playingAll       = false
    paused           = false
  }

  function togglePause(): void {
    paused = !paused
  }

  // ── Panel collapse ─────────────────────────────────────────────────
  let panelOpen = $state(true)

  // ── Rule violations ────────────────────────────────────────────────
  let liveViolations = $state<RuleViolation[]>([])

  function onViolationsChanged(violations: RuleViolation[]): void {
    liveViolations = violations
  }

  /** Severity ordering helper. */
  const SEVERITY_RANK = { violation: 3, warning: 2, advisory: 1 } as const

  interface ViolationCard {
    key: string
    severity: RuleViolation['severity']
    ruleId: string
    ruleTitle: string
    violator: string
    rightOfWay: string | null
  }

  // ── Preset loading (?preset=<id> query param) ─────────────────────
  let activePresetTitle = $state<string | null>(null)
  let activePresetHint  = $state<string | null>(null)

  onMount(() => {
    const id = new URLSearchParams(window.location.search).get('preset')
    if (!id) return
    const preset = PRESETS_BY_ID[id]
    if (!preset) return
    scene = preset.scene
    activePresetTitle = preset.title
    activePresetHint  = preset.hint
    if (preset.autoPlay) {
      // Wait a tick so the canvas picks up the new scene before we build the clip.
      setTimeout(() => playAllRoutes(), 50)
    }
  })

  let violationCards = $derived.by<ViolationCard[]>(() => {
    // De-dup: keep the strongest severity per (ruleId, violatorBoatId) pair.
    const strongest = new Map<string, RuleViolation>()
    for (const v of liveViolations) {
      const key = `${v.ruleId}|${v.violatorBoatId}`
      const cur = strongest.get(key)
      if (!cur || SEVERITY_RANK[v.severity] > SEVERITY_RANK[cur.severity]) {
        strongest.set(key, v)
      }
    }
    const labelOf = (id: string) => scene.boats.find(b => b.id === id)?.label ?? id
    return [...strongest.entries()]
      .map(([key, v]): ViolationCard => ({
        key,
        severity: v.severity,
        ruleId: v.ruleId,
        ruleTitle: RULES_BY_ID[v.ruleId]?.title ?? v.ruleId,
        violator: labelOf(v.violatorBoatId),
        rightOfWay: v.rightOfWayBoatId ? labelOf(v.rightOfWayBoatId) : null,
      }))
      .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])
  })
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Whiteboard{activePresetTitle ? ` — ${activePresetTitle}` : ''}</h1>
      <p class="page-subtitle">
        Plan race scenarios: drag boats and marks, set wind direction, and step through situations.
      </p>
    </div>
  </div>

  <div class="whiteboard-layout">
    <!-- Canvas -->
    <div class="canvas-wrap">
      <GameCanvas
        {scene}
        interactive
        animation={currentAnimation}
        animationSpeed={timeScale}
        animationPaused={paused}
        {selectedBoatId}
        {onBoatClick}
        {onBoatDrag}
        {onMarkDrag}
        {onBoatRotate}
        {onBackgroundClick}
        {onWaypointDrag}
        {onCanvasContextMenu}
        ruleEvaluator={evaluateScene}
        {onViolationsChanged}
        bind:animationTime={playbackTime}
      />

      {#if activePresetHint}
        <div class="preset-hint" role="note">
          {activePresetHint}
        </div>
      {/if}

      <!-- Rule violation notifications (top-left) -->
      {#if violationCards.length > 0}
        <div class="violations-overlay" role="status" aria-live="polite">
          {#each violationCards as card (card.key)}
            <div class="violation-card violation-card--{card.severity}">
              <div class="violation-head">
                <span class="violation-sev">{card.severity}</span>
                <span class="violation-rule">{card.ruleTitle}</span>
              </div>
              <p class="violation-body">
                {#if card.ruleId === 'rule_14'}
                  <strong>{card.violator}</strong> must avoid contact.
                {:else if card.ruleId === 'rule_15'}
                  <strong>{card.violator}</strong> just acquired right of way — give <strong>{card.rightOfWay}</strong> room to keep clear.
                {:else if card.ruleId === 'rule_16'}
                  <strong>{card.violator}</strong> is changing course — give <strong>{card.rightOfWay}</strong> room to keep clear.
                {:else if card.ruleId === 'rule_17'}
                  <strong>{card.violator}</strong> may be sailing above proper course.
                {:else}
                  <strong>{card.violator}</strong> must keep clear{#if card.rightOfWay} of <strong>{card.rightOfWay}</strong>{/if}.
                {/if}
              </p>
              <a class="violation-link" href="{base}/resources/rulebook?rule={card.ruleId}">
                View rule →
              </a>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Floating overlay panel -->
      <aside class="overlay-panel" class:open={panelOpen}>
        <button
          class="panel-toggle"
          onclick={() => panelOpen = !panelOpen}
          aria-label={panelOpen ? 'Collapse panel' : 'Expand panel'}
        >
          {panelOpen ? '✕' : '⚙'}
        </button>

        {#if panelOpen}
          <div class="panel-body">
            <section class="panel-section">
              <div class="section-header">
                <h3>Wind</h3>
                <span class="wind-label">{scene.wind.directionDeg}°</span>
              </div>
              <input type="range" min="0" max="359" bind:value={scene.wind.directionDeg} class="wind-slider" />
            </section>

            <section class="panel-section">
              <h3>Display</h3>
              <div class="toggles">
                <label class="toggle"><input type="checkbox" checked={scene.display.showLabels}       onchange={() => toggle('showLabels')}        />Labels</label>
                <label class="toggle"><input type="checkbox" checked={scene.display.showWake}         onchange={() => toggle('showWake')}          />Wakes</label>
                <label class="toggle"><input type="checkbox" checked={scene.display.showWindStreaks}  onchange={() => toggle('showWindStreaks')}   />Wind streaks</label>
                <label class="toggle"><input type="checkbox" checked={scene.display.showGrid}         onchange={() => toggle('showGrid')}          />Grid</label>
                <label class="toggle"><input type="checkbox" checked={scene.display.showWindIndicator} onchange={() => toggle('showWindIndicator')} />Wind indicator</label>
              </div>
            </section>

            <section class="panel-section">
              <h3>Boats</h3>
              <ul class="boat-list">
                {#each scene.boats as boat (boat.id)}
                  {@const condition = (boat.condition ?? 'normal') as Condition}
                  <li class="boat-row">
                    <label class="boat-swatch-wrap" title="Hull color">
                      <input
                        type="color"
                        class="boat-color-picker"
                        value={hullHex(boat.hullColor)}
                        oninput={(e) => setBoatColor(boat.id, (e.target as HTMLInputElement).value)}
                      />
                      <span class="boat-swatch" style="background:{hullHex(boat.hullColor)}"></span>
                    </label>
                    <span class="boat-name">{boat.label}</span>
                    <button
                      class="boat-condition"
                      class:boat-condition--active={condition !== 'normal'}
                      title="Condition: {CONDITION_LABEL[condition]} (click to cycle)"
                      onclick={() => cycleBoatCondition(boat.id)}
                      aria-label="Cycle condition for {boat.label}"
                    >{CONDITION_ICON[condition]}</button>
                    <button class="boat-remove" onclick={() => removeBoat(boat.id)} aria-label="Remove {boat.label}">×</button>
                  </li>
                {/each}
              </ul>
              <button class="add-boat-btn" onclick={addBoat}>+ Add Boat</button>
            </section>

            <section class="panel-section">
              <div class="section-header">
                <h3>Routes</h3>
                {#if (scene.waypoints ?? []).length > 0}
                  {#if playingAll}
                    <div class="route-controls">
                      <button class="route-sail" onclick={togglePause} aria-label={paused ? 'Resume' : 'Pause'}>
                        {#if paused}<Play size={11} strokeWidth={2} />{:else}<Pause size={11} strokeWidth={2} />{/if}
                      </button>
                      <button class="route-sail sailing" onclick={stopRoute} aria-label="Stop all">
                        <Square size={11} strokeWidth={2} />
                      </button>
                    </div>
                  {:else}
                    <button class="route-sail" onclick={playAllRoutes} aria-label="Play all routes">
                      <Play size={11} strokeWidth={2} />
                    </button>
                  {/if}
                {/if}
              </div>
              {#if (scene.waypoints ?? []).length === 0}
                <p class="route-hint">Select a boat, then right-click to place waypoints.</p>
              {:else}
                <ul class="route-list">
                  {#each scene.boats.filter(b => (scene.waypoints ?? []).some(w => w.boatId === b.id)) as boat (boat.id)}
                    {@const count = (scene.waypoints ?? []).filter(w => w.boatId === boat.id).length}
                    <li class="route-row">
                      <span class="route-swatch" style="background:{hullHex(boat.hullColor)}"></span>
                      <span class="route-name">{boat.label}</span>
                      <span class="route-count">{count} pts</span>
                      {#if sailingBoatId === boat.id && !playingAll}
                        <div class="route-controls">
                          <button class="route-sail" onclick={togglePause} aria-label={paused ? 'Resume' : 'Pause'}>
                            {#if paused}<Play size={11} strokeWidth={2} />{:else}<Pause size={11} strokeWidth={2} />{/if}
                          </button>
                          <button class="route-sail sailing" onclick={stopRoute} aria-label="Stop">
                            <Square size={11} strokeWidth={2} />
                          </button>
                        </div>
                      {:else}
                        <button class="route-sail" onclick={() => playRoute(boat.id)} aria-label="Sail route for {boat.label}">
                          <Play size={11} strokeWidth={2} />
                        </button>
                      {/if}
                      <button class="route-clear" onclick={() => { clearWaypoints(boat.id); if (sailingBoatId === boat.id || playingAll) stopRoute() }} aria-label="Clear route for {boat.label}">×</button>
                    </li>
                  {/each}
                </ul>
                <button class="add-boat-btn" onclick={() => { clearWaypoints(); stopRoute() }}>Clear All</button>
              {/if}
              {#if currentAnimation}
                <div class="section-header" style="margin-top: var(--space-2)">
                  <h3>Playback</h3>
                  <label class="speed-edit">
                    <input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.5"
                      bind:value={timeScale}
                      class="speed-input"
                      aria-label="Playback speed multiplier"
                    />
                    <span class="speed-suffix">×</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max={currentAnimation.durationSec}
                  step="0.05"
                  bind:value={playbackTime}
                  class="wind-slider"
                  aria-label="Playback position"
                />
              {/if}
            </section>
          </div>
        {/if}
      </aside>
    </div>
  </div>
</div>

<style>
  .whiteboard-layout {
    padding: var(--space-4) var(--space-6);
    height: calc(100vh - var(--nav-height) - 140px);
    min-height: 0;
  }

  .canvas-wrap {
    position: relative;
    height: 100%;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-card);
  }

  /* ── Preset hint banner ──────────────────────────────────────────── */
  .preset-hint {
    position: absolute;
    bottom: var(--space-3);
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    max-width: min(560px, calc(100% - var(--space-6)));
    padding: var(--space-2) var(--space-3);
    background: color-mix(in srgb, var(--bg-card) 92%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    color: var(--text);
    font-size: 0.85rem;
    line-height: 1.4;
    text-align: center;
  }

  /* ── Violation notifications ─────────────────────────────────────── */
  .violations-overlay {
    position: absolute;
    top: var(--space-3);
    left: var(--space-3);
    /* Cap to the canvas width minus margins on the right + the controls panel. */
    max-width: calc(100% - var(--space-3) * 2 - 240px);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    pointer-events: none;
  }

  .violation-card {
    pointer-events: auto;
    /* Size to content; cap so a long boat label can't push us off-screen. */
    width: max-content;
    max-width: min(380px, 100%);
    background: color-mix(in srgb, var(--bg-card) 92%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--border);
    border-left-width: 3px;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    padding: var(--space-2) var(--space-3);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .violation-card--advisory { border-left-color: rgba(255, 203, 5, 0.85); }
  .violation-card--warning  { border-left-color: rgba(255, 140, 0, 0.95); }
  .violation-card--violation { border-left-color: rgba(239, 68, 68, 1); }

  .violation-head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .violation-sev {
    flex-shrink: 0;
    font-family: var(--font-heading);
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    color: var(--bg-card);
    background: var(--text-muted);
  }
  .violation-card--advisory  .violation-sev { background: rgba(255, 203, 5, 0.95); color: #1a1a1a; }
  .violation-card--warning   .violation-sev { background: rgba(255, 140, 0, 0.98); color: #1a1a1a; }
  .violation-card--violation .violation-sev { background: rgba(239, 68, 68, 1);    color: #fff;     }

  .violation-rule {
    font-family: var(--font-heading);
    font-size: 0.78rem;
    color: var(--text);
    font-weight: 600;
    line-height: 1.25;
    word-break: break-word;
  }

  .violation-body {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text);
    line-height: 1.35;
    word-break: break-word;
  }

  .violation-link {
    align-self: flex-start;
    font-size: 0.75rem;
    color: var(--accent);
    text-decoration: none;
    margin-top: 2px;
  }
  .violation-link:hover { text-decoration: underline; }

  /* ── Overlay panel ───────────────────────────────────────────────── */
  .overlay-panel {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-2);
  }

  .panel-toggle {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg-card) 88%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-card);
  }
  .panel-toggle:hover { color: var(--text); }

  .panel-body {
    background: color-mix(in srgb, var(--bg-card) 88%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: 190px;
    max-height: calc(100% - 52px);
    overflow-y: auto;
  }

  .panel-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .panel-section + .panel-section {
    border-top: 1px solid var(--border);
    padding-top: var(--space-3);
  }

  .panel-section h3 {
    font-family: var(--font-heading);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin: 0;
  }

  /* Wind */
  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .wind-slider {
    width: 100%;
    accent-color: var(--accent);
  }

  .wind-label {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text-muted);
    min-width: 2.5rem;
    text-align: right;
  }

  /* Editable speed (used in Playback section) */
  .speed-edit {
    display: inline-flex;
    align-items: baseline;
    gap: 1px;
  }
  .speed-input {
    width: 2.6rem;
    padding: 1px 4px;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    text-align: right;
    -moz-appearance: textfield;
  }
  .speed-input::-webkit-outer-spin-button,
  .speed-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .speed-input:focus {
    outline: none;
    border-color: var(--accent);
  }
  .speed-suffix {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  /* Toggles */
  .toggles {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.82rem;
    color: var(--text);
    cursor: pointer;
  }

  .toggle input[type='checkbox'] {
    accent-color: var(--accent);
    width: 13px;
    height: 13px;
    cursor: pointer;
    flex-shrink: 0;
  }

  /* Boats */
  .boat-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .boat-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.82rem;
    color: var(--text);
  }

  .boat-swatch-wrap {
    position: relative;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    cursor: pointer;
  }

  .boat-color-picker {
    position: absolute;
    inset: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    padding: 0;
    border: none;
  }

  .boat-swatch {
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.15);
    pointer-events: none;
  }

  .boat-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .boat-remove {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0 2px;
  }
  .boat-remove:hover { color: var(--text); }

  .boat-condition {
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    width: 18px;
    height: 18px;
    line-height: 1;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .boat-condition:hover { color: var(--text); }
  .boat-condition--active {
    color: rgba(239, 68, 68, 1);
    border-color: rgba(239, 68, 68, 0.6);
    font-weight: 600;
  }

  .add-boat-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--accent);
    cursor: pointer;
    font-size: 0.78rem;
    padding: var(--space-1) var(--space-2);
    text-align: center;
    width: 100%;
  }
  .add-boat-btn:hover { background: var(--bg-hover, rgba(0,0,0,0.04)); }

  /* Routes */
  .route-hint {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.4;
  }

  .route-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .route-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.82rem;
    color: var(--text);
  }

  .route-swatch {
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 1px solid rgba(0,0,0,0.15);
  }

  .route-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .route-count {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .route-controls {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .route-sail {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    padding: 0 2px;
    opacity: 0.8;
    display: flex;
    align-items: center;
  }
  .route-sail:hover   { opacity: 1; }
  .route-sail.sailing { color: #ff6060; opacity: 1; }

  .route-clear {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0 2px;
  }
  .route-clear:hover { color: var(--text); }

  /* ── Responsive ──────────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .whiteboard-layout {
      padding: var(--space-3);
      height: calc(100vh - var(--nav-height) - 120px);
    }
  }
</style>
