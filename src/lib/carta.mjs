// La carta de la portada: cada sonda es una ficha real.
//
// LA LÓGICA VIVE AQUÍ, en .mjs, por lo mismo que `zonas.mjs`: `node --test` no lee
// TypeScript y la prueba (tests/portada.test.mjs) tiene que comprobar el mismo código
// que sirve la web, no una copia. `carta.ts` solo le pone tipos.
//
// Contrato (DECISION.md 13-nov-2026, §3.4.1):
// - Las coordenadas van en % del campo de carta (0-100 en x y en y).
// - Cada ficha recibe UNA sonda dentro de la caja de su zona, en posición determinista
//   (hash FNV-1a del slug). El número que se pinta es su `profundidad_max`; si es 0 no
//   se inventa nada: se pinta «·».
// - Separación mínima entre sondas: 4,7 % en x o 5,2 % en y (igual que la rama de Codex).
// - Si una ficha no cabe en 40 intentos, se lanza un error y el build se para.

// ---------------------------------------------------------------------------
// Separación y tamaños
// ---------------------------------------------------------------------------
export const SEP_X = 4.7;
export const SEP_Y = 5.2;
export const DIST_MIN = 3.5; // compuerta: ninguna pareja de sondas más cerca que esto
export const INTENTOS = 40;
// Una zona con menos fichas que esto esconde su topónimo a ≤ 1240 px y sus sondas a ≤ 1000 px.
export const ZONA_GRANDE = 7;

// Margen para que el número de la sonda (10-11 px, centrado en su punto) no toque
// el borde de su caja ni el de lo que hay que esquivar.
const PAD_X = 1.4;
const PAD_Y = 1.8;

// ---------------------------------------------------------------------------
// Lo que las sondas tienen que esquivar (en % del campo). El CSS de index.astro
// coloca estas piezas con estos mismos números (`estiloCaja(PIEZAS.x)`).
// ---------------------------------------------------------------------------
export const PIEZAS = {
  // recuadro fotográfico arriba a la derecha: Mar Rojo (foto hero de producción)
  insetMarRojo: { x: 74, y: 4, w: 22, h: 25 },
  // recuadro discontinuo magenta «Acceso solo con vida a bordo» y, dentro, Brother Islands
  ovp: { x: 3, y: 68.5, w: 21, h: 26 },
  insetBrother: { x: 4.5, y: 70.5, w: 18, h: 22 },
  // el aviso va encima del recuadro discontinuo; su ancho real depende de la letra,
  // así que se reserva de sobra
  aviso: { x: 3, y: 64.2, w: 32, h: 4.3 },
  // rosa de los vientos (alto fijo en %, ancho según el campo: se reserva el máximo)
  rosa: { x: 86.5, y: 82.5, w: 11, h: 14 },
};

// ---------------------------------------------------------------------------
// Cajas de zona, diseñadas a mano. Zonas con más fichas → cajas más grandes.
// Las de plataforma (Mar Rojo, Maldivas, Caribe, Mediterráneo) van sobre las bandas
// de agua azulada del SVG (arriba, y < ~30 %; abajo, y > ~75 %); las oceánicas, en
// el papel del centro. `lineas`: el topónimo se parte en dos renglones para no salirse
// de una caja estrecha.
// ---------------------------------------------------------------------------
export const ZONA_BOX = {
  'Caribe':           { x: 0.5,  y: 0.5,  w: 22,   h: 33 },
  'Mediterráneo':     { x: 23,   y: 0.5,  w: 20,   h: 33 },
  'Mar Rojo':         { x: 43.5, y: 0.5,  w: 30,   h: 33 },
  'Pacífico Este':    { x: 0.5,  y: 34,   w: 14,   h: 29,   lineas: 2 },
  'Atlántico':        { x: 15,   y: 34,   w: 15,   h: 29 },
  'Sudáfrica':        { x: 30.5, y: 34,   w: 14.5, h: 26 },
  'Océano Índico':    { x: 45.5, y: 34,   w: 18.5, h: 26,   lineas: 2 },
  'Sudeste Asiático': { x: 64,   y: 34,   w: 35.5, h: 32 },
  'Aguas polares':    { x: 35.5, y: 60.5, w: 23,   h: 15.5 },
  'Maldivas':         { x: 25,   y: 76.5, w: 18.5, h: 23 },
  'Australia':        { x: 44,   y: 76.5, w: 14.5, h: 23 },
  'Pacífico Sur':     { x: 59,   y: 66.5, w: 40.5, h: 13 },
  'Pacífico Central': { x: 59,   y: 80,   w: 27,   h: 19.5 },
};

// Reserva para el topónimo en la esquina superior izquierda de su caja (en % del campo).
// Cuentas (DECISION.md §3.4.1 y medidas del campo):
//   ≥ 1241 px: letra 25 px + «N fichas» ≈ 41 px de alto sobre un campo de ≥ 740 px → 5,5 %;
//              Bodoni Moda cursiva ≈ 11,5 px por carácter sobre ≥ 813 px → 1,41 % por carácter.
//   1001-1240 px: letra 19 px + «N fichas» ≈ 35 px sobre ≥ 580 px → 6 %; ≈ 1,34 % por carácter.
//   ≤ 1000 px: letra 19 px SIN «N fichas» (se oculta) ≈ 22 px sobre 392 px → 5,6 %.
// Se reserva algo más de lo medido (1,5 % por carácter, 6,6 % por renglón). La prueba de
// navegador (criterio 5.13) comprueba que ninguna sonda pisa un topónimo de verdad.
export function reservaToponimo(zona, n) {
  const box = ZONA_BOX[zona];
  const lineas = box?.lineas ?? 1;
  const palabras = zona.split(' ');
  const renglones = lineas === 2 && palabras.length > 1 ? palabras : [zona];
  const chars = Math.max(...renglones.map((r) => r.length), `${n} fichas`.length * 0.62);
  const w = chars * 1.5 + 1;
  const h = renglones.length === 2 ? 11 : 6.6;
  return { x: box.x + 0.4, y: box.y + 0.4, w, h };
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  // FNV-1a solo cambia los bits bajos cuando cambia el último carácter («slug#0»,
  // «slug#1»…): sin esta mezcla final (fmix32 de MurmurHash3) los 40 intentos caían
  // casi en el mismo punto.
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

const dentro = (px, py, r, mx = 0, my = 0) =>
  px >= r.x - mx && px <= r.x + r.w + mx && py >= r.y - my && py <= r.y + r.h + my;

export function solapan(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

// ---------------------------------------------------------------------------
// Huecos: UNA rejilla al tresbolillo para todo el campo, con un temblor fijo (hash) para
// que no parezca papel cuadriculado. Paso 4,8 × 5,3 y temblor ±0,04 → dos huecos
// cualesquiera, aunque sean de cajas vecinas, quedan a ≥ 4,72 % en x o ≥ 5,22 % en y,
// por encima de SEP_X/SEP_Y. Cada caja se queda con los huecos que caen dentro.
// ---------------------------------------------------------------------------
const PASO_X = 4.8;
const PASO_Y = 5.3;
const TEMBLOR = 0.04;
const BORDE = 0.8; // el número de la sonda no toca el borde de su caja

export function huecosDeZona(zona, evitar = []) {
  const box = ZONA_BOX[zona];
  const out = [];
  for (let r = 0; r * PASO_Y <= 100; r++) {
    const off = r % 2 ? PASO_X / 2 : 0;
    for (let c = 0; off + c * PASO_X <= 100; c++) {
      const h = fnv1a(`hueco:${r}:${c}`);
      const x = 1.4 + off + c * PASO_X + ((h & 0xffff) / 0xffff - 0.5) * 2 * TEMBLOR;
      const y = 1.8 + r * PASO_Y + ((h >>> 16) / 0xffff - 0.5) * 2 * TEMBLOR;
      if (x < box.x + BORDE || x > box.x + box.w - BORDE || y < box.y + BORDE || y > box.y + box.h - BORDE) continue;
      if (x > 99 || y > 99) continue;
      if (evitar.some((e) => dentro(x, y, e, PAD_X, PAD_Y))) continue;
      out.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Sondas
// ---------------------------------------------------------------------------
/**
 * @param {Array<{slug:string,title:string,zona:string,prof:number}>} fichas
 * @returns {Array<{slug:string,title:string,zona:string,prof:number,x:number,y:number,grande:boolean}>}
 */
export function sondas(fichas) {
  validarCajas();
  const porZona = new Map();
  for (const f of fichas) {
    if (!ZONA_BOX[f.zona]) throw new Error(`carta: la zona «${f.zona}» (${f.slug}) no tiene caja en ZONA_BOX`);
    if (!porZona.has(f.zona)) porZona.set(f.zona, []);
    porZona.get(f.zona).push(f);
  }
  // Las sondas esquivan las piezas fijas y TODOS los topónimos (un topónimo largo
  // puede asomar sobre la caja vecina).
  const evitar = [
    ...Object.values(PIEZAS),
    ...[...porZona].map(([z, l]) => reservaToponimo(z, l.length)),
  ];
  validarToponimos(new Map([...porZona].map(([z, l]) => [z, l.length])));
  const colocadas = [];
  for (const [zona, lista] of porZona) {
    const box = ZONA_BOX[zona];
    const grande = lista.length >= ZONA_GRANDE;
    const huecos = huecosDeZona(zona, evitar);
    const usados = new Set();
    for (const f of [...lista].sort((a, b) => a.slug.localeCompare(b.slug))) {
      let ok = null;
      for (let k = 0; k < INTENTOS && !ok && huecos.length; k++) {
        // hueco de salida por hash del slug y, si está cogido, el siguiente (sondeo lineal):
        // mientras quede un hueco libre a menos de 40 pasos, la ficha entra
        const i = (fnv1a(f.slug) + k) % huecos.length;
        if (usados.has(i)) continue;
        const { x, y } = huecos[i];
        if (colocadas.some((s) => Math.abs(s.x - x) < SEP_X && Math.abs(s.y - y) < SEP_Y)) continue;
        usados.add(i);
        ok = { x, y };
      }
      if (!ok) throw new Error(`carta: la ficha «${f.slug}» no cabe en la caja de «${zona}» tras ${INTENTOS} intentos. Agranda la caja en src/lib/carta.mjs.`);
      colocadas.push({ ...f, ...ok, grande });
    }
  }
  compuerta(fichas, colocadas);
  return colocadas;
}

export function validarCajas() {
  const entradas = Object.entries(ZONA_BOX);
  for (const [z, b] of entradas) {
    if (b.x < 0 || b.y < 0 || b.x + b.w > 100 || b.y + b.h > 100 || b.w <= 0 || b.h <= 0) {
      throw new Error(`carta: la caja de «${z}» se sale del campo (0-100)`);
    }
  }
  for (let i = 0; i < entradas.length; i++) {
    for (let j = i + 1; j < entradas.length; j++) {
      if (solapan(entradas[i][1], entradas[j][1])) {
        throw new Error(`carta: las cajas de «${entradas[i][0]}» y «${entradas[j][0]}» se solapan`);
      }
    }
  }
}

// Los topónimos no se pisan entre sí, no tapan un recuadro ni la rosa y no se salen del campo.
export function validarToponimos(cuantas) {
  const tops = [...cuantas].map(([z, n]) => [z, reservaToponimo(z, n)]);
  for (let i = 0; i < tops.length; i++) {
    const [z, r] = tops[i];
    if (r.x + r.w > 100 || r.y + r.h > 100) throw new Error(`carta: el topónimo «${z}» se sale del campo`);
    for (const [p, pr] of Object.entries(PIEZAS)) {
      if (solapan(r, pr)) throw new Error(`carta: el topónimo «${z}» pisa la pieza «${p}»`);
    }
    for (let j = i + 1; j < tops.length; j++) {
      if (solapan(r, tops[j][1])) throw new Error(`carta: los topónimos «${z}» y «${tops[j][0]}» se pisan`);
    }
  }
}

// Compuerta de build: si algo sale incoherente, se para el build.
export function compuerta(fichas, colocadas) {
  if (colocadas.length !== fichas.length) {
    throw new Error(`carta: ${colocadas.length} sondas para ${fichas.length} fichas`);
  }
  if (new Set(colocadas.map((s) => s.slug)).size !== fichas.length) {
    throw new Error('carta: hay fichas con dos sondas o sin ninguna');
  }
  for (let i = 0; i < colocadas.length; i++) {
    const a = colocadas[i];
    if (!dentro(a.x, a.y, ZONA_BOX[a.zona])) throw new Error(`carta: la sonda de «${a.slug}» se sale de su caja`);
    for (let j = i + 1; j < colocadas.length; j++) {
      const b = colocadas[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) < DIST_MIN) {
        throw new Error(`carta: las sondas de «${a.slug}» y «${b.slug}» están a menos de ${DIST_MIN} %`);
      }
    }
  }
}

// El número que se pinta en la sonda. Nunca una cifra que no esté en la ficha.
export function textoSonda(prof) {
  const n = Number(prof);
  return Number.isFinite(n) && n > 0 ? String(Math.round(n)) : '·';
}

// ---------------------------------------------------------------------------
// Número en letras para la frase-tesis (100-130). Fuera de ese tramo, cifras:
// mejor un número feo que una frase que miente.
// ---------------------------------------------------------------------------
const UNIDADES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiún', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete',
  'veintiocho', 'veintinueve', 'treinta'];

export function numeroEnLetras(n) {
  if (!Number.isInteger(n) || n < 100 || n > 130) return String(n);
  if (n === 100) return 'cien';
  return `ciento ${UNIDADES[n - 100]}`;
}

export function fraseTesis(n) {
  const letras = numeroEnLetras(n);
  const cap = letras.charAt(0).toUpperCase() + letras.slice(1);
  return `${cap} destinos levantados uno a uno, con la sonda y no con el folleto.`;
}

// Estilo en línea de una pieza o caja: left/top/width/height en %.
export function estiloCaja(r) {
  return `left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%`;
}
