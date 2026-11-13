#!/usr/bin/env node
// Manifiesto de fotos de un build de Scubapedia (criterio 5.6 de DECISION.md, 13-nov-2026).
//
// Uso:  node scripts/qa/fotos-manifiesto.mjs [dist/client] [salida.json]
//   Sin salida, escribe el JSON por stdout.
//
// Recorre /, /mapa/, /quiz/, /404 y cada /destinos/<slug>/ del build estático y guarda
// { ruta: [urls de <img src> que apuntan a res.cloudinary.com] }.
// Solo cuenta las FOTOS (Cloudinary): los logotipos PNG de /public no son fotos y el
// rediseño los cambia a propósito (logotipo en una tinta, DECISION.md §3.1).
//
// Para comparar con otro build se usa `assetId(url)`: la ruta del recurso en Cloudinary
// sin la transformación (f_auto,q_auto,w_…). Así una foto que pasa de hero a card sigue
// contando como la misma foto; una foto que desaparece, no.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function imgSrcs(html) {
  const out = [];
  const re = /<img\b[^>]*?\ssrc=(["'])(.*?)\1/gi;
  let m;
  while ((m = re.exec(html))) {
    if (m[2].includes('res.cloudinary.com')) out.push(m[2].replace(/&amp;/g, '&'));
  }
  return [...new Set(out)];
}

// https://res.cloudinary.com/<cloud>/image/upload/<transf>/<ruta>.jpg → <ruta>.jpg
export function assetId(url) {
  const m = url.match(/\/image\/upload\/(?:[^/]*[_,][^/]*\/)*(.+)$/);
  return m ? m[1] : url;
}

export function rutas(dist) {
  const r = [
    ['/', 'index.html'],
    ['/mapa/', 'mapa/index.html'],
    ['/quiz/', 'quiz/index.html'],
    ['/404', '404.html'],
  ];
  const dir = join(dist, 'destinos');
  for (const slug of readdirSync(dir).sort()) {
    const f = join('destinos', slug, 'index.html');
    if (existsSync(join(dist, f))) r.push([`/destinos/${slug}/`, f]);
  }
  return r;
}

export function manifiesto(dist) {
  const out = {};
  for (const [ruta, f] of rutas(dist)) {
    const p = join(dist, f);
    if (!existsSync(p)) throw new Error(`Falta ${p} en el build`);
    out[ruta] = imgSrcs(readFileSync(p, 'utf8'));
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dist = process.argv[2] || 'dist/client';
  const json = JSON.stringify(manifiesto(dist), null, 2) + '\n';
  if (process.argv[3]) writeFileSync(process.argv[3], json);
  else process.stdout.write(json);
}
