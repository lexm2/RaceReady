<script lang="ts">
  import '$lib/themes/themes.css';
  import '../app.css';
  import { theme } from '$lib/themes/theme.svelte.ts';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children } = $props();

  $effect(() => {
    theme.init();
  });
</script>

<Navbar {theme} />

<main>
  {@render children()}
</main>

<Footer />

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
