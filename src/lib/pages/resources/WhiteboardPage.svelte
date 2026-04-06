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

  // ── Wind control ───────────────────────────────────────────────────
  let windDeg = $state(scene.wind.directionDeg)

  $effect(() => {
    scene = {
      ...scene,
      wind: { ...scene.wind, directionDeg: windDeg },
    }
  })

  // ── Display toggles ────────────────────────────────────────────────
  function toggle(key: keyof typeof scene.display): void {
    scene = {
      ...scene,
      display: { ...scene.display, [key]: !scene.display[key] },
    }
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
        <h3>Wind</h3>
        <div class="wind-control">
          <input
            type="range"
            min="0"
            max="359"
            bind:value={windDeg}
            class="wind-slider"
          />
          <span class="wind-label">{windDeg}°</span>
        </div>
      </section>

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

  /* Wind slider */
  .wind-control {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .wind-slider {
    flex: 1;
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
