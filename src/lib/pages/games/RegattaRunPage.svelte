<script>
  let { navigate } = $props()
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Regatta Run</h1>
      <p class="page-subtitle">
        Answer correctly to move your boat forward. Wrong answers let the competition
        overtake you. Finish the race by finishing the session.
      </p>
    </div>
  </div>

  <div class="stub-content">
    <div class="coming-soon-card">
      <span class="stub-icon">🏆</span>
      <h2>Coming Soon</h2>
      <p>The race-format quiz game with customizable topic selection and real-time boat movement is coming soon.</p>
      <button class="btn-primary" onclick={() => navigate('home')}>Back to Home</button>
    </div>
  </div>
</div>
