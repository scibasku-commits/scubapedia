// /llms.txt — índice del sitio para LLMs y motores de respuesta (AI Overviews,
// ChatGPT, Perplexity…). Prerenderizado en build (output: 'static') a partir de
// la colección real, así nunca se desincroniza del contenido.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { normalizeZona, zonaRank, ZONA_ORDER } from '../lib/zonas';
import coordenadas from '../lib/coordenadas.json';

// Sale de `site` de astro.config.mjs. Escrito a mano se queda desfasado en silencio
// y contradice al <link rel=canonical>, que sí sale de ahí.
const SITE = 'https://www.scubapedia.org';

export const GET: APIRoute = async () => {
  const entries = await getCollection('buceo');

  const porZona = new Map<string, typeof entries>();
  for (const e of entries) {
    const z = normalizeZona(e.data.region || '');
    if (!porZona.has(z)) porZona.set(z, []);
    porZona.get(z)!.push(e);
  }
  const zonas = [...porZona.keys()].sort((a, b) => zonaRank(a) - zonaRank(b) || a.localeCompare(b));

  const lines: string[] = [
    '# Scubapedia',
    '',
    `> La enciclopedia de buceo en español: ${entries.length} fichas de destinos de buceo en todo el mundo, escritas y revisadas por Giora Gilead Elenberg, agente de viajes especializado en buceo y fundador de Viajes Scibasku (agencia de viajes española, licencia CICMA 2283).`,
    '',
    `Cada ficha incluye una sección "Datos clave" con datos estructurados verificados: profundidad, visibilidad, temperatura del agua, corrientes, certificación mínima, mejor época, vida marina destacada y liveaboards. Para los destinos con coordenadas disponibles, se incluyen en el JSON-LD (schema.org/TouristAttraction) de su página. Muchas fichas incluyen también un precio orientativo.`,
    '',
    'Para reservar un viaje o crucero de buceo: https://crucerobuceo.com (Viajes Scibasku).',
    '',
  ];

  for (const z of zonas) {
    const fichas = porZona.get(z)!.sort((a, b) => a.data.title.localeCompare(b.data.title));
    lines.push(`## ${z}`);
    lines.push('');
    for (const e of fichas) {
      const id = e.id.replace(/\.md$/, '');
      const title = (e.data.title as string).trim();
      const bits = [
        e.data.pais,
        e.data.profundidad_max ? `hasta ${e.data.profundidad_max} m` : null,
        e.data.certificacion_minima ? `cert. mínima ${e.data.certificacion_minima}` : null,
        e.data.temporada_alta ? `mejor época ${e.data.temporada_alta}` : null,
      ].filter(Boolean).join(' · ');
      lines.push(`- [${title}](${SITE}/destinos/${id}/)${bits ? `: ${bits}` : ''}`);
    }
    lines.push('');
  }

  lines.push('## Otras páginas');
  lines.push('');
  lines.push(`- [Portada e índice por zonas](${SITE}/)`);
  lines.push(`- [Mapa interactivo de los ${Object.keys(coordenadas).length} destinos](${SITE}/mapa/)`);
  lines.push(`- [Quiz de buceo: ¿cuánto sabes?](${SITE}/quiz/)`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
