<script lang="ts">
  import BurgeeLogo from './BurgeeLogo.svelte'
  interface Props { navigate: (page: string) => void }
  let { navigate }: Props = $props()

  const studyLinks = [
    { label: 'Racing Rules',       page: 'racing-rules' },
    { label: 'Tactics & Strategy', page: 'tactics' },
    { label: 'Boat Knowledge',     page: 'boat-knowledge' },
    { label: 'General Knowledge',  page: 'general' },
    { label: 'Knots',              page: 'knots' },
  ]

  const resourceLinks = [
    { label: 'Racing Rules of Sailing', page: 'rulebook' },
    { label: 'Whiteboard',              page: 'whiteboard' },
  ]

  const gameLinks = [
    { label: 'Starboard Showdown', page: 'starboard' },
    { label: 'Regatta Run',        page: 'regatta-run' },
  ]
</script>

<footer class="footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <button class="brand-btn" onclick={() => navigate('home')}>
        <BurgeeLogo size={28} />
        <span class="brand-name">RaceReady</span>
      </button>
      <p class="brand-tagline">
        Your complete sailing race<br />education platform.
      </p>
    </div>

    <div class="footer-links">
      {#snippet linkCol(heading, links)}
        <div class="link-col">
          <h4 class="col-heading">{heading}</h4>
          <ul>
            {#each links as link}
              <li>
                <button class="footer-link" onclick={() => navigate(link.page)}>
                  {link.label}
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/snippet}

      {@render linkCol('Study', studyLinks)}
      {@render linkCol('Resources', resourceLinks)}
      {@render linkCol('Games', gameLinks)}
    </div>
  </div>

  <div class="footer-bottom">
    <div class="container footer-bottom-inner">
      <p class="copyright">© {new Date().getFullYear()} RaceReady. All rights reserved.</p>
      <p class="rules-note">Racing Rules of Sailing 2025–2028 · World Sailing</p>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: var(--footer-bg);
    border-top: 1px solid var(--border);
    margin-top: auto;
  }

  .footer-inner {
    display: flex;
    gap: var(--space-16);
    padding: var(--space-12) var(--space-6);
    align-items: flex-start;
  }

  .footer-brand {
    flex-shrink: 0;
    max-width: 220px;
  }

  .brand-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: var(--space-4);
  }


  .brand-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--footer-text);
    font-family: var(--font-sans);
    letter-spacing: -0.02em;
  }

  .brand-tagline {
    font-size: 13px;
    color: var(--footer-text);
    line-height: 1.65;
    margin: 0;
    opacity: 0.75;
  }

  .footer-links {
    display: flex;
    gap: var(--space-12);
    flex: 1;
    flex-wrap: wrap;
  }

  .link-col {
    min-width: 140px;
  }

  .col-heading {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--michigan-maize);
    margin-bottom: var(--space-4);
  }

  .link-col ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .footer-link {
    background: transparent;
    border: none;
    color: var(--footer-text);
    font-size: 14px;
    font-family: var(--font-sans);
    cursor: pointer;
    padding: 0;
    text-align: left;
    transition: color var(--transition);
    opacity: 0.8;
  }

  .footer-link:hover {
    color: var(--michigan-maize);
    opacity: 1;
  }

  .footer-bottom {
    border-top: 1px solid var(--border);
  }

  .footer-bottom-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4) var(--space-6);
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .copyright,
  .rules-note {
    font-size: 12px;
    color: var(--footer-text);
    margin: 0;
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    .footer-inner {
      flex-direction: column;
      gap: var(--space-8);
    }

    .footer-links {
      gap: var(--space-8);
    }

    .footer-brand {
      max-width: 100%;
    }

    .footer-bottom-inner {
      flex-direction: column;
      text-align: center;
    }
  }
</style>
