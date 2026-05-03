<script lang="ts">
  import type { IconComponent } from '$lib/themes/theme.svelte.ts';

  interface DropdownItem {
    label: string
    href: string
    icon?: IconComponent
  }
  interface Props {
    label: string
    items: DropdownItem[]
    isOpen: boolean
    onToggle: () => void
    onClose: () => void
  }
  let { label, items, isOpen, onToggle, onClose }: Props = $props();
</script>

<div class="nav-dropdown">
  <button
    class="dropdown-trigger"
    class:active={isOpen}
    onclick={onToggle}
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    {label}
    <svg class="chevron" class:rotated={isOpen} width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  {#if isOpen}
    <ul class="dropdown-menu" role="menu">
      {#each items as item}
        <li role="menuitem">
          <a class="dropdown-item" href={item.href} onclick={onClose}>
            {#if item.icon}
              {@const Icon = item.icon}
              <span class="item-icon"><Icon size={15} /></span>
            {/if}
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .nav-dropdown {
    position: relative;
  }

  .dropdown-trigger {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 4px;
    margin: 0 10px;
    background: transparent;
    border: none;
    color: var(--nav-text-muted);
    font-size: var(--fs-label, 14px);
    font-weight: 500;
    font-family: var(--font-sans);
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: color var(--transition);
    white-space: nowrap;
  }

  .dropdown-trigger::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform var(--transition);
  }

  .dropdown-trigger:hover,
  .dropdown-trigger.active {
    color: var(--nav-text);
  }

  .dropdown-trigger:hover::after,
  .dropdown-trigger.active::after {
    transform: scaleX(1);
  }

  .chevron {
    transition: transform var(--transition);
    flex-shrink: 0;
  }

  .chevron.rotated {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 220px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    list-style: none;
    margin: 0;
    padding: 6px;
    z-index: 200;
    animation: slideDown 160ms ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 14px;
    background: transparent;
    color: var(--text);
    font-size: var(--fs-label, 14px);
    font-family: var(--font-sans);
    font-weight: 400;
    letter-spacing: 0.01em;
    text-decoration: none;
    border-radius: var(--radius-sm);
    transition: background var(--transition), color var(--transition);
  }

  .dropdown-item:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    color: var(--accent);
  }

  .item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    flex-shrink: 0;
    opacity: 0.7;
  }
</style>
