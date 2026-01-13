import { useState, useCallback } from 'react';
import { Dialog } from './Dialog';

interface NewFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fileName: string) => void;
  currentPath?: string | undefined;
}

export function NewFileDialog({
  isOpen,
  onClose,
  onConfirm,
  currentPath = '',
}: NewFileDialogProps) {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedName = fileName.trim();

      if (!trimmedName) {
        setError('File name is required');
        return;
      }

      if (!/^[a-zA-Z0-9_\-.\s]+$/.test(trimmedName)) {
        setError('File name contains invalid characters');
        return;
      }

      const normalizedName = trimmedName.endsWith('.md')
        ? trimmedName
        : `${trimmedName}.md`;

      onConfirm(normalizedName);
      setFileName('');
      setError('');
      onClose();
    },
    [fileName, onConfirm, onClose]
  );

  const handleClose = useCallback(() => {
    setFileName('');
    setError('');
    onClose();
  }, [onClose]);

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="New File">
      <form onSubmit={handleSubmit} className="space-y-4">
        {currentPath && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Location: {currentPath}
          </p>
        )}

        <div>
          <label htmlFor="fileName" className="block text-sm mb-1">
            File Name
          </label>
          <input
            id="fileName"
            type="text"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              setError('');
            }}
            placeholder="example.md"
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
