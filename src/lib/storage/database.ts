import Dexie, { type Table } from 'dexie';

export interface StoredWorkspace {
  id: string;
  name: string;
  handle: FileSystemDirectoryHandle;
  createdAt: Date;
  lastOpenedAt: Date;
}

export interface StoredSearchIndex {
  id: string;
  workspaceId: string;
  filePath: string;
  content: string;
  updatedAt: Date;
}

export class MarkdownEditorDB extends Dexie {
  workspaces!: Table<StoredWorkspace>;
  searchIndex!: Table<StoredSearchIndex>;

  constructor() {
    super('MarkdownEditorDB');
    this.version(1).stores({
      workspaces: 'id, name, lastOpenedAt',
      searchIndex: 'id, workspaceId, filePath',
    });
  }
}

export const db = new MarkdownEditorDB();

export async function saveWorkspace(workspace: StoredWorkspace): Promise<void> {
  await db.workspaces.put(workspace);
}

export async function getWorkspace(id: string): Promise<StoredWorkspace | undefined> {
  return db.workspaces.get(id);
}

export async function getAllWorkspaces(): Promise<StoredWorkspace[]> {
  return db.workspaces.orderBy('lastOpenedAt').reverse().toArray();
}

export async function deleteWorkspace(id: string): Promise<void> {
  await db.workspaces.delete(id);
  await db.searchIndex.where('workspaceId').equals(id).delete();
}

export async function updateWorkspaceLastOpened(id: string): Promise<void> {
  await db.workspaces.update(id, { lastOpenedAt: new Date() });
}

export async function saveSearchIndex(entries: StoredSearchIndex[]): Promise<void> {
  await db.searchIndex.bulkPut(entries);
}

export async function getSearchIndexForWorkspace(
  workspaceId: string
): Promise<StoredSearchIndex[]> {
  return db.searchIndex.where('workspaceId').equals(workspaceId).toArray();
}

export async function clearSearchIndexForWorkspace(workspaceId: string): Promise<void> {
  await db.searchIndex.where('workspaceId').equals(workspaceId).delete();
}
