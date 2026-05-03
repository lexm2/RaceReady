<script lang="ts">
  import { base } from '$app/paths';
  import Dropdown from './Dropdown.svelte';
  import BurgeeLogo from './BurgeeLogo.svelte';
  import { THEMES } from '$lib/themes/theme.svelte.ts';
  import type { ThemeStore } from '$lib/themes/theme.svelte.ts';
  import { Scale, Compass, Anchor, BookOpen, Link2, BookText, PenLine, Flag, Trophy } from 'lucide-svelte';

  interface Props {
    theme: ThemeStore
  }
  let { theme }: Props = $props();

  let openDropdown = $state<string | null>(null);

  function toggleDropdown(name: string): void {
    openDropdown = openDropdown === name ? null : name;
  }

  $effect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (!(e.target as Element | null)?.closest('.nav-dropdown')) {
        openDropdown = null;
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') openDropdown = null;
    }
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  });

  let nextTheme = $derived(
    THEMES[(THEMES.findIndex(t => t.id === theme.current) + 1) % THEMES.length]
  );
  let ThemeIcon = $derived(nextTheme.icon);

  const studyItems = [
    { label: 'Racing Rules',        href: `${base}/study/racing-rules`,   icon: Scale    },
    { label: 'Tactics & Strategy',  href: `${base}/study/tactics`,        icon: Compass  },
    { label: 'Boat Knowledge',      href: `${base}/study/boat-knowledge`, icon: Anchor   },
    { label: 'General Knowledge',   href: `${base}/study/general`,        icon: BookOpen },
    { label: 'Knots',               href: `${base}/study/knots`,          icon: Link2    },
  ];

  const resourceItems = [
    { label: 'Rules',                   href: `${base}/resources/rulebook`,   icon: BookText },
    { label: 'Whiteboard',              href: `${base}/resources/whiteboard`, icon: PenLine  },
  ];

  const gameItems = [
    { label: 'Starboard Showdown', href: `${base}/games/starboard`,   icon: Flag   },
    { label: 'Regatta Run',        href: `${base}/games/regatta-run`, icon: Trophy },
  ];
</script>

<nav class="navbar">
  <div class="nav-inner">
    <a class="brand" href="{base}/">
      <BurgeeLogo size={34} />
      <span class="brand-name">RaceReady</span>
    </a>

    <div class="nav-links">
      <Dropdown
        label="Study"
        items={studyItems}
        isOpen={openDropdown === 'study'}
        onToggle={() => toggleDropdown('study')}
        onClose={() => { openDropdown = null; }}
      />
      <Dropdown
        label="Resources"
        items={resourceItems}
        isOpen={openDropdown === 'resources'}
        onToggle={() => toggleDropdown('resources')}
        onClose={() => { openDropdown = null; }}
      />
      <Dropdown
        label="Games"
        items={gameItems}
        isOpen={openDropdown === 'games'}
        onToggle={() => toggleDropdown('games')}
        onClose={() => { openDropdown = null; }}
      />
    </div>

    <div class="nav-actions">
      <button
        class="theme-toggle"
        onclick={() => theme.toggle()}
        title="Switch to {nextTheme.label} theme"
        aria-label="Switch to {nextTheme.label} theme"
      >
        <span class="theme-icon"><ThemeIcon size={14} /></span>
        <span class="theme-label">{nextTheme.label}</span>
      </button>

      <a class="btn-primary nav-cta" href="{base}/games/starboard">Play Now</a>
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--nav-height);
    background: var(--nav-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow-nav);
    z-index: 100;
    transition: background var(--transition-slow), border-color var(--transition-slow);
  }

  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-6);
    height: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-6);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
  }

  .brand-name {
    font-size: 18px;
    font-weight: 700;
    color: var(--nav-text);
    font-family: var(--font-heading);
    letter-spacing: -0.02em;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    flex: 1;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--nav-text) 25%, transparent);
    border-radius: var(--radius-sm);
    color: var(--nav-text-muted);
    font-size: var(--fs-label, 14px);
    font-weight: 500;
    font-family: var(--font-sans);
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: border-color var(--transition), color var(--transition), background var(--transition);
    white-space: nowrap;
  }

  .theme-toggle:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: color-mix(in srgb, var(--nav-text) 6%, transparent);
  }

  .theme-icon {
    display: flex;
    align-items: center;
  }

  .theme-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .nav-cta {
    padding: 8px 20px;
    font-size: var(--fs-button, 14px);
    text-decoration: none;
  }

  @media (max-width: 768px) {
    .theme-label { display: none; }
  }

  @media (max-width: 640px) {
    .nav-actions .nav-cta { display: none; }
  }
</style>
