/**
 * Limitador de tasa por IP — reutilizable en endpoints públicos.
 * ponytail: contador en memoria del proceso, no Redis. En serverless cada
 * instancia lleva su cuenta, así que el límite real es más flojo que el
 * nominal — pero frena la ráfaga de un script, que es el caso que hay.
 */

const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 10;
const golpes = new Map();

export function ipDe(request) {
  const fwd = request?.headers?.get?.('x-forwarded-for');
  if (fwd) return String(fwd).split(',')[0].trim();
  return request?.headers?.get?.('x-real-ip') ?? 'desconocida';
}

/** true = deja pasar. false = ha superado el límite en el último minuto. */
export function dentroDelLimite(ip, ahora = Date.now()) {
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
  golpes.clear();
}
