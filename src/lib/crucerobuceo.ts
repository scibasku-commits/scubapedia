// Puente Scubapedia → crucerobuceo: mapea cada ficha (entry.id sin .md) al slug de
// destino de crucerobuceo. Ese mismo slug es la carpeta de fotos en Cloudinary
// (destinos/<slug>/<slug>-hero.jpg), así que sirve para CTA y para imagen.

export const DEST_MAP: Record<string, string> = {
  // Mar Rojo
  'mar-rojo-overview': 'mar-rojo', 'hurghada': 'mar-rojo', 'sharm-el-sheikh': 'mar-rojo',
  'marsa-alam': 'mar-rojo', 'dahab': 'mar-rojo', 'ras-mohammed': 'mar-rojo',
  'brother-islands': 'mar-rojo', 'daedalus-reef': 'mar-rojo', 'elphinstone-reef': 'mar-rojo',
  'fury-shoals': 'mar-rojo', 'safaga-hurghada-norte': 'mar-rojo', 'strait-of-tiran': 'mar-rojo',
  'sudan-mar-rojo': 'mar-rojo', 'st-johns': 'mar-rojo',
  // Maldivas
  'maldivas-south-ari': 'maldivas', 'maldivas-north-ari': 'maldivas',
  'maldivas-baa-hanifaru': 'maldivas', 'maldivas-lhaviyani': 'maldivas',
  'maldivas-fuvahmulah': 'maldivas', 'maldivas-huvadhoo': 'maldivas',
  'maldivas-addu': 'maldivas', 'maldivas-south-male': 'maldivas',
  'maldivas-atolones-norte': 'maldivas',
  // Indonesia
  'raja-ampat': 'indonesia', 'komodo': 'indonesia', 'bali-nusa-penida': 'indonesia',
  'banda-sea': 'indonesia', 'alor': 'indonesia',
  // Tailandia
  'similan-surin-richelieu': 'tailandia', 'koh-tao': 'tailandia',
  // Cuba
  'jardines-reina-cuba': 'cuba',
  // Filipinas
  'anilao': 'filipinas', 'apo-island': 'filipinas', 'malapascua': 'filipinas',
  'moalboal': 'filipinas', 'coron': 'filipinas', 'puerto-galera': 'filipinas',
  'zamboanga': 'filipinas', 'tubbataha': 'filipinas',
  // Pacífico / islas
  'palau': 'palau', 'galapagos': 'galapagos', 'cocos-island': 'cocos',
  'belice': 'belize', 'bahamas': 'bahamas', 'arabia-saudi': 'arabia-saudita',
  'roatan-utila': 'honduras', 'cayman-islands': 'cayman', 'islas-salomon': 'salomon',
  'revillagigedo-socorro': 'mexico', 'baja-california-la-paz': 'mexico', 'cozumel': 'mexico',
  'gran-barrera': 'australia', 'ningaloo': 'australia', 'rowley-shoals': 'australia',
  'bonaire': 'caribe', 'curacao': 'caribe', 'tobago': 'caribe',
  'fakarava': 'pacifico', 'rangiroa': 'pacifico', 'fiji': 'pacifico',
  'tonga': 'pacifico', 'yap': 'pacifico', 'chuuk-lagoon': 'pacifico',
  'sipadan-mabul': 'filipinas', 'layang-layang': 'filipinas', 'tioman-perhentian': 'filipinas',
  // Huecos mecánicos verificados 2026-07-07 (Tarea 6, estudio-maestro-optimizacion-webs):
  // el destino ya existe en el catálogo real de crucerobuceo (dest-mapping.json /
  // HERO_SLUGS / landing publicada), pero faltaba la entrada en este DEST_MAP.
  'turks-caicos': 'turks-caicos', // landing /buceo-en/turks-caicos.html ya existe (HERO_SLUGS)
  'neptune-islands': 'australia', // listado explícito en dest-mapping.json → australia.fichas
  'nosy-be-madagascar': 'madagascar', // listado explícito en dest-mapping.json → madagascar.fichas
};

// Slugs de crucerobuceo que SÍ tienen foto destinos/<slug>/<slug>-hero.jpg en Cloudinary
// (verificado 7-jun). Si un slug no está aquí, la UI cae al degradado de zona.
export const HERO_SLUGS: ReadonlySet<string> = new Set([
  'arabia-saudita', 'australia', 'bahamas', 'belize', 'caribe', 'cayman', 'cocos',
  'cuba', 'filipinas', 'galapagos', 'honduras', 'indonesia', 'madagascar', 'maldivas',
  'mar-rojo', 'mexico', 'pacifico', 'palau', 'salomon', 'tailandia', 'turks-caicos',
]);

const CRUCERO = 'https://crucerobuceo.com';

export function crucerobuceoSlug(id: string): string | null {
  return DEST_MAP[id] ?? null;
}

export function crucerobuceoUrl(id: string): string {
  const s = DEST_MAP[id];
  return s ? `${CRUCERO}/buceo-en/${s}` : CRUCERO;
}
