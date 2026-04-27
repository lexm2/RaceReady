<script lang="ts">
  import BurgeeLogo from './BurgeeLogo.svelte';
</script>

<section class="hero">
  <div class="hero-bg">
    <div class="hero-glow glow-1"></div>
    <div class="hero-glow glow-2"></div>
  </div>

  <div class="container hero-content">
    <div class="hero-badge">
      <BurgeeLogo size={18} />
      Racing Rules of Sailing 2025-2028
    </div>

    <h1 class="hero-title">
      Learn to <span class="title-accent">Race.</span>
    </h1>

    <p class="hero-description">
      Racing rules can be confusing at first. This site breaks down the 2025-2028 rulebook
      into the scenarios you'll actually see on the water: right of way, mark roundings,
      starts, and protests.
    </p>

    <div class="hero-cta">
      <a class="btn-primary cta-main" href="/study/racing-rules">
        Start Studying
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
      <a class="cta-secondary" href="/games/starboard">Play a Game</a>
    </div>

    <div class="hero-stats">
      {#snippet stat(value: string, label: string)}
        <div class="stat-item">
          <span class="stat-value">{value}</span>
          <span class="stat-label">{label}</span>
        </div>
      {/snippet}

      {@render stat('90+', 'Racing Rules')}
      <div class="stat-divider"></div>
      {@render stat('5', 'Study Topics')}
      <div class="stat-divider"></div>
      {@render stat('2', 'Race Games')}
    </div>
  </div>

  <div class="hero-wave">
    <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
      <path d="M0 80V40C240 0 480 80 720 40C960 0 1200 60 1440 30V80H0Z" fill="var(--hero-wave-fill)"/>
    </svg>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: calc(100vh - var(--nav-height));
    padding-top: calc(var(--nav-height) + var(--space-20));
    padding-bottom: var(--space-20);
    background: var(--hero-bg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: background var(--transition-slow);
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .hero-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: var(--hero-glow-opacity);
    transition: background var(--transition-slow), opacity var(--transition-slow);
  }

  .glow-1 {
    width: 600px;
    height: 600px;
    background: var(--hero-glow-1);
    top: -100px;
    right: -100px;
  }

  .glow-2 {
    width: 400px;
    height: 400px;
    background: var(--hero-glow-2);
    bottom: 0;
    left: -50px;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 6px 14px;
    background: var(--badge-bg);
    border: 1px solid var(--badge-border);
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    color: var(--badge-text);
    margin-bottom: var(--space-8);
    letter-spacing: 0.01em;
    transition: background var(--transition-slow), border-color var(--transition-slow), color var(--transition-slow);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .hero-title {
    font-size: clamp(2.75rem, 7vw, 5.5rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.05;
    color: var(--hero-title-color);
    margin-bottom: var(--space-6);
    transition: color var(--transition-slow);
  }

  .title-accent {
    background: linear-gradient(135deg, var(--title-grad-from) 0%, var(--title-grad-to) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-description {
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: var(--text-muted);
    max-width: 540px;
    line-height: 1.75;
    margin-bottom: 40px;
    transition: color var(--transition-slow);
  }

  .hero-cta {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-16);
    flex-wrap: wrap;
    justify-content: center;
  }

  .cta-main {
    padding: 14px 32px;
    font-size: 16px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .cta-secondary {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 14px 32px;
    background: transparent;
    color: var(--hero-title-color);
    border: 1px solid color-mix(in srgb, var(--hero-title-color) 40%, transparent);
    border-radius: var(--radius-sm);
    font-size: 16px;
    font-weight: 500;
    font-family: var(--font-sans);
    text-decoration: none;
    transition: border-color var(--transition), background var(--transition), color var(--transition-slow);
  }

  .cta-secondary:hover {
    border-color: var(--hero-title-color);
    background: color-mix(in srgb, var(--hero-title-color) 8%, transparent);
  }

  .hero-stats {
    display: flex;
    align-items: center;
    gap: var(--space-8);
    padding: var(--space-6) var(--space-8);
    background: var(--hero-stats-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    transition: background var(--transition-slow), border-color var(--transition-slow);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--hero-title-color);
    letter-spacing: -0.02em;
    line-height: 1;
    transition: color var(--transition-slow);
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .stat-divider {
    width: 1px;
    height: 36px;
    background: var(--border);
  }

  .hero-wave {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
  }

  .hero-wave svg {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 640px) {
    .hero {
      padding-top: calc(var(--nav-height) + var(--space-12));
    }

    .hero-stats {
      gap: var(--space-6);
      padding: var(--space-4) var(--space-6);
    }

    .stat-value {
      font-size: 1.375rem;
    }
  }
</style>
