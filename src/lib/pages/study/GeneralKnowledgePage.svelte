<script lang="ts">
  import { base } from '$app/paths';
  import { BookOpen, Cloud, Flag, Trophy } from 'lucide-svelte';
  import TopicCard from '$lib/components/TopicCard.svelte';
  import type { IconComponent } from '$lib/themes/theme.svelte.ts';

  type Topic = {
    icon: IconComponent;
    title: string;
    blurb: string;
  };

  const topics: Topic[] = [
    {
      icon: Cloud,
      title: 'Weather Patterns',
      blurb: 'Reading sea breeze, gradient wind, and frontal shifts before the start gun.',
    },
    {
      icon: Flag,
      title: 'Race Signals',
      blurb: 'What every flag means on the committee boat, from postponement to recall.',
    },
    {
      icon: Trophy,
      title: 'Regatta Format',
      blurb: 'Scoring, throwouts, and how a series turns daily races into a final standing.',
    },
  ];
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>General Knowledge</h1>
      <p class="page-subtitle">
        Weather patterns, racing signals, how a regatta runs. The background knowledge that makes racing make sense.
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
      <span class="stub-icon"><BookOpen size={48} /></span>
      <h2>Coming Soon</h2>
      <p>General sailing knowledge topics and quizzes are under construction.</p>
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
