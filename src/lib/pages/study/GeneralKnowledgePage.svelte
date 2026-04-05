<script>
  let { navigate } = $props()
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>General Knowledge</h1>
      <p class="page-subtitle">
        Broaden your sailing knowledge beyond the rules — weather, seamanship, and racing fundamentals.
      </p>
    </div>
  </div>

  <div class="stub-content">
    <div class="coming-soon-card">
      <span class="stub-icon">📚</span>
      <h2>Coming Soon</h2>
      <p>General sailing knowledge topics and quizzes are under construction.</p>
      <button class="btn-primary" onclick={() => navigate('home')}>Back to Home</button>
    </div>
  </div>
</div>
