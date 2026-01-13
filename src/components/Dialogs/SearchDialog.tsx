import { useState, useCallback, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';
import { Dialog } from './Dialog';
import { searchEngine, type SearchDocument } from '../../lib/search';
import type { SearchResult } from '../../types';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SearchDocument[];
  onResultClick: (filePath: string, line?: number) => void;
}

export function SearchDialog({
  isOpen,
  onClose,
  documents,
  onResultClick,
}: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (isOpen) {
      searchEngine.setDocuments(documents);
    }
  }, [isOpen, documents]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const searchResults = searchEngine.search(query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleResultClick = useCallback(
    (result: SearchResult, line?: number) => {
      onResultClick(result.filePath, line);
      onClose();
    },
    [onResultClick, onClose]
  );

  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    onClose();
  }, [onClose]);

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Search" className="max-w-2xl">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in files..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-auto">
          {results.length === 0 && query.length >= 2 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No results found
            </p>
          )}

          {results.map((result) => (
            <div
              key={result.fileId}
              className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => handleResultClick(result)}
                className="w-full flex items-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{result.fileName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {result.filePath}
                  </p>
                </div>
              </button>

              {result.matches.length > 0 && (
                <div className="pl-9 pb-2">
                  {result.matches.slice(0, 3).map((match, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleResultClick(result, match.line)}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <span className="text-gray-400 mr-2">Line {match.line}:</span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {match.context}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
