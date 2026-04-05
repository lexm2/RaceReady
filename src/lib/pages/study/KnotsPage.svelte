<script>
  let { navigate } = $props()
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Knots</h1>
      <p class="page-subtitle">
        Learn essential sailing knots — with step-by-step diagrams and descriptions of when to use each one.
      </p>
    </div>
  </div>

  <div class="stub-content">
    <div class="coming-soon-card">
      <span class="stub-icon">🪢</span>
      <h2>Coming Soon</h2>
      <p>A visual knot library with tying guides and use-case descriptions is being built.</p>
      <button class="btn-primary" onclick={() => navigate('home')}>Back to Home</button>
    </div>
  </div>
</div>
