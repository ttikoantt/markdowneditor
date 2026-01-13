import type { StateCreator } from 'zustand';

export interface EditorSlice {
  sidebarVisible: boolean;
  sidebarWidth: number;
  isSearchOpen: boolean;
  searchQuery: string;

  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const createEditorSlice: StateCreator<EditorSlice> = (set) => ({
  sidebarVisible: true,
  sidebarWidth: 256,
  isSearchOpen: false,
  searchQuery: '',

  toggleSidebar: () =>
    set((state) => ({
      sidebarVisible: !state.sidebarVisible,
    })),

  setSidebarWidth: (width) =>
    set({
      sidebarWidth: Math.max(180, Math.min(400, width)),
    }),

  setSearchOpen: (open) =>
    set({
      isSearchOpen: open,
      searchQuery: open ? '' : '',
    }),

  setSearchQuery: (query) =>
    set({
      searchQuery: query,
    }),
});
