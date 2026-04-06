<script lang="ts">
  import Dropdown from './Dropdown.svelte';
  import BurgeeLogo from './BurgeeLogo.svelte';
  import { THEMES } from '$lib/themes/theme.svelte.ts';
  import type { ThemeStore } from '$lib/themes/theme.svelte.ts';

  interface Props {
    theme: ThemeStore
  }
  let { theme }: Props = $props();

  let openDropdown = $state<string | null>(null);

  function toggleDropdown(name: string): void {
    openDropdown = openDropdown === name ? null : name;
  }

  $effect(() => {
    function handleOutsideClick(e) {
      if (!e.target.closest('.nav-dropdown')) {
        openDropdown = null;
      }
    }
    function handleEscape(e) {
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

  const studyItems = [
    { label: 'Racing Rules',        href: '/study/racing-rules',   icon: '⚖️' },
    { label: 'Tactics & Strategy',  href: '/study/tactics',        icon: '🧭' },
    { label: 'Boat Knowledge',      href: '/study/boat-knowledge', icon: '⛵' },
    { label: 'General Knowledge',   href: '/study/general',        icon: '📚' },
    { label: 'Knots',               href: '/study/knots',          icon: '🪢' },
  ];

  const resourceItems = [
    { label: 'Racing Rules of Sailing', href: '/resources/rulebook',   icon: '📖' },
    { label: 'Whiteboard',              href: '/resources/whiteboard', icon: '🖊️' },
  ];

  const gameItems = [
    { label: 'Starboard Showdown', href: '/games/starboard',   icon: '🏁' },
    { label: 'Regatta Run',        href: '/games/regatta-run', icon: '🏆' },
  ];
</script>

<nav class="navbar">
  <div class="nav-inner">
    <a class="brand" href="/">
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
        <span class="theme-icon">{nextTheme.icon}</span>
        <span class="theme-label">{nextTheme.label}</span>
      </button>

      <a class="btn-primary nav-cta" href="/games/starboard">Play Now</a>
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
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: var(--radius-sm);
    color: var(--nav-text-muted);
    font-size: 13px;
    font-weight: 500;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: border-color var(--transition), color var(--transition), background var(--transition);
    white-space: nowrap;
  }

  .theme-toggle:hover {
    border-color: var(--michigan-maize);
    color: var(--michigan-maize);
    background: rgba(255, 255, 255, 0.06);
  }

  .theme-icon {
    font-size: 14px;
    line-height: 1;
  }

  .theme-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .nav-cta {
    padding: 8px 20px;
    font-size: 14px;
    text-decoration: none;
  }

  @media (max-width: 768px) {
    .theme-label { display: none; }
  }

  @media (max-width: 640px) {
    .nav-actions .nav-cta { display: none; }
  }
</style>
