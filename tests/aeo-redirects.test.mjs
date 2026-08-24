import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const vercelConfig = JSON.parse(
  readFileSync(fileURLToPath(new URL('../vercel.json', import.meta.url)), 'utf8'),
);

test('los redirects de sitemap son 301 y preceden al catch-all de destinos', () => {
  const [destinosSitemap, scubapediaSitemap, destinosCatchAll] = vercelConfig.redirects;

  assert.deepEqual(destinosSitemap, {
    source: '/sitemap.xml',
    has: [{ type: 'host', value: 'destinos.crucerobuceo.com' }],
    destination: 'https://www.scubapedia.org/sitemap-index.xml',
    statusCode: 301,
  });
  assert.deepEqual(scubapediaSitemap, {
    source: '/sitemap.xml',
    destination: '/sitemap-index.xml',
    statusCode: 301,
  });
  assert.deepEqual(destinosCatchAll, {
    source: '/:path*',
    has: [{ type: 'host', value: 'destinos.crucerobuceo.com' }],
    destination: 'https://scubapedia.org/:path*',
    permanent: true,
  });
});
