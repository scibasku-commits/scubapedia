// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { remarkWikilinks } from './src/plugins/remark-wikilinks.mjs';
import { remarkDowngradeH1 } from './src/plugins/remark-downgrade-h1.mjs';

export default defineConfig({
  site: 'https://www.scubapedia.org',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => {
        // Excluye la página raíz de destinos (noindex con meta-refresh)
        // pero INCLUYE las fichas individuales /destinos/<slug>/
        if (page === 'https://www.scubapedia.org/destinos/') return false;
        return true;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    remarkPlugins: [remarkWikilinks, remarkDowngradeH1],
  },
});
