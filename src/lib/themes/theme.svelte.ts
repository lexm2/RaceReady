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

import { Moon, Sun } from 'lucide-svelte';
import type { Component } from 'svelte';

export interface Theme {
  id: string
  label: string
  icon: Component
}

export interface ThemeStore {
  readonly current: string
  set(id: string): void
  toggle(): void
  init(): void
}

export const THEMES: Theme[] = [
  { id: 'um-dark',  label: 'U-M Dark',  icon: Moon },
  { id: 'um-light', label: 'U-M Light', icon: Sun  },
]

const STORAGE_KEY = 'raceready-theme'
const DEFAULT_THEME = 'um-dark'

function createThemeStore(): ThemeStore {
  let current = $state(DEFAULT_THEME)

  function apply(id: string): void {
    current = id
    document.documentElement.setAttribute('data-theme', id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // localStorage unavailable - silent fail
    }
  }

  function init(): void {
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
    set(id: string) { apply(id) },
    toggle() {
      const idx = THEMES.findIndex(t => t.id === current)
      apply(THEMES[(idx + 1) % THEMES.length].id)
    },
    init,
  }
}

export const theme = createThemeStore()
