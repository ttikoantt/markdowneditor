import type { FileNode } from '../../types';
import { FileItem } from './FileItem';
import { FolderItem } from './FolderItem';

interface FileTreeProps {
  nodes: FileNode[];
  activeFileId: string | null;
  onFileClick: (node: FileNode) => void;
  onFolderClick: (node: FileNode) => void;
  onContextMenu?: ((node: FileNode, x: number, y: number) => void) | undefined;
  onDrop?: ((targetFolder: FileNode, sourcePath: string, sourceType: 'file' | 'folder') => void) | undefined;
  depth?: number | undefined;
}

export function FileTree({
  nodes,
  activeFileId,
  onFileClick,
  onFolderClick,
  onContextMenu,
  onDrop,
  depth = 0,
}: FileTreeProps) {
  if (nodes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <div key={node.id}>
          {node.type === 'folder' ? (
            <>
              <FolderItem
                node={node}
                depth={depth}
                onClick={onFolderClick}
                onContextMenu={onContextMenu}
                onDrop={onDrop}
              />
              {node.isExpanded && node.children && (
                <FileTree
                  nodes={node.children}
                  activeFileId={activeFileId}
                  onFileClick={onFileClick}
                  onFolderClick={onFolderClick}
                  onContextMenu={onContextMenu}
                  onDrop={onDrop}
                  depth={depth + 1}
                />
              )}
            </>
          ) : (
            <FileItem
              node={node}
              depth={depth}
              isActive={node.id === activeFileId}
              onClick={onFileClick}
              onContextMenu={onContextMenu}
            />
          )}
        </div>
      ))}
    </div>
  );
}
