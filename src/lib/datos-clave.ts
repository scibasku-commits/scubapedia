// Sección "Datos clave" citable por LLM: pares clave/valor completos desde el
// frontmatter (sin truncar, a diferencia de railRows que recorta para la UI).
// Solo emite lo que existe — cero relleno, cero datos inventados.

import { profundidad, temperatura } from './ficha-datos';

export interface DatoClave { k: string; v: string }

function joinArr(v: unknown): string | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const items = v.map((s) => String(s).trim()).filter(Boolean);
  return items.length ? items.join('; ') : null;
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export function datosClave(
  d: Record<string, any>,
  zona: string,
  coords: { lat: number; lng: number } | null,
): DatoClave[] {
  const out: DatoClave[] = [];
  const push = (k: string, v: string | null) => { if (v) out.push({ k, v }); };

  push('País', str(d.pais));
  push('Zona', zona !== 'Otros' ? zona : str(d.region));
  push('Profundidad', profundidad(d));
  push('Visibilidad media', str(d.visibilidad_media));
  push('Temperatura del agua', temperatura(d));
  push('Corrientes', str(d.corrientes));
  push('Certificación mínima', str(d.certificacion_minima));
  push('Mejor época', str(d.temporada_alta));
  push('Temporada baja', str(d.temporada_baja));
  push('Vida marina destacada', joinArr(d.vida_marina_destacada));
  push('Puntos de inmersión principales', joinArr(d.puntos_inmersion_principales));
  push('Liveaboards', joinArr(d.liveaboards_disponibles));
  push('Centros de buceo', joinArr(d.centros_buceo_recomendados));
  push('Precio orientativo', str(d.precio_semana_aprox) ?? str(d.precio_inmersion_aprox));
  if (coords) push('Coordenadas', `${coords.lat}, ${coords.lng}`);
  return out;
}

// FAQ del cuerpo markdown → pares pregunta/respuesta para FAQPage schema.
// Busca "## Preguntas frecuentes" (o "## FAQ") con "### pregunta" + respuesta.
// Si la ficha no tiene FAQ, devuelve [] y el layout no emite FAQPage.
export function parseFaq(body: string | undefined): Array<{ q: string; a: string }> {
  if (!body) return [];
  const section = body.match(/^##\s+(?:Preguntas frecuentes|FAQ)[^\n]*\n([\s\S]*?)(?=\n##\s|(?![\s\S]))/im);
  if (!section) return [];
  const out: Array<{ q: string; a: string }> = [];
  const re = /^###\s+(.+?)\s*\n([\s\S]*?)(?=\n###\s|(?![\s\S]))/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(section[1]))) {
    const q = m[1].replace(/[*_`]/g, '').trim();
    const a = m[2]
      .replace(/\[\[([a-z0-9-]+)\]\]/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_`>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (q && a) out.push({ q, a });
  }
  return out;
}
