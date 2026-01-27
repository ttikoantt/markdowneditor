import { Node, mergeAttributes, Content } from '@tiptap/core';
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
        parseHTML: (element) => element.getAttribute('data-code') || element.textContent || '',
        renderHTML: (attributes) => ({
          'data-code': attributes.code,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid"]',
      },
      {
        tag: 'pre.mermaid-code',
        getAttrs: (node) => {
          const element = node as HTMLElement;
          const codeElement = element.querySelector('code');
          return {
            code: codeElement?.textContent || element.textContent || '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'mermaid' }),
      HTMLAttributes['data-code'] || '',
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
