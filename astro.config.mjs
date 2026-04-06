// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { remarkWikilinks } from './src/plugins/remark-wikilinks.mjs';

export default defineConfig({
  site: 'https://crucerobuceo.com',
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    remarkPlugins: [remarkWikilinks],
  },
});
