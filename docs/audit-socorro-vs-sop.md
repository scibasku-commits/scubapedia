---
title: "Auditoría — revillagigedo-socorro.md vs SOP v1.0"
fecha: 2026-05-15
ficha: src/content/buceo/revillagigedo-socorro.md
sop: SOP-ficha-destino.md
auditor: agente Claude (sesión dubai)
veredicto_global: BLOQUEADA en `status: draft` por F1 (sin raw) y C-R8 (CTA en Consejo Scibasku) y Anti-muletilla
---

# Auditoría — Socorro / Revillagigedo

Comprobación literal item por item del SOP v1.0 contra la ficha actual `src/content/buceo/revillagigedo-socorro.md` (1.195 palabras, status `draft`, `giora_estuvo: false`).

**Estado actual:** la ficha tiene base sólida en datos técnicos y estructura, pero **3 fallos críticos** la bloquean para subir a `review`. Ninguna reescritura puede levantar el bloqueo principal (F1) sin antes ingestar `raw/buceo/revillagigedo/` con fuentes citables.

---

## Bloque A — Frontmatter Zod (18 items)

| # | Item | Estado | Notas |
|---|---|---|---|
| A1 | `title` no vacío | ✅ | "Revillagigedo / Socorro — Las Mantas Más Grandes del Mundo" |
| A2 | `type: destino-buceo` | ✅ | |
| A3 | `region` no vacío | ✅ | "Pacífico Este" |
| A4 | `pais` no vacío | ✅ | "México" |
| A5 | `puntos_inmersion_principales` ≥3 | ✅ | 4 items (Socorro, Roca Partida, San Benedicto, Clarión) |
| A6 | profundidad coherente | ✅ | 5–40 |
| A7 | visibilidad con metros | ✅ | "15-35m (mejor diciembre–enero)" |
| A8 | temperatura numérica | ✅ | 18–26 |
| A9 | corrientes descriptivo | ✅ | string completo |
| A10 | temporada alta/baja | ✅ | ambas pobladas |
| A11 | certificacion_minima | ✅ | "Advanced Open Water + 50 inmersiones" |
| A12 | vida_marina ≥4 | ✅ | 7 items |
| A13 | liveaboards o centros ≥1 | ⚠ | solo 1 liveaboard (Fun Azul). Aceptable para Revillagigedo (mercado restringido) pero conviene verificar otros operadores con permiso |
| A14 | precio_semana_aprox formato | ✅ | "2.500–4.500 EUR (liveaboard 7 noches, sin vuelos)" |
| A15 | giora_estuvo boolean | ✅ | `false` |
| A16 | updated YYYY-MM-DD | ⚠ | `2026-04-06` — desactualizado (>1 mes). Si se modifica, refrescar |
| A17 | status en {draft,review,published} | ✅ | `draft` |
| A18 | tags ≥3 kebab-case | ✅ | 10 tags válidos |

**Bloque A:** 16/18 ✅, 2 ⚠. No bloquea.

---

## Bloque B — Estructura de secciones (10 items)

| # | Sección | Estado | Notas |
|---|---|---|---|
| B1 | Resumen 80–180 palabras | ✅ | ~165 palabras. Cubre qué hace único el destino |
| B2 | Datos técnicos tabla ≥6 filas | ✅ | 9 filas, completa |
| B3 | Puntos inmersión ≥3 con descripción ≥40 palabras | ✅ | 4 puntos, todos cumplen |
| B4 | Vida marina con nombres científicos | ✅ | *Mobula birostris*, *Megaptera novaeangliae*, *Tursiops truncatus* en cursiva |
| B5 | Liveaboards con operadores reales nombrados | ✅ | Fun Azul / Fun Azul Fleet con specs (38m, 20 pax, 895€) |
| B6 | Mejor época por meses | ✅ | 4 sub-puntos por temporada |
| B7 | Cómo llegar (IATA, conexión, visado) | ✅ | SJD/ZLO, vía MEX/Miami/Houston, visado UE explícito |
| B8 | Nivel requerido | ✅ | AOW + 50 dives, gestión flotabilidad, comparación con Galápagos |
| B9 | Consejo Scibasku no copiado literal | ❌ | **FALLA**. Texto idéntico al de Galápagos, Komodo, Maldivas-South-Ari (CTA mailto repetido literal en 4+ fichas). Viola B9 + C-R8 + Anti-muletilla |
| B10 | Fichas relacionadas ≥3 wikilinks | ✅ | 3 wikilinks: `[[galapagos]]`, `[[cocos-island]]`, `[[coiba-panama]]` |

**Bloque B:** 9/10 ✅, **1 ❌ crítico (B9)**. Bloquea.

---

## Bloque C — Voz editorial

### C-pri (8 principios)

| # | Principio | Estado | Notas |
|---|---|---|---|
| C1 | Primera persona real (si `giora_estuvo: true` o `voz_dramatizada: true`) | N/A ✅ | `giora_estuvo: false`, no hay flag → correctamente sin 1ª persona |
| C2 | Preguntas directas al lector | ⚠ | Solo 1 pregunta en Consejo Scibasku ("¿Te encaja este destino…?") y es CTA, no engagement editorial |
| C3 | Posición clara, sin disculparse | ❌ | No hay frase tipo "no es para X / no vayas si Y" |
| C4 | Experiencia vivida, no catálogo | ⚠ | Mezcla. Resumen tiene texto sensorial ("se aproximan cara a cara"), pero "Cómo llegar" y "Nivel requerido" son catálogo |
| C5 | Segmentación por tipo de viajero | ⚠ | Implícita ("trío Galápagos/Cocos/Socorro" en Nivel), no explícita |
| C6 | Calidez sin cursilería | ✅ | Tono mesurado, sin frases artificiosas |
| C7 | Agua del japonés (fluye) | ⚠ | Bloques bien delimitados pero sin transición orgánica entre secciones |
| C8 | Poder del ahora (presente, sensaciones) | ⚠ | Algunos verbos presentes ("se acercan", "giran alrededor") pero predomina descriptivo distante |

**C-pri:** 1 ✅, 1 N/A ✅, 5 ⚠, **1 ❌**. No bloqueante por sí solo pero patrón de "ficha de catálogo bien escrita" más que "ficha con voz Giora".

### C-rul (12 reglas Home Reloaded)

| # | Regla | Estado | Evidencia |
|---|---|---|---|
| C-R1 | Frases cortas que golpean (≥3) | ❌ | Cero. La ficha es prosa de párrafos largos académicos |
| C-R2 | Comparaciones fuera del turismo (≥2) | ❌ | Cero. Solo comparaciones intra-turismo (Galápagos, Cocos) |
| C-R3 | Contrastes binarios `[A] no [X]. [Y].` | ❌ | Cero |
| C-R4 | Humor desde la honestidad | ❌ | Cero |
| C-R5 | Anti-corporativo (cero blacklist) | ✅ | Verificado por grep — cero hits |
| C-R6 | Tú eres el sujeto | ❌ | El sujeto es siempre el destino o las mantas. Ningún "tú/te/tus" sustantivo |
| C-R7 | Anti-recomendaciones (≥1) | ❌ | Cero. Falta el "no vayas si…" |
| C-R8 | Cierre poético sin CTA | ❌ | Cierre actual = CTA mailto idéntico a otras fichas. Doble fallo |
| C-R9 | Ritmo musical variado | ❌ | Predominan frases largas de 25–45 palabras. Sin variación |
| C-R10 | Emojis funcionales solo en sección | ✅ | Cero emojis (cumple por ausencia) |
| C-R11 | Títulos editoriales con personalidad | ⚠ | El H1 sí ("Las Mantas Más Grandes del Mundo"). Los `##` son etiquetas estándar del template |
| C-R12 | Experiencia personal Giora si hay material | N/A ✅ | No hay material → no se inventa. Correcto |

**C-rul:** 2 ✅, 1 N/A ✅, 1 ⚠, **8 ❌**. Patrón sistémico — la ficha no aplica el método Home Reloaded.

### Anti-muletilla

❌ **CRÍTICO.** El bloque `## Consejo Scibasku` es literal idéntico en `revillagigedo-socorro.md`, `galapagos.md`, `komodo.md`, `maldivas-south-ari.md`. Verificable:
```bash
grep -F "Puedo armarte un viaje a medida —liveaboard o resort—" src/content/buceo/*.md | wc -l
# (resultado esperado: 1; resultado real: 4+)
```

### C-bl (blacklist)

✅ Cero hits. Verificado por grep agregado.

### C-chk (10 items pre-publicación)

| # | Item | Estado |
|---|---|---|
| 1 | ≥2 comparaciones fuera turismo | ❌ |
| 2 | Cierre con contraste binario o frase poética | ❌ |
| 3 | ≥1 anti-recomendación | ❌ |
| 4 | Sujeto es TÚ | ❌ |
| 5 | Cero blacklist | ✅ |
| 6 | Ritmo variado | ❌ |
| 7 | Cierre sin CTA comercial | ❌ |
| 8 | Voz Giora si aplica | N/A ✅ |
| 9 | Datos técnicos reales (con fuente) | ❌ (ver F1) |
| 10 | No repite estructura cierre | ❌ |

**C-chk:** 1 ✅, 1 N/A ✅, **8 ❌**.

---

## Bloque D — Internal linking

| # | Item | Estado | Notas |
|---|---|---|---|
| D1 | ≥3 wikilinks válidos | ✅ | 3 wikilinks en `## Fichas relacionadas` |
| D2 | Todos los slugs apuntan a fichas existentes | ✅ | `[[galapagos]]`, `[[cocos-island]]`, `[[coiba-panama]]` — los 3 verificados con `ls` |
| D3 | Diversidad temática (no todos del mismo país) | ✅ | Ecuador / Costa Rica / Panamá — 3 países distintos |
| D4 | Enlace a contraparte comercial DEST_MAP si existe | ⚠ | Pendiente verificar `src/layouts/FichaLayout.astro` DEST_MAP — si Socorro está mapeado a destino crucerobuceo.com, debería enlazarse |

**Bloque D:** 3 ✅, 1 ⚠. No bloquea.

---

## Bloque E — Datos técnicos verificables

| # | Item | Estado | Notas |
|---|---|---|---|
| E1 | Trazabilidad raw/ o URL pública para datos cuantitativos | ❌ | **NO existe `~/projects/scibasku-knowledge/raw/buceo/revillagigedo/`** ni similares. Ningún `web_referencia` en frontmatter. Datos como "6 metros de envergadura", "12-24h navegación", "Patrimonio UNESCO 2016", "20-35m visibilidad", "decálogo de comportamiento documentado" → sin fuente trazable en el repo. **Esto es el bloqueo principal.** |
| E2 | Nombres científicos en cursiva | ✅ | Correctos |
| E3 | Operadores nombrados existen | ⚠ | Fun Azul Fleet existe (verificar precios actuales con operador) |
| E4 | Precios formato `X.XXX–Y.XXX EUR` con periodo | ✅ | "2.500–4.500 EUR (liveaboard 7 noches, sin vuelos)" |
| E5 | Tasas/visados/certs trazables | ⚠ | "México no requiere visado UE 180 días" — verificable público. Tasa de parque mencionada pero sin cifra ni fuente |

**Bloque E:** 2 ✅, 2 ⚠, **1 ❌ crítico (E1)**. Bloquea.

---

## Bloque F — Anti-inventos

| # | Regla | Estado | Notas |
|---|---|---|---|
| F1 | Cero datos sin fuente | ❌ | Toda la ficha está construida sin trazabilidad raw/ o URL pública. **Bloqueo dura.** |
| F2 | Cero anécdotas 1ª persona inventadas | ✅ | No hay 1ª persona |
| F3 | Cero servicios "incluidos" sin confirmación | ✅ | Fun Azul mencionado como liveaboard real, no como "incluido" |
| F4 | Bio Giora consistente | ✅ | No aplica (no hay 1ª persona) |
| F5 | Trazabilidad voz_dramatizada | N/A ✅ | No hay flag |

**Bloque F:** 4 ✅, 1 N/A ✅, **1 ❌ crítico (F1)**.

---

## Diagnóstico final

**Veredicto: BLOQUEADA en `status: draft`.**

3 categorías de fallo:

1. **Bloqueo dura por F1/E1 (sin raw, sin URLs verificables).** No se puede ascender a `review` ni reescribir sin antes ingestar `raw/buceo/revillagigedo/` con fuentes citables. Acción previa obligatoria: crear `raw/buceo/revillagigedo/fuentes.md` con: web del Parque Nacional Revillagigedo, paper IUCN sobre *Mobula birostris*, página UNESCO World Heritage del archipiélago, datos del CONANP México, precios oficiales de Fun Azul Fleet.

2. **Bloqueo editorial por C-R8 + Anti-muletilla (Consejo Scibasku copiado literal en ≥4 fichas).** Acción: reescribir `## Consejo Scibasku` con cierre específico de Socorro, sin CTA mailto, con frase tatuable. Este fix se puede aplicar SIN raw — el contenido sería opinión genérica del destino, no afirmación de hechos.

3. **Patrón editorial "ficha de catálogo" — método Home Reloaded no aplicado.** 8 reglas C-rul ❌ (frases cortas, comparaciones extra-turismo, contrastes binarios, sujeto=tú, anti-recomendación, ritmo, cierre poético). Resolverlo es trabajo de reescritura editorial completa, posible solo tras E1.

## Lista de gaps específicos a arreglar (cuando se desbloquee F1)

- [ ] Crear `raw/buceo/revillagigedo/fuentes.md` con URLs públicas verificables y citarlas en `web_referencia` del frontmatter
- [ ] Refrescar `updated:` al día de la edición
- [ ] Reescribir `## Consejo Scibasku` único para Socorro, sin CTA, con cierre tatuable
- [ ] Inyectar ≥2 comparaciones fuera del turismo (música/comida/deporte)
- [ ] Añadir ≥1 anti-recomendación explícita
- [ ] Añadir ≥1 contraste binario al cierre de cada sección importante
- [ ] Reescribir Resumen y Vida marina cambiando sujeto: el viajero, no el destino
- [ ] Verificar DEST_MAP en `FichaLayout.astro` — añadir enlace a destino comercial crucerobuceo si aplica
- [ ] Verificar tasa actual del Parque Nacional Revillagigedo y citarla con fuente
