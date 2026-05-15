---
title: "SOP — Ficha de Destino Scubapedia"
version: 1.0
updated: 2026-05-15
applies_to: "src/content/buceo/*.md (collection 'buceo')"
status: vigente
---

# SOP — Ficha de Destino Scubapedia

Checklist binaria verificable por agente. Cada item: **condición → cómo verificar → comando si aplica**. Cero contenido inventado en este SOP — todo destilado de fuentes existentes citadas en cada bloque.

**Cuándo aplicar:** antes de pasar una ficha de `status: draft` a `status: review`, y antes de cualquier reescritura editorial.

**Verificación final agregada:** `cd ~/Desktop/SCIBASKU-WORKSPACE/_dev/scubapedia && npx astro check && npx astro build` (no existe `npm run check` separado en este repo — `astro build` valida content collections + Zod + remark wikilinks).

---

## Bloque A — Frontmatter Zod válido

Fuente: `src/content.config.ts` (collection `buceo`) + `~/projects/scibasku-knowledge/SCHEMA.md`.

| # | Condición | Cómo verificar | Comando |
|---|---|---|---|
| A1 | `title: string` no vacío | grep frontmatter | `grep -E '^title:' <ficha>` |
| A2 | `type: "destino-buceo"` (default OK) | grep | `grep -E '^type:' <ficha>` |
| A3 | `region: string` no vacío | grep | `grep -E '^region:' <ficha>` |
| A4 | `pais: string` no vacío | grep | `grep -E '^pais:' <ficha>` |
| A5 | `puntos_inmersion_principales` array ≥3 items | YAML parse | `yq '.puntos_inmersion_principales \| length' <ficha>` |
| A6 | `profundidad_min` y `profundidad_max` numéricos coherentes (max>min) | parse | `yq '.profundidad_max > .profundidad_min' <ficha>` |
| A7 | `visibilidad_media` string con rango en metros | grep | `grep -E 'visibilidad_media:.*m' <ficha>` |
| A8 | `temperatura_agua_min` / `_max` numéricos | parse (Zod coerce a number) | manual |
| A9 | `corrientes` string descriptivo no vacío | grep | `grep -E '^corrientes:' <ficha>` |
| A10 | `temporada_alta` y `temporada_baja` string/array no vacíos | grep | `grep -E '^temporada_(alta\|baja):' <ficha>` |
| A11 | `certificacion_minima` string (default `OW`) | grep | `grep -E '^certificacion_minima:' <ficha>` |
| A12 | `vida_marina_destacada` array ≥4 items | parse | `yq '.vida_marina_destacada \| length' <ficha>` |
| A13 | `liveaboards_disponibles` y/o `centros_buceo_recomendados` arrays con ≥1 item entre los dos | parse | manual |
| A14 | `precio_semana_aprox` string con rango €/USD (NO usar `precio_inmersion_aprox` — campo legacy passthrough) | grep | `grep -E 'precio_(semana\|inmersion)_aprox:' <ficha>` |
| A15 | `giora_estuvo: boolean` explícito | grep | `grep -E '^giora_estuvo:' <ficha>` |
| A16 | `updated: YYYY-MM-DD` actualizado al editar | grep | `grep -E '^updated:' <ficha>` |
| A17 | `status:` ∈ `{draft, review, published}` | grep | `grep -E '^status:' <ficha>` |
| A18 | `tags:` array ≥3 items con kebab-case | parse | `yq '.tags \| length' <ficha>` |

**Comprobación agregada:** `npx astro check` no debe reportar errores Zod sobre la ficha.

---

## Bloque B — Estructura de secciones obligatorias

Fuente: `~/projects/scibasku-knowledge/templates/destino-buceo.md`. Toda ficha debe contener estos `##` en este orden y con los mínimos indicados.

| # | Sección | Mínimo | Cómo verificar |
|---|---|---|---|
| B1 | `## Resumen` | 1 párrafo, 80–180 palabras, qué hace único el destino | conteo manual |
| B2 | `## Datos técnicos` | tabla markdown con ≥6 filas (profundidad, visibilidad, temp, corrientes, cert, temporada) | `grep -A 15 '^## Datos técnicos' <ficha>` |
| B3 | `## Puntos de inmersión destacados` | ≥3 puntos con descripción de ≥40 palabras cada uno | parse |
| B4 | `## Vida marina` | 1 párrafo o lista con nombres científicos en *cursiva* para especies clave | `grep -E '\*[A-Z][a-z]+ [a-z]+\*' <ficha>` |
| B5 | `## Liveaboards` (o `## Centros de buceo` si no aplica liveaboard) | ≥1 párrafo con operadores reales nombrados | manual |
| B6 | `## Mejor época para ir` | desglose por meses/temporadas | manual |
| B7 | `## Cómo llegar` | aeropuerto IATA, conexión típica desde España, visado UE | manual |
| B8 | `## Nivel requerido` | certificación + experiencia recomendada + tipo de corriente | manual |
| B9 | `## Consejo Scibasku` | **PROHIBIDO copiar literal entre fichas** (ver C7). Si `giora_estuvo: false`, contenido orientativo SIN voz primera persona | grep + diff entre fichas |
| B10 | `## Fichas relacionadas` | ≥3 wikilinks `[[slug]]` válidos (ver D) | `grep -oE '\[\[[a-z0-9-]+\]\]' <ficha>` |

---

## Bloque C — Voz editorial

Fuente: `~/conductor/workspaces/Scibasku General/saskatoon/CLAUDE.md` § 7b, 7b-ii, 7b-iii, 7b-iv. Checklist binaria — cada item ✅/❌.

### C-pri — 8 principios de tono (§ 7b)

- [ ] **C1 Primera persona real**: si `giora_estuvo: true` o flag `voz_dramatizada: true`, hay ≥1 frase 1ª persona ("Llevo…", "Hubo un viaje…"). Si NO, no hay 1ª persona inventada.
- [ ] **C2 Preguntas directas al lector**: ≥1 pregunta del tipo "¿Te van X o prefieres Y?".
- [ ] **C3 Posición clara, sin disculparse**: ≥1 afirmación que filtra ("No es para X / no vayas si Y").
- [ ] **C4 Experiencia vivida, no catálogo**: descripciones sensoriales > descripciones de producto. Caso de fallo: "ofrece magníficas pistas/inmersiones".
- [ ] **C5 Segmentación natural por tipo de viajero**: ≥1 mención que distingue perfiles ("buceador macro vs. pelágico", "OW de iniciación vs. AOWD con corriente").
- [ ] **C6 Calidez sin cursilería**: emoción presente, sin frases artificiosas tipo "magia bajo el mar".
- [ ] **C7 Agua del japonés**: el texto fluye, no está fragmentado en bloques rígidos. Cada párrafo enlaza con el siguiente.
- [ ] **C8 Poder del ahora**: verbos en presente, sensaciones físicas ("la corriente te empuja", "el agua a 22°C cala").

**Regla de mezcla obligatoria:** los principios deben ir mezclados en un mismo apartado, NUNCA segregados en bloques temáticos.

### C-rul — 12 reglas Home Reloaded (§ 7b-ii)

- [ ] **C-R1 Frases cortas que golpean** (max 15 palabras en momentos clave) — ≥3 frases de este tipo en la ficha.
- [ ] **C-R2 Comparaciones fuera del turismo** (música/comida/deporte/relaciones) — **mínimo 2 por texto**. NUNCA "como otros destinos del Pacífico".
- [ ] **C-R3 Contrastes binarios para cerrar** (`[A] no [X]. [Y].`) — ≥1 al cierre de cada sección importante.
- [ ] **C-R4 Humor desde la honestidad** — sin emojis decorativos, sin "¡prepárate para la aventura!".
- [ ] **C-R5 Anti-corporativo radical** — cero hits blacklist (ver C-bl).
- [ ] **C-R6 Tú eres el sujeto** — frases tipo "esquías/buceas mejor porque…" > "el destino ofrece…".
- [ ] **C-R7 Anti-recomendaciones** — **mínimo 1 por destino**: "no vayas si…", "no es tu sitio cuando…".
- [ ] **C-R8 Cierre poético sin CTA comercial** — la última frase de la ficha debe poder tatuarse. **PROHIBIDO** "contáctanos", "reserva ahora", "escríbeme y lo vemos". El bloque `## Consejo Scibasku` actual con CTA mailto incumple esta regla.
- [ ] **C-R9 Ritmo musical** — alternar longitudes. NUNCA 3 frases seguidas de igual longitud.
- [ ] **C-R10 Emojis funcionales** — solo iconos de sección (❄️ 🏔 🌊), NUNCA dentro de texto narrativo, max 1 por sección.
- [ ] **C-R11 Títulos editoriales** — secciones con personalidad, no etiquetas corporativas. (Aplica a `##` opcionales.)
- [ ] **C-R12 Experiencia personal de Giora** — si hay material real, incluir 1ª persona; si no hay → NO inventar (ver memoria `feedback_voz_dramatizada_seo.md`).

**Regla extra Anti-muletilla:** **PROHIBIDO** repetir la misma frase de cierre entre fichas. Verificar con `grep -F "<frase>" src/content/buceo/*.md | wc -l` → debe ser 1.

### C-bl — Blacklist (§ 7b-iii) — cero hits

```bash
grep -niE "experiencia (única|inolvidable|premium)|destino excepcional|le ofrecemos|no dude en contactar|amplia gama|a su disposición|exclusiv[oa]|soluciones de viaje|disfrute de" <ficha>
```

| Prohibida | Alternativa § 7b-iii |
|---|---|
| experiencia única/inolvidable | algo que no esperabas sentir |
| destino excepcional | un sitio que te cambia los planes |
| le ofrecemos | esto es lo que hacemos |
| no dude en contactar | dime y lo montamos |
| amplia gama | tenemos lo que necesitas |
| a su disposición | (eliminar) |
| exclusivo | esto no lo encuentra cualquiera |
| experiencia premium | (eliminar — lo premium se demuestra) |
| soluciones de viaje | viajes |
| disfrute de | vas a flipar con |

### C-chk — Checklist pre-publicación § 7b-iv (10 items)

Verificar antes de pasar a `status: review`:

- [ ] ¿Tiene al menos 2 comparaciones fuera del turismo? (C-R2)
- [ ] ¿Cierra con contraste binario o frase poética? (C-R3 / C-R8)
- [ ] ¿Incluye al menos 1 anti-recomendación? (C-R7)
- [ ] ¿El sujeto es TÚ (el viajero), no el destino? (C-R6)
- [ ] ¿Cero palabras de la blacklist? (C-bl)
- [ ] ¿Ritmo variado (no 3 frases iguales seguidas)? (C-R9)
- [ ] ¿Cierre sin CTA comercial? (C-R8)
- [ ] ¿Incluye voz de Giora si `giora_estuvo: true` o flag `voz_dramatizada: true`? (C1, C-R12)
- [ ] ¿Los datos técnicos son reales (con fuente citable, no inventados)? (E1)
- [ ] ¿No repite estructura de cierre de otras fichas? (Anti-muletilla)

---

## Bloque D — Internal linking

Fuente: `src/layouts/FichaLayout.astro` (DEST_MAP), plugin remark custom para wikilinks.

| # | Condición | Cómo verificar |
|---|---|---|
| D1 | ≥3 wikilinks `[[slug]]` válidos en cuerpo + `## Fichas relacionadas` | `grep -oE '\[\[[a-z0-9-]+\]\]' <ficha> \| sort -u \| wc -l` |
| D2 | TODOS los slugs apuntan a fichas existentes en `src/content/buceo/<slug>.md` | bash loop verificación |
| D3 | Diversidad temática: NO los 3 wikilinks deben ser sub-fichas del mismo país (ej: una ficha Maldivas no puede enlazar SOLO a otras Maldivas) | manual |
| D4 | Si la ficha tiene contraparte comercial en DEST_MAP, debe enlazarse al menos una vez | grep DEST_MAP |

**Comando agregado verificación de wikilinks rotos:**
```bash
cd src/content/buceo
for f in *.md; do
  for slug in $(grep -oE '\[\[[a-z0-9-]+\]\]' "$f" | sed 's/\[\[\(.*\)\]\]/\1/' | sort -u); do
    [ -f "${slug}.md" ] || echo "ROTO en $f: [[${slug}]]"
  done
done
```

---

## Bloque E — Datos técnicos verificables (regla F del brief)

Fuente: SCHEMA.md (`raw/` es ground truth para IA), memoria `feedback_nunca_inventar_servicios.md`.

| # | Condición | Cómo verificar |
|---|---|---|
| E1 | Cada dato cuantitativo (profundidad, visibilidad, temp, precio, %, fechas, especies endémicas, récords) debe tener trazabilidad: fuente en `~/projects/scibasku-knowledge/raw/buceo/<destino>/` **O** URL pública verificable citada en `web_referencia` o inline | grep raw/ + URL audit |
| E2 | Nombres científicos en *cursiva* y correctos | `grep -oE '\*[A-Z][a-z]+ [a-z]+\*' <ficha>` |
| E3 | Operadores/liveaboards nombrados deben EXISTIR (verificar web del operador) | manual |
| E4 | Precios indicativos en formato `X.XXX–Y.XXX EUR/USD` con periodo claro (`/semana`, `/inmersión`) | grep formato |
| E5 | Tasas de parque, visados, certificaciones obligatorias citadas: si hay número, fuente debe estar trazable | manual |

**Regla F dura (del brief):** si el destino NO tiene carpeta en `raw/buceo/<destino>/` y NO se puede aportar URL pública verificable para los datos cuantitativos → **la ficha NO puede pasar de `status: draft`** y debe abrirse ticket "ingestar raw" antes de cualquier reescritura.

---

## Bloque F — Anti-inventos

Fuente: memorias `feedback_voz_dramatizada_seo.md`, `feedback_nunca_inventar_servicios.md`, `user_giora_bio.md`.

| # | Regla | Cómo se aplica |
|---|---|---|
| F1 | **Cero datos sin fuente.** Si no está en `raw/` o URL pública citada, no se escribe. | Bloque E |
| F2 | **Cero anécdotas 1ª persona inventadas** salvo flag `voz_dramatizada: true` en frontmatter Y comentario inline con fecha + cita de la confirmación de Giora en sesión. Las aprobaciones NO se acumulan entre sesiones. | grep `voz_dramatizada:` |
| F3 | **Cero servicios "incluidos" sin confirmación con proveedor.** Aplicable a operadores, hoteles, transfers, tasas. Marcar "estimado" o "pendiente confirmar" si no hay confirmación escrita. | manual |
| F4 | **Bio Giora consistente:** 73 años en 2026, casi 60 inviernos en Alpes, primer Alpes a los 13 (campamento Suiza). Si se usa 1ª persona en una ficha de buceo y no es Alpes, debe ser plausible con su perfil de buceador (no inventar "buceé en Socorro en 1995"). | manual |
| F5 | **Trazabilidad de cambios voz dramatizada:** comentario HTML inline `<!-- voz_dramatizada aprobada YYYY-MM-DD por Giora: "<cita literal>" -->` arriba del párrafo afectado. | grep |

---

## Bloque G — Comando de verificación end-to-end

```bash
cd ~/Desktop/SCIBASKU-WORKSPACE/_dev/scubapedia

# 1. Validación schema Zod (Astro content collections)
npx astro check

# 2. Build completo (detecta wikilinks rotos si el plugin remark falla en strict)
npx astro build

# 3. Blacklist agregada
grep -rniE "experiencia (única|inolvidable|premium)|destino excepcional|le ofrecemos|no dude en contactar|amplia gama|a su disposición|exclusiv[oa]|soluciones de viaje|disfrute de" src/content/buceo/

# 4. Wikilinks rotos
cd src/content/buceo
for f in *.md; do
  for slug in $(grep -oE '\[\[[a-z0-9-]+\]\]' "$f" | sed 's/\[\[\(.*\)\]\]/\1/' | sort -u); do
    [ -f "${slug}.md" ] || echo "ROTO en $f: [[${slug}]]"
  done
done

# 5. Anti-muletilla del Consejo Scibasku
grep -F "Puedo armarte un viaje a medida" src/content/buceo/*.md | wc -l
# >1 ⇒ violación Anti-muletilla. Cada Consejo debe ser único.
```

---

## Veredicto

Una ficha pasa el SOP cuando **todos** los items A1–A18, B1–B10, C-pri (8), C-rul (12), C-bl, C-chk (10), D1–D4, E1–E5, F1–F5 están ✅. Cualquier ❌ bloquea ascenso a `status: review`.

Cuando se arranque `/goal` autónomo: la condición de parada es exactamente "todos los items del SOP ✅, `npx astro check && npx astro build` sin errores, reporte explícito ítem por ítem". Bound 6 iteraciones; si tras 6 sigue ❌ persistente, el problema es del SOP o de la falta de `raw/` (regla F), no del modelo.

## Changelog

- 1.0 (2026-05-15) — Versión inicial. Destilada de SCHEMA.md, templates/destino-buceo.md, CLAUDE.md saskatoon § 7/7b/7b-ii/7b-iii/7b-iv, content.config.ts, memorias `feedback_voz_dramatizada_seo`, `feedback_nunca_inventar_servicios`, `user_giora_bio`. Cero contenido inventado.
