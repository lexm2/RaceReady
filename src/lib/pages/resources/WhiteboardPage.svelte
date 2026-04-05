<script lang="ts">
  interface Props { navigate: (page: string) => void }
  let { navigate }: Props = $props()
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Whiteboard</h1>
      <p class="page-subtitle">
        Plan race scenarios with an interactive whiteboard — place boats, marks, and committee boats,
        set wind direction, and animate race sequences.
      </p>
    </div>
  </div>

  <div class="stub-content">
    <div class="coming-soon-card">
      <span class="stub-icon">🖊️</span>
      <h2>Coming Soon</h2>
      <p>The interactive race whiteboard with boat placement, wind direction controls, and animation playback is in development.</p>
      <button class="btn-primary" onclick={() => navigate('home')}>Back to Home</button>
    </div>
  </div>
</div>
