<script>
  let { icon, title, description, items, ctaLabel, ctaPage, accentColor = 'maize', navigate } = $props()

  const colorMap = {
    maize:  'var(--michigan-maize)',
    blue:   'var(--arboretum-blue)',
    orange: 'var(--ross-orange)',
    teal:   'var(--taubman-teal)',
    red:    'var(--tappan-red)',
    // legacy aliases
    seafoam: 'var(--michigan-maize)',
    gold:    'var(--ross-orange)',
  }

  let accent = $derived(colorMap[accentColor] ?? 'var(--michigan-maize)')
</script>

<div class="feature-card" style="--card-accent: {accent}">
  <div class="card-icon-wrap">
    <span class="card-icon">{icon}</span>
  </div>

  <h3 class="card-title">{title}</h3>
  <p class="card-desc">{description}</p>

  <ul class="card-items">
    {#each items as item}
      <li class="card-item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="check">
          <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {item}
      </li>
    {/each}
  </ul>

  <button class="card-cta" onclick={() => navigate(ctaPage)}>
    {ctaLabel}
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</div>

<style>
  .feature-card {
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    transition: border-color var(--transition), transform var(--transition-slow), box-shadow var(--transition-slow);
    cursor: default;
  }

  .feature-card:hover {
    border-color: var(--card-accent);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--card-accent);
  }

  .card-icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--space-6);
    transition: background var(--transition), border-color var(--transition);
  }

  .feature-card:hover .card-icon-wrap {
    background: color-mix(in srgb, var(--card-accent) 15%, transparent);
    border-color: color-mix(in srgb, var(--card-accent) 40%, transparent);
  }

  .card-icon {
    font-size: 24px;
    line-height: 1;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: var(--space-3);
    letter-spacing: -0.01em;
  }

  .card-desc {
    font-size: 0.9375rem;
    color: var(--text-muted);
    line-height: 1.65;
    margin-bottom: var(--space-6);
  }

  .card-items {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--space-8);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    flex: 1;
  }

  .card-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--text-muted);
  }

  .check {
    color: var(--card-accent);
    flex-shrink: 0;
  }

  .card-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    padding: 11px 20px;
    background: transparent;
    border: 1px solid var(--card-accent);
    border-radius: var(--radius-sm);
    color: var(--card-accent);
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: background var(--transition), color var(--transition);
    margin-top: auto;
  }

  .card-cta:hover {
    background: var(--card-accent);
    color: var(--navy);
  }
</style>
