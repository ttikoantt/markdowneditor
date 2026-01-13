import type { StateCreator } from 'zustand';
import type { FileNode, OpenFile, Tab, Workspace } from '../types';

export interface FileSlice {
  currentWorkspace: Workspace | null;
  recentWorkspaces: Workspace[];
  fileTree: FileNode[];
  openFiles: OpenFile[];
  activeFileId: string | null;
  tabs: Tab[];
  activeTabId: string | null;

  setWorkspace: (workspace: Workspace | null) => void;
  addRecentWorkspace: (workspace: Workspace) => void;
  setFileTree: (tree: FileNode[]) => void;
  toggleFolder: (nodeId: string) => void;

  openFile: (file: OpenFile) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string | null) => void;
  updateFileContent: (fileId: string, content: string) => void;
  markFileSaved: (fileId: string) => void;

  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string | null) => void;
  updateTabDirty: (tabId: string, isDirty: boolean) => void;
}

export const createFileSlice: StateCreator<FileSlice> = (set, get) => ({
  currentWorkspace: null,
  recentWorkspaces: [],
  fileTree: [],
  openFiles: [],
  activeFileId: null,
  tabs: [],
  activeTabId: null,

  setWorkspace: (workspace) =>
    set({
      currentWorkspace: workspace,
      fileTree: [],
      openFiles: [],
      activeFileId: null,
      tabs: [],
      activeTabId: null,
    }),

  addRecentWorkspace: (workspace) =>
    set((state) => {
      const filtered = state.recentWorkspaces.filter((w) => w.id !== workspace.id);
      return {
        recentWorkspaces: [workspace, ...filtered].slice(0, 10),
      };
    }),

  setFileTree: (tree) => set({ fileTree: tree }),

  toggleFolder: (nodeId) =>
    set((state) => ({
      fileTree: toggleFolderRecursive(state.fileTree, nodeId),
    })),

  openFile: (file) =>
    set((state) => {
      const existingFile = state.openFiles.find((f) => f.id === file.id);
      if (existingFile) {
        return { activeFileId: file.id, activeTabId: file.id };
      }

      const newTab: Tab = {
        id: file.id,
        fileId: file.id,
        name: file.name,
        path: file.path,
        isDirty: false,
      };

      return {
        openFiles: [...state.openFiles, file],
        tabs: [...state.tabs, newTab],
        activeFileId: file.id,
        activeTabId: file.id,
      };
    }),

  closeFile: (fileId) =>
    set((state) => {
      const newOpenFiles = state.openFiles.filter((f) => f.id !== fileId);
      const newTabs = state.tabs.filter((t) => t.fileId !== fileId);

      let newActiveFileId = state.activeFileId;
      let newActiveTabId = state.activeTabId;

      if (state.activeFileId === fileId) {
        const closedIndex = state.tabs.findIndex((t) => t.fileId === fileId);
        const nextTab = state.tabs[closedIndex + 1] || state.tabs[closedIndex - 1];
        newActiveFileId = nextTab?.fileId || null;
        newActiveTabId = nextTab?.id || null;
      }

      return {
        openFiles: newOpenFiles,
        tabs: newTabs,
        activeFileId: newActiveFileId,
        activeTabId: newActiveTabId,
      };
    }),

  setActiveFile: (fileId) =>
    set({
      activeFileId: fileId,
      activeTabId: fileId,
    }),

  updateFileContent: (fileId, content) =>
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.id === fileId ? { ...f, content, isDirty: true } : f
      ),
      tabs: state.tabs.map((t) => (t.fileId === fileId ? { ...t, isDirty: true } : t)),
    })),

  markFileSaved: (fileId) =>
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.id === fileId ? { ...f, isDirty: false, lastSaved: new Date() } : f
      ),
      tabs: state.tabs.map((t) => (t.fileId === fileId ? { ...t, isDirty: false } : t)),
    })),

  addTab: (tab) =>
    set((state) => ({
      tabs: [...state.tabs, tab],
    })),

  removeTab: (tabId) =>
    set((state) => ({
      tabs: state.tabs.filter((t) => t.id !== tabId),
    })),

  setActiveTab: (tabId) => {
    const state = get();
    const tab = state.tabs.find((t) => t.id === tabId);
    set({
      activeTabId: tabId,
      activeFileId: tab?.fileId || null,
    });
  },

  updateTabDirty: (tabId, isDirty) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, isDirty } : t)),
    })),
});

function toggleFolderRecursive(nodes: FileNode[], nodeId: string): FileNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    if (node.children) {
      return { ...node, children: toggleFolderRecursive(node.children, nodeId) };
    }
    return node;
  });
}
