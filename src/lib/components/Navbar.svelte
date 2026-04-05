<script>
  import Dropdown from './Dropdown.svelte'
  import BurgeeLogo from './BurgeeLogo.svelte'
  import { THEMES } from '$lib/themes/theme.svelte.js'

  let { currentPage, navigate, theme } = $props()

  let openDropdown = $state(null)

  function toggleDropdown(name) {
    openDropdown = openDropdown === name ? null : name
  }

  $effect(() => {
    function handleOutsideClick(e) {
      if (!e.target.closest('.nav-dropdown')) {
        openDropdown = null
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') openDropdown = null
    }
    document.addEventListener('click', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  })

  function handleNavigate(page) {
    navigate(page)
    openDropdown = null
  }

  let nextTheme = $derived(
    THEMES[(THEMES.findIndex(t => t.id === theme.current) + 1) % THEMES.length]
  )

  const studyItems = [
    { label: 'Racing Rules',        page: 'racing-rules',   icon: '⚖️' },
    { label: 'Tactics & Strategy',  page: 'tactics',        icon: '🧭' },
    { label: 'Boat Knowledge',      page: 'boat-knowledge', icon: '⛵' },
    { label: 'General Knowledge',   page: 'general',        icon: '📚' },
    { label: 'Knots',               page: 'knots',          icon: '🪢' },
  ]

  const resourceItems = [
    { label: 'Racing Rules of Sailing', page: 'rulebook',   icon: '📖' },
    { label: 'Whiteboard',              page: 'whiteboard', icon: '🖊️' },
  ]

  const gameItems = [
    { label: 'Starboard Showdown', page: 'starboard',   icon: '🏁' },
    { label: 'Regatta Run',        page: 'regatta-run', icon: '🏆' },
  ]
</script>

<nav class="navbar">
  <div class="nav-inner">
    <button class="brand" onclick={() => handleNavigate('home')}>
      <BurgeeLogo size={34} />
      <span class="brand-name">RaceReady</span>
    </button>

    <div class="nav-links">
      <Dropdown
        label="Study"
        items={studyItems}
        isOpen={openDropdown === 'study'}
        onToggle={() => toggleDropdown('study')}
        onNavigate={handleNavigate}
      />
      <Dropdown
        label="Resources"
        items={resourceItems}
        isOpen={openDropdown === 'resources'}
        onToggle={() => toggleDropdown('resources')}
        onNavigate={handleNavigate}
      />
      <Dropdown
        label="Games"
        items={gameItems}
        isOpen={openDropdown === 'games'}
        onToggle={() => toggleDropdown('games')}
        onNavigate={handleNavigate}
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

      <button class="btn-primary nav-cta" onclick={() => handleNavigate('starboard')}>
        Play Now
      </button>
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
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
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

  /* Theme toggle */
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
  }

  @media (max-width: 768px) {
    .theme-label { display: none; }
  }

  @media (max-width: 640px) {
    .nav-actions .nav-cta { display: none; }
  }
</style>
