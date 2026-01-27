import DOMPurify from 'dompurify';
import { parseMarkdown } from './parser';
import type { Root, Content, PhrasingContent } from 'mdast';

interface ConversionOptions {
  sanitize?: boolean;
}

export function markdownToHtml(markdown: string, options: ConversionOptions = {}): string {
  const { sanitize = true } = options;
  const tree = parseMarkdown(markdown);
  const html = convertToHtml(tree);
  return sanitize ? DOMPurify.sanitize(html) : html;
}

function convertToHtml(node: Root | Content): string {
  switch (node.type) {
    case 'root':
      return node.children.map(convertToHtml).join('');

    case 'heading':
      return `<h${node.depth}>${convertChildren(node.children)}</h${node.depth}>`;

    case 'paragraph':
      return `<p>${convertChildren(node.children)}</p>`;

    case 'text':
      return escapeHtml(node.value);

    case 'strong':
      return `<strong>${convertChildren(node.children)}</strong>`;

    case 'emphasis':
      return `<em>${convertChildren(node.children)}</em>`;

    case 'delete':
      return `<del>${convertChildren(node.children)}</del>`;

    case 'inlineCode':
      return `<code>${escapeHtml(node.value)}</code>`;

    case 'code':
      // Handle mermaid code blocks specially
      // Use div with data-mermaid and data-code attributes to avoid Tiptap's pre element issues
      if (node.lang === 'mermaid') {
        return `<div data-mermaid="true" data-code="${escapeHtml(node.value)}"></div>`;
      }
      const lang = node.lang ? ` class="language-${node.lang}"` : '';
      return `<pre><code${lang}>${escapeHtml(node.value)}</code></pre>`;

    case 'blockquote':
      return `<blockquote>${node.children.map(convertToHtml).join('')}</blockquote>`;

    case 'list':
      const tag = node.ordered ? 'ol' : 'ul';
      const items = node.children.map(convertToHtml).join('');
      return `<${tag}>${items}</${tag}>`;

    case 'listItem': {
      const content = node.children.map(convertToHtml).join('');
      if (node.checked !== null && node.checked !== undefined) {
        const checked = node.checked ? ' checked' : '';
        return `<li><input type="checkbox"${checked} disabled />${content}</li>`;
      }
      return `<li>${content}</li>`;
    }

    case 'link':
      return `<a href="${escapeHtml(node.url)}">${convertChildren(node.children)}</a>`;

    case 'image':
      return `<img src="${escapeHtml(node.url)}" alt="${escapeHtml(node.alt || '')}" />`;

    case 'thematicBreak':
      return '<hr />';

    case 'break':
      return '<br />';

    case 'table':
      return convertTable(node);

    case 'tableRow':
      return `<tr>${node.children.map(convertToHtml).join('')}</tr>`;

    case 'tableCell':
      return `<td>${convertChildren(node.children)}</td>`;

    case 'html':
      return node.value;

    default:
      return '';
  }
}

function convertChildren(children: PhrasingContent[]): string {
  return children.map(convertToHtml).join('');
}

function convertTable(node: { type: 'table'; children: Content[] }): string {
  const rows = node.children as { type: 'tableRow'; children: Content[] }[];
  if (rows.length === 0) return '';

  const headerRow = rows[0]!;
  const bodyRows = rows.slice(1);

  const headerCells = (headerRow.children as { type: 'tableCell'; children: PhrasingContent[] }[])
    .map((cell) => `<th>${convertChildren(cell.children)}</th>`)
    .join('');

  const header = `<thead><tr>${headerCells}</tr></thead>`;

  const body = bodyRows
    .map((row) => {
      const cells = (row.children as { type: 'tableCell'; children: PhrasingContent[] }[])
        .map((cell) => `<td>${convertChildren(cell.children)}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `<table>${header}<tbody>${body}</tbody></table>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
