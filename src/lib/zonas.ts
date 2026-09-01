// Fachada con tipos. LA LÓGICA VIVE EN `zonas.mjs`, Y SOLO AHÍ.
//
// Por qué: `tests/zonas.test.mjs` se ejecuta con `node --test`, que no lee TypeScript.
// Si la lógica se copiara aquí, la prueba comprobaría la copia y seguiría en verde
// aunque alguien rompiera lo que sirve la web. Una sola fuente, importada por los dos.
export {
  normalizeZona,
  zonaSlug,
  ZONA_ORDER,
  zonaRank,
  zonaBlurb,
  zonaGradient,
} from './zonas.mjs';
