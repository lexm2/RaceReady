<script lang="ts">
  import { base } from '$app/paths';
  import { Compass } from 'lucide-svelte';
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Tactics & Strategy</h1>
      <p class="page-subtitle">
        Tactics is about making good decisions on the course: laylines, covering, start positioning.
        Easier to learn when you work through concrete situations.
      </p>
    </div>
  </div>

  <div class="stub-content">
    <div class="coming-soon-card">
      <span class="stub-icon"><Compass size={48} /></span>
      <h2>Coming Soon</h2>
      <p>Verbal and diagram-based scenarios with multiple-choice tactical decisions are in development.</p>
      <a class="btn-primary" href="{base}/">Back to Home</a>
    </div>
  </div>
</div>
