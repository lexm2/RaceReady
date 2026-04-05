<script>
  import { theme } from './lib/themes/theme.svelte.js'
  import Navbar from './lib/components/Navbar.svelte'
  import Footer from './lib/components/Footer.svelte'


  import HomePage from './lib/pages/HomePage.svelte'
  import RacingRulesPage from './lib/pages/study/RacingRulesPage.svelte'
  import TacticsPage from './lib/pages/study/TacticsPage.svelte'
  import BoatKnowledgePage from './lib/pages/study/BoatKnowledgePage.svelte'
  import GeneralKnowledgePage from './lib/pages/study/GeneralKnowledgePage.svelte'
  import KnotsPage from './lib/pages/study/KnotsPage.svelte'
  import RulebookPage from './lib/pages/resources/RulebookPage.svelte'
  import WhiteboardPage from './lib/pages/resources/WhiteboardPage.svelte'
  import StarboardShowdownPage from './lib/pages/games/StarboardShowdownPage.svelte'
  import RegattaRunPage from './lib/pages/games/RegattaRunPage.svelte'

  const ROUTES = {
    'home':           HomePage,
    'racing-rules':   RacingRulesPage,
    'tactics':        TacticsPage,
    'boat-knowledge': BoatKnowledgePage,
    'general':        GeneralKnowledgePage,
    'knots':          KnotsPage,
    'rulebook':       RulebookPage,
    'whiteboard':     WhiteboardPage,
    'starboard':      StarboardShowdownPage,
    'regatta-run':    RegattaRunPage,
  }

  let currentPage = $state('home')
  let ActivePage = $derived(ROUTES[currentPage] ?? HomePage)

  function navigate(page) {
    currentPage = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  $effect(() => {
    theme.init()
  })
</script>

<Navbar {currentPage} {navigate} {theme} />

<main>
  {#key currentPage}
    <ActivePage {navigate} />
  {/key}
</main>

<Footer {navigate} />

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
