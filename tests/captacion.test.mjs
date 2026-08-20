/**
 * Control de la captación de leads de scubapedia.org. `npm test`
 *
 * Lo que vigila, y por qué cada cosa:
 *  - el candado de consentimiento es de SERVIDOR (el `required` del navegador
 *    se salta con un POST a mano) y es fail-closed: sin casilla NO se guarda;
 *  - la marca de tiempo y la versión del texto se archivan con el lead (RGPD 7.1);
 *  - el lead llega sabiendo de dónde viene (página, idioma, utm_*, gclid);
 *  - la «Marca» que se manda a Airtable es una opción que EXISTE en el
 *    desplegable (mandar una inventada rompería el guardado);
 *  - el formulario está en la plantilla de las fichas y en la portada, no en
 *    unas cuantas páginas;
 *  - la página legal que enlaza la casilla existe.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  procesarLead, leerConsentimiento, esBot, dentroDelLimite, _reiniciarLimite,
  VERSION_CONSENTIMIENTO, MARCA_AIRTABLE,
} from '../src/lib/leads.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lee = (p) => readFileSync(resolve(RAIZ, p), 'utf8');

/** Opciones REALES del desplegable «Marca» (base appvV6S8P2HkRqPni, tabla
 *  Reservas), leídas del esquema el 20-ago-2026. No hay «Scubapedia». */
const MARCAS_REALES = [
  'Skialpes', 'Viajesdeski', 'Japow', 'Crucerobuceo',
  'Lujosinartificios', 'Recableado', 'Wallet cliente', 'Aspenski',
];

const LEAD_OK = {
  name: 'Ana Pérez',
  email: 'ana@example.com',
  phone: '+34600000000',
  acepta_privacidad: 'on',
  destino: 'Raja Ampat',
  source: 'ficha',
  origen_url: 'https://scubapedia.org/destinos/raja-ampat?gclid=ABC',
  contexto: 'https://scubapedia.org/destinos/raja-ampat?gclid=ABC | lang=es | utm_source=google · gclid=ABC | direct',
};

/** Sustituye fetch y devuelve lo que se le mandó a Airtable. */
function espiarAirtable({ ok = true } = {}) {
  const llamadas = [];
  const fake = async (url, opts) => {
    llamadas.push({ url, fields: JSON.parse(opts.body).fields });
    return { ok, text: async () => 'error simulado' };
  };
  return { llamadas, deps: { fetch: fake, env: { AIRTABLE_PAT: 'pat_test' } } };
}

// --- el candado ---------------------------------------------------------
test('sin consentimiento: 400 y NO se guarda nada', async () => {
  const { llamadas, deps } = espiarAirtable();
  const r = await procesarLead({ ...LEAD_OK, acepta_privacidad: '' }, deps);
  assert.equal(r.status, 400);
  assert.equal(r.guardado, false);
  assert.equal(llamadas.length, 0, 'no debe haber tocado Airtable');
});

test('el consentimiento no se puede falsificar con cualquier valor', async () => {
  for (const valor of [undefined, 'off', 'no', '1', 'sí', 0, null]) {
    const { llamadas, deps } = espiarAirtable();
    const r = await procesarLead({ ...LEAD_OK, acepta_privacidad: valor }, deps);
    assert.equal(r.status, 400, `valor ${JSON.stringify(valor)} no debe pasar`);
    assert.equal(llamadas.length, 0);
  }
});

test('con consentimiento: se guarda y viaja la prueba con fecha y versión', async () => {
  const { llamadas, deps } = espiarAirtable();
  const r = await procesarLead(LEAD_OK, { ...deps, ahora: new Date('2026-08-20T10:00:00.000Z') });
  assert.equal(r.status, 303);
  assert.equal(llamadas.length, 1);
  const notas = llamadas[0].fields['Notas'];
  assert.match(notas, /Consentimiento tratamiento de datos aceptado: 2026-08-20T10:00:00\.000Z/);
  assert.match(notas, new RegExp(`texto v${VERSION_CONSENTIMIENTO}`));
});

// --- de dónde viene el lead --------------------------------------------
test('el lead llega con su origen: página, idioma, campaña y gclid', async () => {
  const { llamadas, deps } = espiarAirtable();
  await procesarLead(LEAD_OK, deps);
  const f = llamadas[0].fields;
  assert.equal(f['Origen URL'], LEAD_OK.origen_url);
  assert.match(f['Notas'], /utm_source=google/);
  assert.match(f['Notas'], /gclid=ABC/);
  assert.match(f['Notas'], /lang=es/);
  assert.match(f['Notas'], /\[Origen: Ficha de destino\]/);
  assert.match(f['Producto solicitado'], /Raja Ampat/);
});

// --- Airtable: no romper el guardado -----------------------------------
test('la Marca que se manda existe en el desplegable de Airtable', async () => {
  assert.ok(MARCAS_REALES.includes(MARCA_AIRTABLE),
    `«${MARCA_AIRTABLE}» no es una opción real del campo Marca`);
  const { llamadas, deps } = espiarAirtable();
  await procesarLead(LEAD_OK, deps);
  assert.equal(llamadas[0].fields['Marca'], MARCA_AIRTABLE);
  assert.equal(llamadas[0].fields['Tipo'], 'Lead');
  // La marca real no se pierde aunque el desplegable no la tenga.
  assert.match(llamadas[0].fields['Notas'], /Marca real: Scubapedia/);
});

test('si Airtable rechaza el lead, el visitante ve un error, no un falso «gracias»', async () => {
  const { deps } = espiarAirtable({ ok: false });
  const r = await procesarLead(LEAD_OK, deps);
  assert.equal(r.status, 500);
  assert.equal(r.guardado, false);
});

test('sin AIRTABLE_PAT no se finge que se ha guardado', async () => {
  const { llamadas, deps } = espiarAirtable();
  const r = await procesarLead(LEAD_OK, { ...deps, env: {} });
  assert.equal(r.status, 500);
  assert.equal(llamadas.length, 0);
});

// --- validación y antiabuso --------------------------------------------
test('nombre y email se validan en servidor', async () => {
  const { deps } = espiarAirtable();
  assert.equal((await procesarLead({ ...LEAD_OK, name: 'A' }, deps)).status, 400);
  assert.equal((await procesarLead({ ...LEAD_OK, email: 'no-es-email' }, deps)).status, 400);
});

test('la trampa antibots no guarda nada y no delata que es una trampa', async () => {
  assert.equal(esBot({ apellido_2: 'spam' }), true);
  assert.equal(esBot({}), false);
  const { llamadas, deps } = espiarAirtable();
  const r = await procesarLead({ ...LEAD_OK, apellido_2: 'spam' }, deps);
  assert.equal(r.status, 200, 'al bot se le responde OK para que no reintente');
  assert.equal(llamadas.length, 0);
});

test('límite de 10 envíos por minuto y por IP', () => {
  _reiniciarLimite();
  const t = Date.now();
  for (let i = 0; i < 10; i++) assert.equal(dentroDelLimite('9.9.9.9', t), true, `envío ${i + 1}`);
  assert.equal(dentroDelLimite('9.9.9.9', t), false, 'el 11º se corta');
  assert.equal(dentroDelLimite('8.8.8.8', t), true, 'otra IP no se ve afectada');
  assert.equal(dentroDelLimite('9.9.9.9', t + 61_000), true, 'pasado el minuto, vuelve a pasar');
});

test('leerConsentimiento acepta las tres formas en que llega marcado', () => {
  for (const v of ['on', true, 'true']) {
    assert.equal(leerConsentimiento({ acepta_privacidad: v }).ok, true);
  }
});

// --- que esté puesto donde tiene que estar ------------------------------
test('el formulario está en la plantilla de las fichas: entra en las 122', () => {
  const layout = lee('src/layouts/FichaLayout.astro');
  assert.match(layout, /<CaptacionForm/, 'FichaLayout debe montar el formulario');
  assert.match(layout, /href="#pedir-presupuesto"/, 'y el botón que lleva a él');
  const fichas = readdirSync(resolve(RAIZ, 'src/content/buceo')).filter((f) => f.endsWith('.md'));
  assert.ok(fichas.length > 100, `esperaba más de 100 fichas, hay ${fichas.length}`);
});

test('botón arriba Y abajo, no escondido a media página', () => {
  const layout = lee('src/layouts/FichaLayout.astro');
  const enlaces = layout.match(/href="#pedir-presupuesto"/g) || [];
  assert.ok(enlaces.length >= 2, `esperaba 2 botones (arriba y abajo), hay ${enlaces.length}`);
  const portada = lee('src/pages/index.astro');
  assert.ok((portada.match(/href="#pedir-presupuesto"/g) || []).length >= 2);
});

test('la portada tiene formulario', () => {
  assert.match(lee('src/pages/index.astro'), /<CaptacionForm source="portada"/);
});

test('la casilla enlaza una política de privacidad que existe', () => {
  const form = lee('src/components/CaptacionForm.astro');
  assert.match(form, /href="\/politica-de-privacidad"/);
  assert.ok(existsSync(resolve(RAIZ, 'src/pages/politica-de-privacidad.astro')));
  assert.match(form, /name="acepta_privacidad"[^>]*required/, 'la casilla es obligatoria');
  assert.doesNotMatch(form, /name="acepta_privacidad"[^>]*checked/, 'jamás premarcada');
});

test('la página de gracias solo cuenta la conversión con el token del envío', () => {
  const g = lee('src/pages/gracias.astro');
  assert.match(g, /generate_lead/);
  assert.match(g, /URLSearchParams\(location\.search\)\.get\('ok'\)/);
  // El clic de WhatsApp es contacto, no lead.
  const form = lee('src/components/CaptacionForm.astro');
  assert.match(form, /'contact', \{ method: 'whatsapp'/);
  assert.doesNotMatch(form, /generate_lead/);
});
