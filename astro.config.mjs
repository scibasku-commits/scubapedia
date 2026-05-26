// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { remarkWikilinks } from './src/plugins/remark-wikilinks.mjs';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://destinos.crucerobuceo.com',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    remarkPlugins: [remarkWikilinks],
  },
});
