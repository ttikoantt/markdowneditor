import { FileText } from 'lucide-react';
import type { FileNode } from '../../types';

interface FileItemProps {
  node: FileNode;
  depth: number;
  isActive: boolean;
  onClick: (node: FileNode) => void;
  onContextMenu?: ((node: FileNode, x: number, y: number) => void) | undefined;
  onDragStart?: ((node: FileNode) => void) | undefined;
}

export function FileItem({ node, depth, isActive, onClick, onContextMenu, onDragStart }: FileItemProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(node, e.clientX, e.clientY);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ path: node.path, type: 'file' }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(node);
  };

  return (
    <button
      type="button"
      draggable
      onClick={() => onClick(node)}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      className={`w-full flex items-center gap-2 px-2 py-1 text-sm text-left hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
        isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''
      }`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <FileText className="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}
