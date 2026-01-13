import Fuse from 'fuse.js';
import type { SearchResult, SearchMatch } from '../../types';

export interface SearchDocument {
  id: string;
  path: string;
  name: string;
  content: string;
}

export interface SearchOptions {
  threshold?: number;
  includeMatches?: boolean;
  minMatchCharLength?: number;
  limit?: number;
}

const DEFAULT_THRESHOLD = 0.3;
const DEFAULT_MIN_MATCH_LENGTH = 2;
const DEFAULT_LIMIT = 50;

export class SearchEngine {
  private fuse: Fuse<SearchDocument> | null = null;
  private documents: SearchDocument[] = [];

  constructor() {
    this.initializeFuse();
  }

  private initializeFuse(): void {
    this.fuse = new Fuse(this.documents, {
      keys: ['name', 'content'],
      threshold: DEFAULT_THRESHOLD,
      includeMatches: true,
      minMatchCharLength: DEFAULT_MIN_MATCH_LENGTH,
      ignoreLocation: true,
      findAllMatches: true,
    });
  }

  setDocuments(documents: SearchDocument[]): void {
    this.documents = documents;
    this.initializeFuse();
  }

  addDocument(document: SearchDocument): void {
    const existingIndex = this.documents.findIndex((d) => d.id === document.id);
    if (existingIndex >= 0) {
      this.documents[existingIndex] = document;
    } else {
      this.documents.push(document);
    }
    this.initializeFuse();
  }

  removeDocument(documentId: string): void {
    this.documents = this.documents.filter((d) => d.id !== documentId);
    this.initializeFuse();
  }

  search(query: string, options: SearchOptions = {}): SearchResult[] {
    if (!this.fuse || !query.trim()) {
      return [];
    }

    const limit = options.limit ?? DEFAULT_LIMIT;
    const results = this.fuse.search(query, { limit });

    return results.map((result) => {
      const matches: SearchMatch[] = [];

      if (result.matches) {
        result.matches.forEach((match) => {
          if (match.key === 'content' && match.indices) {
            const content = result.item.content;
            match.indices.forEach(([start, end]) => {
              const linesBefore = content.substring(0, start).split('\n');
              const line = linesBefore.length;
              const column = start - linesBefore.slice(0, -1).join('\n').length;

              const contextStart = Math.max(0, start - 30);
              const contextEnd = Math.min(content.length, end + 30);
              const context = content.substring(contextStart, contextEnd);

              matches.push({
                line,
                column: column > 0 ? column : 0,
                text: content.substring(start, end + 1),
                context: contextStart > 0 ? '...' + context : context,
              });
            });
          }
        });
      }

      return {
        fileId: result.item.id,
        filePath: result.item.path,
        fileName: result.item.name,
        matches: matches.slice(0, 10),
      };
    });
  }

  searchInFile(query: string, content: string): SearchMatch[] {
    if (!query.trim()) {
      return [];
    }

    const matches: SearchMatch[] = [];
    const lines = content.split('\n');
    const lowerQuery = query.toLowerCase();

    lines.forEach((line, lineIndex) => {
      const lowerLine = line.toLowerCase();
      let startIndex = 0;

      while (true) {
        const matchIndex = lowerLine.indexOf(lowerQuery, startIndex);
        if (matchIndex === -1) break;

        matches.push({
          line: lineIndex + 1,
          column: matchIndex + 1,
          text: line.substring(matchIndex, matchIndex + query.length),
          context: line,
        });

        startIndex = matchIndex + 1;
      }
    });

    return matches;
  }

  clear(): void {
    this.documents = [];
    this.initializeFuse();
  }
}

export const searchEngine = new SearchEngine();
