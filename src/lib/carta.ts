// Fachada con tipos. LA LÓGICA VIVE EN `carta.mjs`, Y SOLO AHÍ (igual que zonas.ts/zonas.mjs):
// `tests/portada.test.mjs` se ejecuta con `node --test`, que no lee TypeScript.
export type Caja = { x: number; y: number; w: number; h: number; lineas?: 1 | 2 };
export type FichaCarta = { slug: string; title: string; zona: string; prof: number };
export type Sonda = FichaCarta & { x: number; y: number; grande: boolean };

import * as carta from './carta.mjs';

export const SEP_X: number = carta.SEP_X;
export const SEP_Y: number = carta.SEP_Y;
export const DIST_MIN: number = carta.DIST_MIN;
export const ZONA_GRANDE: number = carta.ZONA_GRANDE;
export const PIEZAS: Record<'insetMarRojo' | 'ovp' | 'insetBrother' | 'aviso' | 'rosa', Caja> = carta.PIEZAS;
export const ZONA_BOX: Record<string, Caja> = carta.ZONA_BOX;
export const sondas: (fichas: FichaCarta[]) => Sonda[] = carta.sondas;
export const reservaToponimo: (zona: string, n: number) => Caja = carta.reservaToponimo;
export const textoSonda: (prof: unknown) => string = carta.textoSonda;
export const numeroEnLetras: (n: number) => string = carta.numeroEnLetras;
export const fraseTesis: (n: number) => string = carta.fraseTesis;
export const estiloCaja: (r: Caja) => string = carta.estiloCaja;
