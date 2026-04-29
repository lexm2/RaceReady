<script lang="ts">
  import { base } from '$app/paths';
  import { Trophy } from 'lucide-svelte';
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Regatta Run</h1>
      <p class="page-subtitle">
        Answer right-of-way questions to move your boat around the course. Wrong answers
        let other boats through. See how far you can get.
      </p>
    </div>
  </div>

  <div class="stub-content">
    <div class="coming-soon-card">
      <span class="stub-icon"><Trophy size={48} /></span>
      <h2>Coming Soon</h2>
      <p>The race-format quiz game with customizable topic selection and real-time boat movement is coming soon.</p>
      <a class="btn-primary" href="{base}/">Back to Home</a>
    </div>
  </div>
</div>
