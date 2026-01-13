import type { FileNode } from '../../types';

declare global {
  interface Window {
    showDirectoryPicker: (options?: {
      mode?: 'read' | 'readwrite';
      startIn?: 'desktop' | 'documents' | 'downloads';
    }) => Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker: (options?: {
      multiple?: boolean;
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker: (options?: {
      suggestedName?: string;
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<FileSystemFileHandle>;
  }
}

export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window;
}

export async function openDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    console.error('File System Access API is not supported');
    return null;
  }

  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    return handle;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return null;
    }
    throw error;
  }
}

export async function requestPermission(
  handle: FileSystemDirectoryHandle | FileSystemFileHandle,
  mode: 'read' | 'readwrite' = 'readwrite'
): Promise<boolean> {
  const options = { mode };
  const permission = await handle.queryPermission(options);

  if (permission === 'granted') {
    return true;
  }

  const requestResult = await handle.requestPermission(options);
  return requestResult === 'granted';
}

export async function readDirectoryRecursive(
  handle: FileSystemDirectoryHandle,
  basePath: string = ''
): Promise<FileNode[]> {
  const nodes: FileNode[] = [];
  const currentPath = basePath ? `${basePath}/${handle.name}` : handle.name;

  for await (const entry of handle.values()) {
    const entryPath = `${currentPath}/${entry.name}`;
    const id = entryPath.replace(/\//g, '-');

    if (entry.kind === 'directory') {
      const children = await readDirectoryRecursive(
        entry as FileSystemDirectoryHandle,
        currentPath
      );
      nodes.push({
        id,
        name: entry.name,
        path: entryPath,
        type: 'folder',
        children,
        isExpanded: false,
      });
    } else if (entry.name.endsWith('.md')) {
      nodes.push({
        id,
        name: entry.name,
        path: entryPath,
        type: 'file',
      });
    }
  }

  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export async function readFileContent(
  directoryHandle: FileSystemDirectoryHandle,
  filePath: string
): Promise<string> {
  const pathParts = filePath.split('/').filter(Boolean);
  const fileName = pathParts.pop();

  if (!fileName) {
    throw new Error('Invalid file path');
  }

  let currentHandle: FileSystemDirectoryHandle = directoryHandle;

  const directoryName = pathParts.shift();
  if (directoryName && directoryName !== directoryHandle.name) {
    throw new Error('Path does not start with workspace directory');
  }

  for (const part of pathParts) {
    currentHandle = await currentHandle.getDirectoryHandle(part);
  }

  const fileHandle = await currentHandle.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  return file.text();
}

export async function writeFileContent(
  directoryHandle: FileSystemDirectoryHandle,
  filePath: string,
  content: string
): Promise<void> {
  const pathParts = filePath.split('/').filter(Boolean);
  const fileName = pathParts.pop();

  if (!fileName) {
    throw new Error('Invalid file path');
  }

  let currentHandle: FileSystemDirectoryHandle = directoryHandle;

  const directoryName = pathParts.shift();
  if (directoryName && directoryName !== directoryHandle.name) {
    throw new Error('Path does not start with workspace directory');
  }

  for (const part of pathParts) {
    currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
  }

  const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function createNewFile(
  directoryHandle: FileSystemDirectoryHandle,
  filePath: string
): Promise<void> {
  await writeFileContent(directoryHandle, filePath, '');
}

export async function createNewFolder(
  directoryHandle: FileSystemDirectoryHandle,
  folderPath: string
): Promise<void> {
  const pathParts = folderPath.split('/').filter(Boolean);

  let currentHandle: FileSystemDirectoryHandle = directoryHandle;

  const directoryName = pathParts.shift();
  if (directoryName && directoryName !== directoryHandle.name) {
    throw new Error('Path does not start with workspace directory');
  }

  for (const part of pathParts) {
    currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
  }
}

export async function deleteEntry(
  directoryHandle: FileSystemDirectoryHandle,
  entryPath: string,
  isDirectory: boolean
): Promise<void> {
  const pathParts = entryPath.split('/').filter(Boolean);
  const entryName = pathParts.pop();

  if (!entryName) {
    throw new Error('Invalid path');
  }

  let currentHandle: FileSystemDirectoryHandle = directoryHandle;

  const directoryName = pathParts.shift();
  if (directoryName && directoryName !== directoryHandle.name) {
    throw new Error('Path does not start with workspace directory');
  }

  for (const part of pathParts) {
    currentHandle = await currentHandle.getDirectoryHandle(part);
  }

  await currentHandle.removeEntry(entryName, { recursive: isDirectory });
}

export async function renameFile(
  directoryHandle: FileSystemDirectoryHandle,
  oldPath: string,
  newName: string
): Promise<string> {
  // Read the old file content
  const content = await readFileContent(directoryHandle, oldPath);

  // Calculate new path
  const pathParts = oldPath.split('/');
  pathParts.pop();
  const newPath = [...pathParts, newName].join('/');

  // Create new file with content
  await writeFileContent(directoryHandle, newPath, content);

  // Delete old file
  await deleteEntry(directoryHandle, oldPath, false);

  return newPath;
}

export async function renameFolder(
  directoryHandle: FileSystemDirectoryHandle,
  oldPath: string,
  newName: string
): Promise<string> {
  const pathParts = oldPath.split('/').filter(Boolean);
  const oldName = pathParts.pop();

  if (!oldName) {
    throw new Error('Invalid path');
  }

  let parentHandle: FileSystemDirectoryHandle = directoryHandle;

  const directoryName = pathParts.shift();
  if (directoryName && directoryName !== directoryHandle.name) {
    throw new Error('Path does not start with workspace directory');
  }

  for (const part of pathParts) {
    parentHandle = await parentHandle.getDirectoryHandle(part);
  }

  // Get old directory handle
  const oldDirHandle = await parentHandle.getDirectoryHandle(oldName);

  // Create new directory
  const newDirHandle = await parentHandle.getDirectoryHandle(newName, { create: true });

  // Copy all contents recursively
  await copyDirectoryContents(oldDirHandle, newDirHandle);

  // Delete old directory
  await parentHandle.removeEntry(oldName, { recursive: true });

  // Return new path
  const newPath = [...pathParts, directoryHandle.name, newName].join('/');
  return newPath;
}

async function copyDirectoryContents(
  source: FileSystemDirectoryHandle,
  destination: FileSystemDirectoryHandle
): Promise<void> {
  for await (const entry of source.values()) {
    if (entry.kind === 'file') {
      const fileHandle = entry as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      const content = await file.text();

      const newFileHandle = await destination.getFileHandle(entry.name, { create: true });
      const writable = await newFileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    } else {
      const subDirHandle = entry as FileSystemDirectoryHandle;
      const newSubDirHandle = await destination.getDirectoryHandle(entry.name, { create: true });
      await copyDirectoryContents(subDirHandle, newSubDirHandle);
    }
  }
}

export async function moveFile(
  directoryHandle: FileSystemDirectoryHandle,
  sourcePath: string,
  destinationFolderPath: string
): Promise<string> {
  // Read the source file content
  const content = await readFileContent(directoryHandle, sourcePath);

  // Get source file name
  const fileName = sourcePath.split('/').pop();
  if (!fileName) {
    throw new Error('Invalid source path');
  }

  // Calculate new path
  const newPath = `${destinationFolderPath}/${fileName}`;

  // Create file in destination
  await writeFileContent(directoryHandle, newPath, content);

  // Delete source file
  await deleteEntry(directoryHandle, sourcePath, false);

  return newPath;
}

export async function moveFolder(
  directoryHandle: FileSystemDirectoryHandle,
  sourcePath: string,
  destinationFolderPath: string
): Promise<string> {
  const pathParts = sourcePath.split('/').filter(Boolean);
  const folderName = pathParts.pop();

  if (!folderName) {
    throw new Error('Invalid source path');
  }

  // Get source parent handle
  let sourceParentHandle: FileSystemDirectoryHandle = directoryHandle;
  const directoryName = pathParts.shift();
  if (directoryName && directoryName !== directoryHandle.name) {
    throw new Error('Path does not start with workspace directory');
  }
  for (const part of pathParts) {
    sourceParentHandle = await sourceParentHandle.getDirectoryHandle(part);
  }

  // Get source directory handle
  const sourceDirHandle = await sourceParentHandle.getDirectoryHandle(folderName);

  // Get destination parent handle
  const destParts = destinationFolderPath.split('/').filter(Boolean);
  let destParentHandle: FileSystemDirectoryHandle = directoryHandle;
  const destDirName = destParts.shift();
  if (destDirName && destDirName !== directoryHandle.name) {
    throw new Error('Destination path does not start with workspace directory');
  }
  for (const part of destParts) {
    destParentHandle = await destParentHandle.getDirectoryHandle(part);
  }

  // Create new directory in destination
  const newDirHandle = await destParentHandle.getDirectoryHandle(folderName, { create: true });

  // Copy all contents
  await copyDirectoryContents(sourceDirHandle, newDirHandle);

  // Delete source directory
  await sourceParentHandle.removeEntry(folderName, { recursive: true });

  // Return new path
  const newPath = `${destinationFolderPath}/${folderName}`;
  return newPath;
}
