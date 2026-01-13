import { useCallback } from 'react';
import { Dialog } from './Dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: 'file' | 'folder';
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}: DeleteDialogProps) {
  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${itemType === 'file' ? 'File' : 'Folder'}`}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{itemName}</span>?
            </p>
            {itemType === 'folder' && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This will delete all files and subfolders inside it.
              </p>
            )}
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </Dialog>
  );
}
