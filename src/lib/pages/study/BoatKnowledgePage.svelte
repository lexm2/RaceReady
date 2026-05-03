<script lang="ts">
  import { base } from '$app/paths';
  import { Anchor, Sailboat, Wind, Wrench } from 'lucide-svelte';
  import TopicCard from '$lib/components/TopicCard.svelte';
  import type { IconComponent } from '$lib/themes/theme.svelte.ts';

  type Topic = {
    icon: IconComponent;
    title: string;
    blurb: string;
  };

  const topics: Topic[] = [
    {
      icon: Sailboat,
      title: 'Boat Anatomy',
      blurb: 'Hull, rig, and running rigging vocabulary you need before any rules talk makes sense.',
    },
    {
      icon: Wind,
      title: 'Sail Trim',
      blurb: 'Reading the telltales, setting twist, and matching shape to the wind range.',
    },
    {
      icon: Wrench,
      title: 'Boat Handling',
      blurb: 'Tacks, gybes, rounding marks cleanly, and recovering when something goes sideways.',
    },
  ];
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Boat Knowledge & Handling</h1>
      <p class="page-subtitle">
        Knowing how to trim the sails and what each part is called comes up in races
        and in protests. This section covers the vocabulary and the basics.
      </p>
    </div>
  </div>

  <div class="topics container">
    {#each topics as topic (topic.title)}
      <TopicCard icon={topic.icon} title={topic.title} blurb={topic.blurb} />
    {/each}
  </div>

  <div class="stub-content">
    <div class="coming-soon-card">
      <span class="stub-icon"><Anchor size={48} /></span>
      <h2>Coming Soon</h2>
      <p>Interactive boat diagrams, rapid-fire labeling quizzes, and trim guides by conditions are coming.</p>
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
