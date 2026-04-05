<script>
  let { navigate } = $props()
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Racing Rules</h1>
      <p class="page-subtitle">
        Learn the ISAF Racing Rules of Sailing 2025–2028 through interactive scenarios
        and multiple-choice questions at your own level.
      </p>
    </div>
  </div>

  <div class="stub-content">
    <div class="coming-soon-card">
      <span class="stub-icon">⚖️</span>
      <h2>Coming Soon</h2>
      <p>Interactive rule scenarios with beginner, intermediate, and advanced levels are on the way.</p>
      <button class="btn-primary" onclick={() => navigate('home')}>Back to Home</button>
    </div>
  </div>
</div>
