import type { StateCreator } from 'zustand';
import type { AppSettings } from '../types';

const defaultSettings: AppSettings = {
  theme: 'auto',
  autoSave: true,
  autoSaveInterval: 30000,
  fontSize: 16,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  lineHeight: 1.6,
  tabSize: 2,
  wordWrap: true,
  showLineNumbers: false,
};

export interface SettingsSlice {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  settings: defaultSettings,

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  resetSettings: () =>
    set({
      settings: defaultSettings,
    }),
});
