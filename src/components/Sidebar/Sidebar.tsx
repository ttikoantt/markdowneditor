import { FolderOpen, Plus, RefreshCw, Search, FolderPlus } from 'lucide-react';
import { FileTree } from './FileTree';
import { useAppStore } from '../../store';
import type { FileNode } from '../../types';

interface SidebarProps {
  onOpenFolder: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
  onFileOpen: (node: FileNode) => void;
  onContextMenu?: ((node: FileNode, x: number, y: number) => void) | undefined;
  onFileDrop?: ((targetFolder: FileNode, sourcePath: string, sourceType: 'file' | 'folder') => void) | undefined;
}

export function Sidebar({
  onOpenFolder,
  onNewFile,
  onNewFolder,
  onRefresh,
  onFileOpen,
  onContextMenu,
  onFileDrop,
}: SidebarProps) {
  const {
    currentWorkspace,
    fileTree,
    activeFileId,
    toggleFolder,
    sidebarWidth,
    setSearchOpen,
  } = useAppStore();

  const handleFolderClick = (node: FileNode) => {
    toggleFolder(node.id);
  };

  const handleFileClick = (node: FileNode) => {
    onFileOpen(node);
  };

  return (
    <aside
      className="flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
          {currentWorkspace?.name || 'No Folder Open'}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          {currentWorkspace && (
            <>
              <button
                type="button"
                onClick={onNewFile}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="New File"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onNewFolder}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="New Folder"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onRefresh}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {currentWorkspace ? (
          fileTree.length > 0 ? (
            <FileTree
              nodes={fileTree}
              activeFileId={activeFileId}
              onFileClick={handleFileClick}
              onFolderClick={handleFolderClick}
              onContextMenu={onContextMenu}
              onDrop={onFileDrop}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
              No markdown files found
            </p>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-4">
            <FolderOpen className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Open a folder to start editing
              </p>
              <button
                type="button"
                onClick={onOpenFolder}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Open Folder
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
