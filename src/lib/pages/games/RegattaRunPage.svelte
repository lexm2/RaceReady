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

  <div class="game-shell">
    <section class="hud">
      <div class="hud-row">
        <span class="hud-label">Status</span>
        <span class="hud-badge">In development</span>
      </div>
      <div class="hud-row">
        <span class="hud-label">Mode</span>
        <span class="hud-value">Race-format quiz</span>
      </div>
      <div class="hud-row">
        <span class="hud-label">Score</span>
        <span class="hud-value">0 / 0</span>
      </div>
    </section>

    <section class="game-card">
      <div class="game-card-icon">
        <Trophy size={48} />
      </div>
      <h2 class="game-card-title">Coming Soon</h2>
      <p class="game-card-body">
        The race-format quiz with customizable topic selection and real-time boat
        movement around the course is on the way.
      </p>
      <a class="btn-primary" href="{base}/">Back to Home</a>
    </section>
  </div>
</div>

<style>
  .game-shell {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: var(--space-6);
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
    padding: var(--space-12) var(--space-6);
    flex: 1;
    align-items: start;
  }

  @media (max-width: 720px) {
    .game-shell {
      grid-template-columns: 1fr;
    }
  }

  .hud {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .hud-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .hud-label {
    font-family: var(--font-sans);
    font-size: var(--fs-label, 14px);
    font-weight: 500;
    color: color-mix(in srgb, var(--text) 65%, transparent);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .hud-value {
    font-family: var(--font-sans);
    font-size: var(--fs-body, 16px);
    color: var(--text);
  }

  .hud-badge {
    align-self: flex-start;
    font-family: var(--font-sans);
    font-size: var(--fs-label, 14px);
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--accent);
    border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  }

  .game-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--space-12) var(--space-8);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .game-card-icon {
    color: var(--accent);
    margin-bottom: var(--space-2);
  }

  .game-card-title {
    font-family: var(--font-heading);
    font-size: var(--fs-h2, 32px);
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }

  .game-card-body {
    font-family: var(--font-sans);
    font-size: var(--fs-body, 16px);
    color: color-mix(in srgb, var(--text) 75%, transparent);
    max-width: 44ch;
    margin: 0 0 var(--space-4);
  }
</style>
