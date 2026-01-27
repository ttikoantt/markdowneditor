import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { MermaidExtension } from './MermaidExtension';

const lowlight = createLowlight(common);

describe('MermaidExtension', () => {
  const createEditor = (content: string) => {
    return new Editor({
      extensions: [
        StarterKit.configure({
          codeBlock: false,
        }),
        CodeBlockLowlight.configure({
          lowlight,
        }),
        MermaidExtension,
      ],
      content,
    });
  };

  describe('parseHTML', () => {
    it('should parse div[data-mermaid] as mermaid node', () => {
      // Test with div and data-mermaid attribute (our primary format)
      const html = '<div data-mermaid="true" data-code="graph TD\n    A --> B"></div>';
      const editor = createEditor(html);

      const json = editor.getJSON();
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));

      // Find mermaid node in the document
      const mermaidNode = json.content?.find((node) => node.type === 'mermaid');
      expect(mermaidNode).toBeDefined();
      expect(mermaidNode?.attrs?.code).toContain('graph TD');
      expect(mermaidNode?.attrs?.code).toContain('A --> B');
      // Code should NOT be duplicated
      expect(mermaidNode?.attrs?.code).toBe('graph TD\n    A --> B');

      editor.destroy();
    });

    it('should parse pre with code.language-mermaid as mermaid node', () => {
      const html = '<pre><code class="language-mermaid">sequenceDiagram\n    A->>B: Hello</code></pre>';
      const editor = createEditor(html);

      const json = editor.getJSON();
      console.log('Parsed JSON (language-mermaid):', JSON.stringify(json, null, 2));

      const mermaidNode = json.content?.find((node) => node.type === 'mermaid');
      expect(mermaidNode).toBeDefined();
      expect(mermaidNode?.attrs?.code).toContain('sequenceDiagram');

      editor.destroy();
    });

    it('should NOT parse regular code blocks as mermaid', () => {
      const html = '<pre><code class="language-javascript">const x = 1;</code></pre>';
      const editor = createEditor(html);

      const json = editor.getJSON();
      console.log('Parsed JSON (javascript):', JSON.stringify(json, null, 2));

      const mermaidNode = json.content?.find((node) => node.type === 'mermaid');
      expect(mermaidNode).toBeUndefined();

      // Should be a codeBlock instead
      const codeBlockNode = json.content?.find((node) => node.type === 'codeBlock');
      expect(codeBlockNode).toBeDefined();

      editor.destroy();
    });

    it('should parse legacy div[data-type="mermaid"] format', () => {
      const html = '<div data-type="mermaid" data-code="graph LR\n    X --> Y"></div>';
      const editor = createEditor(html);

      const json = editor.getJSON();
      console.log('Parsed JSON (legacy div):', JSON.stringify(json, null, 2));

      const mermaidNode = json.content?.find((node) => node.type === 'mermaid');
      expect(mermaidNode).toBeDefined();
      expect(mermaidNode?.attrs?.code).toContain('graph LR');

      editor.destroy();
    });
  });

  describe('renderHTML', () => {
    it('should render mermaid node as div with data-mermaid and data-code attributes', () => {
      const editor = createEditor('');
      editor.commands.setMermaidBlock({ code: 'graph TD\n    A --> B' });

      const html = editor.getHTML();
      console.log('Rendered HTML:', html);

      expect(html).toContain('data-mermaid="true"');
      expect(html).toContain('data-code=');

      editor.destroy();
    });
  });
});
