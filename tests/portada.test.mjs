/**
 * Portada «Carta náutica» (DECISION.md 13-nov-2026, tareas A2 y A7).
 *
 * Dos bloques:
 *  1. La lógica de la carta (src/lib/carta.mjs) con las 122 fichas reales: una sonda por
 *     ficha, separadas, dentro de su caja, con la profundidad de su .md y sin cajas solapadas.
 *  2. El HTML servido (dist/client/index.html): 122 fichas enlazadas sin JS, Umami, fotos
 *     de la línea base, estilo de la casa. Necesita `npm run build` antes.
 *
 * npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeZona } from '../src/lib/zonas.mjs';
import {
  sondas, ZONA_BOX, PIEZAS, DIST_MIN, SEP_X, SEP_Y, solapan, textoSonda, numeroEnLetras, fraseTesis,
  reservaToponimo, validarCajas,
} from '../src/lib/carta.mjs';
import { assetId } from '../scripts/qa/fotos-manifiesto.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = resolve(RAIZ, 'src/content/buceo');

// Lectura mínima del frontmatter: solo claves escalares de una línea.
function fichas() {
  return readdirSync(DIR).filter((f) => f.endsWith('.md')).sort().map((f) => {
    const t = readFileSync(resolve(DIR, f), 'utf8');
    const y = (t.match(/^---\n([\s\S]*?)\n---/) || [, ''])[1];
    const g = (k) => {
      const m = y.match(new RegExp(`^${k}:[ \\t]*(.*)$`, 'm'));
      return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
    };
    return { slug: f.replace(/\.md$/, ''), title: g('title'), zona: normalizeZona(g('region')), prof: Number(g('profundidad_max')) || 0 };
  });
}

const FICHAS = fichas();
const SONDAS = sondas(FICHAS);

// ---------------------------------------------------------------- 1 · lógica
test('hay 122 fichas y cada una recibe exactamente una sonda', () => {
  assert.equal(FICHAS.length, 122);
  assert.equal(SONDAS.length, FICHAS.length);
  assert.deepEqual(SONDAS.map((s) => s.slug).sort(), FICHAS.map((f) => f.slug).sort());
});

test('ninguna pareja de sondas a menos de 3,5 % ni dentro de la rejilla 4,7 × 5,2', () => {
  for (let i = 0; i < SONDAS.length; i++) {
    for (let j = i + 1; j < SONDAS.length; j++) {
      const a = SONDAS[i], b = SONDAS[j];
      assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= DIST_MIN, `${a.slug} y ${b.slug} demasiado cerca`);
      assert.ok(Math.abs(a.x - b.x) >= SEP_X || Math.abs(a.y - b.y) >= SEP_Y, `${a.slug} y ${b.slug} en la misma celda`);
    }
  }
});

test('cada sonda cae dentro de la caja de su zona y fuera de recuadros, rosa y topónimos', () => {
  const cuantas = {};
  for (const f of FICHAS) cuantas[f.zona] = (cuantas[f.zona] || 0) + 1;
  const evitar = [...Object.values(PIEZAS), ...Object.keys(cuantas).map((z) => reservaToponimo(z, cuantas[z]))];
  for (const s of SONDAS) {
    const b = ZONA_BOX[s.zona];
    assert.ok(s.x >= b.x && s.x <= b.x + b.w && s.y >= b.y && s.y <= b.y + b.h, `${s.slug} fuera de «${s.zona}»`);
    for (const r of evitar) {
      assert.ok(!(s.x >= r.x && s.x <= r.x + r.w && s.y >= r.y && s.y <= r.y + r.h), `${s.slug} pisa una pieza o un topónimo`);
    }
  }
});

test('las 13 cajas de zona están dentro de 0-100 y no se solapan', () => {
  assert.doesNotThrow(validarCajas);
  const cajas = Object.entries(ZONA_BOX);
  assert.equal(cajas.length, 13);
  for (const [z, b] of cajas) assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= 100 && b.y + b.h <= 100, z);
  for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) {
    assert.ok(!solapan(cajas[i][1], cajas[j][1]), `${cajas[i][0]} / ${cajas[j][0]}`);
  }
});

test('el número de cada sonda es la profundidad_max de su ficha, y nunca una cifra inventada', () => {
  const porSlug = new Map(FICHAS.map((f) => [f.slug, f]));
  for (const s of SONDAS) assert.equal(textoSonda(s.prof), String(porSlug.get(s.slug).prof));
  assert.equal(textoSonda(0), '·');
  assert.equal(textoSonda(undefined), '·');
});

test('la posición es determinista (mismo resultado en dos llamadas)', () => {
  assert.deepEqual(sondas(FICHAS), SONDAS);
});

test('la compuerta para el build si una zona no tiene caja', () => {
  assert.throws(() => sondas([...FICHAS, { slug: 'x', title: 'X', zona: 'Otros', prof: 10 }]), /no tiene caja/);
});

test('número en letras para la frase-tesis (100-130) y cifras fuera de ese tramo', () => {
  assert.equal(numeroEnLetras(100), 'cien');
  assert.equal(numeroEnLetras(101), 'ciento un');
  assert.equal(numeroEnLetras(116), 'ciento dieciséis');
  assert.equal(numeroEnLetras(121), 'ciento veintiún');
  assert.equal(numeroEnLetras(122), 'ciento veintidós');
  assert.equal(numeroEnLetras(130), 'ciento treinta');
  assert.equal(numeroEnLetras(131), '131');
  assert.equal(fraseTesis(122), 'Ciento veintidós destinos levantados uno a uno, con la sonda y no con el folleto.');
});

// ---------------------------------------------------------------- 2 · HTML servido
const HTML_PATH = resolve(RAIZ, 'dist/client/index.html');
const html = () => {
  assert.ok(existsSync(HTML_PATH), 'Falta dist/client/index.html: ejecuta `npm run build` antes de `npm test`.');
  return readFileSync(HTML_PATH, 'utf8');
};

test('la portada enlaza las 122 fichas sin JS (href únicos en el HTML)', () => {
  const hrefs = new Set([...html().matchAll(/href="\/destinos\/([^"#/?]+)\/?"/g)].map((m) => m[1]));
  assert.ok(hrefs.size >= 122, `solo ${hrefs.size} fichas enlazadas`);
  for (const f of FICHAS) assert.ok(hrefs.has(f.slug), `falta enlace a ${f.slug}`);
});

test('122 sondas enlazadas y 122 filas en la tabla de sondas', () => {
  const h = html();
  assert.equal((h.match(/class="sonda[ "]/g) || []).length, 122);
  const tbody = h.slice(h.indexOf('id="tabla-sondas"'));
  assert.equal((tbody.match(/<tr data-zona=/g) || []).length, 122);
});

test('contador de visitas (Umami) y GA4 en la portada', () => {
  const h = html();
  assert.match(h, /<script defer src="https:\/\/umami-scibasku\.vercel\.app\/script\.js" data-website-id="49faed99-e484-4618-8f78-e095cf9f421e"><\/script>/);
  assert.match(h, /G-LHZYGMPX6K/);
});

test('fotos conservadas: cada foto de la línea base de "/" sigue en la portada', () => {
  const base = JSON.parse(readFileSync(resolve(RAIZ, 'tests/fixtures/fotos-baseline.json'), 'utf8'))['/'];
  assert.equal(base.length, 7);
  const h = html();
  const ahora = new Set([...h.matchAll(/<img\b[^>]*?\ssrc="([^"]+)"/g)].map((m) => assetId(m[1].replace(/&amp;/g, '&'))));
  for (const url of base) assert.ok(ahora.has(assetId(url)), `se perdió la foto ${assetId(url)}`);
});

const PROHIBIDOS = [/Fraunces/i, /DM Sans/i, /DM\+Sans/i, /border-radius:\s*999px/i, /class="eyebrow"/, /class="kicker"/, /#fbf8f3/i, /#f1ebdd/i, /\b0\d \/ 0\d\b/];
// El <style> en línea de la portada es el de CaptacionForm.astro, que es del Lote B (B6).
const sinCaptacion = (h) => h.replace(/<style>[\s\S]*?<\/style>/g, '');
const cssPortada = (h) => [...h.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)].map((m) => readFileSync(resolve(RAIZ, 'dist/client' + m[1]), 'utf8'));

test('estilo de la casa en la portada: sin Fraunces, DM Sans, píldoras, eyebrows, «01 /» ni crema', () => {
  const h = html();
  const todo = [sinCaptacion(h), ...cssPortada(h)].join('\n');
  for (const p of PROHIBIDOS) assert.ok(!p.test(todo), `aparece ${p}`);
});

test('estilo de la casa también en el formulario de captación incrustado', () => {
  const h = html();
  for (const p of PROHIBIDOS) assert.ok(!p.test(h), `aparece ${p}`);
});

test('sin «Reservar» en la cabecera ni portales de reservas', () => {
  const h = html();
  assert.ok(!/>Reservar</.test(h));
  assert.ok(!/liveaboard\.com|booking\.com/i.test(h));
});
