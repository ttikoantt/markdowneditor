import DOMPurify from 'dompurify';

interface ConversionOptions {
  sanitize?: boolean;
}

export function htmlToMarkdown(html: string, options: ConversionOptions = {}): string {
  const { sanitize = true } = options;

  const cleanHtml = sanitize ? DOMPurify.sanitize(html) : html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, 'text/html');

  return convertNode(doc.body);
}

function convertNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes)
    .map(convertNode)
    .join('');

  switch (tagName) {
    case 'h1':
      return `# ${children}\n\n`;
    case 'h2':
      return `## ${children}\n\n`;
    case 'h3':
      return `### ${children}\n\n`;
    case 'h4':
      return `#### ${children}\n\n`;
    case 'h5':
      return `##### ${children}\n\n`;
    case 'h6':
      return `###### ${children}\n\n`;

    case 'p':
      return `${children}\n\n`;

    case 'strong':
    case 'b':
      return `**${children}**`;

    case 'em':
    case 'i':
      return `_${children}_`;

    case 's':
    case 'strike':
    case 'del':
      return `~~${children}~~`;

    case 'code':
      if (element.parentElement?.tagName.toLowerCase() === 'pre') {
        return children;
      }
      return `\`${children}\``;

    case 'pre': {
      const codeElement = element.querySelector('code');
      const codeContent = codeElement ? convertNode(codeElement) : children;
      const language = codeElement?.className.match(/language-(\w+)/)?.[1] || '';
      return `\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
    }

    case 'blockquote':
      return children
        .split('\n')
        .map((line) => (line.trim() ? `> ${line}` : '>'))
        .join('\n') + '\n\n';

    case 'ul':
      return convertList(element, '-') + '\n';

    case 'ol':
      return convertOrderedList(element) + '\n';

    case 'li': {
      const isTaskItem = element.querySelector('input[type="checkbox"]');
      if (isTaskItem) {
        const checked = (isTaskItem as HTMLInputElement).checked;
        const text = children.replace(/^\s*\[.\]\s*/, '').trim();
        return checked ? `[x] ${text}` : `[ ] ${text}`;
      }
      return children.trim();
    }

    case 'a': {
      const href = element.getAttribute('href') || '';
      return `[${children}](${href})`;
    }

    case 'img': {
      const src = element.getAttribute('src') || '';
      const alt = element.getAttribute('alt') || '';
      return `![${alt}](${src})`;
    }

    case 'hr':
      return '---\n\n';

    case 'br':
      return '\n';

    case 'table':
      return convertTable(element) + '\n\n';

    case 'div': {
      // Handle mermaid blocks
      if (element.getAttribute('data-type') === 'mermaid') {
        const mermaidCode = element.getAttribute('data-code') || element.textContent || '';
        return `\`\`\`mermaid\n${mermaidCode}\n\`\`\`\n\n`;
      }
      return children;
    }

    case 'span':
    case 'body':
      return children;

    default:
      return children;
  }
}

function convertList(element: Element, marker: string, indent: number = 0): string {
  const items = Array.from(element.children).filter(
    (child) => child.tagName.toLowerCase() === 'li'
  );

  return items
    .map((item) => {
      const prefix = '  '.repeat(indent) + marker + ' ';
      const content = convertNode(item);

      const nestedList = item.querySelector('ul, ol');
      if (nestedList) {
        const listType = nestedList.tagName.toLowerCase();
        const nestedMarker = listType === 'ul' ? '-' : '1.';
        const nestedContent =
          listType === 'ul'
            ? convertList(nestedList, nestedMarker, indent + 1)
            : convertOrderedList(nestedList, indent + 1);
        const mainContent = content.replace(nestedContent, '').trim();
        return `${prefix}${mainContent}\n${nestedContent}`;
      }

      return `${prefix}${content}`;
    })
    .join('\n');
}

function convertOrderedList(element: Element, indent: number = 0): string {
  const items = Array.from(element.children).filter(
    (child) => child.tagName.toLowerCase() === 'li'
  );

  return items
    .map((item, index) => {
      const prefix = '  '.repeat(indent) + `${index + 1}. `;
      const content = convertNode(item);

      const nestedList = item.querySelector('ul, ol');
      if (nestedList) {
        const listType = nestedList.tagName.toLowerCase();
        const nestedContent =
          listType === 'ul'
            ? convertList(nestedList, '-', indent + 1)
            : convertOrderedList(nestedList, indent + 1);
        const mainContent = content.replace(nestedContent, '').trim();
        return `${prefix}${mainContent}\n${nestedContent}`;
      }

      return `${prefix}${content}`;
    })
    .join('\n');
}

function convertTable(table: Element): string {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 0) return '';

  const result: string[] = [];

  rows.forEach((row, rowIndex) => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    const cellContents = cells.map((cell) => convertNode(cell).trim());
    result.push(`| ${cellContents.join(' | ')} |`);

    if (rowIndex === 0) {
      const separator = cells.map(() => '---').join(' | ');
      result.push(`| ${separator} |`);
    }
  });

  return result.join('\n');
}
