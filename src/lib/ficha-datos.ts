// Normaliza los datos de una ficha de buceo a una vista común:
// chips del hero, filas de la ficha técnica, línea del hero (lede), breadcrumb.
// Cada función devuelve solo lo que existe; la UI decide qué pintar.

export type FichaData = Record<string, any>;

export function num(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const n = parseInt(v.replace(/[^\d-]/g, ''), 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// Rango de profundidad → "5–40 m"
export function profundidad(d: FichaData): string | null {
  const a = num(d.profundidad_min), b = num(d.profundidad_max);
  if (a != null && b != null && (a > 0 || b > 0)) return `${a}–${b} m`;
  if (b != null && b > 0) return `${b} m`;
  return null;
}

// Temperatura → "21–30 °C"
export function temperatura(d: FichaData): string | null {
  const a = num(d.temperatura_agua_min), b = num(d.temperatura_agua_max);
  if (a != null && b != null && (a > 0 || b > 0)) return `${a}–${b} °C`;
  if (b != null && b > 0) return `${b} °C`;
  return null;
}

// Etiqueta corta para chips y tarjetas (corriente, certificación mínima).
//
// SEGURIDAD: devuelve siempre un PREFIJO LITERAL del campo del frontmatter, jamás
// una reinterpretación. Las versiones anteriores (corrienteCorta / certCorta)
// buscaban subcadenas sueltas sobre prosa y leían el matiz como titular:
//   "raramente fuerte"            → "Fuerte"      (cozumel)
//   "snorkel sin cert; buceo…"    → "Sin cert."   (islandia-silfra — peligroso)
//   "OW (AOWD para canales)"      → "Advanced"    (yap)
// Eso hacía que la cabecera contradijera a "Datos clave" y a la ficha técnica,
// que imprimen el campo completo. Cortando por el primer separador de matiz
// (";", "(", raya) y marcando con "…" que hay más, la cabecera no puede
// contradecir a la tabla: es literalmente su comienzo.
export function etiquetaCorta(v: unknown): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s) return null;
  const cut = s.search(/[;(—–]|\s-\s/);
  if (cut < 0) return s;
  const head = s.slice(0, cut).trim().replace(/[,.]+$/, '');
  return head ? `${head}…` : s;
}

// Tipo de buceo a partir de los tags (arrecife, pecio, liveaboard, cenote, pelágico…).
const TIPO_TAGS: Array<[string, string]> = [
  ['cenote', 'Cenote'], ['pecio', 'Pecio'], ['wreck', 'Pecio'],
  ['liveaboard', 'Liveaboard'], ['pelagico', 'Pelágico'], ['pelágico', 'Pelágico'],
  ['arrecife', 'Arrecife'], ['reef', 'Arrecife'], ['muck', 'Muck diving'],
  ['cueva', 'Cueva'], ['deriva', 'Deriva'], ['pared', 'Pared'],
];
export function tipoBuceo(d: FichaData): string | null {
  const tags = (Array.isArray(d.tags) ? d.tags : []).map((t: string) => String(t).toLowerCase());
  for (const [needle, label] of TIPO_TAGS) {
    if (tags.some((t: string) => t.includes(needle))) return label;
  }
  return null;
}

export function precio(d: FichaData): string | null {
  const p = d.precio_semana_aprox || d.precio_inmersion_aprox;
  return typeof p === 'string' && p ? p : null;
}

export function temporada(d: FichaData): string | null {
  if (typeof d.temporada_alta === 'string' && d.temporada_alta) return d.temporada_alta;
  return null;
}

// Hasta 6 chips para la barra bajo el hero.
export function chips(d: FichaData): Array<{ num: string; lab: string; flag?: boolean; txt?: boolean }> {
  const out: Array<{ num: string; lab: string; flag?: boolean; txt?: boolean }> = [];
  const prof = profundidad(d);
  if (prof) out.push({ num: prof, lab: 'profundidad' });
  const viz = etiquetaCorta(d.visibilidad_media);
  if (viz) out.push({ num: viz, lab: 'visibilidad', txt: true });
  const temp = temperatura(d);
  if (temp) out.push({ num: temp, lab: 'temperatura' });
  const corr = etiquetaCorta(d.corrientes);
  if (corr) out.push({ num: corr, lab: 'corriente', txt: true });
  const tipo = tipoBuceo(d);
  if (tipo) out.push({ num: tipo, lab: 'tipo' });
  const cert = etiquetaCorta(d.certificacion_minima);
  if (cert) out.push({ num: cert, lab: 'cert. mínima', flag: true, txt: true });
  return out.slice(0, 6);
}

// Línea de datos del hero (dots): zona · país · tipo · profundidad
export function lede(d: FichaData): string[] {
  const parts: string[] = [];
  const reg = typeof d.region === 'string' ? d.region.split(',')[0].trim() : '';
  if (reg) parts.push(reg);
  if (d.pais && d.pais !== reg) parts.push(String(d.pais));
  const tipo = tipoBuceo(d);
  if (tipo) parts.push(tipo);
  const prof = profundidad(d);
  if (prof) parts.push(prof);
  return parts.slice(0, 4);
}

// Filas de la ficha técnica (rail).
export function railRows(d: FichaData): Array<{ k: string; v: string; hi?: boolean }> {
  const rows: Array<{ k: string; v: string; hi?: boolean }> = [];
  if (d.pais) rows.push({ k: 'País', v: String(d.pais) });
  if (d.region) rows.push({ k: 'Zona', v: String(d.region) });
  const prof = profundidad(d);
  if (prof) rows.push({ k: 'Profundidad', v: prof });
  if (d.visibilidad_media) rows.push({ k: 'Visibilidad', v: String(d.visibilidad_media) });
  const temp = temperatura(d);
  if (temp) rows.push({ k: 'Temperatura', v: temp });
  if (d.corrientes) rows.push({ k: 'Corrientes', v: String(d.corrientes) });
  const tipo = tipoBuceo(d);
  if (tipo) rows.push({ k: 'Tipo', v: tipo });
  if (d.certificacion_minima) rows.push({ k: 'Cert. mínima', v: String(d.certificacion_minima), hi: true });
  if (d.temporada_alta) rows.push({ k: 'Mejor época', v: String(d.temporada_alta) });
  if (d.temporada_baja) rows.push({ k: 'Temporada baja', v: String(d.temporada_baja) });
  const p = precio(d);
  if (p) rows.push({ k: 'Precio aprox.', v: p });
  return rows;
}

// Breadcrumb del hero
export function breadcrumb(d: FichaData): string[] {
  const parts: string[] = [];
  const reg = typeof d.region === 'string' ? d.region.split(',')[0].trim() : '';
  if (reg) parts.push(reg);
  if (d.pais && d.pais !== reg) parts.push(String(d.pais));
  return parts;
}

// Vida marina destacada (recortada para chips visuales).
export function fauna(d: FichaData, max = 6): string[] {
  const arr = Array.isArray(d.vida_marina_destacada) ? d.vida_marina_destacada : [];
  // limpia paréntesis científicos y notas largas para el chip
  return arr.slice(0, max).map((s: string) =>
    String(s).replace(/\s*\(.*?\)/g, '').replace(/\s*[—–-]\s*.*$/, '').replace(/\*/g, '').trim()
  ).filter(Boolean);
}

export function liveaboards(d: FichaData, max = 5): string[] {
  const arr = Array.isArray(d.liveaboards_disponibles) ? d.liveaboards_disponibles : [];
  return arr.slice(0, max).map((s: string) => String(s).replace(/\s*\(.*?\)/g, '').trim()).filter(Boolean);
}
