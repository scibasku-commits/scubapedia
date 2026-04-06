import { visit } from 'unist-util-visit';

/**
 * Remark plugin: converts [[slug]] and [[slug]] — description
 * into proper markdown links → /destinos/slug
 */
export function remarkWikilinks() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
      if (!regex.test(node.value)) return;
      regex.lastIndex = 0;

      const text = node.value;
      const nodes = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          nodes.push({ type: 'text', value: text.slice(lastIndex, match.index) });
        }
        const slug = match[1].trim();
        const label = match[2]?.trim() || slug;
        nodes.push({
          type: 'link',
          url: `/destinos/${slug}`,
          children: [{ type: 'text', value: label }],
        });
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        nodes.push({ type: 'text', value: text.slice(lastIndex) });
      }

      if (nodes.length > 0 && parent) {
        parent.children.splice(index, 1, ...nodes);
        return index + nodes.length;
      }
    });
  };
}
