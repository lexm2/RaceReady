<script lang="ts">
  import { base } from '$app/paths';
  import { Link2, Anchor, Lock, Repeat } from 'lucide-svelte';
  import TopicCard from '$lib/components/TopicCard.svelte';
  import type { IconComponent } from '$lib/themes/theme.svelte.ts';

  type Knot = {
    icon: IconComponent;
    title: string;
    blurb: string;
  };

  const knots: Knot[] = [
    {
      icon: Anchor,
      title: 'Bowline',
      blurb: 'A fixed loop that holds under load and unties cleanly. The first knot to learn.',
    },
    {
      icon: Lock,
      title: 'Cleat Hitch',
      blurb: 'How to actually secure a halyard or dock line so the next person can release it.',
    },
    {
      icon: Repeat,
      title: 'Figure Eight',
      blurb: 'A stopper at the end of a sheet so it does not run out of the block when eased.',
    },
  ];
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Knots</h1>
      <p class="page-subtitle">
        The knots you'll actually use on a race boat, with instructions for tying them and when each one is the right choice.
      </p>
    </div>
  </div>

  <div class="topics container">
    {#each knots as knot (knot.title)}
      <TopicCard icon={knot.icon} title={knot.title} blurb={knot.blurb} />
    {/each}
  </div>

  <div class="stub-content">
    <div class="coming-soon-card">
      <span class="stub-icon"><Link2 size={48} /></span>
      <h2>Coming Soon</h2>
      <p>A visual knot library with tying guides and use-case descriptions is being built.</p>
      <a class="btn-primary" href="{base}/">Back to Home</a>
    </div>
  </div>
</div>

<style>
  .topics {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
    padding: var(--space-8) 0 var(--space-4);
  }
</style>
