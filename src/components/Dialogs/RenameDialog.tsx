import { useState, useCallback, useEffect } from 'react';
import { Dialog } from './Dialog';

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  currentName: string;
  itemType: 'file' | 'folder';
}

export function RenameDialog({
  isOpen,
  onClose,
  onConfirm,
  currentName,
  itemType,
}: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setError('');
    }
  }, [isOpen, currentName]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedName = newName.trim();

      if (!trimmedName) {
        setError('Name is required');
        return;
      }

      if (trimmedName === currentName) {
        onClose();
        return;
      }

      if (!/^[a-zA-Z0-9_\-.\s]+$/.test(trimmedName)) {
        setError('Name contains invalid characters');
        return;
      }

      // For files, ensure .md extension
      const finalName =
        itemType === 'file' && !trimmedName.endsWith('.md')
          ? `${trimmedName}.md`
          : trimmedName;

      onConfirm(finalName);
      onClose();
    },
    [newName, currentName, itemType, onConfirm, onClose]
  );

  const handleClose = useCallback(() => {
    setNewName(currentName);
    setError('');
    onClose();
  }, [currentName, onClose]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={`Rename ${itemType === 'file' ? 'File' : 'Folder'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newName" className="block text-sm mb-1">
            New Name
          </label>
          <input
            id="newName"
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError('');
            }}
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
            Rename
          </button>
        </div>
      </form>
    </Dialog>
  );
}
