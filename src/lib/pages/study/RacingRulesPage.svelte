<script lang="ts">
  import { base } from '$app/paths';
  import { PRESETS } from '$lib/whiteboardPresets.ts';
  import { Play } from 'lucide-svelte';
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Racing Rules</h1>
      <p class="page-subtitle">
        Pick a rule scenario below to launch the whiteboard pre-loaded with that situation.
        Watch the violation notification, drag the boats around, and click the rule link to read the official text.
      </p>
    </div>
  </div>

  <div class="rules-grid container">
    {#each PRESETS as preset (preset.id)}
      <a class="rule-card" href="{base}/resources/whiteboard?preset={preset.id}">
        <div class="rule-card-head">
          <span class="rule-card-tag">{preset.ruleId.replace('_', ' ').toUpperCase()}</span>
          {#if preset.autoPlay}
            <span class="rule-card-badge"><Play size={11} strokeWidth={2.5} /> Animated</span>
          {/if}
        </div>
        <h3 class="rule-card-title">{preset.title}</h3>
        <p class="rule-card-summary">{preset.summary}</p>
        <p class="rule-card-hint">{preset.hint}</p>
        <span class="rule-card-cta">Open in whiteboard →</span>
      </a>
    {/each}
  </div>
</div>

<style>
  .rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
    padding: var(--space-6) 0 var(--space-8);
  }

  .rule-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    text-decoration: none;
    color: var(--text);
    transition: border-color var(--transition), transform var(--transition-slow), box-shadow var(--transition-slow);
  }
  .rule-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }

  .rule-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .rule-card-tag {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    color: var(--text-muted);
  }

  .rule-card-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--accent);
    font-family: var(--font-heading);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .rule-card-title {
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0;
    color: var(--text);
  }

  .rule-card-summary {
    font-size: 0.9rem;
    color: var(--text);
    margin: 0;
    line-height: 1.45;
  }

  .rule-card-hint {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.5;
    flex: 1;
  }

  .rule-card-cta {
    margin-top: var(--space-2);
    font-size: 0.85rem;
    color: var(--accent);
    font-weight: 600;
  }
</style>
