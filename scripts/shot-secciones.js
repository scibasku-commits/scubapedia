import { chromium } from 'playwright';
const BASE = process.env.URL || 'http://localhost:4321';
const OUT = `${process.env.HOME}/projects/scubapedia/screenshots`;

const targets = [
  { url: '/', sel: '#destacadas', name: 'sec-destacadas' },
  { url: '/', sel: '#giora', name: 'sec-asistente' },
  { url: '/', sel: '#conceptos', name: 'sec-glosario' },
  { url: '/destinos/revillagigedo-socorro', sel: '.body-section', name: 'ficha-cuerpo-rail' },
  { url: '/destinos/revillagigedo-socorro', sel: '.related', name: 'ficha-relacionadas' },
  { url: '/destinos/revillagigedo-socorro', sel: '.closer', name: 'ficha-closer' },
];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const made = [];
  for (const t of targets) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(BASE + t.url, { waitUntil: 'networkidle' });
    const el = page.locator(t.sel).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const file = `${OUT}/${t.name}.png`;
    await el.screenshot({ path: file });
    made.push(file);
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify({ ok: true, screenshots: made }, null, 2));
})();
