<script lang="ts">
  import type { IconComponent } from '$lib/themes/theme.svelte.ts';

  interface Props {
    icon: IconComponent;
    title: string;
    blurb: string;
  }

  let { icon: Icon, title, blurb }: Props = $props();
</script>

<article class="topic-card">
  <span class="topic-icon"><Icon size={28} /></span>
  <h3 class="topic-title">{title}</h3>
  <p class="topic-blurb">{blurb}</p>
</article>

<style>
  .topic-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-6);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    transition: border-color var(--transition), transform var(--transition-slow), box-shadow var(--transition-slow);
  }

  .topic-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--puma-black) 35%, transparent);
  }

  .topic-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    color: var(--accent);
  }

  .topic-title {
    font-family: var(--font-heading);
    font-size: var(--fs-h3, 24px);
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }

  .topic-blurb {
    color: var(--text-muted);
    font-size: var(--fs-body, 16px);
    line-height: 1.5;
    margin: 0;
  }
</style>
