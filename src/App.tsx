import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Settings } from 'lucide-react';
import { Sidebar, ContextMenu } from './components/Sidebar';
import { TabBar } from './components/Tabs';
import { Editor } from './components/Editor';
import {
  SearchDialog,
  SettingsDialog,
  NewFileDialog,
  NewFolderDialog,
  RenameDialog,
  DeleteDialog,
} from './components/Dialogs';
import { useAppStore } from './store';
import {
  isFileSystemAccessSupported,
  openDirectory,
  readDirectoryRecursive,
  readFileContent,
  writeFileContent,
  createNewFolder,
  deleteEntry,
  renameFile,
  renameFolder,
  moveFile,
  moveFolder,
  requestPermission,
} from './lib/fileSystem';
import { saveWorkspace, getAllWorkspaces, type StoredWorkspace } from './lib/storage';
import type { SearchDocument } from './lib/search';
import { markdownToHtml, htmlToMarkdown } from './lib/markdown';
import type { FileNode, OpenFile } from './types';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  node: FileNode | null;
}

function App() {
  const {
    currentWorkspace,
    fileTree,
    setWorkspace,
    addRecentWorkspace,
    setFileTree,
    openFiles,
    activeFileId,
    tabs,
    activeTabId,
    openFile,
    closeFile,
    setActiveTab,
    updateFileContent,
    markFileSaved,
    sidebarVisible,
    isSearchOpen,
    setSearchOpen,
    settings,
  } = useAppStore();

  const directoryHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    node: null,
  });

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  const searchDocuments = useMemo<SearchDocument[]>(() => {
    return openFiles.map((file) => ({
      id: file.id,
      path: file.path,
      name: file.name,
      content: file.content,
    }));
  }, [openFiles]);

  useEffect(() => {
    const loadRecentWorkspaces = async () => {
      try {
        const workspaces = await getAllWorkspaces();
        workspaces.forEach((ws) => {
          addRecentWorkspace({
            id: ws.id,
            name: ws.name,
            path: ws.name,
            createdAt: ws.createdAt,
            lastOpenedAt: ws.lastOpenedAt,
          });
        });
      } catch (error) {
        console.error('Failed to load recent workspaces:', error);
      }
    };
    loadRecentWorkspaces();
  }, [addRecentWorkspace]);

  useEffect(() => {
    const theme = settings.theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  const handleOpenFolder = useCallback(async () => {
    if (!isFileSystemAccessSupported()) {
      alert('File System Access API is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    try {
      setIsLoading(true);
      const handle = await openDirectory();
      if (!handle) return;

      const hasPermission = await requestPermission(handle, 'readwrite');
      if (!hasPermission) {
        alert('Permission denied. Cannot access the folder.');
        return;
      }

      directoryHandleRef.current = handle;

      const workspaceId = `ws-${Date.now()}`;
      const workspace = {
        id: workspaceId,
        name: handle.name,
        path: handle.name,
        createdAt: new Date(),
        lastOpenedAt: new Date(),
      };

      setWorkspace(workspace);
      addRecentWorkspace(workspace);

      await saveWorkspace({
        ...workspace,
        handle,
      } as StoredWorkspace);

      const tree = await readDirectoryRecursive(handle);
      setFileTree(tree);
    } catch (error) {
      console.error('Failed to open folder:', error);
      alert('Failed to open folder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setWorkspace, addRecentWorkspace, setFileTree]);

  const handleRefresh = useCallback(async () => {
    if (!directoryHandleRef.current) return;

    try {
      setIsLoading(true);
      const tree = await readDirectoryRecursive(directoryHandleRef.current);
      setFileTree(tree);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setFileTree]);

  const handleNewFile = useCallback(() => {
    setIsNewFileOpen(true);
  }, []);

  const handleNewFolder = useCallback(() => {
    setIsNewFolderOpen(true);
  }, []);

  const handleCreateFile = useCallback(
    (fileName: string) => {
      const newFile: OpenFile = {
        id: `new-${Date.now()}`,
        path: `${currentWorkspace?.name || ''}/${fileName}`,
        name: fileName,
        content: '',
        isDirty: true,
        lastSaved: new Date(),
      };
      openFile(newFile);
    },
    [currentWorkspace, openFile]
  );

  const handleCreateFolder = useCallback(
    async (folderName: string) => {
      if (!directoryHandleRef.current || !currentWorkspace) return;

      try {
        setIsLoading(true);
        const folderPath = `${currentWorkspace.name}/${folderName}`;
        await createNewFolder(directoryHandleRef.current, folderPath);
        await handleRefresh();
      } catch (error) {
        console.error('Failed to create folder:', error);
        alert('Failed to create folder. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [currentWorkspace, handleRefresh]
  );

  const handleFileOpen = useCallback(
    async (node: FileNode) => {
      if (node.type !== 'file' || !directoryHandleRef.current) return;

      const existingFile = openFiles.find((f) => f.path === node.path);
      if (existingFile) {
        setActiveTab(existingFile.id);
        return;
      }

      try {
        setIsLoading(true);
        const markdownContent = await readFileContent(directoryHandleRef.current, node.path);
        const htmlContent = markdownToHtml(markdownContent);
        const file: OpenFile = {
          id: node.id,
          path: node.path,
          name: node.name,
          content: htmlContent,
          originalMarkdown: markdownContent,
          isDirty: false,
          lastSaved: new Date(),
        };
        openFile(file);
      } catch (error) {
        console.error('Failed to open file:', error);
        alert('Failed to open file. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [openFiles, openFile, setActiveTab]
  );

  const handleContextMenu = useCallback((node: FileNode, x: number, y: number) => {
    setContextMenu({ isOpen: true, x, y, node });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ isOpen: false, x: 0, y: 0, node: null });
  }, []);

  const handleRenameClick = useCallback(() => {
    if (contextMenu.node) {
      setSelectedNode(contextMenu.node);
      setIsRenameOpen(true);
    }
    closeContextMenu();
  }, [contextMenu.node, closeContextMenu]);

  const handleDeleteClick = useCallback(() => {
    if (contextMenu.node) {
      setSelectedNode(contextMenu.node);
      setIsDeleteOpen(true);
    }
    closeContextMenu();
  }, [contextMenu.node, closeContextMenu]);

  const handleNewFileInFolder = useCallback(() => {
    setIsNewFileOpen(true);
    closeContextMenu();
  }, [closeContextMenu]);

  const handleNewFolderInFolder = useCallback(() => {
    setIsNewFolderOpen(true);
    closeContextMenu();
  }, [closeContextMenu]);

  const handleRename = useCallback(
    async (newName: string) => {
      if (!selectedNode || !directoryHandleRef.current) return;

      try {
        setIsLoading(true);
        if (selectedNode.type === 'file') {
          await renameFile(directoryHandleRef.current, selectedNode.path, newName);
          // Close the file if it was open
          const openedFile = openFiles.find((f) => f.path === selectedNode.path);
          if (openedFile) {
            closeFile(openedFile.id);
          }
        } else {
          await renameFolder(directoryHandleRef.current, selectedNode.path, newName);
        }
        await handleRefresh();
      } catch (error) {
        console.error('Failed to rename:', error);
        alert('Failed to rename. Please try again.');
      } finally {
        setIsLoading(false);
        setSelectedNode(null);
      }
    },
    [selectedNode, openFiles, closeFile, handleRefresh]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedNode || !directoryHandleRef.current) return;

    try {
      setIsLoading(true);
      await deleteEntry(
        directoryHandleRef.current,
        selectedNode.path,
        selectedNode.type === 'folder'
      );
      // Close the file if it was open
      if (selectedNode.type === 'file') {
        const openedFile = openFiles.find((f) => f.path === selectedNode.path);
        if (openedFile) {
          closeFile(openedFile.id);
        }
      }
      await handleRefresh();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedNode(null);
    }
  }, [selectedNode, openFiles, closeFile, handleRefresh]);

  const handleFileDrop = useCallback(
    async (targetFolder: FileNode, sourcePath: string, sourceType: 'file' | 'folder') => {
      if (!directoryHandleRef.current) return;

      // Check if dropping into same folder
      const sourceParentPath = sourcePath.split('/').slice(0, -1).join('/');
      if (sourceParentPath === targetFolder.path) {
        return; // Already in this folder
      }

      try {
        setIsLoading(true);
        if (sourceType === 'file') {
          // Close file if open before moving
          const openedFile = openFiles.find((f) => f.path === sourcePath);
          if (openedFile) {
            closeFile(openedFile.id);
          }
          await moveFile(directoryHandleRef.current, sourcePath, targetFolder.path);
        } else {
          await moveFolder(directoryHandleRef.current, sourcePath, targetFolder.path);
        }
        await handleRefresh();
      } catch (error) {
        console.error('Failed to move:', error);
        alert('Failed to move item. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [openFiles, closeFile, handleRefresh]
  );

  const handleSearchResultClick = useCallback(
    (filePath: string, _line?: number) => {
      const file = openFiles.find((f) => f.path === filePath);
      if (file) {
        setActiveTab(file.id);
      } else {
        const findNode = (nodes: FileNode[]): FileNode | null => {
          for (const node of nodes) {
            if (node.path === filePath) return node;
            if (node.children) {
              const found = findNode(node.children);
              if (found) return found;
            }
          }
          return null;
        };
        const node = findNode(fileTree);
        if (node) {
          handleFileOpen(node);
        }
      }
    },
    [openFiles, fileTree, setActiveTab, handleFileOpen]
  );

  const handleTabClick = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
    },
    [setActiveTab]
  );

  const handleTabClose = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab?.isDirty) {
        const confirmed = window.confirm('You have unsaved changes. Close anyway?');
        if (!confirmed) return;
      }
      closeFile(tabId);
    },
    [tabs, closeFile]
  );

  const handleContentChange = useCallback(
    (content: string) => {
      if (activeFileId) {
        updateFileContent(activeFileId, content);
      }
    },
    [activeFileId, updateFileContent]
  );

  const handleSave = useCallback(async () => {
    if (!activeFile || !directoryHandleRef.current) return;

    try {
      const markdownContent = htmlToMarkdown(activeFile.content);
      await writeFileContent(directoryHandleRef.current, activeFile.path, markdownContent);
      markFileSaved(activeFile.id);
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('Failed to save file. Please try again.');
    }
  }, [activeFile, markFileSaved]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            handleSave();
            break;
          case 'f':
            if (event.shiftKey) {
              event.preventDefault();
              setSearchOpen(true);
            }
            break;
          case ',':
            event.preventDefault();
            setIsSettingsOpen(true);
            break;
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, setSearchOpen]);

  useEffect(() => {
    if (!settings.autoSave || !activeFile?.isDirty) return;

    const timer = setTimeout(() => {
      handleSave();
    }, settings.autoSaveInterval);

    return () => clearTimeout(timer);
  }, [settings.autoSave, settings.autoSaveInterval, activeFile, handleSave]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h1 className="text-lg font-semibold">Markdown Editor</h1>
        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
          )}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Settings (Cmd/Ctrl+,)"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarVisible && (
          <Sidebar
            onOpenFolder={handleOpenFolder}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onRefresh={handleRefresh}
            onFileOpen={handleFileOpen}
            onContextMenu={handleContextMenu}
            onFileDrop={handleFileDrop}
          />
        )}

        <main className="flex flex-col flex-1 overflow-hidden">
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
          />

          <div className="flex-1 overflow-hidden">
            {activeFile ? (
              <Editor
                content={activeFile.content}
                onChange={handleContentChange}
                placeholder="Start writing your markdown..."
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">No file open</p>
                  <p className="text-sm">
                    {currentWorkspace
                      ? 'Select a file from the sidebar to start editing'
                      : 'Open a folder to get started'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Context Menu */}
      {contextMenu.isOpen && contextMenu.node && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          onRename={handleRenameClick}
          onDelete={handleDeleteClick}
          onNewFile={contextMenu.node.type === 'folder' ? handleNewFileInFolder : undefined}
          onNewFolder={contextMenu.node.type === 'folder' ? handleNewFolderInFolder : undefined}
          isFolder={contextMenu.node.type === 'folder'}
        />
      )}

      {/* Dialogs */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        documents={searchDocuments}
        onResultClick={handleSearchResultClick}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <NewFileDialog
        isOpen={isNewFileOpen}
        onClose={() => setIsNewFileOpen(false)}
        onConfirm={handleCreateFile}
        currentPath={currentWorkspace?.name}
      />

      <NewFolderDialog
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onConfirm={handleCreateFolder}
        currentPath={currentWorkspace?.name}
      />

      <RenameDialog
        isOpen={isRenameOpen}
        onClose={() => {
          setIsRenameOpen(false);
          setSelectedNode(null);
        }}
        onConfirm={handleRename}
        currentName={selectedNode?.name || ''}
        itemType={selectedNode?.type === 'folder' ? 'folder' : 'file'}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedNode(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedNode?.name || ''}
        itemType={selectedNode?.type === 'folder' ? 'folder' : 'file'}
      />
    </div>
  );
}

export default App;
