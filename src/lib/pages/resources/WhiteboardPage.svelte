<script lang="ts">
  import GameCanvas from '$lib/canvas/GameCanvas.svelte'
  import type { SceneState, BoatState, Mark, Vec2 } from '$lib/canvas/types.ts'

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
      showCompassRose:   false,
      showWindIndicator: true,
      showGrid:          true,
    },
  })

  // ── Drag handlers — parent owns scene state ────────────────────────
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
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Whiteboard</h1>
      <p class="page-subtitle">
        Plan race scenarios — drag boats and marks, set wind direction, and step through situations.
      </p>
    </div>
  </div>

  <div class="whiteboard-layout">
    <!-- Canvas -->
    <div class="canvas-wrap">
      <GameCanvas
        {scene}
        interactive
        {selectedBoatId}
        {onBoatClick}
        {onBoatDrag}
        {onMarkDrag}
        {onBoatRotate}
        {onBackgroundClick}
      />
    </div>

    <!-- Toolbar -->
    <aside class="toolbar">
      <section class="tool-section">
        <h3>Display</h3>
        <div class="toggles">
          <label class="toggle">
            <input type="checkbox" checked={scene.display.showLabels}    onchange={() => toggle('showLabels')}        />
            Labels
          </label>
          <label class="toggle">
            <input type="checkbox" checked={scene.display.showWake}      onchange={() => toggle('showWake')}          />
            Wakes
          </label>
          <label class="toggle">
            <input type="checkbox" checked={scene.display.showWindStreaks} onchange={() => toggle('showWindStreaks')} />
            Wind streaks
          </label>
          <label class="toggle">
            <input type="checkbox" checked={scene.display.showGrid}      onchange={() => toggle('showGrid')}          />
            Grid
          </label>
          <label class="toggle">
            <input type="checkbox" checked={scene.display.showWindIndicator} onchange={() => toggle('showWindIndicator')} />
            Wind indicator
          </label>
          <label class="toggle">
            <input type="checkbox" checked={scene.display.showCompassRose}   onchange={() => toggle('showCompassRose')}  />
            Compass rose
          </label>
        </div>
      </section>

      <section class="tool-section">
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

      <section class="tool-section hint">
        <p>Drag boats and marks to reposition them.</p>
      </section>
    </aside>
  </div>
</div>

<style>
  .whiteboard-layout {
    display: grid;
    grid-template-columns: 1fr 220px;
    grid-template-rows: calc(100vh - var(--nav-height) - 140px);
    gap: var(--space-4);
    padding: var(--space-4) var(--space-6);
    min-height: 0;
  }

  .canvas-wrap {
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-card);
    min-height: 0;
  }

  /* ── Toolbar ─────────────────────────────────────────────────────── */
  .toolbar {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    overflow-y: auto;
  }

  .tool-section {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .tool-section h3 {
    font-family: var(--font-heading);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin: 0;
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
    font-size: 0.85rem;
    color: var(--text);
    cursor: pointer;
  }

  .toggle input[type='checkbox'] {
    accent-color: var(--accent);
    width: 14px;
    height: 14px;
    cursor: pointer;
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
    font-size: 0.85rem;
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
    font-size: 0.8rem;
    padding: var(--space-1) var(--space-2);
    text-align: center;
    width: 100%;
  }
  .add-boat-btn:hover { background: var(--bg-hover, rgba(0,0,0,0.04)); }

  /* Hint */
  .tool-section.hint p {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.5;
  }

  /* ── Responsive ──────────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .whiteboard-layout {
      grid-template-columns: 1fr;
      grid-template-rows: 60vw auto;
    }
  }
</style>
