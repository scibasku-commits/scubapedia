/**
 * Pruebas de normalización de zonas de buceo.
 * Verifica que las 122 fichas reales se distribuyen en exactamente 13 zonas
 * según el mapa editorial y que ninguna región queda huérfana.
 *
 * npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeZona, ZONA_ORDER } from '../src/lib/zonas.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lee = (p) => readFileSync(resolve(RAIZ, p), 'utf8');

/**
 * Extrae el campo YAML de una ficha de buceo (líneas entre los --- de cabecera).
 * Retorna un objeto con los pares key: value.
 */
function extraerFrontmatter(contenido) {
  const lineas = contenido.split('\n');
  if (lineas[0] !== '---') return {};

  const resultado = {};
  let i = 1;
  while (i < lineas.length && lineas[i] !== '---') {
    const linea = lineas[i];
    // Patrón simple: key: "value" o key: value (sin comillas)
    const match = linea.match(/^(\w+):\s*"?([^"]+)"?/);
    if (match) {
      resultado[match[1]] = match[2];
    }
    i++;
  }
  return resultado;
}

/**
 * Lee todas las fichas de buceo y retorna array de {slug, region}.
 */
function leerFichas() {
  const carpeta = resolve(RAIZ, 'src/content/buceo');
  const archivos = readdirSync(carpeta).filter((f) => f.endsWith('.md'));

  return archivos.map((archivo) => {
    const contenido = lee(`src/content/buceo/${archivo}`);
    const fm = extraerFrontmatter(contenido);
    const slug = archivo.replace(/\.md$/, '');
    return {
      slug,
      region: fm.region || '[SIN REGIÓN]',
    };
  });
}

/**
 * Calcula el reparto de fichas por zona.
 */
function calcularReparto(fichas) {
  const reparto = {};
  ZONA_ORDER.forEach((zona) => {
    reparto[zona] = 0;
  });

  fichas.forEach(({ slug, region }) => {
    const zona = normalizeZona(region);
    if (!reparto.hasOwnProperty(zona)) {
      reparto[zona] = 0;
    }
    reparto[zona]++;
  });

  return reparto;
}

// --- PRUEBAS ---------------------------------------------------------------

test('existen 122 fichas de buceo', () => {
  const fichas = leerFichas();
  assert.equal(fichas.length, 122, `se esperaban 122 fichas, hay ${fichas.length}`);
});

test('todas las fichas tienen un campo region', () => {
  const fichas = leerFichas();
  const sinRegion = fichas.filter((f) => f.region === '[SIN REGIÓN]');
  assert.equal(sinRegion.length, 0, `${sinRegion.length} fichas sin región: ${sinRegion.map((f) => f.slug).join(', ')}`);
});

test('todas las regiones se normalizan a zonas conocidas (en ZONA_ORDER)', () => {
  const fichas = leerFichas();
  const zonasDesconocidas = new Set();

  fichas.forEach(({ slug, region }) => {
    const zona = normalizeZona(region);
    if (!ZONA_ORDER.includes(zona)) {
      zonasDesconocidas.add(`${slug}: ${region} → ${zona}`);
    }
  });

  assert.equal(zonasDesconocidas.size, 0,
    `hay zonas fuera de ZONA_ORDER:\n${Array.from(zonasDesconocidas).join('\n')}`);
});

test('el reparto de fichas por zona es exactamente el esperado', () => {
  const fichas = leerFichas();
  const reparto = calcularReparto(fichas);

  const esperado = {
    'Sudeste Asiático': 24,
    'Mar Rojo': 19,
    'Caribe': 14,
    'Maldivas': 9,
    'Pacífico Sur': 9,
    'Atlántico': 9,
    'Océano Índico': 9,
    'Mediterráneo': 7,
    'Australia': 6,
    'Pacífico Este': 6,
    'Pacífico Central': 5,
    'Sudáfrica': 3,
    'Aguas polares': 2,
    'Otros': 0,
  };

  ZONA_ORDER.forEach((zona) => {
    assert.equal(reparto[zona], esperado[zona],
      `zona ${zona}: esperadas ${esperado[zona]}, hay ${reparto[zona]}`);
  });
});

test('casos específicos de prueba: raja-ampat → Sudeste Asiático', () => {
  const fichas = leerFichas();
  const raja = fichas.find((f) => f.slug === 'raja-ampat');
  assert.ok(raja, 'no existe raj ampat');
  const zona = normalizeZona(raja.region);
  assert.equal(zona, 'Sudeste Asiático', `raja-ampat: ${raja.region} → ${zona}`);
});

test('casos específicos: komodo → Sudeste Asiático', () => {
  const fichas = leerFichas();
  const komodo = fichas.find((f) => f.slug === 'komodo');
  assert.ok(komodo, 'no existe komodo');
  const zona = normalizeZona(komodo.region);
  assert.equal(zona, 'Sudeste Asiático', `komodo: ${komodo.region} → ${zona}`);
});

test('casos específicos: galapagos → Pacífico Este', () => {
  const fichas = leerFichas();
  const galapagos = fichas.find((f) => f.slug === 'galapagos');
  assert.ok(galapagos, 'no existe galapagos');
  const zona = normalizeZona(galapagos.region);
  assert.equal(zona, 'Pacífico Este', `galapagos: ${galapagos.region} → ${zona}`);
});

test('casos específicos: cozumel → Caribe', () => {
  const fichas = leerFichas();
  const cozumel = fichas.find((f) => f.slug === 'cozumel');
  assert.ok(cozumel, 'no existe cozumel');
  const zona = normalizeZona(cozumel.region);
  assert.equal(zona, 'Caribe', `cozumel: ${cozumel.region} → ${zona}`);
});

test('casos específicos: palau → Pacífico Central', () => {
  const fichas = leerFichas();
  const palau = fichas.find((f) => f.slug === 'palau');
  assert.ok(palau, 'no existe palau');
  const zona = normalizeZona(palau.region);
  assert.equal(zona, 'Pacífico Central', `palau: ${palau.region} → ${zona}`);
});

test('casos específicos: aliwal-shoal → Sudáfrica', () => {
  const fichas = leerFichas();
  const aliwal = fichas.find((f) => f.slug === 'aliwal-shoal');
  assert.ok(aliwal, 'no existe aliwal-shoal');
  const zona = normalizeZona(aliwal.region);
  assert.equal(zona, 'Sudáfrica', `aliwal-shoal: ${aliwal.region} → ${zona}`);
});

test('casos específicos: coiba-panama → Pacífico Este', () => {
  const fichas = leerFichas();
  const coiba = fichas.find((f) => f.slug === 'coiba-panama');
  assert.ok(coiba, 'no existe coiba-panama');
  const zona = normalizeZona(coiba.region);
  assert.equal(zona, 'Pacífico Este', `coiba-panama: ${coiba.region} → ${zona}`);
});

test('suma total de fichas = 122', () => {
  const fichas = leerFichas();
  const reparto = calcularReparto(fichas);
  const total = Object.values(reparto).reduce((a, b) => a + b, 0);
  assert.equal(total, 122, `suma esperada 122, hay ${total}`);
});

// La red de seguridad. Es EL arreglo de fondo: antes, una región desconocida se
// convertía en una zona nueva y la portada pasó a anunciar 34 zonas sin que saltara nada.
// Ahora cae en 'Otros', que es visible y se puede contar.
test('una región desconocida cae en Otros, no inventa una zona', () => {
  for (const inventada of ['Región Que No Existe', 'Mar de la Tranquilidad', 'Costa Rica del Norte']) {
    assert.equal(
      normalizeZona(inventada), 'Otros',
      `"${inventada}" tendría que caer en Otros y ha devuelto "${normalizeZona(inventada)}"`,
    );
  }
  assert.equal(normalizeZona(''), 'Otros', 'una región vacía tiene que caer en Otros');
});
