# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Buceador hispanohablante, titulado (Open Water a Advanced/Tec), que planifica su próximo viaje de buceo con meses de antelación. Llega por búsqueda en Google o citado por un asistente de IA, casi siempre con una pregunta concreta en la cabeza: dónde ver una fauna determinada, en qué mes, con qué nivel se puede bucear ahí, si la corriente le va a superar. Segundo público: el buceador que ya tiene destino y quiere contrastar antes de pagar.

## Product Purpose

Enciclopedia editorial de destinos de buceo en castellano. 122 fichas de destino publicadas y revisadas, agrupadas en 14 zonas del Mar Rojo al Pacífico. Cada ficha responde lo que decide una inmersión —mejor época, fauna, visibilidad, corriente, profundidad, nivel exigido, tipo de buceo (arrecife, pecio, muck, pelágicos)— y se contrasta contra fuentes oficiales antes de publicarse. Éxito = el visitante entra con una duda, sale con un destino entendido y una ficha leída de arriba abajo. Objetivo confirmado por el dueño (29-ago-2026): **que encuentre su destino**; la captación comercial es consecuencia, no el trabajo principal de la portada.

## Positioning

Ningún competidor puede copiar dos cosas a la vez: (1) las fichas se escriben desde la experiencia de una agencia que lleva más de 20 años fletando liveaboards —13 de los 122 destinos están buceados por el propio Giora y así se marcan—, y (2) no hay comisión escondida decidiendo qué destino sale destacado. El resto del sector en castellano es folleto de operador o foro sin revisar. Frase de la casa: «datos verificables, sin marketing vacío».

## Capabilities

- Buscador de destinos en la portada (filtra sobre las 122 fichas: destino, mar, país, especie).
- Índice por zonas (14 mares y océanos) y mapa de destinos.
- Fichas de destino con datos clave estructurados (mejor época, temperatura, visibilidad, nivel, fauna).
- Glosario de conceptos de buceo.
- Asistente de chat «Pregúntale a Giora» que responde citando las fichas.
- Formulario de captación de presupuesto con consentimiento RGPD, presente en las 122 fichas.
- Salida a CruceroBuceo (marca de venta de liveaboards) para quien quiere reservar.

## Constraints

- Todo en castellano de España.
- Astro + despliegue en Vercel. Repo `~/projects/scubapedia`.
- GEO/AEO es requisito, no adorno: la web existe también para ser citada por ChatGPT, Perplexity y Google AI Overviews. Hay `llms.txt`, sitemap y schema; el HTML tiene que seguir siendo legible por máquinas.
- Imágenes servidas por Cloudinary en plan gratuito: siempre con `f_auto,q_auto,w_`. Nada de galerías pesadas sin transformar.
- Páginas legales publicadas (aviso legal, privacidad, cookies) y consentimiento RGPD en cualquier formulario.
- Prohibido inventar datos: nombres, fechas, precios, cifras de fauna o localizadores. Si no hay fuente, no se publica.
- Prohibido publicar testimonios o reseñas fabricadas.

## Evidence and assets

- Cifras vivas (verificadas en la web en producción el 29-ago-2026): 122 destinos documentados, 14 zonas, 13 buceados por Giora. Est. 2026.
- Fotografía real de arrecife propia y de banco comprado (Adobe Stock); prohibidos los bancos gratuitos.
- Marca detrás: Viajes Scibasku, agencia con licencia CICMA 2283. Marca de venta: CruceroBuceo.
- Familia editorial: SkiPedia (nieve) es la web hermana con la misma arquitectura.

## Brand commitments

- El nombre Scubapedia y las cifras de fichas no se tocan.
- Tono editorial sin venta agresiva: se informa, no se vende.
- El dueño autorizó el 29-ago-2026 reemplazar por completo el mundo visual actual (color, tipografía, retícula, logotipo incluido): «borrón y cuenta nueva», «es muy sosa». No hay ningún elemento visual heredado con derecho de veto.

## Open decisions

- Si el rediseño se lleva también a SkiPedia (web hermana) o Scubapedia va por libre.
- Si el wordmark actual sobrevive como logotipo o se rehace dentro del mundo visual elegido.
