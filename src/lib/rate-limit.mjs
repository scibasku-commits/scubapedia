/**
 * Limitador de tasa por IP — reutilizable en endpoints públicos.
 * ponytail: contador en memoria del proceso, no Redis. En serverless cada
 * instancia lleva su cuenta, así que el límite real es más flojo que el
 * nominal — pero frena la ráfaga de un script, que es el caso que hay.
 */

const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 10;

// Un cubo POR ENDPOINT. Compartir uno solo hacía que diez preguntas al chat
// dejaran al visitante sin poder enviar el formulario de presupuesto: el camino
// que menos vale bloqueaba al que más.
const cubos = new Map();
function cubo(ambito) {
  let m = cubos.get(ambito);
  if (!m) { m = new Map(); cubos.set(ambito, m); }
  return m;
}

export function ipDe(request) {
  // `x-real-ip` lo fija la plataforma (Vercel) y el cliente no puede falsearla.
  // `x-forwarded-for` sí la puede escribir quien llama: si se cogiera su primer
  // valor, bastaría cambiar la cabecera en cada petición para tener identidad
  // nueva y saltarse el límite. Por eso va de respaldo y se toma el ÚLTIMO
  // valor, que es el que añade el proxy más cercano.
  const real = request?.headers?.get?.('x-real-ip');
  if (real) return String(real).trim();
  const fwd = request?.headers?.get?.('x-forwarded-for');
  if (fwd) {
    const partes = String(fwd).split(',').map((s) => s.trim()).filter(Boolean);
    if (partes.length) return partes[partes.length - 1];
  }
  return 'desconocida';
}

/** true = deja pasar. false = ha superado el límite en el último minuto. */
export function dentroDelLimite(ip, ahora = Date.now(), ambito = 'general') {
  const golpes = cubo(ambito);
  const previos = (golpes.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (previos.length >= MAX_POR_VENTANA) {
    golpes.set(ip, previos);
    return false;
  }
  previos.push(ahora);
  golpes.set(ip, previos);
  if (golpes.size > 5_000) {
    for (const [k, v] of golpes) if (!v.some((t) => ahora - t < VENTANA_MS)) golpes.delete(k);
  }
  return true;
}

/** Solo para los tests. */
export function limpiarGolpes() {
  cubos.clear();
}
