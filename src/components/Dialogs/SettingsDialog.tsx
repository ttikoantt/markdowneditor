import { useCallback } from 'react';
import { Dialog } from './Dialog';
import { useAppStore } from '../../store';
import type { AppSettings } from '../../types';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { settings, updateSettings, resetSettings } = useAppStore();

  const handleChange = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      updateSettings({ [key]: value });
    },
    [updateSettings]
  );

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all settings to defaults?')) {
      resetSettings();
    }
  }, [resetSettings]);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Appearance
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) =>
                  handleChange('theme', e.target.value as 'light' | 'dark' | 'auto')
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              >
                <option value="auto">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Font Size</label>
              <input
                type="number"
                value={settings.fontSize}
                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                min={10}
                max={32}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Line Height</label>
              <input
                type="number"
                value={settings.lineHeight}
                onChange={(e) => handleChange('lineHeight', Number(e.target.value))}
                min={1}
                max={3}
                step={0.1}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Editor
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Tab Size</label>
              <select
                value={settings.tabSize}
                onChange={(e) => handleChange('tabSize', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Word Wrap</label>
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(e) => handleChange('wordWrap', e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Show Line Numbers</label>
              <input
                type="checkbox"
                checked={settings.showLineNumbers}
                onChange={(e) => handleChange('showLineNumbers', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Auto Save
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm">Enable Auto Save</label>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            {settings.autoSave && (
              <div>
                <label className="block text-sm mb-1">Interval (seconds)</label>
                <input
                  type="number"
                  value={settings.autoSaveInterval / 1000}
                  onChange={(e) =>
                    handleChange('autoSaveInterval', Number(e.target.value) * 1000)
                  }
                  min={5}
                  max={300}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
              </div>
            )}
          </div>
        </section>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </Dialog>
  );
}
