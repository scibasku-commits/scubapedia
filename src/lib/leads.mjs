/**
 * Captación de leads de scubapedia.org — la lógica de servidor, sin Astro.
 * ======================================================================
 * Por qué existe (auditoría 20-ago-2026): las 122 fichas de destino no ofrecían
 * más contacto que un botón de WhatsApp y un enlace a crucerobuceo.com. Quien
 * no estaba listo para escribir por WhatsApp se iba sin dejar rastro. El chat
 * guardaba la conversación en Mission Control pero nunca pedía el contacto:
 * había transcripciones sin manera de contestarlas.
 *
 * Mismo criterio, ya probado, que skialpes.es (src/lib/legal/consentimiento.ts)
 * e ilovecanada.travel (api/_lib/captacion.mjs): el candado del consentimiento
 * vive en el SERVIDOR, porque el `required` del navegador se salta con un POST
 * a mano.
 *
 * Está en .mjs y no en .ts a propósito: así lo importan igual la ruta de Astro
 * (src/pages/api/lead.ts) y `node --test`, sin transpilar nada.
 */

/**
 * Versión del texto que se aceptó. No basta con saber CUÁNDO aceptó el
 * viajero: el art. 7.1 del RGPD pide poder demostrar QUÉ leyó. Al cambiar el
 * copy de la casilla en src/components/CaptacionForm.astro, sube esta fecha.
 */
export const VERSION_CONSENTIMIENTO = '2026-08-20';

/** Campo trampa: invisible para humanos, irresistible para bots. */
export const CAMPO_HONEYPOT = 'apellido_2';

export const MENSAJE_SIN_CONSENTIMIENTO =
  'Para poder responderte necesito que marques la casilla de tratamiento de datos. ' +
  'Vuelve atrás y márcala, o escríbeme a info@viajesscibasku.com o por WhatsApp al +34 619 40 10 41.';

export function esBot(datos) {
  return String(datos?.[CAMPO_HONEYPOT] ?? '').trim() !== '';
}

/**
 * Fail-closed: sin `acepta_privacidad` marcado no se guarda ni un dato
 * personal. Devuelve la prueba que se archiva junto al lead.
 */
export function leerConsentimiento(datos, ahora = new Date()) {
  const v = datos?.acepta_privacidad;
  if (!(v === 'on' || v === true || v === 'true')) return { ok: false };
  return {
    ok: true,
    prueba: `[Consentimiento tratamiento de datos aceptado: ${ahora.toISOString()} · texto v${VERSION_CONSENTIMIENTO}]`,
  };
}

// --- Límite por IP -------------------------------------------------------
// Importado desde src/lib/rate-limit.mjs para compartir con otros endpoints.
export { ipDe, dentroDelLimite, limpiarGolpes as _reiniciarLimite } from './rate-limit.mjs';

// --- Airtable ------------------------------------------------------------
/**
 * ⚠️ El desplegable «Marca» de la tabla Reservas (base appvV6S8P2HkRqPni) NO
 * tiene la opción «Scubapedia» — verificado contra el esquema real el
 * 20-ago-2026: Skialpes, Viajesdeski, Japow, Crucerobuceo, Lujosinartificios,
 * Recableado, Wallet cliente, Aspenski. El PAT no puede escribir esquema, así
 * que mandar «Scubapedia» rompería el guardado del lead.
 *
 * Se guarda como «Crucerobuceo» —es la marca a la que scubapedia manda todas
 * sus conversiones— y la marca real queda escrita en las Notas, para no perder
 * el dato mientras Giora no añada la opción a mano en Airtable.
 */
export const MARCA_AIRTABLE = 'Scubapedia';

const ORIGENES = {
  ficha: 'Ficha de destino',
  portada: 'Portada scubapedia.org',
  listado: 'Listado de destinos',
  chat: 'Asistente del chat',
};

function referencia() {
  return 'SCUBA-L-' + Math.random().toString(36).slice(2, 10).toUpperCase();
}

/**
 * Procesa un lead ya parseado. Devuelve `{ status, mensaje, guardado }`.
 * `deps` se inyecta en los tests: así se comprueba que sin consentimiento
 * NADIE llama a Airtable.
 */
export async function procesarLead(datos, deps = {}) {
  const {
    fetch: doFetch = globalThis.fetch,
    ahora = new Date(),
    env = process.env,
  } = deps;

  // Trampa para bots: se responde como si todo hubiera ido bien —un error solo
  // les enseña a reintentar— pero no se guarda nada.
  if (esBot(datos)) return { status: 200, mensaje: 'ok', guardado: false, bot: true };

  const nombre = String(datos?.name ?? '').trim();
  const email = String(datos?.email ?? '').trim();
  const telefono = String(datos?.phone ?? '').trim();

  if (nombre.length < 2) return { status: 400, mensaje: 'Falta el nombre.', guardado: false };
  if (!/.+@.+\..+/.test(email)) return { status: 400, mensaje: 'Email inválido.', guardado: false };

  // Fail-closed: el candado va ANTES de tocar ningún dato personal.
  const consent = leerConsentimiento(datos, ahora);
  if (!consent.ok) {
    return { status: 400, mensaje: MENSAJE_SIN_CONSENTIMIENTO, guardado: false };
  }

  const clave = String(datos?.source ?? 'ficha');
  const origen = ORIGENES[clave] ?? ORIGENES.ficha;
  const destino = String(datos?.destino ?? '').trim();
  const contexto = String(datos?.contexto ?? '').trim();
  const origenUrl = String(datos?.origen_url ?? '').trim();

  const notas = [
    String(datos?.message ?? '').trim(),
    String(datos?.fechas ?? '').trim() ? `[Fechas aproximadas: ${String(datos.fechas).trim()}]` : '',
    String(datos?.nivel ?? '').trim() ? `[Nivel/certificación: ${String(datos.nivel).trim()}]` : '',
    `[Origen: ${origen}]`,
    contexto ? `[Contexto: ${contexto}]` : '',
    consent.prueba,
  ].filter(Boolean).join('\n\n');

  const PAT = env.AIRTABLE_PAT;
  const BASE = env.AIRTABLE_BASE_ID || 'appvV6S8P2HkRqPni';
  if (!PAT) {
    console.error('[lead] AIRTABLE_PAT no configurada: el lead NO queda registrado');
    return {
      status: 500,
      mensaje: 'No se pudo registrar la petición. Escríbeme a info@viajesscibasku.com o por WhatsApp al +34 619 40 10 41.',
      guardado: false,
    };
  }

  const fields = {
    'Referencia interna': referencia(),
    'Marca': MARCA_AIRTABLE,
    'Tipo': 'Lead',
    'Estado': 'Borrador',
    'Nombre cliente': nombre,
    'Email cliente': email,
    'Producto solicitado': `Buceo en ${destino || 'destino sin especificar'} — scubapedia.org`,
    'Notas': notas,
  };
  if (telefono) fields['Teléfono cliente'] = telefono;
  if (origenUrl) fields['Origen URL'] = origenUrl;

  try {
    const res = await doFetch(`https://api.airtable.com/v0/${BASE}/Reservas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      console.error('[lead] Airtable rechazó el lead:', await res.text());
      return { status: 500, mensaje: 'Fallo al guardar la petición.', guardado: false };
    }
  } catch (e) {
    console.error('[lead] fallo de red con Airtable:', e?.message ?? e);
    return { status: 500, mensaje: 'Error de conexión al guardar la petición.', guardado: false };
  }

  return { status: 303, mensaje: 'ok', guardado: true };
}
