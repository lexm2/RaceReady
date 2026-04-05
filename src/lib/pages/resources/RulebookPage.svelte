<script lang="ts">
  import { marked } from 'marked'
  import { RULES_INDEX, RULES_BY_ID, FLAT_SEARCH_LIST, findParentPartId } from '$lib/data/rulesIndex.ts'

  interface Props { navigate: (page: string) => void }
  let { navigate }: Props = $props()

  // Vite requires import.meta.glob at module scope with a static string literal
  const ruleFiles = import.meta.glob('/rules/**/*.md', { query: '?raw', import: 'default' })

  // ── State ────────────────────────────────────────────────────────
  let selectedId    = $state('introduction')
  let contentHtml   = $state('')
  let isLoading     = $state(false)
  let loadError     = $state<string | null>(null)
  let expandedParts = $state(new Set(['part1']))
  let sidebarOpen   = $state(false)
  let searchQuery   = $state('')

  let isSearching   = $derived(searchQuery.trim().length > 0)
  let searchResults = $derived(
    isSearching
      ? FLAT_SEARCH_LIST.filter((item: { title: string; }) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : []
  )

  // ── Content loading ───────────────────────────────────────────────
  $effect(() => {
    const item = RULES_BY_ID[selectedId]
    if (!item?.path) return
    isLoading = true
    loadError = null
    const loader = ruleFiles[item.path]
    if (!loader) {
      loadError = `File not found: ${item.path}`
      isLoading = false
      return
    }
    loader()
      .then(md => {
        contentHtml = marked.parse(md as string) as string
        isLoading = false
      })
      .catch((e: Error) => {
        loadError = e.message
        isLoading = false
      })
  })

  // Close sidebar on Escape (mobile)
  $effect(() => {
    function onKeydown(e: KeyboardEvent): void {
      if (e.key === 'Escape' && sidebarOpen) sidebarOpen = false
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  })

  // ── Actions ───────────────────────────────────────────────────────
  function selectItem(id: string): void {
    selectedId = id
    if (window.matchMedia('(max-width: 768px)').matches) {
      sidebarOpen = false
    }
    document.querySelector('.rulebook-content')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function selectSearchResult(id: string): void {
    // Auto-expand the part that contains this rule
    const partId = findParentPartId(id)
    if (partId) {
      const next = new Set(expandedParts)
      next.add(partId)
      expandedParts = next
    }
    searchQuery = ''
    selectItem(id)
  }

  function togglePart(partId: string): void {
    const next = new Set(expandedParts)
    if (next.has(partId)) {
      next.delete(partId)
    } else {
      next.add(partId)
    }
    expandedParts = next
  }
</script>

<div class="page-container rulebook-page">

  <!-- Compact header -->
  <div class="rulebook-header">
    <div class="container">
      <h1>Racing Rules of Sailing</h1>
      <p class="rulebook-subtitle">2025–2028 Edition · World Sailing</p>
    </div>
  </div>

  <!-- Two-panel layout -->
  <div class="rulebook-layout container">

    <!-- Sidebar -->
    <aside class="rulebook-sidebar" class:open={sidebarOpen}>

      <div class="sidebar-search">
        <div class="search-input-wrap">
          <svg class="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="8.5" cy="8.5" r="5.5"/>
            <line x1="13" y1="13" x2="18" y2="18"/>
          </svg>
          <input
            type="search"
            placeholder="Search rules..."
            bind:value={searchQuery}
            aria-label="Search rules"
          />
        </div>
      </div>

      {#if isSearching}
        <nav class="toc search-results-list" aria-label="Search results">
          {#if searchResults.length === 0}
            <p class="no-results">No rules match "{searchQuery}"</p>
          {:else}
            {#each searchResults as item (item.id)}
              <button
                class="toc-rule"
                class:active={selectedId === item.id}
                onclick={() => selectSearchResult(item.id)}
              >{item.title}</button>
            {/each}
          {/if}
        </nav>
      {:else}
        <nav class="toc" aria-label="Table of contents">
          {#each RULES_INDEX as node (node.id)}

            {#if node.type === 'standalone'}
              <button
                class="toc-rule toc-standalone"
                class:active={selectedId === node.id}
                onclick={() => selectItem(node.id)}
              >{node.title}</button>

            {:else if node.type === 'part'}
              <div class="toc-part">
                <button
                  class="toc-part-header"
                  class:expanded={expandedParts.has(node.id)}
                  onclick={() => togglePart(node.id)}
                  aria-expanded={expandedParts.has(node.id)}
                >
                  <svg class="chevron" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M2 3.5L5 6.5L8 3.5"/>
                  </svg>
                  {node.title}
                </button>

                {#if expandedParts.has(node.id)}
                  <div class="toc-part-children">
                    {#if node.preamble}
                      <button
                        class="toc-rule toc-preamble"
                        class:active={selectedId === node.preamble.id}
                        onclick={() => selectItem(node.preamble.id)}
                      >Preamble</button>
                    {/if}

                    {#each node.children as child (child.id)}
                      {#if child.type === 'section'}
                        <div class="toc-section-label">{child.title}</div>
                        {#if child.preamble}
                          <button
                            class="toc-rule toc-preamble toc-rule--indented"
                            class:active={selectedId === child.preamble.id}
                            onclick={() => selectItem(child.preamble.id)}
                          >Preamble</button>
                        {/if}
                        {#each child.children as rule (rule.id)}
                          <button
                            class="toc-rule toc-rule--indented"
                            class:active={selectedId === rule.id}
                            onclick={() => selectItem(rule.id)}
                          >{rule.title}</button>
                        {/each}
                      {:else}
                        <button
                          class="toc-rule"
                          class:active={selectedId === child.id}
                          onclick={() => selectItem(child.id)}
                        >{child.title}</button>
                      {/if}
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}

          {/each}
        </nav>
      {/if}

    </aside>

    <!-- Mobile backdrop -->
    {#if sidebarOpen}
      <div
        class="sidebar-backdrop"
        onclick={() => sidebarOpen = false}
        role="presentation"
      ></div>
    {/if}

    <!-- Content panel -->
    <main class="rulebook-content">

      <button
        class="mobile-toc-toggle btn-ghost"
        onclick={() => sidebarOpen = !sidebarOpen}
        aria-expanded={sidebarOpen}
      >
        <svg viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="2" width="18" height="14">
          <line x1="0" y1="1" x2="20" y2="1"/>
          <line x1="0" y1="7" x2="20" y2="7"/>
          <line x1="0" y1="13" x2="20" y2="13"/>
        </svg>
        {sidebarOpen ? 'Close' : 'Table of Contents'}
      </button>

      {#if isLoading}
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>
      {:else if loadError}
        <div class="error-state">
          <p>Could not load this rule.</p>
          <p class="error-detail">{loadError}</p>
        </div>
      {:else}
        <article class="rule-article">
          {@html contentHtml}
        </article>
      {/if}

    </main>

  </div>
</div>

<style>
  /* ── Page shell ─────────────────────────────────────────────────── */
  .rulebook-page {
    min-height: 100vh;
  }

  .rulebook-header {
    padding: var(--space-8) 0 var(--space-6);
    text-align: center;
    background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg) 100%);
    border-bottom: 1px solid var(--border);
  }

  .rulebook-header h1 {
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    font-weight: 700;
    font-family: var(--font-heading);
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--title-grad-from) 0%, var(--title-grad-to) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: var(--space-2);
  }

  .rulebook-subtitle {
    font-size: 0.9375rem;
    color: var(--text-muted);
  }

  /* ── Two-panel grid ─────────────────────────────────────────────── */
  .rulebook-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    align-items: start;
    min-height: calc(100vh - var(--nav-height) - 90px);
  }

  /* ── Sidebar ────────────────────────────────────────────────────── */
  .rulebook-sidebar {
    position: sticky;
    top: var(--nav-height);
    height: calc(100vh - var(--nav-height));
    overflow-y: auto;
    border-right: 1px solid var(--border);
    background: var(--bg-surface);
  }

  /* ── Search ─────────────────────────────────────────────────────── */
  .sidebar-search {
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--border);
  }

  .search-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 9px;
    width: 14px;
    height: 14px;
    color: var(--text-muted);
    pointer-events: none;
    flex-shrink: 0;
  }

  .sidebar-search input {
    width: 100%;
    padding: 7px 10px 7px 30px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 13px;
    transition: border-color var(--transition);
  }

  .sidebar-search input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .sidebar-search input::placeholder {
    color: var(--text-muted);
    opacity: 0.7;
  }

  /* ── TOC ────────────────────────────────────────────────────────── */
  .toc {
    padding: var(--space-2) 0 var(--space-8);
  }

  .toc-standalone {
    display: block;
    width: 100%;
    padding: 8px var(--space-4);
    background: transparent;
    border: none;
    border-left: 2px solid transparent;
    color: var(--text-muted);
    font-family: var(--font-sans);
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    transition: background var(--transition), color var(--transition), border-color var(--transition);
  }

  .toc-standalone:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--accent) 6%, transparent);
  }

  .toc-standalone.active {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border-left-color: var(--accent);
    font-weight: 600;
  }

  .toc-part {
    margin-top: var(--space-1);
  }

  .toc-part-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: transparent;
    border: none;
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    cursor: pointer;
    text-align: left;
    transition: background var(--transition), color var(--transition);
    line-height: 1.4;
  }

  .toc-part-header:hover {
    background: color-mix(in srgb, var(--accent) 6%, transparent);
    color: var(--accent);
  }

  .chevron {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    transition: transform var(--transition);
    color: var(--text-muted);
  }

  .toc-part-header.expanded .chevron {
    transform: rotate(180deg);
  }

  .toc-part-children {
    padding-bottom: var(--space-2);
  }

  .toc-section-label {
    padding: var(--space-3) var(--space-4) var(--space-1) var(--space-6);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin-top: var(--space-1);
    opacity: 0.8;
  }

  .toc-rule {
    display: block;
    width: 100%;
    padding: 6px var(--space-4) 6px var(--space-6);
    background: transparent;
    border: none;
    border-left: 2px solid transparent;
    color: var(--text-muted);
    font-family: var(--font-sans);
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    transition: background var(--transition), color var(--transition), border-color var(--transition);
    line-height: 1.4;
  }

  .toc-rule--indented {
    padding-left: var(--space-8);
  }

  .toc-preamble {
    font-style: italic;
    font-size: 12px;
    opacity: 0.75;
  }

  .toc-rule:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--accent) 6%, transparent);
  }

  .toc-rule.active {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border-left-color: var(--accent);
    font-weight: 600;
    opacity: 1;
  }

  .no-results {
    padding: var(--space-6) var(--space-4);
    font-size: 13px;
    color: var(--text-muted);
    text-align: center;
    font-style: italic;
  }

  /* ── Content panel ──────────────────────────────────────────────── */
  .rulebook-content {
    padding: var(--space-10) var(--space-10) var(--space-16);
    min-height: 600px;
  }

  .mobile-toc-toggle {
    display: none;
    margin-bottom: var(--space-6);
    gap: var(--space-2);
    font-size: 14px;
  }

  /* ── Rule article (markdown output) ────────────────────────────── */
  .rule-article {
    max-width: 760px;
  }

  /* These target {@html} output so must be :global */
  :global(.rule-article h1) {
    font-family: var(--font-heading);
    font-size: clamp(1.4rem, 2.5vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--text);
    margin-bottom: var(--space-3);
    padding-bottom: var(--space-3);
    border-bottom: 2px solid var(--border);
    line-height: 1.2;
  }

  :global(.rule-article h2) {
    font-family: var(--font-heading);
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text);
    margin: var(--space-8) 0 var(--space-3);
  }

  :global(.rule-article h3) {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    margin: var(--space-6) 0 var(--space-2);
  }

  :global(.rule-article p) {
    color: var(--text-muted);
    line-height: 1.8;
    margin-bottom: var(--space-4);
    font-size: 0.9375rem;
  }

  :global(.rule-article strong) {
    color: var(--text);
    font-weight: 600;
  }

  :global(.rule-article ul),
  :global(.rule-article ol) {
    color: var(--text-muted);
    padding-left: var(--space-8);
    margin-bottom: var(--space-4);
    line-height: 1.8;
    font-size: 0.9375rem;
  }

  :global(.rule-article li) {
    margin-bottom: var(--space-1);
  }

  :global(.rule-article hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: var(--space-6) 0;
  }

  :global(.rule-article a) {
    color: var(--link);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  :global(.rule-article code) {
    font-family: var(--font-mono);
    font-size: 0.875em;
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    padding: 1px 5px;
    border-radius: 3px;
  }

  /* ── Loading / error ────────────────────────────────────────────── */
  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-16) var(--space-6);
    gap: var(--space-4);
    min-height: 300px;
  }

  .loading-state p,
  .error-state p {
    color: var(--text-muted);
    font-size: 14px;
  }

  .error-detail {
    font-family: var(--font-mono);
    font-size: 12px !important;
    opacity: 0.7;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 600ms linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── Mobile sidebar ─────────────────────────────────────────────── */
  .sidebar-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 49;
  }

  @media (max-width: 768px) {
    .rulebook-layout {
      grid-template-columns: 1fr;
      padding: 0;
    }

    .mobile-toc-toggle {
      display: inline-flex;
    }

    .sidebar-backdrop {
      display: block;
    }

    .rulebook-sidebar {
      position: fixed;
      top: var(--nav-height);
      left: 0;
      bottom: 0;
      width: 300px;
      height: auto;
      z-index: 50;
      transform: translateX(-100%);
      transition: transform var(--transition-slow);
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
    }

    .rulebook-sidebar.open {
      transform: translateX(0);
    }

    .rulebook-content {
      padding: var(--space-6) var(--space-4) var(--space-12);
    }
  }
</style>
