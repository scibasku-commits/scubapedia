// Guardia del bug cabecera-vs-tabla (Silfra, 2026-07): la barra de datos rápidos
// mostraba un valor REINTERPRETADO del frontmatter y contradecía a "Datos clave",
// que imprime el campo tal cual. Invariante que se comprueba aquí:
//
//   el valor del chip es siempre un PREFIJO LITERAL del campo de la ficha.
//
// Ejecutar:  node --experimental-strip-types scripts/check-etiqueta-corta.ts
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { etiquetaCorta } from '../src/lib/ficha-datos.ts';

// Regresiones documentadas (los 3 casos que se detectaron en producción)
assert.equal(etiquetaCorta('Drysuit (snorkel sin cert; buceo requiere cert drysuit)'), 'Drysuit…');
assert.equal(etiquetaCorta('OW (AOWD para canales)'), 'OW…');
assert.equal(
  etiquetaCorta('corriente constante de norte a sur a lo largo de la isla; el 90% del buceo es en deriva; raramente fuerte'),
  'corriente constante de norte a sur a lo largo de la isla…',
);
assert.equal(etiquetaCorta('AOWD'), 'AOWD');
assert.equal(etiquetaCorta(''), null);
assert.equal(etiquetaCorta(undefined), null);

// Las 122 fichas: chip ⊂ campo completo, para los tres campos de texto de la barra.
const DIR = new URL('../src/content/buceo/', import.meta.url);
const CAMPOS = ['certificacion_minima', 'corrientes', 'visibilidad_media'];
let comprobados = 0;

for (const f of readdirSync(DIR).filter((n) => n.endsWith('.md'))) {
  const md = readFileSync(new URL(f, DIR), 'utf8');
  for (const campo of CAMPOS) {
    const m = md.match(new RegExp(`^${campo}:\\s*"([^"]*)"`, 'm'));
    if (!m) continue;
    const completo = m[1];
    const chip = etiquetaCorta(completo);
    if (!chip) continue;
    const prefijo = chip.replace(/…$/, '');
    assert.ok(
      completo.trim().startsWith(prefijo),
      `${f} · ${campo}: el chip "${chip}" no es prefijo de "${completo}"`,
    );
    comprobados++;
  }
}

console.log(`OK · ${comprobados} valores de cabecera son prefijo literal de su ficha`);
