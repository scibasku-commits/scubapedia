// Resolutor de imágenes de destino de buceo.
// FUENTE: fotos REALES de crucerobuceo ya subidas a Cloudinary en
//   destinos/<slug>/<slug>-hero.jpg, donde <slug> es el destino de crucerobuceo
//   (lib/crucerobuceo.ts → DEST_MAP). Verificado 7-jun (cloud drqgkirpy).
// Si una ficha no mapea a un slug con foto, devuelve null y la UI usa el degradado
// de profundidad por zona (lib/zonas.ts → zonaGradient) como fondo elegante.

import { crucerobuceoSlug, HERO_SLUGS } from './crucerobuceo';

const CLOUD = 'drqgkirpy';

type Preset = 'hero' | 'card' | 'og' | 'thumb';
const PRESETS: Record<Preset, string> = {
  hero: 'f_auto,q_auto,c_fill,g_auto,w_1600,h_900',
  card: 'f_auto,q_auto,c_fill,g_auto,w_800,h_600',
  og: 'f_auto,q_auto,c_fill,g_auto,w_1200,h_630',
  thumb: 'f_auto,q_auto,c_fill,g_auto,w_600,h_400',
};

// Zonas con una variante "-hero-v2" mejor encuadrada (las "-hero" originales eran
// verticales o mal recortadas). Verificado 7-jun. Para estas usamos la v2.
const V2_SLUGS: ReadonlySet<string> = new Set([
  'arabia-saudita', 'australia', 'caribe', 'cuba', 'galapagos', 'honduras',
  'madagascar', 'maldivas', 'pacifico', 'salomon', 'tailandia',
]);

function fileFor(slug: string): string {
  return V2_SLUGS.has(slug) ? `${slug}-hero-v2` : `${slug}-hero`;
}

function url(slug: string, preset: Preset): string {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${PRESETS[preset]}/destinos/${slug}/${fileFor(slug)}.jpg`;
}

// Fichas ESTRELLA con foto PROPIA (no la de zona). Las imágenes están en Cloudinary
// en destinos/_estrella/<id>-hero.jpg (cloud drqgkirpy, sacadas de Immich 7-jun y
// verificadas con entrega 200 el 8-jun). El sistema base resuelve por zona
// (crucerobuceoSlug), así que estas fichas necesitan un override por id.
const ESTRELLA_HERO: ReadonlySet<string> = new Set([
  'raja-ampat', 'komodo', 'similan-surin-richelieu',
  'brother-islands', 'maldivas-baa-hanifaru', 'sipadan-mabul',
]);

function estrellaUrl(id: string, preset: Preset): string {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${PRESETS[preset]}/destinos/_estrella/${id}-hero.jpg`;
}

// Imagen para una ficha (por su id sin .md). null si no hay foto → degradado.
export function destinoImage(id: string, preset: Preset = 'hero'): string | null {
  if (ESTRELLA_HERO.has(id)) return estrellaUrl(id, preset);
  const slug = crucerobuceoSlug(id);
  if (!slug || !HERO_SLUGS.has(slug)) return null;
  return url(slug, preset);
}

export function hasImage(id: string): boolean {
  if (ESTRELLA_HERO.has(id)) return true;
  const slug = crucerobuceoSlug(id);
  return !!slug && HERO_SLUGS.has(slug);
}

// Imagen directa por slug de crucerobuceo (para usos por zona).
export function slugImage(slug: string, preset: Preset = 'hero'): string | null {
  return HERO_SLUGS.has(slug) ? url(slug, preset) : null;
}
