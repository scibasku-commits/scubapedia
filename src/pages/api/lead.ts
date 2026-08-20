/**
 * POST /api/lead — el formulario de captación de scubapedia.org.
 *
 * Adaptador fino: parsea el POST y delega en procesarLead() (src/lib/leads.mjs),
 * que es donde vive el candado de consentimiento y lo que cubren los tests.
 *
 * El formulario manda un POST normal (`x-www-form-urlencoded`) y espera un 303
 * a /gracias — la página que cuenta la conversión de verdad. No depende de
 * fetch a propósito: si el JS fallara, el navegador enviaría el formulario
 * igualmente.
 */
import type { APIRoute } from 'astro';
import { procesarLead, ipDe, dentroDelLimite } from '../../lib/leads.mjs';

export const prerender = false; // SSR en Vercel

export const POST: APIRoute = async ({ request }) => {
  const gracias = () =>
    new Response(null, {
      status: 303,
      // El token `ok` es lo que autoriza a /gracias a contar la conversión:
      // sin él, abrir la URL a pelo inflaría las conversiones de Google Ads.
      headers: { Location: `/gracias?ok=${crypto.randomUUID().slice(0, 8)}` },
    });

  try {
    const form = await request.formData();
    const datos = Object.fromEntries(form.entries());

    if (!dentroDelLimite(ipDe(request))) {
      return new Response('Demasiadas peticiones. Espera un minuto e inténtalo otra vez.', { status: 429 });
    }

    const r = await procesarLead(datos);
    if (r.status === 303 || r.bot) return gracias();
    return new Response(r.mensaje, { status: r.status });
  } catch (e: any) {
    console.error('[/api/lead] error:', e?.message ?? e);
    return new Response(
      'No se pudo enviar la petición. Escríbeme a info@viajesscibasku.com o por WhatsApp al +34 619 40 10 41.',
      { status: 500 },
    );
  }
};
