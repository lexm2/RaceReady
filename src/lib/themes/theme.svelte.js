/**
 * RaceReady Theme Store
 * ---------------------
 * Svelte 5 rune-based reactive theme store.
 *
 * To add a new theme:
 *   1. Add an entry to THEMES below
 *   2. Add a [data-theme="<id>"] block in themes.css
 *   3. The navbar switcher picks it up automatically
 */

export const THEMES = [
  {
    id: 'um-dark',
    label: 'U-M Dark',
    icon: '🌙',
  },
  {
    id: 'um-light',
    label: 'U-M Light',
    icon: '☀️',
  },
]

const STORAGE_KEY = 'raceready-theme'
const DEFAULT_THEME = 'um-dark'

function createThemeStore() {
  let current = $state(DEFAULT_THEME)

  function apply(id) {
    current = id
    document.documentElement.setAttribute('data-theme', id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // localStorage unavailable — silent fail
    }
  }

  function init() {
    let saved = DEFAULT_THEME
    try {
      saved = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME
    } catch {
      // ignore
    }
    if (!THEMES.find(t => t.id === saved)) saved = DEFAULT_THEME
    apply(saved)
  }

  return {
    get current() { return current },
    set(id) { apply(id) },
    toggle() {
      const idx = THEMES.findIndex(t => t.id === current)
      apply(THEMES[(idx + 1) % THEMES.length].id)
    },
    init,
  }
}

export const theme = createThemeStore()
