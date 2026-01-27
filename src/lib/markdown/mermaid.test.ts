import { describe, it, expect } from 'vitest';
import { markdownToHtml } from './markdownToHtml';
import { htmlToMarkdown } from './htmlToMarkdown';

describe('Mermaid diagram support', () => {
  const simpleMermaid = `graph TD
    A[Start] --> B[End]`;

  const mermaidMarkdown = `\`\`\`mermaid
${simpleMermaid}
\`\`\``;

  describe('markdownToHtml', () => {
    it('should convert mermaid code block to pre with data-type="mermaid"', () => {
      const result = markdownToHtml(mermaidMarkdown);
      expect(result).toContain('data-type="mermaid"');
      expect(result).toContain('<pre');
    });

    it('should preserve mermaid code as textContent in code element', () => {
      const result = markdownToHtml(mermaidMarkdown);
      expect(result).toContain('language-mermaid');
      // Check that the content is preserved (may be escaped)
      expect(result).toContain('graph');
      expect(result).toContain('Start');
    });

    it('should render mermaid with proper code structure', () => {
      const result = markdownToHtml(mermaidMarkdown);
      expect(result).toContain('<pre data-type="mermaid">');
      expect(result).toContain('<code class="language-mermaid">');
    });

    it('should still render regular code blocks correctly', () => {
      const jsCode = `\`\`\`javascript
const x = 1;
\`\`\``;
      const result = markdownToHtml(jsCode);
      expect(result).toContain('<pre>');
      expect(result).toContain('language-javascript');
      expect(result).not.toContain('data-type="mermaid"');
    });
  });

  describe('htmlToMarkdown', () => {
    it('should convert mermaid pre back to markdown code block', () => {
      const html = `<pre data-type="mermaid"><code class="language-mermaid">${simpleMermaid}</code></pre>`;
      const result = htmlToMarkdown(html, { sanitize: false });
      expect(result).toContain('```mermaid');
      expect(result).toContain('```');
    });

    it('should preserve mermaid code content when converting back', () => {
      const html = `<pre data-type="mermaid"><code class="language-mermaid">graph TD\n    A --> B</code></pre>`;
      const result = htmlToMarkdown(html, { sanitize: false });
      expect(result).toContain('graph TD');
      expect(result).toContain('A --> B');
    });

    it('should handle legacy div format with data-code attribute', () => {
      const html = `<div data-type="mermaid" data-code="graph TD\n    A --&gt; B"></div>`;
      const result = htmlToMarkdown(html, { sanitize: false });
      expect(result).toContain('```mermaid');
      expect(result).toContain('A --> B');
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve mermaid content through markdown -> html -> markdown', () => {
      // markdown to html
      const html = markdownToHtml(mermaidMarkdown, { sanitize: false });
      console.log('HTML output:', html);

      // html back to markdown
      const backToMarkdown = htmlToMarkdown(html, { sanitize: false });
      console.log('Back to markdown:', backToMarkdown);

      // Should contain mermaid fence
      expect(backToMarkdown).toContain('```mermaid');
      expect(backToMarkdown).toContain('graph');
    });

    it('should preserve arrow syntax (-->) through round-trip', () => {
      const mermaidWithArrow = `\`\`\`mermaid
graph TD
    A --> B
\`\`\``;
      const html = markdownToHtml(mermaidWithArrow, { sanitize: false });
      const backToMarkdown = htmlToMarkdown(html, { sanitize: false });

      // CRITICAL: Arrow should be preserved as --> not --&gt;
      expect(backToMarkdown).toContain('-->');
      expect(backToMarkdown).not.toContain('&gt;');
    });

    it('should preserve special characters through round-trip', () => {
      const mermaidWithSpecialChars = `\`\`\`mermaid
graph TD
    A["Label <with> special & chars"] --> B
\`\`\``;
      const html = markdownToHtml(mermaidWithSpecialChars, { sanitize: false });
      const backToMarkdown = htmlToMarkdown(html, { sanitize: false });

      // Special chars should be decoded back
      expect(backToMarkdown).toContain('<with>');
      expect(backToMarkdown).toContain('&');
      expect(backToMarkdown).toContain('-->');
    });
  });

  describe('DOMPurify sanitization', () => {
    it('should preserve data-type attribute after sanitization', () => {
      const result = markdownToHtml(mermaidMarkdown, { sanitize: true });
      console.log('Sanitized result:', result);
      // DOMPurify should preserve data-type attribute
      expect(result).toContain('data-type="mermaid"');
    });

    it('should preserve mermaid code through sanitization', () => {
      const mermaidWithArrow = `\`\`\`mermaid
graph TD
    A --> B
\`\`\``;
      const html = markdownToHtml(mermaidWithArrow, { sanitize: true });
      const backToMarkdown = htmlToMarkdown(html, { sanitize: false });
      console.log('After sanitization round-trip:', backToMarkdown);

      // Code should be preserved through sanitization
      expect(backToMarkdown).toContain('graph TD');
      expect(backToMarkdown).toContain('A --> B');
    });
  });
});
