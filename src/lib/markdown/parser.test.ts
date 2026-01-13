import { describe, it, expect } from 'vitest';
import { parseMarkdown, stringifyMarkdown, normalizeMarkdown } from './parser';

describe('Markdown Parser', () => {
  describe('parseMarkdown', () => {
    it('should parse simple paragraph', () => {
      const tree = parseMarkdown('Hello World');
      expect(tree.type).toBe('root');
      expect(tree.children).toHaveLength(1);
      expect(tree.children[0]?.type).toBe('paragraph');
    });

    it('should parse headings', () => {
      const tree = parseMarkdown('# Heading 1\n## Heading 2');
      expect(tree.children).toHaveLength(2);
      expect(tree.children[0]?.type).toBe('heading');
      expect(tree.children[1]?.type).toBe('heading');
    });

    it('should parse lists', () => {
      const tree = parseMarkdown('- Item 1\n- Item 2\n- Item 3');
      expect(tree.children).toHaveLength(1);
      expect(tree.children[0]?.type).toBe('list');
    });

    it('should parse code blocks', () => {
      const tree = parseMarkdown('```javascript\nconst x = 1;\n```');
      expect(tree.children).toHaveLength(1);
      expect(tree.children[0]?.type).toBe('code');
    });

    it('should parse blockquotes', () => {
      const tree = parseMarkdown('> This is a quote');
      expect(tree.children).toHaveLength(1);
      expect(tree.children[0]?.type).toBe('blockquote');
    });

    it('should parse links', () => {
      const tree = parseMarkdown('[Link](https://example.com)');
      const paragraph = tree.children[0];
      if (paragraph?.type === 'paragraph') {
        expect(paragraph.children[0]?.type).toBe('link');
      }
    });

    it('should parse GFM tables', () => {
      const markdown = '| A | B |\n|---|---|\n| 1 | 2 |';
      const tree = parseMarkdown(markdown);
      expect(tree.children[0]?.type).toBe('table');
    });

    it('should parse GFM task lists', () => {
      const markdown = '- [x] Done\n- [ ] Todo';
      const tree = parseMarkdown(markdown);
      expect(tree.children[0]?.type).toBe('list');
    });
  });

  describe('stringifyMarkdown', () => {
    it('should stringify back to markdown', () => {
      const tree = parseMarkdown('# Hello\n\nWorld');
      const result = stringifyMarkdown(tree);
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });
  });

  describe('normalizeMarkdown', () => {
    it('should normalize markdown text', () => {
      const input = '#   Heading with spaces   ';
      const result = normalizeMarkdown(input);
      expect(result).toContain('Heading with spaces');
    });
  });
});
