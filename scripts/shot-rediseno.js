import { chromium } from 'playwright';

const BASE = process.env.URL || 'http://localhost:4321';
const OUT = `${process.env.HOME}/projects/scubapedia/screenshots`;

const shots = [
  { name: 'home-top',      path: '/',                          full: false },
  { name: 'home-full',     path: '/',                          full: true  },
  { name: 'ficha-top',     path: '/destinos/raja-ampat',       full: false },
  { name: 'ficha-full',    path: '/destinos/revillagigedo-socorro', full: true },
  { name: 'home-mobile',   path: '/',                          full: true, mobile: true },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const made = [];
  for (const s of shots) {
    const ctx = await browser.newContext({
      viewport: s.mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push({ shot: s.name, type: 'pageerror', msg: e.message }));
    page.on('console', m => { if (m.type() === 'error') errors.push({ shot: s.name, type: 'console', msg: m.text() }); });
    await page.goto(BASE + s.path, { waitUntil: 'networkidle' });
    if (s.full) {
      // recorre la página para disparar los IntersectionObserver (.reveal)
      await page.evaluate(async () => {
        await new Promise((res) => {
          let y = 0;
          const step = () => {
            window.scrollTo(0, y);
            y += window.innerHeight * 0.8;
            if (y < document.body.scrollHeight) setTimeout(step, 120);
            else { window.scrollTo(0, 0); setTimeout(res, 300); }
          };
          step();
        });
      });
    }
    await page.waitForTimeout(700); // reveal animations settle
    const file = `${OUT}/${s.name}.png`;
    await page.screenshot({ path: file, fullPage: s.full });
    made.push(file);
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify({ ok: errors.length === 0, errors, screenshots: made }, null, 2));
})();
