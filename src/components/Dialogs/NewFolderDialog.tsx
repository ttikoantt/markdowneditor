import { useState, useCallback } from 'react';
import { Dialog } from './Dialog';

interface NewFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (folderName: string) => void;
  currentPath?: string | undefined;
}

export function NewFolderDialog({
  isOpen,
  onClose,
  onConfirm,
  currentPath = '',
}: NewFolderDialogProps) {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedName = folderName.trim();

      if (!trimmedName) {
        setError('Folder name is required');
        return;
      }

      if (!/^[a-zA-Z0-9_\-.\s]+$/.test(trimmedName)) {
        setError('Folder name contains invalid characters');
        return;
      }

      onConfirm(trimmedName);
      setFolderName('');
      setError('');
      onClose();
    },
    [folderName, onConfirm, onClose]
  );

  const handleClose = useCallback(() => {
    setFolderName('');
    setError('');
    onClose();
  }, [onClose]);

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="New Folder">
      <form onSubmit={handleSubmit} className="space-y-4">
        {currentPath && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Location: {currentPath}
          </p>
        )}

        <div>
          <label htmlFor="folderName" className="block text-sm mb-1">
            Folder Name
          </label>
          <input
            id="folderName"
            type="text"
            value={folderName}
            onChange={(e) => {
              setFolderName(e.target.value);
              setError('');
            }}
            placeholder="my-folder"
            className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            } focus:outline-none focus:ring-2`}
            autoFocus
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </form>
    </Dialog>
  );
}
