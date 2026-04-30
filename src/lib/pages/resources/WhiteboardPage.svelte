<script lang="ts">
  import GameCanvas from '$lib/canvas/GameCanvas.svelte'
  import type { SceneState, BoatState, Mark, Vec2, Waypoint, AnimationClip, AnimationKeyframe } from '$lib/canvas/types.ts'
  import { calcLegSpeed } from '$lib/canvas/renderer/waypoint.ts'
  import { Play, Square } from 'lucide-svelte'

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
      {
        id: 'boat-a',
        position:   { x: 120, y: 130 },
        heading:    330,
        tack:       'starboard',
        speed:      6,
        hullColor:  'maize',
        sailColor:  'blue',
        label:      'Boat A',
        isPlayer:   true,
      },
      {
        id: 'boat-b',
        position:   { x: 180, y: 140 },
        heading:    20,
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

  function playRoute(boatId: string): void {
    const boat = scene.boats.find(b => b.id === boatId)
    if (!boat) return

    const wps = (scene.waypoints ?? [])
      .filter(w => w.boatId === boatId)
      .sort((a, b) => a.order - b.order)
    if (wps.length === 0) return

    const keyframes: AnimationKeyframe[] = []
    let t = 0

    // Start from the boat's current position
    keyframes.push({ time: 0, boats: [{ boatId, position: boat.position, heading: boat.heading }] })

    let prevPos = boat.position
    for (const wp of wps) {
      const dx = wp.position.x - prevPos.x
      const dy = wp.position.y - prevPos.y
      const distM      = Math.hypot(dx, dy)
      const bearing    = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
      const speedKnots = calcLegSpeed(bearing, scene.wind.directionDeg)
      const speedMs    = Math.max(speedKnots * 0.514444, 0.3)   // min 0.3 m/s so no-go zones still move
      t += distM / speedMs

      keyframes.push({ time: t, boats: [{ boatId, position: wp.position, heading: bearing }] })
      prevPos = wp.position
    }

    currentAnimation = { keyframes, durationSec: t, loop: true }
    sailingBoatId    = boatId
  }

  function stopRoute(): void {
    currentAnimation = undefined
    sailingBoatId    = undefined
  }

  // ── Panel collapse ─────────────────────────────────────────────────
  let panelOpen = $state(true)
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Whiteboard</h1>
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
        {selectedBoatId}
        {onBoatClick}
        {onBoatDrag}
        {onMarkDrag}
        {onBoatRotate}
        {onBackgroundClick}
        {onWaypointDrag}
        {onCanvasContextMenu}
      />

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
                    <button class="boat-remove" onclick={() => removeBoat(boat.id)} aria-label="Remove {boat.label}">×</button>
                  </li>
                {/each}
              </ul>
              <button class="add-boat-btn" onclick={addBoat}>+ Add Boat</button>
            </section>

            <section class="panel-section">
              <h3>Routes</h3>
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
                      {#if sailingBoatId === boat.id}
                        <button class="route-sail sailing" onclick={stopRoute} aria-label="Stop">
                          <Square size={11} strokeWidth={2} />
                        </button>
                      {:else}
                        <button class="route-sail" onclick={() => playRoute(boat.id)} aria-label="Sail route for {boat.label}">
                          <Play size={11} strokeWidth={2} />
                        </button>
                      {/if}
                      <button class="route-clear" onclick={() => { clearWaypoints(boat.id); if (sailingBoatId === boat.id) stopRoute() }} aria-label="Clear route for {boat.label}">×</button>
                    </li>
                  {/each}
                </ul>
                <button class="add-boat-btn" onclick={() => clearWaypoints()}>Clear All</button>
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
