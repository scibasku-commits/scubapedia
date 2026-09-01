// Normaliza la región cruda de cada ficha a una ZONA canónica de buceo,
// y le adjunta metadatos (slug, blurb, degradado de profundidad para el fallback visual).
// Portado del normalizeRegion original de la home + enriquecido.

export function normalizeZona(r) {
  if (!r) return 'Otros';
  if (r.includes('Mar Rojo') || r.includes('Sinaí')) return 'Mar Rojo';
  if (r.startsWith('Maldivas')) return 'Maldivas';
  // Pacífico rules BEFORE Caribe (coiba-panama case: Caribe / Pacífico → Pacífico Este)
  if (r.includes('Pacífico Sur') || r.includes('Patagonia')) return 'Pacífico Sur';
  if (r.includes('Pacífico Central')) return 'Pacífico Central';
  if (r.includes('Micronesia') || r.includes('Hawaii')) return 'Pacífico Central';
  if (r.includes('Pacífico Oriental') || r.includes('Pacífico Americano') || r.includes('Baja California')) return 'Pacífico Este';
  if (r.includes('Pacífico Este')) return 'Pacífico Este';
  if (r.includes('Pacífico Occidental')) return 'Sudeste Asiático';
  // Regiones con barra: si tiene Pacífico, ir a Pacífico Este (coiba-panama case)
  if (r.includes('/') && r.includes('Pacífico')) return 'Pacífico Este';
  if (r.includes('Caribe') && !r.includes('Pacífico')) return 'Caribe';
  if (r.includes('Riviera Maya') || r.includes('Yucatán')) return 'Caribe';
  if (r.includes('Sudeste Asiático') || r === 'Filipinas' || r === 'Indonesia' || r.includes('Maluku') || r.includes('Nusa Tenggara') || r.includes('Sulawesi') || r.includes('Visayas') || r.includes('Papua Occidental') || r.includes('Luzón') || r.includes('Negros') || r.includes('Cebú') || r.includes('Andamán') || r.includes('Sulu') || r.includes('Tailandia')) return 'Sudeste Asiático';
  if (r.includes('Atlántico')) return 'Atlántico';
  if (r.includes('Mediterráneo')) return 'Mediterráneo';
  if (r.includes('Sudáfrica')) return 'Sudáfrica';
  if (r.includes('Índico')) return 'Océano Índico';
  if (r.includes('Antártico') || r.includes('Antártida')) return 'Aguas polares';
  if (r.includes('Ártico') || r.includes('Islandia') || r.includes('Noruega')) return 'Aguas polares';
  if (r.includes('Australia') || r.includes('Queensland')) return 'Australia';
  return 'Otros';
}

export function zonaSlug(z) {
  return z.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Orden editorial de las zonas en el directorio.
export const ZONA_ORDER = [
  'Mar Rojo', 'Maldivas', 'Sudeste Asiático', 'Pacífico Central',
  'Pacífico Este', 'Pacífico Sur', 'Caribe', 'Atlántico', 'Océano Índico',
  'Mediterráneo', 'Australia', 'Sudáfrica', 'Aguas polares', 'Otros',
];

export function zonaRank(z) {
  const i = ZONA_ORDER.indexOf(z);
  return i === -1 ? ZONA_ORDER.length : i;
}

// Subtítulo editorial breve por zona (cae a uno genérico si no hay).
const ZONA_BLURB = {
  'Mar Rojo': 'Arrecifes vírgenes, pecios y la ruta clásica de los liveaboards.',
  'Maldivas': 'Atolones, canales de manta y el ballet de los grandes pelágicos.',
  'Sudeste Asiático': 'El Triángulo de Coral: la mayor biodiversidad marina del planeta.',
  'Pacífico Central': 'Lagunas de Micronesia y pecios de la Segunda Guerra Mundial.',
  'Pacífico Este': 'Aguas frías y ricas: mantas oceánicas, martillos y ballenas.',
  'Pacífico Sur': 'Polinesia, paredes de tiburones y arrecifes remotos.',
  'Caribe': 'Aguas cálidas y claras, ideales para empezar y para fotografiar.',
  'Atlántico': 'Volcanes sumergidos, mantas y mares abiertos del Atlántico medio.',
  'Océano Índico': 'Islas remotas, tiburones ballena y arrecifes poco buceados.',
  'Mediterráneo': 'Buceo de proximidad: praderas, cuevas y arqueología sumergida.',
  'Australia': 'La Gran Barrera y los arrecifes salvajes del oeste australiano.',
  'Sudáfrica': 'El Sardine Run y los tiburones de Aliwal y Protea Banks.',
  'Aguas polares': 'Buceo extremo entre hielo, orcas y vida fría intacta.',
  'Otros': 'Destinos singulares que no encajan en un único mar.',
};
export function zonaBlurb(z) {
  return ZONA_BLURB[z] ?? 'Destinos de buceo seleccionados y verificados.';
}

// Degradado de "profundidad" por zona — fallback visual mientras no hay foto.
// Tonos de azul mar (familia del acento). Determinista por zona.
const ZONA_GRADIENT = {
  'Mar Rojo': 'linear-gradient(155deg,#0e7d8f 0%,#0a4a63 55%,#06283a 100%)',
  'Maldivas': 'linear-gradient(155deg,#12a0b8 0%,#0a5570 55%,#072e44 100%)',
  'Sudeste Asiático': 'linear-gradient(155deg,#0f8f86 0%,#0a4f63 55%,#062b3c 100%)',
  'Pacífico Central': 'linear-gradient(155deg,#1192b0 0%,#0a4d6a 55%,#062a40 100%)',
  'Pacífico Este': 'linear-gradient(155deg,#0c6f8a 0%,#093f5a 55%,#051f30 100%)',
  'Pacífico Sur': 'linear-gradient(155deg,#1198b5 0%,#0a526e 55%,#062c42 100%)',
  'Caribe': 'linear-gradient(155deg,#16a6c9 0%,#0c6c8c 55%,#083d54 100%)',
  'Atlántico': 'linear-gradient(155deg,#0d7f9b 0%,#094862 55%,#05222f 100%)',
  'Océano Índico': 'linear-gradient(155deg,#1396ab 0%,#0a5168 55%,#062b3a 100%)',
  'Mediterráneo': 'linear-gradient(155deg,#1391a8 0%,#0a5066 55%,#062a3a 100%)',
  'Australia': 'linear-gradient(155deg,#13a0b6 0%,#0a566e 55%,#062e40 100%)',
  'Sudáfrica': 'linear-gradient(155deg,#0b6076 0%,#073a4e 55%,#041c28 100%)',
  'Aguas polares': 'linear-gradient(155deg,#3a7f96 0%,#1d4d63 55%,#0a2533 100%)',
  'Otros': 'linear-gradient(155deg,#0e8298 0%,#0a4a62 55%,#062a3a 100%)',
};
export function zonaGradient(z) {
  return ZONA_GRADIENT[z] ?? ZONA_GRADIENT['Otros'];
}
