import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import type { Root } from 'mdast';

const processor = unified().use(remarkParse).use(remarkGfm);

const stringifier = unified()
  .use(remarkStringify)
  .use(remarkGfm);

export function parseMarkdown(markdown: string): Root {
  return processor.parse(markdown);
}

export function stringifyMarkdown(tree: Root): string {
  return stringifier.stringify(tree);
}

export function normalizeMarkdown(markdown: string): string {
  const tree = parseMarkdown(markdown);
  return stringifyMarkdown(tree);
}
