import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const norm = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const prerender = false; // SSR en Vercel

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages, sessionId } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Faltan los mensajes en la petición.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    const last = messages[messages.length - 1]?.content || '';
    const query = norm(last);

    // 1. Base de conocimiento: todas las fichas de buceo
    const fichas = await getCollection('buceo');
    const dests = fichas.map((f) => {
      const d = f.data as Record<string, any>;
      const arr = (v: any) => Array.isArray(v) ? v.filter(Boolean).join(', ') : (v || '');
      return {
        id: f.id.replace(/\.md$/, ''),
        title: d.title || f.id,
        pais: d.pais || '',
        region: d.region || '',
        profMin: d.profundidad_min ?? null,
        profMax: d.profundidad_max ?? null,
        vis: d.visibilidad_media || '',
        tMin: d.temperatura_agua_min ?? null,
        tMax: d.temperatura_agua_max ?? null,
        corrientes: d.corrientes || '',
        temporadaAlta: typeof d.temporada_alta === 'string' ? d.temporada_alta : arr(d.temporada_alta),
        cert: d.certificacion_minima || '',
        vida: arr(d.vida_marina_destacada),
        liveaboards: arr(d.liveaboards_disponibles),
        precio: d.precio_semana_aprox || '',
        giora: d.giora_estuvo === true,
        body: f.body ? f.body.slice(0, 1400) : '',
      };
    });

    // 2. Relevancia por título / país / región
    let matched = dests.map((r) => {
      const t = norm(r.title), p = norm(r.pais), reg = norm(r.region);
      let score = 0;
      const words = t.split(/[\s,()\-—]+/).map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w.length >= 3);
      if (query.includes(t.split(' ')[0]) && t.split(' ')[0].length >= 4) score += 8;
      const mw = words.filter(w => query.includes(w));
      if (mw.length) score += 10 + mw.length * 5;
      if (p && query.includes(p)) score += 6;
      if (reg) {
        const rp = reg.split(/[\s,()\-/]+/).map(x => x.replace(/[^a-z0-9]/g, '')).filter(x => x.length > 3);
        if (rp.some(x => query.includes(x))) score += 3;
      }
      return { r, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).map(x => x.r);

    // 3. Fallback por intención/fauna
    if (matched.length === 0) {
      const has = (...k: string[]) => k.some(x => query.includes(x));
      const byVida = (k: string) => dests.filter(r => norm(r.vida).includes(k) || norm(r.body).includes(k));
      if (has('manta')) matched = byVida('manta');
      else if (has('martillo', 'hammerhead')) matched = byVida('martillo');
      else if (has('tiburon ballena', 'whale shark', 'ballena')) matched = byVida('ballena');
      else if (has('tiburon', 'shark')) matched = byVida('tiburon');
      else if (has('pecio', 'wreck', 'barco hundido', 'naufragio')) matched = dests.filter(r => /pecio|wreck|naufrag/.test(norm(r.body)) || /pecio|wreck/.test(norm(r.vida)));
      else if (has('principiante', 'empez', 'nivel ow', 'open water', 'bautizo', 'iniciacion')) matched = dests.filter(r => /ow|open water/.test(norm(r.cert)));
      else if (has('barat', 'economic', 'precio')) matched = dests.filter(r => /tailandia|filipinas|egipto|mar rojo|honduras/.test(norm(r.pais + ' ' + r.region)));
      else if (has('donde ha', 'has estado', 'has buceado', 'recomiendas tu', 'tu favorito')) matched = dests.filter(r => r.giora);
    }

    const selected = matched.slice(0, 5);
    if (selected.length === 0) {
      const top = ['raja-ampat', 'galapagos', 'mar-rojo-overview', 'maldivas-baa-hanifaru', 'sipadan-mabul'];
      selected.push(...dests.filter(r => top.includes(r.id)));
    }

    // 4. Contexto para el modelo
    const ctx = selected.map((r) => `---
Destino: ${r.title}
Ubicación: ${[r.region, r.pais].filter(Boolean).join(', ')}
Profundidad: ${r.profMin != null && r.profMax != null ? `${r.profMin}-${r.profMax} m` : 'N/D'}
Visibilidad: ${r.vis || 'N/D'}
Temperatura del agua: ${r.tMin != null && r.tMax != null ? `${r.tMin}-${r.tMax} °C` : 'N/D'}
Corrientes: ${r.corrientes || 'N/D'}
Mejor época: ${r.temporadaAlta || 'N/D'}
Nivel mínimo: ${r.cert || 'N/D'}
Vida marina: ${r.vida || 'N/D'}
Liveaboards: ${r.liveaboards || 'N/D'}
Precio orientativo: ${r.precio || 'N/D'}
¿Giora ha buceado aquí?: ${r.giora ? 'Sí' : 'No consta'}
Ficha Scubapedia: ${r.body}
`).join('\n');

    // 5. System prompt — Giora buceador
    const systemPrompt = `Eres "Giora", buceador veterano y creador de Scubapedia (la enciclopedia editorial de destinos de buceo de Viajes Scibasku, agencia con licencia CICMA 2283). Llevas más de 20 años organizando liveaboards y viajes de buceo por todo el mundo.

Reglas de tu voz:
- Habla SIEMPRE en primera persona del singular ("yo", "en mi experiencia", "te recomiendo", "pregúntame"). NUNCA hables de Giora en tercera persona.
- Tono directo, honesto y cercano, sin marketing turístico vacío ("paraíso submarino", "experiencia única"): lo detestas.
- Da datos CONCRETOS del contexto: profundidad, visibilidad, temperatura, corrientes, mejor época, nivel mínimo, fauna, precio orientativo.
- Incluye "anti-recomendaciones" cuando toque: si hay corrientes fuertes no aptas para principiantes, si la visibilidad es irregular, si la mejor fauna solo se ve en una temporada concreta, o si un destino no encaja con lo que pide la persona, dilo claro.
- Ten en cuenta el NIVEL del buceador (Open Water, Advanced, etc.) y la época del año si la menciona.
- Apóyate en el conocimiento de Scubapedia de abajo. Si preguntan por un destino fuera de ese contexto, responde con tu experiencia pero aclara que su ficha en Scubapedia está pendiente.
- Para reservar de verdad (liveaboard, ruta, fechas), invita a escribirme por WhatsApp: la agencia (Viajes Scibasku, CICMA 2283) está detrás.
- Respuestas breves y estructuradas, con negritas (**así**) para lo clave. Nada de listas interminables salvo que las pidan.

Conocimiento actual de Scubapedia (destinos relevantes para esta pregunta):
${ctx}
`;

    const apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key de OpenRouter no configurada.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://scubapedia.org',
        'X-Title': 'Scubapedia Chatbot',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.5,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Error de OpenRouter:', errText);
      return new Response(JSON.stringify({ error: 'Error en la llamada al modelo de IA.' }), {
        status: 502, headers: { 'Content-Type': 'application/json' },
      });
    }

    const completion = await response.json();
    const reply = completion.choices?.[0]?.message || { role: 'assistant', content: 'Lo siento, he tenido un problema al procesar tu pregunta. Escríbeme por WhatsApp y te ayudo.' };

    // Fuente + sugerencias derivadas server-side de las fichas que SÍ se usaron
    // (robusto: no depende de que el modelo devuelva JSON).
    const shortTitle = (t: string) => t.replace(/\s*[—(/].*$/, '').trim();
    const usados = selected.map((r) => shortTitle(r.title)).filter(Boolean);
    const fuente = usados.length ? `fichas de ${usados.slice(0, 2).join(' y ')}` : '';

    const sugerencias: string[] = [];
    if (selected.length >= 2) sugerencias.push(`${shortTitle(selected[0].title)} vs ${shortTitle(selected[1].title)}`);
    if (selected[0]) sugerencias.push(`¿Mejor época para ${shortTitle(selected[0].title)}?`);
    sugerencias.push('¿Apto para mi nivel?');

    // --- Mission Control: registrar la conversación (best-effort, nunca rompe el chat) ---
    let mcSessionId: string | null = sessionId || null;
    const MC_URL = process.env.SUPABASE_URL || '';
    const MC_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (MC_URL && MC_KEY) {
      try {
        const h = { apikey: MC_KEY, Authorization: `Bearer ${MC_KEY}`, 'Content-Type': 'application/json' };
        const nowIso = new Date().toISOString();
        if (!mcSessionId) {
          const sRes = await fetch(`${MC_URL}/rest/v1/chat_sessions`, {
            method: 'POST', headers: { ...h, Prefer: 'return=representation' },
            body: JSON.stringify({ wallet_id: 'scubapedia', last_message_at: nowIso }),
          });
          if (sRes.ok) { const rows = await sRes.json(); mcSessionId = rows?.[0]?.id ?? null; }
        }
        if (mcSessionId) {
          await fetch(`${MC_URL}/rest/v1/chat_messages`, {
            method: 'POST', headers: h,
            body: JSON.stringify([
              { session_id: mcSessionId, role: 'user', content: last },
              { session_id: mcSessionId, role: 'assistant', content: reply.content },
            ]),
          });
          await fetch(`${MC_URL}/rest/v1/chat_sessions?id=eq.${mcSessionId}`, {
            method: 'PATCH', headers: h, body: JSON.stringify({ last_message_at: nowIso }),
          });
        }
      } catch (e) { console.error('MC log error:', e); }
    }

    return new Response(
      JSON.stringify({ role: reply.role || 'assistant', content: reply.content, fuente, sugerencias: sugerencias.slice(0, 3), sessionId: mcSessionId }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Error en /api/chat:', err);
    return new Response(JSON.stringify({ error: 'Error interno en el servidor.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
