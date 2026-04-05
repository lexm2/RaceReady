<script lang="ts">
  import GameCanvas from '$lib/canvas/GameCanvas.svelte'
  import type { SceneState } from '$lib/canvas/types.ts'

  interface Props { navigate: (page: string) => void }
  let { navigate }: Props = $props()

  // Test scene — two boats on opposite tacks converging
  const testScene: SceneState = {
    worldSize: { x: 200, y: 150 },
    wind: { directionDeg: 0, speedKnots: 12 },
    marks: [
      { id: 'wm', position: { x: 100, y: 20 }, type: 'buoy', side: 'port', label: '1' },
    ],
    courseLegs: [],
    boats: [
      {
        id: 'boat-a',
        position: { x: 80, y: 90 },
        heading: 315,
        tack: 'starboard',
        speed: 6,
        hullColor: 'maize',
        sailColor: 'blue',
        label: 'Boat A',
        isPlayer: true,
      },
      {
        id: 'boat-b',
        position: { x: 120, y: 90 },
        heading: 45,
        tack: 'port',
        speed: 6,
        hullColor: 'orange',
        sailColor: 'white',
        label: 'Boat B',
        isPlayer: false,
      },
    ],
    display: {
      showLabels:        true,
      showWake:          true,
      showWindStreaks:    true,
      showCompassRose:   true,
      showWindIndicator: true,
      showGrid:          false,
    },
  }
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Starboard Showdown</h1>
      <p class="page-subtitle">
        Two boats. One scenario. Who has right of way? Fast, buzzer-style answers
        that get harder as you advance.
      </p>
    </div>
  </div>

  <div class="game-area">
    <div class="canvas-container">
      <GameCanvas scene={testScene} />
    </div>
  </div>
</div>

<style>
  .game-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-6) var(--space-4);
  }

  .canvas-container {
    width: 100%;
    max-width: 800px;
    height: 480px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-card);
  }
</style>
