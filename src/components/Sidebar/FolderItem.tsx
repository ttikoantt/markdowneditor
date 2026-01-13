import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import type { FileNode } from '../../types';

interface FolderItemProps {
  node: FileNode;
  depth: number;
  onClick: (node: FileNode) => void;
  onContextMenu?: ((node: FileNode, x: number, y: number) => void) | undefined;
  onDragStart?: ((node: FileNode) => void) | undefined;
  onDrop?: ((targetFolder: FileNode, sourcePath: string, sourceType: 'file' | 'folder') => void) | undefined;
}

export function FolderItem({ node, depth, onClick, onContextMenu, onDragStart, onDrop }: FolderItemProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const isExpanded = node.isExpanded;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(node, e.clientX, e.clientY);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ path: node.path, type: 'folder' }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(node);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { path: sourcePath, type: sourceType } = data;

      // Don't drop on self or parent
      if (sourcePath === node.path || node.path.startsWith(sourcePath + '/')) {
        return;
      }

      onDrop?.(node, sourcePath, sourceType);
    } catch {
      // Invalid data
    }
  };

  return (
    <button
      type="button"
      draggable
      onClick={() => onClick(node)}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full flex items-center gap-1 px-2 py-1 text-sm text-left hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
        isDragOver ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' : ''
      }`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      {isExpanded ? (
        <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-500" />
      ) : (
        <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-500" />
      )}
      {isExpanded ? (
        <FolderOpen className="w-4 h-4 flex-shrink-0 text-yellow-500" />
      ) : (
        <Folder className="w-4 h-4 flex-shrink-0 text-yellow-500" />
      )}
      <span className="truncate font-medium">{node.name}</span>
    </button>
  );
}
