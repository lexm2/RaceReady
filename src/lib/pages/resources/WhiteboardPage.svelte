<script lang="ts">
  import { onMount } from 'svelte'
  import GameCanvas from '$lib/canvas/GameCanvas.svelte'
  import type { SceneState, Vec2, Waypoint, AnimationClip, RuleViolation } from '$lib/canvas/types.ts'
  import { buildScenarioPlayback, isPlaybackPathInvalidated } from '$lib/canvas/scenarioPlayback.ts'
  import { ViolationPauseGate } from '$lib/canvas/violationPauseGate.ts'
  import { evaluateScene } from '$lib/rules/logic.ts'
  import { RULES_BY_ID } from '$lib/data/rulesIndex.ts'
  import { PRESETS_BY_ID } from '$lib/whiteboardPresets.ts'
  import { base } from '$app/paths'
  import { Play, Square, Pause, SkipBack, SkipForward, Maximize2, Minimize2, BellRing, BellOff, Sailboat, LifeBuoy, Anchor, Mountain, X, Settings, ArrowRight } from 'lucide-svelte'

  // Default scene
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
      // Default scene: port-starboard crossing, ~16 m apart, converging upwind.
      // Boat B (port) should be flagged as the keep-clear boat.
      {
        id: 'boat-a',
        position:   { x: 158, y: 120 },
        heading:    315,           // NW, close-hauled starboard with wind from N
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

  // Drag handlers (parent owns scene state)
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

  // Selection and rotation
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
      boats: scene.boats.map(b => b.id === boatId ? { ...b, heading } : b),
    }
  }


  // Display toggles
  function toggle(key: keyof typeof scene.display): void {
    scene = {
      ...scene,
      display: { ...scene.display, [key]: !scene.display[key] },
    }
  }

  // Boats
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

  /** Per-boat condition for Rule 22. */
  const CONDITIONS = ['normal', 'capsized', 'anchored', 'aground'] as const
  type Condition = (typeof CONDITIONS)[number]
  const CONDITION_LABEL: Record<Condition, string> = {
    normal: 'Normal', capsized: 'Capsized', anchored: 'Anchored', aground: 'Aground',
  }
  const CONDITION_ICON: Record<Condition, any> = {
    normal: Sailboat, capsized: LifeBuoy, anchored: Anchor, aground: Mountain,
  }

  let openConditionBoatId = $state<string | undefined>(undefined)
  let conditionMenuPos = $state<{ top: number; right: number } | undefined>(undefined)

  function setBoatCondition(id: string, next: Condition): void {
    // Capsized / anchored / aground boats can't sail, so drop the boat's
    // waypoints when it leaves the normal state.
    const dropWaypoints = next !== 'normal'
    scene = {
      ...scene,
      boats: scene.boats.map(b => (b.id === id ? { ...b, condition: next } : b)),
      waypoints: dropWaypoints
        ? (scene.waypoints ?? []).filter(w => w.boatId !== id)
        : scene.waypoints,
    }
    openConditionBoatId = undefined
    conditionMenuPos = undefined
  }

  function toggleConditionMenu(id: string, triggerEl: HTMLButtonElement): void {
    if (openConditionBoatId === id) {
      openConditionBoatId = undefined
      conditionMenuPos = undefined
      return
    }
    const r = triggerEl.getBoundingClientRect()
    conditionMenuPos = { top: r.bottom + 4, right: window.innerWidth - r.right }
    openConditionBoatId = id
  }

  // Waypoints
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

  // Route animation
  let currentAnimation = $state<AnimationClip | undefined>(undefined)
  let sailingBoatId    = $state<string | undefined>(undefined)
  let playingAll       = $state(false)
  let paused           = $state(false)
  let timeScale        = $state(7)
  let playbackTime     = $state(0)

  /** Sorted, unique time bookmarks (start, each waypoint, end) for skip controls. */
  let bookmarks = $state<number[]>([])

  /**
   * Snapshot of the scene the current playback was built from. The $effect
   * below stops playback when any path-relevant field changes, so dragging
   * a waypoint mid-playback halts the stale animation.
   */
  let playbackBaseScene: SceneState | undefined = undefined

  function hasWaypoints(boatId: string): boolean {
    return (scene.waypoints ?? []).some(w => w.boatId === boatId)
  }

  function playRoute(boatId: string): void {
    if (!hasWaypoints(boatId)) return
    // Sail just this boat; others stay static (their absence from the clip's
    // keyframes leaves them at their base-scene positions per GameCanvas).
    const soloScene: SceneState = { ...scene, boats: scene.boats.filter(b => b.id === boatId) }
    const playback = buildScenarioPlayback(soloScene, { loop: true })
    currentAnimation = playback.clip
    bookmarks        = playback.bookmarks
    sailingBoatId    = boatId
    playingAll       = false
    paused           = false
    playbackBaseScene = scene
    resetViolationGate()
    seedPauseGateFromCurrentScene()
  }

  function playAllRoutes(): void {
    if (!scene.boats.some(b => hasWaypoints(b.id))) return
    // All boats animate for the full duration. Boats without waypoints sail
    // straight ahead so neither boat freezes while the other is still moving.
    const playback = buildScenarioPlayback(scene, { loop: true })
    currentAnimation = playback.clip
    bookmarks        = playback.bookmarks
    sailingBoatId    = undefined
    playingAll       = true
    paused           = false
    playbackBaseScene = scene
    resetViolationGate()
    seedPauseGateFromCurrentScene()
  }

  function stopRoute(): void {
    currentAnimation = undefined
    sailingBoatId    = undefined
    playingAll       = false
    paused           = false
    bookmarks        = []
    playbackBaseScene = undefined
    resetViolationGate()
  }

  $effect(() => {
    // Stop active playback the moment any path-relevant scene field changes.
    // Also drop the preset hint, since it no longer describes the edited scene.
    if (currentAnimation && playbackBaseScene && isPlaybackPathInvalidated(playbackBaseScene, scene)) {
      stopRoute()
      activePresetHint = null
    }
  })

  function skipForward(): void {
    if (!currentAnimation) return
    const next = bookmarks.find(t => t > playbackTime + 0.05)
    playbackTime = next ?? currentAnimation.durationSec
  }

  function skipBackward(): void {
    if (!currentAnimation) return
    const prev = [...bookmarks].reverse().find(t => t < playbackTime - 0.05)
    playbackTime = prev ?? 0
  }

  function togglePause(): void {
    paused = !paused
  }

  // Panel collapse
  let panelOpen = $state(true)

  // Fullscreen
  let canvasWrapEl: HTMLDivElement | undefined = $state(undefined)
  let isFullscreen = $state(false)

  function toggleFullscreen(): void {
    if (!canvasWrapEl) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      canvasWrapEl.requestFullscreen()
    }
  }

  onMount(() => {
    const onChange = () => { isFullscreen = document.fullscreenElement === canvasWrapEl }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  })

  // Keyboard shortcuts: Space = play/pause, ←/→ = prev/next waypoint.
  // Suppressed while the user is typing in an input/textarea.
  function isEditableTarget(t: EventTarget | null): boolean {
    if (!(t instanceof HTMLElement)) return false
    if (t.isContentEditable) return true
    const tag = t.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
  }

  onMount(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isEditableTarget(e.target)) return

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        if (currentAnimation) togglePause()
        else if (scene.boats.some(b => hasWaypoints(b.id))) playAllRoutes()
      } else if (e.key === 'ArrowRight') {
        if (!currentAnimation) return
        e.preventDefault()
        skipForward()
      } else if (e.key === 'ArrowLeft') {
        if (!currentAnimation) return
        e.preventDefault()
        skipBackward()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  onMount(() => {
    function close(): void {
      openConditionBoatId = undefined
      conditionMenuPos = undefined
    }
    function onPointerDown(e: PointerEvent): void {
      if (!openConditionBoatId) return
      const target = e.target as HTMLElement | null
      if (target?.closest('.condition-wrap, .condition-menu')) return
      close()
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') close()
    }
    function onReflow(): void {
      if (openConditionBoatId) close()
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onReflow, true)
    window.addEventListener('resize', onReflow)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onReflow, true)
      window.removeEventListener('resize', onReflow)
    }
  })

  // Rule violations
  let liveViolations = $state<RuleViolation[]>([])

  /** User-controlled toggle (switch in the playback island). When off, new
   *  violations still update the cards but never auto-pause the playback. */
  let autoPauseOnViolation = $state(true)

  // Auto-pause on each new (ruleId, violatorBoatId) pair so the user can read
  // the violation card before the scene moves on. See ViolationPauseGate for
  // the exact rules; reset on every play-start / stop, and on every loop wrap
  // so the same violations re-pause on subsequent passes.
  const pauseGate = new ViolationPauseGate()

  function resetViolationGate(): void {
    pauseGate.reset()
  }

  /**
   * Seed the gate with the current scene's static violations on play-start.
   * Without this, GameCanvas's onViolationsChanged dedup swallows the
   * initial t=0 callback (the static set was already delivered before play),
   * leaving the gate uninitialised so the first real new violation gets
   * treated as the seed instead of triggering a pause.
   */
  function seedPauseGateFromCurrentScene(): void {
    pauseGate.noteViolations(evaluateScene(scene))
  }

  /**
   * Watch for the playback wrapping (loop) or being skipped backward and
   * re-seed the gate so each loop pass can re-pause on the same violations.
   * Reading `playbackTime` makes this $effect re-run on every animation
   * frame, but the body is just two cheap reads + a comparison.
   */
  let prevPlaybackTime = 0
  $effect(() => {
    if (!currentAnimation) {
      prevPlaybackTime = playbackTime
      return
    }
    const REWIND_THRESHOLD_SEC = 0.5  // larger than any single-frame advance
    if (playbackTime + REWIND_THRESHOLD_SEC < prevPlaybackTime) {
      pauseGate.reset()
      seedPauseGateFromCurrentScene()
    }
    prevPlaybackTime = playbackTime
  })

  function onViolationsChanged(violations: RuleViolation[]): void {
    liveViolations = violations
    if (!currentAnimation || paused || !autoPauseOnViolation) return
    if (pauseGate.noteViolations(violations)) paused = true
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

  // Preset loading (?preset=<id> query param)
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

  // Playback-island derived state: disabled flags + play/pause icon switching.
  let hasAnyWaypoints = $derived((scene.waypoints ?? []).length > 0)
  let playDisabled    = $derived(!currentAnimation && !hasAnyWaypoints)
  let navDisabled     = $derived(!currentAnimation)
  let showPlayIcon    = $derived(!currentAnimation || paused)

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
      <h1>Whiteboard{activePresetTitle ? `: ${activePresetTitle}` : ''}</h1>
      <p class="page-subtitle">
        Plan race scenarios: drag boats and marks, set wind direction, and step through situations.
      </p>
    </div>
  </div>

  <div class="whiteboard-layout">
    <!-- Canvas -->
    <div class="canvas-wrap" bind:this={canvasWrapEl}>
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

      <!-- Bottom-right control: fullscreen -->
      <div class="canvas-corner canvas-corner--br">
        <button
          class="corner-btn"
          onclick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {#if isFullscreen}<Minimize2 size={16} strokeWidth={2} />{:else}<Maximize2 size={16} strokeWidth={2} />{/if}
        </button>
      </div>

      <!-- Top-center: preset hint -->
      {#if activePresetHint}
        <div class="preset-hint" role="note">
          {activePresetHint}
        </div>
      {/if}

      <!-- Bottom-center: playback island (always visible) -->
      <div class="bottom-stack">
        <div class="playback-island" role="group" aria-label="Playback controls">
          <div class="pb-controls">
            <span class="pb-time">
              {playbackTime.toFixed(1)} / {(currentAnimation?.durationSec ?? 0).toFixed(1)}s
            </span>
            <div class="pb-buttons">
              <button class="pb-btn" onclick={skipBackward} disabled={navDisabled} aria-label="Previous waypoint">
                <SkipBack size={14} strokeWidth={2.5} />
              </button>
              <button
                class="pb-btn pb-btn--play"
                onclick={currentAnimation ? togglePause : playAllRoutes}
                disabled={playDisabled}
                aria-label={currentAnimation ? (paused ? 'Resume' : 'Pause') : 'Play routes'}
              >
                {#if showPlayIcon}<Play size={16} strokeWidth={2.5} />{:else}<Pause size={16} strokeWidth={2.5} />{/if}
              </button>
              <button class="pb-btn" onclick={skipForward} disabled={navDisabled} aria-label="Next waypoint">
                <SkipForward size={14} strokeWidth={2.5} />
              </button>
              <button class="pb-btn pb-btn--stop" onclick={stopRoute} disabled={navDisabled} aria-label="Stop">
                <Square size={14} strokeWidth={2.5} />
              </button>
            </div>
            <div class="pb-right">
              <button
                class="pb-btn pb-btn--toggle"
                class:pb-btn--toggle-on={autoPauseOnViolation}
                onclick={() => autoPauseOnViolation = !autoPauseOnViolation}
                aria-pressed={autoPauseOnViolation}
                aria-label="Auto-pause on rule violation"
                title="Auto-pause on each new rule violation ({autoPauseOnViolation ? 'on' : 'off'})"
              >
                {#if autoPauseOnViolation}<BellRing size={14} strokeWidth={2.5} />{:else}<BellOff size={14} strokeWidth={2.5} />{/if}
              </button>
              <label class="pb-speed">
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
          </div>
          <input
            type="range"
            class="pb-slider"
            min="0"
            max={currentAnimation?.durationSec ?? 1}
            step="0.05"
            bind:value={playbackTime}
            disabled={navDisabled}
            aria-label="Playback position"
          />
        </div>
      </div>

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
                  <strong>{card.violator}</strong> just acquired right of way. Give <strong>{card.rightOfWay}</strong> room to keep clear.
                {:else if card.ruleId === 'rule_16'}
                  <strong>{card.violator}</strong> is changing course. Give <strong>{card.rightOfWay}</strong> room to keep clear.
                {:else if card.ruleId === 'rule_17'}
                  <strong>{card.violator}</strong> may be sailing above proper course.
                {:else}
                  <strong>{card.violator}</strong> must keep clear{#if card.rightOfWay} of <strong>{card.rightOfWay}</strong>{/if}.
                {/if}
              </p>
              <a class="violation-link" href="{base}/resources/rulebook?rule={card.ruleId}">
                View rule <ArrowRight size={12} strokeWidth={2.5} />
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
          {#if panelOpen}<X size={16} strokeWidth={2.5} />{:else}<Settings size={16} strokeWidth={2.5} />{/if}
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
                  {@const TriggerIcon = CONDITION_ICON[condition]}
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
                    <span class="condition-wrap">
                      <button
                        class="boat-condition"
                        class:boat-condition--active={condition !== 'normal'}
                        title="Condition: {CONDITION_LABEL[condition]}"
                        onclick={(e) => toggleConditionMenu(boat.id, e.currentTarget)}
                        aria-haspopup="menu"
                        aria-expanded={openConditionBoatId === boat.id}
                        aria-label="Condition for {boat.label}: {CONDITION_LABEL[condition]}"
                      >
                        <TriggerIcon size={12} strokeWidth={2} />
                      </button>
                    </span>
                    <button class="boat-remove" onclick={() => removeBoat(boat.id)} aria-label="Remove {boat.label}"><X size={12} strokeWidth={2.5} /></button>
                  </li>
                {/each}
              </ul>
              <button class="add-boat-btn" onclick={addBoat}>+ Add Boat</button>
            </section>

          </div>
        {/if}
      </aside>
    </div>
  </div>

  {#if openConditionBoatId && conditionMenuPos}
    {@const openBoat = scene.boats.find(b => b.id === openConditionBoatId)}
    {@const openCondition = (openBoat?.condition ?? 'normal') as Condition}
    <ul
      class="condition-menu"
      role="menu"
      aria-label="Boat condition"
      style="top: {conditionMenuPos.top}px; right: {conditionMenuPos.right}px;"
    >
      {#each CONDITIONS as cond}
        {@const Icon = CONDITION_ICON[cond]}
        <li role="none">
          <button
            class="condition-menu-item"
            class:condition-menu-item--selected={openCondition === cond}
            role="menuitemradio"
            aria-checked={openCondition === cond}
            onclick={() => setBoatCondition(openConditionBoatId!, cond)}
          >
            <Icon size={14} strokeWidth={2} />
            <span>{CONDITION_LABEL[cond]}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
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

  /* Bottom-center stack (preset hint + playback island) */
  .bottom-stack {
    position: absolute;
    bottom: var(--space-3);
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    width: min(640px, calc(100% - var(--space-6)));
    pointer-events: none;
  }
  .bottom-stack > * { pointer-events: auto; }

  .preset-hint {
    position: absolute;
    top: var(--space-3);
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    /* Cap so we never overlap the top-left violations or top-right panel toggle. */
    max-width: min(520px, calc(100% - 460px));
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

  .playback-island {
    width: min(520px, 100%);
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 18px 10px;
    background: color-mix(in srgb, var(--bg-card) 82%, transparent);
    backdrop-filter: blur(14px) saturate(140%);
    -webkit-backdrop-filter: blur(14px) saturate(140%);
    border: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
    /* Pill-shaped: full-circle ends, flat top/bottom. */
    border-radius: 9999px;
    box-shadow: 0 6px 20px color-mix(in srgb, black 45%, transparent);
  }

  .pb-controls {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: var(--space-2);
  }
  .pb-controls > .pb-time     { justify-self: start;  }
  .pb-controls > .pb-buttons  { justify-self: center; }
  .pb-controls > .pb-right    { justify-self: end;    }

  .pb-right {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .pb-buttons {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .pb-btn {
    background: none;
    border: none;
    color: color-mix(in srgb, var(--text) 70%, transparent);
    cursor: pointer;
    padding: 4px 5px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
  }
  .pb-btn:hover { background: color-mix(in srgb, var(--text) 10%, transparent); color: var(--text); }
  .pb-btn:disabled {
    color: color-mix(in srgb, var(--text) 25%, transparent);
    cursor: not-allowed;
    background: none;
  }
  .pb-btn:disabled:hover { background: none; color: color-mix(in srgb, var(--text) 25%, transparent); }
  .pb-btn--play { color: var(--text); padding: 5px 7px; }
  .pb-btn--play:hover { background: color-mix(in srgb, var(--text) 14%, transparent); }
  .pb-btn--stop { color: color-mix(in srgb, var(--tappan-red) 85%, var(--text)); }
  .pb-btn--stop:hover {
    background: color-mix(in srgb, var(--tappan-red) 15%, transparent);
    color: var(--tappan-red);
  }
  /* Auto-pause toggle: dim when off, accent ring when on. */
  .pb-btn--toggle {
    color: color-mix(in srgb, var(--text) 40%, transparent);
  }
  .pb-btn--toggle-on {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
  .pb-btn--toggle-on:hover {
    background: color-mix(in srgb, var(--accent) 22%, transparent);
    color: color-mix(in srgb, var(--accent) 80%, var(--text));
  }

  /* Thin slider track, subtle thumb that grows on hover. */
  .pb-slider {
    -webkit-appearance: none;
    appearance: none;
    width: calc(100% - 24px);
    height: 14px;       /* hit target; track is drawn smaller below */
    background: transparent;
    outline: none;
    margin: 0 12px;
    cursor: pointer;
  }
  .pb-slider::-webkit-slider-runnable-track {
    height: 2px;
    background: color-mix(in srgb, var(--text) 18%, transparent);
    border-radius: 2px;
  }
  .pb-slider::-moz-range-track {
    height: 2px;
    background: color-mix(in srgb, var(--text) 18%, transparent);
    border-radius: 2px;
  }
  .pb-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 6px;
    height: 6px;
    margin-top: -2px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--text) 70%, transparent);
    border: none;
    transition: transform 0.15s, background 0.15s;
  }
  .pb-slider::-moz-range-thumb {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--text) 70%, transparent);
    border: none;
    transition: transform 0.15s, background 0.15s;
  }
  .pb-slider:hover::-webkit-slider-thumb,
  .pb-slider:active::-webkit-slider-thumb { transform: scale(1.6); background: var(--text); }
  .pb-slider:hover::-moz-range-thumb,
  .pb-slider:active::-moz-range-thumb     { transform: scale(1.6); background: var(--text); }

  .pb-time {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: color-mix(in srgb, var(--text) 70%, transparent);
    white-space: nowrap;
  }

  .pb-speed {
    display: inline-flex;
    align-items: baseline;
    gap: 1px;
    color: color-mix(in srgb, var(--text) 70%, transparent);
  }
  .pb-speed .speed-input {
    color: var(--text);
    border-color: color-mix(in srgb, var(--text) 18%, transparent);
    background: transparent;
  }
  .pb-speed .speed-input:focus { border-color: color-mix(in srgb, var(--text) 50%, transparent); }
  .pb-speed .speed-suffix { color: color-mix(in srgb, var(--text) 60%, transparent); }

  /* Canvas corner controls */
  .canvas-corner {
    position: absolute;
    z-index: 10;
    display: flex;
    gap: var(--space-2);
  }
  .canvas-corner--br { bottom: var(--space-3); right: var(--space-3); }

  .corner-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg-card) 88%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-card);
    transition: color 0.15s, background 0.15s;
  }
  .corner-btn:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--bg-card) 96%, transparent);
  }

  /* Violation notifications */
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

  .violation-card--advisory { border-left-color: color-mix(in srgb, var(--michigan-maize) 85%, transparent); }
  .violation-card--warning  { border-left-color: color-mix(in srgb, var(--ross-orange) 95%, transparent); }
  .violation-card--violation { border-left-color: var(--tappan-red); }

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
  .violation-card--advisory  .violation-sev {
    background: color-mix(in srgb, var(--michigan-maize) 95%, transparent);
    color: var(--puma-black);
  }
  .violation-card--warning   .violation-sev {
    background: color-mix(in srgb, var(--ross-orange) 98%, transparent);
    color: var(--puma-black);
  }
  .violation-card--violation .violation-sev {
    background: var(--tappan-red);
    color: var(--text);
  }

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
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--accent);
    text-decoration: none;
    margin-top: 2px;
  }
  .violation-link:hover { text-decoration: underline; }

  /* Overlay panel */
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
    appearance: textfield;
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
    border: 1px solid color-mix(in srgb, black 15%, transparent);
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
    line-height: 1;
    padding: 0 2px;
    display: inline-flex;
    align-items: center;
  }
  .boat-remove:hover { color: var(--text); }

  .condition-wrap {
    position: relative;
    display: inline-flex;
  }

  .boat-condition {
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    cursor: pointer;
    width: 20px;
    height: 20px;
    line-height: 1;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .boat-condition:hover { color: var(--text); }
  .boat-condition--active {
    color: var(--tappan-red);
    border-color: color-mix(in srgb, var(--tappan-red) 60%, transparent);
  }

  .condition-menu {
    position: fixed;
    z-index: 100;
    list-style: none;
    margin: 0;
    padding: 4px;
    min-width: 132px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .condition-menu-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    background: none;
    border: none;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--text);
    font-size: 0.78rem;
    text-align: left;
  }
  .condition-menu-item:hover { background: var(--bg-hover, color-mix(in srgb, black 4%, transparent)); }
  .condition-menu-item--selected { color: var(--accent); font-weight: 600; }

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
  .add-boat-btn:hover { background: var(--bg-hover, color-mix(in srgb, black 4%, transparent)); }

  /* Responsive */
  @media (max-width: 768px) {
    .whiteboard-layout {
      padding: var(--space-3);
      height: calc(100vh - var(--nav-height) - 120px);
    }
  }
</style>
