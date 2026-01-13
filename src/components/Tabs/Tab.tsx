import { X } from 'lucide-react';
import type { Tab as TabType } from '../../types';

interface TabProps {
  tab: TabType;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
}

export function Tab({ tab, isActive, onClick, onClose }: TabProps) {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      role="tab"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-b-2 transition-colors ${
        isActive
          ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
          : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <span className="truncate max-w-[120px]">
        {tab.isDirty && <span className="text-orange-500 mr-1">*</span>}
        {tab.name}
      </span>
      <button
        type="button"
        onClick={handleClose}
        className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Close"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
