/**
 * Workspace type - represents a folder containing markdown files
 */
export interface Workspace {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
  lastOpenedAt: Date;
}

/**
 * File/Folder node in the file tree
 */
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isExpanded?: boolean;
}

/**
 * Open file in editor
 */
export interface OpenFile {
  id: string;
  path: string;
  name: string;
  content: string; // HTML content for WYSIWYG editing
  originalMarkdown?: string; // Original markdown content
  isDirty: boolean;
  lastSaved: Date;
  cursorPosition?: number;
}

/**
 * Editor tab
 */
export interface Tab {
  id: string;
  fileId: string;
  name: string;
  path: string;
  isDirty: boolean;
}

/**
 * Application settings
 */
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  autoSave: boolean;
  autoSaveInterval: number;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
}

/**
 * Search result
 */
export interface SearchResult {
  fileId: string;
  filePath: string;
  fileName: string;
  matches: SearchMatch[];
}

/**
 * Individual search match
 */
export interface SearchMatch {
  line: number;
  column: number;
  text: string;
  context: string;
}

/**
 * Application state
 */
export interface AppState {
  // Workspace
  currentWorkspace: Workspace | null;
  recentWorkspaces: Workspace[];

  // Files
  fileTree: FileNode[];
  openFiles: OpenFile[];
  activeFileId: string | null;
  tabs: Tab[];
  activeTabId: string | null;

  // UI State
  sidebarVisible: boolean;
  sidebarWidth: number;

  // Settings
  settings: AppSettings;
}

/**
 * File System handle types
 */
export interface FileSystemHandlePermissionDescriptor {
  mode: 'read' | 'readwrite';
}

/**
 * Error types
 */
export type AppErrorType =
  | 'FILE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'INVALID_FILE'
  | 'SAVE_FAILED'
  | 'UNKNOWN';

export interface AppError {
  type: AppErrorType;
  message: string;
  details?: unknown;
}
