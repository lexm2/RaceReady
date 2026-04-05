<script>
  let { navigate } = $props()
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

  <div class="stub-content">
    <div class="coming-soon-card">
      <span class="stub-icon">🏁</span>
      <h2>Coming Soon</h2>
      <p>Timed right-of-way scenarios with increasing difficulty, streaks, and stats tracking are being built.</p>
      <button class="btn-primary" onclick={() => navigate('home')}>Back to Home</button>
    </div>
  </div>
</div>
