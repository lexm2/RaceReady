import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter(),
    paths: {
      base: process.env.GITHUB_ACTIONS ? '/RaceReady' : '',
    },
    prerender: {
      handleHttpError: ({ path, message }) => {
        // Static assets (favicon, icons) are not served during prerendering
        if (path.endsWith('.svg') || path.endsWith('.ico') || path.endsWith('.png')) {
          return;
        }
        throw new Error(message);
      }
    }
  }
};
