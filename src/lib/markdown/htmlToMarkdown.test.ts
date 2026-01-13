import { describe, it, expect } from 'vitest';
import { htmlToMarkdown } from './htmlToMarkdown';

describe('htmlToMarkdown', () => {
  describe('headings', () => {
    it('should convert h1 to markdown', () => {
      const result = htmlToMarkdown('<h1>Heading 1</h1>');
      expect(result.trim()).toBe('# Heading 1');
    });

    it('should convert h2 to markdown', () => {
      const result = htmlToMarkdown('<h2>Heading 2</h2>');
      expect(result.trim()).toBe('## Heading 2');
    });

    it('should convert h3 to markdown', () => {
      const result = htmlToMarkdown('<h3>Heading 3</h3>');
      expect(result.trim()).toBe('### Heading 3');
    });
  });

  describe('text formatting', () => {
    it('should convert bold to markdown', () => {
      const result = htmlToMarkdown('<p><strong>bold</strong></p>');
      expect(result).toContain('**bold**');
    });

    it('should convert italic to markdown', () => {
      const result = htmlToMarkdown('<p><em>italic</em></p>');
      expect(result).toContain('_italic_');
    });

    it('should convert strikethrough to markdown', () => {
      const result = htmlToMarkdown('<p><del>deleted</del></p>');
      expect(result).toContain('~~deleted~~');
    });

    it('should convert inline code to markdown', () => {
      const result = htmlToMarkdown('<p><code>code</code></p>');
      expect(result).toContain('`code`');
    });
  });

  describe('lists', () => {
    it('should convert unordered list to markdown', () => {
      const result = htmlToMarkdown('<ul><li>Item 1</li><li>Item 2</li></ul>');
      expect(result).toContain('- Item 1');
      expect(result).toContain('- Item 2');
    });

    it('should convert ordered list to markdown', () => {
      const result = htmlToMarkdown('<ol><li>First</li><li>Second</li></ol>');
      expect(result).toContain('1. First');
      expect(result).toContain('2. Second');
    });
  });

  describe('links and images', () => {
    it('should convert link to markdown', () => {
      const result = htmlToMarkdown('<a href="https://example.com">Example</a>');
      expect(result).toContain('[Example](https://example.com)');
    });

    it('should convert image to markdown', () => {
      const result = htmlToMarkdown('<img src="image.png" alt="Alt text" />');
      expect(result).toContain('![Alt text](image.png)');
    });
  });

  describe('code blocks', () => {
    it('should convert code block to markdown', () => {
      const result = htmlToMarkdown('<pre><code>const x = 1;</code></pre>');
      expect(result).toContain('```');
      expect(result).toContain('const x = 1;');
    });

    it('should include language class', () => {
      const result = htmlToMarkdown(
        '<pre><code class="language-javascript">const x = 1;</code></pre>'
      );
      expect(result).toContain('```javascript');
    });
  });

  describe('blockquotes', () => {
    it('should convert blockquote to markdown', () => {
      const result = htmlToMarkdown('<blockquote><p>Quote text</p></blockquote>');
      expect(result).toContain('> Quote text');
    });
  });

  describe('horizontal rule', () => {
    it('should convert hr to markdown', () => {
      const result = htmlToMarkdown('<hr />');
      expect(result).toContain('---');
    });
  });

  describe('tables', () => {
    it('should convert table to markdown', () => {
      const html = '<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>';
      const result = htmlToMarkdown(html);
      expect(result).toContain('| A | B |');
      expect(result).toContain('| --- | --- |');
      expect(result).toContain('| 1 | 2 |');
    });
  });

  describe('sanitization', () => {
    it('should sanitize HTML by default', () => {
      const result = htmlToMarkdown('<script>alert("xss")</script><p>Safe</p>');
      expect(result).not.toContain('script');
      expect(result).toContain('Safe');
    });

    it('should skip sanitization when option is false', () => {
      const result = htmlToMarkdown('<div onclick="bad()">Text</div>', { sanitize: false });
      expect(result).toContain('Text');
    });
  });
});
