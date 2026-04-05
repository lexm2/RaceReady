<script>
  let { navigate } = $props()
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Racing Rules of Sailing</h1>
      <p class="page-subtitle">
        The complete 2025–2028 Racing Rules of Sailing with clickable references,
        hoverable definitions, and annotation tools.
      </p>
    </div>
  </div>

  <div class="stub-content">
    <div class="coming-soon-card">
      <span class="stub-icon">📖</span>
      <h2>Coming Soon</h2>
      <p>The full rulebook with clickable cross-references, definition tooltips, and sticky note annotations is in progress.</p>
      <button class="btn-primary" onclick={() => navigate('home')}>Back to Home</button>
    </div>
  </div>
</div>
