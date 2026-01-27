import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Code, Eye } from 'lucide-react';
import mermaid from 'mermaid';

// Initialize mermaid with default config
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

export function MermaidBlock({ node, updateAttributes, selected }: NodeViewProps) {
  const [isPreview, setIsPreview] = useState(true);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const code = node.attrs.code as string;

  const renderMermaid = useCallback(async (mermaidCode: string) => {
    if (!mermaidCode.trim()) {
      setSvgContent('');
      setError(null);
      return;
    }

    try {
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const { svg } = await mermaid.render(id, mermaidCode);
      setSvgContent(svg);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render Mermaid diagram');
      setSvgContent('');
    }
  }, []);

  useEffect(() => {
    if (isPreview) {
      renderMermaid(code);
    }
  }, [code, isPreview, renderMermaid]);

  useEffect(() => {
    if (!isPreview && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isPreview]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateAttributes({ code: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Tab to insert tab character
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      updateAttributes({ code: newValue });
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
    // Escape to switch to preview mode
    if (e.key === 'Escape') {
      setIsPreview(true);
    }
  };

  return (
    <NodeViewWrapper
      className={`mermaid-block my-4 rounded-lg border ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg border-b border-gray-300 dark:border-gray-600">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Mermaid Diagram</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`p-1.5 rounded transition-colors ${
              !isPreview
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title="Edit code"
          >
            <Code size={16} />
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`p-1.5 rounded transition-colors ${
              isPreview
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title="Preview diagram"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded-b-lg">
        {isPreview ? (
          <div className="mermaid-preview">
            {error ? (
              <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <strong>Error:</strong> {error}
              </div>
            ) : svgContent ? (
              <div
                className="mermaid-svg flex justify-center overflow-auto"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <div className="text-gray-400 text-sm italic">
                No diagram content. Click the code button to add Mermaid code.
              </div>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[200px] p-3 font-mono text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder={`Enter Mermaid code here, e.g.:
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]`}
            spellCheck={false}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}
