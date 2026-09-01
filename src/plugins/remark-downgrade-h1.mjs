import { visit } from 'unist-util-visit';

/**
 * Quita del cuerpo de la ficha los titulares de nivel 1.
 *
 * Por qué QUITAR y no bajar a h2: la plantilla ya ocultaba ese titular con
 * `.article h1{position:absolute;clip:rect(0 0 0 0)}` porque repite el titular
 * del hero. Bajarlo a h2 lo hacía VISIBLE a tamaño de sección en 116 de las 122
 * fichas — el nombre del destino dos veces seguidas — y además lo colaba en el
 * índice «En esta ficha» y en la barra pegajosa, que solo tiene cuatro huecos.
 *
 * Quitándolo queda un solo <h1> por página (el del hero, que ya lleva el título
 * completo) y los índices vuelven a listar solo secciones de verdad.
 */
export function remarkDowngradeH1() {
  return (tree) => {
    const fuera = [];
    visit(tree, 'heading', (node, index, parent) => {
      if (node.depth === 1 && parent) fuera.push({ parent, node });
    });
    for (const { parent, node } of fuera) {
      const i = parent.children.indexOf(node);
      if (i !== -1) parent.children.splice(i, 1);
    }
  };
}
