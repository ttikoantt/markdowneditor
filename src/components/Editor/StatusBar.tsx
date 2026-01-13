import type { Editor } from '@tiptap/react';

interface StatusBarProps {
  editor: Editor | null;
}

export function StatusBar({ editor }: StatusBarProps) {
  if (!editor) return null;

  const { state } = editor;
  const { doc, selection } = state;

  // Count words
  const text = doc.textContent;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Count characters
  const characters = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, '').length;

  // Get current line and column
  const { from } = selection;
  let line = 1;
  let lastLineStart = 0;

  doc.nodesBetween(0, from, (node, pos) => {
    if (node.isBlock && pos < from) {
      line++;
      lastLineStart = pos + 1;
    }
  });

  const column = from - lastLineStart + 1;

  return (
    <div className="flex items-center justify-between px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <span>
          {words} {words === 1 ? 'word' : 'words'}
        </span>
        <span>{characters} characters</span>
        <span>{charactersWithoutSpaces} characters (no spaces)</span>
      </div>
      <div className="flex items-center gap-4">
        <span>
          Ln {line}, Col {column}
        </span>
      </div>
    </div>
  );
}
