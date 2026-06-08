// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { remarkWikilinks } from './src/plugins/remark-wikilinks.mjs';

export default defineConfig({
  site: 'https://scubapedia.vercel.app',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    remarkPlugins: [remarkWikilinks],
  },
});
