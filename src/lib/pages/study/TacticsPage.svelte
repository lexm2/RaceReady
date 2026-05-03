<script lang="ts">
  import { base } from '$app/paths';
  import { Compass, Flag, Target, Wind } from 'lucide-svelte';
  import type { IconComponent } from '$lib/themes/theme.svelte.ts';

  interface Topic {
    icon: IconComponent;
    title: string;
    summary: string;
  }

  const TOPICS: Topic[] = [
    {
      icon: Flag,
      title: 'Starting',
      summary: 'Line bias, time-and-distance, and holding a hole on the line.',
    },
    {
      icon: Wind,
      title: 'Upwind Strategy',
      summary: 'Reading shifts, picking sides, and protecting a lead.',
    },
    {
      icon: Target,
      title: 'Mark Roundings',
      summary: 'Laylines, inside overlap, and tactical exits.',
    },
    {
      icon: Compass,
      title: 'Downwind and Finish',
      summary: 'Pressure hunting, gybe sets, and closing speed.',
    },
  ];
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Tactics and Strategy</h1>
      <p class="page-subtitle">
        Tactics is about making good decisions on the course: laylines, covering, start positioning.
        Easier to learn when you work through concrete situations.
      </p>
    </div>
  </div>

  <div class="tactics-grid container">
    {#each TOPICS as topic (topic.title)}
      <div class="topic-card">
        <div class="topic-card-head">
          <span class="topic-icon"><topic.icon size={20} strokeWidth={2} /></span>
          <span class="topic-card-badge">Coming soon</span>
        </div>
        <h3 class="topic-card-title">{topic.title}</h3>
        <p class="topic-card-summary">{topic.summary}</p>
      </div>
    {/each}
  </div>

  <div class="tactics-cta container">
    <p>Verbal and diagram-based scenarios with multiple-choice tactical decisions are in development.</p>
    <a class="btn-primary" href="{base}/">Back to Home</a>
  </div>
</div>

<style>
  .tactics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--space-4);
    padding: var(--space-8) var(--space-6) var(--space-6);
  }

  .topic-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-6);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    color: var(--text);
    transition: border-color var(--transition), transform var(--transition-slow), box-shadow var(--transition-slow);
  }

  .topic-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
  }

  .topic-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .topic-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    color: var(--accent);
  }

  .topic-card-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    background: var(--badge-bg);
    border: 1px solid var(--badge-border);
    color: var(--badge-text);
    font-family: var(--font-heading);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .topic-card-title {
    font-family: var(--font-heading);
    font-size: var(--fs-h3, 24px);
    font-weight: 600;
    margin: 0;
    color: var(--text);
    line-height: 1.2;
  }

  .topic-card-summary {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.5;
  }

  .tactics-cta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-8) var(--space-6) var(--space-12);
    text-align: center;
  }

  .tactics-cta p {
    color: var(--text-muted);
    max-width: 520px;
  }
</style>
