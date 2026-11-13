#!/usr/bin/env node
/**
 * qa-390.mjs — QA de maqueta de scubapedia.org (DECISION.md §4 B1, criterios 5.3, 5.4, 5.6, 5.7, 5.10, 5.14).
 *
 * Para cada ruta y cada ancho mide:
 *   - desbordamiento horizontal (scrollWidth > clientWidth)
 *   - console.error y pageerror
 *   - script de Umami presente en el HTML
 *   - fotos de res.cloudinary.com frente al manifiesto de fotos (si existe)
 *   - contraste de 6 pares de la carta (fórmula WCAG)
 *   - a 390 px: el menú móvil se abre con Enter y se cierra con Esc
 * y saca una captura por ruta y ancho. Sale con código 1 si algo falla.
 *
 * Uso (tras `npm run build`):
 *   node scripts/qa/qa-390.mjs
 *   node scripts/qa/qa-390.mjs --routes / /mapa/ --widths 390 1440
 *   node scripts/qa/qa-390.mjs --base https://preview.example.com     (en vez de servir dist/client)
 * Playwright: se busca en node_modules del repo; si no, en PLAYWRIGHT_DIR o en la skill playwright-cli.
 * No usa `timeout` (no existe en macOS).
 */
import http from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync, readdirSync } from 'node:fs';
import { resolve, join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import os from 'node:os';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
function opcion(nombre, porDefecto) {
  const i = argv.indexOf(nombre);
  if (i < 0) return porDefecto;
  const vals = [];
  for (let j = i + 1; j < argv.length && !argv[j].startsWith('--'); j++) vals.push(argv[j]);
  return vals.length ? vals : porDefecto;
}
const RUTAS = opcion('--routes', ['/', '/destinos/brother-islands/', '/destinos/cenotes-yucatan/', '/destinos/maldivas-south-ari/', '/mapa/', '/quiz/', '/404', '/aviso-legal']);
const ANCHOS = opcion('--widths', ['390', '760', '1280', '1440']).map(Number);
const BASE_EXT = opcion('--base', [null])[0];
const DIST = resolve(RAIZ, opcion('--dist', ['dist/client'])[0]);
const OUT = resolve(opcion('--out', [join(os.homedir(), 'Desktop/SCIBASKU-WORKSPACE/diseño/2026-11-13_scubapedia-decision-fable/evidencia-B')])[0]);
const MANIFIESTO = resolve(RAIZ, 'tests/fixtures/fotos-baseline.json');

function cargarPlaywright() {
  const candidatos = [RAIZ, process.env.PLAYWRIGHT_DIR, join(os.homedir(), '.claude/skills/playwright-cli'), join(os.homedir(), 'projects/scubapedia')].filter(Boolean);
  for (const base of candidatos) {
    try { return createRequire(join(base, 'package.json'))('playwright'); } catch { /* siguiente */ }
  }
  throw new Error('No encuentro Playwright. Define PLAYWRIGHT_DIR con la carpeta que tenga node_modules/playwright.');
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml', '.woff2': 'font/woff2' };
function servirDist() {
  const srv = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const cands = [join(DIST, url), join(DIST, url, 'index.html'), join(DIST, url + '.html')];
    const f = cands.find((c) => c.startsWith(DIST) && existsSync(c) && statSync(c).isFile());
    if (f) { res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f)); return; }
    const p404 = join(DIST, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(existsSync(p404) ? readFileSync(p404) : 'no encontrado');
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

const luminancia = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const hex = (h) => { h = h.trim().replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const ratio = (a, b) => { const [x, y] = [luminancia(hex(a)), luminancia(hex(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const fallos = [];
const informe = [];
function anota(ruta, ancho, ok, texto) {
  informe.push({ ruta, ancho, ok, texto });
  if (!ok) fallos.push(`${ruta} @${ancho}: ${texto}`);
}

const pw = cargarPlaywright();
mkdirSync(OUT, { recursive: true });
const servidor = BASE_EXT ? null : await servirDist();
const BASE = BASE_EXT || `http://127.0.0.1:${servidor.address().port}`;
const manifiesto = existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, 'utf8')) : null;
if (!manifiesto) console.log('AVISO: no hay tests/fixtures/fotos-baseline.json (lo crea el Lote A); se omite la comparación de fotos.');

// Si la versión de Playwright no coincide con el navegador descargado, se usa el más nuevo de la caché.
async function lanzar() {
  try { return await pw.chromium.launch({ headless: true }); } catch (e) {
    const cache = join(os.homedir(), 'Library/Caches/ms-playwright');
    const dirs = existsSync(cache) ? readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort().reverse() : [];
    for (const d of dirs) {
      const exe = join(cache, d, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
      if (existsSync(exe)) return pw.chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || exe });
    }
    throw e;
  }
}
const browser = await lanzar();
try {
  for (const ruta of RUTAS) {
    for (const ancho of ANCHOS) {
      const ctx = await browser.newContext({ viewport: { width: ancho, height: ancho < 700 ? 844 : 900 }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const errores = [];
      page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
      page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
      const resp = await page.goto(BASE + ruta, { waitUntil: 'load', timeout: 45000 }).catch((e) => { errores.push(`goto: ${e.message}`); return null; });
      await page.waitForTimeout(700);
      const status = resp ? resp.status() : 0;
      const esperado = ruta === '/404' ? 404 : 200;
      anota(ruta, ancho, status === esperado, `HTTP ${status} (esperado ${esperado})`);

      const m = await page.evaluate(() => {
        const de = document.documentElement;
        const cl = [...document.querySelectorAll('img')].filter((i) => /res\.cloudinary\.com/.test(i.currentSrc || i.src));
        const css = getComputedStyle(de);
        return {
          sw: de.scrollWidth, cw: de.clientWidth,
          umami: !!document.querySelector('script[src*="umami-scibasku"]'),
          cloud: cl.map((i) => i.getAttribute('src')),
          vars: ['--paper', '--ink', '--ink-2', '--ink-3', '--mag-ink', '--water-3'].map((v) => css.getPropertyValue(v).trim()),
        };
      });
      anota(ruta, ancho, m.sw <= m.cw, `scrollWidth ${m.sw} vs clientWidth ${m.cw}`);
      anota(ruta, ancho, errores.length === 0, errores.length ? errores.join(' | ') : '0 errores de consola');
      anota(ruta, ancho, m.umami, 'script de Umami en el HTML');
      if (manifiesto) {
        const esperadas = manifiesto[ruta] || manifiesto[ruta.endsWith('/') ? ruta.slice(0, -1) : ruta + '/'];
        if (esperadas) {
          const faltan = esperadas.filter((u) => !m.cloud.includes(u));
          anota(ruta, ancho, faltan.length === 0, faltan.length ? `faltan ${faltan.length} fotos del manifiesto: ${faltan[0]}` : `${esperadas.length} fotos del manifiesto presentes`);
        }
      }
      if (ancho === ANCHOS[0] || ancho === 1440) {
        const [paper, ink, ink2, ink3, magInk, water3] = m.vars;
        if (paper) {
          const pares = [['ink/paper', ink, paper], ['ink-2/paper', ink2, paper], ['ink-2/water-3', ink2, water3], ['mag-ink/paper', magInk, paper], ['paper/ink', paper, ink], ['ink-3/paper', ink3, paper]];
          for (const [n, a, b] of pares) {
            const r = ratio(a, b);
            anota(ruta, ancho, r >= 4.5, `contraste ${n} = ${r.toFixed(2)} (mín 4,5)`);
          }
        }
      }
      // teclado: menú móvil (solo si la página lleva la cabecera común)
      if (ancho <= 420 && (await page.locator('#cab-menu').count())) {
        await page.locator('#cab-menu').focus();
        await page.keyboard.press('Enter');
        const abierto = await page.locator('#cab-panel').isVisible();
        await page.keyboard.press('Escape');
        const cerrado = !(await page.locator('#cab-panel').isVisible());
        anota(ruta, ancho, abierto && cerrado, `menú móvil abre con Enter (${abierto}) y cierra con Esc (${cerrado})`);
      }
      const nombre = `${ruta === '/' ? 'portada' : ruta.replace(/^\/|\/$/g, '').replace(/\//g, '_')}-${ancho}.png`;
      await page.screenshot({ path: join(OUT, nombre), fullPage: ancho === 390 || argv.includes('--full') });
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  if (servidor) servidor.close();
}

const ok = informe.filter((i) => i.ok).length;
console.log(`\nqa-390: ${ok}/${informe.length} comprobaciones en verde · capturas en ${OUT}`);
for (const f of fallos) console.log('FALLO  ' + f);
process.exit(fallos.length ? 1 : 0);
