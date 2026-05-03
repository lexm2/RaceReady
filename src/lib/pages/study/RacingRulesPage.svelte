<script lang="ts">
  import { base } from '$app/paths';
  import { PRESETS, PRESETS_BY_ID, type WhiteboardPreset } from '$lib/whiteboardPresets.ts';
  import { Play, ArrowRight } from 'lucide-svelte';

  interface Category {
    id: string;
    label: string;
    presetIds: string[];
  }

  const CATEGORIES: Category[] = [
    { id: 'right-of-way',   label: 'Right of Way',           presetIds: ['rule_10', 'rule_11', 'rule_12', 'rule_13'] },
    { id: 'general-limits', label: 'General Limitations',    presetIds: ['rule_14', 'rule_15', 'rule_16', 'rule_17'] },
    { id: 'marks',          label: 'Marks and Obstructions', presetIds: ['rule_18'] },
    { id: 'other',          label: 'Other Situations',       presetIds: ['rule_22'] },
  ];

  const CATEGORY_PRESETS: Record<string, WhiteboardPreset[]> = Object.fromEntries(
    CATEGORIES.map(c => [
      c.id,
      c.presetIds.map(id => PRESETS_BY_ID[id]).filter((p): p is WhiteboardPreset => p !== undefined),
    ])
  );

  let activeCategory = $state<string>('all');

  let visiblePresets = $derived(
    activeCategory === 'all' ? PRESETS : (CATEGORY_PRESETS[activeCategory] ?? PRESETS)
  );
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Racing Rules</h1>
      <p class="page-subtitle">
        Pick a rule scenario to launch the whiteboard pre-loaded with that situation.
        Watch the violation notification, drag the boats around, and click the rule link to read the official text.
      </p>
    </div>
  </div>

  <div class="rules-layout container">
    <aside class="rules-sidebar">
      <div class="sidebar-heading">Categories</div>
      <ul class="sidebar-list">
        <li>
          <button
            type="button"
            class="sidebar-item"
            class:active={activeCategory === 'all'}
            onclick={() => (activeCategory = 'all')}
          >
            <span class="sidebar-label">All scenarios</span>
            <span class="sidebar-count">{PRESETS.length}</span>
          </button>
        </li>
        {#each CATEGORIES as cat (cat.id)}
          {@const count = CATEGORY_PRESETS[cat.id].length}
          {#if count > 0}
            <li>
              <button
                type="button"
                class="sidebar-item"
                class:active={activeCategory === cat.id}
                onclick={() => (activeCategory = cat.id)}
              >
                <span class="sidebar-label">{cat.label}</span>
                <span class="sidebar-count">{count}</span>
              </button>
            </li>
          {/if}
        {/each}
      </ul>
    </aside>

    <div class="rules-grid">
      {#each visiblePresets as preset (preset.id)}
        <a class="rule-card" href="{base}/resources/whiteboard?preset={preset.id}">
          <div class="rule-card-head">
            <span class="rule-card-tag">Scenario</span>
            {#if preset.autoPlay}
              <span class="rule-card-badge"><Play size={11} strokeWidth={2.5} /> Animated</span>
            {/if}
          </div>
          <h3 class="rule-card-title">{preset.title}</h3>
          <p class="rule-card-summary">{preset.summary}</p>
          <p class="rule-card-hint">{preset.hint}</p>
          <span class="rule-card-cta">Open in whiteboard <ArrowRight size={12} strokeWidth={2.5} /></span>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  .rules-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: var(--space-8);
    padding: var(--space-8) var(--space-6);
    align-items: start;
  }

  @media (max-width: 880px) {
    .rules-layout {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }
  }

  .rules-sidebar {
    position: sticky;
    top: calc(var(--nav-height) + var(--space-6));
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }

  @media (max-width: 880px) {
    .rules-sidebar {
      position: static;
    }
  }

  .sidebar-heading {
    font-family: var(--font-heading);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    padding: var(--space-2) var(--space-3);
    margin-bottom: var(--space-2);
  }

  .sidebar-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    transition: background var(--transition), border-color var(--transition), color var(--transition);
  }

  .sidebar-item:hover {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    border-color: color-mix(in srgb, var(--accent) 25%, transparent);
  }

  .sidebar-item.active {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    border-color: color-mix(in srgb, var(--accent) 50%, transparent);
    color: var(--accent);
  }

  .sidebar-label {
    font-weight: 500;
  }

  .sidebar-count {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
    background: color-mix(in srgb, var(--text) 8%, transparent);
    padding: 1px 8px;
    border-radius: var(--radius-sm);
    min-width: 24px;
    text-align: center;
  }

  .sidebar-item.active .sidebar-count {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 18%, transparent);
  }

  .rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .rule-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-6);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    text-decoration: none;
    color: var(--text);
    transition: border-color var(--transition), transform var(--transition-slow), box-shadow var(--transition-slow);
  }

  .rule-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
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
    text-transform: uppercase;
  }

  .rule-card-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
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

  .rule-card-title {
    font-family: var(--font-heading);
    font-size: var(--fs-h3, 24px);
    font-weight: 600;
    margin: 0;
    color: var(--text);
    line-height: 1.2;
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
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: var(--space-3);
    font-size: 0.85rem;
    color: var(--accent);
    font-weight: 600;
  }
</style>
