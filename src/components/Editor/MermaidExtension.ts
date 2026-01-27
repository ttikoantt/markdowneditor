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
        // Explicitly disable automatic attribute parsing - we handle it in parseHTML's getAttrs
        parseHTML: () => null,
        renderHTML: () => ({}), // code is rendered as textContent, not as attribute
      },
    };
  },

  parseHTML() {
    return [
      {
        // Primary format: div with data-mermaid attribute
        tag: 'div[data-mermaid]',
        priority: 100,
        getAttrs: (node) => {
          const element = node as HTMLElement;
          const code = element.getAttribute('data-code') || element.textContent || '';
          return { code };
        },
      },
      {
        // Match pre with code.language-mermaid (from markdown conversion)
        tag: 'pre',
        priority: 100,
        getAttrs: (node) => {
          const element = node as HTMLElement;
          const codeElement = element.querySelector('code.language-mermaid');
          if (codeElement) {
            const code = codeElement.textContent || '';
            return { code };
          }
          return false; // Don't match
        },
      },
      {
        // Legacy format: div[data-type="mermaid"] with data-code attribute
        tag: 'div[data-type="mermaid"]',
        priority: 100,
        getAttrs: (node) => {
          const element = node as HTMLElement;
          const code = element.getAttribute('data-code') || element.textContent || '';
          return { code };
        },
      },
    ];
  },

  renderHTML({ node }) {
    // Render as div with data-mermaid and data-code attributes
    // This format is simpler and avoids Tiptap's pre element processing issues
    return [
      'div',
      { 'data-mermaid': 'true', 'data-code': node.attrs.code || '' },
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
