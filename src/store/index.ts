import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createFileSlice, type FileSlice } from './fileSlice';
import { createEditorSlice, type EditorSlice } from './editorSlice';
import { createSettingsSlice, type SettingsSlice } from './settingsSlice';

export type AppStore = FileSlice & EditorSlice & SettingsSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createFileSlice(...a),
      ...createEditorSlice(...a),
      ...createSettingsSlice(...a),
    }),
    {
      name: 'markdown-editor-storage',
      partialize: (state) => ({
        recentWorkspaces: state.recentWorkspaces,
        settings: state.settings,
        sidebarWidth: state.sidebarWidth,
        sidebarVisible: state.sidebarVisible,
      }),
    }
  )
);

export type { FileSlice, EditorSlice, SettingsSlice };
