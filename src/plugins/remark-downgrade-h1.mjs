import { visit } from 'unist-util-visit';

/**
 * Remark plugin: downgrades all h1 (heading depth 1) to h2 (depth 2)
 * Prevents duplicate <h1> tags when FichaLayout already has an <h1>
 */
export function remarkDowngradeH1() {
  return (tree) => {
    visit(tree, 'heading', (node) => {
      if (node.depth === 1) {
        node.depth = 2;
      }
    });
  };
}
