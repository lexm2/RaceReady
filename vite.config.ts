import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: ['rules']
    }
  },
  preview: {
    allowedHosts: ['anti-workforce-productive-firm.trycloudflare.com']
  }
});
