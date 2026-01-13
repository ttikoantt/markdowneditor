import { useEffect, useRef } from 'react';
import { Pencil, Trash2, FilePlus, FolderPlus } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRename?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  onNewFile?: (() => void) | undefined;
  onNewFolder?: (() => void) | undefined;
  isFolder?: boolean | undefined;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onRename,
  onDelete,
  onNewFile,
  onNewFolder,
  isFolder = false,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  const menuItems = [];

  if (isFolder) {
    if (onNewFile) {
      menuItems.push({
        icon: FilePlus,
        label: 'New File',
        onClick: onNewFile,
      });
    }
    if (onNewFolder) {
      menuItems.push({
        icon: FolderPlus,
        label: 'New Folder',
        onClick: onNewFolder,
      });
    }
  }

  if (onRename) {
    menuItems.push({
      icon: Pencil,
      label: 'Rename',
      onClick: onRename,
    });
  }

  if (onDelete) {
    menuItems.push({
      icon: Trash2,
      label: 'Delete',
      onClick: onDelete,
      danger: true,
    });
  }

  if (menuItems.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[150px]"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
            'danger' in item && item.danger
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
