---
title: "Auditoría BOFU vs SOP v1.0 — 6 fichas BOFU + Mar Rojo overview"
fecha: 2026-05-15
sop: SOP-ficha-destino.md
auditor: agente Claude (sesión dubai)
alcance: Socorro · Maldivas (9 sub-fichas) · Raja Ampat · Komodo · Galápagos · Mar Rojo Sur
---

# Auditoría BOFU vs SOP v1.0

Tabla comparativa de las 6 fichas BOFU del brief original (Socorro + 5 BOFU de Fase 3) contra el SOP v1.0. Análisis de muestreo profundo en 7 fichas (Socorro + Galápagos + Raja Ampat + Komodo + Maldivas-South-Ari + Sudán-Mar-Rojo + Mar-Rojo-Overview), extrapolado al resto con notas de divergencia.

**Convención:** ✅ pasa · ⚠ pasa con reparos · ❌ falla · 🚫 bloqueante de promoción a `status: review`.

---

## Resumen ejecutivo

| Destino | Frontmatter | Secciones | Voz § 7b | Wikilinks | Datos verif. | Status actual | Veredicto |
|---|---|---|---|---|---|---|---|
| **Socorro** (revillagigedo-socorro) | ✅ | ✅ excepto B9 | ❌ Home Reloaded sin aplicar | ✅ 3/3 válidos | 🚫 sin raw | draft | 🚫 BLOQUEADA |
| **Maldivas** (9 sub-fichas, ver detalle) | ✅ | ✅ | ❌ patrón sistémico | ⚠ circulares (solo entre maldivas-*) | 🚫 sin raw | draft | 🚫 BLOQUEADA |
| **Raja Ampat** | ✅ legacy passthrough | ✅ | ❌ patrón sistémico (mejor escrita que media) | 🚫 3 wikilinks rotos de 4 | ⚠ Conservation Int. citado en texto, sin URL frontmatter | draft | 🚫 BLOQUEADA por D2 + F1 |
| **Komodo** | ✅ | ✅ excepto B9 | ❌ patrón sistémico | ✅ 3/3 válidos | 🚫 sin raw | draft | 🚫 BLOQUEADA |
| **Galápagos** | ✅ | ✅ excepto B9 | ❌ patrón sistémico | ✅ 3/3 válidos | 🚫 sin raw | draft | 🚫 BLOQUEADA |
| **Mar Rojo Sur** (no existe ficha unitaria) | — | — | — | — | — | — | 🚫 NO EXISTE — ver nota |

**Cero fichas pasan el SOP** sin trabajo previo. Ninguna está lista para `/goal` autónomo en su estado actual.

---

## Detalle por destino

### 1. Socorro — `revillagigedo-socorro.md`

Auditoría completa en `docs/audit-socorro-vs-sop.md`. Resumen:

- **Bloqueos duros:** F1/E1 (sin raw ni URLs verificables) + C-R8 + Anti-muletilla (Consejo Scibasku copiado literal en 4+ fichas).
- **Lo que sí cumple:** frontmatter completo, estructura, datos técnicos coherentes, wikilinks válidos diversos, blacklist limpia.
- **Esfuerzo estimado para pasar SOP:** 1) ingestar raw (1–2h), 2) reescribir `## Consejo Scibasku` único (15 min), 3) reescritura editorial Home Reloaded de 8 reglas (~2–3h).

### 2. Maldivas — 9 sub-fichas

Inventario en `src/content/buceo/`:

| Slug | Wordcount aprox. | Notas |
|---|---|---|
| `maldivas-addu` | — | sub-atolón sur extremo |
| `maldivas-atolones-norte` | — | hub regional |
| `maldivas-baa-hanifaru` | — | mantas / Hanifaru Bay |
| `maldivas-fuvahmulah` | — | tiger sharks |
| `maldivas-huvadhoo` | — | sur, menos masificado |
| `maldivas-lhaviyani` | — | norte, accesible OW |
| `maldivas-north-ari` | — | thilas legendarios |
| `maldivas-south-ari` | 834 | leída — tiburón ballena |
| `maldivas-south-male` | — | canales tiburones grises |

**Muestreo (South Ari):**
- Frontmatter: ✅ completo, schema válido.
- Secciones: ✅ las 10, B9 con Consejo Scibasku copiado literal (igual fallo que Socorro/Galápagos/Komodo).
- Voz: ❌ patrón "ficha de catálogo bien escrita" — sin frases cortas que golpean, sin comparaciones extra-turismo, sin anti-recomendaciones, sin contraste binario.
- Wikilinks: ⚠ 3 válidos (`[[maldivas-north-ari]]`, `[[maldivas-south-male]]`, `[[maldivas-baa-hanifaru]]`) pero **viola D3 — todos son sub-fichas Maldivas**, sin diversidad temática.
- Datos: 🚫 sin raw `raw/buceo/maldivas/`. Datos técnicos coherentes pero sin trazabilidad.
- Status: `draft`.

**Patrón Maldivas (extrapolado):** todas las 9 sub-fichas comparten:
- Estructura del template (probablemente todas con el mismo `## Consejo Scibasku` literal).
- Riesgo D3 (wikilinks circulares maldivas-* entre sí).
- Falta raw común para Maldivas en `~/projects/scibasku-knowledge/raw/buceo/`.

**Recomendación:** auditoría completa de las 9 con un solo loop (todas comparten gaps) cuando se ingrese raw/buceo/maldivas/. La existencia de `maldivas-atolones-norte` sugiere que ya se ha intentado un hub — verificar si funciona como `maldivas-overview` antes de duplicar.

### 3. Raja Ampat — `raja-ampat.md`

- **Frontmatter:** ✅ con campos legacy (`precio_inmersion_aprox`, `web_referencia`) que pasan por `.passthrough()`. Recomendable migrar a `precio_semana_aprox` para consistencia con resto.
- **Secciones:** ✅ las 10 + sub-secciones por zona (Dampier / Misool / Wayag / Arborek). Resumen sólido (~165 palabras), tabla técnica con 8 filas.
- **Voz:** ❌ patrón sistémico, pero la mejor escrita del grupo. Tiene texto evocador en Resumen ("biodiversidad más rica del planeta"), una dato-récord con cita ("Dr. Gerald Allen, Conservation International, 2012"), y un cierre que no es CTA mailto sino consejo logístico. **Único caso donde Consejo Scibasku NO es copia literal.** Aun así, sigue faltando: contraste binario, anti-recomendación, frases cortas, ritmo musical.
- **Wikilinks:** 🚫 **CRÍTICO. 3 de 4 wikilinks ROTOS:**
  - `[[mar-rojo-norte]]` → no existe ficha (existe `mar-rojo-overview`, `sudan-mar-rojo`, `ras-mohammed`, `dahab`, `sharm-el-sheikh`, `hurghada`, etc.)
  - `[[maldivas]]` → no existe ficha unitaria (hay 9 maldivas-*)
  - `[[liveaboard-emperor]]` → no existe ficha
  - `[[komodo]]` → ✅ válido
- **Datos:** ⚠ Conservation International citada inline (récord 374 especies Cape Kri 2012), pero sin URL en `web_referencia` (existe `web_referencia: "https://www.stayrajaampat.com"` pero apunta a portal turístico, no a la fuente del récord). Tasa parque marino 1.500.000 IDR sin URL oficial.
- **Status:** `draft`.

**Bloqueos:** D2 (3 wikilinks rotos) + F1 (raw ausente). El gap de wikilinks es el más urgente — son 3 enlaces rotos en una página de salida, mal SEO interno y mal UX.

### 4. Komodo — `komodo.md`

- **Frontmatter:** ✅ completo.
- **Secciones:** ✅ las 10. B9 falla (Consejo Scibasku idéntico literal a Socorro/Galápagos/Maldivas-South-Ari).
- **Voz:** ❌ patrón sistémico. Resumen menciona UNESCO 1991 (verificable) y compara Batu Bolong como "metro cuadrado más productivo del Índico" (afirmación fuerte sin fuente). Sin frases cortas que golpean, sin contraste binario, sin anti-recomendación, sin sujeto=tú.
- **Wikilinks:** ✅ 3 válidos y diversos: `[[raja-ampat]]`, `[[bali-nusa-penida]]`, `[[alor]]` (3 destinos Indonesia distintos, OK).
- **Datos:** 🚫 sin raw `raw/buceo/komodo/`. Liveaboards mencionados de forma genérica ("Múltiples operadores 4-10 noches desde Labuan Bajo") — viola E3.
- **Status:** `draft`.

**Bloqueos:** F1 (sin raw) + B9 (Consejo Scibasku copiado) + E3 (liveaboards no nombrados específicamente).

### 5. Galápagos — `galapagos.md`

- **Frontmatter:** ✅ completo.
- **Secciones:** ✅ las 10. B9 falla (Consejo Scibasku idéntico literal).
- **Voz:** ❌ patrón sistémico. Tiene 1 frase corta de cierre ("Si te preguntas si merece el precio — lo merece") que apunta hacia C-R1, pero solo 1. Resumen abre con "no es un destino — es el destino" (intento de contraste binario, débil).
- **Wikilinks:** ✅ 3 válidos y diversos: `[[palau]]`, `[[cocos-island]]`, `[[revillagigedo-socorro]]` (3 destinos pelágicos de oceános distintos).
- **Datos:** 🚫 sin raw `raw/buceo/galapagos/`. Dato concreto "Solo 16 liveaboards tienen permiso del Parque Nacional Galápagos" — verificable público pero sin URL. Precios "6.141€/semana" para Galapagos Master mencionados sin fuente.
- **Status:** `draft`.

**Bloqueos:** F1 + B9 + Anti-muletilla.

### 6. Mar Rojo Sur — NO existe ficha unitaria

**Estado del catálogo:**

| Ficha existente | Cobertura |
|---|---|
| `mar-rojo-overview.md` | Ficha hub completa (1.315 palabras), `giora_estuvo: true`. Cubre las 4 zonas (Sinaí/Hurghada/Marsa Alam/Offshore) y hace de índice |
| `sudan-mar-rojo.md` | Ficha unitaria Sudán (522 palabras, la más corta del grupo) |
| `daedalus-reef.md`, `brother-islands.md`, `elphinstone-reef.md`, `fury-shoals.md`, `st-johns.md` | Reefs offshore individuales (Mar Rojo Sur egipcio) |
| `marsa-alam.md`, `hurghada.md`, `safaga-hurghada-norte.md` | Bases costeras del centro-sur |

**Lo que el brief llama "Mar Rojo Sur" no es un destino comercial unitario** — es:
- (a) Sudán como producto de nicho (existe `sudan-mar-rojo.md`), y/o
- (b) la ruta egipcia BDE (Brothers + Daedalus + Elphinstone) ofrecida desde Hurghada/Port Ghalib en liveaboard.

**Auditoría rápida `sudan-mar-rojo.md`:**
- Frontmatter: ✅ pero `liveaboards_disponibles: ["Pocas flotas especializadas (producto de nicho)"]` — viola E3 (operador no nombrado).
- Secciones: ❌ **5 de 10 secciones FALTAN**: no hay `## Datos técnicos` (tabla), no hay `## Vida marina` (sección), no hay `## Mejor época para ir`, no hay `## Nivel requerido`. La ficha es la más corta del catálogo (522 palabras vs media ~1.150).
- Voz: ❌ patrón sistémico + Consejo Scibasku copiado literal.
- Wikilinks: ⚠ solo 2 (`[[brother-islands]]`, `[[daedalus-reef]]`) — **viola D1 (mínimo 3)**. Ambos válidos.
- Datos: 🚫 sin raw `raw/buceo/sudan/`. Cita Cousteau Conshelf II 1963, Umbria 1940, Sanganeb sin URL.
- Status: `draft`.

**Auditoría rápida `mar-rojo-overview.md`:**
- Es un overview multi-país, no encaja al 100% como ficha de destino unitaria.
- Frontmatter usa `precio_inmersion_aprox` y `web_referencia: cdws.travel` (legacy passthrough OK).
- 13 wikilinks: **3 ROTOS** (`[[brothers-islands]]` debería ser `[[brother-islands]]`, `[[ruta-bde]]`, `[[ruta-deep-south]]` no existen). 10 válidos.
- `giora_estuvo: true` pero la ficha no usa 1ª persona — desperdicia el material biográfico.

**Recomendación Mar Rojo Sur:** dos opciones:
- **(a)** Consolidar `sudan-mar-rojo.md` + 5 reefs offshore en una ficha hub `mar-rojo-sur.md` (BDE + Sudán + St. Johns), tratando los reefs sueltos como sub-secciones. Requiere raw común.
- **(b)** Ampliar `sudan-mar-rojo.md` a estándar SOP completo (sería el primer destino no-existente del brief que se "crea" — pero técnicamente solo expansión).

Antes de decidir: confirmar con Giora si "Mar Rojo Sur" es producto comercial unitario en crucerobuceo.com (verificar `dest-mapping.json` del repo `crucerobuceo-live`).

---

## Hallazgos transversales (afectan a TODAS las 6 fichas)

### H1 — Patrón "Consejo Scibasku" copiado literal

```
> ¿Te encaja este destino pero no quieres pelearte con rutas, barcos y permisos?
> Puedo armarte un viaje a medida —liveaboard o resort— adaptado a tu nivel y experiencia.
> [Escríbeme y lo vemos →](mailto:info@viajesscibasku.com)
```

Detectado idéntico en al menos 4 fichas auditadas. Probable que esté en muchas más. Viola simultáneamente:
- B9 (Consejo Scibasku no debe ser copia literal entre fichas)
- C-R8 (Cierre poético sin CTA — el mailto es CTA)
- Regla extra Anti-muletilla (NUNCA repetir misma frase de cierre)

**Verificación:** `grep -F "Puedo armarte un viaje a medida" src/content/buceo/*.md | wc -l`. Si >1, son fichas a reescribir el bloque (tarea acotada, ~10 min por ficha, sin requerir raw).

### H2 — Falta sistemática de `raw/buceo/<destino>/`

`raw/buceo/` contiene actualmente solo: `Camel-Dive-Imagenes/`, `AllStar-Liveaboards/`, `Liveaboards-Indonesia/`, `Liveaboards-MarRojo/`. **Ninguna carpeta por destino BOFU.**

Los datos técnicos en las fichas son plausibles y coherentes con conocimiento general, pero NO trazables. Esto bloquea F1/E1 universalmente.

### H3 — Patrón editorial "ficha de catálogo"

Las 7 fichas auditadas comparten estructura idéntica del template y un registro descriptivo-académico. **Ninguna aplica método Home Reloaded (12 reglas C-rul).** Esto es un trabajo editorial pendiente que aplica al catálogo entero (102 fichas), no solo a las BOFU.

### H4 — Wikilinks rotos detectados

Inventario provisional (auditado solo en muestreo):

| Wikilink roto | En ficha | Slug correcto sugerido |
|---|---|---|
| `[[mar-rojo-norte]]` | raja-ampat | `[[mar-rojo-overview]]` o `[[ras-mohammed]]` |
| `[[maldivas]]` | raja-ampat | uno específico de las 9 maldivas-* |
| `[[liveaboard-emperor]]` | raja-ampat | (ficha no existe — eliminar o crear) |
| `[[brothers-islands]]` | mar-rojo-overview | `[[brother-islands]]` (singular) |
| `[[ruta-bde]]` | mar-rojo-overview | (ficha no existe — eliminar o crear) |
| `[[ruta-deep-south]]` | mar-rojo-overview | (ficha no existe — eliminar o crear) |

**Acción quick-win:** correr el comando G4 del SOP sobre las 102 fichas y reportar listado completo de wikilinks rotos. Reparación masiva sin raw requerido.

---

## Plan recomendado para arrancar `/goal` de verdad

Fase preparatoria (antes de cualquier `/goal`):

1. **Quick-wins sin raw (sesión 30–60 min):**
   - Auditar wikilinks rotos en las 102 fichas (correr G4 del SOP).
   - Reescribir bloque `## Consejo Scibasku` único por ficha en las 6 BOFU (sin CTA, con cierre tatuable).
   - Refrescar `updated:` en las 6 BOFU.

2. **Ingest raw (sesión por destino, 1–2h cada una):**
   - `raw/buceo/revillagigedo/fuentes.md` para Socorro
   - `raw/buceo/maldivas/fuentes.md` para Maldivas
   - `raw/buceo/raja-ampat/fuentes.md` para Raja Ampat
   - `raw/buceo/komodo/fuentes.md` para Komodo
   - `raw/buceo/galapagos/fuentes.md` para Galápagos
   - `raw/buceo/mar-rojo-sur/fuentes.md` para Mar Rojo Sur (decidir antes alcance — Sudán solo o BDE+Sudán)

3. **Lanzar `/goal` por destino (bound 6 iteraciones):** condición = "todos los items SOP ✅, `npx astro check && npx astro build` sin errores, reporte ítem por ítem PASS". Subagente evaluador independiente verifica.

Sin las dos fases preparatorias, `/goal` quemará tokens en loops irresolubles porque:
- E1/F1 son ❌ por ausencia de información (no por mal trabajo del modelo).
- C-R8 + Anti-muletilla requieren visión de catálogo (un agente trabajando 1 ficha no sabe lo que dicen las otras 5).
