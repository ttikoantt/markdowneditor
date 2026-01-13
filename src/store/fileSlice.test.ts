import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './index';

describe('fileSlice', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentWorkspace: null,
      recentWorkspaces: [],
      fileTree: [],
      openFiles: [],
      activeFileId: null,
      tabs: [],
      activeTabId: null,
    });
  });

  describe('setWorkspace', () => {
    it('should set the current workspace', () => {
      const workspace = {
        id: 'ws-1',
        name: 'Test Workspace',
        path: '/test',
        createdAt: new Date(),
        lastOpenedAt: new Date(),
      };

      useAppStore.getState().setWorkspace(workspace);

      expect(useAppStore.getState().currentWorkspace).toEqual(workspace);
    });

    it('should clear open files and tabs when setting new workspace', () => {
      useAppStore.setState({
        openFiles: [
          {
            id: 'file-1',
            path: '/test/file.md',
            name: 'file.md',
            content: 'test',
            isDirty: false,
            lastSaved: new Date(),
          },
        ],
        tabs: [
          { id: 'tab-1', fileId: 'file-1', name: 'file.md', path: '/test/file.md', isDirty: false },
        ],
      });

      useAppStore.getState().setWorkspace({
        id: 'ws-2',
        name: 'New Workspace',
        path: '/new',
        createdAt: new Date(),
        lastOpenedAt: new Date(),
      });

      expect(useAppStore.getState().openFiles).toHaveLength(0);
      expect(useAppStore.getState().tabs).toHaveLength(0);
    });
  });

  describe('openFile', () => {
    it('should add a file to openFiles and create a tab', () => {
      const file = {
        id: 'file-1',
        path: '/test/file.md',
        name: 'file.md',
        content: 'test content',
        isDirty: false,
        lastSaved: new Date(),
      };

      useAppStore.getState().openFile(file);

      expect(useAppStore.getState().openFiles).toHaveLength(1);
      expect(useAppStore.getState().tabs).toHaveLength(1);
      expect(useAppStore.getState().activeFileId).toBe('file-1');
      expect(useAppStore.getState().activeTabId).toBe('file-1');
    });

    it('should not duplicate file if already open', () => {
      const file = {
        id: 'file-1',
        path: '/test/file.md',
        name: 'file.md',
        content: 'test content',
        isDirty: false,
        lastSaved: new Date(),
      };

      useAppStore.getState().openFile(file);
      useAppStore.getState().openFile(file);

      expect(useAppStore.getState().openFiles).toHaveLength(1);
      expect(useAppStore.getState().tabs).toHaveLength(1);
    });
  });

  describe('closeFile', () => {
    it('should remove file and tab', () => {
      const file = {
        id: 'file-1',
        path: '/test/file.md',
        name: 'file.md',
        content: 'test',
        isDirty: false,
        lastSaved: new Date(),
      };

      useAppStore.getState().openFile(file);
      useAppStore.getState().closeFile('file-1');

      expect(useAppStore.getState().openFiles).toHaveLength(0);
      expect(useAppStore.getState().tabs).toHaveLength(0);
      expect(useAppStore.getState().activeFileId).toBeNull();
    });

    it('should switch to next tab when closing active file', () => {
      const file1 = {
        id: 'file-1',
        path: '/test/file1.md',
        name: 'file1.md',
        content: 'test1',
        isDirty: false,
        lastSaved: new Date(),
      };
      const file2 = {
        id: 'file-2',
        path: '/test/file2.md',
        name: 'file2.md',
        content: 'test2',
        isDirty: false,
        lastSaved: new Date(),
      };

      useAppStore.getState().openFile(file1);
      useAppStore.getState().openFile(file2);
      useAppStore.getState().closeFile('file-2');

      expect(useAppStore.getState().activeFileId).toBe('file-1');
    });
  });

  describe('updateFileContent', () => {
    it('should update file content and mark as dirty', () => {
      const file = {
        id: 'file-1',
        path: '/test/file.md',
        name: 'file.md',
        content: 'original',
        isDirty: false,
        lastSaved: new Date(),
      };

      useAppStore.getState().openFile(file);
      useAppStore.getState().updateFileContent('file-1', 'updated content');

      const updatedFile = useAppStore.getState().openFiles.find((f) => f.id === 'file-1');
      expect(updatedFile?.content).toBe('updated content');
      expect(updatedFile?.isDirty).toBe(true);
    });
  });

  describe('markFileSaved', () => {
    it('should mark file as not dirty', () => {
      const file = {
        id: 'file-1',
        path: '/test/file.md',
        name: 'file.md',
        content: 'test',
        isDirty: true,
        lastSaved: new Date(),
      };

      useAppStore.getState().openFile(file);
      useAppStore.getState().markFileSaved('file-1');

      const savedFile = useAppStore.getState().openFiles.find((f) => f.id === 'file-1');
      expect(savedFile?.isDirty).toBe(false);
    });
  });

  describe('toggleFolder', () => {
    it('should toggle folder expansion state', () => {
      useAppStore.setState({
        fileTree: [
          {
            id: 'folder-1',
            name: 'folder',
            path: '/folder',
            type: 'folder',
            isExpanded: false,
            children: [],
          },
        ],
      });

      useAppStore.getState().toggleFolder('folder-1');

      const folder = useAppStore.getState().fileTree[0];
      expect(folder?.isExpanded).toBe(true);
    });
  });
});
