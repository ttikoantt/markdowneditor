import { Node, Content } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MermaidBlock } from './MermaidBlock';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaid: {
      setMermaidBlock: (attributes?: { code?: string }) => ReturnType;
    };
  }
}

export const MermaidExtension = Node.create({
  name: 'mermaid',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      code: {
        default: '',
        parseHTML: (element) => {
          // For pre[data-type="mermaid"], get code from code element's textContent
          const codeElement = element.querySelector('code');
          if (codeElement) {
            return codeElement.textContent || '';
          }
          // Fallback: try data-code attribute or textContent
          return element.getAttribute('data-code') || element.textContent || '';
        },
        renderHTML: () => ({}), // code is rendered as textContent, not as attribute
      },
    };
  },

  parseHTML() {
    return [
      {
        // New format: pre[data-type="mermaid"] with code as textContent
        tag: 'pre[data-type="mermaid"]',
      },
      {
        // Legacy format: div[data-type="mermaid"] with data-code attribute
        tag: 'div[data-type="mermaid"]',
      },
    ];
  },

  renderHTML({ node }) {
    // Render as pre > code to preserve code through DOMPurify
    return [
      'pre',
      { 'data-type': 'mermaid' },
      ['code', { class: 'language-mermaid' }, node.attrs.code || ''],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidBlock);
  },

  addCommands() {
    return {
      setMermaidBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          } as Content);
        },
    };
  },
});
