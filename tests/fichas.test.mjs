/**
 * Fichas de destino — sobre el HTML ya construido (`npm run build` antes).
 * DECISION.md §4 B3. Si dist/client/destinos no existe se salta (no hay nada que medir).
 *
 *   node --test tests/fichas.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINOS = join(RAIZ, 'dist/client/destinos');
const hayBuild = existsSync(DESTINOS);
const opts = { skip: hayBuild ? false : 'sin build: ejecuta `npm run build` antes' };

const slugs = readdirSync(join(RAIZ, 'src/content/buceo')).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
const manifiestoPath = join(RAIZ, 'tests/fixtures/fotos-baseline.json');
const manifiesto = existsSync(manifiestoPath) ? JSON.parse(readFileSync(manifiestoPath, 'utf8')) : null;
const html = (slug) => readFileSync(join(DESTINOS, slug, 'index.html'), 'utf8');

test('hay una ficha construida por cada .md (122 hoy)', opts, () => {
  assert.ok(slugs.length >= 100, `esperaba más de 100 fichas, hay ${slugs.length}`);
  const faltan = slugs.filter((s) => !existsSync(join(DESTINOS, s, 'index.html')));
  assert.deepEqual(faltan, [], `fichas sin construir: ${faltan.join(', ')}`);
});

test('cada ficha lleva JSON-LD con TouristAttraction', opts, () => {
  const mal = slugs.filter((s) => {
    const bloques = [...html(s).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    return !bloques.some((b) => b.includes('TouristAttraction') && (() => { try { JSON.parse(b); return true; } catch { return false; } })());
  });
  assert.deepEqual(mal, []);
});

test('cada ficha lleva el contador Umami', opts, () => {
  const mal = slugs.filter((s) => !/umami-scibasku\.vercel\.app\/script\.js" data-website-id="49faed99-e484-4618-8f78-e095cf9f421e"/.test(html(s)));
  assert.deepEqual(mal, []);
});

test('cada ficha tiene el formulario (#pedir-presupuesto) y el botón que lleva a él, arriba y abajo', opts, () => {
  const mal = slugs.filter((s) => {
    const h = html(s);
    return !/id="pedir-presupuesto"/.test(h) || (h.match(/href="#pedir-presupuesto"/g) || []).length < 2;
  });
  assert.deepEqual(mal, []);
});

test('cada ficha usa la cabecera y el pie comunes de la carta', opts, () => {
  const mal = slugs.filter((s) => { const h = html(s); return !/id="cabecera"/.test(h) || !/class="pie/.test(h); });
  assert.deepEqual(mal, []);
});

test('estilo de la casa: sin Fraunces, DM Sans, píldoras, eyebrows ni crema', opts, () => {
  const prohibidos = [/Fraunces/, /DM Sans/, /border-radius:\s*999px/, /class="(?:eyebrow|kicker)"/, /#fbf8f3/i, /#f1ebdd/i];
  const mal = [];
  for (const s of slugs) {
    const h = html(s);
    for (const re of prohibidos) if (re.test(h)) mal.push(`${s}: ${re}`);
  }
  assert.deepEqual(mal, []);
});

test('cada ficha tiene una sola foto hero o la viñeta de carta, nunca las dos', opts, () => {
  const mal = slugs.filter((s) => {
    const h = html(s);
    const foto = /<div class="marco[^"]*"[^>]*>\s*<img [^>]*src="https:\/\/res\.cloudinary\.com/.test(h);
    const vinyeta = /<svg class="water"/.test(h);
    return foto === vinyeta;
  });
  assert.deepEqual(mal, []);
});

test('las fotos de la línea base siguen en su ficha', { skip: !hayBuild ? opts.skip : manifiesto ? false : 'falta tests/fixtures/fotos-baseline.json (lo crea el Lote A)' }, () => {
  const mal = [];
  for (const s of slugs) {
    const esperadas = manifiesto[`/destinos/${s}/`] || manifiesto[`/destinos/${s}`] || [];
    const h = html(s).replace(/&amp;/g, '&');
    for (const u of esperadas) if (!h.includes(u)) mal.push(`${s}: ${u}`);
  }
  assert.deepEqual(mal, []);
});

test('la ficha de referencia sin foto usa la viñeta y la de foto propia conserva su URL', opts, () => {
  assert.match(html('cenotes-yucatan'), /<svg class="water"/);
  assert.match(html('brother-islands'), /res\.cloudinary\.com\/drqgkirpy\/image\/upload\/[^"]*\/destinos\/_estrella\/brother-islands-hero\.jpg/);
});

test('maldivas-south-ari publica el nombre completo (el corto chocaría con otras ocho fichas)', opts, () => {
  assert.match(html('maldivas-south-ari'), /<h1[^>]*>[^<]*South Ari[^<]*<\/h1>/);
});
