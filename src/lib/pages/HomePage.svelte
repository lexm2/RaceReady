<script lang="ts">
  import Hero from '../components/Hero.svelte';
  import FeatureCard from '../components/FeatureCard.svelte';

  const studyItems = ['Racing Rules', 'Tactics & Strategy', 'Boat Knowledge', 'General Knowledge', 'Knots'];
  const resourceItems = ['Full 2025–2028 Rulebook', 'Interactive Whiteboard'];
  const gameItems = ['Starboard Showdown', 'Regatta Run'];
</script>

<div class="home">
  <Hero />

  <section class="features-section">
    <div class="container">
      <h2 class="section-heading">Everything You Need to Race Smarter</h2>
      <p class="section-subheading">
        From beginner drills to advanced rule scenarios — RaceReady has it all.
      </p>

      <div class="feature-grid">
        <FeatureCard
          icon="📚"
          title="Study"
          description="Build a solid foundation in racing rules, boat handling, and tactical decision-making across five structured topics."
          items={studyItems}
          ctaLabel="Start Studying"
          ctaHref="/study/racing-rules"
          accentColor="maize"
        />
        <FeatureCard
          icon="📖"
          title="Resources"
          description="Access the complete Racing Rules of Sailing with clickable references and a digital whiteboard for scenario planning."
          items={resourceItems}
          ctaLabel="Open Rulebook"
          ctaHref="/resources/rulebook"
          accentColor="blue"
        />
        <FeatureCard
          icon="🏆"
          title="Games"
          description="Test your knowledge under pressure. Fast-paced racing scenarios with timed responses and performance tracking."
          items={gameItems}
          ctaLabel="Play Now"
          ctaHref="/games/starboard"
          accentColor="orange"
        />
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="container cta-inner">
      <div class="cta-content">
        <h2 class="cta-heading">Ready to race smarter?</h2>
        <p class="cta-desc">Start with the rules, sharpen your tactics, then test yourself under race pressure.</p>
      </div>
      <div class="cta-buttons">
        <a class="btn-primary" href="/study/racing-rules">Start Learning</a>
        <a class="btn-ghost cta-ghost" href="/games/starboard">Try Starboard Showdown</a>
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
    border-top: 1px solid rgba(255, 203, 5, 0.2);
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
    border-color: rgba(255, 255, 255, 0.35);
  }

  .cta-ghost:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.6);
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
