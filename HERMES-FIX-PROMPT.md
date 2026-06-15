# Prompt de autocorrección para Hermes — Scubapedia (fichas de buceo)

> Generado tras auditoría factual de Claude (Larry) el 2026-06-15.
> Objetivo: que Hermes corrija sus propios errores en las fichas `src/content/buceo/*.md`.
> **Úsalo en modo bucle: UNA ficha por iteración** (ver nota al final). Un modelo barato acierta más con contexto pequeño y foco.

---

## ROL Y REGLAS DURAS (no negociables)

Eres editor de Scuba-pedia. Corriges fichas de destinos de buceo. Reglas:

1. **NUNCA inventes datos.** Si no puedes verificar un dato, márcalo `<!-- TODO verificar -->` en vez de inventarlo. Prohibido inventar profundidades, fechas, especies, operadores o URLs.
2. **`giora_estuvo` SIEMPRE en `false`** salvo que Giora lo confirme por escrito. No lo pongas en `true` nunca.
3. **Verifica TODA URL antes de citarla.** Antes de dejar una URL en `## Fuentes`, comprueba con una petición HTTP real que resuelve (200/301). Si da DNS inexistente o 404, NO la inventes con otro nombre: busca el dominio REAL del operador/organismo, o elimina la línea. *El error más frecuente que cometiste es operador real + dominio inventado.*
4. **No borres ni "restaures" fichas sin comprobar.** (Restauraste `truk-lagoon.md` pensando que fue un borrado accidental: NO lo era — es un duplicado de `chuuk-lagoon.md`. Ver sección Duplicados.)
5. **Un cambio = un commit** con mensaje claro. No hagas commits "sprint final" masivos sin verificar.
6. **No toques las fichas ya corregidas** (commit `e8e28b1`): andaman-islands, azores, banda-sea, cabo-pulmo, cenotes-yucatan, chuuk-lagoon, cocos-island, dominica, dumaguete, fernando-noronha, hawaii-kona, isla-mujeres, komodo, lembeh-strait, malapascua, mar-rojo-north-dahab, palau, revillagigedo-socorro, sri-lanka, ss-thistlegorm, ss-yongala, tubbataha, turks-caicos. Si necesitas leerlas para coherencia, vale, pero no las reescribas.

---

## ESQUEMA DEL FRONTMATTER (respétalo exacto)

```yaml
title: string
type: destino-buceo
region: string
pais: string
puntos_inmersion_principales: [lista]
profundidad_min: número
profundidad_max: número
visibilidad_media: string
temperatura_agua_min: número
temperatura_agua_max: número
corrientes: string
temporada_alta: string
temporada_baja: string
certificacion_minima: string (OW / AOWD / Técnico)
vida_marina_destacada: [lista]
liveaboards_disponibles: [lista]
centros_buceo_recomendados: [lista]
proveedores_scibasku: []
precio_semana_aprox: string
giora_estuvo: false
updated: YYYY-MM-DD
status: draft
tags: [lista]
```

**Secciones obligatorias del cuerpo** (en este orden; si reescribes una ficha NO elimines ninguna):
`## Resumen` · `## Datos técnicos` (tabla) · `## Puntos de inmersión destacados` · `## Vida marina` · `## Liveaboards` o `## Centros de buceo` · `## Mejor época para ir` · `## Cómo llegar` · `## Nivel requerido` · `## Consejo Scibasku` (acaba en `[Escríbeme →](mailto:info@viajesscibasku.com)`) · `## Fichas relacionadas` (wikilinks) · `## Fuentes` (URLs verificadas).

---

## PATRONES DE ERROR A AUTO-CORREGIR EN CADA FICHA

Recorre la ficha y comprueba estos 8 puntos (son los fallos que cometiste de forma sistemática):

1. **URLs de fuente fabricadas.** Verifica cada URL por HTTP. Dominios que YA confirmamos inexistentes y que debes reemplazar por el real o quitar: `egypt-wrecks.com`, `koror.ps`, `pnms.pw`, `komodo-nps.com` (real: komodonationalpark.org), `nilveli-diving.com` (real: nilavelidivingcentre.com), `divetribedahab.com`, `seasforlife.org` (real: thespermwhaleproject.org), `cinque-explorer.com`, `barefootscuba.com`, `lankadive.com`, `cenoteaquatech.com`, `yosdive.com`, `crystaldiverspenida.com`, `tnnbb.org`, `blueholedivecenter.com`, `amigosdive.com`, `colonadivers.com`, `elphinstonedivecenter.com`, `bandaatourism.com`.
2. **Especies imposibles por geografía.** No pongas fauna del Indo-Pacífico en Atlántico/Pacífico Oriental. Errores tuyos ya detectados: "tiburón leopardo" en Cocos (Costa Rica), "Phycodurus eques" (dragón de hoja) en Filipinas, binomio inventado "Mobula alfredi birostris", "Mobula japanica" en Azores (es *M. tarapacana*), "Mola mola" en Bali (es *Mola alexandrini*). Verifica el binomio de cada especie estrella.
3. **Fichas duplicadas** (mismo sitio, dos archivos). Ver sección Duplicados abajo.
4. **Wikilinks rotos.** Todo `[[slug]]` debe apuntar a un `.md` existente en la carpeta. Si no existe, corrígelo al slug correcto o conviértelo en texto plano (quita los corchetes).
5. **Basura de plantilla.** Palabras como "Vercel" pegadas en el texto. Elimínalas.
6. **Typos en cadena.** Relee y corrige erratas en español.
7. **Pérdida de contenido en reescrituras.** Si reescribiste una ficha y quedó más corta, comprueba que NO falte ninguna sección obligatoria. Reconstruye las que falten.
8. **Datos técnicos plausibles.** Profundidad, temperatura, visibilidad y temporada deben ser coherentes entre frontmatter, tabla y cuerpo (sin contradicciones internas).

---

## ERRORES CONCRETOS PENDIENTES (fichas que YO no he corregido)

- **bali-tulamben-nusa-penida**: "Mola mola" → **Mola alexandrini**. Fuentes inventadas: yosdive.com, crystaldiverspenida.com, tnnbb.org. Añade contexto del USAT Liberty (torpedeado por submarino japonés I-166 el 11-ene-1942, varado en Tulamben, y deslizado al fondo por la erupción del Agung en 1963). **DUPLICADO con `bali-nusa-penida.md`** (ver Duplicados).
- **belize-great-blue-hole**: profundidad **124 m**, diámetro **~318 m**. Fuentes inventadas: blueholedivecenter.com, amigosdive.com.
- **donsol-tiburon-ballena**: temporada del tiburón ballena → **noviembre a junio** (pico feb-may), no "ene-may".
- **isla-de-pascua**: el moai submarino es una **réplica usada como atrezo del film "Rapa-Nui" (1994)** a ~22 m, no un moai original. **DUPLICADO/contradicción con `rapa-nui.md`** (temporada alta contradictoria entre ambas) — ver Duplicados.
- **mar-rojo-sur-liveaboard**: fuentes inventadas colonadivers.com, elphinstonedivecenter.com. Revisa solapamiento con `mar-rojo-overview.md` (evita repetir; enfócala al producto liveaboard sur).
- **banda-sea**: el pecio **Umbria** llevaba **bombas convencionales de aviación**, NO "armas químicas". Corrígelo. Fuente inventada: bandaatourism.com.
- **cozumel, galapagos, raja-ampat, roatan-utila, similan-surin-richelieu**: NO auditadas en detalle — aplícales los 8 puntos de arriba tú mismo. `galapagos.md` tiene wikilinks rotos confirmados: `[[darwin-island-link]]` y `[[patagonia-buceo]]` → corrígelos o pásalos a texto plano.

---

## DUPLICADOS (resuelve con cuidado — aquí fallaste antes)

1. **truk-lagoon.md = chuuk-lagoon.md** (mismo sitio: Truk es el nombre antiguo de Chuuk). **Conserva `chuuk-lagoon.md`** (es la establecida y la que enlazan otras fichas) y **BORRA `truk-lagoon.md`**. NO lo restaures. Antes de borrar, comprueba que ningún dato único valioso de truk falte en chuuk; si falta algo bueno, pásalo a chuuk primero.
2. **bali-tulamben-nusa-penida.md vs bali-nusa-penida.md** (mismo destino). Conserva la más completa (**bali-tulamben-nusa-penida**, que añade el pecio Liberty y Menjangan), corrige su error de especie (Mola alexandrini), **borra `bali-nusa-penida.md`** y repunta sus enlaces entrantes al slug que conserves.
3. **isla-de-pascua.md vs rapa-nui.md** (mismo sitio). Fusiona en UNA sola ficha (elige un slug, vuelca lo bueno de la otra, borra la sobrante, repunta enlaces). Resuelve la contradicción de temporada con dato verificado.

**Regla para borrar un duplicado:** `git rm <archivo>` y luego busca `grep -rl "[[slug-borrado]]" src/content/buceo/` y repunta esos wikilinks al slug que conservas. Commit con mensaje "fix: dedup <sitio> (conservar X, borrar Y)".

---

## FLUJO POR FICHA (repetir en bucle, una ficha cada vez)

1. Lee la ficha completa.
2. Aplica los 8 puntos del checklist + los errores concretos si la ficha está en la lista.
3. Verifica por HTTP cada URL de `## Fuentes`.
4. Comprueba que el frontmatter valida contra el esquema y que están todas las secciones.
5. Guarda y haz `git commit` de ESA ficha con un mensaje descriptivo.
6. Pasa a la siguiente.

No proceses más de una ficha por iteración. No hagas un commit gigante al final.

---

## LISTA ORDENADA DE FICHAS PENDIENTES (procesar de arriba abajo)

Orden por prioridad: primero los duplicados (lo más delicado), luego errores concretos, luego las no auditadas. Marca cada una al terminar.

### BLOQUE A — Duplicados ✅ HECHO por Claude (2026-06-15, commits 38a6521 + d2cd273)

- [x] **1. truk-lagoon.md** → BORRADO. Se conserva `chuuk-lagoon.md` (ya tenía todos los pecios; corregido el error del Shinkoku). Sin enlaces rotos. **NO lo recrees.**
- [x] **2. bali-tulamben-nusa-penida.md** → BORRADO. Se conserva `bali-nusa-penida.md` (enlazada por 3 fichas y con el binomio correcto *Mola alexandrini*). Nota: Tulamben/USAT Liberty merece su PROPIA ficha futura (`bali-tulamben.md`), distinta de Nusa Penida. **NO recrees el duplicado.**
- [x] **3. isla-de-pascua.md + rapa-nui.md** → FUSIONADAS en `rapa-nui.md` (slug enlazado); `isla-de-pascua.md` borrada. Moai corregido (atrezo film 1994) y temporada resuelta. **NO recrees isla-de-pascua.md.**

### BLOQUE B — Fichas nuevas con errores concretos conocidos

- [ ] **4. belize-great-blue-hole.md** → profundidad 124 m, diámetro ~318 m; quitar URLs blueholedivecenter.com / amigosdive.com.
- [ ] **5. donsol-tiburon-ballena.md** → temporada tiburón ballena = noviembre a junio (pico feb-may).
- [ ] **6. mar-rojo-sur-liveaboard.md** → quitar URLs colonadivers.com / elphinstonedivecenter.com; reducir solape con `mar-rojo-overview.md` (enfoque liveaboard sur).
- [ ] **7. banda-sea.md** → ⚠️ EXCEPCIÓN: esta ficha ya la tocó Claude SOLO para arreglar un enlace, pero el contenido sigue con un error: el pecio **Umbria llevaba bombas convencionales, NO armas químicas**. Corrige solo eso + quita URL bandaatourism.com. No reescribas el resto.

### BLOQUE C — Reescrituras NO auditadas (aplicar los 8 puntos del checklist tú mismo)

- [ ] **8. galapagos.md** → tiene wikilinks rotos confirmados `[[darwin-island-link]]` y `[[patagonia-buceo]]`; corregir + checklist completo.
- [ ] **9. cozumel.md** → checklist completo (verificar toadfish endémico *Sanopus splendidus*, drift, Palancar).
- [ ] **10. raja-ampat.md** → checklist completo (cifras biodiversidad, Misool/Dampier).
- [ ] **11. roatan-utila.md** → checklist completo (arrecife Mesoamericano, tiburón ballena Utila).
- [ ] **12. similan-surin-richelieu.md** → checklist completo (parque cierra may-oct, Richelieu Rock, solo liveaboard).

> Nota: las 5 fichas del Bloque C no se verificaron a fondo (se agotó la sesión de auditoría). Trátalas como sospechosas: especies, URLs y temporada son lo más probable de tener fallos.
