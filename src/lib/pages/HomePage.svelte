<script lang="ts">
  import { base } from '$app/paths';
  import Hero from '../components/Hero.svelte';
  import FeatureCard from '../components/FeatureCard.svelte';
  import { GraduationCap, BookMarked, Gamepad2 } from 'lucide-svelte';

  const studyItems = ['Racing Rules', 'Tactics & Strategy', 'Boat Knowledge', 'General Knowledge', 'Knots'];
  const resourceItems = ['Full 2025-2028 Rulebook', 'Interactive Whiteboard'];
  const gameItems = ['Starboard Showdown', 'Regatta Run'];
</script>

<div class="home">
  <Hero />

  <section class="features-section">
    <div class="container">
      <h2 class="section-heading">Where do you want to start?</h2>

      <div class="feature-grid">
        <FeatureCard
          icon={GraduationCap}
          title="Study"
          description="Racing rules have a reputation for being complicated. Work through them by topic: right of way, mark roundings, starts, and protests, at your own pace."
          items={studyItems}
          ctaLabel="Start Studying"
          ctaHref="{base}/study/racing-rules"
          accentColor="maize"
        />
        <FeatureCard
          icon={BookMarked}
          title="Resources"
          description="Read the full 2025-2028 Racing Rules of Sailing in a clean, searchable format. Use the whiteboard to draw out a situation and work out who's in the wrong."
          items={resourceItems}
          ctaLabel="Open Rulebook"
          ctaHref="{base}/resources/rulebook"
          accentColor="blue"
        />
        <FeatureCard
          icon={Gamepad2}
          title="Games"
          description="Starboard Showdown puts you in a right-of-way situation and asks who has to keep clear. Good for drilling the rules you keep second-guessing."
          items={gameItems}
          ctaLabel="Play Now"
          ctaHref="{base}/games/starboard"
          accentColor="orange"
        />
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="container cta-inner">
      <div class="cta-content">
        <h2 class="cta-heading">The rules start clicking once you've seen them applied.</h2>
        <p class="cta-desc">Start with the basics. Work through a topic. Then test yourself on the scenarios that come up most in real racing.</p>
      </div>
      <div class="cta-buttons">
        <a class="btn-primary" href="{base}/study/racing-rules">Start Learning</a>
        <a class="btn-ghost cta-ghost" href="{base}/games/starboard">Try Starboard Showdown</a>
      </div>
    </div>
  </section>
</div>

<style>
  .home {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .features-section {
    padding: var(--space-20) 0;
    background: var(--bg);
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-6);
  }

  .cta-section {
    padding: var(--space-20) 0;
    background: var(--cta-bg);
    border-top: 1px solid color-mix(in srgb, var(--michigan-maize) 20%, transparent);
  }

  .cta-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-8);
    flex-wrap: wrap;
  }

  .cta-content {
    max-width: 520px;
  }

  .cta-heading {
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: var(--space-3);
    color: var(--cta-text);
  }

  .cta-desc {
    font-size: 1rem;
    color: var(--cta-text-muted);
  }

  .cta-buttons {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  .btn-primary,
  .btn-ghost {
    text-decoration: none;
  }

  .cta-ghost {
    color: var(--cta-text);
    border-color: color-mix(in srgb, var(--cta-text) 35%, transparent);
  }

  .cta-ghost:hover {
    background: color-mix(in srgb, var(--cta-text) 10%, transparent);
    border-color: color-mix(in srgb, var(--cta-text) 60%, transparent);
    color: var(--cta-text);
  }

  @media (max-width: 768px) {
    .cta-inner {
      flex-direction: column;
      text-align: center;
    }

    .cta-buttons {
      justify-content: center;
    }
  }
</style>
